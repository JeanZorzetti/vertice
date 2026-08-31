type LogoProps = {
  variant?: 'full' | 'mark'
  height?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Marca da Vértice. O objeto é o V — duas arestas que se encontram num ponto. A
 * textura são as juntas que partem esse V nas 4 etapas do onboarding, mais a
 * peça central: o vértice propriamente dito, onde as duas metades se encontram
 * e o onboarding fecha.
 *
 * Nada aqui foi posicionado à mão. PATH e DASH saem de `scripts/logo-mark.mjs`,
 * que lê o número de etapas de STEP_LABELS (onboarding/[token]/_components/Sidebar)
 * e distribui os segmentos pelo comprimento do traço. Mudou o número de etapas?
 * Rode o script e cole a saída aqui e em `app/icon.svg` — não edite os números.
 *
 * Usa `currentColor`: a cor vem do container (white-label da agência incluído).
 */
const PATH = 'M12 10L32 46L52 10'
const DASH = '13.29 2.8 13.29 2.8 18 2.8 13.29 2.8 13.29 0'
const LOCKUP_W = 188

export default function Logo({ variant = 'full', height = 32, className, style }: LogoProps) {
  const full = variant === 'full'
  return (
    <svg
      viewBox={full ? `0 0 ${LOCKUP_W} 64` : '0 0 64 64'}
      height={height}
      width={(height * (full ? LOCKUP_W : 64)) / 64}
      role="img"
      aria-label="Vértice"
      className={className}
      style={style}
    >
      <path
        d={PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
        strokeDasharray={DASH}
      />
      {full && (
        <text
          x="66"
          y="33"
          dominantBaseline="central"
          fontSize="30"
          fontWeight="800"
          letterSpacing="-1"
          fill="currentColor"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Vértice
        </text>
      )}
    </svg>
  )
}
