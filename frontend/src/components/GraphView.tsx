import React, { useMemo, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  ReactFlowProvider,
  getNodesBounds,
} from '@xyflow/react'

import type { NodeProps, Node } from '@xyflow/react'
import { toSvg, toJpeg } from 'html-to-image'
import { jsPDF } from 'jspdf'
import '@xyflow/react/dist/style.css'
import type { NoGrafo, ArestaGrafo } from '../types'
import { Maximize, Layers, Info, FileJson, FileText } from 'lucide-react'
import DetourEdge from './DetourEdge'

interface GraphViewProps {
  nos: NoGrafo[]
  arestas: ArestaGrafo[]
  isPlanejamento?: boolean
  exibirLegenda?: boolean
}

const COLUMN_MAP: Record<string, number> = {
  // Colunas (eixo X) para ficar similar a Grade
  'TECS': 0, 'UCE1': 0, 'UCE2': 0, 'UCE3': 0, 'UCE4': 0, 'UCE5': 0, 'UCE6': 0,

  'FILOS': 1, 'CIRCDIG': 1, 'ARQUCOMP': 1, 'SO': 1, 'REDES': 1, 'SISDIST': 1, 'PROGPAR': 1,

  'FISCOMP': 2, 'GEOANA': 2, 'ALGLIN': 2, 'TRANSDAT': 2, 'IA': 2, 'PRODCIENT': 2, 'TGAEMP': 2,

  'MATFUND': 3, 'CALC1': 3, 'ENGSW': 3, 'APS': 3, 'TEOGRAF': 3, 'COMPGRAF': 3, 'PTCC': 3, 'TCC': 3,

  'ALGPROG': 4, 'TECPROG': 4, 'ESTDADOS': 4, 'POO': 4, 'TEOCOMP': 4, 'COMPALG': 4, 'VISCOMP': 4,

  'LOGMAT': 5, 'PARAD': 5, 'METCIENT': 5, 'BD': 5, 'OPT1': 5, 'OPT3': 5, 'COMP': 5, 'OPT6': 5,

  'PRODTXT1': 6, 'INGLES': 6, 'PROBEST': 6, 'CALCNUM': 6, 'OPT2': 6, 'OPT4': 6, 'OPT5': 6
};

const calculateGridLayout = (nodes: Node[]) => {
  const ySpacing = 240;
  const xSpacing = 240;

  return nodes.map(node => {
    const nodeData = node.data as unknown as NoGrafo;
    const row = (nodeData.periodo_recomendado || 1) - 1;

    const col = COLUMN_MAP[node.id] !== undefined ? COLUMN_MAP[node.id] : 3;

    return {
      ...node,
      position: {
        x: col * xSpacing,
        y: row * ySpacing
      }
    };
  });
};

function CustomNode({ data }: NodeProps) {
  const nodeData = data as unknown as NoGrafo & {
    topTargets?: string[];
    bottomSources?: string[];
  }

  let nodeStyle = 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600 text-slate-800 dark:text-slate-200'

  if (nodeData.aprovada) {
    nodeStyle = 'bg-node-approved border-green-600 text-white'
  } else if (nodeData.cursando) {
    nodeStyle = 'bg-node-cursando border-yellow-600 text-white'
  } else if (nodeData.caminho_critico) {
    nodeStyle = 'bg-node-critical border-orange-600 text-white'
  } else if (nodeData.disponivel) {
    nodeStyle = 'bg-node-available border-blue-600 text-white'
  }

  const tooltip = nodeData.disponivel
    ? "Disponível"
    : nodeData.aprovada
      ? "Aprovada"
      : nodeData.cursando
        ? "Cursando"
        : "Bloqueada por pré-requisito"

  return (
    <div
      className={`px-3 py-4 shadow-xl rounded-2xl border-2 transition-all hover:scale-105 duration-300 ${nodeStyle} w-44 flex flex-col items-center justify-center relative`}
      title={tooltip}
    >
      {(nodeData.topTargets || []).map((id: string, index: number) => {
        const total = nodeData.topTargets?.length || 0;
        return (
          <Handle
            key={id}
            id={id}
            type="target"
            position={Position.Top}
            style={{
              left: `${total > 1 ? ((index + 1) * 100) / (total + 1) : 50}%`,
              background: 'transparent',
              border: 'none',
              width: '1px',
              height: '1px',
            }}
            className="opacity-0! border-none"
          />
        );
      })}

      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between w-full">
          <span className="text-[9px] font-black opacity-70 uppercase tracking-widest">
            {nodeData.carga_horaria}h | {nodeData.creditos} CR
          </span>
          <span className="text-[9px] font-black bg-black/10 px-1.5 py-0.5 rounded uppercase">
            P{nodeData.periodo_recomendado}
          </span>
        </div>
        <span className="text-[11px] font-extrabold leading-tight whitespace-normal wrap-break-word text-center">
          {nodeData.nome}
        </span>
      </div>

      {(nodeData.bottomSources || []).map((id: string, index: number) => {
        const total = nodeData.bottomSources?.length || 0;
        return (
          <Handle
            key={id}
            id={id}
            type="source"
            position={Position.Bottom}
            style={{
              left: `${total > 1 ? ((index + 1) * 100) / (total + 1) : 50}%`,
              background: 'transparent',
              border: 'none',
              width: '1px',
              height: '1px',
            }}
            className="opacity-0! border-none"
          />
        );
      })}
    </div>
  )
}

