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

  constructor() {
    this.scroll = new Scroll()
    this.canvas = new Canvas()

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
          beforeEnter: () => {},
          after: () => {
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

  render() {
    const s = this.scroll.getScroll()

    this.canvas.render(s)

    requestAnimationFrame(this.render.bind(this))
  }
}

export default new App()
