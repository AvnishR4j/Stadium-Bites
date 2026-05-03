export default function AIBanner({ pick }) {
  if (!pick) return null
  return (
    <div
      className="mx-4 mb-4 rounded-2xl p-4 flex items-center gap-3"
      style={{
        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
        boxShadow: '0 4px 24px rgba(249,115,22,0.35)',
        animation: 'fadeSlideUp 0.4s ease-out',
      }}
    >
      <span className="text-3xl">🔥</span>
      <div>
        <p className="text-xs font-bold text-orange-900 uppercase tracking-wider">AI Crowd Pick</p>
        <p className="text-sm font-semibold text-white leading-snug">{pick.recommendation}</p>
      </div>
    </div>
  )
}
