# FRONTEND.md — Especificação Completa do Frontend

> Leia `GEMINI.md` antes deste arquivo.
> Este documento é a fonte da verdade para tudo relacionado ao frontend React + TypeScript.

---

## 1. Visão geral das telas

O sistema tem **3 telas** com transição linear controlada pelo estado global (`FlowStep`). Não há roteamento — `App.tsx` renderiza condicionalmente cada tela.

```
step = 'upload'   →   Screen1Upload.tsx
                            ↓ PDF processado com sucesso
step = 'preview'  →   Screen2Preview.tsx
                            ↓ usuário confirma
step = 'planning' →   Screen3Results.tsx
                            ├── Aba 1: PlanView.tsx
                            ├── Aba 2: GraphView.tsx
                            └── Aba 3: CompareView.tsx
```

Elementos globais presentes em todas as telas:

- `Header.tsx` — barra fixa no topo com toggle dark/light
- `ThemeProvider.tsx` — gerencia a classe `dark` no `<html>`
- `LoadingOverlay` — spinner inline por componente (não global)
- Mensagens de erro: inline, nunca `alert()`

---

## 2. Estrutura de arquivos

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── ThemeProvider.tsx
│   ├── screens/
│   │   ├── Screen1Upload.tsx
│   │   ├── Screen2Preview.tsx
│   │   └── Screen3Results.tsx
│   └── views/
│       ├── PlanView.tsx
│       ├── GraphView.tsx
│       └── CompareView.tsx
├── hooks/
│   └── usePlanner.ts
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

Não criar pastas ou arquivos fora desta estrutura sem justificativa explícita.

---

## 3. Design system

### 3.1 Tema e tokens

O projeto usa **Tailwind CSS com dark mode via classe** (`darkMode: 'class'`). O `ThemeProvider` adiciona/remove a classe `dark` no elemento `<html>`.

Paleta semântica — definir como extensão no `tailwind.config.js`:

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Superfícies
        surface: {
          base:    { DEFAULT: '#F8FAFC', dark: '#0F172A' },
          card:    { DEFAULT: '#FFFFFF', dark: '#1E293B' },
          subtle:  { DEFAULT: '#F1F5F9', dark: '#263248' },
        },
        // Primária
        brand: {
          DEFAULT: '#1E3A5F',
          hover:   '#16304F',
          light:   '#EFF6FF',
          dark:    '#3B82F6',
        },
        // Acento
        accent: {
          DEFAULT: '#2563EB',
          hover:   '#1D4ED8',
          light:   '#DBEAFE',
        },
        // Nós do grafo
        node: {
          approved:  '#22C55E',
          available: '#3B82F6',
          critical:  '#F97316',
          blocked:   '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        xl2: '16px',
      },
    },
  },
  plugins: [],
}
```

### 3.2 Convenção de classes dark mode

Sempre usar o modificador `dark:` do Tailwind. Nunca usar variáveis CSS inline para cores — usar classes Tailwind. Exemplo de card:

```tsx
<div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-card">
```

### 3.3 Tipografia

Instalar Inter e JetBrains Mono via Google Fonts no `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Escala em uso:

| Uso | Classes |
|---|---|
| Título de página | `text-2xl font-bold text-slate-900 dark:text-white` |
| Título de seção | `text-lg font-semibold text-slate-800 dark:text-slate-100` |
| Corpo | `text-sm text-slate-700 dark:text-slate-300` |
| Label / caption | `text-xs font-medium text-slate-500 dark:text-slate-400` |
| Código / ID | `font-mono text-xs text-slate-500 dark:text-slate-400` |

### 3.4 Componentes base inline (sem pasta `ui/`)

Não criar componentes de UI separados. Usar `clsx` diretamente para variantes inline. Instalar: `npm install clsx`.

Padrão de botão primário:

```tsx
<button
  className={clsx(
    'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150',
    'bg-accent-DEFAULT hover:bg-accent-hover text-white',
    'dark:bg-blue-500 dark:hover:bg-blue-400',
    'focus:outline-none focus:ring-2 focus:ring-accent-DEFAULT focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    loading && 'cursor-wait'
  )}
>
```

