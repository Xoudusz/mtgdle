interface Props {
  text: string
}

export default function FlavorText({ text }: Props) {
  const parts = text.split(/\n—/)
  const body = parts[0].trim()
  const attribution = parts[1] ? parts[1].trim() : null

  return (
    <div className="w-full max-w-lg mx-auto rounded-xl border border-[#3a3020] bg-[#1a1510] px-8 py-6 flex flex-col gap-3">
      <p className="italic text-[#e8e0d0] text-lg leading-relaxed text-center">
        &ldquo;{body}&rdquo;
      </p>
      {attribution && (
        <p className="text-[#9b8a6e] text-sm text-right">
          &mdash;{attribution}
        </p>
      )}
    </div>
  )
}
