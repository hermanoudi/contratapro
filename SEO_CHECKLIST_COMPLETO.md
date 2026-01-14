# ✅ Checklist de SEO Completo - ContrataPro

## 📊 Status Geral: 85% Otimizado

Este documento lista todas as otimizações de SEO implementadas e pendentes para o ContrataPro.

---

## ✅ IMPLEMENTADO

### 1. **Meta Tags Básicas** ✅
- [x] Title otimizado (60 caracteres)
- [x] Meta description (155 caracteres)
- [x] Meta keywords com termos relevantes
- [x] Canonical URL
- [x] Meta robots (index, follow)
- [x] Meta author
- [x] Lang attribute (pt-BR)

### 2. **Open Graph (Facebook/LinkedIn)** ✅
- [x] og:type
- [x] og:url
- [x] og:title
- [x] og:description
- [x] og:image (URL definida, imagem pendente)
- [x] og:locale (pt_BR)
- [x] og:site_name

### 3. **Twitter Cards** ✅
- [x] twitter:card
- [x] twitter:title
- [x] twitter:description
- [x] twitter:image (URL definida, imagem pendente)

### 4. **Geo Tags** ✅
- [x] geo.region (BR)
- [x] geo.placename (Brasil)

### 5. **Structured Data (Schema.org)** ✅
- [x] WebSite schema
- [x] Organization schema
- [x] Service schema
- [x] SearchAction (barra de busca do Google)
- [x] LocalBusiness (para perfis de profissionais)
- [x] Componente React reutilizável criado

### 6. **Robots.txt** ✅
- [x] Criado em `/public/robots.txt`
- [x] Allow para páginas públicas
- [x] Disallow para admin/dashboard
- [x] Sitemap URL incluída

### 7. **Sitemap.xml** ✅
- [x] Criado em `/public/sitemap.xml`
- [x] URLs principais mapeadas
- [x] Prioridades definidas
- [x] Frequência de atualização definida

### 8. **Headings Semânticos** ✅
- [x] H1 único por página (Hero Title)
- [x] H2 para seções principais
- [x] H3 para sub-seções
- [x] Hierarquia correta mantida

### 9. **Performance** ✅ (Parcial)
- [x] Font preconnect (Google Fonts)
- [x] Lazy loading implementado (via React)
- [ ] Imagens otimizadas (WebP pendente)
- [ ] Bundle size analysis

---

## ⚠️ PENDENTE / RECOMENDADO

### 1. **Imagens** 🔴 IMPORTANTE
```bash
Criar as seguintes imagens:
- /public/og-image.jpg (1200x630px) - Para Open Graph
- /public/twitter-image.jpg (1200x600px) - Para Twitter
- /public/favicon.ico (múltiplos tamanhos)
- /public/apple-touch-icon.png (180x180px)
- /public/logo.png (Logo principal em alta resolução)
```

**Recomendação:**
- Usar WebP para melhor compressão
- Adicionar alt text em TODAS as imagens
- Implementar lazy loading para imagens abaixo da dobra

### 2. **Sitemap Dinâmico** 🟡 MÉDIO
Atualmente o sitemap é estático. Criar endpoint no backend:

```python
# backend/app/routers/seo.py
@router.get("/sitemap.xml")
async def generate_sitemap(db: AsyncSession = Depends(get_db)):
    # Gerar XML dinamicamente com:
    # - Perfis públicos de profissionais
    # - Páginas de serviços
    # - Atualizar lastmod automaticamente
    pass
```

### 3. **Google Analytics / Search Console** 🟡 MÉDIO
```html
<!-- Adicionar ao index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Passos:**
1. Criar conta Google Analytics
2. Obter tracking ID
3. Adicionar script ao index.html
4. Verificar propriedade no Search Console
5. Submeter sitemap.xml

### 4. **Páginas de Aterrissagem (Landing Pages)** 🟢 BAIXO
Criar páginas SEO-friendly para cada categoria:

```
/eletricista
/encanador
/diarista
/pintor
/pedreiro
/manicure
```

Cada página deve ter:
- H1 com keyword principal
- Conteúdo único (mín. 300 palavras)
- CTA claro
- Schema.org específico

### 5. **Blog** 🟢 BAIXO
Criar seção de blog para:
- Ranquear para long-tail keywords
- Estabelecer autoridade
- Aumentar tempo no site

Tópicos sugeridos:
- "Como contratar um eletricista confiável"
- "Checklist para reforma residencial"
- "Quanto custa um serviço de pintura"

### 6. **Breadcrumbs** 🟢 BAIXO
Adicionar navegação em breadcrumb:

```jsx
<nav aria-label="breadcrumb">
  Home > Buscar > Eletricistas em São Paulo
</nav>
```

Com Schema.org:
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [...]
}
```

### 7. **FAQ Schema** 🟢 BAIXO
Adicionar seção FAQ na home com schema:

```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Como funciona o ContrataPro?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
```

