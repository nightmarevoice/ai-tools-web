export function BackgroundPattern() {
  return (
    <div className="pointer-events-none absolute inset-0" style={{height:120}} >
      <div className="absolute inset-0 bg-white" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsla(var(--primary)_/_0.35),transparent_55%),radial-gradient(circle_at_top_right,hsla(var(--primary)_/_0.22),transparent_60%)] opacity-90" />
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(120deg,hsla(var(--primary)_/_0.18)_0%,rgba(255,255,255,0)_65%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,hsla(var(--primary)_/_0.14)_1px,transparent_1px),linear-gradient(to_bottom,hsla(var(--primary)_/_0.14)_1px,transparent_1px)] bg-[size:120px_120px]" />
      <div className="absolute inset-x-0 bottom-[-20%] h-[45%] bg-gradient-to-t from-white via-white/85 to-transparent" />
    </div>
  )
}

