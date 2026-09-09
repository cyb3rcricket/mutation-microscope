export interface ChromosomeInfo {
  name: string;
  lengthMb: number;
  centromereMb: number;
  pArmLengthMb: number;
  qArmLengthMb: number;
}

export const CHROMOSOME_DATA: Record<string, ChromosomeInfo> = {
  chr2: {
    name: 'Chromosome 2',
    lengthMb: 242.2,
    centromereMb: 93.3,
    pArmLengthMb: 93.3,
    qArmLengthMb: 148.9,
  },
  chr5: {
    name: 'Chromosome 5',
    lengthMb: 181.5,
    centromereMb: 49.0,
    pArmLengthMb: 49.0,
    qArmLengthMb: 132.5,
  },
  chr7: {
    name: 'Chromosome 7',
    lengthMb: 159.3,
    centromereMb: 59.8,
    pArmLengthMb: 59.8,
    qArmLengthMb: 99.5,
  },
  chr11: {
    name: 'Chromosome 11',
    lengthMb: 135.1,
    centromereMb: 53.4,
    pArmLengthMb: 53.4,
    qArmLengthMb: 81.7,
  },
  chr16: {
    name: 'Chromosome 16',
    lengthMb: 90.3,
    centromereMb: 36.8,
    pArmLengthMb: 36.8,
    qArmLengthMb: 53.5,
  },
  chr21: {
    name: 'Chromosome 21',
    lengthMb: 46.7,
    centromereMb: 12.0,
    pArmLengthMb: 12.0,
    qArmLengthMb: 34.7,
  },
};

export function getVariantArm(chrom: string, pos: number): { arm: 'p' | 'q'; mb: number; percent: number } {
  const chromInfo = CHROMOSOME_DATA[chrom] || {
    name: chrom,
    lengthMb: 150,
    centromereMb: 60,
    pArmLengthMb: 60,
    qArmLengthMb: 90,
  };

  const posMb = pos / 1_000_000;
  const arm = posMb < chromInfo.centromereMb ? 'p' : 'q';
  const percent = Math.min(100, Math.max(0, (posMb / chromInfo.lengthMb) * 100));

  return { arm, mb: posMb, percent };
}

export function formatCoordinates(chrom: string, pos: number): string {
  return `${chrom}:${pos.toLocaleString()}`;
}

export function formatBasePairDistance(distance: number): string {
  if (Math.abs(distance) >= 1_000_000) {
    return `${(distance / 1_000_000).toFixed(2)} Mb`;
  }
  if (Math.abs(distance) >= 1_000) {
    return `${(distance / 1_000).toFixed(1)} kb`;
  }
  return `${distance} bp`;
}
