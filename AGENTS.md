# AGENTS.md — GordaoMod

## Sobre o Projeto
Projeto demo/portfolio para uma plataforma de marketplace de mods para FiveM.
Todos os dados sao ficticios e identificados como DEMO.

## Stack
- HTML / CSS / JavaScript vanilla (sem framework, sem backend)
- Build: `node build.js` -> copia arquivos para `dist/`
- Deploy: Cloudflare Pages via GitHub Actions
- Repo: https://github.com/lfelipef1dev-jpg/gordaomod
- Producao: https://gordaomod.expostacker.com.br

## Regras Obrigatorias
1. **NUNCA** commitar credenciais, chaves de API, tokens ou secrets.
2. **NUNCA** adicionar backend (sem Node server, sem PHP, sem banco real).
3. Todos os dados sao ficticios e devem ser identificados como DEMO.
4. **NAO** desenvolver spoofer, anti-cheat evasion ou qualquer ferramenta de
   burla de seguranca. Remover qualquer produto desse tipo do catalogo.
5. Todos os arquivos devem ser salvos em UTF-8.
6. Acessibilidade: seguir WCAG AA e respeitar `prefers-reduced-motion`.

## Comandos
- `npm run build` ou `node build.js` — gera `dist/`
- Servir localmente: qualquer servidor estatico na raiz ou em `dist/`

## Estrutura
- `index.html` — pagina principal
- `app.js` — logica da aplicacao
- `style.css` / `style-gordao.css` — estilos
- `data.js` — modelo de dados central (`window.GordaoModData`)
- `build.js` — script de build
- `assets/` — imagens e recursos estaticos
- `dist/` — saida do build (gerada)
