// SPDX-License-Identifier: Apache-2.0
//
// Carousel — Tier F (vfCarousel only). Spec reference: pilot components/molecules/VCarousel.js
// (rewritten as a factory function on the WAI-ARIA carousel pattern: labelled slides, previous /
// next buttons, a pause button for automatic rotation, which also stops on hover and focus and
// does not start when the user prefers reduced motion).

import vf from '../_internal/vf.js';
import { attrs } from '../_internal/attrs.js';
import { msg } from '../_internal/messages.js';
import { cls, present, emit } from '../_internal/common.js';
import { stateOf, instance, idSelector } from '../_internal/instance.js';

const html = vf.html;

function render(s) {
  const items = s.items || [];
  const total = items.length;
  const slides = [];
  const dots = [];
  for (let i = 0; i < total; i++) {
    const item = items[i] || {};
    const content = present(item.src)
      ? html`<img alt="${item.alt == null ? '' : item.alt}" ${attrs({ class: 'vf-carousel__image', src: item.src })}>`
      : item.content;
    slides.push(html`<div ${attrs({
      class: 'vf-carousel__slide',
      role: 'group',
      'aria-roledescription': msg('carousel.slide'),
      'aria-label': msg('carousel.position', null, { index: i + 1, total: total }),
      hidden: i !== s.index
    })}>${content}</div>`);
    if (s.showDots !== false) {
      dots.push(html`<button ${attrs({
        type: 'button',
        class: 'vf-carousel__dot',
        'data-action': 'go',
        'data-index': i,
        'aria-label': msg('carousel.goTo', null, { index: i + 1 }),
        'aria-current': i === s.index ? true : null
      })}></button>`);
    }
  }
  const autoplay = s.autoplay > 0
    ? html`<button ${attrs({ type: 'button', class: 'vf-carousel__rotation', 'data-action': 'rotation' })}>${s.playing ? msg('carousel.pause') : msg('carousel.play')}</button>`
    : '';
  const loop = s.loop !== false;
  return html`<section ${attrs({
    class: cls('vf-carousel', s.className),
    id: s.id,
    'data-ref': s.ref,
    'aria-roledescription': msg('carousel.carousel'),
    'aria-label': s.label
  })}><div class="vf-carousel__controls">${autoplay}<button ${attrs({
    type: 'button',
    class: 'vf-carousel__prev',
    'data-action': 'prev',
    'aria-controls': s.id + '-slides',
    'aria-label': msg('carousel.prev'),
    disabled: total < 2 || (!loop && s.index === 0)
  })}><span aria-hidden="true">&lsaquo;</span></button><button ${attrs({
    type: 'button',
    class: 'vf-carousel__next',
    'data-action': 'next',
    'aria-controls': s.id + '-slides',
    'aria-label': msg('carousel.next'),
    disabled: total < 2 || (!loop && s.index === total - 1)
  })}><span aria-hidden="true">&rsaquo;</span></button></div><div ${attrs({
    class: 'vf-carousel__slides',
    id: s.id + '-slides',
    'aria-live': s.playing ? 'off' : 'polite'
  })}>${slides}</div>${dots.length > 1 ? html`<div class="vf-carousel__dots">${dots}</div>` : ''}</section>`;
}

function reducedMotion() {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) {
    return false;
  }
}

/**
 * Slides one at a time.
 * @param {Object} props
 * @param {Array<{content?: *, src?: string, alt?: string}>} props.items - markup, or an image
 * @param {string} props.label - what the carousel shows (aria-label)
 * @param {number} [props.index=0]
 * @param {boolean} [props.loop=true] - next after the last goes to the first
 * @param {number} [props.autoplay=0] - ms between slides; 0 is off. Pauses on hover and focus,
 *   and does not start when the user prefers reduced motion (the play button still works).
 * @param {boolean} [props.showDots=true]
 * @param {function} [props.onChange] - ({ sender, event, data: { index } })
 *   Also: id, ref, className
 * @returns {Object} instance with getValue() → index, setValue(index), next(), prev(), goTo(i), play(), pause()
 */
export function vfCarousel(props) {
  const p = props || {};
  let timer = null;
  let held = false; // hover or focus inside

  function stop() {
    if (timer) clearTimeout(timer);
    timer = null;
  }
  function schedule(sender) {
    stop();
    if (!sender.state.playing || held || sender.state.autoplay <= 0) return;
    timer = setTimeout(function () {
      timer = null;
      go(sender, null, sender.state.index + 1, true);
      schedule(sender);
    }, sender.state.autoplay);
  }
  function go(sender, event, index, wrap) {
    const s = sender.state;
    const total = (s.items || []).length;
    if (!total) return;
    let next = Math.floor(Number(index) || 0);
    if (s.loop !== false || wrap) next = ((next % total) + total) % total;
    else next = Math.max(0, Math.min(total - 1, next));
    if (next === s.index) return;
    sender.setState({ index: next });
    if (event) emit(p.onChange, sender, event, { index: next });
  }
  function setPlaying(sender, playing) {
    sender.setState({ playing: playing });
    if (playing) schedule(sender);
    else stop();
  }

  const count = (p.items || []).length;
  const state = stateOf(p, 'carousel', {
    index: count ? Math.max(0, Math.min(count - 1, Math.floor(Number(p.index) || 0))) : 0,
    autoplay: Math.max(0, Number(p.autoplay) || 0),
    playing: false
  });
  return instance({
    state: state,
    render: render,
    delegates: [
      { selector: '[data-action="prev"]', eventType: 'click', onEvent: function (e) { go(e.sender, e.event, e.sender.state.index - 1); } },
      { selector: '[data-action="next"]', eventType: 'click', onEvent: function (e) { go(e.sender, e.event, e.sender.state.index + 1); } },
      { selector: '[data-action="go"]', eventType: 'click', onEvent: function (e) { go(e.sender, e.event, e.target.getAttribute('data-index')); } },
      { selector: '[data-action="rotation"]', eventType: 'click', onEvent: function (e) { setPlaying(e.sender, !e.sender.state.playing); } },
      // Hold the rotation while the pointer or the focus is inside (focusin / focusout bubble).
      { selector: idSelector(state.id), eventType: 'focusin', onEvent: function (e) { held = true; stop(); } },
      {
        selector: idSelector(state.id),
        eventType: 'focusout',
        onEvent: function (e) {
          if (e.event.relatedTarget && e.sender.$node.contains(e.event.relatedTarget)) return;
          held = false;
          schedule(e.sender);
        }
      }
    ],
    events: [
      { eventType: 'mouseenter', onEvent: function () { held = true; stop(); } },
      { eventType: 'mouseleave', onEvent: function (e) { held = false; schedule(e.sender); } }
    ],
    methods: {
      getValue: function () { return this.state.index; },
      setValue: function (index) { go(this, null, index); },
      goTo: function (index) { go(this, null, index); },
      next: function () { go(this, null, this.state.index + 1); },
      prev: function () { go(this, null, this.state.index - 1); },
      play: function () { setPlaying(this, true); },
      pause: function () { setPlaying(this, false); }
    },
    onMount: function (self) {
      if (self.state.autoplay > 0 && !reducedMotion()) setPlaying(self, true);
    },
    onDestroy: stop
  });
}
