import React, { useState, useEffect } from 'react';
import { VariantData } from '../types/variant';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  ShieldAlert,
  Activity,
  GitFork,
  Radio,
} from 'lucide-react';

interface VariantSelectorProps {
  variants: VariantData[];
  selectedVariant: VariantData;
  onSelectVariant: (variant: VariantData) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Mechanisms' },
    { id: 'expression', label: 'Promoter & Expression' },
    { id: 'splicing', label: 'Alternative Splicing' },
    { id: 'tf', label: 'TF Binding & Enhancers' },
    { id: 'polya', label: 'Polyadenylation' },
    { id: 'control', label: 'Negative Controls' },
  ];

  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      v.gene.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.variant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'expression') return v.category.includes('Promoter');
    if (selectedCategory === 'splicing') return v.category.includes('Splice') || v.category.includes('Skipping');
    if (selectedCategory === 'tf') return v.category.includes('TF') || v.category.includes('Enhancer');
    if (selectedCategory === 'polya') return v.category.includes('Polyadenylation');
    if (selectedCategory === 'control') return v.category.includes('Control');

    return true;
  });

  const currentIndex = variants.findIndex((v) => v.id === selectedVariant.id);

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + variants.length) % variants.length;
    onSelectVariant(variants[nextIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % variants.length;
    onSelectVariant(variants[nextIdx]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, variants]);

  const getCategoryIcon = (category: string) => {
    if (category.includes('Splice') || category.includes('Skipping')) {
      return <GitFork className="w-3.5 h-3.5 text-dna-cyan" />;
    }
    if (category.includes('Promoter') || category.includes('Expression')) {
      return <Activity className="w-3.5 h-3.5 text-dna-emerald" />;
    }
    if (category.includes('TF') || category.includes('Enhancer')) {
      return <Sparkles className="w-3.5 h-3.5 text-dna-amber" />;
    }
    if (category.includes('Polyadenylation')) {
      return <Radio className="w-3.5 h-3.5 text-dna-violet" />;
    }
    return <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <section className="w-full bg-obsidian-900/60 border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top bar: Counter, Nav arrows, Search & Category filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Variant Prev/Next Navigation */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Variant <strong className="text-white">{currentIndex + 1}</strong> of {variants.length}
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Previous Variant (Keyboard: Left Arrow)"
                aria-label="Previous Variant"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-colors"
                title="Next Variant (Keyboard: Right Arrow)"
                aria-label="Next Variant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <span className="hidden sm:inline-block text-[11px] text-slate-500 font-mono">
              Use ← → keys to switch
            </span>
          </div>

          {/* Search input and category filter */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gene, disease, locus..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-obsidian-950/80 border border-white/10 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category selector pills dropdown or scroll */}
            <div className="hidden xl:flex items-center space-x-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                    selectedCategory === c.id
                      ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300 font-medium'
                      : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Variant Cards / Badges Carousel */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {filteredVariants.map((v) => {
            const isSelected = v.id === selectedVariant.id;
            const isNeutral = v.avi.impactTier === 'Neutral / Baseline';

            return (
              <button
                key={v.id}
                onClick={() => onSelectVariant(v)}
                className={`flex-shrink-0 text-left px-3.5 py-2.5 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? 'bg-obsidian-800 border-cyan-500/50 shadow-glow-cyan'
                    : 'bg-obsidian-850/60 border-white/10 hover:border-white/20 hover:bg-obsidian-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center space-x-1.5">
                    {getCategoryIcon(v.category)}
                    <span className="font-bold text-xs text-white tracking-wide">{v.gene}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isNeutral
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {isNeutral ? 'Neutral' : `${v.avi.percentileRank.toFixed(2)}%`}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 truncate max-w-[190px]">
                  {v.variant}
                </div>

                <div className="text-[10px] text-slate-400 truncate max-w-[190px] mt-0.5">
                  {v.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
