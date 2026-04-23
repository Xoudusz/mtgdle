interface Props {
  artUrl: string
  guessCount: number
  solved: boolean
  anchorX: number
  anchorY: number
}

const SCALES = [4, 3, 2, 1.5, 1.2, 1]

export default function ArtZoom({ artUrl, guessCount, solved, anchorX, anchorY }: Props) {
  const scaleIndex = solved ? SCALES.length - 1 : Math.min(guessCount, SCALES.length - 1)
  const scale = SCALES[scaleIndex]

  return (
    <div
      className="w-full max-w-lg mx-auto rounded-xl overflow-hidden border border-[#3a3020] shadow-lg"
      style={{ aspectRatio: '4/3' }}
    >
      <div className="w-full h-full overflow-hidden">
        <img
          src={artUrl}
          alt="Mystery card art"
          className="w-full h-full object-cover transition-transform duration-700"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: `${anchorX}% ${anchorY}%`,
          }}
        />
      </div>
    </div>
  )
}
