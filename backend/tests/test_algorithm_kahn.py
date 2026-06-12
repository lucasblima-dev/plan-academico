import pytest
import networkx as nx
from app.algorithm_kahn import kahn_guloso
from app.graph_builder import build_graph

def test_kahn_topological_order():
    G = build_graph([])
    plano = kahn_guloso(G, 1, 6, False)
    
    # Verificar se nenhum pré-requisito aparece depois da disciplina
    alocadas = []
    for semestre in plano:
        for disc in semestre.disciplinas:
            alocadas.append(disc.id)
            
    alocadas_set = set()
    for semestre in plano:
        for disc in semestre.disciplinas:
            pre_requisitos = list(G.predecessors(disc.id))
            for pre in pre_requisitos:
                assert pre in alocadas_set, f"Pré-requisito {pre} de {disc.id} não foi alocado antes."
        for disc in semestre.disciplinas:
            alocadas_set.add(disc.id)

def test_kahn_total_disciplinas():
    G = build_graph([])
    total_esperado = G.number_of_nodes()
    plano = kahn_guloso(G, 1, 6, False)
    
    total_alocado = sum(s.total_disciplinas for s in plano)
    assert total_alocado == total_esperado

def test_kahn_max_disciplinas():
    G = build_graph([])
    max_d = 5
    plano = kahn_guloso(G, 1, max_d, False)
    
    for semestre in plano:
        assert semestre.total_disciplinas <= max_d

def test_kahn_caso1_oferta():
    G = build_graph([])
    # Semestre atual = 1 (Ímpar)
    plano = kahn_guloso(G, 1, 6, True)
    
    for semestre in plano:
        # Se semestre.numero é ímpar (1, 3, 5...), o tipo deve ser 1 (Ímpar)
        # Se semestre.numero é par (2, 4, 6...), o tipo deve ser 2 (Par)
        tipo_esperado = 1 if semestre.numero % 2 != 0 else 2
        assert semestre.tipo_semestre == tipo_esperado
        
        for disc in semestre.disciplinas:
            assert disc.semestre_oferta == tipo_esperado

def test_kahn_empty_graph():
    G = nx.DiGraph()
    plano = kahn_guloso(G, 1, 6, False)
    assert plano == []
