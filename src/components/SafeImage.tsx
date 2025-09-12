import Image from 'next/image'
import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  className?: string
  priority?: boolean
  onError?: () => void
  fallbackSrc?: string
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  className,
  priority,
  onError,
  fallbackSrc = '/images/Logo.png'
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isError, setIsError] = useState(false)

  const handleError = () => {
    if (!isError) {
      setIsError(true)
      setImgSrc(fallbackSrc)
      onError?.()
    }
  }

  if (imgSrc.endsWith('.svg')) {
    if (fill) {
      return (
        <div className={`relative ${className}`}>
                  <Image
          src={imgSrc}
          alt={alt || ''}
          fill
          sizes={sizes}
          className="object-contain"
          onError={handleError}
          priority={priority}
        />
        </div>
      )
    } else {
      return (
        <Image
          src={imgSrc}
          alt={alt || ''}
          width={width}
          height={height}
          className={className}
          onError={handleError}
          priority={priority}
        />
      )
    }
  }

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    onError: handleError,
    priority
  }

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        sizes={sizes}
        alt={alt || ''}
      />
    )
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      alt={alt || ''}
    />
  )
} 