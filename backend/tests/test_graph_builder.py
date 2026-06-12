import pytest
import networkx as nx
from app.graph_builder import build_graph

def test_build_graph_empty_aprovadas():
    G = build_graph([])
    assert G.number_of_nodes() > 0
    assert nx.is_directed_acyclic_graph(G)

def test_build_graph_lucas_aprovadas():
    lucas_aprovadas = [
        "ALGPROG", "MATFUND", "FILOS", "FISCOMP", "LOGMAT", "TECS", "PRODTXT1",
        "CALC1", "PROBEST", "METCIENT", "INGLES", "CIRCDIG", "GEOANA", "TECPROG",
        "TRANSDAT", "UCE1", "ALGLIN", "ARQUCOMP", "ENGSW", "ESTDADOS", "PARAD",
        "REDES", "UCE2", "CALCNUM", "APS", "BD", "POO", "SO", "UCE3"
    ]
    G = build_graph(lucas_aprovadas)
    
    # Disciplinas que deveriam estar pendentes (exemplos)
    assert "IA" in G.nodes
    assert "TEOCOMP" in G.nodes
    assert "TEOGRAF" in G.nodes
    
    assert "ALGPROG" not in G.nodes
    assert "ESTDADOS" not in G.nodes

def test_graph_attributes():
    G = build_graph([])
    for node, attrs in G.nodes(data=True):
        assert "semestre_oferta" in attrs
        assert "carga_horaria" in attrs
        assert "nome" in attrs
        assert "periodo_recommended" in attrs or "periodo_recomendado" in attrs

def test_graph_edges():
    G = build_graph([])
    assert G.has_edge("TECPROG", "ESTDADOS")

def test_detect_cycle(tmp_path, monkeypatch):
    import json
    from app import graph_builder
    
    # Grade sintética com ciclo
    grade_ciclo = {
        "disciplinas": [
            {
                "id": "A", "nome": "A", "periodo_recomendado": 1, "creditos": 4, 
                "carga_horaria": 60, "semestre_oferta": 1, "pre_requisitos": ["B"], "tipo": "obrigatoria"
            },
            {
                "id": "B", "nome": "B", "periodo_recomendado": 1, "creditos": 4, 
                "carga_horaria": 60, "semestre_oferta": 1, "pre_requisitos": ["A"], "tipo": "obrigatoria"
            }
        ]
    }
    
    grade_file = tmp_path / "grade_ciclo.json"
    grade_file.write_text(json.dumps(grade_ciclo))
    
    # Mockar GRADE_PATH para usar o arquivo temporário
    monkeypatch.setattr(graph_builder, "GRADE_PATH", grade_file)
    
    with pytest.raises(ValueError, match="não é um DAG"):
        graph_builder.build_graph([])
