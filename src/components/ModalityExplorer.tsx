import React from 'react';
import { ModalityEffect, ModalityCategory } from '../types/variant';
import {
  Activity,
  GitFork,
  Sparkles,
  Radio,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface ModalityExplorerProps {
  modalities: ModalityEffect[];
  selectedModalityId: string;
  onSelectModality: (id: string) => void;
}

export const ModalityExplorer: React.FC<ModalityExplorerProps> = ({
  modalities,
  selectedModalityId,
  onSelectModality,
}) => {
  const getCategoryIcon = (category: ModalityCategory) => {
    switch (category) {
      case 'expression':
        return <Activity className="w-4 h-4 text-dna-emerald" />;
      case 'splicing':
        return <GitFork className="w-4 h-4 text-dna-cyan" />;
      case 'tf_binding':
      case 'accessibility':
        return <Sparkles className="w-4 h-4 text-dna-amber" />;
      case 'polyadenylation':
        return <Radio className="w-4 h-4 text-dna-violet" />;
      case 'control':
      default:
        return <ShieldCheck className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEffectDirectionIcon = (rawScore: number) => {
    if (Math.abs(rawScore) < 0.05) {
      return <span className="text-[11px] font-mono text-slate-400">Neutral (0.0)</span>;
    }
    if (rawScore > 0) {
      return (
        <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Gain (+{rawScore > 10 ? rawScore.toFixed(1) : rawScore.toFixed(2)})</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400">
        <TrendingDown className="w-3.5 h-3.5" />
        <span>Loss ({rawScore.toFixed(2)})</span>
      </span>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>Multimodal Molecular Assays</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-300">
            {modalities.length} Active
          </span>
        </h3>
        <span className="hidden sm:inline text-[11px] text-slate-500 font-mono">
          Click an assay to inspect track
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {modalities.map((mod) => {
          const isSelected = mod.id === selectedModalityId;

          return (
            <button
              key={mod.id}
              onClick={() => onSelectModality(mod.id)}
              className={`text-left p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-obsidian-800 border-cyan-500/60 shadow-glow-cyan'
                  : 'bg-obsidian-850/70 border-white/10 hover:border-white/20 hover:bg-obsidian-800/60'
              }`}
            >
              <div>
                {/* Header with Assay Category & Direction */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(mod.category)}
                    <span className="font-semibold text-xs text-white">
                      {mod.name}
                    </span>
                  </div>
                  {getEffectDirectionIcon(mod.rawScore)}
                </div>

                {/* Quantitative Score Metrics */}
                <div className="flex items-baseline space-x-3 my-2 font-mono">
                  <div>
                    <span className="text-lg font-bold text-slate-100">
                      {mod.rawScore > 0 && Math.abs(mod.rawScore) >= 0.05 ? `+${mod.rawScore}` : mod.rawScore}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      {mod.unit}
                    </span>
                  </div>

                  <div className="text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    Quantile: {mod.quantileScore.toFixed(5)}
                  </div>
                </div>

                {/* Biological Interpretation summary */}
                <p className="text-xs text-slate-300/90 leading-relaxed mt-1 line-clamp-3">
                  {mod.interpretation}
                </p>
              </div>

              {/* Tissue / Context footer */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                <span className="truncate min-w-0" title={mod.primaryTissue}>
                  {mod.primaryTissue}
                </span>
                <span className="text-slate-500 shrink-0">{mod.tissueOntology}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
