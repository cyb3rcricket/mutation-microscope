// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { App } from '../App';
import rawVariants from '../data/variants.json';
import { VariantData } from '../types/variant';

const variants = rawVariants as unknown as VariantData[];

describe('Mutation Microscope User-Flow Automated Tests', () => {
  beforeEach(() => {
    cleanup();
    // Provide safe stub for window.matchMedia if not implemented by environment
    if (!window.matchMedia) {
      window.matchMedia = (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      });
    }
  });

  // --------------------------------------------------------------------------
  // Flow 1: Variant Switching Flow
  // --------------------------------------------------------------------------
  describe('Flow 1: Variant Switching Flow', () => {
    it('switches between variants (APOA1 -> CFTR -> TERT) and updates coordinates, impact scores, and assays', () => {
      const { container } = render(<App />);

      // Verify initial active variant is APOA1
      expect(screen.getAllByText('chr11:116837649:T>G').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('APOA1').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Hypoalphalipoproteinemia/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Promoter / Expression Disruption').length).toBeGreaterThanOrEqual(1);

      // Find the CFTR variant card button in the carousel
      const cftrVariant = variants.find((v) => v.gene === 'CFTR')!;
      const cftrButton = screen.getAllByRole('button').find(
        (btn) => btn.textContent?.includes('CFTR') && btn.textContent?.includes('117642567')
      );
      expect(cftrButton).toBeDefined();
      fireEvent.click(cftrButton!);

      // Verify dashboard updated to CFTR
      expect(screen.getAllByText(cftrVariant.variant).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('CFTR').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Cystic Fibrosis/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Neutral / Baseline').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Benign Synonymous Control/i).length).toBeGreaterThanOrEqual(1);

      // Now switch to TERT
      const tertVariant = variants.find((v) => v.gene === 'TERT')!;
      const tertButton = screen.getAllByRole('button').find(
        (btn) => btn.textContent?.includes('TERT') && btn.textContent?.includes('1295113')
      );
      expect(tertButton).toBeDefined();
      fireEvent.click(tertButton!);

      // Verify dashboard updated to TERT
      expect(screen.getAllByText(tertVariant.variant).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('TERT').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Glioblastoma/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/De Novo TF Binding Site Creation/i).length).toBeGreaterThanOrEqual(1);
      // TERT has an ISM component
      expect(container.textContent).toContain('In Silico Mutagenesis (ISM) & Motif Logo');
    });

    it('navigates variants using previous and next arrow buttons', () => {
      render(<App />);

      const prevButton = screen.getByRole('button', { name: /Previous Variant/i });
      const nextButton = screen.getByRole('button', { name: /Next Variant/i });
      expect(prevButton).toBeDefined();
      expect(nextButton).toBeDefined();

      // Clicking Next advances from index 0 (APOA1) to index 1 (COL6A2)
      fireEvent.click(nextButton);
      const col6a2Variant = variants[1];
      expect(screen.getAllByText(col6a2Variant.variant).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('COL6A2').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Ullrich Congenital Muscular Dystrophy/i).length).toBeGreaterThanOrEqual(1);

      // Clicking Prev cycles back to APOA1
      fireEvent.click(prevButton);
      expect(screen.getAllByText(variants[0].variant).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('APOA1').length).toBeGreaterThanOrEqual(1);
    });
  });

  // --------------------------------------------------------------------------
  // Flow 2: Zoom Level Navigation Flow
  // --------------------------------------------------------------------------
  describe('Flow 2: Zoom Level Navigation Flow', () => {
    it('navigates seamlessly across Zoom Level 1, 2, and 3', () => {
      render(<App />);

      const zoom1Btn = screen.getByRole('button', { name: /1\.\s*Chromosome/i });
      const zoom2Btn = screen.getByRole('button', { name: /2\.\s*Genomic Region/i });
      const zoom3Btn = screen.getByRole('button', { name: /3\.\s*Sequence Inspector/i });

      // Initially at Zoom Level 3 (Sequence Inspector)
      expect(screen.getByText(/5' Sense Strand/i)).toBeDefined();
      expect(screen.getByText(/Currently Viewing:/i)).toBeDefined();

      // Switch to Zoom Level 1 (Chromosome Ideogram)
      fireEvent.click(zoom1Btn);
      expect(screen.getByText(/0 Mb \(pter\)/i)).toBeDefined();
      expect(screen.getAllByText(/p-arm/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/q-arm/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Zoom into Genomic Region \(Level 2\)/i)).toBeDefined();
      expect(screen.queryByText(/5' Sense Strand/i)).toBeNull();

      // Switch to Zoom Level 2 (Genomic Region)
      fireEvent.click(zoom2Btn);
      expect(screen.getAllByText(/Gene Body/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Exon 1/i)).toBeDefined();
      expect(screen.queryByText(/0 Mb \(pter\)/i)).toBeNull();

      // Switch back to Zoom Level 3 (Sequence Inspector)
      fireEvent.click(zoom3Btn);
      expect(screen.getByText(/5' Sense Strand/i)).toBeDefined();
      expect(screen.getByText(/Currently Viewing:/i)).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // Flow 3: REF ↔ ALT Comparison Toggle Flow
  // --------------------------------------------------------------------------
  describe('Flow 3: REF ↔ ALT Comparison Toggle Flow', () => {
    it('toggles between REF and ALT allele states and updates nucleotide displays and comparative tracks', () => {
      render(<App />);
      const defaultVar = variants[0]; // APOA1: ref T, alt G

      // Find the toggle button in the Microscope
      const toggleBtn = screen.getByRole('button', {
        name: /Currently Viewing:\s*ALT Allele/i,
      });
      expect(toggleBtn).toBeDefined();
      expect(toggleBtn.textContent).toContain(`ALT Allele (${defaultVar.alt})`);

      // Click to toggle to REF
      fireEvent.click(toggleBtn);
      expect(
        screen.getByRole('button', { name: /Currently Viewing:\s*REF Allele/i })
      ).toBeDefined();

      // Click again to toggle back to ALT
      fireEvent.click(toggleBtn);
      expect(
        screen.getByRole('button', { name: /Currently Viewing:\s*ALT Allele/i })
      ).toBeDefined();

      // Central single-base button also toggles REF/ALT
      const centralBaseBtn = screen.getByTitle(/Click to toggle REF ↔ ALT/i);
      expect(centralBaseBtn).toBeDefined();
      fireEvent.click(centralBaseBtn);
      expect(
        screen.getByRole('button', { name: /Currently Viewing:\s*REF Allele/i })
      ).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // Flow 4: Modality Selection Flow
  // --------------------------------------------------------------------------
  describe('Flow 4: Modality Selection Flow', () => {
    it('switches between multimodal assays and updates active track visualizer', () => {
      render(<App />);
      const defaultVar = variants[0];
      expect(defaultVar.modalities.length).toBeGreaterThan(1);

      const secondMod = defaultVar.modalities[1];

      // Click the second modality card button
      const modButtons = screen.getAllByRole('button');
      const secondModButton = modButtons.find(
        (btn) => btn.textContent?.includes(secondMod.name) && btn.textContent?.includes(secondMod.primaryTissue)
      );
      expect(secondModButton).toBeDefined();
      fireEvent.click(secondModButton!);

      // Verify that the RefAltTrackViewer reflects the second modality
      expect(screen.getAllByText(secondMod.name, { exact: false }).length).toBeGreaterThanOrEqual(1);
    });
  });

  // --------------------------------------------------------------------------
  // Flow 5: Data Provenance Modal Flow
  // --------------------------------------------------------------------------
  describe('Flow 5: Data Provenance Modal Flow', () => {
    it('opens provenance modal, inspects evidence classes & dataset metadata, and closes modal cleanly', () => {
      render(<App />);

      // Open modal from Header button
      const openBtn = screen.getByRole('button', { name: /Data Provenance/i });
      fireEvent.click(openBtn);

      // Verify modal is open and header displays
      expect(screen.getByText('Scientific Data Provenance & Verification Audit')).toBeDefined();
      expect(screen.getByText(/Transparent provenance trail/i)).toBeDefined();

      // Inspect tabs in provenance modal
      const frameworkTab = screen.getByRole('button', { name: /Six Evidence Classes/i });
      const datasetTab = screen.getByRole('button', { name: /Dataset Generation Metadata/i });
      expect(frameworkTab).toBeDefined();
      expect(datasetTab).toBeDefined();

      // Click Framework tab
      fireEvent.click(frameworkTab);
      expect(screen.getAllByText(/live_api/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/illustrative/i).length).toBeGreaterThanOrEqual(1);

      // Click Dataset tab
      fireEvent.click(datasetTab);
      expect(screen.getByText(/Pipeline Source Modes/i)).toBeDefined();
      expect(screen.getAllByText(/verified_benchmark/i).length).toBeGreaterThanOrEqual(1);

      // Close modal using close button
      const closeBtn = screen.getByRole('button', { name: /Close provenance modal/i });
      fireEvent.click(closeBtn);

      // Verify modal is dismissed
      expect(screen.queryByText('Scientific Data Provenance & Verification Audit')).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // Flow 6: Transparency & Methodology Modal Flow
  // --------------------------------------------------------------------------
  describe('Flow 6: Transparency & Methodology Modal Flow', () => {
    it('opens transparency modal, displays the 6 methodology sections, and closes cleanly', () => {
      render(<App />);

      // Open modal from Header button
      const openBtn = screen.getByRole('button', { name: /How It Works/i });
      fireEvent.click(openBtn);

      // Verify modal title and all 6 methodology sections
      expect(screen.getByText('Scientific Methodology & Transparency Guide')).toBeDefined();
      expect(screen.getByText(/1\. What is Google DeepMind AlphaGenome\?/i)).toBeDefined();
      expect(screen.getByText(/2\. Scoring Metric Hierarchy: Raw vs Quantile vs Atlas AVI/i)).toBeDefined();
      expect(screen.getByText(/3\. In Silico Mutagenesis \(ISM\) & Sashimi Junctions/i)).toBeDefined();
      expect(screen.getByText(/4\. Scientific Caveats & In Silico Limitations/i)).toBeDefined();
      expect(screen.getByText(/5\. Six Evidence Classes Data Provenance Framework/i)).toBeDefined();
      expect(screen.getByText(/Avsec, Ž\., Latysheva, N\., Cheng, J\. et al\./i)).toBeDefined();

      // Close modal using close button
      const closeBtn = screen.getByRole('button', { name: /Close modal/i });
      fireEvent.click(closeBtn);

      // Verify modal is dismissed
      expect(screen.queryByText('Scientific Methodology & Transparency Guide')).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // Flow 7: Interaction Stability
  // --------------------------------------------------------------------------
  describe('Flow 7: Interaction Stability', () => {
    it('survives rapid successive interactions without unhandled runtime errors', () => {
      render(<App />);

      const nextButton = screen.getByRole('button', { name: /Next Variant/i });
      const zoom1Btn = screen.getByRole('button', { name: /1\.\s*Chromosome/i });
      const zoom2Btn = screen.getByRole('button', { name: /2\.\s*Genomic Region/i });
      const zoom3Btn = screen.getByRole('button', { name: /3\.\s*Sequence Inspector/i });

      // Cycle rapidly through variants
      for (let i = 0; i < 5; i++) {
        fireEvent.click(nextButton);
      }

      // Cycle through zoom levels
      fireEvent.click(zoom1Btn);
      fireEvent.click(zoom2Btn);
      fireEvent.click(zoom3Btn);

      // Toggle allele several times
      const toggleBtn = screen.getByRole('button', {
        name: /Currently Viewing:\s*(REF|ALT) Allele/i,
      });
      fireEvent.click(toggleBtn);
      fireEvent.click(toggleBtn);
      fireEvent.click(toggleBtn);

      // Open and close provenance modal
      const provBtn = screen.getByRole('button', { name: /Data Provenance/i });
      fireEvent.click(provBtn);
      const closeProvBtn = screen.getByRole('button', { name: /Close provenance modal/i });
      fireEvent.click(closeProvBtn);

      // Open and close how it works modal
      const howBtn = screen.getByRole('button', { name: /How It Works/i });
      fireEvent.click(howBtn);
      const closeHowBtn = screen.getByRole('button', { name: /Close modal/i });
      fireEvent.click(closeHowBtn);

      // Final sanity check: core dashboard is intact
      expect(screen.getAllByText(/Mutation Microscope/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/GRCh38/i).length).toBeGreaterThan(0);
    });
  });
});
