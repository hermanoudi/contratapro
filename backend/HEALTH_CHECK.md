# Health Check - Monitoramento da Aplicação

Este documento descreve os endpoints de health check disponíveis e como utilizá-los para monitoramento.

## 📊 Endpoints Disponíveis

### 1. `/health/` - Health Check Completo

**Uso**: Monitoramento geral da aplicação e seus serviços.

**Método**: GET

**Resposta de Sucesso (200 OK)**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-05T13:43:01.493104Z",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "healthy",
      "response_time_ms": 126.84,
      "message": "Database connection successful"
    },
    "viacep": {
      "status": "healthy",
      "response_time_ms": 725.08,
      "message": "ViaCEP API is reachable"
    },
    "cloudinary": {
      "status": "healthy",
      "message": "Cloudinary configured",
      "cloud_name": "your-cloud"
    }
  }
}
```

**Status Possíveis**:
- `healthy`: Todos os serviços funcionando normalmente
- `degraded`: Aplicação funcional, mas serviços externos com problemas
- `unhealthy`: Serviços críticos (banco de dados) com falha

**Códigos HTTP**:
- `200 OK`: Sistema saudável ou degradado
- `503 Service Unavailable`: Sistema não saudável (banco offline)

### 2. `/health/liveness` - Liveness Probe

**Uso**: Verificar se a aplicação está viva (não travada).

**Método**: GET

**Resposta (200 OK)**:
```json
{
  "status": "alive",
  "timestamp": "2026-01-05T13:43:05.338256Z"
}
```

**Quando usar**:
- Kubernetes liveness probe
- Docker healthcheck básico
- Monitoramento de processo

**Ação em caso de falha**: Reiniciar o container/processo

### 3. `/health/readiness` - Readiness Probe

**Uso**: Verificar se a aplicação está pronta para receber tráfego.

**Método**: GET

**Resposta de Sucesso (200 OK)**:
```json
{
  "status": "ready",
  "timestamp": "2026-01-05T13:43:09.802299Z",
  "database": {
    "status": "healthy",
    "response_time_ms": 4.9,
    "message": "Database connection successful"
  }
}
```

**Resposta de Falha (503 Service Unavailable)**:
```json
{
  "status": "not_ready",
  "timestamp": "2026-01-05T13:43:09.802299Z",
  "reason": "Database connection failed"
}
```

**Quando usar**:
- Kubernetes readiness probe
- Load balancer health checks
- Verificação pré-deploy

**Ação em caso de falha**: Remover do load balancer, não rotear tráfego

## 🐳 Configuração Docker

### docker-compose.yml

```yaml
services:
  backend:
    build: ./backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/liveness"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Dockerfile

```dockerfile
FROM python:3.12-slim

# ... instalações ...

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health/liveness || exit 1
```

## ☸️ Configuração Kubernetes

### Deployment com Probes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chama-eu-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chama-eu-backend
  template:
    metadata:
      labels:
        app: chama-eu-backend
    spec:
      containers:
      - name: backend
        image: chama-eu-backend:latest
        ports:
        - containerPort: 8000

        # Liveness Probe - Verifica se o processo está travado
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        # Readiness Probe - Verifica se está pronto para tráfego
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 8000
          initialDelaySeconds: 20
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 2

        # Startup Probe - Aguarda inicialização completa
        startupProbe:
          httpGet:
            path: /health/liveness
            port: 8000
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 30
```

## 📈 Integração com Monitoramento

### Prometheus

Exemplo de scrape config:

```yaml
scrape_configs:
  - job_name: 'chama-eu-backend'
    metrics_path: '/health/'
    static_configs:
      - targets: ['backend:8000']
```

Para adicionar métricas Prometheus, instale:
```bash
pip install prometheus-fastapi-instrumentator
```

### Grafana Dashboard

Queries úteis:

```promql
# Uptime da aplicação
up{job="chama-eu-backend"}

# Taxa de erro do health check
rate(health_check_failures_total[5m])

# Tempo de resposta do banco
health_database_response_time_ms
```

### Datadog

```python
# app/routers/health.py
from datadog import statsd

# No check_database:
statsd.gauge('health.database.response_time', response_time)
statsd.increment('health.database.check', tags=['status:healthy'])
```

### NewRelic

```python
import newrelic.agent

