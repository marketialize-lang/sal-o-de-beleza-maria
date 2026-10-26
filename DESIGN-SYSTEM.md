# HALO Light — sistema visual de referência

Tokens registrados a partir do HTML `Salao Halo Light/index.html` e do stylesheet original em `public/assets/style.css`. Mary Gomes reaproveita este sistema visual e os efeitos do template. Nome, serviços, valores, fotos, vídeos e contatos vêm do briefing dela. HALO é a referência de implementação, não a marca do salão.

## Cores

| Variável | Valor | Papel |
|---|---|---|
| `--bg` | `#f7f3f0` | Fundo principal |
| `--bg-2` | `#f1ebe7` | Fundo secundário |
| `--bg-3` | `#e9e1dc` | Fundo de contraste suave |
| `--surface` | `#ffffff9e` | Superfície translúcida |
| `--surface-2` | `#ffffffc7` | Superfície de vidro média |
| `--surface-3` | `#ffffffeb` | Superfície de vidro clara |
| `--text` | `#1d171b` | Texto principal |
| `--text-2` | `#554b52` | Texto secundário |
| `--text-3` | `#74696f` | Texto auxiliar |
| `--text-4` | `#a59aa0` | Texto de baixa ênfase |
| `--acc-base` | `#efa7b5` | Acento rosé |
| `--ok` | `#2f8f5b` | Estado positivo |
| `--erro` | `#c2414b` | Estado de erro |
| `--line` | `#3a243017` | Divisores e contornos suaves |

## Tipografia e escala

- Interface: `Geist Variable`, com fallback system UI.
- Dados e etiquetas: `Geist Mono Variable`, com fallback monospace.
- Hero: `clamp(2.55rem, 1.2rem + 5.2vw, 5.4rem)`.
- Títulos de seção: `clamp(2rem, 1.1rem + 3.2vw, 3.6rem)`.
- Texto de apoio: `clamp(1rem, .94rem + .3vw, 1.18rem)`.
- Entrelinha: `1.02` em títulos compactos, `1.08` em títulos e `1.6` em texto corrido.

## Layout, forma e movimento

- Largura máxima: `1240px`; largura de texto: `62ch`.
- Gutter: `clamp(16px, 4vw, 40px)`; seção: `clamp(96px, 12vw, 168px)`.
- Raios: `8px`, `14px`, `18px`, `24px`, `32px` e pílula `999px`.
- Durações: `0.25s`, `0.5s` e `1.1s`; curvas de saída e movimento contínuo definidas no CSS original.
- CSS e runtime do template preservam vidro, iluminação, transições, animações por scroll, carrosséis e comportamento responsivo, incluindo `prefers-reduced-motion`.

## Arquivos usados

- `index.html`: cópia de trabalho do HTML original.
- `public/assets/style.css`: stylesheet do template.
- `public/assets/halo-template.js`: runtime de efeitos e componentes.
- `src/halo-template-body.html`: HTML original da página, renderizado pela rota.
- `public/mary/`: fotos e vídeos fornecidos para o site.
