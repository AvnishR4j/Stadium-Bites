const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`

async function callGemini(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  })
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

export async function getAISummary(foodName, reviews) {
  if (!reviews.length) return { summary: 'Be the first to review!', sentiment: 'New' }
  const reviewText = reviews.map(r => `Rating: ${r.rating}/5 — "${r.comment || 'No comment'}"`).join('\n')
  const prompt = `You are a food critic at a cricket stadium. Reviews for "${foodName}":
${reviewText}
Write a 1-sentence punchy summary. Classify as exactly one of: Loved | Mixed | Avoid.
Respond ONLY with valid JSON: {"summary": "...", "sentiment": "Loved|Mixed|Avoid"}`
  try {
    const text = await callGemini(prompt)
    const match = text.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : { summary: 'Crowd is loving it!', sentiment: 'Loved' }
  } catch {
    return { summary: 'Check the reviews below!', sentiment: 'Mixed' }
  }
}

export async function getChatResponse(question, foodItems, history = []) {
  const menu = foodItems.map(f =>
    `${f.image_emoji} ${f.name} (${f.category}) — ₹${f.price}, Rating: ${Number(f.avg_rating).toFixed(1)}★, ${f.review_count} reviews, Stall: ${f.stall_name}`
  ).join('\n')

  const historyText = history.slice(-6)
    .map(m => `${m.role === 'user' ? 'Fan' : 'Assistant'}: ${m.text}`)
    .join('\n')

  const prompt = `You are a friendly, energetic food guide at a cricket stadium.
Current stadium menu with live crowd ratings:
${menu}
${historyText ? `\nRecent conversation:\n${historyText}\n` : ''}
Fan asks: "${question}"

Reply in 2-3 sentences max. Be specific — mention food names, prices, ratings. Be fun and match the cricket stadium vibe. No bullet points, just natural conversation.`

  try {
    const text = await callGemini(prompt)
    return text.trim()
  } catch {
    return "Sorry, I'm having trouble right now. Try asking again!"
  }
}

export async function getCrowdPick(foodItems) {
  const sorted = [...foodItems].filter(f => f.review_count > 0).sort((a, b) => b.avg_rating - a.avg_rating)
  if (!sorted.length) return null
  const top = sorted.slice(0, 5).map(f => `${f.name}: ${Number(f.avg_rating).toFixed(1)}★ (${f.review_count} reviews)`).join('\n')
  const prompt = `Stadium food ranked by rating:
${top}
Pick the #1 item and write a fun, energetic 1-sentence recommendation for stadium fans. Be hype!
Respond ONLY with valid JSON: {"item": "...", "recommendation": "..."}`
  try {
    const text = await callGemini(prompt)
    const match = text.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : null
  } catch {
    return null
  }
}
