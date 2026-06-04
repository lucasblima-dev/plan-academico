import React, { useMemo, useCallback } from 'react'
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

import type { NodeProps, Edge, Node } from '@xyflow/react'
import { toSvg, toJpeg } from 'html-to-image'
import { jsPDF } from 'jspdf'
import '@xyflow/react/dist/style.css'
import type { NoGrafo, ArestaGrafo } from '../../types'
import { Maximize, Layers, Info, FileJson, FileText } from 'lucide-react'

interface GraphViewProps {
  nos: NoGrafo[]
  arestas: ArestaGrafo[]
}

const nodeWidth = 200

const calculateGridLayout = (nodes: Node[]) => {
  const ySpacing = 180
  const xSpacing = 240

  const periods: Record<number, Node[]> = {}
  nodes.forEach(node => {
    const nodeData = node.data as unknown as NoGrafo
    const p = nodeData.periodo_recomendado || 1
    if (!periods[p]) periods[p] = []
    periods[p].push(node)
  })

  const layoutedNodes: Node[] = []

  Object.keys(periods).forEach(pStr => {
    const p = parseInt(pStr)
    const rowNodes = periods[p]
    const rowCount = rowNodes.length

    // Calcular largura total da linha para centralizar
    const totalRowWidth = rowCount * nodeWidth + (rowCount - 1) * (xSpacing - nodeWidth)
    const startX = -totalRowWidth / 2

    rowNodes.forEach((node, index) => {
      layoutedNodes.push({
        ...node,
        position: {
          x: startX + index * xSpacing,
          y: (p - 1) * ySpacing
        }
      })
    })
  })

  return layoutedNodes
}

const CustomNode = ({ data }: NodeProps) => {
  const nodeData = data as unknown as NoGrafo

  let nodeStyle = 'bg-slate-300 dark:bg-slate-700 border-slate-400 dark:border-slate-600 text-slate-600 dark:text-slate-400'

  if (nodeData.aprovada) {
    nodeStyle = 'bg-green-500 border-green-600 text-white'
  } else if (nodeData.caminho_critico) {
    nodeStyle = 'bg-orange-500 border-orange-600 text-white'
  } else if (nodeData.disponivel) {
    nodeStyle = 'bg-blue-500 border-blue-600 text-white'
  }

  return (
    <div className={`px-4 py-3 shadow-xl rounded-2xl border-2 transition-all hover:scale-105 duration-300 ${nodeStyle} min-w-[200px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-white/30 border-none" />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black opacity-60 uppercase tracking-widest">
            {nodeData.id}
          </span>
          <span className="text-[9px] font-black bg-black/10 px-1.5 py-0.5 rounded uppercase">
            P{nodeData.periodo_recomendado}
          </span>
        </div>
        <span className="text-[11px] font-extrabold leading-tight line-clamp-2" title={nodeData.nome}>
          {nodeData.nome}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-white/30 border-none" />
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

const GraphFlow = ({ nos, arestas }: GraphViewProps) => {
  const initialNodes: Node[] = useMemo(() =>
    nos.map(n => ({
      id: n.id,
      type: 'custom',
      data: n as unknown as Record<string, unknown>,
      position: { x: 0, y: 0 },
    })), [nos]
  )

  const initialEdges: Edge[] = useMemo(() =>
    arestas.map(a => ({
      id: `e-${a.origem}-${a.destino}`,
      source: a.origem,
      target: a.destino,
      type: 'smoothstep',
      animated: nos.find(n => n.id === a.destino)?.caminho_critico && nos.find(n => n.id === a.origem)?.caminho_critico,
      style: {
        stroke: nos.find(n => n.id === a.destino)?.caminho_critico && nos.find(n => n.id === a.origem)?.caminho_critico ? '#f97316' : '#94a3b8',
        strokeWidth: 3,
        opacity: 0.4
      },
    })), [arestas, nos]
  )

  const layoutedNodes = useMemo(
    () => calculateGridLayout(initialNodes),
    [initialNodes]
  )

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const { fitView, getNodes } = useReactFlow()

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
      // Usar JPEG com qualidade 0.9 e ratio 2 (Equilíbrio perfeito entre peso e nitidez)
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
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          style: { strokeWidth: 3, stroke: '#94a3b8' },
        }}
      >
        <Background color="var(--surface-subtle)" gap={30} size={2} />
        <Controls showInteractive={false} className="bg-white dark:bg-slate-800 border-surface-subtle shadow-xl rounded-2xl overflow-hidden" />

        <Panel position="top-right" className="m-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 bg-white/80 dark:bg-slate-900/80 p-6 rounded-[32px] border border-surface-subtle shadow-2xl backdrop-blur-xl max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <Layers size={18} className="text-accent" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Legenda do Grafo</h4>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <LegendItem color="bg-green-500" label="Aprovada" desc="Já concluída" />
              <LegendItem color="bg-blue-500" label="Disponível" desc="Requisitos ok" />
              <LegendItem color="bg-orange-500" label="Crítico" desc="Prioridade alta" />
              <LegendItem color="bg-slate-300 dark:bg-slate-700" label="Bloqueada" desc="Faltam requisitos" />
            </div>

            <div className="h-px bg-surface-subtle my-2" />

            <button
              onClick={onLayout}
              className="flex items-center justify-center gap-2 w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-2xl transition-all font-bold text-xs uppercase shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Maximize size={16} />
              Ajustar Visualização
            </button>

            <div className="flex items-start gap-2 text-[10px] text-slate-400 font-bold leading-tight">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>Use o scroll para zoom e arraste para navegar no DAG curricular.</span>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-[24px] border border-surface-subtle shadow-2xl backdrop-blur-xl flex flex-col gap-2">
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

const LegendItem = ({ color, label, desc }: { color: string, label: string, desc: string }) => (
  <div className="flex items-center gap-3">
    <div className={`w-4 h-4 rounded-lg shadow-sm shrink-0 ${color}`} />
    <div className="flex flex-col">
      <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase leading-none">{label}</span>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{desc}</span>
    </div>
  </div>
)
