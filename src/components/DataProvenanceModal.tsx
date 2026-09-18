import React, { useState } from 'react';
import {
  X,
  FileCheck2,
  Database,
  Layers,
  Sparkles,
  GitFork,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { VariantData, ProvenanceSourceType, EvidenceClass, DatasetMetadata } from '../types/variant';
import metadataJson from '../data/metadata.json';
import { useEscapeToClose } from '../hooks/useEscapeToClose';

interface DataProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants: VariantData[];
  selectedVariant: VariantData;
  onSelectVariant: (variant: VariantData) => void;
}

export const DataProvenanceModal: React.FC<DataProvenanceModalProps> = ({
  isOpen,
  onClose,
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  const [activeTab, setActiveTab] = useState<'variant' | 'framework' | 'dataset'>('variant');

  useEscapeToClose(isOpen, onClose);

  if (!isOpen) return null;

  const getSourceBadgeClass = (sourceType: ProvenanceSourceType) => {
    switch (sourceType) {
      case 'AlphaGenome API':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'AlphaGenome Atlas':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'AlphaGenome Nature Paper (Avsec et al., 2026)':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'AlphaGenome Skill Golden Example':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Authoritative Genomic Reference (GRCh38 / GENCODE v46)':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Derived / Transformed Data':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Illustrative Educational Data':
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const getEvidenceBadgeClass = (evidenceClass: EvidenceClass) => {
    switch (evidenceClass) {
      case 'live_api':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'atlas':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'published_exact':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'derived':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'reconstructed':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'illustrative':
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  const getEvidenceLabel = (evidenceClass: EvidenceClass) => {
    switch (evidenceClass) {
      case 'live_api':
        return '⚡ Live API';
      case 'atlas':
        return '🌐 Atlas';
      case 'published_exact':
        return '✓ Published Exact';
      case 'derived':
        return '⚙️ Derived';
      case 'reconstructed':
        return '📐 Reconstructed';
      case 'illustrative':
        return '⚠️ Illustrative';
      default:
        return evidenceClass;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provenance-title"
    >
      <div className="relative w-full max-w-4xl bg-obsidian-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 bg-obsidian-950/90 gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-dna-cyan">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="provenance-title" className="text-sm sm:text-base font-bold text-white tracking-wide leading-snug">
                Scientific Data Provenance & Verification Audit
              </h2>
              <p className="text-xs text-slate-400">
                Transparent provenance trail: AlphaGenome API, Atlas, Nature 2026 publication, and GRCh38 references
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors shrink-0"
            aria-label="Close provenance modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 sm:px-6 border-b border-white/10 bg-obsidian-950/50 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('variant')}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'variant'
                ? 'border-dna-cyan text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Active Variant Audit ({selectedVariant.gene})</span>
          </button>

          <button
            onClick={() => setActiveTab('framework')}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'framework'
                ? 'border-dna-cyan text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Six Evidence Classes Framework</span>
          </button>

          <button
            onClick={() => setActiveTab('dataset')}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'dataset'
                ? 'border-dna-cyan text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Dataset Generation Metadata</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-300">
          {/* TAB 1: ACTIVE VARIANT AUDIT */}
          {activeTab === 'variant' && (
            <div className="space-y-5">
              {/* Variant Selector inside Modal */}
              <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-xl bg-obsidian-950 border border-white/5">
                <span className="text-xs text-slate-400 font-mono">Select Variant to Inspect:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => onSelectVariant(v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                        v.id === selectedVariant.id
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-glow-cyan'
                          : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {v.gene}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Variant Header Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-obsidian-950 to-obsidian-900 border border-white/10 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{selectedVariant.geneFullName}</span>
                      <span className="font-mono text-cyan-400">({selectedVariant.gene})</span>
                    </h3>
                    <p className="font-mono text-xs text-slate-400">
                      {selectedVariant.variant} • Assembly: {selectedVariant.assembly} • Strand: ({selectedVariant.strand})
                    </p>
                  </div>

                  <a
                    href={selectedVariant.atlasUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors self-start sm:self-auto"
                    title="Open Google DeepMind AlphaGenome Atlas (this URL is an Atlas entry point; it may not load this exact variant)"
                  >
                    <span>AlphaGenome Atlas</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-300">
                  <strong>Evidence Source:</strong> {selectedVariant.evidenceSource}
                </p>
              </div>

              {/* Variant Provenance Status Badge / Card */}
              <div
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  selectedVariant.hasLiveApiData
                    ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-200'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${
                        selectedVariant.hasLiveApiData
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {selectedVariant.hasLiveApiData ? (
                        <>
                          <Sparkles className="w-3 h-3" />
                          <span>Live API Enriched</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Curated Benchmark</span>
                        </>
                      )}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {selectedVariant.hasLiveApiData
                        ? 'Live Scorer Results Integrated'
                        : 'Curated Benchmark Variant'}
                    </span>
                  </div>
                  {selectedVariant.hasLiveApiData && (
                    <span className="text-[11px] font-mono text-cyan-400">
                      sourceMode: mixed
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedVariant.hasLiveApiData
                    ? 'In mixed source mode, scalar variant predictions (alphaGenomeScores and calibrated AVI percentile) were queried directly from the live AlphaGenome API, while continuous 1Mb genomic tracks, Sashimi splice arcs, and coordinates remain curated benchmark data.'
                    : 'All values, tracks, and annotations for this variant are derived from official AlphaGenome publications (Avsec et al., Nature 2026), science skill golden examples, and GRCh38 authoritative references.'}
                </p>
              </div>

              {/* Scorer Quantile vs Atlas AVI Status */}
              <div className="p-4 rounded-xl bg-obsidian-950 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-dna-cyan" />
                  <span>Variant Impact & Calibration Status</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-slate-400 block font-mono text-[11px]">Atlas AVI Availability:</span>
                    <div className="flex items-center gap-2">
                      {selectedVariant.avi.isAviAvailable ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Genuine Atlas AVI Available</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Atlas AVI Unavailable</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {selectedVariant.avi.statusText || 'Scorer calibrated against ~300k gnomAD polymorphisms.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-slate-400 block font-mono text-[11px]">Calibrated Scorer & Quantile:</span>
                    <div className="font-mono text-cyan-300 font-bold">
                      {selectedVariant.avi.primaryModality} ({selectedVariant.avi.percentileRank.toFixed(3)}th percentile)
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Primary Context: {selectedVariant.avi.primaryTissue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Structured Provenance Records Table */}
              {/* Structured Provenance Records Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Provenance Records ({selectedVariant.provenance.length} top-level entries)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-obsidian-950">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 font-mono text-[11px]">
                        <th className="p-3">Field / Scope</th>
                        <th className="p-3">Evidence Class</th>
                        <th className="p-3">Source Category</th>
                        <th className="p-3">Source Reference</th>
                        <th className="p-3">Notes & Audit Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedVariant.provenance.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-mono text-cyan-300 font-medium">
                            {p.field || 'variant_core'}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getEvidenceBadgeClass(
                                p.evidenceClass
                              )}`}
                            >
                              {getEvidenceLabel(p.evidenceClass)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono border ${getSourceBadgeClass(
                                p.sourceType
                              )}`}
                            >
                              {p.sourceType}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300 font-medium">{p.source}</td>
                          <td className="p-3 text-slate-400 text-[11px]">{p.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modality Tracks Provenance */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Multimodal Assay Track Provenance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedVariant.modalities.map((m) => {
                    const tp = m.tracks.provenance;
                    return (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-obsidian-950 border border-white/5 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{m.name}</span>
                          {tp?.evidenceClass ? (
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getEvidenceBadgeClass(
                                tp.evidenceClass
                              )}`}
                            >
                              {getEvidenceLabel(tp.evidenceClass)}
                            </span>
                          ) : tp?.isIllustrative ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              ⚠️ Illustrative
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              ✓ Published Exact
                            </span>
                          )}
                        </div>

                        {tp && (
                          <div className="text-[11px] text-slate-400 space-y-0.5">
                            <div>
                              <strong className="text-slate-300">Source:</strong> {tp.source}
                            </div>
                            {tp.biosample && (
                              <div>
                                <strong className="text-slate-300">Biosample:</strong> {tp.biosample}
                              </div>
                            )}
                            {tp.transformation && (
                              <div>
                                <strong className="text-slate-300">Transformation:</strong> {tp.transformation}
                              </div>
                            )}
                            {tp.displayPointCount && tp.originalPointCount && (
                              <div>
                                <strong className="text-slate-300">Points:</strong>{' '}
                                {tp.displayPointCount} display from {tp.originalPointCount.toLocaleString()} original
                              </div>
                            )}
                            {tp.notes && (
                              <div>
                                <strong className="text-slate-300">Notes:</strong> {tp.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sashimi & ISM Provenance (if applicable) */}
              {(selectedVariant.sashimi || selectedVariant.ism) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedVariant.sashimi && (
                    <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sashimi Junction Predictions</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedVariant.sashimi.provenance?.notes ||
                          'Predicted splice junction signals connecting donor and acceptor boundaries.'}
                      </p>
                    </div>
                  )}

                  {selectedVariant.ism && (
                    <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>In Silico Mutagenesis (ISM) Matrix</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {selectedVariant.ism.provenance?.notes ||
                          'Target motif sensitivity profile computed across all 4 nucleotides.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIX EVIDENCE CLASSES FRAMEWORK */}
          {activeTab === 'framework' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Mutation Microscope classifies scientific data by how directly it can be traced to its original source.
                Every numerical value, sequence, and functional prediction is categorized into one of six evidence classes:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-cyan-300 font-mono text-xs">
                      1. Live API Query (<code>live_api</code>)
                    </strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      live_api
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Returned directly from an AlphaGenome API request (<code>dna_model.score_variant</code>).
                    Used only when the value was retrieved programmatically from the API and preserved with retrieval metadata (source, scorer, biosample, retrievedAt).
                    This class describes pipeline-retrieved values; it is not a live production runtime. <code>live_api</code> enrichment is an optional developer-side data pipeline (<code>--fetch-live</code>). Public production runs entirely from committed provenance-tracked data, and the deployed React/Vite client does not call AlphaGenome live.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-indigo-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-indigo-300 font-mono text-xs">
                      2. AlphaGenome Atlas (<code>atlas</code>)
                    </strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      atlas
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Returned directly from AlphaGenome Atlas. Used only for values explicitly retrieved from Atlas, such as confirmed Atlas-specific variant-impact composite scores (AVI).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-emerald-300 font-mono text-xs">
                      3. Published Exact Reference (<code>published_exact</code>)
                    </strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      published_exact
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    An exact value, coordinate, sequence, or result explicitly reported in a cited publication, official AlphaGenome example, or authoritative genomic reference (e.g. GRCh38 coordinates, MANE Select models, ClinVar).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-blue-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-blue-300 font-mono text-xs">
                      4. Derived / Transformed Data (<code>derived</code>)
                    </strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      derived
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Calculated or transformed from one or more traceable source values. Examples include ALT − REF deltas, quantile-to-percentile conversions, normalization, and deterministic downsampling. The transformation must be documented.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-amber-300 font-mono text-xs">
                      5. Reconstructed from Publication (<code>reconstructed</code>)
                    </strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      reconstructed
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Recreated or approximated from a published figure, plot, screenshot, or narrative description that does not provide the exact displayed values directly. Reconstructed data may represent a genuine published result, but displayed numerical values are not claimed to be exact source values.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-obsidian-950 border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-rose-300 font-mono text-xs">
                      6. Illustrative Educational Data (<code>illustrative</code>)
                    </strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      illustrative
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Synthetic or intentionally constructed data used to explain a concept, demonstrate interface behavior, or provide an educational control (e.g. flat negative control baselines). Illustrative values are never presented as direct model output or exact published results.
                  </p>
                </div>
              </div>

              {/* Distinction & Rule Callouts */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
                <div className="text-slate-200">
                  <strong className="text-amber-300">Important Distinction:</strong> <code>reconstructed</code> and <code>illustrative</code> are not the same. Reconstructed visualizations approximate real published AlphaGenome results (e.g. Nature 2026 figures), whereas illustrative data is intentionally synthetic for educational demonstration.
                </div>
                <div className="text-slate-200">
                  <strong className="text-cyan-300">General Rule:</strong> If the repository cannot demonstrate that a value is exact, it must not be labeled as exact. When evidence is uncertain, the more conservative classification is applied.
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATASET GENERATION METADATA */}
          {activeTab === 'dataset' && (
            <div className="space-y-4">
              {(() => {
                const metadata = metadataJson as DatasetMetadata;
                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">Generated At</span>
                        <div className="font-mono text-white font-semibold truncate">{metadata.generatedAt}</div>
                      </div>

                      <div className="p-3 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">AlphaGenome Model Version</span>
                        <div className="font-mono text-cyan-300 font-semibold">{metadata.alphaGenomeApiVersion}</div>
                      </div>

                      <div className="p-3 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">Genome Assembly</span>
                        <div className="font-mono text-emerald-300 font-semibold">{metadata.genomeAssembly}</div>
                      </div>

                      <div className="p-3 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">Source Mode</span>
                        <div className="font-mono text-amber-300 font-semibold">{metadata.sourceMode}</div>
                      </div>

                      <div className="p-3 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">Curated Variant Count</span>
                        <div className="font-mono text-white font-semibold">{metadata.variantCount} variants</div>
                      </div>

                      {metadata.liveVariantCount !== undefined && (
                        <div className="p-3 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                          <span className="text-slate-500 font-mono text-[10px] uppercase">Live Variant Count</span>
                          <div className="font-mono text-cyan-300 font-semibold">
                            {metadata.liveVariantCount} / {metadata.variantCount} live enriched
                          </div>
                        </div>
                      )}

                      <div className="p-3 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                        <span className="text-slate-500 font-mono text-[10px] uppercase">Normalization Version</span>
                        <div className="font-mono text-white font-semibold">{metadata.normalizationVersion}</div>
                      </div>
                    </div>

                    {/* Source Modes Explained */}
                    <div className="p-4 rounded-xl bg-obsidian-950 border border-white/5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5 text-dna-cyan" />
                        <span>Pipeline Source Modes</span>
                      </h4>
                      <div className="space-y-2.5 text-xs">
                        <div
                          className={`p-3 rounded-lg border ${
                            metadata.sourceMode === 'mixed'
                              ? 'bg-cyan-950/20 border-cyan-500/40 text-cyan-200'
                              : 'bg-white/[0.02] border-white/5 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="font-mono text-cyan-300">mixed</strong>
                            {metadata.sourceMode === 'mixed' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                Active Mode
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Coexistence of live AlphaGenome API predictions with curated benchmark data. Scalar model outputs (<code>alphaGenomeScores</code> and top calibrated impact in <code>avi</code>) are queried live from the API during optional developer-side dataset compilation, while continuous 1Mb modality tracks, Sashimi splice junctions, and genomic coordinates remain curated benchmark data. Public production still serves the committed JSON artifacts; the deployed client does not call AlphaGenome live.
                          </p>
                        </div>

                        <div
                          className={`p-3 rounded-lg border ${
                            metadata.sourceMode === 'verified_benchmark'
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                              : 'bg-white/[0.02] border-white/5 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="font-mono text-emerald-300">verified_benchmark</strong>
                            {metadata.sourceMode === 'verified_benchmark' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Active Mode
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Completely offline curated benchmark dataset derived from official AlphaGenome benchmark publications (Avsec et al., Nature 2026), science skill golden examples, and GRCh38 / GENCODE v46 references. Contains zero live API records; all variants have <code>hasLiveApiData: false</code>.
                          </p>
                        </div>

                        <div
                          className={`p-3 rounded-lg border ${
                            metadata.sourceMode === 'live_api'
                              ? 'bg-blue-950/20 border-blue-500/40 text-blue-200'
                              : 'bg-white/[0.02] border-white/5 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="font-mono text-blue-300">live_api</strong>
                            {metadata.sourceMode === 'live_api' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                Active Mode
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Full live API pipeline mode, where variant scores and assay predictions are queried from DeepMind AlphaGenome endpoints during dataset compilation. This is a developer-side source mode, not the public production runtime: the deployed React/Vite client does not call AlphaGenome live and production serves committed provenance-tracked data.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Reproducibility Commands */}
              <div className="p-4 rounded-xl bg-obsidian-950 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-dna-cyan" />
                  <span>Pipeline Reproduction Commands</span>
                </h4>
                <div className="space-y-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-black/50 text-slate-300">
                    <span className="text-slate-500"># 1. Offline verification and export:</span>
                    <br />
                    uv run scripts/generate_dataset.py --verify
                  </div>
                  <div className="p-2 rounded bg-black/50 text-slate-300">
                    <span className="text-slate-500"># 2. Query live AlphaGenome API:</span>
                    <br />
                    export ALPHAGENOME_API_KEY="your_alphagenome_api_key_here"
                    <br />
                    uv run scripts/generate_dataset.py --fetch-live
                  </div>
                  <div className="p-2 rounded bg-black/50 text-slate-300">
                    <span className="text-slate-500"># 3. Scientific provenance audit:</span>
                    <br />
                    npm run validate
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-obsidian-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
