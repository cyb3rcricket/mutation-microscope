import React from 'react';
import { ISMData } from '../types/variant';
import { Sparkles } from 'lucide-react';

interface ISMExplorerProps {
  ism: ISMData;
  variantPos: number;
  refBase: string;
  altBase: string;
}

export const ISMExplorer: React.FC<ISMExplorerProps> = ({
  ism,
  variantPos,
  refBase,
  altBase,
}) => {
  const bases = ['A', 'C', 'G', 'T'] as const;

  // Helper for cell color intensity based on score
  const getCellColor = (score: number, isCurrentVariant: boolean) => {
    if (isCurrentVariant) {
      return score < 0
        ? 'bg-rose-500/40 text-rose-200 border-rose-400 font-bold shadow-glow-rose'
        : 'bg-emerald-500/40 text-emerald-200 border-emerald-400 font-bold shadow-glow-emerald';
    }

    if (score > 1.5) {
      return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
    }
    if (score > 0.5) {
      return 'bg-emerald-950/40 text-emerald-400/80 border-emerald-900/40';
    }
    if (score < -1.0) {
      return 'bg-rose-950/70 text-rose-300 border-rose-800/60';
    }
    if (score < -0.2) {
      return 'bg-rose-950/40 text-rose-400/80 border-rose-900/40';
    }
    return 'bg-white/[0.02] text-slate-400 border-white/5';
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-dna-amber">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2 flex-wrap">
              <span>In Silico Mutagenesis (ISM) & Motif Logo</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                {ism.targetMotif}
              </span>
              {ism.provenance?.isIllustrative ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  ⚠️ Illustrative Matrix
                </span>
              ) : ism.provenance ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30" title={ism.provenance.source}>
                  ✓ Verified ISM Benchmark
                </span>
              ) : null}
            </h3>
            <p className="text-xs text-slate-400">
              Systematic in silico perturbation testing all 4 possible nucleotides across the regulatory motif
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Target Mutation: <strong className="text-white">{refBase}</strong> → <strong className="text-dna-cyan">{altBase}</strong> (Pos: {variantPos.toLocaleString()})
        </div>
      </div>

      <p className="text-xs text-slate-300">
        {ism.motifDescription}. The heatmap displays predicted effect scores for substituting each nucleotide position with A, C, G, or T.
      </p>

      {/* ISM Heatmap Matrix */}
      <div className="overflow-x-auto bg-obsidian-950/90 rounded-xl border border-white/10 p-4">
        <div className="min-w-[500px]" role="grid" aria-label="In silico mutagenesis substitution scores">
          {/* Reference bases row */}
          <div className="flex items-center mb-2">
            <div className="w-12 text-xs font-mono text-slate-500 font-bold shrink-0">
              REF
            </div>
            <div className="flex-1 flex justify-around">
              {ism.positions.map((pos, idx) => {
                const isTarget = pos === variantPos;
                return (
                  <div
                    key={`ref-${pos}`}
                    className={`flex flex-col items-center justify-center font-mono text-xs ${
                      isTarget ? 'text-dna-cyan font-bold scale-110' : 'text-slate-400'
                    }`}
                  >
                    <span>{ism.refBases[idx]}</span>
                    <span className="text-[9px] text-slate-600 font-normal">
                      {isTarget ? '★' : `${pos % 100}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Matrix rows for A, C, G, T */}
          {bases.map((base) => (
            <div key={base} className="flex items-center my-1.5" role="row">
              <div className="w-12 text-xs font-mono font-bold text-slate-300 shrink-0 flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-sm ${
                    base === 'A'
                      ? 'bg-emerald-500'
                      : base === 'C'
                      ? 'bg-cyan-500'
                      : base === 'G'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
                <span>{base}</span>
              </div>

              <div className="flex-1 flex justify-around gap-1">
                {ism.positions.map((pos, idx) => {
                  const score = issm_score_helper(ism, base, idx);
                  const isTargetPos = pos === variantPos;
                  const isTargetMutation = isTargetPos && base === altBase;
                  const isRefBase = isTargetPos && base === refBase;

                  return (
                    <div
                      key={`cell-${base}-${pos}`}
                      role="gridcell"
                      tabIndex={0}
                      aria-label={`Position ${pos}: ${base} score ${score.toFixed(2)}${isTargetMutation ? ', selected mutation' : ''}${isRefBase ? ', reference base' : ''}`}
                      className={`flex-1 h-9 rounded flex items-center justify-center text-[11px] font-mono border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 ${getCellColor(
                        score,
                        isTargetMutation
                      )} ${isRefBase ? 'ring-1 ring-blue-400' : ''}`}
                      title={`Position ${pos}: ${base} score = ${score.toFixed(2)}`}
                    >
                      <span>{score > 0 ? `+${score.toFixed(1)}` : score.toFixed(1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2 pt-1">
        <div className="flex items-center space-x-3">
          <span className="text-slate-500">Scale:</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500" />
            <span>Favorable / Gain</span>
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40 border border-rose-500" />
            <span>Disruptive / Loss</span>
          </span>
        </div>

        <div className="font-mono text-slate-400">
          Box with glow indicates the exact selected mutation ({refBase} → {altBase})
        </div>
      </div>

      {ism.provenance && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2.5 gap-1 font-mono">
          <span>Source: <strong className="text-slate-300">{ism.provenance.source}</strong></span>
          {ism.provenance.notes && <span className="text-slate-500">{ism.provenance.notes}</span>}
        </div>
      )}
    </div>
  );
};

function issm_score_helper(ism: ISMData, base: 'A' | 'C' | 'G' | 'T', idx: number): number {
  return ism.scores[base]?.[idx] ?? 0;
}
