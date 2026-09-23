// SPDX-License-Identifier: Apache-2.0
//
// Type declarations of vfunc.js layer 1. This file is the boundary of the public API
// (CLAUDE.md rules 16 and 18, D-009): anything not declared here is internal, and names starting
// with "_" are never public. Written by hand; keep it in step with ai-docs/vfunc_manual.md.

// ---------------------------------------------------------------------------------------------
// Safe HTML (manual section 4)
// ---------------------------------------------------------------------------------------------

/** Markup that vf.html trusts as-is. Created by vf.html, vf.tpl, vf.nl2br and vf.unsafeHtml. */
export interface SafeHtml {
  readonly value: string;
  toString(): string;
}

export interface SafeHtmlConstructor {
  new (value: string): SafeHtml;
  readonly prototype: SafeHtml;
}

/** For `instanceof` checks. Build markup with vf.html instead of calling this. */
export declare const SafeHtml: SafeHtmlConstructor;

/**
 * Tagged template that escapes each value for where it lands (text, quoted attribute, URL
 * attribute, bare attribute name, tag name). Event handler attributes, `srcdoc`, unquoted values
 * and `<script>`/`<style>` content are refused: the value is dropped and reported, or an error is
 * thrown with `vf.config({ strict: true })`.
 */
export declare function html(strings: TemplateStringsArray | readonly string[], ...values: unknown[]): SafeHtml;

/** vf.html for ES5 code: `{name}` and `{user.name}` are filled from own properties of `data`. */
export declare function tpl(template: string, data?: object): SafeHtml;

/** Trusted markup that vf.html will not escape. Never pass user data; comment why it is safe. */
export declare function unsafeHtml(markup: unknown): SafeHtml;

/** Escapes `& < > " '`. `null` and `undefined` become an empty string. */
export declare function esc(value: unknown): string;

/** Escapes and turns line breaks into `<br>`. */
export declare function nl2br(value: unknown): SafeHtml;

/** Relative URLs and http, https, mailto, tel pass unchanged; any other scheme gives `'#'`. */
export declare function safeUrl(url: unknown): string;

export interface VfConfig {
  /** Unsafe interpolation in vf.html throws instead of being dropped. */
  strict: boolean;
  /** Development build only: warn when render returns a plain string instead of vf.html output. */
  strictRender: boolean;
}

/** Reads or changes engine settings; returns a copy of the current settings. */
export declare function config(options?: Partial<VfConfig>): VfConfig;

// ---------------------------------------------------------------------------------------------
// Components (manual sections 2, 3 and 5)
// ---------------------------------------------------------------------------------------------

/** The event object passed to `onEvent` of events and delegates. */
export interface VfEvent<I = VfuncInstance> {
  /** The instance that received the event. */
  sender: I;
  /** The native event. */
  event: Event;
  /** `event.type`. */
  eventType: string;
  /** events: the element the listener is bound to. delegates: the element that matched the selector. */
  target: Element;
  /** events: the configured id (or the bound element's id). delegates: the matched element's id. */
  id: string;
  /** An empty object for your own use. */
  data: Record<string, unknown>;
}

/** Something that can be appended as a child: an instance or a DOM node. */
export type VfChild = { $node: Node } | Node;

export interface VfEventBinding<I> {
  /** The element with this id inside the root. Omitted: the root itself. */
  id?: string;
  eventType: string;
  onEvent?: (e: VfEvent<I>) => void;
}

export interface VfDelegateBinding<I> {
  /** Matched with `closest(selector)`; matches outside the root are ignored. */
  selector: string;
  eventType: string;
  onEvent?: (e: VfEvent<I>) => void;
}

