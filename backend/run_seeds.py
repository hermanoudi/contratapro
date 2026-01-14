#!/usr/bin/env python3
"""
Script para executar seeds do banco de dados.

Uso:
    python run_seeds.py

Este script popula o banco de dados com dados iniciais (categorias).
É seguro executar múltiplas vezes - verifica se dados já existem.
"""

import sys
import os
import asyncio

# Adicionar o diretório app ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.seeds import run_seeds  # noqa: E402

if __name__ == "__main__":
    print("Executando seeds do banco de dados...")
    print()
    asyncio.run(run_seeds())