---

## 4. `ThemeProvider.tsx`

```tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

Envolver o `App` no `main.tsx`:

```tsx
<ThemeProvider><App /></ThemeProvider>
```

---

## 5. `Header.tsx`

Barra fixa no topo. Altura: `64px`. Sempre visível em todas as telas.

**Estrutura visual:**

```
┌──────────────────────────────────────────────────────────────┐
│  ◈  Planejador Acadêmico          [ícone tema]  [Reset?]    │
│     Teoria dos Grafos · UERN 2026.1                          │
└──────────────────────────────────────────────────────────────┘
```

- Fundo: `bg-slate-900 dark:bg-slate-950`
- Texto principal: `text-white`
- Subtítulo: `text-slate-400 text-xs`
- **Toggle de tema:** ícone sol (☀) no dark mode, lua (🌙) no light mode — botão `ghost` branco
- **Botão "Novo planejamento":** visível somente quando `step === 'planning'`. Ícone refresh + texto. Ao clicar, chama `handleReset` do `usePlanner`.
- Border bottom: `border-b border-slate-700` no dark, `border-b border-slate-200` no light

---

## 6. `types/index.ts`

Espelha exatamente os schemas Pydantic do backend. **Se o backend mudar um campo, este arquivo muda junto.**

```typescript
// ── Parser output ──────────────────────────────────────────────────────────

export interface DisciplinaNaoMapeada {
  codigo_sigaa: string
  nome_sigaa: string
  situacao: string
}

export interface HistoricoParseado {
  nome_aluno: string
  matricula: string
  semestre_atual: number           // 1 (ímpar) ou 2 (par)
  disciplinas_aprovadas: string[]  // IDs do grade.json
  nao_mapeadas: DisciplinaNaoMapeada[]
}

// ── Planejamento ───────────────────────────────────────────────────────────

export interface DisciplinaPlano {
  id: string
  nome: string
  carga_horaria: number
  creditos: number
  semestre_oferta: number
  tipo: string
}

export interface SemestrePlano {
  numero: number                   // ordinal: 1, 2, 3...
  tipo_semestre: number            // 1 (ímpar) ou 2 (par)
  disciplinas: DisciplinaPlano[]
  total_disciplinas: number
  total_carga_horaria: number
}

export interface Plano {
  caso: number                     // 1 ou 2
  algoritmo: number                // 1 ou 2
  semestres: SemestrePlano[]
  total_semestres: number
  total_disciplinas: number
  total_carga_horaria: number
}

// ── Grafo ──────────────────────────────────────────────────────────────────

export interface NoGrafo {
  id: string
  nome: string
  periodo_recomendado: number
  semestre_oferta: number
  aprovada: boolean
  disponivel: boolean              // sem pré-requisitos pendentes
  caminho_critico: boolean
}

export interface ArestaGrafo {
  origem: string
  destino: string
}

export interface ResultadoPlanejar {
  planos: Plano[]                  // sempre 4: caso1/algo1, caso1/algo2, caso2/algo1, caso2/algo2
  nos: NoGrafo[]
  arestas: ArestaGrafo[]
  disciplinas_pendentes: number
  disciplinas_aprovadas: number
}

// ── Estado global ──────────────────────────────────────────────────────────

export type FlowStep = 'upload' | 'preview' | 'planning'

export interface MapeamentoOptativa {
  codigo_sigaa: string             // ex: "CAN0073"
  nome_sigaa: string               // ex: "Prática de Programação para Robótica I"
  id_grade: string | null          // ex: "OPT1" — null se o aluno optar por não mapear
}

export interface AppState {
  step: FlowStep
  historico: HistoricoParseado | null
  mapeamentos: MapeamentoOptativa[]  // definidos na Screen2
  resultado: ResultadoPlanejar | null
  maxDisciplinas: number
  loading: boolean
  error: string | null
}
```

---

## 7. `services/api.ts`

**Nenhum componente usa `fetch` ou `axios` diretamente.** Toda comunicação HTTP passa por aqui.

```typescript
import axios from 'axios'
import type { HistoricoParseado, MapeamentoOptativa, ResultadoPlanejar } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
})

