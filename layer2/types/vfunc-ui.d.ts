// SPDX-License-Identifier: Apache-2.0
//
// vfunc-ui — layer 2 of vfunc.js. The public API boundary of layer 2 (as types/vfunc.d.ts is
// for layer 1): vs* return SafeHtml markup, vf* return instances. Kept in sync with
// layer2/catalog.json and the exports of layer2/src/index.js (layer2/test/types.test.js).
// In the npm package this file sits next to vfunc.d.ts in types/.

import type { SafeHtml, VfuncInstance } from '../../layer1/types/vfunc';

/** What every vf* callback receives (the G-2 event contract). `event` is null for calls from code. */
export interface VfUiEvent<D = Record<string, unknown>, I = VfuncInstance> {
  sender: I;
  event: Event | null;
  data: D;
}

/**
 * A vf* instance: a vfunc instance (mount, destroy, setState, refs …) whose root is the vs* markup,
 * with getValue/setValue. setValue never calls onChange.
 */
export type VfValueInstance<V, M = {}> = VfuncInstance & {
  getValue(): V;
  setValue(value: V): void;
} & M;

/** Text (escaped) or vf.html markup. A plain string is never read as HTML. */
export type VsContent = string | number | SafeHtml;

/** Props every vs* takes (D-030). */
export interface VsCommonProps {
  id?: string;
  /** `data-ref`. */
  ref?: string;
  /** `data-action`, for delegates. */
  action?: string;
  /** Extra ids for `aria-describedby`. */
  describedBy?: string;
  /** Extra classes for your own CSS, on the outermost element. */
  className?: string;
}

/** Label, hint and error: given any of them, the control is wrapped in `.vf-field` and linked. */
export interface VsFieldTextProps {
  label?: VsContent;
  hint?: VsContent;
  /** Also sets `aria-invalid="true"` on the control. */
  error?: VsContent;
  required?: boolean;
}

/** Props of the form controls. */
export interface VsControlProps extends VsCommonProps, VsFieldTextProps {
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
}

/** An option of vsSelect, vsRadioGroup and vsSelectButton. */
export type VsOption = string | number | { value: string | number; label?: VsContent; disabled?: boolean };

// ---------------------------------------------------------------------------------------------
// Display
// ---------------------------------------------------------------------------------------------

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
  /** Extra ids for `aria-describedby`. */
  describedBy?: string;
  /** More aria-* attributes by name without the prefix, e.g. `{ haspopup: 'menu', expanded: false }`. */
  aria?: Record<string, string | number | boolean | null | undefined>;
  /** Extra classes for your own CSS. */
  className?: string;
}

/** A `<button class="vf-button">`. */
export declare function vsButton(props: VsButtonProps): SafeHtml;

export interface VsButtonGroupProps {
  /** vsButton props for each button. */
  buttons: VsButtonProps[];
  /** `aria-label` of the group. */
  label?: string;
  /** For every button without a size of its own. */
  size?: 'md' | 'sm' | 'lg';
  /** Joined edges (`data-attached`). */
  attached?: boolean;
  id?: string;
  ref?: string;
  className?: string;
}

/** Buttons in a `<div role="group" class="vf-button-group">`. */
export declare function vsButtonGroup(props: VsButtonGroupProps): SafeHtml;

/** The tones of Badge, Tag and Timeline. */
export type VsTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface VsBadgeProps extends VsCommonProps {
  label: VsContent;
  /** `data-variant`. Default 'neutral'. */
  variant?: VsTone;
  /** A status dot before the label. */
  dot?: boolean;
}

/** A `<span class="vf-badge">`. */
export declare function vsBadge(props: VsBadgeProps): SafeHtml;

