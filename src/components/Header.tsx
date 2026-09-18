import React from 'react';
import { Microscope, ExternalLink, HelpCircle, Dna, FileCheck2, Github } from 'lucide-react';
import { VariantData } from '../types/variant';

interface HeaderProps {
  currentVariant: VariantData;
  onOpenTransparencyModal: () => void;
  onOpenProvenanceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentVariant,
  onOpenTransparencyModal,
  onOpenProvenanceModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-obsidian-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/30 text-dna-cyan shadow-glow-cyan shrink-0">
            <Microscope className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-dna-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-dna-cyan"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span className="truncate">Mutation Microscope</span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  AlphaGenome
                </span>
              </h1>
            </div>
            <p className="hidden md:block text-xs text-slate-400 font-medium">
              one DNA letter <span className="text-dna-cyan font-mono">→</span> predicted molecular consequences
            </p>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300">
            <Dna className="w-3.5 h-3.5 text-dna-emerald" />
            <span>GRCh38</span>
          </div>

          <a
            href="https://github.com/cyb3rcricket/mutation-microscope"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            title="View source on GitHub"
            aria-label="View source on GitHub"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Source</span>
          </a>

          <button
            onClick={onOpenProvenanceModal}
            className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-300 transition-colors"
            title="Inspect Scientific Data Provenance & Audit Trail"
            aria-label="Data Provenance"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-dna-emerald" />
            <span className="hidden sm:inline">Data Provenance</span>
          </button>

          <button
            onClick={onOpenTransparencyModal}
            className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            title="Scientific Methodology & Transparency Guide"
            aria-label="How It Works"
          >
            <HelpCircle className="w-3.5 h-3.5 text-dna-cyan" />
            <span className="hidden sm:inline">How It Works</span>
          </button>

          <a
            href={currentVariant.atlasUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 text-xs font-medium text-cyan-300 transition-all shadow-glow-cyan"
            title="Open Google DeepMind AlphaGenome Atlas (this URL is an Atlas entry point; it may not load this exact variant)"
          >
            <span className="hidden sm:inline">AlphaGenome Atlas</span>
            <span className="sm:hidden">Atlas</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </header>
  );
};
