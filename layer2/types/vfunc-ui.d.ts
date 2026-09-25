// SPDX-License-Identifier: Apache-2.0
//
// vfunc-ui — layer 2 of vfunc.js. The public API boundary of layer 2 (as types/vfunc.d.ts is
// for layer 1): vs* return SafeHtml markup, vf* return instances. Kept in sync with
// layer2/catalog.json and the exports of layer2/src/index.js (layer2/test/types.test.js).
// In the npm package this file sits next to vfunc.d.ts in types/.

import type { SafeHtml } from '../../layer1/types/vfunc';

export interface VsButtonProps {
  /** Text (escaped), or vf.html markup such as an icon and text. */
  label: string | SafeHtml;
  /** `data-variant`. Default 'secondary'. */
  variant?: 'secondary' | 'primary' | 'danger' | 'ghost';
  /** `data-size`. Default 'md'. */
  size?: 'md' | 'sm' | 'lg';
  /** Default 'button'. */
  type?: 'button' | 'submit' | 'reset';
  /** `data-action`, for delegates. */
  action?: string;
  /** `data-ref`. */
  ref?: string;
  id?: string;
  disabled?: boolean;
  /** Disabled with `aria-busy`, a spinner and a hidden "Loading" text. */
  loading?: boolean;
  /** Replaces the `common.loading` message. */
  loadingText?: string;
  /** For icon-only buttons. */
  ariaLabel?: string;
  /** Extra classes for your own CSS. */
  className?: string;
}

/** A `<button class="vf-button">`. */
export declare function vsButton(props: VsButtonProps): SafeHtml;

/** Every layer 2 member; importing the module also adds them to `vf`. */
declare const ui: {
  readonly vsButton: typeof vsButton;
};
export default ui;

declare module '../../layer1/types/vfunc' {
  interface Vf {
    readonly vsButton: typeof vsButton;
  }
}