export interface VfuncOptions<S extends object = Record<string, any>, M extends object = Record<string, any>> {
  /** Tag of the root element. Default `'div'`. */
  tag?: string;
  /** Properties assigned to the root element. innerHTML/outerHTML/srcdoc and string `on*` values are refused. */
  opts?: Record<string, unknown>;
  /** Initial markup when there is no render function. Trusted as-is: never put outside data here. */
  innerHTML?: string | SafeHtml;
  /** Returns the markup for the current state. Build it with vf.html. */
  render?: (this: VfuncInstance<S, M>, state: S) => SafeHtml | string;
  /** Use the first element of the markup as the root instead of wrapping it. */
  replaceRoot?: boolean;
  /** State. Each key is also readable and writable as `instance.key`. */
  state?: S;
  /** Methods bound to the instance, callable as `instance.name()`. */
  methods?: M & ThisType<VfuncInstance<S, M>>;
  events?: Array<VfEventBinding<VfuncInstance<S, M>>>;
  delegates?: Array<VfDelegateBinding<VfuncInstance<S, M>>>;
  /** Children appended after rendering; `{ targetId, component }` appends into that element. */
  childs?: Array<VfChild | { targetId: string; component: VfChild }>;
  /** Fallback handler for events and delegates without their own onEvent. */
  onEvent?: (e: VfEvent<VfuncInstance<S, M>>) => void;
  /** Called when render, a handler or a lifecycle hook throws. The engine does not recover. */
  onError?: (error: unknown) => void;
  /** After mount() or vf.attach() put the element in the page. Create third-party widgets here. */
  onMount?: (instance: VfuncInstance<S, M>) => void;
  /** After every refresh. */
  onUpdate?: (instance: VfuncInstance<S, M>) => void;
  /** At the start of destroy(), while the element is still in the page. Release widgets and timers here. */
  onDestroy?: (instance: VfuncInstance<S, M>) => void;
}

/** Members every instance has. */
export interface VfuncBase<S extends object = Record<string, any>, M extends object = Record<string, any>> {
  /** The root element. */
  readonly $node: HTMLElement;
  /** The current state object. */
  state: S;
  /** The bound methods. */
  methods: M;
  /** Descendant elements with an id (the root excluded). Updated on every refresh. */
  ids: Record<string, HTMLElement>;
  /** Descendant elements with `data-ref`. Updated on every refresh. */
  refs: Record<string, HTMLElement>;
  readonly isvfunc: true;
  /** Shallow merge and schedule one refresh per tick. `__proto__`, `constructor`, `prototype` are ignored. */
  setState(patch: Partial<S> & Record<string, unknown>): void;
  /** Schedule one refresh after changing `instance.state` directly. */
  scheduleRefresh(): void;
  /** Render again now. */
  refresh(): void;
  /** Append to an element or selector and call onMount. */
  mount(parent: Element | string): Promise<this>;
  /** Call onDestroy, release listeners, remove the root, clear ids and refs. Safe to call twice. */
  destroy(): void;
  /** The root's outerHTML, so an instance can be inserted with vf.html. */
  toString(): string;
}

/**
 * An instance. State keys, method names and element ids are also available directly on it
 * (priority: state > methods > ids), which the index signature stands for.
 */
export type VfuncInstance<S extends object = Record<string, any>, M extends object = Record<string, any>> =
  VfuncBase<S, M> & S & M & { [name: string]: any };

export interface VfuncConstructor {
  <S extends object = Record<string, any>, M extends object = Record<string, any>>(options?: VfuncOptions<S, M>): VfuncInstance<S, M>;
  new <S extends object = Record<string, any>, M extends object = Record<string, any>>(options?: VfuncOptions<S, M>): VfuncInstance<S, M>;
  readonly prototype: VfuncBase;
}

/** Creates a component. Callable with or without `new`. */
export declare const vfunc: VfuncConstructor;

/**
 * Turns an element that is already in the page into a component. Without render/innerHTML the
 * element itself becomes the root; with them the new markup replaces it (`replaceRoot` defaults to true).
 * Returns null when the target is not found.
 */
export declare function attach<S extends object = Record<string, any>, M extends object = Record<string, any>>(
  target: Element | string, options?: VfuncOptions<S, M>): VfuncInstance<S, M> | null;

