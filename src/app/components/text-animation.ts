import gsap from "gsap"
import { SplitText } from "gsap/SplitText"

interface AnimationProps {
  split: globalThis.SplitText
  type: "vertical" | "horizontal"
  inDuration: number
  outDuration: number
  inDelay?: number
}

export default class TextAnimation {
  elements: HTMLElement[]
  animations: AnimationProps[] = []
  icon: HTMLElement | null = null

  constructor() {
    this.init()
  }

  init() {
    this.animations = []

    this.elements = document.querySelectorAll(
      "[data-text-animation]"
    ) as unknown as HTMLElement[]

    this.icon = document.querySelector("[data-icon]")

    if (this.icon) gsap.set(this.icon, { opacity: 0, autoAlpha: 1 })

    this.elements.forEach((el) => {
      const split = SplitText.create(el, {
        type: "words, chars",
        mask: "chars",
      })

      const type = (el.getAttribute("data-text-animation-type") ||
        "horizontal") as "vertical" | "horizontal"

      const inDuration = parseFloat(
        el.getAttribute("data-text-animation-in-duration") || "0.25"
      )

      const outDuration = parseFloat(
        el.getAttribute("data-text-animation-out-duration") || "0.2"
      )

      const inDelay = parseFloat(
        el.getAttribute("data-text-animation-in-delay") || "0"
      )

      const initialProps =
        type === "vertical" ? { yPercent: 100 } : { xPercent: -100 }

      split.chars.forEach((char) => {
        gsap.set(char, initialProps)
      })

      gsap.set(el, { autoAlpha: 1 })
      this.animations.push({ split, type, inDuration, outDuration, inDelay })
    })
  }

  animateIn({ delay = 0 } = {}) {
    const tl = gsap.timeline({ delay })

    if (this.icon) tl.to(this.icon, { opacity: 1, duration: 0.3 }, 0)

    this.animations.forEach(({ split, inDuration, inDelay }) => {
      tl.to(
        split.chars,
        {
          xPercent: 0,
          yPercent: 0,
          stagger: 0.0125,
          ease: "power2.out",
          duration: inDuration,
          delay: inDelay,
        },
        0
      )
    })

    return tl
  }
  animateOut() {
    const tl = gsap.timeline()

    if (this.icon) tl.to(this.icon, { opacity: 0, duration: 0.3 }, 0)

    this.animations.forEach(({ split, type, outDuration }) => {
      const finalProps =
        type === "vertical" ? { yPercent: 100 } : { xPercent: 100 }

      tl.to(
        split.chars,
        {
          ...finalProps,
          stagger: 0.0125,
          ease: "power2.out",
          duration: outDuration,
        },
        0
      )
    })

    return tl
  }

  destroy() {
    this.animations.forEach(({ split }) => {
      split.revert()
    })
  }
}
