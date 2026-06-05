import logging
import networkx as nx

def validar_grade_json(grade: dict) -> list[str]:
    """
    Valida o grade.json verificando:
    - Todos os IDs em pre_requisitos existem como disciplinas na lista.
    - Nenhum campo obrigatório está faltando.
    Retorna lista de erros encontrados (vazia se válido).
    """
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
    """
    Serializa o grafo completo para o schema NoGrafo/ArestaGrafo.
    """
    from .models import NoGrafo, ArestaGrafo
    
    nos = []
    # Determinar maior CPM para destacar caminho crítico (simplificado: maior CPM do grafo)
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
            caminho_critico=(cpm.get(node, 0) == max_cpm and node not in disciplinas_aprovadas)
        ))
        
    arestas = []
    # Construir arestas dinamicamente a partir dos pré-requisitos reais
    for node, attrs in G_completo.nodes(data=True):
        # Acessar a grade bruta para pegar os pré-requisitos originais
        # Nota: G_completo já possui as arestas se foi montado corretamente, 
        # mas vamos garantir a serialização correta aqui.
        for u, v in G_completo.in_edges(node):
            arestas.append(ArestaGrafo(origem=u, destino=v))
        
    return nos, arestas