// ---------------------------------------------------------------------------------------------
// DOM and form helpers (manual sections 6 and 7)
// ---------------------------------------------------------------------------------------------

/** `querySelector` on `root` (default: document). */
export declare function $(selector: string, root?: ParentNode): Element | null;

/** `querySelectorAll` on `root` (default: document), as an array. */
export declare function $$(selector: string, root?: ParentNode): Element[];

/** Creates an element and assigns properties with the same safety rules as `opts`. */
export declare function el<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Record<string, unknown>): HTMLElementTagNameMap[K];
export declare function el(tag: string, props?: Record<string, unknown>): HTMLElement;

/** The first element of the markup, or null. The markup is trusted as-is. */
export declare function node(markup: string | SafeHtml): Element | null;

/** A DocumentFragment with every top-level node of the markup. The markup is trusted as-is. */
export declare function frag(markup: string | SafeHtml): DocumentFragment;

/** `{ id: element }` for every descendant with an id. Dangerous keys are skipped. */
export declare function idMap(root: ParentNode): Record<string, Element>;

export type FormTarget = Element | Document | DocumentFragment | Record<string, Element>;
export type FormValue = string | boolean | string[];

export interface VfForm {
  /** Reads `{ id: value }`. Checkboxes and radios give a boolean, a multiple select an array. */
  values(target: FormTarget, options?: { skipPassword?: boolean }): Record<string, FormValue>;
  /** Clears the controls (hidden inputs kept, selects back to `user-default`) and returns the values. */
  reset(target: FormTarget): Record<string, FormValue>;
}

export declare const form: VfForm;

// ---------------------------------------------------------------------------------------------
// SPA (manual section 8)
// ---------------------------------------------------------------------------------------------

export interface RouteContext {
  /** The path without query, e.g. "/users/7". */
  path: string;
  /** Values of ":name" segments, and `wildcard` for "*". */
  params: Record<string, string>;
  query: Record<string, string>;
  /** The matched pattern, or null when nothing matched. */
  route: string | null;
}

export interface RouterOptions {
  /** 'hash' (default: any static server, IE) or 'history' (the server must return index.html). */
  mode?: 'hash' | 'history';
  /** Leading path in history mode, e.g. '/app'. */
  base?: string;
  routes: Record<string, (ctx: RouteContext) => void>;
  notFound?: (ctx: RouteContext) => void;
  onChange?: (ctx: RouteContext) => void;
  /** Links handled by the router. Default 'a[data-link]'. */
  linkSelector?: string;
  /** Selector focused after each navigation (for screen readers). */
  focus?: string;
}

export interface Router {
  start(): void;
  stop(): void;
  /** Only app paths starting with "/" are followed; anything else is refused. */
  go(path: string, options?: { replace?: boolean }): void;
  replace(path: string): void;
  current(): RouteContext;
  /** The link address for a path: '#/x' (hash) or '/app/x' (history). */
  href(path: string): string;
}

/** Hash or history routing. Client-side routes are not access control; authorize on the server. */
export declare function router(options: RouterOptions): Router;

export interface Store<S extends object = Record<string, any>> {
  /** The state object (treat it as read-only). */
  get(): S;
  /** One key. */
  get<K extends keyof S>(key: K): S[K];
  /** Merges own, non-dangerous keys and notifies subscribers once per tick. */
  set(patch: Partial<S> | ((state: S) => Partial<S>)): void;
  /** Returns an unsubscribe function. */
  subscribe(listener: (state: S) => void): () => void;
}

/** A small shared state container. */
export declare function store<S extends object = Record<string, any>>(initial?: S): Store<S>;

// ---------------------------------------------------------------------------------------------
// Internationalization (manual section 9)
// ---------------------------------------------------------------------------------------------

/** A message: text with `{name}` placeholders, a plural object, or a nested group of messages. */
export type I18nMessage = string | { zero?: string; one?: string; other: string; [category: string]: string | undefined };
export interface I18nMessages { [key: string]: I18nMessage | I18nMessages }

