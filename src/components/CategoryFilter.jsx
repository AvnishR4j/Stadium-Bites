const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'snacks', label: 'Snacks', emoji: '🍟' },
  { id: 'drinks', label: 'Drinks', emoji: '🥤' },
  { id: 'meals', label: 'Meals', emoji: '🍛' },
  { id: 'desserts', label: 'Desserts', emoji: '🍦' },
]

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 px-4 mb-5 overflow-x-auto pb-1">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all
            ${active === cat.id
              ? 'bg-orange-500 text-white shadow-lg scale-105'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}
