import React, { useState } from 'react';
import { TissueComparison } from '../types/variant';
import { Network, Copy, Check, Sparkles, Target } from 'lucide-react';

interface TissueExplorerProps {
  tissues: TissueComparison[];
  gene: string;
}

export const TissueExplorer: React.FC<TissueExplorerProps> = ({ tissues, gene }) => {
  const [copiedOntology, setCopiedOntology] = useState<string | null>(null);

  const handleCopyOntology = (ontology: string) => {
    navigator.clipboard.writeText(ontology);
    setCopiedOntology(ontology);
    setTimeout(() => setCopiedOntology(null), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-dna-emerald">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <span>Cross-Tissue & Biosample Specificity</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-emerald-300">
                UBERON / EFO Ontologies
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparing AlphaGenome predictions across physiological lineages for {gene}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Top Discovery Hit</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Target className="w-3 h-3 text-emerald-400" />
            <span>Disease Target</span>
          </span>
        </div>
      </div>

      {/* Tissue Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tissues.map((tissue) => {
          const percentile = tissue.quantileScore * 100;

          return (
            <div
              key={tissue.name}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                tissue.isTopDiscovery
                  ? 'bg-cyan-950/20 border-cyan-500/40 shadow-glow-cyan'
                  : tissue.isDiseaseTarget
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-obsidian-950/60 border-white/5'
              }`}
            >
              <div>
                {/* Tissue name and badges */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-xs text-white flex items-center gap-1.5">
                    {tissue.isTopDiscovery && (
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}
                    {tissue.isDiseaseTarget && (
                      <Target className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span>{tissue.name}</span>
                  </h4>

                  {/* Ontology copy button */}
                  <button
                    onClick={() => handleCopyOntology(tissue.ontology)}
                    className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-white/[0.05] hover:bg-white/[0.1] text-[10px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
                    title={`Click to copy ontology CURIE: ${tissue.ontology}`}
                  >
                    <span>{tissue.ontology}</span>
                    {copiedOntology === tissue.ontology ? (
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>

                {/* Quantitative bar */}
                <div className="my-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Predicted Impact:</span>
                    <span className="font-bold text-white">
                      {tissue.quantileScore >= 0.99
                        ? `${(tissue.quantileScore * 100).toFixed(3)}%`
                        : `${(tissue.quantileScore * 100).toFixed(1)}%`}
                    </span>
                  </div>

                  {/* Percentile visual bar */}
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        tissue.isTopDiscovery
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-400'
                          : tissue.isDiseaseTarget
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-slate-500'
                      }`}
                      style={{ width: `${Math.max(4, Math.min(100, percentile))}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                    <span>Raw: {tissue.rawScore > 0 ? `+${tissue.rawScore}` : tissue.rawScore}</span>
                    <span>{tissue.significanceText}</span>
                  </div>
                </div>

                {/* Contextual interpretation note */}
                <p className="text-xs text-slate-300/90 leading-relaxed mt-2">
                  {tissue.contextNote}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
