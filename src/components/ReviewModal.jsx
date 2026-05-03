import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { supabase } from '../lib/supabase'
import { getAISummary } from '../lib/gemini'

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-2 justify-center">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className={`text-4xl transition-transform hover:scale-125 active:scale-110
            ${i <= (hover || value) ? 'text-yellow-400' : 'text-gray-600'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function ReviewModal({ item, onClose, onReviewed }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState([])
  const [aiData, setAiData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingAI, setLoadingAI] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [translateY, setTranslateY] = useState(0)

  const modalRef = useRef(null)
  const touchStart = useRef(null)
  const isDragging = useRef(false)

  useEffect(() => {
    fetchReviews()
  }, [item.id])

  // Push fake history state so browser back gesture closes modal instead of leaving app
  useEffect(() => {
    history.pushState({ modal: true }, '')

    function onPopState(e) {
      // Back gesture fired — close modal, don't navigate away
      onClose()
    }

    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      // If modal closed normally (not via back), clean up the fake state
      if (history.state?.modal) {
        history.back()
      }
    }
  }, [onClose])

  // Prevent horizontal swipe (browser back) and handle swipe-down to close
  useEffect(() => {
    const el = modalRef.current
    if (!el) return

    function onTouchStart(e) {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      isDragging.current = false
    }

    function onTouchMove(e) {
      if (!touchStart.current) return
      const dx = e.touches[0].clientX - touchStart.current.x
      const dy = e.touches[0].clientY - touchStart.current.y

      // Horizontal swipe → block browser back gesture
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        e.preventDefault()
        return
      }

      // Downward drag on modal sheet — only from top portion
      if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
        isDragging.current = true
        // Only drag if content is scrolled to top
        const scrollTop = el.scrollTop
        if (scrollTop <= 0) {
          e.preventDefault()
          setTranslateY(Math.min(dy, 300))
        }
      }
    }

    function onTouchEnd(e) {
      if (!touchStart.current) return
      const dy = e.changedTouches[0].clientY - touchStart.current.y
      const dx = e.changedTouches[0].clientX - touchStart.current.x

      if (isDragging.current && dy > 100 && Math.abs(dy) > Math.abs(dx)) {
        // Swiped down far enough — close
        onClose()
      } else {
        // Snap back
        setTranslateY(0)
      }
      touchStart.current = null
      isDragging.current = false
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [onClose])

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('food_item_id', item.id)
      .order('created_at', { ascending: false })
      .limit(20)

    const r = data || []
    setReviews(r)
    setLoadingAI(true)
    const ai = await getAISummary(item.name, r)
    setAiData(ai)
    setLoadingAI(false)
  }

  async function handleSubmit() {
    if (!rating) return
    setSubmitting(true)
    await supabase.from('reviews').insert({
      food_item_id: item.id,
      rating,
      comment: comment.trim() || null
    })
    setSubmitted(true)
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f97316', '#fb923c', '#fbbf24', '#4ade80', '#a78bfa']
    })
    setSubmitting(false)
    onReviewed()
    setTimeout(() => {
      setSubmitted(false)
      setRating(0)
      setComment('')
      fetchReviews()
    }, 1500)
  }

  const BADGE_COLOR = {
    Loved: 'text-green-400 bg-green-500/20',
    Mixed: 'text-yellow-400 bg-yellow-500/20',
    Avoid: 'text-red-400 bg-red-500/20',
    New: 'text-blue-400 bg-blue-500/20',
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
      style={{ touchAction: 'none' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={modalRef}
        className="bg-[#1a1a24] rounded-t-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: translateY === 0 ? 'transform 0.3s ease' : 'none',
          touchAction: 'pan-y',
          overscrollBehavior: 'none',
        }}
      >
        {/* Drag handle pill */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{item.image_emoji}</span>
            <div>
              <h2 className="font-bold text-white text-lg">{item.name}</h2>
              <p className="text-gray-400 text-xs">{item.stall_name} · ₹{item.price}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        {/* AI Summary */}
        <div className="mx-5 mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
          <p className="text-xs font-bold text-purple-400 mb-1">✨ AI Summary</p>
          {loadingAI ? (
            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm text-gray-300 flex-1">{aiData?.summary}</p>
              {aiData?.sentiment && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BADGE_COLOR[aiData.sentiment] || 'text-gray-400'}`}>
                  {aiData.sentiment}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Rate It */}
        <div className="p-5 border-b border-white/10">
          <p className="text-sm font-semibold text-gray-300 text-center mb-3">Rate this item</p>
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <p className="text-center text-xs text-yellow-400 mt-2">
              {['', 'Terrible 😬', 'Not great 😕', 'Okay 😐', 'Good 😋', 'Amazing! 🤩'][rating]}
            </p>
          )}
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
            className="w-full mt-3 bg-[#2a2a3a] border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-orange-500/50"
            rows={2}
          />
          <button
            onClick={handleSubmit}
            disabled={!rating || submitting}
            className={`w-full mt-3 py-3 rounded-xl font-bold text-sm transition-all
              ${submitted ? 'bg-green-500 text-white' :
                rating ? 'bg-orange-500 hover:bg-orange-400 text-white active:scale-98' :
                'bg-white/10 text-gray-500 cursor-not-allowed'}`}
          >
            {submitted ? '✅ Review Submitted!' : submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>

        {/* Recent Reviews */}
        <div className="p-5">
          <p className="text-sm font-bold text-gray-300 mb-3">Recent Reviews ({reviews.length})</p>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="text-gray-300 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
