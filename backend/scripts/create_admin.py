"""
Script de bootstrap: cria (ou promove) um usuário administrador diretamente
no banco de dados, sem passar por HTTP.

Substitui o antigo endpoint público POST /admin/setup/create-admin, que
aceitava qualquer origem e era protegido apenas por uma comparação de string
não constant-time contra settings.SECRET_KEY (o mesmo segredo usado para
assinar JWTs). Ver plano de melhorias / Fase 1.2.

Uso:
    cd backend
    python scripts/create_admin.py admin@contratapro.com.br "SenhaForte@123" "Administrador"

Requer acesso direto ao banco (mesma DATABASE_URL usada pela aplicação).
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.database import AsyncSessionLocal  # noqa: E402
from app.models import User  # noqa: E402
from app.auth_utils import get_password_hash  # noqa: E402
from app.routers.auth import validate_password_strength  # noqa: E402


async def create_admin(email: str, password: str, name: str = "Administrador") -> None:
    criteria = validate_password_strength(password)
    if not all(criteria.values()):
        missing = [k for k, ok in criteria.items() if not ok]
        raise SystemExit(f"Senha fraca. Critérios não atendidos: {', '.join(missing)}")

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        existing = result.scalar_one_or_none()

        if existing:
            if existing.is_admin:
                print(f"Usuário {email} já existe e já é administrador (id={existing.id}).")
                return
            existing.is_admin = True
            await db.commit()
            print(f"Usuário {email} promovido a administrador (id={existing.id}).")
            return

        admin = User(
            name=name,
            email=email,
            hashed_password=get_password_hash(password),
            is_active=True,
            is_admin=True,
            is_professional=False,
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        print(f"Administrador criado: {email} (id={admin.id}).")


def main() -> None:
    if len(sys.argv) < 3:
        print(__doc__)
        raise SystemExit(1)
    email = sys.argv[1]
    password = sys.argv[2]
    name = sys.argv[3] if len(sys.argv) > 3 else "Administrador"
    asyncio.run(create_admin(email, password, name))


if __name__ == "__main__":
    main()
