import MemoryGame from './memory-match'

// The game fills the box it is placed in. Under the 5rem nav (plus its 2px
// border) that box is the rest of the viewport.
const MemoryMatch = () => (
  <div className='h-[calc(100dvh-5rem-2px)]'>
    <MemoryGame />
  </div>
)

export default MemoryMatch
