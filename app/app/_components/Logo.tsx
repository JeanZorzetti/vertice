type LogoProps = {
  variant?: 'full' | 'mark'
  height?: number
  className?: string
  style?: React.CSSProperties
}

const PATH = 'M10 34L26 48L54 16'
const LEN = 63.78 // comprimento do traçado, em unidades do viewBox
const DONE = 0.72 // fração concluída

/**
 * Marca do Vértice: o check é um vértice — dois traços que se encontram num ponto. E um
 * check pela metade é exatamente o dado do produto: um onboarding em andamento. O traço
 * fraco é o que falta, o sólido é o que já entrou, e a dobra entre os dois é o vértice.
 *
 * O preenchimento sai de `stroke-dasharray` sobre o comprimento do traçado — para mostrar
 * outro percentual, mude DONE; para mudar o traçado, recalcule LEN (soma dos dois segmentos).
 *
 * Usa `currentColor` — a cor vem do container. O `icon.svg` do favicon repete a mesma
 * construção com o container azul.
 */
export default function Logo({ variant = 'full', height = 32, className, style }: LogoProps) {
  const full = variant === 'full'
  return (
    <svg
      viewBox={full ? '0 0 180 64' : '0 0 64 64'}
      height={height}
      width={(height * (full ? 180 : 64)) / 64}
      fill="none"
      stroke="currentColor"
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Vértice"
      className={className}
      style={style}
    >
      <path d={PATH} opacity="0.24" />
      <path d={PATH} strokeDasharray={`${LEN * DONE} 999`} />
      {full && (
        <text
          x="74"
          y="32"
          dominantBaseline="central"
          fontSize="27"
          fontWeight="800"
          letterSpacing="-0.8"
          fill="currentColor"
          stroke="none"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Vértice
        </text>
      )}
    </svg>
  )
}
