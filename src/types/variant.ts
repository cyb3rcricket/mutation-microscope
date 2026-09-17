export type ImpactTier =
  | 'Higher predicted molecular impact'
  | 'Moderate'
  | 'Lower'
  | 'Neutral / Baseline';

export type ModalityCategory =
  | 'expression'
  | 'splicing'
  | 'accessibility'
  | 'tf_binding'
  | 'polyadenylation'
  | 'control';

export type ProvenanceSourceType =
  | 'AlphaGenome API'
  | 'AlphaGenome Atlas'
  | 'AlphaGenome Nature Paper (Avsec et al., 2026)'
  | 'AlphaGenome Skill Golden Example'
  | 'Authoritative Genomic Reference (GRCh38 / GENCODE v46)'
  | 'Derived / Transformed Data'
  | 'Illustrative Educational Data';

export interface ProvenanceRecord {
  field?: string;
  sourceType: ProvenanceSourceType;
  source: string;
  scorer?: string;
  biosample?: string;
  assembly?: string;
  retrievedAt?: string;
  notes?: string;
  isIllustrative?: boolean;
}

export interface TrackProvenance {
  sourceType: ProvenanceSourceType;
  source: string;
  scorer?: string;
  biosample?: string;
  originalPointCount?: number;
  displayPointCount?: number;
  transformation?: string;
  retrievedAt?: string;
  isIllustrative: boolean;
  notes?: string;
}

export interface FlankingSequence {
  upstream: string;
  refBase: string;
  altBase: string;
  downstream: string;
  complementUpstream: string;
  complementRefBase: string;
  complementAltBase: string;
  complementDownstream: string;
}

export interface ExonAnnotation {
  id: string;
  exonNumber: number;
  start: number;
  end: number;
  isCoding: boolean;
  isAffected?: boolean;
  description?: string;
}

export interface RegulatoryRegion {
  id: string;
  name: string;
  type: 'promoter' | 'enhancer' | 'polyA_signal' | 'splice_junction' | 'tss';
  start: number;
  end: number;
}

export interface GenomicRegionData {
  chromosome: string;
  start: number;
  end: number;
  tss: number;
  flankingSequence: FlankingSequence;
  exons: ExonAnnotation[];
  regulatoryRegions: RegulatoryRegion[];
}

export interface TrackDataPoints {
  positions: number[];
  refValues: number[];
  altValues: number[];
  deltaValues: number[];
  provenance?: TrackProvenance;
}

export interface ModalityEffect {
  id: string;
  name: string;
  category: ModalityCategory;
  rawScore: number;
  quantileScore: number;
  unit: string;
  affectedGene: string;
  primaryTissue: string;
  tissueOntology: string;
  interpretation: string;
  refSignalDesc: string;
  altSignalDesc: string;
  tracks: TrackDataPoints;
  provenance?: ProvenanceRecord;
}

export interface SashimiExon {
  id: string;
  name: string;
  start: number;
  end: number;
  isSkipped?: boolean;
  isExtended?: boolean;
}

export interface SashimiJunction {
  id: string;
  fromExon: string;
  toExon: string;
  startCoord: number;
  endCoord: number;
  refReads: number; // Retained for backward compatibility
  altReads: number; // Retained for backward compatibility
  refSignal?: number; // Scientific predicted signal
  altSignal?: number; // Scientific predicted signal
  signalUnit?: string; // e.g. "predicted junction signal"
  isCanonical: boolean;
  isCryptic?: boolean;
  isSkipped?: boolean;
  label: string;
  provenance?: ProvenanceRecord;
}

export interface SashimiPlotData {
  exons: SashimiExon[];
  junctions: SashimiJunction[];
  provenance?: ProvenanceRecord;
}

export interface TissueComparison {
  name: string;
  ontology: string;
  rawScore: number;
  quantileScore: number;
  isDiseaseTarget: boolean;
  isTopDiscovery: boolean;
  significanceText: string;
  contextNote: string;
  provenance?: ProvenanceRecord;
}

export interface ISMData {
  windowStart: number;
  windowEnd: number;
  targetMotif: string;
  motifDescription: string;
  positions: number[];
  refBases: string[];
  scores: {
    A: number[];
    C: number[];
    G: number[];
    T: number[];
  };
  provenance?: ProvenanceRecord;
}

export interface AlphaGenomeVariantImpact {
  isAviAvailable: boolean; // Explicit flag: true ONLY if genuine Atlas AVI exists
  compositeScore?: number | null; // Null if AVI unavailable
  percentileRank: number; // Scorer quantile percentile if AVI unavailable
  impactTier: ImpactTier;
  primaryModality: string;
  primaryTissue: string;
  explanation: string;
  statusText?: string;
  provenance?: ProvenanceRecord;
}

export interface AlphaGenomeScorerResult {
  scorer: string;
  rawScore: number;
  quantileScore: number;
  unit: string;
  tissue: string;
  biosampleOntology: string;
  affectedGene: string;
  provenance?: ProvenanceRecord;
}

export interface DatasetMetadata {
  generatedAt: string;
  alphaGenomeApiVersion: string;
  genomeAssembly: 'GRCh38';
  sourceMode: 'live_api' | 'verified_benchmark';
  variantCount: number;
  normalizationVersion: string;
}

export interface VariantData {
  id: string;
  variant: string; // e.g. 'chr11:116837649:T>G'
  chrom: string;
  pos: number;
  ref: string;
  alt: string;
  gene: string;
  geneFullName: string;
  strand: '+' | '-';
  category: string;
  disease: string;
  atlasUrl: string;
  consequenceSummary: string;
  clinicalRelevance: string;
  evidenceSource: string;
  assembly: 'GRCh38';
  avi: AlphaGenomeVariantImpact;
  alphaGenomeScores?: AlphaGenomeScorerResult[];
  genomicRegion: GenomicRegionData;
  modalities: ModalityEffect[];
  sashimi?: SashimiPlotData;
  tissues: TissueComparison[];
  ism?: ISMData;
  provenance: ProvenanceRecord[];
}

export type EvidenceClass =
  | 'live_api'
  | 'atlas'
  | 'published_exact'
  | 'derived'
  | 'reconstructed'
  | 'illustrative';

export interface ProvenanceRecord {
  field?: string;
  sourceType: ProvenanceSourceType;
  evidenceClass: EvidenceClass;

  source: string;
  sourceLocator?: string;

  scorer?: string;
  biosample?: string;
  assembly?: string;
  retrievedAt?: string;

  transformation?: string;
  notes?: string;

  isIllustrative?: boolean;
}
