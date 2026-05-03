import { useState } from 'react'

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
        <span key={i} className={i <= r ? 'text-yellow-400' : 'text-gray-600'} style={{ fontSize: '11px' }}>★</span>
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

export default function FoodCard({ item, onClick, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const sentiment = getSentiment(item)
  const badge = BADGE[sentiment]
  const avg = Number(item.avg_rating || 0).toFixed(1)

  return (
    <button
      onClick={() => onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-[#1a1a24] border border-white/10 rounded-2xl p-4 text-left transition-all active:scale-95 group w-full"
      style={{
        animation: `fadeSlideUp 0.35s ease-out ${index * 0.05}s both`,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
        borderColor: hovered ? 'rgba(249,115,22,0.35)' : 'rgba(255,255,255,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
    >
      <div
        className="text-4xl mb-3 transition-transform duration-200"
        style={{ transform: hovered ? 'scale(1.12)' : 'scale(1)' }}
      >
        {item.image_emoji}
      </div>
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

      <div
        className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
        style={{ animation: 'badge-pop 0.4s ease-out both' }}
      >
        {badge.icon} {sentiment}
      </div>

      <div
        className="mt-2 text-center text-xs text-orange-400 font-medium transition-opacity duration-200"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        Tap to rate →
      </div>
    </button>
  )
}
