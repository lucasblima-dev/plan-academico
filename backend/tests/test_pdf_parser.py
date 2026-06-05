import pytest
from app.pdf_parser import parse_historico
from pathlib import Path

SAMPLE_PDF_PATH = Path(__file__).parent.parent / "samples" / "historico_lucas.pdf"

def test_parse_historico_lucas():
    assert SAMPLE_PDF_PATH.exists(), f"Arquivo não encontrado: {SAMPLE_PDF_PATH}"

    with open(SAMPLE_PDF_PATH, "rb") as f:
        pdf_bytes = f.read()

    resultado = parse_historico(pdf_bytes)

    # Verificar Nome do Aluno
    assert resultado.nome_aluno.upper() == "LUCAS BEZERRA DE LIMA"

    # Verificar Matrícula
    assert resultado.matricula == "20240021666"

    # Verificar Semestre Atual (Período Ímpar == 1)
    assert resultado.semestre_atual == 1
    assert resultado.periodo_atual == 5

    # Verificar Disciplinas Aprovadas
    # IDs esperados da lista em DATA.md
    ids_esperados = {
        "ALGPROG", "MATFUND", "FILOS", "FISCOMP", "LOGMAT", "TECS", "PRODTXT1",
        "CALC1", "PROBEST", "METCIENT", "INGLES", "CIRCDIG", "GEOANA", "TECPROG",
        "TRANSDAT", "UCE1", "ALGLIN", "ARQUCOMP", "ENGSW", "ESTDADOS", "PARAD",
        "REDES", "UCE2", "CALCNUM", "APS", "BD", "POO", "SO", "UCE3"
    }
    
    set_aprovadas = set(resultado.disciplinas_aprovadas)
    
    assert len(set_aprovadas) == 29
    assert set_aprovadas == ids_esperados

    # Verificar Não Mapeadas (Optativas)
    
    codigos_nao_mapeados = {d.codigo_sigaa for d in resultado.nao_mapeadas}
    
    # Se elas estiverem no PDF como aprovadas, o teste passa.
    # Se estiverem como MATR, o parser atual as ignora.
    
    assert "CAN0073" in codigos_nao_mapeados
    assert "CAN0062" in codigos_nao_mapeados
    assert "CAN0065" in codigos_nao_mapeados
