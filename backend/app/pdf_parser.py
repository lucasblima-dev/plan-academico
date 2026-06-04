import pdfplumber
import re
import io
import logging
from .models import HistoricoParseado, DisciplinaNaoMapeada

logger = logging.getLogger(__name__)

SITUACOES_APROVADAS = {"APR", "CUMP", "DISP", "APRN", "TRANS", "INCORP"}

SIGAA_PARA_ID: dict[str, str] = {
    # ── 1º período ──────────────────────────────────────────────────────────
    "NCC0211": "ALGPROG",    # Algoritmos e Programação
    "CAN0077": "ALGPROG",    # Algoritmos e Programação (equivalência CAN)
    "NCC0109": "MATFUND",    # Matemática Fundamental
    "NCC0212": "FILOS",      # Filosofia da Ciência
    "NCC0214": "LOGMAT",     # Lógica Matemática Aplicada à Computação
    "NCC0213": "FISCOMP",    # Física para Computação
    "NCC0215": "TECS",       # Tecnologia, Ética e Sociedade
    "NCC0108": "PRODTXT1",   # Produção Textual
    # ── 2º período ──────────────────────────────────────────────────────────
    "NCC0179": "INGLES",     # Inglês Técnico
    "NCC0116": "CALC1",      # Cálculo
    "NCC0114": "METCIENT",   # Metodologia para o Trabalho Científico
    "NCC0218": "TECPROG",    # Técnicas de Programação
    "NCC0217": "GEOANA",     # Geometria Analítica
    "NCC0216": "CIRCDIG",    # Circuitos Digitais
    "UCE0002": "UCE1",       # UCE 1ª ocorrência
    # ── 3º período ──────────────────────────────────────────────────────────
    "NCC0222": "ESTDADOS",   # Estrutura de Dados
    "NCC0223": "PARAD",      # Paradigmas de Programação
    "NCC0220": "ARQUCOMP",   # Arquitetura de Computadores
    "NCC0221": "ENGSW",      # Engenharia de Software
    "NCC0224": "PROBEST",    # Probabilidade e Estatística
    "NCC0219": "ALGLIN",     # Álgebra Linear
    "UCE0023": "UCE2",       # UCE 2ª ocorrência
    # ── 4º período ──────────────────────────────────────────────────────────
    "NCC0015": "CALCNUM",    # Cálculo Numérico Computacional
    "NCC0225": "APS",        # Análise e Projeto de Sistemas
    "NCC0226": "BD",         # Banco de Dados
    "NCC0227": "POO",        # Programação Orientada a Objetos
    "NCC0228": "SO",         # Sistemas Operacionais
    "NCC0229": "TRANSDAT",   # Transmissão de Dados
    "UCE0024": "UCE3",       # UCE 3ª ocorrência
    # ── 5º período ──────────────────────────────────────────────────────────
    "NCC0230": "IA",         # Inteligência Artificial
    "NCC0232": "TEOCOMP",    # Teoria da Computação
    "NCC0231": "REDES",      # Redes de Computadores
    "UCE0025": "UCE4",       # UCE 4ª ocorrência
    # ── 6º período ──────────────────────────────────────────────────────────
    "NCC0233": "TEOGRAF",    # Teoria dos Grafos
    "NCC0236": "PRODCIENT",  # Produção Científica
    "UCE0026": "UCE5",       # UCE 5ª ocorrência
    "NCC0237": "SISDIST",    # Sistemas Distribuídos
    "NCC0235": "COMPGRAF",   # Computação Gráfica
    # ── 7º período ──────────────────────────────────────────────────────────
    "NCC0234": "COMPALG",    # Complexidade de Algoritmos
    "NCC0238": "COMP",       # Compiladores
    "NCC0129": "PTCC",       # Projeto de TCC
    "UCE0027": "UCE6",       # UCE 6ª ocorrência
    "NCC0127": "TGAEMP",     # Teoria Geral de Adm. e Empreendedorismo
    "NCC0239": "VISCOMP",    # Processamento de Imagem e Visão Computacional
    "NCC0240": "PROGPAR",    # Programação Paralela
    # ── 8º período ──────────────────────────────────────────────────────────
    "CAN0075": "TCC",        # Trabalho de Conclusão de Curso
    # ── Optativas identificadas no histórico ────────────────────────
    "CAN0073": None,         # Tópicos Especiais em Sistemas Embarcados I
    "CAN0062": None,         # Prática de Programação para Robótica I
    "CAN0065": None,         # Programação para Dispositivos Móveis
}

