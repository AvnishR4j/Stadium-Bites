const BADGE = {
  Loved:  { bg: 'bg-green-500/20',  text: 'text-green-400',  icon: '✅' },
  Mixed:  { bg: 'bg-yellow-500/20', text: 'text-yellow-400', icon: '⚡' },
  Avoid:  { bg: 'bg-red-500/20',    text: 'text-red-400',    icon: '❌' },
  New:    { bg: 'bg-blue-500/20',   text: 'text-blue-400',   icon: '🆕' },
}

function Stars({ rating }) {
  const r = Math.round(Number(rating) || 0)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= r ? 'text-yellow-400' : 'text-gray-600'}>★</span>
      ))}
    </div>
  )
}

function getSentiment(item) {
  if (!item.review_count || item.review_count === 0) return 'New'
  const r = Number(item.avg_rating)
  if (r >= 4) return 'Loved'
  if (r >= 2.5) return 'Mixed'
  return 'Avoid'
}

export default function FoodCard({ item, onClick }) {
  const sentiment = getSentiment(item)
  const badge = BADGE[sentiment]
  const avg = Number(item.avg_rating || 0).toFixed(1)

  return (
    <button
      onClick={() => onClick(item)}
      className="bg-white/8 border border-white/10 rounded-2xl p-4 text-left hover:bg-white/15 hover:border-orange-500/40 transition-all active:scale-95 group"
    >
      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{item.image_emoji}</div>
      <h3 className="font-bold text-white text-sm mb-0.5 truncate">{item.name}</h3>
      <p className="text-gray-400 text-xs mb-2 line-clamp-2 leading-snug">{item.description}</p>

      <div className="flex items-center gap-1.5 mb-2">
        <Stars rating={item.avg_rating} />
        <span className="text-yellow-400 text-xs font-bold">{avg}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-500 text-xs">{item.review_count} reviews</span>
        <span className="text-green-400 text-xs font-semibold">₹{item.price}</span>
      </div>

      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.icon} {sentiment}
      </div>

      <div className="mt-2 text-center text-xs text-orange-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        Tap to rate →
      </div>
    </button>
  )
}
