import networkx as nx
from typing import List, Dict
from .models import SemestrePlano, DisciplinaPlano

def kahn_guloso(
    G: nx.DiGraph,
    semestre_atual_aluno: int,
    max_disciplinas: int,
    respeitar_oferta: bool,
    periodo_atual_aluno: int = 1,
) -> List[SemestrePlano]:
    """
    Gera planejamento usando ordenação topológica (Kahn) com heurística gulosa (out-degree).
    """
    G_trabalho = G.copy()
    planejamento = []
    
    tipo_semestre_atual = semestre_atual_aluno
    numero_semestre_plano = 1

    while G_trabalho.number_of_nodes() > 0:
        # 1. Identificar candidatos (in-degree zero)
        candidatos = [n for n in G_trabalho.nodes() if G_trabalho.in_degree(n) == 0]
        
        if not candidatos:
            # Isso não deveria acontecer em um DAG, a menos que haja erro na lógica
            break

        # Filtrar candidatos pelo período recomendado (liberando optativas e UCEs)
        periodo_do_plano = periodo_atual_aluno + numero_semestre_plano - 1
        candidatos_permitidos = [
            n for n in candidatos 
            if G_trabalho.nodes[n].get('tipo') in ['optativa', 'uce'] or G_trabalho.nodes[n].get('periodo_recomendado', 1) <= periodo_do_plano
        ]

        # 2. Filtrar por oferta se necessário
        if respeitar_oferta:
            # tipo_semestre_atual: 1 (ímpar), 2 (par)
            # disc.semestre_oferta: 1 (ímpar), 2 (par)
            disponiveis = [n for n in candidatos_permitidos if G_trabalho.nodes[n]['semestre_oferta'] == tipo_semestre_atual]
        else:
            disponiveis = candidatos_permitidos

        # 3. Se não houver disponíveis por causa da oferta, avançamos o semestre
        if not disponiveis:
            # Adicionar semestre vazio ou apenas avançar? 
            # Avançamos o semestre e tentamos novamente.
            tipo_semestre_atual = 1 if tipo_semestre_atual == 2 else 2
            numero_semestre_plano += 1
            # Para evitar loop infinito em grafos desconectados ou erro de dados
            if numero_semestre_plano > 50: break 
            continue

        # 4. Heurística Gulosa: ordenar por out-degree decrescente
        # Prioriza disciplinas que "desbloqueiam" mais disciplinas
        disponiveis.sort(key=lambda n: G_trabalho.out_degree(n), reverse=True)

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
        
        # Avançar para o próximo semestre do plano
        tipo_semestre_atual = 1 if tipo_semestre_atual == 2 else 2
        numero_semestre_plano += 1

    return planejamento
