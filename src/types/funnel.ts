export interface FunnelElement extends Record<string, unknown> {
  id: string;
  type: string;
  icon: any;
  position: { x: number; y: number };
  configured: boolean;
  stats: Record<string, string | number>;
}

export interface FunnelConnection {
  from: string;
  to: string;
}

export interface Position {
  x: number;
  y: number;
}