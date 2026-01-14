#!/usr/bin/env python3
"""
Script para executar seeds do banco de dados.

Uso:
    python run_seeds.py

Este script popula o banco de dados com dados iniciais (categorias de serviços).
É seguro executar múltiplas vezes - ele verifica se os dados já existem antes de inserir.
"""

import sys
import os

# Adicionar o diretório app ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.seeds import run_seeds

if __name__ == "__main__":
    print("Executando seeds do banco de dados...")
    print()
    run_seeds()
