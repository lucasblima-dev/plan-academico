import networkx as nx
from typing import List, Dict
from .models import SemestrePlano, DisciplinaPlano

def calcular_cpm(G: nx.DiGraph) -> Dict[str, int]:
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
    periodo_atual_aluno: int = 1,
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
        candidatos = [n for n in G_trabalho.nodes() if G_trabalho.in_degree(n) == 0]
        
        if not candidatos:
            break

        periodo_do_plano = periodo_atual_aluno + numero_semestre_plano - 1
        candidatos_permitidos = [
            n for n in candidatos 
            if G_trabalho.nodes[n].get('tipo') in ['optativa', 'uce'] or G_trabalho.nodes[n].get('periodo_recomendado', 1) <= periodo_do_plano
        ]

        if respeitar_oferta:
            disponiveis = [n for n in candidatos_permitidos if G_trabalho.nodes[n]['semestre_oferta'] == tipo_semestre_atual]
        else:
            disponiveis = candidatos_permitidos

        if not disponiveis:
            tipo_semestre_atual = 1 if tipo_semestre_atual == 2 else 2
            numero_semestre_plano += 1
            if numero_semestre_plano > 50: break
            continue

        disponiveis.sort(key=lambda n: cpm[n], reverse=True)

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

        G_trabalho.remove_nodes_from(selecionados)
        
        tipo_semestre_atual = 1 if tipo_semestre_atual == 2 else 2
        numero_semestre_plano += 1

    return planejamento