/**
 * Envia o PDF do histórico SIGAA e retorna as disciplinas extraídas.
 * O backend usa pdfplumber para extrair a tabela de componentes.
 */
export async function parseHistorico(file: File): Promise<HistoricoParseado> {
  const form = new FormData()
  form.append('historico', file)
  const { data } = await api.post<HistoricoParseado>('/api/parse-historico', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

/**
 * Envia o histórico confirmado + mapeamentos de optativas e gera os 4 planos.
 */
export async function planejar(
  historico: HistoricoParseado,
  mapeamentos: MapeamentoOptativa[],
  maxDisciplinas: number,
): Promise<ResultadoPlanejar> {
  const { data } = await api.post<ResultadoPlanejar>('/api/planejar', {
    historico,
    mapeamentos,
    max_disciplinas: maxDisciplinas,
  })
  return data
}
```

---

## 8. `hooks/usePlanner.ts`

Estado global do fluxo. Nenhum componente gerencia estado de fluxo localmente.

```typescript
import { useState, useCallback } from 'react'
import { parseHistorico, planejar } from '../services/api'
import type { AppState, HistoricoParseado, MapeamentoOptativa } from '../types'

export function usePlanner() {
  const [state, setState] = useState<AppState>({
    step: 'upload',
    historico: null,
    mapeamentos: [],
    resultado: null,
    maxDisciplinas: 6,
    loading: false,
    error: null,
  })

  /** Tela 1 → Tela 2: envia PDF, recebe histórico parseado */
  const handleUpload = useCallback(async (file: File) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const historico = await parseHistorico(file)
      // Inicializa mapeamentos vazios para cada disciplina não mapeada
      const mapeamentos: MapeamentoOptativa[] = historico.nao_mapeadas.map(d => ({
        codigo_sigaa: d.codigo_sigaa,
        nome_sigaa: d.nome_sigaa,
        id_grade: null,
      }))
      setState(s => ({ ...s, historico, mapeamentos, step: 'preview', loading: false }))
    } catch {
      setState(s => ({ ...s, loading: false, error: 'Erro ao processar o PDF. Verifique se é um histórico válido do SIGAA.' }))
    }
  }, [])

  /** Tela 2 → Tela 3: envia histórico + mapeamentos, recebe planejamento */
  const handleConfirm = useCallback(async (
    historico: HistoricoParseado,
    mapeamentos: MapeamentoOptativa[],
  ) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const resultado = await planejar(historico, mapeamentos, state.maxDisciplinas)
      setState(s => ({ ...s, resultado, step: 'planning', loading: false }))
    } catch {
      setState(s => ({ ...s, loading: false, error: 'Erro ao gerar planejamento. Tente novamente.' }))
    }
  }, [state.maxDisciplinas])

  const setMaxDisciplinas = useCallback((n: number) => {
    setState(s => ({ ...s, maxDisciplinas: n }))
  }, [])

  const updateMapeamento = useCallback((codigo_sigaa: string, id_grade: string | null) => {
    setState(s => ({
      ...s,
      mapeamentos: s.mapeamentos.map(m =>
        m.codigo_sigaa === codigo_sigaa ? { ...m, id_grade } : m
      ),
    }))
  }, [])

  const handleReset = useCallback(() => {
    setState({ step: 'upload', historico: null, mapeamentos: [], resultado: null,
               maxDisciplinas: 6, loading: false, error: null })
  }, [])

  return { state, handleUpload, handleConfirm, handleReset, setMaxDisciplinas, updateMapeamento }
}
```

---

## 9. `App.tsx`

```tsx
import { usePlanner } from './hooks/usePlanner'
import { Header } from './components/layout/Header'
import { Screen1Upload } from './components/screens/Screen1Upload'
import { Screen2Preview } from './components/screens/Screen2Preview'
import { Screen3Results } from './components/screens/Screen3Results'