function LegendItem({ color, label, desc }: { color: string, label: string, desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-4 h-4 rounded-lg shadow-sm shrink-0 ${color}`} />
      <div className="flex flex-col">
        <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase leading-none">{label}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{desc}</span>
      </div>
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

const edgeTypes = {
  detour: DetourEdge,
}

const GraphFlow = ({ nos, arestas, exibirLegenda = true, isPlanejamento = false }: GraphViewProps) => {
  const { handleMap, mappedEdges } = useMemo(() => {
    const handleMap: Record<string, {
      topTargets: string[];
      bottomSources: string[];
    }> = {};

    nos.forEach(n => {
      handleMap[n.id] = {
        topTargets: [],
        bottomSources: [],
      };
    });

    const mapped = arestas.map(a => {
      const srcInfo = handleMap[a.origem];
      const destInfo = handleMap[a.destino];

      let sourceHandle = '';
      let targetHandle = '';

      if (srcInfo) {
        const idx = srcInfo.bottomSources.length;
        sourceHandle = `${a.origem}-bs-${idx}`;
        srcInfo.bottomSources.push(sourceHandle);
      }

      if (destInfo) {
        const idx = destInfo.topTargets.length;
        targetHandle = `${a.destino}-tt-${idx}`;
        destInfo.topTargets.push(targetHandle);
      }

      const srcNode = nos.find(n => n.id === a.origem);
      const period = srcNode?.periodo_recomendado || 1;
      const isCritical = !!(nos.find(n => n.id === a.destino)?.caminho_critico && nos.find(n => n.id === a.origem)?.caminho_critico);

      // Cores para poder identificar arestas
      const colors: Record<number, string> = {
        1: '#64748b',
        2: '#dc2626',
        3: '#16a34a',
        4: '#d97706',
        5: '#0d9488',
        6: '#7c3aed',
        7: '#db2777',
        8: '#4b5563',
      };

      const strokeColor = isCritical
        ? '#f97316'
        : isPlanejamento
          ? '#94a3b8'
          : (colors[period] || '#94a3b8');

      return {
        id: `e-${a.origem}-${a.destino}`,
        source: a.origem,
        target: a.destino,
        sourceHandle,
        targetHandle,
        type: 'detour',
        animated: isCritical,
        style: {
          stroke: strokeColor,
          strokeWidth: isCritical ? 3 : 2,
          opacity: isCritical ? 0.95 : 0.65
        },
      };
    });

    return { handleMap, mappedEdges: mapped };
  }, [nos, arestas, isPlanejamento]);

  const initialNodes: Node[] = useMemo(() =>
    nos.map(n => ({
      id: n.id,
      type: 'custom',
      data: {
        ...n,
        topTargets: handleMap[n.id]?.topTargets || [],
        bottomSources: handleMap[n.id]?.bottomSources || [],
      } as unknown as Record<string, unknown>,
      position: { x: 0, y: 0 },
    })), [nos, handleMap]
  )

  const layoutedNodes = useMemo(
    () => calculateGridLayout(initialNodes),
    [initialNodes]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(mappedEdges)
  const { fitView, getNodes } = useReactFlow()

  useEffect(() => {
    setNodes(layoutedNodes)
    setEdges(mappedEdges)
  }, [layoutedNodes, mappedEdges, setNodes, setEdges])

  const onLayout = useCallback(() => {
    fitView({ duration: 800, padding: 0.2 })
  }, [fitView])

  const handleDownloadSVG = async () => {
    const nodes = getNodes()
    if (nodes.length === 0) return

    const bounds = getNodesBounds(nodes)
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement

    try {
      const dataUrl = await toSvg(viewport, {
        backgroundColor: 'transparent',
        width: bounds.width + 100,
        height: bounds.height + 100,
        style: {
          width: `${bounds.width + 100}px`,
          height: `${bounds.height + 100}px`,
          transform: `translate(${-bounds.x + 50}px, ${-bounds.y + 50}px)`,
        },
        filter: (node) => {
          if (node.classList?.contains('react-flow__controls')) return false
          if (node.classList?.contains('react-flow__panel')) return false
          return true
        }
      })

      const link = document.createElement('a')
      link.download = 'grade-curricular.svg'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Erro ao baixar SVG:', err)
    }
  }

  const handleDownloadPDF = async () => {
    const nodes = getNodes()
    if (nodes.length === 0) return

    const bounds = getNodesBounds(nodes)
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement

    try {
      const dataUrl = await toJpeg(viewport, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 0.9,
        width: bounds.width + 100,
        height: bounds.height + 100,
        style: {
          width: `${bounds.width + 100}px`,
          height: `${bounds.height + 100}px`,
          transform: `translate(${-bounds.x + 50}px, ${-bounds.y + 50}px)`,
        },
        filter: (node) => {
          if (node.classList?.contains('react-flow__controls')) return false
          if (node.classList?.contains('react-flow__panel')) return false
          return true
        }
      })

      const pdf = new jsPDF({
        orientation: bounds.width > bounds.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [bounds.width + 100, bounds.height + 100],
        compress: true
      })

      pdf.addImage(dataUrl, 'JPEG', 0, 0, bounds.width + 100, bounds.height + 100, undefined, 'FAST')
      pdf.save('grade-curricular.pdf')
    } catch (err) {
      console.error('Erro ao baixar PDF:', err)
    }
  }

  return (
    <div className="w-full h-175 bg-surface-base border-2 border-surface-subtle rounded-[40px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#94a3b8' },
          type: 'detour'
        }}
      >
        <Background color="var(--surface-subtle)" gap={30} size={2} />
        <Controls showInteractive={false} className="bg-white dark:bg-slate-800 border-surface-subtle shadow-xl rounded-2xl overflow-hidden" />

        <Panel position="top-right" className="m-6 flex flex-col gap-4 no-export-buttons">
          <div className="flex flex-col gap-4 bg-white/80 dark:bg-slate-900/80 p-6 rounded-4xl border border-surface-subtle shadow-2xl backdrop-blur-xl max-w-xs">
            {exibirLegenda && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={18} className="text-accent" />
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Legenda do Grafo</h4>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <LegendItem color="bg-node-approved" label="Aprovada" desc="Já concluída" />
                  <LegendItem color="bg-node-cursando" label="Cursando" desc="Matrícula atual" />
                  <LegendItem color="bg-node-available" label="Disponível" desc="Requisitos ok" />
                  <LegendItem color="bg-node-critical" label="Crítico" desc="Prioridade alta" />
                  <LegendItem color="bg-node-blocked" label="Bloqueada" desc="Faltam requisitos" />
                </div>

                <div className="h-px bg-surface-subtle my-2" />
              </>
            )}

            <button
              onClick={onLayout}
              className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-2xl transition-all font-bold text-xs uppercase shadow-lg shadow-blue-500/20 active:scale-95 no-export"
            >
              <Maximize size={16} />
              Ajustar Visualização
            </button>

            <div className="flex items-start gap-2 text-[10px] text-slate-400 font-bold leading-tight no-export">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>Use o scroll para zoom e arraste para navegar no DAG curricular.</span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-3xl border border-surface-subtle shadow-2xl backdrop-blur-xl flex flex-col gap-2 no-export">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Exportar</p>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadSVG}
                className="flex-1 flex items-center justify-center gap-2 bg-surface-subtle hover:bg-surface-card text-slate-600 dark:text-slate-200 py-2.5 px-4 rounded-xl transition-all font-bold text-[10px] uppercase border border-surface-subtle"
                title="Baixar em formato vetorial SVG"
              >
                <FileJson size={14} className="text-orange-500" />
                SVG
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 flex items-center justify-center gap-2 bg-surface-subtle hover:bg-surface-card text-slate-600 dark:text-slate-200 py-2.5 px-4 rounded-xl transition-all font-bold text-[10px] uppercase border border-surface-subtle"
                title="Baixar em formato PDF"
              >
                <FileText size={14} className="text-red-500" />
                PDF
              </button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export const GraphView = React.memo((props: GraphViewProps) => {
  return (
    <ReactFlowProvider>
      <GraphFlow {...props} />
    </ReactFlowProvider>
  )
})