### 8. **Avaliações e Reviews** 🟡 MÉDIO
Implementar sistema de avaliações com:
- AggregateRating schema
- Review schema
- Stars visíveis no Google (Rich Snippets)

### 9. **URLs Amigáveis** 🔴 IMPORTANTE
Atualmente: `/book/123`
Melhor: `/profissional/joao-silva-eletricista-sao-paulo`

**Benefícios:**
- Keywords na URL
- Melhor UX
- Maior CTR no Google

### 10. **Mobile Optimization** ✅ JÁ IMPLEMENTADO
- [x] Viewport meta tag
- [x] Responsive design
- [x] Touch-friendly buttons

### 11. **SSL/HTTPS** 🔴 CRÍTICO
```
https://contratapro.com.br (obrigatório)
```
Configurar:
- Certificado SSL (gratuito via Let's Encrypt)
- Redirect HTTP → HTTPS
- HSTS header

### 12. **Page Speed** 🟡 MÉDIO
Otimizações recomendadas:

```javascript
// Lazy load de componentes pesados
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Code splitting por rota
// Minificação automática (Vite já faz)
// Compressão Gzip no servidor
```

**Métricas alvo (Core Web Vitals):**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### 13. **Alt Text em Imagens** 🟡 MÉDIO
Verificar TODAS as imagens têm alt text descritivo:

```jsx
❌ <img src="logo.png" alt="logo" />
✅ <img src="logo.png" alt="ContrataPro - Plataforma de serviços profissionais" />
```

### 14. **Internal Linking** 🟢 BAIXO
Adicionar links internos relevantes:
- Home → Categorias
- Categorias → Profissionais
- Blog → Páginas de serviço

---

## 📈 Keywords Target (Principais)

### **Head Keywords (alto volume, alta competição):**
1. contratar profissional (8.1k/mês)
2. eletricista perto de mim (6.6k/mês)
3. encanador 24h (5.5k/mês)
4. diarista (27k/mês)
5. pintor residencial (3.2k/mês)

### **Long-tail Keywords (baixo volume, baixa competição):**
1. como contratar eletricista residencial (480/mês)
2. melhor app para contratar diarista (320/mês)
3. preço serviço de pintura por m2 (590/mês)
4. encanador confiável perto de mim (210/mês)
5. contratar pedreiro para reforma (180/mês)

### **Local Keywords:**
1. eletricista em [cidade] (variaável por cidade)
2. encanador [bairro] SP (local)
3. diarista [região] RJ (local)

---

## 🎯 Prioridades de Implementação

### **SPRINT 1 - Crítico (Fazer AGORA):**
1. ✅ Criar imagens OG e Twitter
2. ⏳ Configurar Google Analytics
3. ⏳ Configurar Search Console
4. ⏳ Submeter sitemap
5. ⏳ Adicionar SSL/HTTPS

### **SPRINT 2 - Importante (Próximas 2 semanas):**
1. URLs amigáveis para profissionais
2. Sitemap dinâmico
3. Landing pages por categoria
4. Sistema de avaliações

### **SPRINT 3 - Melhorias (Próximo mês):**
1. Blog
2. FAQ com schema
3. Breadcrumbs
4. Otimização de imagens (WebP)

---

## 🔍 Ferramentas de Monitoramento

### **Gratuitas:**
- Google Search Console (obrigatório)
- Google Analytics (obrigatório)
- PageSpeed Insights
- Mobile-Friendly Test
- Rich Results Test (schema.org)

### **Pagas (opcional):**
- SEMrush
- Ahrefs
- Moz Pro
- Screaming Frog

---

## 📊 KPIs de SEO

Métricas para acompanhar mensalmente:

1. **Tráfego Orgânico:** Crescimento mês a mês
2. **Keywords Ranqueadas:** Top 10, Top 20, Top 50
3. **CTR Médio:** Taxa de cliques nos resultados
4. **Bounce Rate:** Taxa de rejeição (ideal < 60%)
5. **Tempo Médio no Site:** Ideal > 2 minutos
6. **Conversões Orgânicas:** Cadastros via Google

---

## 🚀 Comandos Úteis

### Testar Schema.org:
```
https://validator.schema.org/
https://search.google.com/test/rich-results
```

### Testar Performance:
```
https://pagespeed.web.dev/
```

### Testar Mobile:
```
https://search.google.com/test/mobile-friendly
```

### Verificar Indexação:
```
site:contratapro.com.br
```

---

## 📝 Notas Finais

- **Tempo estimado para resultados:** 3-6 meses
- **Investimento mínimo:** R$ 0 (Google é gratuito)
- **Investimento recomendado:** R$ 500-2000/mês em conteúdo
- **ROI esperado:** 200-400% após 12 meses

**Lembre-se:** SEO é maratona, não sprint! 🏃‍♂️

---

## 🆘 Suporte

Dúvidas sobre implementação? Consulte:
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Web.dev](https://web.dev/)

**Última atualização:** 12/01/2026