export default function App() {
  const planner = usePlanner()
  const { state } = planner

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Header
        showReset={state.step === 'planning'}
        onReset={planner.handleReset}
      />

      <main className="pt-16"> {/* compensa o header fixo de 64px */}
        {state.step === 'upload' && (
          <Screen1Upload
            onUpload={planner.handleUpload}
            loading={state.loading}
            error={state.error}
          />
        )}

        {state.step === 'preview' && state.historico && (
          <Screen2Preview
            historico={state.historico}
            mapeamentos={state.mapeamentos}
            maxDisciplinas={state.maxDisciplinas}
            loading={state.loading}
            error={state.error}
            onUpdateMapeamento={planner.updateMapeamento}
            onMaxChange={planner.setMaxDisciplinas}
            onConfirm={() => planner.handleConfirm(state.historico!, state.mapeamentos)}
            onBack={planner.handleReset}
          />
        )}

        {state.step === 'planning' && state.resultado && (
          <Screen3Results resultado={state.resultado} semestreAtual={state.historico!.semestre_atual} />
        )}
      </main>
    </div>
  )
}
```

---

## 10. Tela 1 — `Screen1Upload.tsx`

### Visual

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│              ◈  Planejador Acadêmico                     │
│        Gere seu planejamento semestral ideal             │
│                                                          │
│   ┌─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─┐   │
│   ╎                                                 ╎   │
│   ╎          ↑  Arraste o PDF aqui                  ╎   │
│   ╎     ou clique para selecionar o arquivo         ╎   │
│   ╎                                                 ╎   │
│   ╎   Histórico Escolar emitido pelo SIGAA/UERN      ╎   │
│   ╎                                                 ╎   │
│   └─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─┘   │
│                                                          │
│          🔒 Processado localmente — não armazenado       │
└──────────────────────────────────────────────────────────┘
```

### Especificação

- **Layout:** `flex flex-col items-center justify-center` com `min-h-[calc(100vh-64px)]`
- **Zona de drop:**
  - Estado padrão: `border-2 border-dashed border-slate-300 dark:border-slate-600`
  - Estado drag-over: `border-accent-DEFAULT bg-accent-light dark:bg-slate-800` — transição `transition-all duration-200`
  - Estado arquivo selecionado: exibe nome do arquivo com ícone PDF + botão `×` para remover
  - Estado erro (tipo errado): borda vermelha `border-red-400` + mensagem inline abaixo da zona
  - Estado loading: substitui o conteúdo da zona por um spinner centralizado + texto "Processando histórico..."
- **Aceita somente `.pdf`:** validar via `file.type === 'application/pdf'` antes de chamar `onUpload`
- **Animação de entrada da zona:** `animate-pulse` sutil na borda quando no estado padrão vazio
- **Rodapé:** ícone de cadeado + `text-xs text-slate-400`
- Ao selecionar o arquivo (não arrastar), usar `<input type="file" accept=".pdf" className="hidden" />` com `ref` acionado por click na zona

### Props

```typescript
interface Screen1UploadProps {
  onUpload: (file: File) => void
  loading: boolean
  error: string | null
}
```

---

## 11. Tela 2 — `Screen2Preview.tsx`

