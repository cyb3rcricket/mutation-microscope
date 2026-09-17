import { describe, it, expect } from 'vitest';
import variants from '../data/variants.json';
import { VariantData } from '../types/variant';

const COMPLEMENT_MAP: Record<string, string> = {
  A: 'T',
  T: 'A',
  C: 'G',
  G: 'C',
  N: 'N',
};

function complementSequence(seq: string): string {
  return seq
    .split('')
    .map((b) => COMPLEMENT_MAP[b] || b)
    .join('');
}

describe('Mutation Microscope Dataset Integrity', () => {
  const dataset = variants as unknown as VariantData[];

  it('contains exactly seven curated variants', () => {
    expect(dataset.length).toBe(7);
  });

  it('ensures all variants target GRCh38 assembly with positive coordinates', () => {
    dataset.forEach((v) => {
      expect(v.assembly).toBe('GRCh38');
      expect(v.chrom).toMatch(/^chr(2|5|7|11|16|21|[0-9]+|X|Y)$/);
      expect(v.pos).toBeGreaterThan(0);
      expect(Number.isInteger(v.pos)).toBe(true);

      const [chrom, posStr, alleles] = v.variant.split(':');
      const [ref, alt] = alleles.split('>');
      expect(v.chrom).toBe(chrom);
      expect(v.pos).toBe(parseInt(posStr, 10));
      expect(v.ref).toBe(ref);
      expect(v.alt).toBe(alt);
    });
  });

  it('verifies non-empty genes, categories, diseases, and consequence summaries', () => {
    dataset.forEach((v) => {
      expect(v.id).toBeTruthy();
      expect(v.gene).toBeTruthy();
      expect(v.category).toBeTruthy();
      expect(v.disease).toBeTruthy();
      expect(v.consequenceSummary.length).toBeGreaterThan(20);
      expect(v.clinicalRelevance.length).toBeGreaterThan(20);
      expect(v.evidenceSource.length).toBeGreaterThan(10);
    });
  });

  it('verifies exact flanking sequence and Watson-Crick complementation', () => {
    dataset.forEach((v) => {
      const flank = v.genomicRegion.flankingSequence;
      expect(flank).toBeDefined();
      expect(flank.refBase).toBe(v.ref);
      expect(flank.altBase).toBe(v.alt);

      expect(flank.complementRefBase).toBe(COMPLEMENT_MAP[v.ref]);
      expect(flank.complementAltBase).toBe(COMPLEMENT_MAP[v.alt]);

      expect(flank.complementUpstream).toBe(complementSequence(flank.upstream));
      expect(flank.complementDownstream).toBe(complementSequence(flank.downstream));

      expect(flank.upstream.length).toBeGreaterThanOrEqual(15);
      expect(flank.downstream.length).toBeGreaterThanOrEqual(15);
    });
  });

  it('strictly validates track array lengths and delta mathematics (alt - ref == delta)', () => {
    dataset.forEach((v) => {
      v.modalities.forEach((m) => {
        const { positions, refValues, altValues, deltaValues } = m.tracks;
        expect(positions.length).toBe(refValues.length);
        expect(positions.length).toBe(altValues.length);
        expect(positions.length).toBe(deltaValues.length);
        expect(positions.length).toBeGreaterThanOrEqual(3);

        for (let i = 0; i < positions.length; i++) {
          const expectedDelta = altValues[i] - refValues[i];
          const actualDelta = deltaValues[i];
          expect(Math.abs(expectedDelta - actualDelta)).toBeLessThanOrEqual(0.05);
        }
      });
    });
  });

  it('validates quantile scores are strictly in range [0, 1]', () => {
    dataset.forEach((v) => {
      v.modalities.forEach((m) => {
        expect(Math.abs(m.quantileScore)).toBeGreaterThanOrEqual(0.0);
        expect(Math.abs(m.quantileScore)).toBeLessThanOrEqual(1.0);
      });
      v.tissues.forEach((t) => {
        expect(Math.abs(t.quantileScore)).toBeGreaterThanOrEqual(0.0);
        expect(Math.abs(t.quantileScore)).toBeLessThanOrEqual(1.0);
      });
    });
  });

  it('strictly distinguishes Atlas AVI from calibrated Scorer Quantiles', () => {
    dataset.forEach((v) => {
      const avi = v.avi;
      expect(avi).toBeDefined();
      expect(avi.percentileRank).toBeGreaterThanOrEqual(0);
      expect(avi.percentileRank).toBeLessThanOrEqual(100);

      if (!avi.isAviAvailable) {
        expect(avi.compositeScore).toBeNull();
        expect(avi.statusText).toContain('Atlas AVI unavailable');
      } else {
        expect(typeof avi.compositeScore).toBe('number');
        expect(avi.provenance?.sourceType).toContain('Atlas');
      }
    });
  });

  const VALID_EVIDENCE_CLASSES = [
    'live_api',
    'atlas',
    'published_exact',
    'derived',
    'reconstructed',
    'illustrative',
  ];

  it('ensures comprehensive structured provenance with valid evidence classes exists on every variant and track', () => {
    dataset.forEach((v) => {
      expect(Array.isArray(v.provenance)).toBe(true);
      expect(v.provenance.length).toBeGreaterThanOrEqual(1);

      v.provenance.forEach((p) => {
        expect(VALID_EVIDENCE_CLASSES).toContain(p.evidenceClass);
      });

      if (v.avi.provenance) {
        expect(VALID_EVIDENCE_CLASSES).toContain(v.avi.provenance.evidenceClass);
      }

      v.modalities.forEach((m) => {
        const trackProv = m.tracks.provenance;
        expect(trackProv).toBeDefined();
        expect(VALID_EVIDENCE_CLASSES).toContain(trackProv?.evidenceClass);
        expect(typeof trackProv?.isIllustrative).toBe('boolean');
        expect(trackProv?.source).toBeTruthy();
        expect(trackProv?.transformation).toBeTruthy();

        if (trackProv?.isIllustrative) {
          expect(trackProv.evidenceClass).toBe('illustrative');
        }
      });
    });
  });

  it('verifies explicit labeling and evidence classes on illustrative negative control data', () => {
    const cftr = dataset.find((v) => v.gene === 'CFTR');
    expect(cftr).toBeDefined();
    cftr?.modalities.forEach((m) => {
      expect(m.tracks.provenance?.isIllustrative).toBe(true);
      expect(m.tracks.provenance?.evidenceClass).toBe('illustrative');
      expect(m.tracks.provenance?.notes).toContain('Illustrative visualization');
    });
  });

  it('validates Sashimi plot data and junction signals', () => {
    const splicingVariants = dataset.filter((v) => v.sashimi);
    expect(splicingVariants.length).toBeGreaterThanOrEqual(2);

    splicingVariants.forEach((v) => {
      const sashimi = v.sashimi!;
      expect(sashimi.exons.length).toBeGreaterThanOrEqual(2);
      expect(sashimi.junctions.length).toBeGreaterThanOrEqual(2);

      sashimi.junctions.forEach((j) => {
        const refSig = j.refSignal ?? j.refReads;
        const altSig = j.altSignal ?? j.altReads;
        expect(refSig).toBeGreaterThanOrEqual(0);
        expect(altSig).toBeGreaterThanOrEqual(0);
        expect(j.signalUnit).toBeTruthy();
      });
    });
  });

  it('validates In Silico Mutagenesis (ISM) matrix dimensions and provenance', () => {
    const ismVariants = dataset.filter((v) => v.ism);
    expect(ismVariants.length).toBeGreaterThanOrEqual(3);

    ismVariants.forEach((v) => {
      const ism = v.ism!;
      expect(ism.positions.length).toBe(ism.refBases.length);
      expect(ism.scores.A.length).toBe(ism.positions.length);
      expect(ism.scores.C.length).toBe(ism.positions.length);
      expect(ism.scores.G.length).toBe(ism.positions.length);
      expect(ism.scores.T.length).toBe(ism.positions.length);
      expect(ism.provenance).toBeDefined();
    });
  });

  it('validates dataset metadata.json generation properties and mixed mode support', async () => {
    const metadataModule = await import('../data/metadata.json');
    const metadata = metadataModule.default;
    expect(metadata).toBeDefined();
    expect(metadata.genomeAssembly).toBe('GRCh38');
    expect(metadata.variantCount).toBe(dataset.length);
    expect(metadata.generatedAt).toBeTruthy();
    expect(['verified_benchmark', 'live_api', 'mixed']).toContain(metadata.sourceMode);
    expect(metadata.alphaGenomeApiVersion).toContain('Avsec et al., Nature 2026');
    if ('liveVariantCount' in metadata) {
      expect(metadata.liveVariantCount).toBeGreaterThanOrEqual(0);
      expect(metadata.liveVariantCount).toBeLessThanOrEqual(dataset.length);
    }
  });

  it('verifies offline benchmark dataset has verified_benchmark sourceMode, zero live_api records, and hasLiveApiData === false', async () => {
    const metadataModule = await import('../data/metadata.json');
    const metadata = metadataModule.default;
    expect(metadata.sourceMode).toBe('verified_benchmark');
    if ('liveVariantCount' in metadata) {
      expect(metadata.liveVariantCount).toBe(0);
    }

    let liveApiRecordCount = 0;
    dataset.forEach((v) => {
      expect(v.hasLiveApiData).toBe(false);

      v.provenance?.forEach((p) => {
        if (p.evidenceClass === 'live_api') liveApiRecordCount++;
      });
      if (v.avi?.provenance?.evidenceClass === 'live_api') liveApiRecordCount++;

      v.modalities.forEach((m) => {
        if (m.provenance?.evidenceClass === 'live_api') liveApiRecordCount++;
        if (m.tracks?.provenance?.evidenceClass === 'live_api') liveApiRecordCount++;
      });

      v.tissues.forEach((t) => {
        if (t.provenance?.evidenceClass === 'live_api') liveApiRecordCount++;
      });

      if (v.sashimi?.provenance?.evidenceClass === 'live_api') liveApiRecordCount++;
      v.sashimi?.junctions.forEach((j) => {
        if (j.provenance?.evidenceClass === 'live_api') liveApiRecordCount++;
      });

      if (v.ism?.provenance?.evidenceClass === 'live_api') liveApiRecordCount++;

      v.alphaGenomeScores?.forEach((s) => {
        if (s.provenance?.evidenceClass === 'live_api') liveApiRecordCount++;
      });
    });

    expect(liveApiRecordCount).toBe(0);
  });

  it('enforces that continuous modality track provenance is never classified as live_api', () => {
    dataset.forEach((v) => {
      v.modalities.forEach((m) => {
        const trackProv = m.tracks.provenance;
        expect(trackProv?.evidenceClass).not.toBe('live_api');
      });
    });
  });

  it('ensures downsampled tracks document original point counts and transformations', () => {
    dataset.forEach((v) => {
      v.modalities.forEach((m) => {
        const prov = m.tracks.provenance;
        if (prov && !prov.isIllustrative) {
          expect(prov.transformation).toBeTruthy();
          if (prov.displayPointCount && prov.originalPointCount) {
            expect(prov.displayPointCount).toBeLessThanOrEqual(prov.originalPointCount);
          }
        }
      });
    });
  });
});
