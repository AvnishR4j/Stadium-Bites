function Stars({ rating }) {
  const r = Number(rating) || 0
  return (
    <span className="text-yellow-400" style={{ fontSize: '11px' }}>
      {'★'.repeat(Math.round(r))}{'☆'.repeat(5 - Math.round(r))}
    </span>
  )
}

export default function TrendingSection({ items, onSelect }) {
  const trending = [...items]
    .filter(f => f.review_count > 0)
    .sort((a, b) => b.review_count - a.review_count)
    .slice(0, 4)

  if (!trending.length) return null

  return (
    <div className="px-4 mb-5">
      <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-3">🔥 Trending Now</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 sb-scroll">
        {trending.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex-shrink-0 rounded-xl p-3 text-left active:scale-95 min-w-[120px] transition-all hover:opacity-90"
            style={{
              background: '#1a1a24',
              border: i === 0 ? '1px solid rgba(249,115,22,0.5)' : '1px solid rgba(255,255,255,0.08)',
              animation: `fadeSlideUp 0.35s ease-out ${i * 0.07}s both`,
            }}
          >
            {i === 0 && (
              <div className="text-orange-400 text-xs font-bold mb-1">🥇 #1 Pick</div>
            )}
            <div className="text-2xl mb-1">{item.image_emoji}</div>
            <div className="text-xs font-bold text-white truncate">{item.name}</div>
            <Stars rating={item.avg_rating} />
            <div className="text-xs text-gray-400">{item.review_count} reviews</div>
          </button>
        ))}
      </div>
    </div>
  )
}
