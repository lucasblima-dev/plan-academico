import logging
import networkx as nx

def validar_grade_json(grade: dict) -> list[str]:
    erros = []
    
    if "disciplinas" not in grade:
        erros.append("Campo 'disciplinas' não encontrado na grade.")
        return erros

    ids_existentes = {d["id"] for d in grade["disciplinas"] if "id" in d}
    campos_obrigatorios = ["id", "nome", "periodo_recomendado", "creditos", "carga_horaria", "semestre_oferta", "pre_requisitos", "tipo"]

    for idx, disc in enumerate(grade["disciplinas"]):
        # Verificar campos obrigatórios
        for campo in campos_obrigatorios:
            if campo not in disc:
                nome_disc = disc.get("id", f"índice {idx}")
                erros.append(f"Disciplina '{nome_disc}' está sem o campo obrigatório '{campo}'.")
        
        # Verificar pré-requisitos
        if "pre_requisitos" in disc:
            for pre in disc["pre_requisitos"]:
                if pre not in ids_existentes:
                    erros.append(f"Disciplina '{disc['id']}' possui pré-requisito inexistente: '{pre}'.")
                    
    return erros

def grafo_para_nos_arestas(
    G_completo: nx.DiGraph,
    disciplinas_aprovadas: list[str],
    cpm: dict[str, int],
    disciplinas_disponiveis: list[str],
    disciplinas_cursando: list[str] = []
) -> tuple[list, list]:
    from .models import NoGrafo, ArestaGrafo
    
    nos = []
    max_cpm = max(cpm.values()) if cpm else 0
    
    for node, attrs in G_completo.nodes(data=True):
        nos.append(NoGrafo(
            id=node,
            nome=attrs['nome'],
            periodo_recomendado=attrs['periodo_recomendado'],
            semestre_oferta=attrs['semestre_oferta'],
            aprovada=node in disciplinas_aprovadas,
            cursando=node in disciplinas_cursando,
            disponivel=node in disciplinas_disponiveis,
            caminho_critico=(cpm.get(node, 0) == max_cpm and node not in disciplinas_aprovadas),
            carga_horaria=attrs.get('carga_horaria', 0),
            creditos=attrs.get('creditos', 0)
        ))
        
    arestas = []
    # Construir arestas dinamicamente a partir dos pré-requisitos reais
    for node, attrs in G_completo.nodes(data=True):
        for u, v in G_completo.in_edges(node):
            arestas.append(ArestaGrafo(origem=u, destino=v))
        
    return nos, arestas
