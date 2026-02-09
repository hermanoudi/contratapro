# Git Workflow

## Commit Message Format

```
type:descricao em portugues
```

**Types:**

| Type | When |
|------|------|
| `feat` | New feature or functionality |
| `fix` | Bug fix |
| `style` | Visual/CSS changes only |
| `chore` | Maintenance, dependencies, config |
| `refactor` | Code restructure without behavior change |

**Examples:**

```
feat:tour guiado
fix:valida CPF obrigatorio para planos pagos
feat:pagina do usuario para compartilhar
chore:atualiza dependencias do frontend
```

## Claude Commits

When Claude creates commits, include Co-Authored-By:

```
feat:descricao da feature

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Branching

- `main` is the production branch
- Feature branches when needed: `feature/nome-da-feature`
- Most changes go directly to `main` (solo developer workflow)

## Pre-Commit Checklist

Before every commit, verify:

- [ ] No secrets in code (API keys, passwords, tokens, DB URLs)
- [ ] No `console.log()` left in frontend code (except intentional debug)
- [ ] No `print()` left in backend code (use `logger` instead)
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] No syntax errors in Python files

## Monorepo Convention

When a feature touches both backend and frontend, make a single commit with all changes:

```
feat:implementa agendamento por dia inteiro
```

Not separate commits per directory.

## .gitignore

Already covers: `.env`, `*.key`, `*.pem`, `credentials.json`, `node_modules/`, `__pycache__/`, `uploads/`, `venv/`, `dist/`
