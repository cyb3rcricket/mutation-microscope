# Mutation Microscope 🔬

**Interactive Multi-Scale Genomic Observatory for AlphaGenome Variant Effect Predictions**

*One DNA letter → predicted molecular consequences*

[![DeepMind AlphaGenome](https://img.shields.io/badge/AlphaGenome-DeepMind-cyan.svg)](https://alphagenome.deepmind.google/)
[![Genome Assembly](https://img.shields.io/badge/Assembly-GRCh38%20%2F%20hg38-emerald.svg)](https://www.ncbi.nlm.nih.gov/grc/human)
[![Nature 2026](https://img.shields.io/badge/Nature-10.1038%2Fs41586--025--10014--0-blue.svg)](https://doi.org/10.1038/s41586-025-10014-0)
[![License Notice](https://img.shields.io/badge/License-AlphaGenome%20Terms-amber.svg)](.licenses/alphagenome_single_variant_analysis_LICENSE.txt)

---

## Overview

**Mutation Microscope** is an interactive educational and scientific demonstration application designed to bridge the conceptual gap between single-nucleotide DNA variants and their multimodal molecular mechanisms.

Built upon **Google DeepMind's AlphaGenome foundation model** (Avsec et al., *Nature* 2026), the application demonstrates how changing a single nucleotide in the human genome alters gene transcription (RNA-seq), RNA splicing junctions (Sashimi arcs), chromatin accessibility (DNase/ATAC), transcription factor binding (ChIP-TF), and polyadenylation cleavage (PAS).

> [!IMPORTANT]
> **Scientific Research & Educational Tool Only**: Mutation Microscope provides *in silico* molecular predictions computed by AlphaGenome for educational exploration and research hypothesis generation. It is **never** intended for clinical diagnosis, patient triage, or medical treatment decisions.

---

## 3-Level Multi-Scale Microscope

The application features a 3-level interactive zoom navigation:

```
Level 1: Chromosome Ideogram
  ├── Interactive human chromosome scale (0 Mb to pter/qter)
  ├── p-arm & q-arm cytoband shading & centromeric notch
  └── Pulsing variant pin with genomic coordinate callouts

Level 2: Genomic Region & Gene Body
  ├── Gene architecture with coding & non-coding exons
  ├── Transcription directionality arrows (sense '+' or antisense '-')
  └── Regulatory landmarks (promoters, enhancers, polyA signals, splice junctions)

Level 3: Nucleotide Sequence Inspector
  ├── Exact GRCh38 flanking sequence
  ├── Interactive 1-click REF ↔ ALT nucleotide switcher
  ├── Color-coded bases: A (Emerald), C (Cyan), G (Amber), T (Rose)
  ├── Animated nucleotide morphing transition
  └── Watson-Crick complementary base-pairing strand (3' → 5')
```

---

## 7 Curated Benchmark Human Variants

Mutation Microscope ships with an audited dataset of curated benchmark human variants combining published AlphaGenome benchmarks, DeepMind Science Skills, authoritative GRCh38 genomic coordinates, and explicitly labeled educational controls:

| # | Variant & Gene | Mechanism Category | Primary Assay / Metric | Disease / Biological Association | Evidence / Reference Source |
|---|----------------|--------------------|------------------------|----------------------------------|-----------------------------|
| 1 | **`APOA1`**<br>`chr11:116837649:T>G` | **Promoter / Expression Disruption** | RNA-seq (Heart LV raw -0.99, quant 0.99998; Liver raw +0.14) | Hypoalphalipoproteinemia (HDL Deficiency) | AlphaGenome Science Skill Golden Example & Nature 2026 |
| 2 | **`COL6A2`**<br>`chr21:46126238:G>C` | **Splice Donor Loss & Exon Extension** | Splice Sites (Canonical loss >14; Cryptic gain +14 at +60bp) | Ullrich Congenital Muscular Dystrophy | AlphaGenome Science Skill & Nature 2026 |
| 3 | **`HBA2`**<br>`chr16:173692:A>G` | **Polyadenylation Signal Disruption** | Splice Junctions (+1.07 raw in K562 erythroid; PolyA -2.45) | Hemoglobin H Disease / Alpha-Thalassemia | AlphaGenome Science Skill Golden Example |
| 4 | **`TERT`**<br>`chr5:1295113:G>A` (C228T) | **De Novo TF Binding Site Creation** | ChIP-TF (ETS/GABP gain +1.52; ATAC gain +1.18) | Urothelial Carcinoma / Glioblastoma / Melanoma | Nature 2026 Regulatory Landmark (Avsec et al., 2026) |
| 5 | **`SMN2`**<br>`chr5:70951946:C>T` | **Exon Skipping Disruption** | Splice Junctions (6→8 skip arc raw +2.84, quant 0.9998) | Spinal Muscular Atrophy (SMA) | Nature 2026 Splicing Benchmark (Avsec et al., 2026) |
| 6 | **`BCL11A`**<br>`chr2:60495255:C>T` | **Distal Lineage Enhancer Regulation** | ChIP-TF (Erythroid GATA1 loss -1.41; Brain neutral) | Fetal Hemoglobin (HbF) Persistence | Nature 2026 Enhancer Benchmark (Avsec et al., 2026) |
| 7 | **`CFTR`**<br>`chr7:117642567:A>G` | **Benign Synonymous Control** | Flat delta tracks across all modalities (Scorer 2.1 percentile) | Negative Control (High Model Specificity) | GENCODE v46 / MANE Select Negative Control Baseline |

---

## Six Evidence Classes Scientific Provenance Framework

Mutation Microscope classifies scientific data by how directly it can be traced to its original source. Every numerical value, coordinate, sequence, and functional prediction is categorized into one of six evidence classes (see [docs/PROVENANCE.md](docs/PROVENANCE.md)):

1. **`live_api` — Direct AlphaGenome API Result**: Returned directly from an AlphaGenome API request (`dna_model.score_variant`) with programmatic retrieval metadata (source, scorer, biosample, retrievedAt).
2. **`atlas` — AlphaGenome Atlas Result**: Returned directly from the AlphaGenome Atlas variant portal, such as confirmed Atlas-specific variant impact scores (AVI).
3. **`published_exact` — Published Exact Reference**: Exact coordinates, sequences, or values explicitly reported in a cited publication, official AlphaGenome example, or authoritative genomic reference (e.g. GRCh38 coordinates, MANE Select transcript models, ClinVar).
4. **`derived` — Derived / Transformed Data**: Calculated or transformed from traceable source values, such as ALT − REF deltas, quantile-to-percentile conversions, normalization, or deterministic downsampling (with documented transformation).
5. **`reconstructed` — Reconstructed from Publication**: Approximated or recreated from published figures, plots, screenshots, or descriptions that do not provide exact displayed values directly. Reconstructed data may represent genuine published results, but displayed values are not claimed to be exact source values.
6. **`illustrative` — Illustrative Educational Data**: Synthetic or intentionally constructed data used to explain a concept, demonstrate interface behavior, or provide educational negative controls (e.g. flat zero-delta baseline tracks). Never presented as direct model output.

> [!NOTE]
> **Important Distinction:** `reconstructed` and `illustrative` are distinct classes. Reconstructed data approximates published results, whereas illustrative data is intentionally synthetic. If a value cannot be demonstrated to be exact, it is not labeled as exact.

---

## Key Visual & Analytical Features

1. **AlphaGenome Predicted Molecular Impact & Atlas AVI Panel**:
   - Semi-circle impact gauge with smooth progress arc.
   - Strictly separates Atlas AVI composite scores from assay-specific calibrated Scorer Quantiles.
   - Empirical percentile ranks computed against ~300,000 common human polymorphisms (gnomAD v3, MAF > 0.01).
   - Conservative scientific tiering: *Higher predicted molecular impact*, *Moderate*, *Lower*, and *Neutral / Baseline*.

2. **Multimodal Molecular Assays Explorer**:
   - Interactive cards for gene expression (RNA-seq), splice sites, splice junctions, chromatin accessibility (DNase/ATAC), ChIP-TF binding, and polyadenylation (PAS).
   - Real raw scores (e.g. `log2 FC`, `max |ALT - REF|`) and quantile scores saturating at ±0.99999.

3. **Genome Signal Tracks & Sashimi Viewer**:
   - Toggle between `OVERLAY`, `REFERENCE (REF)`, `ALTERNATE (ALT)`, and `DELTA (ALT - REF)` modes.
   - Scrub and hover crosshairs reporting numerical values at exact coordinates.
   - Track resolution badges indicating display vs original point counts and downsampling method.
   - Splicing Sashimi plot with parabolic junction arcs, predicted splice junction signal badges (e.g. canonical 342 signal vs cryptic 330 signal), and visual highlighting of skipped exons or exon extensions.

4. **In Silico Mutagenesis (ISM) Matrix**:
   - 4-nucleotide substitution matrix (A, C, G, T) across regulatory motifs (such as `CCGGAA` ETS in TERT, `AATAAA` in HBA2, and core promoter in APOA1).
   - Visual heatmap explaining why the specific nucleotide alteration causes severe perturbation compared to alternative substitutions.
   - Explicit provenance metadata displaying verified benchmark sources.

5. **Cross-Biosample & Tissue Specificity Explorer**:
   - Compares predicted impacts across human tissues and cell lineages (e.g. Heart Left Ventricle vs Liver vs Whole Blood vs K562 Erythroblasts vs Brain).
   - Ontological references with one-click copyable CURIEs (`UBERON:0002083`, `UBERON:0001114`, `EFO:0002067`).
   - Distinguishes between **Top Discovery Hits** (unexpected high regulatory sensitivity) and **Disease Target Tissues**.

6. **Plain-English 3-Step Causality Cascade**:
   - Step 1: Sequence Alteration
   - Step 2: Molecular Consequence
   - Step 3: Biological Relevance

7. **In-App Scientific Data Provenance Modal**:
   - Dedicated modal accessible via the header ("Data Provenance") detailing the exact provenance records, assembly, downsampling details, and dataset generation metadata.

8. **Scientific Transparency & Methodology Modal**:
   - Explains AlphaGenome's 1Mb transformer receptive window, joint multitask predictions, and scoring mathematics.
   - Details recognized *in silico* limitations (e.g. ultra-long-range chromatin loops >1Mb, specialized RNA secondary structures like RNU4ATAC).

---

## Quick Start & Installation

### Prerequisites
- **Node.js** v18+ (tested with Node v25.2.1 and npm 11.6.2)
- **Python** 3.9+ or `uv` (optional, for running the dataset generation pipeline)

### Setup
```bash
# Clone or navigate to the repository
cd "/Volumes/Backup Plus/GitHub/mutation-microscope"

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Data Generation Pipeline (`scripts/generate_dataset.py`)

The application comes pre-packaged with verified dataset in `src/data/variants.json`. To re-verify or query the live AlphaGenome API using your own API key:

```bash
# 1. Verify and compile the benchmark dataset (offline mode):
python3 scripts/generate_dataset.py --verify

# 2. Query live AlphaGenome API (requires ALPHAGENOME_API_KEY in environment or ~/.env):
export ALPHAGENOME_API_KEY="your-api-key-here"
uv run scripts/generate_dataset.py --fetch-live
```

> [!NOTE]
> Never commit your `ALPHAGENOME_API_KEY` to git or public repositories. Register for an official API key at [deepmind.google.com/science/alphagenome](https://deepmind.google.com/science/alphagenome/).

---

## Tech Stack & Architecture

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 5](https://vitejs.dev/)
- **Styling**: [TailwindCSS 3](https://tailwindcss.com/) with custom dark obsidian observatory theme (`#05070B`, `#070A0F`, `#0B0F17`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Background**: High-performance HTML5 Canvas particle constellation
- **Accessibility**: Respects `prefers-reduced-motion` and keyboard navigation (← / → arrow keys to switch variants)

---

## Citation & References

If using this demonstration or AlphaGenome predictions, please cite the primary benchmark paper:

```bibtex
@article{Avsec2026,
  author    = {Avsec, {\v{Z}}iga and Latysheva, Natasha and Cheng, Jun and Novati, Guido and Taylor, Kyle R. and Ward, Tom and Bycroft, Clare and Nicolaisen, Lauren and Arvaniti, Eirini and Pan, Joshua and Thomas, Raina and Dutordoir, Vincent and Perino, Matteo and De, Soham and Karollus, Alexander and Gayoso, Adam and Sargeant, Toby and Mottram, Anne and Wong, Lai Hong and Drot{\'a}r, Pavol and Kosiorek, Adam and Senior, Andrew and Tanburn, Richard and Applebaum, Taylor and Basu, Souradeep and Hassabis, Demis and Kohli, Pushmeet},
  title     = {Advancing regulatory variant effect prediction with {AlphaGenome}},
  journal   = {Nature},
  volume    = {649},
  number    = {8099},
  pages     = {1206--1218},
  year      = {2026},
  doi       = {10.1038/s41586-025-10014-0},
  publisher = {Nature Publishing Group UK London}
}
```

---

## Scientific Provenance

Mutation Microscope distinguishes between direct AlphaGenome results, Atlas data, exact published values, derived data, reconstructed visualizations, and explicitly illustrative educational data.

These evidence classes are used throughout the dataset and provenance UI so that reconstructed or synthetic values are not presented as direct model output.

See [`docs/PROVENANCE.md`](docs/PROVENANCE.md) for the complete classification rules.

---

## License & Terms of Service

AlphaGenome and the AlphaGenome Atlas are trademarks and research technologies of Google DeepMind. See [.licenses/alphagenome_single_variant_analysis_LICENSE.txt](.licenses/alphagenome_single_variant_analysis_LICENSE.txt) for license terms.
