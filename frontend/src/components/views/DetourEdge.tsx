import { BaseEdge, getSmoothStepPath } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export default function DetourEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd } = props;

  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const laneIndex = (hash % 10);
  const offsetX = (laneIndex * 20) - 100;
  const offsetY = (hash % 40) - 20;

  const isLongEdge = (targetY - sourceY) > 250;

  if (isLongEdge) {
    // Corredor lateral mais largo e organizado
    const corridorX = sourceX + 180 + offsetX;
    const dropY = sourceY + 50 + (offsetY / 2);
    const riseY = targetY - 50 + (offsetY / 2);

    // Caminho ortogonal limpo (Manhattan routing)
    const path = `M ${sourceX} ${sourceY} 
                  L ${sourceX} ${dropY} 
                  L ${corridorX} ${dropY} 
                  L ${corridorX} ${riseY} 
                  L ${targetX} ${riseY} 
                  L ${targetX} ${targetY}`;

    return <BaseEdge id={id} path={path} style={{ ...style, strokeLinejoin: 'round' }} markerEnd={markerEnd} />;
  }

  // Para arestas curtas, garantimos que os joelhos não se batam
  const [edgePath] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
    centerY: sourceY + 110 + offsetY
  });

  return <BaseEdge id={id} path={edgePath} style={style} markerEnd={markerEnd} />;
}

