import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { getCrowdPick } from './lib/gemini'
import AIBanner from './components/AIBanner'
import CategoryFilter from './components/CategoryFilter'
import TrendingSection from './components/TrendingSection'
import FoodCard from './components/FoodCard'
import ReviewModal from './components/ReviewModal'
import ChatBot from './components/ChatBot'
import './index.css'

export default function App() {
  const [foods, setFoods] = useState([])
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [crowdPick, setCrowdPick] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchFoods = useCallback(async () => {
    const { data } = await supabase
      .from('food_items')
      .select('*')
      .order('avg_rating', { ascending: false })
    const items = data || []
    setFoods(items)
    setLoading(false)
    const pick = await getCrowdPick(items)
    setCrowdPick(pick)
  }, [])

  useEffect(() => {
    fetchFoods()
    const channel = supabase
      .channel('food_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews' }, () => {
        fetchFoods()
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchFoods])

  const filtered = foods
    .filter(f => category === 'all' || f.category === category)
    .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-[#0f0f13] pb-10">
      {/* Header */}
      <div className="px-4 pt-6 pb-4" style={{ background: 'linear-gradient(180deg, #1a0f22 0%, #0f0f13 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">🏟️ Stadium Bites</h1>
            <p className="text-gray-400 text-xs">Live food ratings · Powered by AI</p>
          </div>
          <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
            LIVE
          </div>
        </div>
        {/* Search bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search food, drinks, snacks..."
            className="w-full bg-white/8 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/40 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-lg leading-none"
            >×</button>
          )}
        </div>
      </div>

      {/* AI Banner */}
      <AIBanner pick={crowdPick} />

      {/* Trending */}
      <TrendingSection items={foods} onSelect={setSelectedFood} />

      {/* Category Filter */}
      <CategoryFilter active={category} onChange={setCategory} />

      {/* Food Grid */}
      <div className="px-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-44" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            {search ? `No results for "${search}"` : 'No items in this category'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((food, i) => (
              <FoodCard key={food.id} item={food} onClick={setSelectedFood} index={i} />
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-gray-600 text-xs mt-8">
        Build With AI · Agentic Premier League 🏏
      </p>

      {selectedFood && (
        <ReviewModal
          item={selectedFood}
          onClose={() => setSelectedFood(null)}
          onReviewed={fetchFoods}
        />
      )}

      <ChatBot foods={foods} />
    </div>
  )
}
