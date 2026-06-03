import logging

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
