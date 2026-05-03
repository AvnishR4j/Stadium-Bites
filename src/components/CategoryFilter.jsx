const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🍽️' },
  { id: 'snacks', label: 'Snacks', emoji: '🍟' },
  { id: 'drinks', label: 'Drinks', emoji: '🥤' },
  { id: 'meals', label: 'Meals', emoji: '🍛' },
  { id: 'desserts', label: 'Desserts', emoji: '🍦' },
]

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 px-4 mb-5 overflow-x-auto pb-1 sb-scroll">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all"
          style={active === cat.id ? {
            background: '#f97316',
            color: '#fff',
            transform: 'scale(1.05)',
            boxShadow: '0 4px 16px rgba(249,115,22,0.4)',
          } : {
            background: 'rgba(255,255,255,0.08)',
            color: '#d1d5db',
          }}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}
