import React from 'react';
import { VariantData } from '../types/variant';
import {
  FileText,
  AlertTriangle,
  Dna,
  Cpu,
  HeartPulse,
} from 'lucide-react';

interface ExplanationPanelProps {
  variant: VariantData;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ variant }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-dna-cyan">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              What Changed? Plain-English Scientific Summary
            </h3>
            <p className="text-xs text-slate-400">
              Tracing the modeled molecular chain of causality from sequence to function
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/5">
          GRCh38 Assembly
        </span>
      </div>

      {/* 3-Step Molecular Cascade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: DNA Primary Alteration */}
        <div className="p-4 rounded-xl bg-obsidian-950/70 border border-white/5 space-y-2">
          <div className="flex items-center space-x-2 text-dna-cyan font-mono text-xs font-bold uppercase tracking-wider">
            <Dna className="w-4 h-4" />
            <span>1. Sequence Change</span>
          </div>
          <div className="text-xs text-slate-200 font-mono font-medium">
            {variant.variant}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            A single-letter substitution ({variant.ref} → {variant.alt}) located at nucleotide coordinate {variant.pos.toLocaleString()} on {variant.chrom} ({variant.strand} strand).
          </p>
        </div>

        {/* Step 2: Direct Molecular Consequence */}
        <div className="p-4 rounded-xl bg-obsidian-950/70 border border-white/5 space-y-2">
          <div className="flex items-center space-x-2 text-dna-amber font-mono text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>2. Molecular Consequence</span>
          </div>
          <div className="text-xs text-slate-200 font-medium">
            {variant.category}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {variant.consequenceSummary}
          </p>
        </div>

        {/* Step 3: Cellular & Biological Context */}
        <div className="p-4 rounded-xl bg-obsidian-950/70 border border-white/5 space-y-2">
          <div className="flex items-center space-x-2 text-dna-emerald font-mono text-xs font-bold uppercase tracking-wider">
            <HeartPulse className="w-4 h-4" />
            <span>3. Biological Relevance</span>
          </div>
          <div className="text-xs text-slate-200 font-medium truncate" title={variant.disease}>
            {variant.disease}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {variant.clinicalRelevance}
          </p>
        </div>
      </div>

      {/* Prominent Educational / Non-Diagnostic Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start space-x-3 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-amber-200/90 leading-relaxed">
          <p className="font-semibold text-amber-300">
            Scientific Research Predictions, Not Medical Diagnoses
          </p>
          <p>
            The predictions shown are computed in silico by DeepMind's AlphaGenome foundation model to prioritize and hypothesize regulatory mechanisms. They represent statistical molecular effect scores, not proven clinical diagnoses or individual health prognostications.
          </p>
        </div>
      </div>
    </div>
  );
};
