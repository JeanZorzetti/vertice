// Gerador da marca da Vértice. Toda a geometria sai daqui por fórmula — nada é
// posicionado à mão. `node scripts/logo-mark.mjs [preview.html]` reemite o
// dasharray e um preview em todos os tamanhos.
//
// Objeto: o V — duas arestas que se encontram num ponto. Textura: as juntas que
// partem esse V nas etapas do onboarding, mais a peça do ápice: o vértice
// propriamente dito, onde as duas metades se encontram e o onboarding fecha.
//
// Dado de origem, verificado no código e não inventado:
//   STEPS = STEP_LABELS de app/onboarding/[token]/_components/Sidebar.tsx
// Mudou o número de etapas? Mude STEPS e cole a saída em app/_components/Logo.tsx
// e app/icon.svg — o dasharray se redistribui sozinho.

import { writeFileSync } from 'node:fs'

const STEPS = ['Dados da Empresa', 'Identidade Visual', 'Plataformas', 'Briefing']

// TOP/APEX_Y escolhidos para a bbox real do traço (incluindo a ponta do miter,
// que desce T/2 / sin(θ) abaixo do vértice) cair centrada no viewBox 64.
const TOP = 10, APEX_Y = 46, HALF = 20, CX = 32
const T = 9        // espessura
const APEX = 18    // peça do ápice, centrada no vértice
const JOINT = 2.8  // junta entre peças

const ARM = Math.hypot(HALF, APEX_Y - TOP)
const TOTAL = 2 * ARM
const N = STEPS.length
const SEG = (TOTAL - APEX - N * JOINT) / N
const round = (n) => +n.toFixed(2)

const PATH = `M${CX - HALF} ${TOP}L${CX} ${APEX_Y}L${CX + HALF} ${TOP}`
const armDash = Array.from({ length: N / 2 }, () => round(SEG)).flatMap((s, i) => (i ? [JOINT, s] : [s]))
// O 0 final fecha o array em tamanho par para o padrão não repetir no traço.
const DASH = [...armDash, JOINT, APEX, JOINT, ...armDash, 0].join(' ')

const MARK = `<path d="${PATH}" fill="none" stroke="currentColor" stroke-width="${T}" stroke-linejoin="miter" stroke-miterlimit="4" stroke-dasharray="${DASH}"/>`

// --- preview ---------------------------------------------------------------
const OLD = `<g fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 34L26 48L54 16" opacity=".24"/><path d="M10 34L26 48L54 16" stroke-dasharray="45.92 999"/></g>`

const svg = (inner, px) => `<svg viewBox="0 0 64 64" width="${px}" height="${px}">${inner}</svg>`
const tile = (inner, px, cls = '', label = '') =>
  `<div class="t ${cls}">${svg(inner, px)}<span>${label || px + 'px'}</span></div>`
const brand = (inner, bg) =>
  `<div class="t"><svg viewBox="0 0 64 64" width="56" height="56" style="border-radius:14px;background:${bg};color:#fff">
    <g transform="translate(32 32) scale(.8) translate(-32 -32)">${inner}</g></svg><span>favicon</span></div>`

const lockup = (cls) => `<div class="t ${cls}"><svg viewBox="0 0 208 64" height="40">
  ${MARK}<text x="76" y="33" dominant-baseline="central" font-size="30" font-weight="800" letter-spacing="-1"
  fill="currentColor" style="font-family:'Plus Jakarta Sans',system-ui">Vértice</text></svg><span>lockup</span></div>`

writeFileSync(process.argv[2] ?? 'logo-preview.html', `<!doctype html><meta charset=utf-8>
<link rel=stylesheet href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@800&display=swap">
<style>body{font:13px system-ui;background:#f6f6f8;color:#0d121b;margin:24px}
h2{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#4c669a;margin:22px 0 8px}
.r{display:flex;align-items:flex-end;gap:18px;flex-wrap:wrap}
.t{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px;border-radius:10px;background:#fff;border:1px solid #e7ebf3;color:#135bec}
.t.dark{background:#101622;border-color:#22304a;color:#7fa8ff}
span{font-size:10px;color:#4c669a}</style>
<section><h2>Marca nova — claro</h2><div class="r">${[128, 64, 40, 32, 24, 20, 16].map((p) => tile(MARK, p)).join('')}${brand(MARK, '#135bec')}${brand(MARK, '#101622')}</div></section>
<section><h2>Marca nova — escuro</h2><div class="r">${[128, 64, 32, 20, 16].map((p) => tile(MARK, p, 'dark')).join('')}</div></section>
<section><h2>Lockup</h2><div class="r">${lockup('')}${lockup('dark')}</div></section>
<section><h2>Marca atual, para comparar</h2><div class="r">${[128, 64, 32, 16].map((p) => tile(OLD, p)).join('')}${brand(OLD, '#135bec')}</div></section>`)

console.log({ ARM: round(ARM), SEG: round(SEG), DASH, PATH })
