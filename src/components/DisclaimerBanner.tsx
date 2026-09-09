import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative border-b border-amber-500/20 bg-amber-950/20 px-4 py-2.5 sm:px-6 text-xs text-amber-200/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="leading-snug">
            <strong className="font-semibold text-amber-300">Scientific Research Demonstration:</strong>{' '}
            AlphaGenome generates computational molecular effect predictions in silico. These findings are for educational and exploratory scientific inquiry,{' '}
            <span className="underline underline-offset-2 font-medium text-amber-200">never for clinical diagnosis, patient triage, or medical treatment decisions</span>.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-amber-500/20 text-amber-300 transition-colors shrink-0"
          aria-label="Dismiss disclaimer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
