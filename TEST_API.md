# 🧪 Testar API em Produção (Railway)

## 1️⃣ Obter URL Pública do Backend

### Via Railway Dashboard:
1. Acesse o Railway Dashboard
2. Clique no serviço **contratapro** (backend)
3. Vá em **Settings**
4. Procure por **Public Networking** ou **Domains**
5. Copie a URL (será algo como: `https://contratapro-production-XXXX.up.railway.app`)

### Via Railway CLI:
```bash
cd /home/hermano/projetos/faz_de_tudo/backend
railway status
```

Vai mostrar algo como:
```
Service: contratapro
URL: https://contratapro-production-XXXX.up.railway.app
```

---

## 2️⃣ Testar Endpoints da API

### Health Check
```bash
curl https://SEU-DOMINIO.up.railway.app/health
```

**Resposta esperada:**
```json
{"status": "healthy"}
```

### Listar Categorias
```bash
curl https://SEU-DOMINIO.up.railway.app/categories/
```

**Resposta esperada:**
```json
[
  {
    "id": 1,
    "name": "Pedreiro",
    "slug": "pedreiro",
    "group": "Construção e Manutenção",
    "image_url": "https://images.unsplash.com/..."
  },
  ...33 categorias total
]
```

### Listar Categorias Agrupadas
```bash
curl https://SEU-DOMINIO.up.railway.app/categories/groups
```

**Resposta esperada:**
```json
{
  "Construção e Manutenção": [
    {"id": 1, "name": "Pedreiro", "slug": "pedreiro", ...},
    ...
  ],
  "Beleza e Estética": [...],
  ...
}
```

### Documentação Interativa (Swagger)
Acesse no navegador:
```
https://SEU-DOMINIO.up.railway.app/docs
```

Você verá a interface do Swagger com todos os endpoints disponíveis!

---

## 3️⃣ Testar Via Navegador

Abra no navegador (substitua SEU-DOMINIO):

```
https://SEU-DOMINIO.up.railway.app/categories/
```

Deve mostrar o JSON com as 33 categorias.

---

## 4️⃣ Verificar CORS

Se você for conectar o frontend, teste se o CORS está configurado:

```bash
curl -H "Origin: https://contratapro.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://SEU-DOMINIO.up.railway.app/categories/
```

Deve retornar headers de CORS permitindo a origem do Vercel.

---

## 5️⃣ Comandos Úteis de Teste

### Via curl (JSON formatado)
```bash
curl -s https://SEU-DOMINIO.up.railway.app/categories/ | python -m json.tool | head -50
```

### Via httpie (se instalado)
```bash
http https://SEU-DOMINIO.up.railway.app/categories/
```

### Via Python
```python
import requests

url = "https://SEU-DOMINIO.up.railway.app/categories/"
response = requests.get(url)
print(f"Status: {response.status_code}")
print(f"Total categorias: {len(response.json())}")
```

---

## ✅ Checklist de Testes

- [ ] Health check retorna `{"status": "healthy"}`
- [ ] `/categories/` retorna 33 categorias
- [ ] `/categories/groups` retorna categorias agrupadas
- [ ] `/docs` mostra documentação Swagger
- [ ] CORS permite origem do Vercel
- [ ] Todas as imagens das categorias têm URLs válidas do Unsplash

---

## 🔍 Troubleshooting

### Erro 404 - Not Found
- Verifique se a URL está correta
- Verifique se o backend está rodando no Railway

### Erro 500 - Internal Server Error
- Veja os logs no Railway: `railway logs -f`
- Pode ser erro de conexão com o banco

### Erro de CORS
- Verifique se a origem do frontend está na lista `origins` no `main.py`
- Certifique-se que o middleware CORS está configurado

### Timeout ou Connection Refused
- O serviço pode estar reiniciando
- Aguarde alguns segundos e tente novamente

---

**Última atualização**: 2026-01-14
