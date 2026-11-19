import React, { useState, useRef, useEffect } from 'react';
import Hero from './Hero';
import logo from '../assets/images/shlogo300.png'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { FaChevronDown, FaLock } from 'react-icons/fa'

// Site gold; one shade darker than the border so it's readable on white.
const navText = 'text-yellow-600'

const practiceItems = [
  { label: 'Violin', to: '/practice/violin' },
  { label: 'Piano', to: '/practice/piano' },
  { label: 'Viola', to: '/practice/viola' },
]

const gamesItems = [
  { label: 'Memory Match', to: '/games/memory-match' },
]

const NavDropdown = ({ label, items, basePath }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { pathname } = useLocation()
  const active = pathname.startsWith(basePath)

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className='relative'
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setOpen(true) }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setOpen(false) }}
    >
      <button
        type='button'
        aria-haspopup='menu'
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex cursor-pointer items-center gap-1 ${navText} hover:bg-yellow-500 hover:text-black rounded-md px-3 py-2 ${active ? 'bg-yellow-500 text-black' : ''}`}
      >
        {label}
        <FaChevronDown className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden='true' />
      </button>
      {open && (
        <div
          role='menu'
          className='absolute left-0 top-full z-50 min-w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg'
        >
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              role='menuitem'
              onClick={() => setOpen(false)}
              className={`block px-4 py-2 ${navText} hover:bg-yellow-500 hover:text-black`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const Navbar = () => {
  return (
    <>
      <nav className='bg-white-500 border-b-2 border-yellow-500'>
        <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
          <div className='flex h-20 items-center justify-between'>
            <div className='flex flex-1 items-center justify-center md:items-stretch md:justify-start'>
              <Link to={'/'}>
                <img className='h-12' src={logo}/>
              </Link>
              <div className='md:ml-auto'>
                <div className='flex space-x-2'>
                  {/* <Link 
                    to="/recipe"
                    className='text-blue-400 hover:bg-blue-400 hover:text-blue-900  rounded-md px-3 py-2'
                  >
                    Recipe Remix
                  </Link> */}
                  {/* <Link 
                    to={"/projects"}
                    className='text-black hover:bg-gray-900 hover:text-yellow-400 rounded-md px-3 py-2'
                  >
                    Projects
                  </Link> */}
                  {/* <Link 
                    to={"/about-recipe"}
                    className='text-blue-900 hover:bg-blue-400 hover:text-blue-900 rounded-md px-3 py-2'
                  >Recipe Remix</Link> */}
                  <NavDropdown label='Practice' items={practiceItems} basePath='/practice'/>
                  <NavDropdown label='Games' items={gamesItems} basePath='/games'/>
                  <Link 
                    to={"/world-map"}
                    className={`${navText} hover:bg-yellow-400 hover:text-black rounded-md px-3 py-2`}
                  >
                    World Map
                  </Link>
                  <Link 
                    to={"/multiplication"}
                    className={`${navText} hover:bg-yellow-400 hover:text-black rounded-md px-3 py-2`}
                  >
                    Multiplication
                  </Link>
                  <Link
                    to={"/monitor"}
                    className={`flex items-center gap-1 ${navText} hover:bg-yellow-400 hover:text-black rounded-md px-3 py-2`}
                  >
                    <FaLock className='text-xs' aria-hidden='true' />
                    Monitor
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <Outlet/>
    </>
  )
}

export default Navbar