### Visual

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar                                                   │
│                                                             │
│  Olá, Lucas! Você está no 5º período (Semestre Ímpar).     │
│  Matrícula: 20240021666                                     │
│                                                             │
│  ┌── ⚠ Disciplinas não identificadas na grade (2) ────────┐ │
│  │  Encontramos estas disciplinas no seu histórico que    │ │
│  │  não constam na grade padrão. Mapeie-as abaixo:       │ │
│  │                                                        │ │
│  │  Prática de Prog. para Robótica I   → [OPT1      ▾]  │ │
│  │  Programação para Disp. Móveis      → [OPT2      ▾]  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  Disciplinas reconhecidas (29)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ✓  Algoritmos e Programação          1º · 90h    [×] │  │
│  │ ✓  Matemática Fundamental            1º · 90h    [×] │  │
│  │ ...                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Máx. disciplinas por semestre:  ○5  ●6  ○7               │
│                                                             │
│             [  Confirmar e Gerar Planejamento →  ]          │
└─────────────────────────────────────────────────────────────┘
```

### Especificação

**Saudação dinâmica:**

- `"Olá, {nome_aluno}! Você está no {semestre_atual}º período ({tipo})."` onde tipo = "Semestre Ímpar" ou "Semestre Par"
- Badge colorido junto ao período: azul para ímpar, verde para par

**Seção de mapeamento de optativas (o diferencial de UX):**

- Visível somente se `nao_mapeadas.length > 0`
- Card com `bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700`
- Borda esquerda `4px solid #D97706`
- Cada disciplina não mapeada tem um `<select>` dropdown com as opções de optativas disponíveis na grade: OPT1, OPT2, OPT3, OPT4, OPT5, OPT6, mais a opção "— Não mapear —" (value null)
- Ao selecionar, chama `onUpdateMapeamento(codigo_sigaa, id_grade)`
- O dropdown mostra apenas as optativas que ainda não foram escolhidas por outra disciplina não mapeada (evitar duplicatas)

**Lista de disciplinas reconhecidas:**

- Cada linha: ícone ✓ verde, nome, período recomendado + CH à direita, botão `×` para remover
- Linhas alternadas: `bg-white dark:bg-slate-800` e `bg-slate-50 dark:bg-slate-800/60`
- Remover exclui do `historico.disciplinas_aprovadas` localmente (não chama a API)
- Scroll interno se a lista for longa: `max-h-96 overflow-y-auto`

**Seletor de max_disciplinas:**

- Três botões pill lado a lado: `5`, `6`, `7`
- Ativo: `bg-accent-DEFAULT text-white dark:bg-blue-500`
- Inativo: `bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300`

**Botão confirmar:** primário, `size-lg`, desabilitado enquanto `loading`

**Botão voltar:** `← Voltar` em `text-sm text-slate-500`, sem borda

### Props

```typescript
interface Screen2PreviewProps {
  historico: HistoricoParseado
  mapeamentos: MapeamentoOptativa[]
  maxDisciplinas: number
  loading: boolean
  error: string | null
  onUpdateMapeamento: (codigo_sigaa: string, id_grade: string | null) => void
  onMaxChange: (n: number) => void
  onConfirm: () => void
  onBack: () => void
}
```

---

## 12. Tela 3 — `Screen3Results.tsx`

Wrapper das abas. Gerencia qual aba está ativa e os toggles globais.

### Estado local (dentro do Screen3Results)

```typescript
const [abaAtiva, setAbaAtiva] = useState<'plan' | 'graph' | 'compare'>('plan')
const [casoAtivo, setCasoAtivo] = useState<1 | 2>(1)
const [algoAtivo, setAlgoAtivo] = useState<1 | 2>(1)
```

O `planoAtivo` é derivado: `resultado.planos.find(p => p.caso === casoAtivo && p.algoritmo === algoAtivo)`

### Visual do header das abas

```
┌────────────────────────────────────────────────────────────┐
│  [Planejamento]  [Grafo]  [Comparativo]   Caso:[1][2] Algo:[1][2] │
└────────────────────────────────────────────────────────────┘
```

- Tab ativa: `border-b-2 border-accent-DEFAULT text-accent-DEFAULT font-semibold`
- Tab inativa: `text-slate-500 dark:text-slate-400 hover:text-slate-700`
- Indicador animado: `transition-all duration-200` deslizando na border-bottom
- Toggles de Caso e Algoritmo: pills compactos no lado direito da tab bar

### Props

```typescript
interface Screen3ResultsProps {
  resultado: ResultadoPlanejar
  semestreAtual: number
}
```

---

## 13. View 1 — `PlanView.tsx`

### Visual

