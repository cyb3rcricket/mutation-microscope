import React, { useState } from 'react';
import { VariantData, ModalityEffect } from '../types/variant';
import {
  Activity,
  GitFork,
  Sliders,
  RefreshCw,
} from 'lucide-react';

interface RefAltTrackViewerProps {
  variant: VariantData;
  activeModality: ModalityEffect;
  currentAllele: 'REF' | 'ALT';
  onToggleAllele: () => void;
}

export const RefAltTrackViewer: React.FC<RefAltTrackViewerProps> = ({
  variant,
  activeModality,
  currentAllele,
  onToggleAllele,
}) => {
  const [trackMode, setTrackMode] = useState<'OVERLAY' | 'REF' | 'ALT' | 'DELTA'>('OVERLAY');
  const [viewTab, setViewTab] = useState<'track' | 'sashimi'>(
    variant.sashimi ? 'sashimi' : 'track'
  );
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { tracks } = activeModality;
  const positions = tracks.positions;
  const refValues = tracks.refValues;
  const altValues = tracks.altValues;
  const deltaValues = tracks.deltaValues;

  // Track coordinates and SVG scaling
  const maxVal = Math.max(...refValues, ...altValues, Math.max(...deltaValues.map(Math.abs)), 1);

  const width = 800;
  const height = 220;
  const paddingX = 50;
  const paddingY = 30;

  const getX = (idx: number) => {
    if (positions.length <= 1) return paddingX;
    return paddingX + (idx / (positions.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    if (trackMode === 'DELTA') {
      // Zero line centered vertically
      const zeroY = height / 2;
      const maxDelta = Math.max(...deltaValues.map(Math.abs), 1);
      return zeroY - (val / maxDelta) * (height / 2 - paddingY);
    }
    // Normal 0-to-max scaling
    return height - paddingY - (val / maxVal) * (height - paddingY * 2);
  };

  // Generate SVG path strings
  const generatePath = (vals: number[]) => {
    return vals.reduce((acc, val, idx) => {
      const x = getX(idx);
      const y = getY(val);
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }, '');
  };

  const generateArea = (vals: number[]) => {
    const baselineY = trackMode === 'DELTA' ? height / 2 : height - paddingY;
    const linePath = generatePath(vals);
    const lastX = getX(vals.length - 1);
    const firstX = getX(0);
    return `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  };

  const refPath = generatePath(refValues);
  const altPath = generatePath(altValues);
  const deltaPath = generatePath(deltaValues);

  const refArea = generateArea(refValues);
  const altArea = generateArea(altValues);
  const deltaArea = generateArea(deltaValues);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Header bar: Title, View Switcher, and Allele / Overlay Modes */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-5 py-3.5 border-b border-white/10 bg-obsidian-900/80 gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-dna-emerald">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              <span>Genome Signal Tracks & Sashimi Viewer</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-cyan-300">
                {activeModality.name}
              </span>
            </h3>
          </div>
        </div>

        {/* View Switcher: Continuous Track vs Sashimi Plot (if available) */}
        <div className="flex items-center space-x-2">
          {variant.sashimi && (
            <div className="flex items-center bg-obsidian-950 rounded-xl p-1 border border-white/10 text-xs">
              <button
                onClick={() => setViewTab('sashimi')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                  viewTab === 'sashimi'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Sashimi Junctions</span>
              </button>
              <button
                onClick={() => setViewTab('track')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                  viewTab === 'track'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Coverage Tracks</span>
              </button>
            </div>
          )}

          {/* Allele Toggle for Sashimi mode */}
          {viewTab === 'sashimi' && (
            <button
              onClick={onToggleAllele}
              className="flex items-center space-x-1.5 px-3 py-1 bg-obsidian-950 hover:bg-obsidian-800 rounded-xl border border-white/10 text-xs font-mono transition-all text-slate-300"
              title="Toggle REF vs ALT Allele Arc Visualization"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Allele: <strong className={currentAllele === 'REF' ? 'text-blue-400' : 'text-rose-400'}>{currentAllele}</strong></span>
            </button>
          )}

          {/* Track Mode Selector: REF, ALT, OVERLAY, DELTA */}
          {viewTab === 'track' && (
            <div className="flex items-center bg-obsidian-950 rounded-xl p-1 border border-white/10 text-xs">
              <button
                onClick={() => setTrackMode('OVERLAY')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  trackMode === 'OVERLAY'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Overlay
              </button>
              <button
                onClick={() => setTrackMode('REF')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  trackMode === 'REF'
                    ? 'bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                REF
              </button>
              <button
                onClick={() => setTrackMode('ALT')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  trackMode === 'ALT'
                    ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ALT
              </button>
              <button
                onClick={() => setTrackMode('DELTA')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  trackMode === 'DELTA'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Δ (ALT - REF)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Track Display Area */}
      <div className="p-6 bg-gradient-to-b from-obsidian-900/40 to-obsidian-950/80">
        {/* CONTINUOUS SIGNAL TRACK VIEW */}
        {viewTab === 'track' && (
          <div className="space-y-4">
            {/* SVG Track Container */}
            <div className="relative w-full overflow-x-auto bg-obsidian-950/80 rounded-xl border border-white/5 p-2">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto min-w-[600px] overflow-visible"
              >
                {/* Grid horizontal lines */}
                <line
                  x1={paddingX}
                  y1={height - paddingY}
                  x2={width - paddingX}
                  y2={height - paddingY}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="1"
                />
                {trackMode === 'DELTA' && (
                  <line
                    x1={paddingX}
                    y1={height / 2}
                    x2={width - paddingX}
                    y2={height / 2}
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Shaded Areas and Curves */}
                {(trackMode === 'OVERLAY' || trackMode === 'REF') && (
                  <>
                    <path
                      d={refArea}
                      fill="rgba(56, 189, 248, 0.15)"
                      className="transition-all duration-300"
                    />
                    <path
                      d={refPath}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      className="transition-all duration-300"
                    />
                  </>
                )}

                {(trackMode === 'OVERLAY' || trackMode === 'ALT') && (
                  <>
                    <path
                      d={altArea}
                      fill="rgba(244, 63, 94, 0.18)"
                      className="transition-all duration-300"
                    />
                    <path
                      d={altPath}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      className="transition-all duration-300"
                    />
                  </>
                )}

                {trackMode === 'DELTA' && (
                  <>
                    <path
                      d={deltaArea}
                      fill="rgba(251, 191, 36, 0.15)"
                      className="transition-all duration-300"
                    />
                    <path
                      d={deltaPath}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2.5"
                      className="transition-all duration-300"
                    />
                  </>
                )}

                {/* Coordinate tick marks on x-axis */}
                {positions.map((pos, idx) => {
                  const x = getX(idx);
                  const isVariantPos = Math.abs(pos - variant.pos) < 50;
                  return (
                    <g key={pos}>
                      <line
                        x1={x}
                        y1={height - paddingY}
                        x2={x}
                        y2={height - paddingY + 6}
                        stroke={isVariantPos ? '#22d3ee' : 'rgba(255, 255, 255, 0.2)'}
                        strokeWidth={isVariantPos ? '2' : '1'}
                      />
                      <text
                        x={x}
                        y={height - paddingY + 20}
                        textAnchor="middle"
                        className={`text-[10px] font-mono ${
                          isVariantPos ? 'fill-cyan-300 font-bold' : 'fill-slate-500'
                        }`}
                      >
                        {isVariantPos ? '★ Variant' : `${(pos % 1000000).toLocaleString()}`}
                      </text>
                    </g>
                  );
                })}

                {/* Hover crosshair and data point inspect */}
                {positions.map((_, idx) => {
                  const x = getX(idx);
                  const isHovered = hoverIndex === idx;

                  return (
                    <g
                      key={`hit-${idx}`}
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseLeave={() => setHoverIndex(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x={x - (width - paddingX * 2) / (positions.length * 2)}
                        y={paddingY}
                        width={(width - paddingX * 2) / positions.length}
                        height={height - paddingY * 2}
                        fill="transparent"
                      />
                      {isHovered && (
                        <>
                          <line
                            x1={x}
                            y1={paddingY}
                            x2={x}
                            y2={height - paddingY}
                            stroke="rgba(255, 255, 255, 0.4)"
                            strokeDasharray="2 2"
                          />
                          {(trackMode === 'OVERLAY' || trackMode === 'REF') && (
                            <circle
                              cx={x}
                              cy={getY(refValues[idx])}
                              r="4.5"
                              fill="#38bdf8"
                              stroke="#070a0f"
                              strokeWidth="2"
                            />
                          )}
                          {(trackMode === 'OVERLAY' || trackMode === 'ALT') && (
                            <circle
                              cx={x}
                              cy={getY(altValues[idx])}
                              r="4.5"
                              fill="#f43f5e"
                              stroke="#070a0f"
                              strokeWidth="2"
                            />
                          )}
                          {trackMode === 'DELTA' && (
                            <circle
                              cx={x}
                              cy={getY(deltaValues[idx])}
                              r="4.5"
                              fill="#fbbf24"
                              stroke="#070a0f"
                              strokeWidth="2"
                            />
                          )}
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Hover Tooltip readout or defaults */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 bg-obsidian-950/60 rounded-xl border border-white/5 text-xs">
              {hoverIndex !== null ? (
                <div className="flex items-center space-x-4 font-mono">
                  <span className="text-slate-400">
                    Pos: <strong className="text-white">{positions[hoverIndex].toLocaleString()}</strong>
                  </span>
                  <span className="text-blue-400">
                    REF: <strong>{refValues[hoverIndex].toFixed(2)}</strong>
                  </span>
                  <span className="text-rose-400">
                    ALT: <strong>{altValues[hoverIndex].toFixed(2)}</strong>
                  </span>
                  <span className="text-amber-400">
                    Δ (ALT-REF): <strong>{deltaValues[hoverIndex] > 0 ? `+${deltaValues[hoverIndex].toFixed(2)}` : deltaValues[hoverIndex].toFixed(2)}</strong>
                  </span>
                </div>
              ) : (
                <div className="text-slate-400">
                  Hover over coordinate positions to inspect exact numerical coverage and log-fold differences.
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center space-x-3 text-[11px] font-mono mt-2 sm:mt-0">
                <span className="flex items-center space-x-1.5 text-blue-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span>REF ({variant.ref})</span>
                </span>
                <span className="flex items-center space-x-1.5 text-rose-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>ALT ({variant.alt})</span>
                </span>
                {trackMode === 'DELTA' && (
                  <span className="flex items-center space-x-1.5 text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Δ Difference</span>
                  </span>
                )}
              </div>
            </div>

            {/* Qualitative Assay Signal Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-blue-950/20 border border-blue-500/20 rounded-xl p-3">
                <span className="font-semibold text-blue-300 font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Reference Allele ({variant.ref}) Profile
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {activeModality.refSignalDesc}
                </p>
              </div>

              <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3">
                <span className="font-semibold text-rose-300 font-mono text-[11px] uppercase tracking-wider block mb-1">
                  Alternate Allele ({variant.alt}) Profile
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {activeModality.altSignalDesc}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SPLICING SASHIMI PLOT VIEW */}
        {viewTab === 'sashimi' && variant.sashimi && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong>Sashimi Arc Analysis:</strong> Arcs illustrate predicted RNA-seq junction reads connecting donor and acceptor splice boundaries. A shift in arc geometry reveals cryptic splice site activation or exon skipping.
            </div>

            {/* SVG Sashimi Graphic */}
            <div className="relative w-full overflow-x-auto bg-obsidian-950/90 rounded-2xl border border-white/10 p-5 shadow-inner">
              <svg viewBox="0 0 800 240" className="w-full h-auto min-w-[700px] overflow-visible">
                {/* Horizontal Baseline Intron Track */}
                <line
                  x1="50"
                  y1="190"
                  x2="750"
                  y2="190"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2"
                />

                {/* Exon Blocks */}
                {variant.sashimi.exons.map((exon, idx) => {
                  const totalExons = variant.sashimi!.exons.length;
                  const blockWidth = 90;
                  const spacing = (700 - totalExons * blockWidth) / (totalExons - 1);
                  const x = 50 + idx * (blockWidth + spacing);
                  const y = 175;

                  return (
                    <g key={exon.id}>
                      <rect
                        x={x}
                        y={y}
                        width={blockWidth}
                        height="30"
                        rx="6"
                        className={`transition-all duration-200 ${
                          exon.isSkipped
                            ? 'fill-rose-950/70 stroke-rose-500 stroke-2'
                            : exon.isExtended
                            ? 'fill-amber-950/70 stroke-amber-500 stroke-2'
                            : 'fill-cyan-950/70 stroke-cyan-500/70 stroke-1'
                        }`}
                      />
                      <text
                        x={x + blockWidth / 2}
                        y={y + 19}
                        textAnchor="middle"
                        className="text-[11px] font-mono font-bold fill-white select-none"
                      >
                        {exon.name}
                      </text>
                      <text
                        x={x + blockWidth / 2}
                        y={y + 44}
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-slate-500 select-none"
                      >
                        {exon.start.toLocaleString()}
                      </text>
                    </g>
                  );
                })}

                {/* Junction Splice Arcs */}
                {variant.sashimi.junctions.map((junc) => {
                  const fromExonIdx = variant.sashimi!.exons.findIndex(
                    (e) => e.id === junc.fromExon
                  );
                  const toExonIdx = variant.sashimi!.exons.findIndex(
                    (e) => e.id === junc.toExon
                  );

                  const totalExons = variant.sashimi!.exons.length;
                  const blockWidth = 90;
                  const spacing = (700 - totalExons * blockWidth) / (totalExons - 1);

                  const startX = 50 + fromExonIdx * (blockWidth + spacing) + blockWidth;
                  const endX = 50 + toExonIdx * (blockWidth + spacing);
                  const midX = (startX + endX) / 2;

                  // Arc height based on span
                  const span = Math.abs(toExonIdx - fromExonIdx);
                  const arcHeight = span > 1 ? 120 : 75;
                  const apexY = 175 - arcHeight;

                  const isRefActive = junc.refReads > 0;
                  const isAltActive = junc.altReads > 0;

                  return (
                    <g key={junc.id} className="transition-all duration-300">
                      {/* Parabolic Bezier Curve Arc */}
                      <path
                        d={`M ${startX} 175 Q ${midX} ${apexY} ${endX} 175`}
                        fill="none"
                        stroke={
                          junc.isCryptic
                            ? '#f43f5e'
                            : junc.isSkipped
                            ? '#f43f5e'
                            : '#38bdf8'
                        }
                        strokeWidth={
                          junc.isCryptic || junc.isSkipped ? '3.5' : '2.5'
                        }
                        strokeDasharray={
                          junc.altReads === 0 ? '5 3' : 'none'
                        }
                        opacity={
                          (currentAllele === 'REF' && isRefActive) ||
                          (currentAllele === 'ALT' && isAltActive)
                            ? 1
                            : 0.25
                        }
                      />

                      {/* Junction Read Count Badge */}
                      <g transform={`translate(${midX}, ${apexY - 10})`}>
                        <rect
                          x="-55"
                          y="-14"
                          width="110"
                          height="24"
                          rx="12"
                          className={`fill-obsidian-850 stroke-1 ${
                            junc.isCryptic || junc.isSkipped
                              ? 'stroke-rose-500/80 shadow-glow-rose'
                              : 'stroke-cyan-500/80 shadow-glow-cyan'
                          }`}
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          className="text-[10px] font-mono font-bold fill-white select-none"
                        >
                          {currentAllele === 'REF'
                            ? `${junc.refReads} reads (REF)`
                            : `${junc.altReads} reads (ALT)`}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Junction Details Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sashimi Junction Quantification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {variant.sashimi.junctions.map((j) => (
                  <div
                    key={j.id}
                    className={`p-3 rounded-xl border ${
                      j.isCryptic || j.isSkipped
                        ? 'bg-rose-950/20 border-rose-500/30'
                        : 'bg-blue-950/20 border-blue-500/30'
                    }`}
                  >
                    <div className="font-semibold text-white mb-1">{j.label}</div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-300">
                      <span>REF: <strong className="text-blue-300">{j.refReads} reads</strong></span>
                      <span>ALT: <strong className="text-rose-300">{j.altReads} reads</strong></span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Coordinates: {j.startCoord.toLocaleString()} → {j.endCoord.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
