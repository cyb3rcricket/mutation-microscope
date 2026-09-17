#!/usr/bin/env python3
"""
Mutation Microscope - Dataset Structural & Provenance Validation Script
======================================================================
Enforces structural and provenance validation rules on variants.json:
1. Assembly must be GRCh38 with valid chromosome and positive 1-based position.
2. REF and ALT alleles must be single valid DNA nucleotides and differ from each other.
3. Flanking sequence REF/ALT bases must strictly match the variant and have exact Watson-Crick complementation.
4. Track arrays (positions, refValues, altValues, deltaValues) must have equal lengths.
5. Track delta values must equal ALT - REF within tolerance (|delta - (alt - ref)| <= 0.05).
6. Scorer quantile scores must be within valid range [0, 1] and percentile rank in [0, 100].
7. AVI claims are validated: isAviAvailable can only be true if authentic Atlas AVI provenance is present.
8. Every provenance record must have a valid evidenceClass and required documentation metadata.
9. Synthetic or illustrative data must have explicit `isIllustrative: True` labeling.
10. Sashimi junctions and ISM matrices must satisfy structural integrity constraints.
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List

ROOT_DIR = Path(__file__).resolve().parent.parent
DATASET_PATH = ROOT_DIR / "src" / "data" / "variants.json"

COMPLEMENT = str.maketrans("ATCGN", "TAGCN")
VALID_BASES = {"A", "C", "G", "T"}
VALID_EVIDENCE_CLASSES = {
    "live_api",
    "atlas",
    "published_exact",
    "derived",
    "reconstructed",
    "illustrative",
}


def validate_provenance_record(prov: Any, context: str, errors: List[str]) -> None:
    if not isinstance(prov, dict):
        errors.append(f"{context}: Provenance record must be an object/dict, got {type(prov)}")
        return

    ev_class = prov.get("evidenceClass")
    if not ev_class:
        errors.append(f"{context}: Missing required 'evidenceClass'")
        return

    if ev_class not in VALID_EVIDENCE_CLASSES:
        errors.append(f"{context}: Invalid evidenceClass '{ev_class}'. Must be one of {sorted(VALID_EVIDENCE_CLASSES)}")
        return

    # Rule: live_api requires retrieval metadata (source, retrievedAt)
    if ev_class == "live_api":
        if not prov.get("source"):
            errors.append(f"{context}: 'live_api' requires non-empty 'source'")
        if not prov.get("retrievedAt"):
            errors.append(f"{context}: 'live_api' requires non-empty 'retrievedAt'")

    # Rule: derived / reconstructed require transformation documentation (transformation or notes)
    if ev_class in ("derived", "reconstructed"):
        if not prov.get("transformation") and not prov.get("notes"):
            errors.append(f"{context}: '{ev_class}' requires transformation documentation ('transformation' or 'notes')")

    # Rule: illustrative requires isIllustrative: True
    if ev_class == "illustrative":
        if prov.get("isIllustrative") is not True:
            errors.append(f"{context}: 'illustrative' record requires 'isIllustrative: True'")

    # Rule: Records with isIllustrative: True must have evidenceClass illustrative
    if prov.get("isIllustrative") is True:
        if ev_class != "illustrative":
            errors.append(f"{context}: Record with isIllustrative: True must have evidenceClass 'illustrative', got '{ev_class}'")


def collect_all_provenance_records(v: Dict[str, Any]) -> List[Any]:
    """Collects all provenance records attached to a variant along with location paths."""
    records = []

    # Top-level provenance
    for idx, p in enumerate(v.get("provenance", [])):
        if isinstance(p, dict):
            records.append((f"provenance[{idx}]", p))

    # AVI provenance
    avi_prov = v.get("avi", {}).get("provenance")
    if isinstance(avi_prov, dict):
        records.append(("avi.provenance", avi_prov))

    # Modalities & tracks
    for midx, m in enumerate(v.get("modalities", [])):
        mid = m.get("id", str(midx))
        if isinstance(m.get("provenance"), dict):
            records.append((f"modalities[{mid}].provenance", m["provenance"]))
        tprov = m.get("tracks", {}).get("provenance")
        if isinstance(tprov, dict):
            records.append((f"modalities[{mid}].tracks.provenance", tprov))

    # Tissues
    for tidx, t in enumerate(v.get("tissues", [])):
        tname = t.get("name", str(tidx))
        if isinstance(t.get("provenance"), dict):
            records.append((f"tissues[{tname}].provenance", t["provenance"]))

    # Sashimi
    sashimi = v.get("sashimi")
    if isinstance(sashimi, dict):
        if isinstance(sashimi.get("provenance"), dict):
            records.append(("sashimi.provenance", sashimi["provenance"]))
        for jidx, j in enumerate(sashimi.get("junctions", [])):
            jid = j.get("id", str(jidx))
            if isinstance(j.get("provenance"), dict):
                records.append((f"sashimi.junctions[{jid}].provenance", j["provenance"]))

    # ISM
    ism = v.get("ism")
    if isinstance(ism, dict) and isinstance(ism.get("provenance"), dict):
        records.append(("ism.provenance", ism["provenance"]))

    # alphaGenomeScores
    for sidx, s in enumerate(v.get("alphaGenomeScores", [])):
        if isinstance(s.get("provenance"), dict):
            records.append((f"alphaGenomeScores[{sidx}].provenance", s["provenance"]))

    return records


def validate_dataset(dataset_path: Path = DATASET_PATH) -> bool:
    print(f"Validating Mutation Microscope dataset: {dataset_path}")
    if not dataset_path.exists():
        print(f"FAIL: Dataset file not found at {dataset_path}", file=sys.stderr)
        return False

    with open(dataset_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Allow either a top-level array or an object with metadata + variants
    effective_metadata = None
    if isinstance(raw_data, dict):
        variants = raw_data.get("variants", [])
        metadata = raw_data.get("metadata", {})
        effective_metadata = metadata
        print(f"Top-level metadata detected: {metadata.get('sourceMode', 'unknown')} mode, assembly {metadata.get('genomeAssembly')}")
    elif isinstance(raw_data, list):
        variants = raw_data
        metadata = None
    else:
        print("FAIL: Dataset must be a JSON array or object containing 'variants' array.", file=sys.stderr)
        return False

    if len(variants) == 0:
        print("FAIL: Dataset contains 0 variants.", file=sys.stderr)
        return False

    errors: List[str] = []
    warnings: List[str] = []

    # Validate metadata.json if present
    metadata_file = dataset_path.parent / "metadata.json"
    if metadata_file.exists():
        try:
            with open(metadata_file, "r", encoding="utf-8") as mf:
                mdata = json.load(mf)
            if not mdata.get("generatedAt"):
                errors.append("[metadata.json] Missing 'generatedAt'")
            if mdata.get("genomeAssembly") != "GRCh38":
                errors.append(f"[metadata.json] Invalid assembly: {mdata.get('genomeAssembly')}")
            if mdata.get("sourceMode") not in ("live_api", "verified_benchmark", "mixed"):
                errors.append(f"[metadata.json] Invalid sourceMode: {mdata.get('sourceMode')}")
            if mdata.get("variantCount") != len(variants):
                errors.append(f"[metadata.json] variantCount {mdata.get('variantCount')} != len(variants) {len(variants)}")
            if "liveVariantCount" in mdata:
                lcount = mdata.get("liveVariantCount")
                if not isinstance(lcount, int) or lcount < 0 or lcount > len(variants):
                    errors.append(f"[metadata.json] Invalid liveVariantCount: {lcount}")
            if effective_metadata is None:
                effective_metadata = mdata
        except Exception as me:
            errors.append(f"[metadata.json] Failed to parse: {me}")

    for idx, v in enumerate(variants):
        vid = v.get("id", f"index_{idx}")
        var_str = v.get("variant", "")

        # 1. Variant ID & String
        if not var_str or ":" not in var_str or ">" not in var_str:
            errors.append(f"[{vid}] Malformed variant string: '{var_str}'. Expected 'chrN:pos:REF>ALT'")
            continue

        chrom, pos_str, ref_alt = var_str.split(":")
        ref, alt = ref_alt.split(">")

        # 2. Coordinates & Assembly
        if v.get("assembly") != "GRCh38":
            errors.append(f"[{vid}] Invalid assembly: '{v.get('assembly')}'. Must be 'GRCh38'.")

        if v.get("chrom") != chrom:
            errors.append(f"[{vid}] Chrom mismatch: chrom field '{v.get('chrom')}' != variant '{chrom}'")

        try:
            pos_int = int(pos_str)
            if v.get("pos") != pos_int or pos_int <= 0:
                errors.append(f"[{vid}] Pos mismatch: pos field {v.get('pos')} != variant {pos_int}")
        except ValueError:
            errors.append(f"[{vid}] Non-integer coordinate '{pos_str}'")

        # 3. Alleles
        if v.get("ref") != ref or v.get("alt") != alt:
            errors.append(f"[{vid}] Allele mismatch: ref/alt fields ({v.get('ref')}/{v.get('alt')}) != variant ({ref}/{alt})")

        if ref not in VALID_BASES or alt not in VALID_BASES:
            errors.append(f"[{vid}] Invalid base in variant alleles: REF={ref}, ALT={alt}")

        if ref == alt:
            errors.append(f"[{vid}] REF and ALT alleles cannot be identical: {ref} == {alt}")

        # 4. Flanking Sequence
        flank = v.get("genomicRegion", {}).get("flankingSequence")
        if not flank:
            errors.append(f"[{vid}] Missing genomicRegion.flankingSequence")
        else:
            if flank.get("refBase") != ref:
                errors.append(f"[{vid}] Flanking refBase '{flank.get('refBase')}' != REF '{ref}'")
            if flank.get("altBase") != alt:
                errors.append(f"[{vid}] Flanking altBase '{flank.get('altBase')}' != ALT '{alt}'")

            up = flank.get("upstream", "")
            down = flank.get("downstream", "")
            cup = flank.get("complementUpstream", "")
            cdown = flank.get("complementDownstream", "")
            cref = flank.get("complementRefBase", "")
            calt = flank.get("complementAltBase", "")

            if not up or not down:
                errors.append(f"[{vid}] Empty flanking upstream/downstream sequence")

            if cref != ref.translate(COMPLEMENT):
                errors.append(f"[{vid}] complementRefBase '{cref}' is not complement of REF '{ref}' ({ref.translate(COMPLEMENT)})")

            if calt != alt.translate(COMPLEMENT):
                errors.append(f"[{vid}] complementAltBase '{calt}' is not complement of ALT '{alt}' ({alt.translate(COMPLEMENT)})")

            if cup != up.translate(COMPLEMENT):
                errors.append(f"[{vid}] complementUpstream is not exact Watson-Crick complement of upstream")

            if cdown != down.translate(COMPLEMENT):
                errors.append(f"[{vid}] complementDownstream is not exact Watson-Crick complement of downstream")

        # 5. AVI / Quantile Distinction
        avi = v.get("avi")
        if not avi:
            errors.append(f"[{vid}] Missing 'avi' block")
        else:
            is_avi_avail = avi.get("isAviAvailable", False)
            pct = avi.get("percentileRank", -1)
            if not (0.0 <= pct <= 100.0):
                errors.append(f"[{vid}] AVI percentileRank {pct} outside valid bounds [0, 100]")

            if is_avi_avail:
                comp = avi.get("compositeScore")
                if comp is None:
                    errors.append(f"[{vid}] isAviAvailable is True but compositeScore is null")
                prov = avi.get("provenance", {})
                if not prov or "Atlas" not in prov.get("sourceType", ""):
                    errors.append(f"[{vid}] Labeled as available AVI without authentic Atlas AVI provenance")
            else:
                if avi.get("compositeScore") is not None:
                    errors.append(f"[{vid}] isAviAvailable is False but compositeScore is not null")

            if avi.get("provenance"):
                validate_provenance_record(avi["provenance"], f"[{vid}][avi provenance]", errors)

        # 6. Modalities & Track Consistency
        modalities = v.get("modalities", [])
        if not modalities:
            errors.append(f"[{vid}] No modalities provided")

        for m_idx, m in enumerate(modalities):
            mid = m.get("id", f"modality_{m_idx}")
            qscore = m.get("quantileScore")
            if qscore is None or not (0.0 <= abs(qscore) <= 1.0):
                errors.append(f"[{vid}][{mid}] Quantile score {qscore} outside valid range [0, 1]")

            if m.get("provenance"):
                validate_provenance_record(m["provenance"], f"[{vid}][{mid} provenance]", errors)

            tracks = m.get("tracks")
            if not tracks:
                errors.append(f"[{vid}][{mid}] Missing tracks data")
                continue

            pos_arr = tracks.get("positions", [])
            ref_arr = tracks.get("refValues", [])
            alt_arr = tracks.get("altValues", [])
            delta_arr = tracks.get("deltaValues", [])

            if not (len(pos_arr) == len(ref_arr) == len(alt_arr) == len(delta_arr)):
                errors.append(f"[{vid}][{mid}] Track array length mismatch: pos={len(pos_arr)}, ref={len(ref_arr)}, alt={len(alt_arr)}, delta={len(delta_arr)}")
                continue

            if len(pos_arr) < 3:
                errors.append(f"[{vid}][{mid}] Track has too few data points ({len(pos_arr)})")

            for p_idx in range(len(pos_arr)):
                diff = alt_arr[p_idx] - ref_arr[p_idx]
                delta = delta_arr[p_idx]
                if abs(diff - delta) > 0.05:
                    errors.append(f"[{vid}][{mid}] Delta calculation mismatch at index {p_idx} (pos {pos_arr[p_idx]}): ALT-REF={diff:.3f}, delta={delta:.3f}")

            # Track Provenance check
            tprov = tracks.get("provenance")
            if not tprov:
                errors.append(f"[{vid}][{mid}] Missing track provenance metadata")
            else:
                if "isIllustrative" not in tprov:
                    errors.append(f"[{vid}][{mid}] Track provenance missing 'isIllustrative' flag")
                if tprov.get("evidenceClass") == "live_api":
                    errors.append(f"[{vid}][{mid}] Modality tracks must never be classified as 'live_api' (continuous tracks remain curated benchmark data)")
                validate_provenance_record(tprov, f"[{vid}][{mid} track provenance]", errors)

        # 7. Tissues Consistency
        for t_idx, t in enumerate(v.get("tissues", [])):
            if t.get("provenance"):
                validate_provenance_record(t["provenance"], f"[{vid}][tissue {t.get('name', t_idx)} provenance]", errors)

        # 8. Sashimi Consistency
        sashimi = v.get("sashimi")
        if sashimi:
            exons = sashimi.get("exons", [])
            junctions = sashimi.get("junctions", [])
            if not exons or not junctions:
                errors.append(f"[{vid}][sashimi] Incomplete sashimi data (exons={len(exons)}, junctions={len(junctions)})")

            if sashimi.get("provenance"):
                validate_provenance_record(sashimi["provenance"], f"[{vid}][sashimi provenance]", errors)

            for j_idx, j in enumerate(junctions):
                ref_sig = j.get("refSignal") if j.get("refSignal") is not None else j.get("refReads")
                alt_sig = j.get("altSignal") if j.get("altSignal") is not None else j.get("altReads")
                if ref_sig is None or ref_sig < 0 or alt_sig is None or alt_sig < 0:
                    errors.append(f"[{vid}][sashimi] Negative or missing junction signal for junction {j.get('id')}")
                if j.get("provenance"):
                    validate_provenance_record(j["provenance"], f"[{vid}][sashimi junction {j.get('id', j_idx)} provenance]", errors)

        # 9. ISM Matrix Consistency
        ism = v.get("ism")
        if ism:
            ism_pos = ism.get("positions", [])
            ism_ref = ism.get("refBases", [])
            ism_scores = ism.get("scores", {})
            if len(ism_pos) != len(ism_ref):
                errors.append(f"[{vid}][ism] ISM positions length {len(ism_pos)} != refBases length {len(ism_ref)}")

            for b in ("A", "C", "G", "T"):
                b_scores = ism_scores.get(b, [])
                if len(b_scores) != len(ism_pos):
                    errors.append(f"[{vid}][ism] ISM scores['{b}'] length {len(b_scores)} != positions length {len(ism_pos)}")

            ism_prov = ism.get("provenance")
            if not ism_prov:
                warnings.append(f"[{vid}][ism] Missing explicit ISM provenance record")
            else:
                validate_provenance_record(ism_prov, f"[{vid}][ism provenance]", errors)

        # 10. Top-Level Provenance Records
        prov_list = v.get("provenance", [])
        if not prov_list or len(prov_list) == 0:
            errors.append(f"[{vid}] Missing top-level provenance list")
        else:
            for p_idx, p in enumerate(prov_list):
                validate_provenance_record(p, f"[{vid}][top-level provenance #{p_idx} ({p.get('field', 'unspecified')})]", errors)

        # 11. Live Scores (if present)
        for s_idx, s in enumerate(v.get("alphaGenomeScores", [])):
            if s.get("provenance"):
                validate_provenance_record(s["provenance"], f"[{vid}][alphaGenomeScore #{s_idx} provenance]", errors)

        # 12. Check hasLiveApiData consistency for this variant
        has_live = v.get("hasLiveApiData", False)
        if not isinstance(has_live, bool):
            errors.append(f"[{vid}] 'hasLiveApiData' must be a boolean, got {type(has_live)}")

        variant_records = collect_all_provenance_records(v)
        if has_live:
            # Must have live_api evidence in alphaGenomeScores
            scores = v.get("alphaGenomeScores", [])
            has_live_scores = any(
                isinstance(s, dict)
                and isinstance(s.get("provenance"), dict)
                and s["provenance"].get("evidenceClass") == "live_api"
                for s in scores
            )
            if not has_live_scores:
                errors.append(f"[{vid}] hasLiveApiData is True, but alphaGenomeScores does not contain valid 'live_api' provenance records")
        else:
            # No live_api provenance allowed anywhere on this variant
            for loc, prov in variant_records:
                if prov.get("evidenceClass") == "live_api":
                    errors.append(f"[{vid}] hasLiveApiData is False/absent, but found 'live_api' provenance at {loc}")

    # Dataset-level provenance consistency rules
    dataset_live_api_records = 0
    dataset_benchmark_records = 0
    dataset_live_variants = 0
    benchmark_classes = {"published_exact", "reconstructed", "derived", "illustrative"}

    for v in variants:
        if v.get("hasLiveApiData") is True:
            dataset_live_variants += 1
        for _, prov in collect_all_provenance_records(v):
            ev = prov.get("evidenceClass")
            if ev == "live_api":
                dataset_live_api_records += 1
            elif ev in benchmark_classes:
                dataset_benchmark_records += 1

    if effective_metadata and "sourceMode" in effective_metadata:
        sm = effective_metadata["sourceMode"]
        if sm == "verified_benchmark":
            if dataset_live_api_records > 0:
                errors.append(f"sourceMode is 'verified_benchmark', but found {dataset_live_api_records} 'live_api' provenance record(s)")
            if dataset_live_variants > 0:
                errors.append(f"sourceMode is 'verified_benchmark', but found {dataset_live_variants} variant(s) with hasLiveApiData=True")
            if "liveVariantCount" in effective_metadata and effective_metadata["liveVariantCount"] != 0:
                errors.append(f"sourceMode is 'verified_benchmark', but liveVariantCount is {effective_metadata['liveVariantCount']} (expected 0)")
        elif sm == "mixed":
            if dataset_live_api_records == 0:
                errors.append("sourceMode is 'mixed', but found 0 'live_api' records across dataset")
            if dataset_benchmark_records == 0:
                errors.append("sourceMode is 'mixed', but found 0 benchmark provenance records across dataset")
            if dataset_live_variants == 0:
                errors.append("sourceMode is 'mixed', but 0 variants have hasLiveApiData=True")
            if "liveVariantCount" in effective_metadata and effective_metadata["liveVariantCount"] != dataset_live_variants:
                errors.append(f"sourceMode is 'mixed', but liveVariantCount ({effective_metadata['liveVariantCount']}) != count of hasLiveApiData variants ({dataset_live_variants})")
        elif sm == "live_api":
            if dataset_live_api_records == 0:
                errors.append("sourceMode is 'live_api', but found 0 'live_api' records across dataset")

    print("\n" + "=" * 70)
    print("VALIDATION REPORT:")
    print("=" * 70)
    print(f"Total Variants Inspected: {len(variants)}")
    print(f"Errors Found:             {len(errors)}")
    print(f"Warnings Found:           {len(warnings)}")
    print("=" * 70)

    if warnings:
        print("\nWarnings:")
        for w in warnings:
            print(f"  [WARN] {w}")

    if errors:
        print("\nErrors:")
        for e in errors:
            print(f"  [FAIL] {e}")
        print("\nDATASET VALIDATION FAILED!")
        return False

    print("\n" + "=" * 70)
    print("DATASET STRUCTURAL & PROVENANCE METADATA VALIDATION PASSED")
    print("=" * 70)
    print("Notice: Structural integrity, coordinates, and provenance metadata have been validated.")
    print("External scientific claims and in silico predictions are not independently verified.")
    return True


if __name__ == "__main__":
    success = validate_dataset()
    sys.exit(0 if success else 1)
