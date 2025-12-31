import gsap from "gsap"
import { SplitText } from "gsap/SplitText"

export default class TextAnimation {
  elements: HTMLElement[]
  splits: globalThis.SplitText[] = []
  icon: HTMLElement

  constructor() {
    this.init()
  }

  init() {
    this.splits = []

    this.elements = document.querySelectorAll(
      "[data-text-animation]"
    ) as unknown as HTMLElement[]

    this.icon = document.querySelector("[data-icon]") as HTMLElement

    gsap.set(this.icon, { opacity: 0, autoAlpha: 1 })

    this.elements.forEach((el) => {
      const split = SplitText.create(el, { type: "chars", mask: "chars" })
      split.chars.forEach((char) => {
        gsap.set(char, { xPercent: -100 })
      })
      gsap.set(el, { autoAlpha: 1 })
      this.splits.push(split)
    })
  }

  animateIn({ delay = 0 } = {}) {
    const tl = gsap.timeline({ delay })

    const chars = this.splits.flatMap((split) => split.chars)

    tl.to(this.icon, { opacity: 1, duration: 0.3 }, 0)

    tl.to(
      chars,
      {
        xPercent: 0,
        stagger: 0.0125,
        ease: "power2.out",
        duration: 0.25,
      },
      0
    )

    return tl
  }
  animateOut() {
    const tl = gsap.timeline()

    const chars = this.splits.flatMap((split) => split.chars)

    tl.to(this.icon, { opacity: 0, duration: 0.3 }, 0)

    tl.to(
      chars,
      {
        xPercent: 100,
        stagger: 0.0125,
        ease: "power2.out",
        duration: 0.2,
      },
      0
    )

    return tl
  }

  destroy() {
    this.splits.forEach((split) => {
      split.revert()
    })
  }
}
