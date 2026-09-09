import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import rawVariants from '../data/variants.json';
import { VariantData } from '../types/variant';
import { App } from '../App';
import { Header } from '../components/Header';
import { MolecularImpactPanel } from '../components/MolecularImpactPanel';
import { GenomeZoomMicroscope } from '../components/GenomeZoomMicroscope';
import { RefAltTrackViewer } from '../components/RefAltTrackViewer';
import { ISMExplorer } from '../components/ISMExplorer';
import { TissueExplorer } from '../components/TissueExplorer';
import { TransparencyModal } from '../components/TransparencyModal';
import { DataProvenanceModal } from '../components/DataProvenanceModal';

const variants = rawVariants as unknown as VariantData[];

describe('Component Rendering & Scientific UI Verification', () => {
  it('renders the complete App dashboard without errors', () => {
    const html = renderToString(<App />);
    expect(html).toContain('Mutation Microscope');
    expect(html).toContain('GRCh38');
    expect(html).toContain('Data Provenance');
    expect(html).toContain('How It Works');
    expect(html).toContain('AlphaGenome');
  });

  it('verifies Header contains navigation and provenance trigger', () => {
    const html = renderToString(
      <Header
        currentVariant={variants[0]}
        onOpenTransparencyModal={() => {}}
        onOpenProvenanceModal={() => {}}
      />
    );
    expect(html).toContain('Data Provenance');
    expect(html).toContain('How It Works');
    expect(html).toContain('AlphaGenome Atlas');
    expect(html).toContain('GRCh38');
  });

  it('verifies all 7 variants render cleanly in MolecularImpactPanel with honest AVI / Scorer labels', () => {
    variants.forEach((v) => {
      const html = renderToString(<MolecularImpactPanel variant={v} />);
      expect(html).toContain(v.avi.impactTier);
      expect(html).toContain(v.avi.primaryModality);

      if (v.avi.isAviAvailable) {
        expect(html).toContain('AlphaGenome Variant Impact (AVI)');
      } else {
        expect(html).toContain('AlphaGenome Predicted Molecular Impact');
        expect(html).toContain('Top Scorer Quantile');
      }
    });
  });

  it('renders GenomeZoomMicroscope across all 7 variants with exact flanking sequences', () => {
    variants.forEach((v) => {
      const html = renderToString(
        <GenomeZoomMicroscope
          variant={v}
          alleleState="ALT"
          onToggleAllele={() => {}}
        />
      );
      expect(html).toContain(v.variant.replace('>', '&gt;'));
      expect(html).toContain(v.chrom);
      expect(html).toContain(v.genomicRegion.flankingSequence.refBase);
      expect(html).toContain(v.genomicRegion.flankingSequence.altBase);
    });
  });

  it('renders RefAltTrackViewer with verified or illustrative track badges', () => {
    variants.forEach((v) => {
      v.modalities.forEach((m) => {
        const html = renderToString(
          <RefAltTrackViewer
            variant={v}
            activeModality={m}
            currentAllele="ALT"
            onToggleAllele={() => {}}
          />
        );
        const escapedName = m.name.replace(/'/g, '&#x27;').replace(/>/g, '&gt;');
        expect(html).toContain(escapedName);
        if (m.tracks.provenance?.isIllustrative) {
          expect(html).toContain('Illustrative Track');
        } else if (m.tracks.provenance) {
          expect(html).toContain('Verified Track');
          if (!v.sashimi) {
            expect(html).toContain('Track Source:');
          }
        }
      });
    });
  });

  it('verifies Sashimi plot displays predicted splice junction signals rather than raw reads', () => {
    const splicingVariants = variants.filter((v) => v.sashimi);
    splicingVariants.forEach((v) => {
      const html = renderToString(
        <RefAltTrackViewer
          variant={v}
          activeModality={v.modalities[0]}
          currentAllele="ALT"
          onToggleAllele={() => {}}
        />
      );
      expect(html).toContain('Predicted Splice Junction Quantification');
      expect(html).toContain('predicted splice junction signals');
      expect(html).not.toContain('reads (ALT)');
    });
  });

  it('renders ISMExplorer for all variants with ISM data', () => {
    const ismVariants = variants.filter((v) => v.ism);
    expect(ismVariants.length).toBeGreaterThanOrEqual(3);

    ismVariants.forEach((v) => {
      const html = renderToString(
        <ISMExplorer
          ism={v.ism!}
          variantPos={v.pos}
          refBase={v.ref}
          altBase={v.alt}
        />
      );
      expect(html).toContain(v.ism!.targetMotif);
      expect(html).toContain('In Silico Mutagenesis (ISM) &amp; Motif Logo');
      expect(html).toContain('Source:');
    });
  });

  it('renders TissueExplorer across all 7 variants with ontology terms', () => {
    variants.forEach((v) => {
      const html = renderToString(
        <TissueExplorer tissues={v.tissues} gene={v.gene} />
      );
      expect(html).toContain('Cross-Tissue &amp; Biosample Specificity');
      v.tissues.forEach((t) => {
        expect(html).toContain(t.name);
      });
    });
  });

  it('renders TransparencyModal with full 6-section methodology guide', () => {
    const html = renderToString(
      <TransparencyModal isOpen={true} onClose={() => {}} />
    );
    expect(html).toContain('Scientific Methodology &amp; Transparency Guide');
    expect(html).toContain('1. What is Google DeepMind AlphaGenome?');
    expect(html).toContain('2. Scoring Metric Hierarchy: Raw vs Quantile vs Atlas AVI');
    expect(html).toContain('3. In Silico Mutagenesis (ISM) &amp; Sashimi Junctions');
    expect(html).toContain('4. Scientific Caveats &amp; In Silico Limitations');
    expect(html).toContain('5. Transparent 5-Tier Data Provenance Framework');
    expect(html).toContain('Avsec, Ž., Latysheva, N., Cheng, J. et al.');
  });

  it('renders DataProvenanceModal with all 7 variants and generation metadata', () => {
    variants.forEach((v) => {
      const html = renderToString(
        <DataProvenanceModal
          isOpen={true}
          onClose={() => {}}
          variants={variants}
          selectedVariant={v}
          onSelectVariant={() => {}}
        />
      );
      expect(html).toContain('Scientific Data Provenance &amp; Verification Audit');
      expect(html).toContain(v.gene);
      expect(html).toContain(v.variant.replace('>', '&gt;'));
      expect(html).toContain('5-Tier Classification Framework');
      expect(html).toContain('Dataset Generation Metadata');
      expect(html).toContain('GRCh38');
    });
  });
});
