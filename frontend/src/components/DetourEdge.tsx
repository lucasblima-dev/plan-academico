import { BaseEdge } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

export default function DetourEdge(props: EdgeProps) {
  const { id, sourceX, sourceY, targetX, targetY, style, markerEnd } = props;

  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const xSpacing = 240;
  const ySpacing = 240;
  const nodeWidth = 176;
  const gap = xSpacing - nodeWidth;

  const laneIndex = (hash % 7);
  const offsetX = (laneIndex * 6) - 18;

  const offsetY = ((hash % 11) * 8) - 40;

  const getCorridorX = (c: number) => c * xSpacing + nodeWidth + gap / 2;

  const colSrc = Math.floor(sourceX / xSpacing);
  const colDest = Math.floor(targetX / xSpacing);
  const rowSrc = Math.round(sourceY / ySpacing);
  const rowDest = Math.round(targetY / ySpacing);

  let cExit: number;
  let cEnter: number;

  if (colDest > colSrc) {
    cExit = colSrc;
    cEnter = colDest - 1;
  } else if (colDest < colSrc) {
    cExit = colSrc - 1;
    cEnter = colDest;
  } else {
    cExit = colSrc <= 3 ? colSrc - 1 : colSrc;
    cEnter = cExit;
  }

  const xExit = getCorridorX(cExit) + offsetX;
  const xEnter = getCorridorX(cEnter) + offsetX;

  const escapeY_src = sourceY + ySpacing / 6 + offsetY / 2;
  const escapeY_dest = targetY - ySpacing / 6 + offsetY / 2;
  const midY = (escapeY_src + escapeY_dest) / 2;

  // eslint-disable-next-line no-useless-assignment
  let path = '';

  if (colSrc === colDest && rowDest === rowSrc + 1) {
    path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  } else if (cExit === cEnter) {
    path = `M ${sourceX} ${sourceY} 
            L ${sourceX} ${escapeY_src} 
            L ${xExit} ${escapeY_src} 
            L ${xExit} ${escapeY_dest} 
            L ${targetX} ${escapeY_dest} 
            L ${targetX} ${targetY}`;
  } else {
    path = `M ${sourceX} ${sourceY} 
            L ${sourceX} ${escapeY_src} 
            L ${xExit} ${escapeY_src} 
            L ${xExit} ${midY} 
            L ${xEnter} ${midY} 
            L ${xEnter} ${escapeY_dest} 
            L ${targetX} ${escapeY_dest} 
            L ${targetX} ${targetY}`;
  }

  return (
    <BaseEdge
      id={id}
      path={path}
      style={{
        ...style,
        strokeLinejoin: 'round',
        strokeLinecap: 'round'
      }}
      markerEnd={markerEnd}
    />
  );
}
