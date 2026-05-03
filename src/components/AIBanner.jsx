export default function AIBanner({ pick }) {
  if (!pick) return null
  return (
    <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 p-4 flex items-center gap-3 shadow-lg">
      <span className="text-3xl">🔥</span>
      <div>
        <p className="text-xs font-bold text-yellow-900 uppercase tracking-wider">AI Crowd Pick</p>
        <p className="text-sm font-semibold text-white leading-snug">{pick.recommendation}</p>
      </div>
    </div>
  )
}