export interface I18nSetupOptions {
  /** The locale to start with. Otherwise: persisted value, navigator.language, fallback. */
  locale?: string;
  /** Default 'en'. */
  fallback?: string;
  /** Allow-list of locales (recommended). */
  locales?: string[];
  messages?: Record<string, I18nMessages>;
  /** Loads the messages of a locale that has none yet, e.g. fetched JSON. */
  load?: (locale: string) => I18nMessages | Promise<I18nMessages>;
  /** Remember the choice in localStorage: true uses the key 'vf.locale', a string is the key. */
  persist?: boolean | string;
}

export interface VfI18n {
  /** Resolves with the chosen locale. */
  setup(options?: I18nSetupOptions): Promise<string>;
  /** Changes the locale, updates `<html lang>` and notifies subscribers. Resolves with the locale in use. */
  set(locale: string): Promise<string>;
  locale(): string;
  /** Adds messages (deep merge; dangerous keys are ignored). */
  add(locale: string, messages: I18nMessages): void;
  /** Returns an unsubscribe function. */
  subscribe(listener: (locale: string) => void): () => void;
  /** Translates `data-i18n` (text only) and `data-i18n-attr` (allowed attributes only). */
  apply(root?: ParentNode): void;
}

export declare const i18n: VfI18n;

/** Translates a dotted key. Plain text: vf.html escapes it when inserted. `params.count` picks a plural. */
export declare function t(key: string, params?: Record<string, unknown>): string;

export interface VfFmt {
  number(value: number, options?: Intl.NumberFormatOptions): string;
  currency(value: number, currency: string, options?: Intl.NumberFormatOptions): string;
  date(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string;
  /** e.g. relative(-3, 'day'). Plain text where Intl.RelativeTimeFormat is missing (IE11). */
  relative(value: number, unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'): string;
}

/** Locale-aware formatting that follows vf.i18n.locale(). */
export declare const fmt: VfFmt;

// ---------------------------------------------------------------------------------------------
// Extensions (manual section 10)
// ---------------------------------------------------------------------------------------------

export interface VfPlugin<T = unknown, O = Record<string, unknown>> {
  /** Registered as vf.ext[name]. */
  name: string;
  version?: string;
  /** '*', 'x.y.z', '>=x.y.z' or '^x.y.z'. A mismatch warns; the plugin is still installed. */
  requires?: string;
  install(vf: Vf, options: O): T;
}

/** Installs an extension and returns what `install` returned (also stored in vf.ext[name]). */
export declare function use<T, O = Record<string, unknown>>(plugin: VfPlugin<T, O>, options?: O): T | undefined;

/** Installed extensions. User extensions live here, never on the vf root. */
export declare const ext: Record<string, any>;

/** The version of this build, e.g. "1.0.0". Importing the source directly gives "0.0.0-dev". */
export declare const version: string;

// ---------------------------------------------------------------------------------------------
// The vf object (default export and window.vf). Official members are read-only.
// ---------------------------------------------------------------------------------------------

export interface Vf {
  readonly vfunc: typeof vfunc;
  readonly attach: typeof attach;
  readonly html: typeof html;
  readonly unsafeHtml: typeof unsafeHtml;
  readonly tpl: typeof tpl;
  readonly esc: typeof esc;
  readonly nl2br: typeof nl2br;
  readonly safeUrl: typeof safeUrl;
  readonly $: typeof $;
  readonly $$: typeof $$;
  readonly el: typeof el;
  readonly node: typeof node;
  readonly frag: typeof frag;
  readonly idMap: typeof idMap;
  readonly form: typeof form;
  readonly router: typeof router;
  readonly store: typeof store;
  readonly i18n: typeof i18n;
  readonly t: typeof t;
  readonly fmt: typeof fmt;
  readonly use: typeof use;
  readonly ext: typeof ext;
  readonly config: typeof config;
  readonly SafeHtml: typeof SafeHtml;
  readonly version: typeof version;
}

declare const vf: Vf;
export default vf;
