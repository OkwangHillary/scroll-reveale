import { ScrollSmoother } from "gsap/ScrollSmoother"

export default class Scroll {
  scroll: number
  s: globalThis.ScrollSmoother

  constructor() {
    this.scroll = 0

    const content = document.getElementById("app") as HTMLElement
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

  getScroll() {
    return this.scroll
  }
}
