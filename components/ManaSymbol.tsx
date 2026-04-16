interface Props {
  symbol: string
  size?: number
}

export default function ManaSymbol({ symbol, size = 16 }: Props) {
  return (
    <img
      src={`https://svgs.scryfall.io/card-symbols/${symbol}.svg`}
      alt={symbol}
      width={size}
      height={size}
      className="inline-block rounded-full"
    />
  )
}
