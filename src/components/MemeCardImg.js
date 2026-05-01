'use client'
import { useState } from 'react'

export default function MemeCardImg({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src)
  return (
    <img
      src={imgSrc}
      alt={alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onError={() => setImgSrc('https://placehold.co/400x200/0a0a0a/1a1a1a?text=MEME')}
    />
  )
}