def parse_historico(pdf_bytes: bytes) -> HistoricoParseado:
    nome_aluno = ""
    matricula = ""
    periodo_atual = 1
    semestre_atual = 1
    disciplinas_aprovadas = []
    disciplinas_cursando = []
    nao_mapeadas = []

    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        primeira_pagina = pdf.pages[0].extract_text()
        
        # Validar se é um Histórico Escolar do SIGAA
        if "HISTÓRICO ESCOLAR" not in primeira_pagina.upper():
            raise ValueError("O arquivo enviado não parece ser um Histórico Escolar válido do SIGAA.")

        # Extrair Nome do Aluno
        match_nome = re.search(r"Nome:\s+(.+?)\s+Matrícula:", primeira_pagina)
        if match_nome:
            nome_aluno = match_nome.group(1).strip()
        else:
            match_nome = re.search(r"Discente:\s+(.+)", primeira_pagina)
            if match_nome:
                nome_aluno = match_nome.group(1).strip()

        # Extrair Matrícula
        match_matr = re.search(r"Matrícula:\s+(\d+)", primeira_pagina)
        if match_matr:
            matricula = match_matr.group(1).strip()

        # Extrair Período Letivo Atual
        match_periodo = re.search(r"Período Letivo Atual:\s+(\d+)", primeira_pagina)
        if match_periodo:
            periodo_atual = int(match_periodo.group(1))
            semestre_atual = 1 if periodo_atual % 2 != 0 else 2

        # Extrair componentes curriculares
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                if not table or len(table[0]) < 5:
                    continue
                
                header = [str(cell).lower() if cell else "" for cell in table[0]]
                if "componente" not in "".join(header) or "situação" not in "".join(header):
                    continue

                idx_codigo = 2
                idx_nome = 3
                idx_sit = -1
                
                # Tentar encontrar a coluna Situação dinamicamente
                for i, col in enumerate(table[0]):
                    if col and "situação" in col.lower():
                        idx_sit = i
                        break
                
                if idx_sit == -1: idx_sit = 10 # Fallback se o cabeçalho estiver quebrado

                for row in table[1:]:
                    if not row or len(row) <= max(idx_codigo, idx_nome, idx_sit):
                        continue
                    
                    codigo = str(row[idx_codigo]).strip()
                    nome_raw = str(row[idx_nome]).strip()
                    situacao = str(row[idx_sit]).strip().upper()

                    # Validar se o código tem formato SIGAA
                    if not re.match(r'^[A-Z]{2,4}\d{4}$', codigo):
                        encontrou = False
                        for i in [1, 2, 3]:
                            if i >= len(row): continue
                            potencial = str(row[i]).strip()
                            if re.match(r'^[A-Z]{2,4}\d{4}$', potencial):
                                codigo = potencial
                                if i+1 < len(row):
                                    nome_raw = str(row[i+1]).strip()
                                encontrou = True
                                break
                        if not encontrou: continue

                    mapped_id = SIGAA_PARA_ID.get(codigo)
                    
                    # Limpar nome (remover docente e códigos entre parênteses)
                    nome_limpo = nome_raw.split("\n")[0]
                    nome_limpo = re.sub(r'\(\d+\)', '', nome_limpo).strip()

                    if situacao in SITUACOES_APROVADAS:
                        if mapped_id:
                            disciplinas_aprovadas.append(mapped_id)
                        else:
                            nao_mapeadas.append(DisciplinaNaoMapeada(
                                codigo_sigaa=codigo,
                                nome_sigaa=nome_limpo,
                                situacao=situacao
                            ))
                    elif situacao == "MATR":
                        if mapped_id:
                            disciplinas_cursando.append(mapped_id)
                        else:
                            nao_mapeadas.append(DisciplinaNaoMapeada(
                                codigo_sigaa=codigo,
                                nome_sigaa=nome_limpo,
                                situacao=situacao
                            ))

    # Remover duplicatas mantendo a ordem
    disciplinas_aprovadas = list(dict.fromkeys(disciplinas_aprovadas))
    disciplinas_cursando = list(dict.fromkeys(disciplinas_cursando))

    return HistoricoParseado(
        nome_aluno=nome_aluno,
        matricula=matricula,
        periodo_atual=periodo_atual,
        semestre_atual=semestre_atual,
        disciplinas_aprovadas=disciplinas_aprovadas,
        disciplinas_cursando=disciplinas_cursando,
        nao_mapeadas=nao_mapeadas
    )
