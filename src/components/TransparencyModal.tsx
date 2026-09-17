import React from 'react';
import {
  X,
  BookOpen,
  Cpu,
  AlertTriangle,
  ExternalLink,
  Dna,
  Layers,
} from 'lucide-react';

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransparencyModal: React.FC<TransparencyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-obsidian-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-obsidian-950/80">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-dna-cyan">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Scientific Methodology & Transparency Guide
              </h2>
              <p className="text-xs text-slate-400">
                Understanding AlphaGenome foundation model predictions, scoring mathematics, and limitations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm text-slate-300 leading-relaxed">
          {/* Section 1: AlphaGenome Overview */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-dna-cyan" />
              <span>1. What is Google DeepMind AlphaGenome?</span>
            </h3>
            <p>
              AlphaGenome is a sequence-based deep learning foundation model developed by Google DeepMind that predicts thousands of functional genomic assays directly from raw DNA sequence. Using a 1-megabase receptive window, it jointly predicts:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-300 font-medium">
              <li><strong>RNA-seq:</strong> Transcript abundance across human cell types and organs.</li>
              <li><strong>Alternative Splicing:</strong> Splice donor/acceptor site strengths, site usage, and junction flows.</li>
              <li><strong>Chromatin Accessibility:</strong> DNase I hypersensitive sites and ATAC-seq peaks.</li>
              <li><strong>Transcription Factor Binding:</strong> ChIP-seq occupancy for dozens of regulatory proteins.</li>
              <li><strong>Polyadenylation Site (PAS) Usage:</strong> Cleavage and termination efficiency in 3' UTRs.</li>
            </ul>
          </div>

          {/* Section 2: Score Mathematics */}
          <div className="space-y-3 bg-obsidian-950/80 p-4 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-dna-emerald" />
              <span>2. Scoring Metric Hierarchy: Raw vs Quantile vs Atlas AVI</span>
            </h3>
            <p className="text-xs text-slate-300">
              AlphaGenome distinguishes between assay-specific effect sizes, calibrated empirical ranks, and multi-modal composite variant impact metrics:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-cyan-300 font-mono">1. Scorer Raw Score:</strong>
                <p className="text-slate-300 text-[11px]">
                  Direct assay-specific effect size. For RNA-seq, it represents predicted log2 fold-change in transcript abundance. For splice sites, it measures delta donor/acceptor probability.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-emerald-300 font-mono">2. Scorer Quantile Score:</strong>
                <p className="text-slate-300 text-[11px]">
                  Assay-specific empirical significance calibrated against ~300,000 common human variants in gnomAD v3 (MAF &gt; 0.01). A quantile of 0.99998 indicates the effect exceeds 99.998% of common polymorphisms.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                <strong className="text-amber-300 font-mono">3. AlphaGenome Atlas AVI:</strong>
                <p className="text-slate-300 text-[11px]">
                  The official AlphaGenome Variant Impact composite score combining sequence-based regulatory predictions with AlphaMissense coding impact into a single prioritization metric.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 italic">
              Note: Where composite Atlas AVI is not available, Mutation Microscope transparently displays the top calibrated AlphaGenome Scorer Quantile and explicitly marks AVI as unavailable.
            </p>
          </div>

          {/* Section 3: In Silico Mutagenesis */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Dna className="w-4 h-4 text-dna-amber" />
              <span>3. In Silico Mutagenesis (ISM) & Sashimi Junctions</span>
            </h3>
            <p>
              <strong>In Silico Mutagenesis (ISM)</strong> systematically mutates every base pair in a local window into all three alternative nucleotides and computes the resulting model predictions. This generates sequence logos and sensitivity matrices that highlight the specific transcription factor binding motifs (such as ETS, GATA1, or core promoters) driving the effect.
            </p>
            <p>
              <strong>Sashimi plots</strong> represent RNA splicing junctions as parabolic arcs connecting donor and acceptor exons. Arcs illustrate predicted splice junction signals (rather than physical sequencer read counts), clearly visualizing phenomena like cryptic splice donor activation (e.g. in <em>COL6A2</em>) or complete exon skipping (e.g. in <em>SMN2</em>).
            </p>
          </div>

          {/* Section 4: Model Limitations */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>4. Scientific Caveats & In Silico Limitations</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-amber-200/90 pl-1">
              <li>
                <strong>Not Clinical Diagnostics:</strong> All outputs are predictive in silico hypotheses for scientific research and education, not clinical determinations.
              </li>
              <li>
                <strong>Long-Range Chromatin (&gt;1Mb):</strong> While AlphaGenome's 1Mb receptive field is state-of-the-art, ultra-long-range regulatory contacts spanning multiple megabases may not be fully resolved.
              </li>
              <li>
                <strong>Complex Secondary RNA Structures:</strong> Specialized ncRNA structures (such as U4atac snRNA base-pairing) require secondary structure considerations beyond standard linear sequence models.
              </li>
              <li>
                <strong>Cell State Dynamics:</strong> Cellular context reflects the training biosamples (e.g. ENCODE/GTEx); specific uncharacterized developmental stages or rare transient states may have different regulatory dynamics.
              </li>
            </ul>
          </div>

          {/* Section 5: Six Evidence Classes Framework */}
          <div className="space-y-2 bg-obsidian-950/80 p-4 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-dna-cyan" />
              <span>5. Six Evidence Classes Data Provenance Framework</span>
            </h3>
            <p className="text-xs text-slate-300">
              Every scientific datum in Mutation Microscope is audited and classified into one of six evidence classes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded bg-white/[0.02] border border-cyan-500/30 text-slate-300">
                <strong className="text-cyan-300 block">1. Live API (<code>live_api</code>)</strong>
                Live predictions queried directly from Google DeepMind's Python client.
              </div>
              <div className="p-2.5 rounded bg-white/[0.02] border border-indigo-500/30 text-slate-300">
                <strong className="text-indigo-300 block">2. AlphaGenome Atlas (<code>atlas</code>)</strong>
                Official Atlas AVI composite impact scores and feature attributions.
              </div>
              <div className="p-2.5 rounded bg-white/[0.02] border border-emerald-500/30 text-slate-300">
                <strong className="text-emerald-300 block">3. Published Exact (<code>published_exact</code>)</strong>
                Exact coordinates, sequences, or values explicitly reported in publications or authoritative references.
              </div>
              <div className="p-2.5 rounded bg-white/[0.02] border border-blue-500/30 text-slate-300">
                <strong className="text-blue-300 block">4. Derived (<code>derived</code>)</strong>
                Calculated or transformed values (e.g. ALT − REF deltas, percentile ranks, downsampling).
              </div>
              <div className="p-2.5 rounded bg-white/[0.02] border border-amber-500/30 text-slate-300">
                <strong className="text-amber-300 block">5. Reconstructed (<code>reconstructed</code>)</strong>
                Approximated or recreated from published figures or plots; not claimed to be exact source values.
              </div>
              <div className="p-2.5 rounded bg-white/[0.02] border border-rose-500/30 text-slate-300">
                <strong className="text-rose-300 block">6. Illustrative (<code>illustrative</code>)</strong>
                Synthetic or educational controls (e.g. flat negative controls). Never presented as real output.
              </div>
            </div>
          </div>

          {/* Section 6: Citations and Links */}
          <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3">
            <div>
              <strong>Benchmark Reference:</strong> Avsec, Ž., Latysheva, N., Cheng, J. et al. <em>Advancing regulatory variant effect prediction with AlphaGenome.</em> Nature 649, 1206–1218 (2026).
            </div>
            <a
              href="https://deepmind.google.com/science/alphagenome/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium shrink-0"
            >
              <span>DeepMind AlphaGenome</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-obsidian-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
