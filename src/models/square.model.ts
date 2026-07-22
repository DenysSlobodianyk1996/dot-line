export interface Square {
  x: number;
  y: number;
  owner: string;
  lines: SquareLine[];
}

export type SquareLine = 'left' | 'right' | 'top' | 'bottom';
