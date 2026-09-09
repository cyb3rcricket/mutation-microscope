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
  refReads: number;
  altReads: number;
  isCanonical: boolean;
  isCryptic?: boolean;
  isSkipped?: boolean;
  label: string;
}

export interface SashimiPlotData {
  exons: SashimiExon[];
  junctions: SashimiJunction[];
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
}

export interface AlphaGenomeVariantImpact {
  compositeScore: number;
  percentileRank: number;
  impactTier: ImpactTier;
  primaryModality: string;
  primaryTissue: string;
  explanation: string;
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
  genomicRegion: GenomicRegionData;
  modalities: ModalityEffect[];
  sashimi?: SashimiPlotData;
  tissues: TissueComparison[];
  ism?: ISMData;
}