```
┌── Resumo ────────────────────────────────────────────────┐
│  4 semestres  ·  21 disciplinas  ·  1.290h totais        │
└──────────────────────────────────────────────────────────┘

▼ Semestre 1 — Ímpar                    5 disciplinas · 330h
  ┌─────────────────────────────────────────────────────┐
  │  NCC0230   Inteligência Artificial     90h   6 CR   │
  │  NCC0232   Teoria da Computação        60h   4 CR   │
  │  NCC0233   Teoria dos Grafos           60h   4 CR   │
  │  NCC0234   Complexidade de Algoritmos  60h   4 CR   │
  │  UCE0025   UCE (4ª ocorrência)         60h   4 CR   │
  └─────────────────────────────────────────────────────┘

► Semestre 2 — Par                      6 disciplinas · 330h
  (colapsado)
```

### Especificação

**Card de resumo:**

- `bg-slate-800 dark:bg-slate-900 text-white rounded-xl px-6 py-4`
- Três métricas separadas por `·`: `{n} semestres`, `{n} disciplinas`, `{n}h totais`
- Badge `Caso {n} · Algoritmo {n}` no canto direito

**Cada semestre é um accordion colapsável:**

- Header: `bg-slate-700 dark:bg-slate-800 text-white rounded-lg px-4 py-3 cursor-pointer`
- Semestre atual do aluno: header com `border-l-4 border-blue-400` + label "Semestre atual →" em azul
- Ícone `▼`/`►` animado com `transition-transform duration-200`
- O primeiro semestre abre expandido por padrão, os demais colapsados

**Linhas de disciplina:**

- Código em `font-mono text-xs text-slate-400`
- Nome em `text-sm font-medium text-slate-800 dark:text-slate-200`
- CH e CR alinhados à direita em `text-xs text-slate-500`
- Badge de tipo: `obrigatoria` → `bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300`, `optativa` → `bg-purple-100 text-purple-700`, `uce` → `bg-green-100 text-green-700`
- Linhas alternadas com `clsx`

**Transição ao trocar caso/algoritmo:** `transition-opacity duration-150` (opacidade 0 → 1)

### Props

```typescript
interface PlanViewProps {
  plano: Plano
  semestreAtual: number
}
```

---

## 14. View 2 — `GraphView.tsx`

### Especificação

- Usar `@xyflow/react` (React Flow v11+)
- Instalar `dagre` para layout hierárquico: `npm install dagre @types/dagre`
- **Layout:** hierárquico por `periodo_recomendado`. Período 1 no topo, período 8 na base. Direção: top-to-bottom (`TB`)
- Usar a função `getLayoutedElements` com `dagre` para calcular posições antes de passar para o React Flow

**Nó customizado (`CustomNode`):**

- Fundo: cor conforme estado (aprovada/disponível/crítico/bloqueada — usar variáveis do design system)
- Nome abreviado: máx 18 chars + `…`
- Período no canto inferior direito em `text-[10px] opacity-60`
- Borda `2px solid` levemente mais escura que o fundo
- No dark mode: mesmas cores base com leve redução de saturação via `opacity-90`

**Código de cores dos nós:**

| Estado | Light | Dark |
|---|---|---|
| `aprovada` | `#22C55E` | `#16A34A` |
| `disponivel` | `#3B82F6` | `#2563EB` |
| `caminho_critico` | `#F97316` | `#EA580C` |
| bloqueada (padrão) | `#94A3B8` | `#64748B` |

**Arestas:**

- `type="smoothstep"`, animadas somente para arestas do caminho crítico
- Cor: `#CBD5E1` no light, `#475569` no dark

**Legenda fixa** no canto superior direito (fora do canvas do React Flow):

```
● Aprovada   ● Disponível   ● Caminho Crítico   ● Bloqueada
```

**Tooltip no hover:** usar `Tooltip` nativo do HTML (`title`) para simplicidade, ou um `div` absolutamente posicionado mostrando: nome completo, CH, créditos, semestre de oferta, estado.

**Controles:**

- Botão "Ajustar à tela" — chama `fitView()` do React Flow
- Botão "Exportar PNG" — usar a API `toPng` do `@xyflow/react`

