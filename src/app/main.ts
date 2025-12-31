import Canvas from "./components/canvas"
import Scroll from "./components/scroll"
//@ts-ignore
import barba from "@barba/core"

import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
//@ts-ignore
import { Flip } from "gsap/Flip"
import gsap from "gsap"
import Media from "./components/media"

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, Flip)

class App {
  canvas: Canvas
  scroll: Scroll
  template: "home" | "detail"

  mediaHomeState: Flip.FlipState
  scrollBlocked: boolean = false
  scrollTop: number

  constructor() {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }

    this.scroll = new Scroll()
    this.canvas = new Canvas()

    this.template = this.getCurrentTemplate()

    this.onImagesLoaded(() => {
      this.canvas.createMedias()
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
            const media = this.canvas.medias && this.canvas.medias[0]
            if (!media) return

            media.onResize(this.canvas.sizes)

            gsap.set(media.element, {
              visibility: "hidden",
              opacity: 0,
            })
            media.material.uniforms.uGridSize.value = 50

            return new Promise<void>((resolve) => {
              const tl = gsap.timeline()

              tl.fromTo(
                media.material.uniforms.uProgress,
                { value: 1 },
                {
                  duration: 1.6,
                  ease: "linear",
                  value: 0,
                },
                0
              )

              tl.call(() => {
                resolve()
              })
            })
          },
          beforeEnter: () => {
            this.canvas.medias?.forEach((media) => {
              media?.destroy()
              media = null
            })

            this.scroll.reset()
            this.scroll.destroy()
          },
          after: () => {
            this.scroll.init()

            const template = this.getCurrentTemplate()
            this.setTemplate(template)

            return new Promise<void>((resolve) => {
              const tl = gsap.timeline()

              tl.call(() => {
                resolve()
                this.onImagesLoaded(() => {
                  this.canvas.medias = []
                  this.canvas.createMedias()
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
            //this.scroll.s?.paused(true)
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
                delay: 0.2,
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
                  gsap.set(media.material.uniforms.uProgress, { value: 0 })
                }
              })

              let activeMedia: Media | null = null

              tl.call(() => {
                this.scrollBlocked = false
                this.canvas.medias?.forEach((media) => {
                  if (media && media.element !== activeLinkImage) {
                    media.destroy()
                    media = null
                  } else {
                    activeMedia = media
                  }
                })

                this.canvas.medias = [activeMedia]

                resolve()
              })
            })
          },
        },
      ],
    })

    window.addEventListener("beforeunload", () => {
      this.scroll?.reset()
    })

    window.addEventListener("pageshow", (event) => {
      // Handle BFCache restores without auto scroll restoration
      const e = event as PageTransitionEvent
      if (e.persisted) {
        this.scroll?.reset()
        window.scrollTo({ top: 0, left: 0, behavior: "auto" })
      }
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
    this.scrollTop = this.scroll?.getScroll() || 0
    this.canvas.render(this.scrollTop, !this.scrollBlocked)
  }
}

export default new App()
