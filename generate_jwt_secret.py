#!/usr/bin/env python3
"""
Gerador de JWT Secret Key para produção

Execute este script para gerar um secret forte e seguro:
    python generate_jwt_secret.py

O secret gerado pode ser usado como valor de JWT_SECRET_KEY
"""

import secrets

def generate_jwt_secret(length=32):
    """Gera um secret forte usando secrets do Python"""
    return secrets.token_urlsafe(length)

if __name__ == "__main__":
    secret = generate_jwt_secret()

    print("=" * 60)
    print("🔐 JWT SECRET KEY GERADO")
    print("=" * 60)
    print()
    print(f"JWT_SECRET_KEY={secret}")
    print()
    print("=" * 60)
    print("📋 COMO USAR:")
    print("=" * 60)
    print("1. Copie o valor acima (apenas a parte após o =)")
    print("2. No Railway, vá em Variables")
    print("3. Adicione uma nova variável:")
    print("   - Name: JWT_SECRET_KEY")
    print(f"   - Value: {secret}")
    print("4. Salve e redesenhe o deploy")
    print()
    print("⚠️  IMPORTANTE:")
    print("- NUNCA compartilhe este secret")
    print("- NUNCA commite no Git")
    print("- Use apenas em variáveis de ambiente")
    print("=" * 60)
