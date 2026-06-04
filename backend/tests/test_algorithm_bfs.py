import pytest
import networkx as nx
from app.algorithm_bfs import bfs_cpm, calcular_cpm
from app.graph_builder import build_graph

def test_calcular_cpm():
    G = nx.DiGraph()
    G.add_edge("A", "B")
    G.add_edge("B", "C")
    G.add_edge("D", "C")
    
    cpm = calcular_cpm(G)
    
    assert cpm["C"] == 1
    assert cpm["B"] == 2
    assert cpm["A"] == 3
    assert cpm["D"] == 2

def test_bfs_topological_order():
    """K1 (aplicado ao BFS): Ordem topológica respeitada."""
    G = build_graph([])
    plano = bfs_cpm(G, 1, 6, False)
    
    alocadas_set = set()
    for semestre in plano:
        for disc in semestre.disciplinas:
            pre_requisitos = list(G.predecessors(disc.id))
            for pre in pre_requisitos:
                assert pre in alocadas_set, f"Pré-requisito {pre} de {disc.id} não alocado antes."
        for disc in semestre.disciplinas:
            alocadas_set.add(disc.id)

def test_bfs_cpm_efficiency():
    """B4: BFS CPM tende a ser igual ou melhor que Kahn em semestres."""
    from app.algorithm_kahn import kahn_guloso
    G = build_graph([])
    
    p_kahn = kahn_guloso(G, 1, 6, True)
    p_bfs = bfs_cpm(G, 1, 6, True)
    
    assert len(p_bfs) <= len(p_kahn)

def test_critical_path_priority():
    """B5: TCC deve estar entre os últimos semestres e após PTCC."""
    G = build_graph([])
    plano = bfs_cpm(G, 1, 6, True)
    
    # Encontrar semestres de PTCC e TCC
    sem_ptcc = -1
    sem_tcc = -1
    for s in plano:
        ids = [d.id for d in s.disciplinas]
        if "PTCC" in ids:
            sem_ptcc = s.numero
        if "TCC" in ids:
            sem_tcc = s.numero
            
    assert sem_tcc > sem_ptcc
    assert sem_tcc >= 8  # TCC é do 8º período, não pode ser antes
    
    assert len(plano) <= 12 
