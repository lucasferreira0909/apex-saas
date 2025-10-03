import { useConnection } from '@xyflow/react';

interface CustomConnectionLineProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export default function CustomConnectionLine({ fromX, fromY, toX, toY }: CustomConnectionLineProps) {
  const { fromHandle } = useConnection();
  
  // Bege color for handles
  const handleColor = '#D4A574';

  return (
    <g>
      <path
        fill="none"
        stroke={fromHandle?.id ? handleColor : '#D4A574'}
        strokeWidth={1.5}
        className="animated"
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
      <circle
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke={handleColor}
        strokeWidth={1.5}
      />
    </g>
  );
}
