import React, { useState } from 'react';
import { VariantData, ModalityEffect } from './types/variant';
import rawVariants from './data/variants.json';

import { ObservatoryCanvas } from './components/ObservatoryCanvas';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { VariantSelector } from './components/VariantSelector';
import { GenomeZoomMicroscope } from './components/GenomeZoomMicroscope';
import { MolecularImpactPanel } from './components/MolecularImpactPanel';
import { ModalityExplorer } from './components/ModalityExplorer';
import { RefAltTrackViewer } from './components/RefAltTrackViewer';
import { ExplanationPanel } from './components/ExplanationPanel';
import { TissueExplorer } from './components/TissueExplorer';
import { ISMExplorer } from './components/ISMExplorer';
import { TransparencyModal } from './components/TransparencyModal';
import { DataProvenanceModal } from './components/DataProvenanceModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  const variants = rawVariants as VariantData[];

  const [selectedVariant, setSelectedVariant] = useState<VariantData>(variants[0]);
  const [selectedModalityId, setSelectedModalityId] = useState<string>(
    variants[0].modalities[0].id
  );
  const [alleleState, setAlleleState] = useState<'REF' | 'ALT'>('ALT');
  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState<boolean>(false);
  const [isProvenanceModalOpen, setIsProvenanceModalOpen] = useState<boolean>(false);

  // When variant changes, ensure active modality matches the new variant's modalities
  const handleSelectVariant = (newVariant: VariantData) => {
    setSelectedVariant(newVariant);
    if (newVariant.modalities.length > 0) {
      setSelectedModalityId(newVariant.modalities[0].id);
    }
  };

  // Find currently active modality
  const activeModality: ModalityEffect =
    selectedVariant.modalities.find((m) => m.id === selectedModalityId) ||
    selectedVariant.modalities[0];

  const toggleAllele = () => {
    setAlleleState((prev) => (prev === 'REF' ? 'ALT' : 'REF'));
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col relative selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Background Interactive Observatory Canvas */}
      <ObservatoryCanvas />

      {/* Foreground Interactive Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header with Branding and Atlas Links */}
        <Header
          currentVariant={selectedVariant}
          onOpenTransparencyModal={() => setIsTransparencyModalOpen(true)}
          onOpenProvenanceModal={() => setIsProvenanceModalOpen(true)}
        />

        {/* Prominent Educational / Non-Diagnostic Disclaimer */}
        <DisclaimerBanner />

        {/* Interactive Variant Carousel & Keyboard Switcher */}
        <VariantSelector
          variants={variants}
          selectedVariant={selectedVariant}
          onSelectVariant={handleSelectVariant}
        />

        {/* Main Dashboard Workspace */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Top Section: Multi-Scale Microscope & AlphaGenome Variant Impact Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              <GenomeZoomMicroscope
                variant={selectedVariant}
                alleleState={alleleState}
                onToggleAllele={toggleAllele}
              />
            </div>

            <div className="lg:col-span-4 flex flex-col">
              <MolecularImpactPanel variant={selectedVariant} />
            </div>
          </div>

          {/* Multimodal Molecular Assays Grid */}
          <ModalityExplorer
            modalities={selectedVariant.modalities}
            selectedModalityId={activeModality.id}
            onSelectModality={setSelectedModalityId}
          />

          {/* Interactive REF vs ALT Genome Tracks & Splicing Sashimi Viewer */}
          <RefAltTrackViewer
            variant={selectedVariant}
            activeModality={activeModality}
            currentAllele={alleleState}
            onToggleAllele={toggleAllele}
          />

          {/* Plain-English 3-Step Causality Cascade */}
          <ExplanationPanel variant={selectedVariant} />

          {/* In Silico Mutagenesis (ISM) Heatmap (when available) */}
          {selectedVariant.ism && (
            <ISMExplorer
              ism={selectedVariant.ism}
              variantPos={selectedVariant.pos}
              refBase={selectedVariant.ref}
              altBase={selectedVariant.alt}
            />
          )}

          {/* Cross-Biosample & Tissue Specificity Comparison */}
          <TissueExplorer
            tissues={selectedVariant.tissues}
            gene={selectedVariant.gene}
          />
        </main>

        {/* Footer */}
        <Footer
          currentVariant={selectedVariant}
          onOpenTransparencyModal={() => setIsTransparencyModalOpen(true)}
        />
      </div>

      {/* Scientific Transparency & Methodology Modal */}
      <TransparencyModal
        isOpen={isTransparencyModalOpen}
        onClose={() => setIsTransparencyModalOpen(false)}
      />

      {/* Scientific Data Provenance & Verification Audit Modal */}
      <DataProvenanceModal
        isOpen={isProvenanceModalOpen}
        onClose={() => setIsProvenanceModalOpen(false)}
        variants={variants}
        selectedVariant={selectedVariant}
        onSelectVariant={handleSelectVariant}
      />
    </div>
  );
};
