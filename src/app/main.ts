import Canvas from "./components/canvas"
import Scroll from "./components/scroll"
//@ts-ignore
import barba from "@barba/core"

import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
import gsap from "gsap"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

class App {
  canvas: Canvas
  scroll: Scroll
  template: "home" | "detail"

  constructor() {
    this.scroll = new Scroll()
    this.canvas = new Canvas()

    this.template = this.getCurrentTemplate()

    this.canvas.onPageChange(this.template)

    barba.init({
      prefetchIgnore: true,
      transitions: [
        {
          name: "default-transition",
          beforeLeave: () => {},
          leave: () => {
            return new Promise<void>((resolve) => {
              const tl = gsap.timeline()

              tl.call(() => {
                resolve()
              })
            })
          },
          beforeEnter: () => {
            this.scroll.reset()
            this.scroll.destroy()
          },
          after: () => {
            this.scroll.init()

            const template = this.getCurrentTemplate()
            this.setTemplate(template)
            this.canvas.onPageChange(this.template)

            return new Promise<void>((resolve) => {
              const tl = gsap.timeline()

              tl.call(() => {
                resolve()
              })
            })
          },
        },
      ],
    })

    this.render()
  }

  getCurrentTemplate() {
    return document
      .querySelector("[data-page-template]")
      ?.getAttribute("data-page-template") as "home" | "detail"
  }

  setTemplate(template: string) {
    this.template = template as "home" | "detail"
  }

  render() {
    const s = this.scroll?.getScroll() || 0

    this.canvas.render(s)

    requestAnimationFrame(this.render.bind(this))
  }
}

export default new App()
