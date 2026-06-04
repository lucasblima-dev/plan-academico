import networkx as nx
import json
from pathlib import Path
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)

GRADE_PATH = Path(__file__).parent.parent / "data" / "grade.json"

def build_graph(disciplinas_aprovadas: List[str]) -> nx.DiGraph:
    """
    Constrói o DAG da grade curricular removendo as disciplinas aprovadas.

    Args:
        disciplinas_aprovadas: lista de IDs do grade.json já concluídas.

    Returns:
        nx.DiGraph com as disciplinas pendentes e suas arestas de pré-requisito.
        Cada nó tem os atributos: nome, carga_horaria, creditos,
        semestre_oferta, periodo_recomendado, tipo.

    Raises:
        ValueError: se o grafo resultante contiver ciclos.
        FileNotFoundError: se o arquivo grade.json não for encontrado.
    """
    if not GRADE_PATH.exists():
        logger.error(f"Arquivo de grade não encontrado em: {GRADE_PATH}")
        raise FileNotFoundError(f"Grade curricular não encontrada em {GRADE_PATH}")

    with open(GRADE_PATH, "r", encoding="utf-8") as f:
        grade_data = json.load(f)

    G = nx.DiGraph()

    # 1. Adicionar todos os nós com seus atributos
    for disc in grade_data["disciplinas"]:
        G.add_node(
            disc["id"],
            nome=disc["nome"],
            periodo_recomendado=disc["periodo_recomendado"],
            creditos=disc["creditos"],
            carga_horaria=disc["carga_horaria"],
            semestre_oferta=disc["semestre_oferta"],
            tipo=disc["tipo"]
        )

    # 2. Adicionar arestas (prerequisito -> disciplina)
    for disc in grade_data["disciplinas"]:
        for pre in disc.get("pre_requisitos", []):
            if pre in G:
                G.add_edge(pre, disc["id"])
            else:
                logger.warning(f"Pré-requisito {pre} da disciplina {disc['id']} não encontrado na grade.")

    # 3. Remover nós das disciplinas aprovadas
    # Usamos uma lista para evitar erro de mutação durante a iteração se fôssemos iterar no grafo
    for disc_id in disciplinas_aprovadas:
        if disc_id in G:
            G.remove_node(disc_id)
        else:
            logger.info(f"Disciplina aprovada {disc_id} não encontrada no grafo (pode ser uma optativa não mapeada ou erro de id).")

    # 4. Verificar se é um DAG
    if not nx.is_directed_acyclic_graph(G):
        ciclo = nx.find_cycle(G)
        logger.error(f"O grafo da grade curricular contém ciclos: {ciclo}")
        raise ValueError(f"O grafo resultante não é um DAG. Ciclo detectado: {ciclo}")

    return G

def get_full_graph() -> nx.DiGraph:
    """
    Retorna o grafo completo da grade (sem remoções) para fins de visualização.
    """
    if not GRADE_PATH.exists():
        raise FileNotFoundError(f"Grade curricular não encontrada em {GRADE_PATH}")

    with open(GRADE_PATH, "r", encoding="utf-8") as f:
        grade_data = json.load(f)

    G = nx.DiGraph()
    for disc in grade_data["disciplinas"]:
        G.add_node(
            disc["id"],
            nome=disc["nome"],
            periodo_recomendado=disc["periodo_recomendado"],
            creditos=disc["creditos"],
            carga_horaria=disc["carga_horaria"],
            semestre_oferta=disc["semestre_oferta"],
            tipo=disc["tipo"]
        )
        for pre in disc.get("pre_requisitos", []):
            G.add_edge(pre, disc["id"])
    
    return G
