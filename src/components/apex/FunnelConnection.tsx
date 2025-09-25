interface FunnelConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export function FunnelConnection({ from, to }: FunnelConnectionProps) {
  // Calculate smooth curve path
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control points for smooth curve (adjust curve intensity based on distance)
  const curvature = Math.min(distance * 0.3, 100);
  const controlPoint1X = from.x + curvature;
  const controlPoint1Y = from.y;
  const controlPoint2X = to.x - curvature;
  const controlPoint2Y = to.y;
  
  const pathData = `M ${from.x} ${from.y} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${to.x} ${to.y}`;
  
  return (
    <path
      d={pathData}
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      fill="none"
      markerEnd="url(#arrowhead)"
      className="transition-all duration-200"
    />
  );
}