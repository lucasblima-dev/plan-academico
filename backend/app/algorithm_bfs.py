import networkx as nx
from typing import List, Dict
from .models import SemestrePlano, DisciplinaPlano

def calcular_cpm(G: nx.DiGraph) -> Dict[str, int]:
    """
    Calcula o comprimento do maior caminho (em número de nós) de cada nó 
    até qualquer folha do grafo.
    """
    cpm = {}
    # Ordenação topológica reversa para garantir que processamos sucessores antes de predecessores
    for node in reversed(list(nx.topological_sort(G))):
        successors = list(G.successors(node))
        if not successors:
            cpm[node] = 1
        else:
            cpm[node] = 1 + max(cpm[s] for s in successors)
    return cpm

def bfs_cpm(
    G: nx.DiGraph,
    semestre_atual_aluno: int,
    max_disciplinas: int,
    respeitar_oferta: bool,
) -> List[SemestrePlano]:
    """
    Gera planejamento usando BFS por níveis com prioridade por caminho crítico.
    """
    if G.number_of_nodes() == 0:
        return []

    G_trabalho = G.copy()
    cpm = calcular_cpm(G_trabalho)
    planejamento = []
    
    tipo_semestre_atual = semestre_atual_aluno
    numero_semestre_plano = 1

    while G_trabalho.number_of_nodes() > 0:
        # 1. Identificar candidatos (in-degree zero)
        candidatos = [n for n in G_trabalho.nodes() if G_trabalho.in_degree(n) == 0]
        
        if not candidatos:
            break

        # 2. Filtrar por oferta se necessário
        if respeitar_oferta:
            disponiveis = [n for n in candidatos if G_trabalho.nodes[n]['semestre_oferta'] == tipo_semestre_atual]
        else:
            disponiveis = candidatos

        # 3. Se não houver disponíveis por causa da oferta, avançamos o semestre
        if not disponiveis:
            tipo_semestre_atual = 1 if tipo_semestre_atual == 2 else 2
            numero_semestre_plano += 1
            if numero_semestre_plano > 50: break
            continue

        # 4. Prioridade por Caminho Crítico (CPM) decrescente
        disponiveis.sort(key=lambda n: cpm[n], reverse=True)

        # 5. Selecionar até max_disciplinas respeitando a restrição de 1 UCE por semestre
        selecionados = []
        tem_uce = False
        
        for n in disponiveis:
            if len(selecionados) >= max_disciplinas:
                break
            
            is_uce = G_trabalho.nodes[n].get('tipo') == 'uce'
            if is_uce:
                if not tem_uce:
                    selecionados.append(n)
                    tem_uce = True
            else:
                selecionados.append(n)

        # 6. Criar objeto SemestrePlano
        disciplinas_plano = []
        total_ch = 0
        for s_id in selecionados:
            attrs = G_trabalho.nodes[s_id]
            disciplinas_plano.append(DisciplinaPlano(
                id=s_id,
                nome=attrs['nome'],
                carga_horaria=attrs['carga_horaria'],
                creditos=attrs['creditos'],
                semestre_oferta=attrs['semestre_oferta'],
                tipo=attrs['tipo']
            ))
            total_ch += attrs['carga_horaria']

        planejamento.append(SemestrePlano(
            numero=numero_semestre_plano,
            tipo_semestre=tipo_semestre_atual,
            disciplinas=disciplinas_plano,
            total_disciplinas=len(selecionados),
            total_carga_horaria=total_ch
        ))

        # 7. Remover do grafo e atualizar
        G_trabalho.remove_nodes_from(selecionados)
        
        tipo_semestre_atual = 1 if tipo_semestre_atual == 2 else 2
        numero_semestre_plano += 1

    return planejamento
