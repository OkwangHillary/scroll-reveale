import { ScrollSmoother } from "gsap/ScrollSmoother"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default class Scroll {
  scroll: number
  s: globalThis.ScrollSmoother | null

  constructor() {
    this.init()
  }

  init() {
    this.scroll = 0

    ScrollTrigger.refresh()

    this.s = ScrollSmoother.create({
      smooth: 1,
      effects: true,
      normalizeScroll: true,
      wrapper: document.getElementById("app") as HTMLElement,
      onUpdate: (self) => {
        const s = self.scrollTop() || 0
        this.scroll = s
      },
    })
  }

  reset() {
    this.s?.scrollTo(0, false, "top")
  }

  destroy() {
    this.s?.kill()
    this.s = null
  }

  getScroll() {
    return this.scroll
  }
}
