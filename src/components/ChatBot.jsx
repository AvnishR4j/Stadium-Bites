import { useState, useRef, useEffect } from 'react'
import { getChatResponse } from '../lib/gemini'

const QUICK_CHIPS = [
  { label: 'Best rated food? 🏆', q: 'What is the best rated food here?' },
  { label: 'Cheapest option? 💰', q: 'What is the cheapest food available?' },
  { label: 'Vegetarian? 🥗', q: 'What are good vegetarian options?' },
  { label: "What's trending? 🔥", q: 'What food is trending right now?' },
]

const GREETING = "Hey! 👋 I'm your AI food guide for today's match. Ask me anything — best rated items, veggie options, cheap eats, or what the crowd loves!"

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-purple-400 rounded-full inline-block animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
      style={{ animation: 'fadeSlideUp 0.25s ease-out' }}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
          🤖
        </div>
      )}
      <div
        className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-snug
          ${isUser
            ? 'bg-orange-500 text-white rounded-tr-sm'
            : 'bg-[#2a2a3a] text-gray-200 rounded-tl-sm border border-white/10'}`}
      >
        {msg.text}
      </div>
    </div>
  )
}

export default function ChatBot({ foods }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'ai', text: GREETING, id: 'greeting' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showChips, setShowChips] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  async function sendMessage(text) {
    const q = text.trim()
    if (!q || loading) return

    setShowChips(false)
    const userMsg = { role: 'user', text: q, id: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const history = messages.filter(m => m.id !== 'greeting')
    const reply = await getChatResponse(q, foods, [...history, userMsg])

    setMessages(prev => [...prev, { role: 'ai', text: reply, id: Date.now() + 1 }])
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const userMsgCount = messages.filter(m => m.role === 'user').length

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUpPanel {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center items-end pointer-events-none"
        >
          <div
            className="pointer-events-auto w-full max-w-lg bg-[#13131b] border border-white/10 rounded-t-3xl shadow-2xl flex flex-col"
            style={{ height: '70vh', animation: 'slideUpPanel 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <div>
                  <p className="text-white font-bold text-sm">AI Food Guide</p>
                  <p className="text-green-400 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                    Powered by Gemini · Live data
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.map(msg => <Message key={msg.id} msg={msg} />)}
              {loading && (
                <div className="flex justify-start mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    🤖
                  </div>
                  <div className="bg-[#2a2a3a] border border-white/10 rounded-2xl rounded-tl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Chips */}
            {showChips && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
                {QUICK_CHIPS.map(chip => (
                  <button
                    key={chip.label}
                    onClick={() => sendMessage(chip.q)}
                    className="flex-shrink-0 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs px-3 py-1.5 rounded-full hover:bg-purple-600/40 transition-colors whitespace-nowrap"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/10 flex gap-2 flex-shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about food, prices, ratings..."
                disabled={loading}
                className="flex-1 bg-[#2a2a3a] border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-orange-500 hover:bg-orange-400 disabled:bg-white/10 disabled:text-gray-500 text-white rounded-xl flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-transform"
        style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
        style={{ boxShadow: '0 0 0 0 rgba(249,115,22,0.4)', animation: open ? 'none' : 'pulse-ring 2s infinite' }}
      >
        {open ? '×' : '💬'}
        {!open && userMsgCount === 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0f0f13] animate-pulse" />
        )}
      </button>

      <style>{`
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(249,115,22,0.4); }
          70%  { box-shadow: 0 0 0 12px rgba(249,115,22,0); }
          100% { box-shadow: 0 0 0 0 rgba(249,115,22,0); }
        }
      `}</style>
    </>
  )
}
