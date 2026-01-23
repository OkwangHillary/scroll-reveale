import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

interface AnimationProps {
  element: HTMLElement;
  split: globalThis.SplitText;
  inDuration: number;
  outDuration: number;
  inDelay?: number;
  inStagger?: number;
  outStagger?: number;
}

export default class TextAnimation {
  elements: HTMLElement[];
  animations: AnimationProps[] = [];
  tweensWithScroll: gsap.core.Tween[] = [];

  constructor() {
    this.init();
  }

  init() {
    this.animations = [];

    this.elements = document.querySelectorAll(
      '[data-text-animation]'
    ) as unknown as HTMLElement[];

    this.elements.forEach((el) => {
      const split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
      });

      const inDuration = parseFloat(
        el.getAttribute('data-text-animation-in-duration') || '0.75'
      );

      const outDuration = parseFloat(
        el.getAttribute('data-text-animation-out-duration') || '0.2'
      );

      const inDelay = parseFloat(
        el.getAttribute('data-text-animation-in-delay') || '0'
      );

      const inStagger = parseFloat(
        el.getAttribute('data-text-animation-in-stagger') || '0.06'
      );

      const outStagger = parseFloat(
        el.getAttribute('data-text-animation-out-stagger') || '0.06'
      );

      const initialProps = { yPercent: 100 };

      split.lines.forEach((line) => {
        gsap.set(line, initialProps);
      });

      gsap.set(el, { autoAlpha: 1 });

      this.animations.push({
        element: el,
        split,
        inDuration,
        outDuration,
        inStagger,
        outStagger,
        inDelay,
      });
    });
  }

  animateIn({ delay = 0 } = {}) {
    const tl = gsap.timeline({ delay });

    this.animations.forEach(
      ({ element, split, inDuration, inStagger, inDelay }) => {
        const parentGridItem = element
          .closest('.grid__item')
          ?.querySelector('img');

        const tweenWithScroll = gsap.to(split.lines, {
          yPercent: 0,
          stagger: inStagger,
          scrollTrigger: {
            trigger: element,
            endTrigger: parentGridItem,
            start: 'top bottom',
            end: 'bottom top',
            toggleActions: 'play reset restart reset',
          },
          ease: 'expo',
          duration: inDuration,
          delay: inDelay,
        });

        this.tweensWithScroll.push(tweenWithScroll);
      }
    );

    return tl;
  }

  animateOut() {
    const tl = gsap.timeline();

    this.animations.forEach(({ split, outDuration, outStagger }) => {
      const finalProps = { yPercent: 100 };

      tl.to(
        split.lines,
        {
          ...finalProps,
          stagger: outStagger,
          ease: 'power2.out',
          duration: outDuration,
        },
        0
      );
    });

    return tl;
  }

  destroy() {
    this.tweensWithScroll.forEach((tween) => {
      tween.scrollTrigger?.kill();
      tween.kill();
    });

    this.animations.forEach(({ split }) => {
      split.revert();
    });

    this.tweensWithScroll = [];
  }
}
