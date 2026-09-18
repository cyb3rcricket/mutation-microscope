# Third-Party Notices & Licensing Boundaries

This document outlines the licensing boundaries, terms of use, attributions, and disclaimers governing Mutation Microscope, its dependencies, underlying AI models, and reference biological datasets.

---

## 1. Scope of Repository License

The [MIT License](LICENSE) contained in the root of this repository applies **exclusively** to the original software and source code authored specifically for the Mutation Microscope project (including user interface components, interactive visualization logic, provenance tracking framework, test suites, and data preprocessing scripts).

The MIT License does **not** relicense, supersede, or modify the licenses, terms of service, or restrictions of:
1. Google DeepMind AlphaGenome software, APIs, model weights, or predictions.
2. AlphaGenome Atlas content, metrics, or exploratory web platform data.
3. Authoritative reference genomic assemblies, transcript models, or biological ontologies.
4. Scientific literature and benchmark study datasets.
5. Third-party open-source runtime and build dependencies.

---

## 2. Google DeepMind AlphaGenome

### 2.1 Software & Client Libraries
* **Repository**: [google-deepmind/alphagenome](https://github.com/google-deepmind/alphagenome)
* **Copyright**: Google DeepMind
* **License**: Apache License, Version 2.0 (Apache-2.0)
* **Documentation & Examples**: May be licensed under the Creative Commons Attribution 4.0 International (CC BY 4.0) License.

### 2.2 Model Predictions, API Outputs, and Atlas Materials
* **Provider**: Google DeepMind
* **Service & Portal**: [AlphaGenome](https://deepmind.google.com/science/alphagenome/) / AlphaGenome Atlas
* **Terms of Service**: Governed by the [Google DeepMind AlphaGenome Terms of Service](https://deepmind.google.com/science/alphagenome/).
* **Licensing Boundary**: AlphaGenome model predictions, variant scores (including AlphaGenome Variant Impact / AVI scores, calibrated quantiles, and percentile ranks), epigenomic output tracks, and AlphaGenome Atlas materials are research technologies developed by Google DeepMind. They are **NOT** relicensed under this repository's MIT License.
* **API Usage**: Users querying the live AlphaGenome API must provide their own authenticated API key and comply directly with Google DeepMind's Terms of Service and API usage guidelines.

### 2.3 Scientific Publication Citation
Predictions, benchmarks, and model architectures referenced in this project originate from:
> Avsec, Ž., Latysheva, N., Cheng, J. *et al.* Advancing regulatory variant effect prediction with AlphaGenome. *Nature* **649**, 1206–1218 (2026).  
> DOI: [10.1038/s41586-025-10014-0](https://doi.org/10.1038/s41586-025-10014-0)

---

## 3. Authoritative Reference Genomic & Biological Data

Mutation Microscope incorporates coordinates, annotations, and metadata derived from canonical public scientific databases. These materials retain their original source terms and are **not** relicensed by this repository:

| Resource | Source / Maintainer | Description & Terms |
| :--- | :--- | :--- |
| **GRCh38 / hg38** | Genome Reference Consortium (GRC) / NCBI | Canonical human reference genome assembly. Public scientific domain / standard NCBI terms. |
| **GENCODE v46 / MANE Select** | GENCODE / EMBL-EBI / Wellcome Sanger / NCBI | Gene definitions, transcript coordinates, exon structures, and canonical splice junctions. Open access under GENCODE terms. |
| **Benchmark Publications** | *Nature* 2026 (Avsec et al., DOI: 10.1038/s41586-025-10014-0) | Gold-standard benchmark variant loci, empirical validations, and published comparative baselines. Subject to publisher copyright and fair academic use. |
| **Biological Ontologies** | UBERON (Anatomy), CL (Cell Ontology), EFO (Experimental Factor Ontology) | Standard biological ontology terms used for biosample, tissue, and cell-type classification. Open access under CC BY / OBO Foundry terms. |

---

## 4. Third-Party Open-Source Software Components

Mutation Microscope utilizes open-source libraries to power its web application and dataset compilation pipeline. Each component remains subject to its respective license:

### Runtime & Web Application
* **React** (`react`, `react-dom`)
  * License: MIT
  * Website: https://react.dev
* **Vite** (`vite`)
  * License: MIT
  * Website: https://vite.dev
* **TailwindCSS** (`tailwindcss`)
  * License: MIT
  * Website: https://tailwindcss.com
* **Lucide React** (`lucide-react`)
  * License: ISC
  * Website: https://lucide.dev
* **clsx** (`clsx`)
  * License: MIT
  * Website: https://github.com/lukeed/clsx
* **tailwind-merge** (`tailwind-merge`)
  * License: MIT
  * Website: https://github.com/dcastil/tailwind-merge

### Testing & Development
* **Vitest** (`vitest`)
  * License: MIT
  * Website: https://vitest.dev

### Data Pipeline & Python Environment
* **pandas** (`pandas`)
  * License: BSD 3-Clause License
  * Website: https://pandas.pydata.org

---

## 5. Non-Diagnostic Scientific & Medical Disclaimer

Mutation Microscope provides *in silico* molecular predictions and epigenomic track visualizations computed by AlphaGenome solely for educational exploration, scientific visualization, and research hypothesis generation.

It is **never** intended, validated, or certified for clinical diagnosis, patient triage, genetic counseling, or medical treatment decisions. None of the scoring metrics, visual features, or predicted epigenomic profiles should be interpreted as medical advice.