@newrelic.agent.background_task()
async def health_check():
    # ... código existente ...
    pass
```

## 🔔 Alertas Recomendados

### 1. Banco de Dados Offline

```yaml
# Alertmanager (Prometheus)
- alert: DatabaseDown
  expr: health_database_status != 1
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Banco de dados offline"
    description: "O banco de dados está inacessível há mais de 1 minuto"
```

### 2. Degradação de Serviço

```yaml
- alert: ServiceDegraded
  expr: health_overall_status == 2
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Serviço degradado"
    description: "Serviços externos com problemas"
```

### 3. Resposta Lenta do Banco

```yaml
- alert: SlowDatabaseResponse
  expr: health_database_response_time_ms > 1000
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Banco de dados lento"
    description: "Tempo de resposta acima de 1s"
```

## 🧪 Testes

### Teste Manual

```bash
# Health check completo
curl http://localhost:8000/health/

# Liveness
curl http://localhost:8000/health/liveness

# Readiness
curl http://localhost:8000/health/readiness

# Com formatação JSON
curl -s http://localhost:8000/health/ | jq .
```

### Teste Automatizado

```python
# tests/test_health.py
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded", "unhealthy"]
    assert "services" in data
    assert "database" in data["services"]

@pytest.mark.asyncio
async def test_liveness(client: AsyncClient):
    response = await client.get("/health/liveness")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "alive"

@pytest.mark.asyncio
async def test_readiness(client: AsyncClient):
    response = await client.get("/health/readiness")
    assert response.status_code in [200, 503]
    data = response.json()
    assert data["status"] in ["ready", "not_ready"]
```

## 🚀 Deploy e CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
- name: Wait for service to be ready
  run: |
    timeout 300 bash -c 'until curl -f http://localhost:8000/health/readiness; do sleep 5; done'

- name: Run smoke tests
  run: |
    response=$(curl -s http://localhost:8000/health/)
    status=$(echo $response | jq -r '.status')
    if [ "$status" != "healthy" ]; then
      echo "Health check failed: $response"
      exit 1
    fi
```

### Script de Deploy

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Iniciando deploy..."

# 1. Build e start
docker-compose up -d --build backend

# 2. Aguardar aplicação estar pronta
echo "⏳ Aguardando aplicação..."
timeout 120 bash -c '
  until curl -sf http://localhost:8000/health/readiness > /dev/null; do
    echo "Aguardando readiness..."
    sleep 5
  done
'

if [ $? -ne 0 ]; then
  echo "❌ Aplicação não ficou pronta em 2 minutos"
  docker-compose logs backend
  exit 1
fi

# 3. Verificar health
health_status=$(curl -s http://localhost:8000/health/ | jq -r '.status')

if [ "$health_status" == "healthy" ]; then
  echo "✅ Deploy concluído com sucesso!"
  exit 0
else
  echo "⚠️ Aplicação está $health_status"
  curl -s http://localhost:8000/health/ | jq .
  exit 1
fi
```

## 📋 Checklist de Produção

Antes de ir para produção, verifique:

- [ ] Health checks configurados no load balancer
- [ ] Probes configurados no Kubernetes (se aplicável)
- [ ] Alertas configurados para falhas críticas
- [ ] Dashboard de monitoramento criado
- [ ] Testes automatizados de health check
- [ ] Logs estruturados para facilitar debugging
- [ ] Timeout adequado nos health checks (< 10s)
- [ ] Documentação atualizada para o time de ops

## 🔍 Troubleshooting

### Health check retorna 503

**Causa**: Banco de dados inacessível

**Solução**:
```bash
# Verificar logs do banco
docker-compose logs db

# Verificar conexão
docker-compose exec backend python -c "
from app.database import engine
import asyncio
asyncio.run(engine.connect())
"
```

### Readiness sempre not_ready

**Causa**: Migrations não aplicadas ou banco não inicializado

**Solução**:
```bash
# Aplicar migrations
docker-compose exec backend python3 -m alembic upgrade head
```

### Timeout nos health checks

**Causa**: Banco muito lento ou rede com problemas

**Solução**:
- Aumentar timeout do health check
- Verificar índices do banco
- Analisar queries lentas
- Verificar recursos (CPU/RAM)

---

**Última atualização**: 2026-01-05
**Versão**: 1.0.0
