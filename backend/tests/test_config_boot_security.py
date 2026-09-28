"""
Garante que a aplicação recusa subir com um segredo de JWT ausente ou
inseguro (Fase 1.1 do plano de melhorias).

Roda em subprocessos isolados, porque a validação acontece na importação
de app.config (uma única vez por processo) — não dá para testar "o processo
não sobe" reimportando o módulo no mesmo processo que já rodou o resto da
suíte com um segredo válido.
"""
import subprocess
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _run_with_env(env_overrides: dict, isolate_from_dotenv: bool = False) -> subprocess.CompletedProcess:
    """
    Roda `import app.config` num subprocesso limpo.

    isolate_from_dotenv=True executa com cwd="/" em vez de BACKEND_DIR: como
    `Settings.Config.env_file = ".env"` é resolvido relativo ao cwd,
    isso garante que backend/.env (que tem um SECRET_KEY real neste
    ambiente de desenvolvimento) não mascare o cenário testado — só as
    variáveis de ambiente passadas explicitamente contam. Usa PYTHONPATH
    para que `import app.config` continue resolvendo o pacote normalmente.
    """
    import os

    env = os.environ.copy()
    env.pop("SECRET_KEY", None)
    env.pop("JWT_SECRET_KEY", None)
    env.update(env_overrides)

    cwd = "/" if isolate_from_dotenv else str(BACKEND_DIR)
    if isolate_from_dotenv:
        env["PYTHONPATH"] = str(BACKEND_DIR)

    return subprocess.run(
        [sys.executable, "-c", "import app.config"],
        cwd=cwd,
        env=env,
        capture_output=True,
        text=True,
        timeout=30,
    )


def test_boot_fails_without_any_secret_key():
    # SECRET_KEY="" força o cenário de "nenhum segredo configurado" mesmo
    # quando backend/.env (arquivo local, fora do git) tem um valor real:
    # variáveis de ambiente têm prioridade sobre o .env no pydantic-settings,
    # então um valor vazio aqui não é mascarado pelo .env do desenvolvedor.
    result = _run_with_env({"SECRET_KEY": ""})
    assert result.returncode != 0
    assert "SECRET_KEY" in result.stderr


def test_boot_fails_with_known_insecure_default():
    result = _run_with_env({"SECRET_KEY": "your-secret-key-here-change-in-production"})
    assert result.returncode != 0
    assert "SECRET_KEY" in result.stderr


def test_boot_fails_with_known_insecure_fallback_literal():
    result = _run_with_env({"SECRET_KEY": "fallback-secret"})
    assert result.returncode != 0
    assert "SECRET_KEY" in result.stderr


def test_boot_accepts_legacy_jwt_secret_key_env_var():
    """
    Compatibilidade de transição: ambientes (ex: Railway, que hoje só define
    JWT_SECRET_KEY e não tem um backend/.env local) continuam funcionando
    sem precisar ser migrados no mesmo momento em que este fix for
    implantado. Roda isolado de backend/.env (ver isolate_from_dotenv em
    _run_with_env) — sem isso, o teste passaria mesmo que o alias
    JWT_SECRET_KEY estivesse quebrado, porque o SECRET_KEY real do .env
    local mascararia o problema.
    """
    result = _run_with_env(
        {"JWT_SECRET_KEY": "um-segredo-forte-vindo-do-nome-legado-xyz789"},
        isolate_from_dotenv=True,
    )
    assert result.returncode == 0, result.stderr


def test_boot_fails_without_any_secret_key_and_without_dotenv():
    """
    Cenário mais próximo da produção real: nenhuma variável de segredo
    definida e nenhum backend/.env presente (Railway não tem esse arquivo).
    """
    result = _run_with_env({}, isolate_from_dotenv=True)
    assert result.returncode != 0
    assert "SECRET_KEY" in result.stderr


def test_boot_succeeds_with_a_real_secret_key():
    result = _run_with_env({"SECRET_KEY": "um-segredo-forte-gerado-para-este-teste-abc123"})
    assert result.returncode == 0, result.stderr