**Fundo do painel:** `bg-slate-100 dark:bg-slate-900` com `border border-slate-200 dark:border-slate-700 rounded-xl`

### Props

```typescript
interface GraphViewProps {
  nos: NoGrafo[]
  arestas: ArestaGrafo[]
}
```

---

## 15. View 3 — `CompareView.tsx`

### Visual

```
┌── Análise automática ───────────────────────────────────────┐
│  Com a restrição de oferta semestral (Caso 1),              │
│  o planejamento leva 2 semestre(s) a mais do que            │
│  sem a restrição (Caso 2) usando o Algoritmo 1.             │
└─────────────────────────────────────────────────────────────┘

            Caso 1 · A1   Caso 1 · A2   Caso 2 · A1   Caso 2 · A2
Semestres       10            10             8 ✓           7 ✓✓
Disciplinas     21            21            21             21
CH Total      1.200h        1.200h        1.200h         1.200h

─── Detalhamento por semestre ───  Caso 1  ·  Algoritmo 1 vs 2

Sem.   Algoritmo 1                  Algoritmo 2
 1     IA, Teoria da Comp...        IA, Compiladores...
 2     Teoria dos Grafos...         Teoria da Comp...
```

### Especificação

**Card de análise automática:**

- `bg-slate-800 dark:bg-slate-900 text-white rounded-xl px-6 py-4`
- Texto gerado dinamicamente:

  ```typescript
  const caso1Semestres = planos.find(p => p.caso === 1 && p.algoritmo === 1)?.total_semestres ?? 0
  const caso2Semestres = planos.find(p => p.caso === 2 && p.algoritmo === 1)?.total_semestres ?? 0
  const diff = caso1Semestres - caso2Semestres
  // "Com a restrição de oferta semestral (Caso 1), o planejamento leva {diff} semestre(s) a mais..."
  // Se diff === 0: "Neste caso, a restrição de oferta não impactou o número de semestres."
  ```

**Tabela de métricas 4 colunas:**

- Header: `Caso 1 · A1`, `Caso 1 · A2`, `Caso 2 · A1`, `Caso 2 · A2`
- Célula com menor `total_semestres`: `bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300` + ícone ✓
- Tabela responsiva com scroll horizontal em mobile

**Tabela de detalhamento por semestre:**

- Controlada pelo toggle de Caso ativo do Screen3
- Colunas: `Semestre | Algoritmo 1 | Algoritmo 2`
- Cada célula lista os nomes abreviados das disciplinas separados por vírgula
- Células onde os algoritmos divergem ficam com fundo `bg-blue-50 dark:bg-blue-900/20`

### Props

```typescript
interface CompareViewProps {
  planos: Plano[]
  casoAtivo: 1 | 2
}
```

---

## 16. Setup do projeto

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install axios @xyflow/react dagre clsx tailwindcss autoprefixer postcss
npm install -D @types/dagre
npx tailwindcss init -p
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
})
```

### `frontend/.env`

```
VITE_API_URL=http://localhost:8000
```

Nunca use URLs hardcodadas. Sempre `import.meta.env.VITE_API_URL`.

---

## 17. Regras de implementação — NUNCA viole

- **Nunca** use `fetch` ou `axios` diretamente nos componentes — apenas via `services/api.ts`
- **Nunca** gerencie estado de fluxo fora de `hooks/usePlanner.ts`
- **Nunca** use `localStorage` ou `sessionStorage`
- **Nunca** processe o PDF no frontend
- **Nunca** use valores hexadecimais hardcodados para cores — usar classes Tailwind
- **Nunca** crie arquivos fora da estrutura definida na Seção 2 sem justificativa
- Use `clsx` para variantes condicionais de classe — não interpolação de string
- Use `React.memo` em `PlanView` e `GraphView` — são os componentes mais pesados
- Todo estado de erro deve ser visível inline — nunca `alert()` ou falha silenciosa
- Interface funcional em largura mínima de **768px**

---

## 18. Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]
```
