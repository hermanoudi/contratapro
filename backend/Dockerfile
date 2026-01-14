FROM python:3.12-slim

WORKDIR /app

# Copiar arquivos da aplicação
COPY ./app ./app
COPY requirements.txt .

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Expor porta
EXPOSE 8000

# Comando de inicialização
# Em produção, o Railway substituirá este comando pelo definido no Procfile
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
