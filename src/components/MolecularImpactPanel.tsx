import React from 'react';
import { VariantData, ImpactTier } from '../types/variant';
import { Info, Award } from 'lucide-react';
import { formatPercentileRank } from '../utils/format';

interface MolecularImpactPanelProps {
  variant: VariantData;
}

export const MolecularImpactPanel: React.FC<MolecularImpactPanelProps> = ({ variant }) => {
  const { avi } = variant;
  const isAvi = avi.isAviAvailable;

  const getTierColor = (tier: ImpactTier) => {
    switch (tier) {
      case 'Higher predicted molecular impact':
        return {
          bg: 'bg-rose-950/40',
          border: 'border-rose-500/40',
          text: 'text-rose-300',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          glow: 'shadow-glow-rose',
          stroke: '#f43f5e',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-950/40',
          border: 'border-amber-500/40',
          text: 'text-amber-300',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          glow: 'shadow-glow-amber',
          stroke: '#fbbf24',
        };
      case 'Lower':
        return {
          bg: 'bg-cyan-950/40',
          border: 'border-cyan-500/40',
          text: 'text-cyan-300',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          glow: 'shadow-glow-cyan',
          stroke: '#22d3ee',
        };
      case 'Neutral / Baseline':
      default:
        return {
          bg: 'bg-slate-900/40',
          border: 'border-slate-700/50',
          text: 'text-slate-300',
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          glow: '',
          stroke: '#64748b',
        };
    }
  };

  const tierColors = getTierColor(avi.impactTier);

  // SVG meter arc calculation (semi-circle gauge)
  const radius = 64;
  const strokeWidth = 10;
  const circumference = Math.PI * radius; // Half-circle
  const normalizedPercentile = Math.min(100, Math.max(0, avi.percentileRank));
  const strokeDashoffset = circumference - (normalizedPercentile / 100) * circumference;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden flex flex-col justify-between">
      {/* Background radial highlight */}
      <div
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none opacity-20 blur-2xl"
        style={{ backgroundColor: tierColors.stroke }}
      />

      <div>
        {/* Header with Tooltip info */}
            <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-wrap">
            <Award className="w-4 h-4 text-dna-cyan" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isAvi ? 'AlphaGenome Variant Impact (AVI)' : 'AlphaGenome Predicted Molecular Impact'}
            </h3>
            {!isAvi && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-amber-300 border border-amber-500/30">
                Top Scorer Quantile
              </span>
            )}
          </div>

          <div className="group relative">
            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200 cursor-help" />
            <div className="absolute right-0 top-6 w-80 p-3 rounded-lg bg-obsidian-900 border border-white/20 text-[11px] text-slate-300 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 space-y-2">
              <div className="font-semibold text-white border-b border-white/10 pb-1">
                AlphaGenome Metric Hierarchy:
              </div>
              <div>
                <strong className="text-cyan-300 font-mono">1. Scorer Raw Score:</strong> Direct modeled effect size for a specific assay (e.g., log2 fold-change in RNA-seq, or delta splice donor probability).
              </div>
              <div>
                <strong className="text-emerald-300 font-mono">2. Scorer Quantile Score:</strong> Empirical calibration of that specific scorer against ~300,000 common human variants in gnomAD (e.g. 99.998th percentile).
              </div>
              <div>
                <strong className="text-amber-300 font-mono">3. AlphaGenome Atlas AVI:</strong> The separate composite metric combining AlphaGenome regulatory predictions and AlphaMissense protein-altering scores into a unified prioritization rank.
              </div>
              {!isAvi && (
                <div className="pt-1 text-amber-200/90 italic border-t border-white/10">
                  Note: Composite Atlas AVI is not available for this variant; this panel displays the calibrated {avi.primaryModality} scorer quantile.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gauge & Metrics Section */}
        <div className="flex flex-col sm:flex-row items-center gap-5 my-2">
          {/* Circular/Arc Gauge */}
          <div className="relative w-36 h-24 flex items-center justify-center shrink-0">
            <svg className="w-36 h-28 overflow-visible" viewBox="0 0 160 90">
              {/* Background Arc */}
              <path
                d="M 16 80 A 64 64 0 0 1 144 80"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Foreground Meter Arc */}
              <path
                d="M 16 80 A 64 64 0 0 1 144 80"
                fill="none"
                stroke={tierColors.stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Gauge Center Value */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <span className="text-2xl font-bold font-mono tracking-tight text-white leading-none">
                {formatPercentileRank(avi.percentileRank)}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mt-0.5">
                {isAvi ? 'AVI Percentile' : 'Scorer Quantile'}
              </span>
            </div>
          </div>

          {/* Details & Tier Description */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: tierColors.stroke }}
              />
              <span className={tierColors.text}>{avi.impactTier}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {avi.explanation}
            </p>

            {avi.statusText && (
              <p className="text-[11px] text-slate-400 font-mono italic">
                {avi.statusText}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Primary Modality and Target Tissue Callouts */}
      <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center justify-between">
          <span className="text-slate-400">Calibrated Scorer:</span>
          <span className="font-mono font-medium text-dna-cyan">{avi.primaryModality}</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center justify-between">
          <span className="text-slate-400">Primary Context:</span>
          <span className="font-mono font-medium text-slate-200 truncate max-w-[140px]" title={avi.primaryTissue}>
            {avi.primaryTissue}
          </span>
        </div>
      </div>
    </div>
  );
};
