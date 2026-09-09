import React from 'react';
import { VariantData } from '../types/variant';
import { ExternalLink, FileText } from 'lucide-react';

interface FooterProps {
  currentVariant: VariantData;
  onOpenTransparencyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentVariant,
  onOpenTransparencyModal,
}) => {
  return (
    <footer className="w-full border-t border-white/10 bg-obsidian-950/90 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 mt-12 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left branding and citation */}
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2 font-semibold text-white">
            <span>Mutation Microscope</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.05] text-cyan-300">
              v1.0
            </span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed max-w-xl">
            Derived from Google DeepMind's AlphaGenome foundation model benchmarks (Avsec et al., <em>Nature</em> 2026).
            Demonstrating how a single DNA letter change predicts multimodal molecular consequences across chromatin, transcription, and RNA processing.
          </p>
        </div>

        {/* Right action links */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenTransparencyModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Methodology & Limitations</span>
          </button>

          <a
            href={currentVariant.atlasUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
          >
            <span>Open in AlphaGenome Atlas</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://deepmind.google.com/science/alphagenome/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors"
          >
            <span>DeepMind Science</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Assembly & disclaimer footnote */}
      <div className="max-w-7xl mx-auto pt-6 mt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div>
          Genome Assembly: <strong className="text-slate-400 font-mono">GRCh38 / hg38</strong> • Dataset verified against peer-reviewed benchmarks
        </div>
        <div>
          Educational & scientific demonstration tool • Not intended for clinical or diagnostic use
        </div>
      </div>
    </footer>
  );
};
