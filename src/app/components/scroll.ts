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

    // Initialize smoother with explicit content to ensure proper sync
    this.s = ScrollSmoother.create({
      smooth: 1,
      normalizeScroll: true,
      ignoreMobileResize: true,
      wrapper: document.getElementById("app") as HTMLElement,
      content: document.getElementById("smooth-content") as HTMLElement,
      onUpdate: (self) => {
        this.scroll = self.scrollTop()
      },
    })

    ScrollTrigger.refresh()
  }

  reset() {
    this.s?.scrollTop(0)
  }

  destroy() {
    this.s?.scrollTrigger.kill()
    this.s?.kill()
    this.s = null
  }

  getScroll() {
    return this.s?.scrollTop() || 0
  }
}
