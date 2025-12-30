import Canvas from "./components/canvas"
import Scroll from "./components/scroll"
//@ts-ignore
import barba from "@barba/core"

import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
//@ts-ignore
import { Flip } from "gsap/Flip"
import gsap from "gsap"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Flip)

class App {
  canvas: Canvas
  scroll: Scroll
  template: "home" | "detail"

  mediaHomeState: Flip.FlipState
  scrollBlocked: boolean = false

  constructor() {
    this.scroll = new Scroll()
    this.canvas = new Canvas()

    this.template = this.getCurrentTemplate()

    this.onImagesLoaded(() => {
      this.canvas.onPageChange(this.template)
    })

    let activeLinkImage: HTMLImageElement
    let scrollTop: number

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
            this.scroll.reset()

            const template = this.getCurrentTemplate()
            this.setTemplate(template)

            return new Promise<void>((resolve) => {
              const tl = gsap.timeline()

              tl.call(() => {
                resolve()
                this.onImagesLoaded(() => {
                  this.canvas.onPageChange(this.template)
                })
              })
            })
          },
        },
        {
          name: "home-detail",
          from: {
            custom: () => {
              const activeLink = document.querySelector(
                'a[data-home-link-active="true"]'
              )
              if (!activeLink) return false

              return true
            },
          },
          before: () => {
            this.scrollBlocked = true
          },

          leave: () => {
            scrollTop = this.scroll.getScroll()

            activeLinkImage = document.querySelector(
              'a[data-home-link-active="true"] img'
            ) as HTMLImageElement

            this.canvas.medias?.forEach((media) => {
              if (!media) return
              media.scrollTrigger.kill()
            })

            const container = document.querySelector(
              ".container"
            ) as HTMLElement
            container.style.position = "fixed"
            container.style.top = `-${scrollTop}px`
            container.style.width = "100%"
            container.style.zIndex = "1000"

            this.mediaHomeState = Flip.getState(activeLinkImage)
          },
          beforeEnter: () => {
            this.scroll.reset()
            this.scroll.destroy()
          },
          after: () => {
            this.scroll.init()

            const detailContainer = document.querySelector(
              ".details-container"
            ) as HTMLElement

            detailContainer.innerHTML = ""
            detailContainer.appendChild(activeLinkImage)

            const template = this.getCurrentTemplate()
            this.setTemplate(template)

            const tl = gsap.timeline()

            return new Promise<void>((resolve) => {
              Flip.from(this.mediaHomeState, {
                absolute: true,
                delay: 0.3,
                duration: 1.3,
                ease: "power2.inOut",
              })

              this.canvas.medias?.forEach((media) => {
                if (!media) return
                if (media.element !== activeLinkImage) {
                  tl.to(
                    media.material.uniforms.uProgress,
                    {
                      duration: 0.6,
                      value: 0,
                      ease: "power2.inOut",
                    },
                    0
                  )
                } else {
                  tl.to(
                    media.material.uniforms.uProgress,
                    { duration: 0.3, value: 1 },
                    0
                  )
                }
              })

              tl.call(() => {
                this.scrollBlocked = false
                this.canvas.onPageChange(this.template)
                resolve()
              })
            })
          },
        },
      ],
    })

    this.render = this.render.bind(this)
    gsap.ticker.add(this.render)
  }

  getCurrentTemplate() {
    return document
      .querySelector("[data-page-template]")
      ?.getAttribute("data-page-template") as "home" | "detail"
  }

  setTemplate(template: string) {
    this.template = template as "home" | "detail"
  }

  onImagesLoaded(callback?: () => void) {
    const medias = document.querySelectorAll("img")
    let loadedImages = 0
    const totalImages = medias.length

    medias.forEach((img) => {
      if (img.complete) {
        loadedImages++
      } else {
        img.addEventListener("load", () => {
          loadedImages++
          if (loadedImages === totalImages) {
            if (callback) callback()
            ScrollTrigger.refresh()
          }
        })
      }
    })

    if (loadedImages === totalImages) {
      if (callback) callback()
      ScrollTrigger.refresh()
    }
  }

  render() {
    const s = this.scroll?.getScroll() || 0
    this.canvas.render(s, !this.scrollBlocked)
  }
}

export default new App()
