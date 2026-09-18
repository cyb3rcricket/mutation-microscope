import React, { useState } from 'react';
import { VariantData } from '../types/variant';
import {
  CHROMOSOME_DATA,
  getVariantArm,
  formatCoordinates,
  formatBasePairDistance,
} from '../utils/chromosome';
import {
  RefreshCw,
  Layers,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';

interface GenomeZoomMicroscopeProps {
  variant: VariantData;
  alleleState: 'REF' | 'ALT';
  onToggleAllele: () => void;
}

export const GenomeZoomMicroscope: React.FC<GenomeZoomMicroscopeProps> = ({
  variant,
  alleleState,
  onToggleAllele,
}) => {
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 3>(3);
  const [hoveredExon, setHoveredExon] = useState<string | null>(null);

  const chromInfo = CHROMOSOME_DATA[variant.chrom] || {
    name: variant.chrom,
    lengthMb: 150,
    centromereMb: 60,
    pArmLengthMb: 60,
    qArmLengthMb: 90,
  };

  const { arm, mb, percent } = getVariantArm(variant.chrom, variant.pos);
  const flanking = variant.genomicRegion.flankingSequence;

  // Nucleotide color helper
  const getBaseColorClass = (base: string, isVariantPos: boolean = false) => {
    switch (base.toUpperCase()) {
      case 'A':
        return isVariantPos
          ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500 shadow-glow-emerald font-bold'
          : 'bg-emerald-950/30 text-emerald-400/80 border-emerald-900/40';
      case 'C':
        return isVariantPos
          ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500 shadow-glow-cyan font-bold'
          : 'bg-cyan-950/30 text-cyan-400/80 border-cyan-900/40';
      case 'G':
        return isVariantPos
          ? 'bg-amber-500/30 text-amber-300 border-amber-500 shadow-glow-amber font-bold'
          : 'bg-amber-950/30 text-amber-400/80 border-amber-900/40';
      case 'T':
        return isVariantPos
          ? 'bg-rose-500/30 text-rose-300 border-rose-500 shadow-glow-rose font-bold'
          : 'bg-rose-950/30 text-rose-400/80 border-rose-900/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
      {/* Header bar: Title & Zoom Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-5 py-3.5 border-b border-white/10 bg-obsidian-900/80 gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-dna-cyan">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <span>Genomic Multi-Scale Microscope</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/5">
                {variant.variant}
              </span>
            </h2>
          </div>
        </div>

        {/* 3-Level Zoom Controls */}
        <div className="flex flex-wrap items-center bg-obsidian-950 rounded-xl p-1 border border-white/10 gap-0.5 max-w-full">
          <button
            onClick={() => setZoomLevel(1)}
            className={`px-2.5 sm:px-3 py-1 text-xs rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              zoomLevel === 1
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>1. Chromosome</span>
          </button>
          <button
            onClick={() => setZoomLevel(2)}
            className={`px-2.5 sm:px-3 py-1 text-xs rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              zoomLevel === 2
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>2. Genomic Region</span>
          </button>
          <button
            onClick={() => setZoomLevel(3)}
            className={`px-2.5 sm:px-3 py-1 text-xs rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              zoomLevel === 3
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>3. Sequence Inspector</span>
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="p-6 bg-gradient-to-b from-obsidian-900/60 to-obsidian-950/90 min-h-[290px] flex flex-col justify-center">
        {/* LEVEL 1: Chromosome Ideogram */}
        {zoomLevel === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">{chromInfo.name}</span>
                <span>•</span>
                <span className="font-mono">Length: {chromInfo.lengthMb} Mb</span>
                <span>•</span>
                <span className="font-mono">Centromere: ~{chromInfo.centromereMb} Mb</span>
              </div>
              <div className="font-mono text-cyan-300 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-500/30 self-start sm:self-auto">
                Variant Location: {variant.chrom}:{mb.toFixed(3)} Mb ({arm}-arm, {percent.toFixed(1)}%)
              </div>
            </div>

            {/* Visual Ideogram Bar */}
            <div className="relative pt-6 pb-2">
              {/* Mb Ruler ticks */}
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1.5 px-2">
                <span>0 Mb (pter)</span>
                <span>Centromere (~{chromInfo.centromereMb} Mb)</span>
                <span>{chromInfo.lengthMb} Mb (qter)</span>
              </div>

              {/* The Chromosome Tube */}
              <div className="relative h-10 w-full rounded-full bg-slate-900/90 border-2 border-slate-700/80 p-1 flex items-center overflow-hidden shadow-inner">
                {/* p-arm cytoband stripes */}
                <div
                  className="h-full rounded-l-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 relative flex items-center justify-center"
                  style={{ width: `${(chromInfo.centromereMb / chromInfo.lengthMb) * 100}%` }}
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    p-arm
                  </span>
                  {/* Subtle banding lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_20%,rgba(255,255,255,0.06)_25%,transparent_30%)] bg-[length:24px_100%]" />
                </div>

                {/* Centromere constriction notch */}
                <div className="w-2.5 h-6 bg-obsidian-950 border-y border-slate-600 rounded-sm z-10 shrink-0 mx-0.5 flex items-center justify-center">
                  <div className="w-0.5 h-3 bg-slate-600 rounded-full" />
                </div>

                {/* q-arm cytoband stripes */}
                <div
                  className="h-full rounded-r-full bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 relative flex-1 flex items-center justify-center"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    q-arm
                  </span>
                  {/* Subtle banding lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_15%,rgba(255,255,255,0.06)_20%,transparent_25%)] bg-[length:32px_100%]" />
                </div>

                {/* Pulsing Variant Marker */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-dna-cyan z-20 shadow-glow-cyan"
                  style={{ left: `${percent}%` }}
                >
                  {/* Pulsing pin circle */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-dna-cyan border-2 border-white shadow-glow-cyan animate-bounce flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-obsidian-950" />
                  </div>
                </div>
              </div>

              {/* Pin annotation callout */}
              <div
                className="absolute -bottom-5 text-[11px] font-mono font-medium text-cyan-300 -translate-x-1/2 flex items-center gap-1"
                style={{ left: `${percent}%` }}
              >
                <span>▲</span>
                <span>{variant.gene} ({formatCoordinates(variant.chrom, variant.pos)})</span>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={() => setZoomLevel(2)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-medium transition-colors"
              >
                <span>Zoom into Genomic Region (Level 2)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* LEVEL 2: Genomic Region / Gene Body Architecture */}
        {zoomLevel === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white text-sm">{variant.gene} Gene Body</span>
                <span className="font-mono text-slate-500">({variant.geneFullName})</span>
                <span>•</span>
                <span className="font-mono text-dna-cyan font-bold">Strand {variant.strand}</span>
              </div>
              <div className="font-mono text-slate-300 text-xs bg-white/[0.04] px-2.5 py-1 rounded border border-white/10">
                Window: {formatCoordinates(variant.chrom, variant.genomicRegion.start)} – {variant.genomicRegion.end.toLocaleString()} ({formatBasePairDistance(variant.genomicRegion.end - variant.genomicRegion.start)})
              </div>
            </div>

            {/* Gene Body Schematic */}
            <div className="relative py-8 px-4 bg-obsidian-950/60 rounded-xl border border-white/5">
              {/* Intron Line with transcription orientation arrows */}
              <div className="relative h-1.5 w-full bg-slate-700/80 rounded-full flex items-center justify-around my-6">
                {Array.from({ length: 9 }).map((_, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] text-slate-500 font-bold select-none"
                  >
                    {variant.strand === '+' ? '›››' : '‹‹‹'}
                  </span>
                ))}
              </div>

              {/* Exon Blocks */}
              <div className="relative -mt-10 flex justify-between items-center px-4">
                {variant.genomicRegion.exons.map((exon) => {
                  const isHovered = hoveredExon === exon.id;
                  return (
                    <div
                      key={exon.id}
                      onMouseEnter={() => setHoveredExon(exon.id)}
                      onMouseLeave={() => setHoveredExon(null)}
                      className={`relative flex flex-col items-center cursor-pointer transition-transform ${
                        isHovered ? 'scale-110 z-30' : 'z-10'
                      }`}
                    >
                      <div
                        className={`h-8 px-3.5 rounded-md flex items-center justify-center font-mono text-xs font-bold border transition-all ${
                          exon.isAffected
                            ? 'bg-rose-500/30 border-rose-500 text-rose-200 shadow-glow-rose'
                            : exon.isCoding
                            ? 'bg-cyan-900/60 border-cyan-500/40 text-cyan-200'
                            : 'bg-slate-800/80 border-slate-600 text-slate-300'
                        }`}
                      >
                        Exon {exon.exonNumber}
                        {exon.isAffected && <span className="ml-1 text-rose-400">★</span>}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 mt-1.5">
                        {exon.isCoding ? 'Coding' : 'Non-coding'}
                      </span>

                      {/* Tooltip on hover */}
                      {isHovered && exon.description && (
                        <div className="absolute -top-12 z-50 bg-obsidian-850 border border-white/20 px-3 py-1.5 rounded-lg text-[11px] text-slate-200 shadow-xl whitespace-nowrap">
                          {exon.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Regulatory Regions overlay */}
              {variant.genomicRegion.regulatoryRegions.length > 0 && (
                <div className="mt-8 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Regulatory Landmarks:
                  </span>
                  {variant.genomicRegion.regulatoryRegions.map((reg) => (
                    <span
                      key={reg.id}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      {reg.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setZoomLevel(1)}
                className="flex items-center space-x-1.5 px-3 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Chromosome</span>
              </button>

              <button
                onClick={() => setZoomLevel(3)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-medium transition-colors"
              >
                <span>Inspect DNA Sequence (Level 3)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* LEVEL 3: Nucleotide Sequence Inspector & Interactive REF <-> ALT Switcher */}
        {zoomLevel === 3 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Context & State bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">Single-Nucleotide Resolution</span>
                <span>•</span>
                <span className="font-mono text-cyan-300">Pos {variant.pos.toLocaleString()}</span>
                <span>•</span>
                <span className="text-slate-400 font-mono">
                  {variant.ref} (REF) <ArrowRight className="w-3 h-3 inline text-dna-cyan" /> {variant.alt} (ALT)
                </span>
              </div>

              {/* 1-Click Interactive REF <-> ALT Toggle */}
              <button
                onClick={onToggleAllele}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all shadow-lg ${
                  alleleState === 'REF'
                    ? 'bg-blue-950/60 border-blue-500/40 text-blue-300 hover:bg-blue-900/60'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60 shadow-glow-rose'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-once" />
                <span>Currently Viewing: <strong className="underline decoration-2">{alleleState} Allele ({alleleState === 'REF' ? variant.ref : variant.alt})</strong></span>
              </button>
            </div>

            {/* Sequence Flanking Track */}
            <div className="p-5 rounded-2xl bg-obsidian-950/90 border border-white/10 shadow-inner space-y-4">
              {/* Primary 5' -> 3' Sense Strand */}
              <div>
                <div className="flex items-start justify-between text-[11px] font-mono text-slate-500 mb-2 gap-2">
                  <span className="min-w-0 leading-relaxed">
                    5' Sense Strand
                    <span className="hidden sm:inline">
                      {' '}
                      (Genomic Coordinates: {variant.pos - flanking.upstream.length} → {variant.pos + flanking.downstream.length})
                    </span>
                  </span>
                  <span className="shrink-0">3'</span>
                </div>

                <div className="flex items-center justify-center flex-wrap gap-1 font-mono text-xs sm:text-sm">
                  {/* Upstream sequence */}
                  {flanking.upstream.split('').map((base, idx) => (
                    <span
                      key={`up-${idx}`}
                      className={`w-6 h-8 sm:w-7 sm:h-9 flex items-center justify-center rounded border ${getBaseColorClass(base)}`}
                    >
                      {base}
                    </span>
                  ))}

                  {/* Central Variant Position (Morphed) */}
                  <div className="relative group">
                    <button
                      onClick={onToggleAllele}
                      className={`w-8 h-10 sm:w-9 sm:h-11 flex flex-col items-center justify-center rounded-lg border-2 animate-morph-base cursor-pointer transform hover:scale-110 transition-transform ${getBaseColorClass(
                        alleleState === 'REF' ? flanking.refBase : flanking.altBase,
                        true
                      )}`}
                      title="Click to toggle REF ↔ ALT"
                    >
                      <span className="text-base sm:text-lg font-black leading-none">
                        {alleleState === 'REF' ? flanking.refBase : flanking.altBase}
                      </span>
                      <span className="text-[9px] font-mono opacity-80 mt-0.5">
                        {alleleState}
                      </span>
                    </button>

                    {/* Variant indicator pin */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-dna-cyan flex flex-col items-center">
                      <span>▼</span>
                    </div>
                  </div>

                  {/* Downstream sequence */}
                  {flanking.downstream.split('').map((base, idx) => (
                    <span
                      key={`down-${idx}`}
                      className={`w-6 h-8 sm:w-7 sm:h-9 flex items-center justify-center rounded border ${getBaseColorClass(base)}`}
                    >
                      {base}
                    </span>
                  ))}
                </div>
              </div>

              {/* Watson-Crick Complementary Strand (3' -> 5') */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-start justify-between text-[11px] font-mono text-slate-500 mb-2 gap-2">
                  <span className="min-w-0 leading-relaxed">3' Watson-Crick Base-Pair Complementary Strand</span>
                  <span className="shrink-0">5'</span>
                </div>

                <div className="flex items-center justify-center flex-wrap gap-1 font-mono text-xs sm:text-sm opacity-75">
                  {flanking.complementUpstream.split('').map((base, idx) => (
                    <span
                      key={`comp-up-${idx}`}
                      className={`w-6 h-8 sm:w-7 sm:h-9 flex items-center justify-center rounded border ${getBaseColorClass(base)}`}
                    >
                      {base}
                    </span>
                  ))}

                  {/* Complementary Central Position */}
                  <div
                    className={`w-8 h-10 sm:w-9 sm:h-11 flex flex-col items-center justify-center rounded-lg border-2 font-bold ${getBaseColorClass(
                      alleleState === 'REF' ? flanking.complementRefBase : flanking.complementAltBase,
                      true
                    )}`}
                  >
                    <span className="text-base sm:text-lg leading-none">
                      {alleleState === 'REF' ? flanking.complementRefBase : flanking.complementAltBase}
                    </span>
                    <span className="text-[9px] font-mono opacity-80 mt-0.5">
                      Pair
                    </span>
                  </div>

                  {flanking.complementDownstream.split('').map((base, idx) => (
                    <span
                      key={`comp-down-${idx}`}
                      className={`w-6 h-8 sm:w-7 sm:h-9 flex items-center justify-center rounded border ${getBaseColorClass(base)}`}
                    >
                      {base}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Base Color Legend & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-3 pt-1">
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                <span className="text-[11px] text-slate-500">Color key:</span>
                <span className="flex items-center space-x-1 font-mono text-[11px] text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500 inline-block" />
                  <span>Adenine (A)</span>
                </span>
                <span className="flex items-center space-x-1 font-mono text-[11px] text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 border border-cyan-500 inline-block" />
                  <span>Cytosine (C)</span>
                </span>
                <span className="flex items-center space-x-1 font-mono text-[11px] text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500 inline-block" />
                  <span>Guanine (G)</span>
                </span>
                <span className="flex items-center space-x-1 font-mono text-[11px] text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40 border border-rose-500 inline-block" />
                  <span>Thymine (T)</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoomLevel(2)}
                  className="flex items-center space-x-1 px-3 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Zoom Out to Region</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
