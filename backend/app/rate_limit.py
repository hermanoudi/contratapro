"""
Rate limiting compartilhado (slowapi / limits).

Usado para conter brute-force / credential stuffing em endpoints sensíveis
(login, esqueci-minha-senha — ver plano de melhorias / Fase 1.4). Armazenamento
em memória: adequado para uma única instância do backend; se o Railway passar
a rodar múltiplas réplicas, o limite deixa de ser compartilhado entre elas e
uma storage compartilhada (Redis) passa a ser necessária.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