export interface VsTagProps {
  label: VsContent;
  /** Default 'neutral'. */
  variant?: VsTone;
  /** `data-value` on the tag and its remove button. */
  value?: string;
  /** Adds a remove button. */
  removable?: boolean;
  /** `data-action` of the remove button. Default 'remove'. */
  removeAction?: string;
  /** Replaces the `tag.remove` message ("Remove {label}"). */
  removeLabel?: string;
  /** Disables the remove button. */
  disabled?: boolean;
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<span class="vf-tag">`; the app removes it in its own delegate. */
export declare function vsTag(props: VsTagProps): SafeHtml;

export interface VsAvatarProps {
  /** The accessible name, and the initials when there is no src. */
  name?: string;
  /** Image URL (vf.safeUrl). */
  src?: string;
  /** The accessible name when it differs from name. */
  alt?: string;
  /** `data-size`. Default 'md'. */
  size?: 'md' | 'sm' | 'lg';
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<span class="vf-avatar" role="img">` with an image or initials. */
export declare function vsAvatar(props: VsAvatarProps): SafeHtml;

export interface VsAlertProps {
  message?: VsContent;
  title?: VsContent;
  /** `data-variant`. Default 'info'. danger and warning get role="alert", the others role="status". */
  variant?: 'info' | 'success' | 'warning' | 'danger';
  /** Adds a close button. */
  dismissible?: boolean;
  /** `data-action` of the close button. Default 'dismiss'. */
  dismissAction?: string;
  /** Replaces the `alert.dismiss` message. */
  dismissLabel?: string;
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<div class="vf-alert">`. */
export declare function vsAlert(props: VsAlertProps): SafeHtml;

/** A slot: text (escaped), vf.html markup, a vfunc instance or an array of them. */
export type VsSlot = VsContent | { isvfunc: true } | Array<VsContent | { isvfunc: true }>;

export interface VsCardProps {
  title?: VsContent;
  subtitle?: VsContent;
  /** Markup at the end of the header, such as buttons. */
  actions?: VsSlot;
  body?: VsSlot;
  footer?: VsSlot;
  /** The title's heading level, 2–6. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<div class="vf-card">`. */
export declare function vsCard(props: VsCardProps): SafeHtml;

export interface VsDescriptionsProps {
  items: Array<{ label: VsContent; value: VsSlot }>;
  /** `data-columns`, one column on narrow screens. Default 1. */
  columns?: 1 | 2 | 3 | 4;
  title?: VsContent;
  id?: string;
  ref?: string;
  className?: string;
}

/** Label/value pairs as a `<dl>`. */
export declare function vsDescriptions(props: VsDescriptionsProps): SafeHtml;

export interface VsStatCardProps {
  label: VsContent;
  /** A number goes through vf.fmt.number(value, format). */
  value: VsContent;
  format?: Intl.NumberFormatOptions;
  /** The change as a ratio: 0.125 shows "+12.5%" (`data-trend`). */
  delta?: number;
  deltaLabel?: VsContent;
  description?: VsContent;
  /** Decorative markup before the label. */
  icon?: VsSlot;
  id?: string;
  ref?: string;
  className?: string;
}

/** A key figure in a `<div class="vf-stat-card">`. */
export declare function vsStatCard(props: VsStatCardProps): SafeHtml;

export interface VsTimelineProps {
  items: Array<{ title: VsContent; time?: Date | number | string; description?: VsContent; variant?: VsTone }>;
  /** For vf.fmt.date. */
  timeFormat?: Intl.DateTimeFormatOptions;
  id?: string;
  ref?: string;
  className?: string;
}

/** Events in an `<ol class="vf-timeline">`. */
export declare function vsTimeline(props: VsTimelineProps): SafeHtml;

export interface VsEmptyStateProps {
  /** Replaces the `emptyState.title` message. */
  title?: VsContent;
  description?: VsContent;
  /** Decorative markup. */
  icon?: VsSlot;
  /** Markup such as a vsButton. */
  action?: VsSlot;
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<div class="vf-empty-state">`. */
export declare function vsEmptyState(props: VsEmptyStateProps): SafeHtml;

export interface VsSkeletonProps {
  /** `data-variant`. Default 'text'. */
  variant?: 'text' | 'rect' | 'circle';
  /** Text lines, 1–20. Default 1. */
  lines?: number;
  id?: string;
  ref?: string;
  className?: string;
}

/** Placeholders, `aria-hidden`; mark the loading region with aria-busy. */
export declare function vsSkeleton(props: VsSkeletonProps): SafeHtml;

export interface VsSpinnerProps {
  /** Replaces the `common.loading` message. */
  label?: string;
  /** `data-size`. Default 'md'. */
  size?: 'md' | 'sm' | 'lg';
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<span class="vf-spinner" role="status">`. */
export declare function vsSpinner(props: VsSpinnerProps): SafeHtml;

export interface VsTooltipProps {
  /** Plain text. */
  text: string;
  /** Gets the bubble's id for the trigger's aria-describedby. */
  trigger: ((args: { describedBy: string }) => SafeHtml) | SafeHtml;
  /** `data-placement`. Default 'top'. */
  placement?: 'top' | 'bottom' | 'start' | 'end';
  /** The bubble's id; generated when absent. */
  id?: string;
  ref?: string;
  className?: string;
}

/** A trigger with a CSS-only tooltip (hover and focus). */
export declare function vsTooltip(props: VsTooltipProps): SafeHtml;

export interface VsListViewProps<T = any> {
  /** Strings, or objects with title/label, description, meta. */
  items: T[];
  /** Markup of one item (vf.html). */
  render?: (item: T, index: number) => SafeHtml;
  /** The key of an object item. Default 'id' (else the index). */
  itemKey?: string;
  /** Default 'none'; otherwise a listbox with options (data-action "select", data-value). */
  selectable?: 'none' | 'single' | 'multiple';
  /** The selected key(s). */
  selected?: string | string[];
  /** aria-label of the list. */
  label?: string;
  /** Title of the empty state. */
  emptyText?: VsContent;
  /** Base of the option ids; generated when absent. */
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<ul class="vf-list-view">`, or an empty state when there are no items. */
export declare function vsListView<T = any>(props: VsListViewProps<T>): SafeHtml;

export interface VfListViewProps<T = any> extends VsListViewProps<T> {
  /** value: the key (single) or keys (multiple); items: the selected items. */
  onSelect?: (e: VfUiEvent<{ value: string | string[]; items: T[] }>) => void;
}

/** Click, Space or Enter selects; Up, Down, Home, End move the focus. */
export declare function vfListView<T = any>(props: VfListViewProps<T>): VfValueInstance<string | string[] | null, { setItems(items: T[]): void }>;

export interface VfCarouselProps {
  /** Markup, or an image (src through vf.safeUrl). */
  items: Array<{ content?: VsSlot; src?: string; alt?: string }>;
  /** What the carousel shows (aria-label). */
  label: string;
  /** Default 0. */
  index?: number;
  /** Next after the last goes to the first. Default true. */
  loop?: boolean;
  /** ms between slides; 0 (default) is off. Pauses on hover and focus; not started under reduced motion. */
  autoplay?: number;
  /** Default true. */
  showDots?: boolean;
  onChange?: (e: VfUiEvent<{ index: number }>) => void;
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<section aria-roledescription="carousel">` (WAI-ARIA carousel pattern). */
export declare function vfCarousel(props: VfCarouselProps): VfValueInstance<number, {
  next(): void; prev(): void; goTo(index: number): void; play(): void; pause(): void;
}>;

// ---------------------------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------------------------

export interface VsBreadcrumbProps {
  /** href through vf.safeUrl; the last item is the current page. */
  items: Array<{ label: VsContent; href?: string }>;
  /** The nav's aria-label; replaces the `breadcrumb.label` message. */
  label?: string;
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<nav class="vf-breadcrumb">` with an ordered list. */
export declare function vsBreadcrumb(props: VsBreadcrumbProps): SafeHtml;

export interface VsPaginationProps {
  /** The number of items. */
  total: number;
  /** 1-based. Default 1. */
  page?: number;
  /** Default 10. */
  pageSize?: number;
  /** Pages shown on each side of the current one. Default 1. */
  siblings?: number;
  /** The nav's aria-label; replaces `pagination.label`. */
  label?: string;
  id?: string;
  ref?: string;
  className?: string;
}

/** Page buttons (data-action "page", data-page) in a `<nav class="vf-pagination">`. */
export declare function vsPagination(props: VsPaginationProps): SafeHtml;

export interface VfPaginationProps extends VsPaginationProps {
  onChange?: (e: VfUiEvent<{ page: number }>) => void;
}

export declare function vfPagination(props: VfPaginationProps): VfValueInstance<number, { setTotal(total: number): void }>;

export interface VsTabsProps {
  tabs: Array<{ id: string; label: VsContent; content?: VsSlot; disabled?: boolean }>;
  /** The active tab's id. Default: the first enabled tab. */
  active?: string;
  /** The tablist's aria-label. */
  label?: string;
  /** Base of the tab and panel ids; generated when absent. */
  id?: string;
  ref?: string;
  className?: string;
}

/** Tabs (data-action "tab") and their panels; inactive panels are hidden. */
export declare function vsTabs(props: VsTabsProps): SafeHtml;

export interface VfTabsProps extends VsTabsProps {
  onChange?: (e: VfUiEvent<{ id: string; index: number }>) => void;
}

/** Click, arrow keys (following dir="rtl"), Home and End. */
export declare function vfTabs(props: VfTabsProps): VfValueInstance<string | null, { select(id: string): void }>;

export interface VsAccordionProps {
  items: Array<{ id: string; title: VsContent; content?: VsSlot; open?: boolean; disabled?: boolean }>;
  /** Ids of the open items, in addition to item.open. */
  open?: string[];
  /** 2–6. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Base of the button and panel ids; generated when absent. */
  id?: string;
  ref?: string;
  className?: string;
}

/** Heading buttons (data-action "toggle", aria-expanded) with region panels. */
export declare function vsAccordion(props: VsAccordionProps): SafeHtml;

export interface VfAccordionProps extends VsAccordionProps {
  /** Several items may be open. */
  multiple?: boolean;
  onToggle?: (e: VfUiEvent<{ id: string; open: boolean; openIds: string[] }>) => void;
}

export declare function vfAccordion(props: VfAccordionProps): VfValueInstance<string[], {
  open(id: string): void; close(id: string): void; toggle(id: string): void;
}>;

export interface VsStepperProps {
  steps: Array<VsContent | { label: VsContent; description?: VsContent }>;
  /** The current step's index. Default 0. */
  active?: number;
  /** Steps are buttons (data-action "step", data-index). */
  clickable?: boolean;
  /** The list's aria-label. */
  label?: string;
  id?: string;
  ref?: string;
  className?: string;
}

/** An `<ol class="vf-stepper">`: data-state complete / current / upcoming, aria-current="step". */
export declare function vsStepper(props: VsStepperProps): SafeHtml;

export interface VfStepperProps extends VsStepperProps {
  /** A click on a step (with clickable). */
  onChange?: (e: VfUiEvent<{ index: number }>) => void;
}

export declare function vfStepper(props: VfStepperProps): VfValueInstance<number, {
  next(): void; prev(): void; goTo(index: number): void;
}>;

/** A menu entry of vfDropdown and vfSplitButton. */
export interface VfMenuItem {
  label?: VsContent;
  /** Reported by onSelect (and `data-value` of the item). */
  action?: string;
  /** aria-disabled: focusable, not chosen. */
  disabled?: boolean;
  danger?: boolean;
  /** A line between groups (no label). */
  separator?: boolean;
}

export type VfPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export interface VsSplitButtonProps {
  /** The main button. */
  label: string | SafeHtml;
  /** data-action of the main button. */
  action?: string;
  items: VfMenuItem[];
  variant?: 'secondary' | 'primary' | 'danger' | 'ghost';
  size?: 'md' | 'sm' | 'lg';
  disabled?: boolean;
  /** The menu button's label; replaces `splitButton.more`. */
  menuLabel?: string;
  /** Base of the ids (base-main, base-trigger, base-menu); generated when absent. */
  id?: string;
  ref?: string;
  className?: string;
}

/** A main button and a menu button (data-action "menu") in a `role="group"`, with a hidden menu. */
export declare function vsSplitButton(props: VsSplitButtonProps): SafeHtml;

export interface VfSplitButtonProps extends VsSplitButtonProps {
  /** Default 'bottom-end'. */
  placement?: VfPlacement;
  /** The main button. */
  onClick?: (e: VfUiEvent<{ action: string | undefined }>) => void;
  /** A menu item. */
  onSelect?: (e: VfUiEvent<{ action: string | undefined; item: VfMenuItem }>) => void;
}

export declare function vfSplitButton(props: VfSplitButtonProps): VfuncInstance & { open(): void; close(): void; isOpen(): boolean };

// ---------------------------------------------------------------------------------------------
// Overlay
// ---------------------------------------------------------------------------------------------

/** open / close of the modal layers. */
export interface VfModalMethods {
  /** Adds the overlay to document.body, locks the page scroll and moves the focus in. */
  open(): void;
  /** Takes it out and returns the focus to where it was. */
  close(reason?: string): void;
  isOpen(): boolean;
}

export interface VfModalProps {
  /** Names the dialog (else `label`). */
  title?: VsContent;
  /** aria-label when there is no title. */
  label?: string;
  /** Markup, or a vfunc instance (appended as a child, destroyed with the modal). */
  content?: VsSlot;
  /** Markup such as buttons with data-action (reported by onAction). */
  footer?: VsSlot;
  /** `data-size`. Default 'md'. */
  size?: 'md' | 'sm' | 'lg';
  /** Close button, Escape and backdrop close it. Default true. */
  dismissible?: boolean;
  /** data-ref of the element to focus on open (default: the first control). */
  initialFocus?: string;
  /** Replaces the `modal.close` message. */
  closeLabel?: string;
  onOpen?: (e: VfUiEvent<{}>) => void;
  /** reason: 'close' | 'escape' | 'backdrop' | 'code' or the value given to close(). */
  onClose?: (e: VfUiEvent<{ reason: string }>) => void;
  /** A click on an element with data-action inside the dialog. */
  onAction?: (e: VfUiEvent<{ action: string }>) => void;
  id?: string;
  ref?: string;
  className?: string;
}

/** A `role="dialog"` with `aria-modal` (no native <dialog>, same path in IE11). */
export declare function vfModal(props: VfModalProps): VfuncInstance & VfModalMethods;

export interface VfDrawerProps extends VfModalProps {
  /** `data-side`. Default 'end'. */
  side?: 'end' | 'start' | 'bottom';
}

/** vfModal as a panel at one side of the screen. */
export declare function vfDrawer(props: VfDrawerProps): VfuncInstance & VfModalMethods;

export interface VfConfirmProps {
  title: VsContent;
  message?: VsContent;
  /** Replaces the `confirm.ok` message. */
  confirmLabel?: string;
  /** Replaces the `confirm.cancel` message. */
  cancelLabel?: string;
  /** danger: red confirm button, the focus starts on cancel. Default 'primary'. */
  variant?: 'primary' | 'danger';
  id?: string;
  className?: string;
}

/** A `role="alertdialog"`; Escape, the backdrop and the close button answer false. */
export declare function vfConfirm(props: VfConfirmProps): VfuncInstance & {
  open(): Promise<boolean>;
  close(reason?: string): void;
  isOpen(): boolean;
};

export interface VfToastOptions {
  message: VsContent;
  title?: VsContent;
  /** Default 'info'. danger and warning are role="alert". */
  variant?: 'info' | 'success' | 'warning' | 'danger';
  /** ms; 0 keeps it until dismissed. Default: the region's duration. */
  duration?: number;
  /** A button in the toast; the toast goes after onClick. */
  action?: { label: string; onClick?: (e: VfUiEvent<{ id: string }>) => void };
}

export interface VfToastProps {
  /** `data-position`. Default 'bottom-end'. */
  position?: 'bottom-end' | 'bottom-start' | 'bottom-center' | 'top-end' | 'top-start' | 'top-center';
  /** ms before a toast goes. Default 4000; 0 keeps them. */
  duration?: number;
  /** The oldest goes when more are shown. Default 3. */
  max?: number;
  /** The region's aria-label; replaces `toast.region`. */
  label?: string;
}

/** The notification region (a live region added to document.body at once). Create it once. */
export declare function vfToast(props?: VfToastProps): VfuncInstance & {
  show(options: VfToastOptions): string;
  dismiss(id: string): void;
  clear(): void;
};

export interface VfDropdownProps {
  /** vsButton props of the trigger. */
  trigger: Omit<VsButtonProps, 'id' | 'action' | 'aria'>;
  items: VfMenuItem[];
  /** Default 'bottom-start'. */
  placement?: VfPlacement;
  /** aria-label of the menu (default: named by the trigger). */
  label?: string;
  onSelect?: (e: VfUiEvent<{ action: string | undefined; item: VfMenuItem }>) => void;
  id?: string;
  ref?: string;
  className?: string;
}

/** A menu button (WAI-ARIA): arrows, Home, End, first letters, Escape, Tab. */
export declare function vfDropdown(props: VfDropdownProps): VfuncInstance & { open(): void; close(): void; isOpen(): boolean };

export interface VfPopoverProps {
  /** vsButton props of the trigger. */
  trigger: Omit<VsButtonProps, 'id' | 'action' | 'aria'>;
  content: VsSlot;
  /** Names the panel. */
  title?: VsContent;
  /** Names the panel when there is no title. */
  label?: string;
  /** Default 'bottom-start'. */
  placement?: VfPlacement;
  onOpen?: (e: VfUiEvent<{}>) => void;
  /** reason: 'close' | 'escape' | 'outside' | 'blur' | 'toggle' | 'code'. */
  onClose?: (e: VfUiEvent<{ reason: string }>) => void;
  id?: string;
  ref?: string;
  className?: string;
}

/** A non-modal `role="dialog"` next to its trigger. */
export declare function vfPopover(props: VfPopoverProps): VfuncInstance & { open(): void; close(): void; isOpen(): boolean };

// ---------------------------------------------------------------------------------------------
// Data (core file; vfGrid and the charts are in vfunc-ui-data, D-031)
// ---------------------------------------------------------------------------------------------

export interface VsTableColumn<T = any> {
  key: string;
  label: VsContent;
  /** `data-align`. */
  align?: 'start' | 'center' | 'end';
  /** The header is a button with data-action "sort" and data-value = key; aria-sort shows the state. */
  sortable?: boolean;
  /** Markup or text of a cell; default row[key]. */
  render?: (row: T, index: number) => VsSlot;
}

export interface VsTableProps<T = any> {
  columns: Array<VsTableColumn<T>>;
  /** The rows to show. */
  data: T[];
  sort?: { key: string; dir: 'asc' | 'desc' } | null;
  /** `data-value` of each row: row[rowKey], else its index. Default 'id'. */
  rowKey?: string;
  /** Keys of rows marked `data-state="selected"`. */
  selected?: string[];
  /** `data-action` on each row, for a delegate on row clicks. */
  rowAction?: string;
  /** The table's caption (its accessible name). */
  caption?: VsContent;
  /** Title of the empty state. */
  emptyText?: VsContent;
  /** `aria-busy`; without rows, a loading row. */
  loading?: boolean;
  /** Added to the row index given to render (paged data). */
  indexBase?: number;
  /** The table's id. */
  id?: string;
  ref?: string;
  className?: string;
}

/** A `<table>` in a `<div class="vf-table">` (horizontal scroll). */
export declare function vsTable<T = any>(props: VsTableProps<T>): SafeHtml;

export interface VsSparklineProps {
  data: number[];
  /** `data-type`. Default 'line'. */
  type?: 'line' | 'bar';
  /** The text alternative; replaces the `sparkline.summary` message. */
  label?: string;
  /** For the numbers in the summary. */
  format?: Intl.NumberFormatOptions;
  id?: string;
  ref?: string;
  className?: string;
}

/** A small `<svg role="img" class="vf-sparkline">`; color is currentColor, size from CSS. */
export declare function vsSparkline(props: VsSparklineProps): SafeHtml;

// ---------------------------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------------------------

/** What vsField passes to `control`. */
export interface VsFieldControlArgs {
  id: string;
  describedBy: string | null;
  invalid: boolean;
  required: boolean;
}

export interface VsFieldProps extends VsFieldTextProps {
  /** The control's id; generated when absent. */
  id?: string;
  describedBy?: string;
  /** On the `.vf-field` wrapper. */
  className?: string;
  /** Builds the control with the given id and aria values. */
  control: (args: VsFieldControlArgs) => SafeHtml;
}

/** Label, hint and error around a control you build yourself. */
export declare function vsField(props: VsFieldProps): SafeHtml;

export interface VsInputProps extends VsControlProps {
  /** Default 'text'. */
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'search' | 'password' | 'date' | 'time' | 'datetime-local' | 'month' | 'week';
  value?: string | number;
  placeholder?: string;
  autocomplete?: string;
  inputmode?: string;
  pattern?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  minlength?: number;
  maxlength?: number;
  /** `data-size`. Default 'md'. */
  size?: 'md' | 'sm' | 'lg';
}

/** An `<input class="vf-input">`, in a `.vf-field` when label, hint or error is given. */
export declare function vsInput(props: VsInputProps): SafeHtml;

export interface VsTextareaProps extends VsControlProps {
  /** Escaped text. */
  value?: string;
  /** Default 3. */
  rows?: number;
  placeholder?: string;
  minlength?: number;
  maxlength?: number;
  size?: 'md' | 'sm' | 'lg';
}

/** A `<textarea class="vf-textarea">`. */
export declare function vsTextarea(props: VsTextareaProps): SafeHtml;

export interface VsSelectProps extends VsControlProps {
  /** `{ label, options }` makes an `<optgroup>`. */
  options: Array<VsOption | { label: string; options: VsOption[]; disabled?: boolean }>;
  /** The selected value; an array with `multiple`. */
  value?: string | number | Array<string | number>;
  /** An empty first option. */
  placeholder?: string;
  multiple?: boolean;
  size?: 'md' | 'sm' | 'lg';
}

/** A `<select class="vf-select">`. */
export declare function vsSelect(props: VsSelectProps): SafeHtml;

export interface VsCheckboxProps extends VsControlProps {
  label: VsContent;
  checked?: boolean;
  /** The submitted value (the browser's default is "on"). */
  value?: string;
}

/** A native checkbox inside its `<label class="vf-check">`. */
export declare function vsCheckbox(props: VsCheckboxProps): SafeHtml;

export interface VsRadioGroupProps extends VsControlProps {
  options: VsOption[];
  value?: string | number;
  /** `data-direction`. Default 'vertical'. */
  direction?: 'vertical' | 'horizontal';
}

/** Radio buttons in a `<fieldset class="vf-radio-group">`; `label` is the legend, `id` the fieldset's. */
export declare function vsRadioGroup(props: VsRadioGroupProps): SafeHtml;

/** An on/off switch: a native checkbox with `role="switch"`. */
export declare function vsSwitch(props: VsCheckboxProps): SafeHtml;

export interface VsSliderProps extends VsControlProps {
  value?: number;
  /** Default 0. */
  min?: number;
  /** Default 100. */
  max?: number;
  /** Default 1. */
  step?: number;
}

/** A native range `<input class="vf-slider">`. */
export declare function vsSlider(props: VsSliderProps): SafeHtml;

export interface VsProgressProps extends VsCommonProps {
  /** Absent or null: indeterminate. */
  value?: number | null;
  /** Default 100. */
  max?: number;
  label?: VsContent;
  hint?: VsContent;
  /** The percentage as text next to the bar. */
  showValue?: boolean;
}

/** A native `<progress class="vf-progress">`. */
export declare function vsProgress(props: VsProgressProps): SafeHtml;

export interface VsNumberInputProps extends VsControlProps {
  value?: number | null;
  min?: number;
  max?: number;
  /** Default 1. Values are rounded to its decimals. */
  step?: number;
  placeholder?: string;
  size?: 'md' | 'sm' | 'lg';
  /** Replace the `numberInput.decrement` / `numberInput.increment` messages. */
  decrementLabel?: string;
  incrementLabel?: string;
}

/** An `<input type="number">` between buttons with data-action "decrement" / "increment". */
export declare function vsNumberInput(props: VsNumberInputProps): SafeHtml;

export interface VfNumberInputProps extends VsNumberInputProps {
  onChange?: (e: VfUiEvent<{ value: number | null }>) => void;
}

/** Steps with the buttons, clamps and rounds on commit. */
export declare function vfNumberInput(props: VfNumberInputProps): VfValueInstance<number | null>;

export interface VsSearchInputProps extends VsControlProps {
  value?: string;
  /** Replaces the `searchInput.placeholder` message. */
  placeholder?: string;
  /** The accessible name without a visible label; replaces `searchInput.label`. */
  ariaLabel?: string;
  /** Replaces the `searchInput.clear` message. */
  clearLabel?: string;
  size?: 'md' | 'sm' | 'lg';
}

/** An `<input type="search">` with a clear button (data-action "clear"). */
export declare function vsSearchInput(props: VsSearchInputProps): SafeHtml;

export interface VfSearchInputProps extends VsSearchInputProps {
  /** ms after typing stops. Default 300; 0 searches on every input. */
  debounce?: number;
  /** After the debounce (not while an IME is composing), on Enter, and with '' after clear or Escape. */
  onSearch?: (e: VfUiEvent<{ value: string }>) => void;
  onClear?: (e: VfUiEvent<{}>) => void;
}

export declare function vfSearchInput(props: VfSearchInputProps): VfValueInstance<string, { clear(): void; focus(): void }>;

export interface VsPasswordInputProps extends VsControlProps {
  value?: string;
  /** Shows the text. */
  visible?: boolean;
  /** Default 'current-password'; use 'new-password' on sign-up forms. */
  autocomplete?: string;
  placeholder?: string;
  minlength?: number;
  maxlength?: number;
  size?: 'md' | 'sm' | 'lg';
  /** Replace the `passwordInput.show` / `passwordInput.hide` messages. */
  showLabel?: string;
  hideLabel?: string;
}

/** A password input with a toggle button (data-action "toggle-visibility", aria-pressed). */
export declare function vsPasswordInput(props: VsPasswordInputProps): SafeHtml;

export interface VfPasswordInputProps extends VsPasswordInputProps {
  /** On the native change (commit). */
  onChange?: (e: VfUiEvent<{ value: string }>) => void;
  onToggle?: (e: VfUiEvent<{ visible: boolean }>) => void;
}

export declare function vfPasswordInput(props: VfPasswordInputProps): VfValueInstance<string, { toggle(visible?: boolean): void }>;

export interface VsChipsInputProps extends VsControlProps {
  value?: string[];
  placeholder?: string;
  /** No more input once reached. */
  max?: number;
}

/** vsTag chips (data-action "remove") and a text input; one hidden input per chip when `name` is set. */
export declare function vsChipsInput(props: VsChipsInputProps): SafeHtml;

export interface VfChipsInputProps extends VsChipsInputProps {
  onChange?: (e: VfUiEvent<{ value: string[] }>) => void;
}

/** Enter or comma adds, Backspace in the empty input removes the last chip. */
export declare function vfChipsInput(props: VfChipsInputProps): VfValueInstance<string[], { add(text: string): boolean; remove(text: string): void }>;

export interface VsRatingProps extends VsCommonProps {
  /** Default 0. */
  value?: number;
  /** 1–10. Default 5. */
  max?: number;
  readonly?: boolean;
  /** The legend; replaces the `rating.label` message. */
  label?: VsContent;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  hint?: VsContent;
  error?: VsContent;
}

/** Stars on radios (data-action "rate") in a fieldset; readonly: `role="img"` with "{value} of {max}". */
export declare function vsRating(props: VsRatingProps): SafeHtml;

export interface VfRatingProps extends VsRatingProps {
  onChange?: (e: VfUiEvent<{ value: number }>) => void;
}

export declare function vfRating(props: VfRatingProps): VfValueInstance<number>;

export interface VsSelectButtonProps extends VsCommonProps {
  options: VsOption[];
  /** An array with `multiple`. */
  value?: string | number | Array<string | number>;
  multiple?: boolean;
  /** A visible label that names the group. */
  label?: VsContent;
  /** Names the group without a visible label. */
  ariaLabel?: string;
  /** Hidden inputs for the chosen values. */
  name?: string;
  disabled?: boolean;
  hint?: VsContent;
  error?: VsContent;
  size?: 'md' | 'sm' | 'lg';
}

/** Toggle buttons (data-action "select", data-value, aria-pressed) in a `role="group"`. */
export declare function vsSelectButton(props: VsSelectButtonProps): SafeHtml;

export interface VfSelectButtonProps extends VsSelectButtonProps {
  onChange?: (e: VfUiEvent<{ value: string | string[] }>) => void;
}

export declare function vfSelectButton(props: VfSelectButtonProps): VfValueInstance<string | number | Array<string | number>>;

export interface VsMaskedInputProps extends VsControlProps {
  /** 0 = digit, a = letter, * = letter or digit; anything else is shown as is. e.g. '000-0000-0000'. */
  mask: string;
  value?: string;
  placeholder?: string;
  autocomplete?: string;
  size?: 'md' | 'sm' | 'lg';
}

/** A text `<input class="vf-input" data-mask>` with the value formatted by the mask. */
export declare function vsMaskedInput(props: VsMaskedInputProps): SafeHtml;

export interface VfMaskedInputProps extends VsMaskedInputProps {
  /** Every change of the text. */
  onInput?: (e: VfUiEvent<{ value: string; raw: string }>) => void;
  /** The native change (commit). */
  onChange?: (e: VfUiEvent<{ value: string; raw: string }>) => void;
}

export declare function vfMaskedInput(props: VfMaskedInputProps): VfValueInstance<string, { getRawValue(): string }>;

export interface VsDatePickerProps extends VsControlProps {
  /** 'YYYY-MM-DD' or a Date. */
  value?: string | Date;
  min?: string | Date;
  max?: string | Date;
  /** Only where the browser has no date input (IE11); replaces `datePicker.placeholder`. */
  placeholder?: string;
  size?: 'md' | 'sm' | 'lg';
}

/** A native `<input type="date" class="vf-input">`. */
export declare function vsDatePicker(props: VsDatePickerProps): SafeHtml;

export interface VfDatePickerProps extends VsDatePickerProps {
  onChange?: (e: VfUiEvent<{ value: string; date: Date | null }>) => void;
}

/** Normalizes typed dates where the input is text; `aria-invalid` for text that is not a date. */
export declare function vfDatePicker(props: VfDatePickerProps): VfValueInstance<string, { getDate(): Date | null }>;

export interface VsTimePickerProps extends VsControlProps {
  /** 'HH:mm' or a Date. */
  value?: string | Date;
  min?: string;
  max?: string;
  /** Seconds, e.g. 900 for 15 minutes. */
  step?: number;
  /** Only where the browser has no time input (IE11); replaces `timePicker.placeholder`. */
  placeholder?: string;
  size?: 'md' | 'sm' | 'lg';
}

/** A native `<input type="time" class="vf-input">`. */
export declare function vsTimePicker(props: VsTimePickerProps): SafeHtml;

export interface VfTimePickerProps extends VsTimePickerProps {
  onChange?: (e: VfUiEvent<{ value: string }>) => void;
}

export declare function vfTimePicker(props: VfTimePickerProps): VfValueInstance<string>;

export interface VfDateRangePickerProps extends VsCommonProps {
  start?: string | Date;
  end?: string | Date;
  min?: string | Date;
  max?: string | Date;
  /** Form names of the two inputs, e.g. ['from', 'to']. */
  names?: [string, string];
  /** The legend. */
  label?: VsContent;
  /** Replace the `dateRangePicker.start` / `dateRangePicker.end` messages. */
  startLabel?: string;
  endLabel?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  hint?: VsContent;
  error?: VsContent;
  onChange?: (e: VfUiEvent<{ start: string; end: string; startDate: Date | null; endDate: Date | null }>) => void;
}

/** Two native date inputs (data-action "start" / "end") in a fieldset; the end never precedes the start. */
export declare function vfDateRangePicker(props: VfDateRangePickerProps): VfValueInstance<{ start: string; end: string }>;

// ---------------------------------------------------------------------------------------------

/** Every layer 2 member; importing the module also adds them to `vf`. */
declare const ui: {
  readonly vsButton: typeof vsButton;
  readonly vsField: typeof vsField;
  readonly vsInput: typeof vsInput;
  readonly vsTextarea: typeof vsTextarea;
  readonly vsSelect: typeof vsSelect;
  readonly vsCheckbox: typeof vsCheckbox;
  readonly vsRadioGroup: typeof vsRadioGroup;
  readonly vsSwitch: typeof vsSwitch;
  readonly vsSlider: typeof vsSlider;
  readonly vsProgress: typeof vsProgress;
  readonly vsButtonGroup: typeof vsButtonGroup;
  readonly vsBadge: typeof vsBadge;
  readonly vsTag: typeof vsTag;
  readonly vsAvatar: typeof vsAvatar;
  readonly vsAlert: typeof vsAlert;
  readonly vsCard: typeof vsCard;
  readonly vsDescriptions: typeof vsDescriptions;
  readonly vsStatCard: typeof vsStatCard;
  readonly vsTimeline: typeof vsTimeline;
  readonly vsEmptyState: typeof vsEmptyState;
  readonly vsSkeleton: typeof vsSkeleton;
  readonly vsSpinner: typeof vsSpinner;
  readonly vsTooltip: typeof vsTooltip;
  readonly vsNumberInput: typeof vsNumberInput;
  readonly vfNumberInput: typeof vfNumberInput;
  readonly vsSearchInput: typeof vsSearchInput;
  readonly vfSearchInput: typeof vfSearchInput;
  readonly vsPasswordInput: typeof vsPasswordInput;
  readonly vfPasswordInput: typeof vfPasswordInput;
  readonly vsChipsInput: typeof vsChipsInput;
  readonly vfChipsInput: typeof vfChipsInput;
  readonly vsRating: typeof vsRating;
  readonly vfRating: typeof vfRating;
  readonly vsSelectButton: typeof vsSelectButton;
  readonly vfSelectButton: typeof vfSelectButton;
  readonly vsMaskedInput: typeof vsMaskedInput;
  readonly vfMaskedInput: typeof vfMaskedInput;
  readonly vsDatePicker: typeof vsDatePicker;
  readonly vfDatePicker: typeof vfDatePicker;
  readonly vsTimePicker: typeof vsTimePicker;
  readonly vfTimePicker: typeof vfTimePicker;
  readonly vfDateRangePicker: typeof vfDateRangePicker;
  readonly vsListView: typeof vsListView;
  readonly vfListView: typeof vfListView;
  readonly vfCarousel: typeof vfCarousel;
  readonly vsBreadcrumb: typeof vsBreadcrumb;
  readonly vsPagination: typeof vsPagination;
  readonly vfPagination: typeof vfPagination;
  readonly vsTabs: typeof vsTabs;
  readonly vfTabs: typeof vfTabs;
  readonly vsAccordion: typeof vsAccordion;
  readonly vfAccordion: typeof vfAccordion;
  readonly vsStepper: typeof vsStepper;
  readonly vfStepper: typeof vfStepper;
  readonly vfModal: typeof vfModal;
  readonly vfDrawer: typeof vfDrawer;
  readonly vfConfirm: typeof vfConfirm;
  readonly vfToast: typeof vfToast;
  readonly vfDropdown: typeof vfDropdown;
  readonly vfPopover: typeof vfPopover;
  readonly vsSplitButton: typeof vsSplitButton;
  readonly vfSplitButton: typeof vfSplitButton;
  readonly vsTable: typeof vsTable;
  readonly vsSparkline: typeof vsSparkline;
};
export default ui;

declare module '../../layer1/types/vfunc' {
  interface Vf {
    readonly vsButton: typeof vsButton;
    readonly vsField: typeof vsField;
    readonly vsInput: typeof vsInput;
    readonly vsTextarea: typeof vsTextarea;
    readonly vsSelect: typeof vsSelect;
    readonly vsCheckbox: typeof vsCheckbox;
    readonly vsRadioGroup: typeof vsRadioGroup;
    readonly vsSwitch: typeof vsSwitch;
    readonly vsSlider: typeof vsSlider;
    readonly vsProgress: typeof vsProgress;
    readonly vsButtonGroup: typeof vsButtonGroup;
    readonly vsBadge: typeof vsBadge;
    readonly vsTag: typeof vsTag;
    readonly vsAvatar: typeof vsAvatar;
    readonly vsAlert: typeof vsAlert;
    readonly vsCard: typeof vsCard;
    readonly vsDescriptions: typeof vsDescriptions;
    readonly vsStatCard: typeof vsStatCard;
    readonly vsTimeline: typeof vsTimeline;
    readonly vsEmptyState: typeof vsEmptyState;
    readonly vsSkeleton: typeof vsSkeleton;
    readonly vsSpinner: typeof vsSpinner;
    readonly vsTooltip: typeof vsTooltip;
    readonly vsNumberInput: typeof vsNumberInput;
    readonly vfNumberInput: typeof vfNumberInput;
    readonly vsSearchInput: typeof vsSearchInput;
    readonly vfSearchInput: typeof vfSearchInput;
    readonly vsPasswordInput: typeof vsPasswordInput;
    readonly vfPasswordInput: typeof vfPasswordInput;
    readonly vsChipsInput: typeof vsChipsInput;
    readonly vfChipsInput: typeof vfChipsInput;
    readonly vsRating: typeof vsRating;
    readonly vfRating: typeof vfRating;
    readonly vsSelectButton: typeof vsSelectButton;
    readonly vfSelectButton: typeof vfSelectButton;
    readonly vsMaskedInput: typeof vsMaskedInput;
    readonly vfMaskedInput: typeof vfMaskedInput;
    readonly vsDatePicker: typeof vsDatePicker;
    readonly vfDatePicker: typeof vfDatePicker;
    readonly vsTimePicker: typeof vsTimePicker;
    readonly vfTimePicker: typeof vfTimePicker;
    readonly vfDateRangePicker: typeof vfDateRangePicker;
    readonly vsListView: typeof vsListView;
    readonly vfListView: typeof vfListView;
    readonly vfCarousel: typeof vfCarousel;
    readonly vsBreadcrumb: typeof vsBreadcrumb;
    readonly vsPagination: typeof vsPagination;
    readonly vfPagination: typeof vfPagination;
    readonly vsTabs: typeof vsTabs;
    readonly vfTabs: typeof vfTabs;
    readonly vsAccordion: typeof vsAccordion;
    readonly vfAccordion: typeof vfAccordion;
    readonly vsStepper: typeof vsStepper;
    readonly vfStepper: typeof vfStepper;
    readonly vfModal: typeof vfModal;
    readonly vfDrawer: typeof vfDrawer;
    readonly vfConfirm: typeof vfConfirm;
    readonly vfToast: typeof vfToast;
    readonly vfDropdown: typeof vfDropdown;
    readonly vfPopover: typeof vfPopover;
    readonly vsSplitButton: typeof vsSplitButton;
    readonly vfSplitButton: typeof vfSplitButton;
    readonly vsTable: typeof vsTable;
    readonly vsSparkline: typeof vsSparkline;
  }
}
