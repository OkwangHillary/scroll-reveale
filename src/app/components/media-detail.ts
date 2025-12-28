export default class MediaDetail {
  element: HTMLImageElement

  constructor() {
    this.element = document.querySelector(
      "img[data-detail-media]"
    ) as HTMLImageElement
  }

  transitionIn() {}
}
