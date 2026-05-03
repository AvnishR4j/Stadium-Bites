function Stars({ rating }) {
  const r = Number(rating) || 0
  return (
    <span className="text-yellow-400 text-xs">
      {'★'.repeat(Math.round(r))}{'☆'.repeat(5 - Math.round(r))}
    </span>
  )
}

export default function TrendingSection({ items, onSelect }) {
  const trending = [...items]
    .filter(f => f.review_count > 0)
    .sort((a, b) => b.review_count - a.review_count)
    .slice(0, 3)

  if (!trending.length) return null

  return (
    <div className="px-4 mb-5">
      <h2 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-3">🔥 Trending Now</h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {trending.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="flex-shrink-0 bg-white/10 rounded-xl p-3 text-left hover:bg-white/20 transition-all active:scale-95 min-w-[120px]"
          >
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
