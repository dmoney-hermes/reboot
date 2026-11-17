import { useState, useEffect } from 'react'

const SYMBOLS = ['🐻', '🍎', '🎻', '🎹', '🌲', '⭐', '🍯', '🌈']

const shuffledDeck = () =>
  [...SYMBOLS, ...SYMBOLS]
    .map((symbol, i) => ({ id: i, symbol, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)

const MemoryMatch = () => {
  const [cards, setCards] = useState(shuffledDeck)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)

  const won = matched.length === cards.length

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    const timer = setTimeout(() => {
      if (cards[a].symbol === cards[b].symbol) setMatched((m) => [...m, a, b])
      setFlipped([])
    }, 800)
    return () => clearTimeout(timer)
  }, [flipped, cards])

  const flip = (i) => {
    if (flipped.length >= 2 || flipped.includes(i) || matched.includes(i)) return
    setFlipped((f) => [...f, i])
    if (flipped.length === 1) setMoves((m) => m + 1)
  }

  const reset = () => {
    setCards(shuffledDeck())
    setFlipped([])
    setMatched([])
    setMoves(0)
  }

  return (
    <div className='mx-auto max-w-md px-4 py-8 text-center'>
      <h1 className='mb-2 text-3xl font-bold text-blue-900'>Memory Match</h1>
      <p className='mb-4 text-gray-700'>Moves: {moves}</p>
      <div className='grid grid-cols-4 gap-3'>
        {cards.map((card, i) => {
          const faceUp = flipped.includes(i) || matched.includes(i)
          return (
            <button
              key={card.id}
              type='button'
              onClick={() => flip(i)}
              aria-label={faceUp ? card.symbol : 'Hidden card'}
              className={`aspect-square cursor-pointer rounded-md border-2 border-yellow-500 text-3xl transition-colors ${
                faceUp ? 'bg-white' : 'bg-yellow-500 hover:bg-yellow-400'
              } ${matched.includes(i) ? 'opacity-60' : ''}`}
            >
              {faceUp ? card.symbol : ''}
            </button>
          )
        })}
      </div>
      {won && (
        <p className='mt-4 text-xl font-semibold text-blue-900'>
          You won in {moves} moves!
        </p>
      )}
      <button
        type='button'
        onClick={reset}
        className='mt-6 cursor-pointer rounded-md bg-yellow-500 px-4 py-2 text-black hover:bg-yellow-400'
      >
        New Game
      </button>
    </div>
  )
}

export default MemoryMatch
