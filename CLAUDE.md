@AGENTS.md

# datafootball.co — Site

Site editorial do `@datafootball__`. Publica rankings diários de posts de clubes de futebol no Instagram e TikTok.

**URL:** https://datafootball.co  
**Repo GitHub:** https://github.com/camilanagem/datafootball-site  
**Deploy:** Vercel (auto-deploy a cada push na branch `main`)  
**DNS:** Cloudflare → Vercel

Idioma do projeto: pt-BR nos comentários. Interface do site em en/pt/es.

## Stack

- Next.js 16.2.4 + React 19 + App Router
- Tailwind CSS v4 (`@theme` directive — sintaxe diferente do v3)
- next-intl v4 (i18n — en/pt/es, default en)
- TypeScript strict
- Fontes: Playfair Display (serif) + Inter (sans)

⚠️ Next.js 16 tem breaking changes vs versões anteriores. Sempre ler `node_modules/next/dist/docs/` antes de escrever código novo.

## Estrutura

```
src/
  app/[locale]/          # páginas (App Router)
    page.tsx             # home — heatmap de dias
    day/[date]/          # relatório de um dia
    clubs/               # diretório de clubes
    club/[handle]/       # página de um clube
    leagues/             # visão por liga
    hall-of-fame/        # recordes históricos
    methodology/         # como o ranking funciona
  components/            # Header, Footer, PostCard, CalendarHeatmap, etc.
  data/days/             # JSONs por dia (YYYY-MM-DD.json) — gerados pelo pipeline
  lib/
    data.ts              # carrega os JSONs
    aggregations.ts      # computa stats de clubes, ligas e recordes
  i18n/                  # routing, request, navigation (next-intl)
  middleware.ts           # detecção de locale (usar "proxy" em versões futuras)
messages/                # traduções en.json / pt.json / es.json
```

## Dados

Os JSONs em `src/data/days/` são gerados pelo pipeline principal (`../export_site_json.py`). Para publicar novos dados:

```bash
# No diretório pai (projeto-futebol-social):
python3 export_site_json.py   # gera o JSON do dia em site/src/data/days/

# Depois aqui no site:
git add src/data/days/<data>.json
git commit -m "data: add <data>"
git push   # Vercel faz redeploy automático
```

## Desenvolvimento local

```bash
npm run dev    # localhost:3000
npm run build  # build de produção (rodar antes de fazer push importante)
```

## Cores e tema

Definidas em `src/app/globals.css` via `@theme`:
- Fundo light: `#efe9da` (nude bone)
- Fundo dark: `#000000`
- Texto: `#000000` / `#ffffff`
- Acento TikTok: `#c8102e` (vermelho)
- Acento sálvia: `#b8c49a`

## i18n

Chaves de tradução em `messages/{en,pt,es}.json`. Adicionar chave nova nos 3 arquivos sempre.

## Deploy

Push pra `main` → Vercel detecta → redeploy automático (~1-2 min). Checar logs em vercel.com se o build falhar.

## 57 clubes monitorados · 12 ligas

Brasileirão (12), Premier League (10), Serie A (7), La Liga (6), Bundesliga (5), Ligue 1 (3), Primeira Liga (3), Saudi Pro League (3), Argentina (2), MLS (2), Liga MX (2), Süper Lig (2).
