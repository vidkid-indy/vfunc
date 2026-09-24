// SPDX-License-Identifier: Apache-2.0
//
// Types of the official update plugin (layer1/plugins/update.js, D-013).
//   import vfUpdate from 'vfunc/plugins/update';
//   const update = vf.use(vfUpdate, { url: './version.json', policy: 'next-navigation' });

import type { VfPlugin } from '../vfunc';

export type UpdatePolicy = 'next-navigation' | 'prompt' | 'immediate';

export interface UpdateInfo {
  current: string;
  latest: string;
  policy: UpdatePolicy;
}

export interface UpdateStatus extends UpdateInfo {
  /** A newer version was found and is waiting to be applied. */
  pending: boolean;
}

export interface UpdateOptions {
  /** Default './version.json'. The file is `{ "version": "1.0.3" }`, served with Cache-Control: no-cache. */
  url?: string;
  /** The running version. Empty: the first version read becomes the baseline. */
  current?: string;
  /** Default 'next-navigation'. 'prompt' needs onAvailable (otherwise it falls back to 'next-navigation'). */
  policy?: UpdatePolicy;
  /** Minutes between periodic checks. Default 10; 0 turns them off. */
  interval?: number;
  /** Seconds; checks closer together are skipped. Default 30. */
  minGap?: number;
  /** 'prompt' policy: show your own notice and call apply() to reload. */
  onAvailable?: (info: UpdateInfo, apply: () => void) => void;
  onError?: (error: unknown) => void;
  /** Replaces location.reload() (tests, custom handling). */
  reload?: () => void;
}

export interface UpdateApi {
  /** Reads version.json now; `force` ignores minGap. */
  check(force?: boolean): Promise<UpdateStatus>;
  /** Call from the router's onChange in history mode; hashchange and popstate are handled already. */
  navigated(): void;
  /** Reloads the page now. */
  apply(): void;
  status(): UpdateStatus;
  /** Removes the listeners and the timer. */
  stop(): void;
}

declare const vfUpdate: VfPlugin<UpdateApi, UpdateOptions>;
export default vfUpdate;
