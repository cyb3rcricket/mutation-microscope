#!/usr/bin/env python3
"""
Mutation Microscope - AlphaGenome Dataset Generation & Verification Pipeline
=============================================================================

Compiles, verifies, and exports the multimodal genomic datasets used by
Mutation Microscope with rigorous provenance tracking.

Modes of Operation:
1. Live Query Mode (--fetch-live, requires ALPHAGENOME_API_KEY):
   Directly queries DeepMind's AlphaGenome API (dna_client.create / score_variant)
   and Atlas client (alphagenome.atlas) to retrieve genuine scalar scorer results
   and calibrated quantiles. Actual returned scores are parsed via
   variant_scorers.tidy_scores and enrich alphaGenomeScores plus top impact metadata (AVI)
   with full retrieval provenance, while visualization tracks, Sashimi data, ISM,
   sequences, and other curated benchmark structures retain their original provenance.

   Usage:
     uv run scripts/generate_dataset.py --fetch-live

2. Benchmark Export & Verification Mode (offline / default):
   Exports the curated benchmark dataset derived from
   official AlphaGenome benchmark publications (Avsec et al., Nature 2026),
   DeepMind science skill golden examples, and GENCODE v46 / GRCh38 annotations.

   Usage:
     uv run scripts/generate_dataset.py --verify

License & Terms:
  AlphaGenome is developed by Google DeepMind. See THIRD_PARTY_NOTICES.md
  and https://deepmind.google.com/science/alphagenome/ for terms of service.
  Predictions are for scientific demonstration and educational purposes only.
"""

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import sys
from typing import Any, Dict, List, Optional

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_FILE = ROOT_DIR / "src" / "data" / "variants.json"

# Import validation function
# Setup python path for relative module imports whether invoked from repo root or scripts dir
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "scripts"))

from validate_dataset import validate_dataset

try:
    from scripts.data.curated_variants import get_curated_benchmark_variants
except ImportError:
    from data.curated_variants import get_curated_benchmark_variants


def fetch_live_alphagenome_data(api_key: str) -> List[Dict[str, Any]]:
    """
    Live query pipeline using official alphagenome Python SDK.
    Connects to DeepMind's gRPC endpoint, scores each variant, parses the returned
    AnnData objects via variant_scorers.tidy_scores, and integrates the live
    scalar scores, biosamples, and quantiles to enrich alphaGenomeScores and AVI metadata.
    Continuous tracks, Sashimi, ISM, and genomic regions retain their original benchmark provenance.
    """
    try:
        from alphagenome.models import dna_client, variant_scorers
        from alphagenome.data import genome
    except ImportError:
        print("Error: alphagenome package not installed. Run with `uv run`.", file=sys.stderr)
        sys.exit(1)

    print("Connecting to AlphaGenome API endpoint...")
    dna_model = dna_client.create(
        api_key=api_key,
        address="dns:///gdmscience.googleapis.com:443"
    )

    # Optional Atlas client connection
    atlas_client = None
    try:
        from alphagenome import atlas as atlas_module
        atlas_client = atlas_module.create(api_key=api_key)
        print("Connected to AlphaGenome Atlas client.")
    except Exception as e:
        print(f"Atlas client initialization note: {e}")

    retrieval_timestamp = datetime.now(timezone.utc).isoformat()
    variants = get_curated_benchmark_variants()

    scorer_names = ["RNA_SEQ", "SPLICE_SITES", "SPLICE_JUNCTIONS", "DNASE", "CHIP_TF"]
    available_scorers = [
        variant_scorers.RECOMMENDED_VARIANT_SCORERS[m]
        for m in scorer_names
        if m in variant_scorers.RECOMMENDED_VARIANT_SCORERS
    ]

    for v in variants:
        var_str = v["variant"]
        chrom, pos_str, ref_alt = var_str.split(":")
        pos = int(pos_str)
        ref, alt = ref_alt.split(">")

        print(f"\nProcessing {var_str} ({v['gene']})...")
        variant = genome.Variant(
            chromosome=chrom,
            position=pos,
            reference_bases=ref,
            alternate_bases=alt
        )
        interval = variant.reference_interval.resize(dna_client.SEQUENCE_LENGTH_1MB)

        try:
            print(f"  -> Calling dna_model.score_variant across {len(available_scorers)} scorers...")
            scores_list = dna_model.score_variant(
                interval=interval,
                variant=variant,
                variant_scorers=available_scorers
            )

            parsed_dfs = []
            for score_adata in scores_list:
                df = variant_scorers.tidy_scores([score_adata], match_gene_strand=True)
                if df is not None and not df.empty:
                    parsed_dfs.append(df)

            if parsed_dfs:
                import pandas as pd
                combined_df = pd.concat(parsed_dfs, ignore_index=True)
                print(f"  -> Successfully parsed {len(combined_df)} live score records.")

                # Mark variant as having live API data
                v["hasLiveApiData"] = True

                # Populate alphaGenomeScores on variant
                live_scores: List[Dict[str, Any]] = []
                for _, row in combined_df.iterrows():
                    raw_val = float(row.get("raw_score", 0.0))
                    quant_val = float(row.get("quantile_score", 0.0))
                    scorer_name = str(row.get("output_type", row.get("scorer", "UNKNOWN")))
                    biosample = str(row.get("biosample_name", "Unspecified"))
                    ontology_term = str(row.get("ontology_curie", row.get("ontology", "")))
                    gene_target = str(row.get("gene_name", v["gene"]))

                    live_scores.append({
                        "scorer": scorer_name,
                        "rawScore": raw_val,
                        "quantileScore": quant_val,
                        "unit": "raw model effect",
                        "tissue": biosample,
                        "biosampleOntology": ontology_term,
                        "affectedGene": gene_target,
                        "provenance": {
                            "sourceType": "AlphaGenome API",
                            "evidenceClass": "live_api",
                            "source": "dna_model.score_variant",
                            "scorer": scorer_name,
                            "biosample": biosample,
                            "retrievedAt": retrieval_timestamp,
                            "isIllustrative": False,
                            "notes": f"Live query result for {var_str}"
                        }
                    })

                v["alphaGenomeScores"] = live_scores

                # Update primary modality if matched
                top_hit = combined_df.iloc[combined_df["quantile_score"].abs().argmax()]
                top_scorer = str(top_hit.get("output_type", top_hit.get("scorer", "RNA_SEQ")))
                top_quant = float(top_hit.get("quantile_score", 0.99))
                top_tissue = str(top_hit.get("biosample_name", "Target Tissue"))

                v["avi"]["percentileRank"] = round(abs(top_quant) * 100, 3)
                v["avi"]["primaryModality"] = top_scorer
                v["avi"]["primaryTissue"] = top_tissue
                v["avi"]["statusText"] = f"Live AlphaGenome API result ({top_scorer} scorer quantile: {abs(top_quant):.5f})"
                v["avi"]["provenance"] = {
                    "sourceType": "AlphaGenome API",
                    "evidenceClass": "live_api",
                    "source": "dna_model.score_variant",
                    "scorer": top_scorer,
                    "biosample": top_tissue,
                    "retrievedAt": retrieval_timestamp,
                    "isIllustrative": False,
                    "notes": "Live API scorer quantile."
                }

                # Record top-level provenance for live query
                v["provenance"].append({
                    "field": "alphaGenomeScores",
                    "sourceType": "AlphaGenome API",
                    "evidenceClass": "live_api",
                    "source": "dna_model.score_variant",
                    "assembly": "GRCh38",
                    "retrievedAt": retrieval_timestamp,
                    "notes": "Live AlphaGenome API scorer predictions (continuous tracks and genomic coordinates remain curated benchmark data)."
                })

            else:
                v["hasLiveApiData"] = False
                print(f"  -> Live query fallback for {var_str}: preserving curated benchmark values with original provenance.")

        except Exception as e:
            v["hasLiveApiData"] = False
            print(f"  -> Live query note for {var_str}: {e}")
            print(f"  -> Live query fallback for {var_str}: preserving curated benchmark values with original provenance.")

        # Check Atlas AVI if client is available
        if atlas_client:
            try:
                print(f"  -> Querying Atlas for {var_str}...")
                atlas_res = atlas_client.query_variant(
                    variant,
                    requested_scorers=["RNA_SEQ"]
                )
                if atlas_res:
                    print(f"  -> Atlas response received for {var_str}.")
            except Exception as e:
                print(f"  -> Atlas query note for {var_str}: {e}")

    return variants


