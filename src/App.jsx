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

  const filtered = category === 'all' ? foods : foods.filter(f => f.category === category)

  return (
    <div className="min-h-screen bg-[#0f0f13] pb-10">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a1020] to-[#0f0f13] px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">🏟️ Stadium Bites</h1>
            <p className="text-gray-400 text-xs">Live food ratings · Powered by AI</p>
          </div>
          <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
            LIVE
          </div>
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
              <div key={i} className="bg-white/5 rounded-2xl h-44 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No items in this category</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(food => (
              <FoodCard key={food.id} item={food} onClick={setSelectedFood} />
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
