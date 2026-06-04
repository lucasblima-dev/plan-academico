import networkx as nx
from typing import List, Dict
from .models import SemestrePlano, DisciplinaPlano

def kahn_guloso(
    G: nx.DiGraph,
    semestre_atual_aluno: int,
    max_disciplinas: int,
    respeitar_oferta: bool,
) -> List[SemestrePlano]:
    """
    Gera planejamento usando ordenação topológica (Kahn) com heurística gulosa (out-degree).

    Args:
        G: DAG das disciplinas pendentes.
        semestre_atual_aluno: 1 (ímpar) ou 2 (par) - o semestre em que o aluno ESTÁ agora.
                             O plano começa no PRÓXIMO semestre letivo? 
                             Não, o GEMINI.md diz "Detecta semestre_atual a partir de Período Letivo Atual".
                             Se Período 5 -> semestre_atual=1. 
                             O planejamento deve começar no semestre_atual ou no próximo?
                             Geralmente planejamento é para o futuro. 
                             Mas o Algoritmo diz: "semestre = semestre_atual".
                             Vamos assumir que semestre_atual_aluno é o tipo do primeiro semestre do plano.
    """
    G_trabalho = G.copy()
    planejamento = []
    
    # O semestre_atual_aluno aqui representa o tipo (1 ou 2) do primeiro semestre do planejamento.
    # Se o aluno já está no semestre 1 (Ímpar), o plano pode ser para o semestre 2 (Par)?
    # GEMINI.md seção 6 diz: "Detecta semestre_atual... API retorna HistoricoParseado: {semestre_atual...}".
    # Vamos seguir o pseudocódigo: "semestre = semestre_atual".
    
    tipo_semestre_atual = semestre_atual_aluno
    numero_semestre_plano = 1

    while G_trabalho.number_of_nodes() > 0:
        # 1. Identificar candidatos (in-degree zero)
        candidatos = [n for n in G_trabalho.nodes() if G_trabalho.in_degree(n) == 0]
        
        if not candidatos:
            # Isso não deveria acontecer em um DAG, a menos que haja erro na lógica
            break

        # 2. Filtrar por oferta se necessário
        if respeitar_oferta:
            # tipo_semestre_atual: 1 (ímpar), 2 (par)
            # disc.semestre_oferta: 1 (ímpar), 2 (par)
            disponiveis = [n for n in candidatos if G_trabalho.nodes[n]['semestre_oferta'] == tipo_semestre_atual]
        else:
            disponiveis = candidatos

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

        # 5. Selecionar até max_disciplinas
        selecionados = disponiveis[:max_disciplinas]

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