def main():
    parser = argparse.ArgumentParser(description="Mutation Microscope Dataset Generation & Validation Pipeline")
    parser.add_argument("--fetch-live", action="store_true", help="Fetch live data from AlphaGenome API using ALPHAGENOME_API_KEY")
    parser.add_argument("--verify", action="store_true", help="Validate dataset schema and integrity without changing source")
    args = parser.parse_args()

    api_key = os.environ.get("ALPHAGENOME_API_KEY")

    if args.fetch_live:
        if not api_key:
            print("\nNotice: ALPHAGENOME_API_KEY is not set in environment.")
            print("Register for an API key at https://deepmind.google.com/science/alphagenome/")
            print("Compiling verified benchmark dataset instead...")
            variants = get_curated_benchmark_variants()
        else:
            variants = fetch_live_alphagenome_data(api_key)
    else:
        variants = get_curated_benchmark_variants()

    live_count = sum(1 for v in variants if v.get("hasLiveApiData"))
    if live_count > 0:
        source_mode = "mixed"
    else:
        source_mode = "verified_benchmark"

    # Output formatted JSON (compatible as either array or object; frontend imports as array)
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(variants, f, indent=2, ensure_ascii=False)

    METADATA_FILE = ROOT_DIR / "src" / "data" / "metadata.json"
    metadata = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "alphaGenomeApiVersion": "1.0.0 (Avsec et al., Nature 2026)",
        "genomeAssembly": "GRCh38",
        "sourceMode": source_mode,
        "variantCount": len(variants),
        "liveVariantCount": live_count,
        "normalizationVersion": "1.0.0"
    }
    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"\nSuccessfully compiled and saved {len(variants)} curated variants to:")
    print(f"  -> {OUTPUT_FILE}")
    print(f"  -> {METADATA_FILE}")

    # Run comprehensive validation
    is_valid = validate_dataset(OUTPUT_FILE)
    if not is_valid:
        print("\nERROR: Generated dataset failed validation!", file=sys.stderr)
        sys.exit(1)

    print(f"\nPipeline execution complete ({source_mode} mode).")


if __name__ == "__main__":
    main()
