'use client'

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function useGSAP() {
  const scrollAnimation = useCallback((element: HTMLElement, animation: gsap.TweenVars) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
        ...animation
      }
    )
  }, [])

  return { scrollAnimation }
}

export function useScrollAnimation(
  element: string | Element | null,
  animation: gsap.TweenVars,
  trigger?: ScrollTrigger.Vars
) {
  useEffect(() => {
    if (!element) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        ...trigger
      }
    })

    tl.fromTo(element, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, ...animation })

    return () => {
      tl.kill()
    }
  }, [element, animation, trigger])
}

export function useParallax(
  element: string | Element | null,
  speed: number = 0.5
) {
  useEffect(() => {
    if (!element) return

    gsap.to(element, {
      yPercent: -50 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    })
  }, [element, speed])
} 