// SPDX-License-Identifier: Apache-2.0
//
// The layer 2 component gallery (draft, Phase 1). Static vs* markup is drawn with vf.attach; the
// vf* instances are mounted into their placeholders. Every callback writes to the log, which the
// browser test reads (layer2/test/e2e/gallery.e2e.js).
/* global vf, vfShortcut */

(function () {
  'use strict';

  var html = vf.html;
  var instances = [];

  function log(text) {
    vf.$('#log').textContent = text;
  }

  function mount(id, instance) {
    instances.push(instance);
    instance.mount('#' + id);
    return instance;
  }

  // --- static markup (vs*) ---------------------------------------------------------------------

  var form = vf.attach('#form-static', {
    render: function () {
      return html`
        ${vf.vsInput({ name: 'email', type: 'email', label: 'Email', hint: 'We never share it.', required: true, id: 'email' })}
        ${vf.vsInput({ name: 'nick', label: 'Nickname', error: 'Already taken', value: 'ada', id: 'nick' })}
        ${vf.vsSelect({ name: 'role', label: 'Role', id: 'role', value: 'user', placeholder: 'Choose…',
          options: ['admin', 'user', { value: 'guest', label: 'Guest', disabled: true }, { label: 'Other', options: ['auditor'] }] })}
        ${vf.vsTextarea({ name: 'memo', label: 'Memo', rows: 3, value: '<b>not bold</b>' })}
        ${vf.vsRadioGroup({ name: 'plan', label: 'Plan', options: ['free', 'pro', 'team'], value: 'pro', direction: 'horizontal' })}
        <div class="gallery__row">
          ${vf.vsCheckbox({ name: 'agree', label: 'I agree', checked: true })}
          ${vf.vsSwitch({ name: 'notify', label: 'Notifications', checked: true, id: 'notify' })}
        </div>
        ${vf.vsSlider({ name: 'volume', label: 'Volume', value: 30 })}
        ${vf.vsProgress({ label: 'Upload', value: 42, showValue: true })}
        ${vf.vsField({ label: 'Color', hint: 'vsField around your own control', control: function (a) {
          return html`<input type="color" id="${a.id}" aria-describedby="${a.describedBy || ''}" value="#3366ff">`;
        } })}`;
    }
  });

  var display = vf.attach('#display-static', {
    render: function () {
      return html`
        <div class="gallery__row">
          ${vf.vsButton({ label: 'Primary', variant: 'primary' })}
          ${vf.vsButton({ label: 'Saving', loading: true })}
          ${vf.vsButtonGroup({ label: 'View', attached: true, buttons: [{ label: 'List' }, { label: 'Grid' }] })}
          ${vf.vsTooltip({ text: 'Copies the link', trigger: function (a) { return vf.vsButton({ label: 'Copy', describedBy: a.describedBy }); } })}
          ${vf.vsSpinner({ size: 'sm' })}
        </div>
        <div class="gallery__row">
          ${vf.vsBadge({ label: 'Active', variant: 'success', dot: true })}
          ${vf.vsBadge({ label: 3, variant: 'danger' })}
          ${vf.vsTag({ label: 'urgent', value: 'urgent', removable: true, variant: 'warning' })}
          ${vf.vsAvatar({ name: 'Ada Lovelace' })}
          ${vf.vsAvatar({ name: '홍길동', size: 'lg' })}
        </div>
        ${vf.vsAlert({ variant: 'warning', title: 'Check', message: 'You have unsaved changes.', dismissible: true })}
        <div class="gallery__grid">
          ${vf.vsStatCard({ label: 'Revenue', value: 1250000, format: { style: 'currency', currency: 'KRW' }, delta: 0.125, deltaLabel: 'vs last month' })}
          ${vf.vsStatCard({ label: 'Churn', value: 0.031, format: { style: 'percent', maximumFractionDigits: 1 }, delta: -0.02 })}
          ${vf.vsCard({ title: 'Card', subtitle: 'vsCard', body: html`<p>Body text.</p>`, footer: vf.vsButton({ label: 'More' }) })}
        </div>
        ${vf.vsDescriptions({ title: 'Account', columns: 2, items: [{ label: 'Name', value: 'Ada' }, { label: 'Email', value: 'ada@example.test' }] })}
        ${vf.vsTimeline({ items: [{ title: 'Order placed', time: new Date(2026, 8, 1, 9, 30), variant: 'success' }, { title: 'Shipped', time: new Date(2026, 8, 2) }] })}
        ${vf.vsSkeleton({ lines: 3 })}
        ${vf.vsEmptyState({ description: 'Try another keyword.', action: vf.vsButton({ label: 'Reset' }) })}`;
    }
  });

  // --- instances (vf*) -------------------------------------------------------------------------

  mount('number', vf.vfNumberInput({ label: 'Quantity', id: 'qty', value: 1, min: 1, max: 5,
    onChange: function (e) { log('number ' + e.data.value); } }));
  var search = mount('search', vf.vfSearchInput({ label: 'Search', id: 'q', debounce: 200,
    onSearch: function (e) { log('search ' + e.data.value); } }));
  mount('password', vf.vfPasswordInput({ label: 'Password', id: 'pw', autocomplete: 'new-password',
    onToggle: function (e) { log('password visible ' + e.data.visible); } }));
  mount('chips', vf.vfChipsInput({ label: 'Tags', id: 'tags', name: 'tags', value: ['ui'], max: 5,
    onChange: function (e) { log('chips ' + e.data.value.join(',')); } }));
  mount('masked', vf.vfMaskedInput({ label: 'Phone', id: 'phone', mask: '000-0000-0000',
    onInput: function (e) { log('masked ' + e.data.raw); } }));
  mount('date', vf.vfDatePicker({ label: 'Due date', id: 'due',
    onChange: function (e) { log('date ' + e.data.value); } }));
  mount('time', vf.vfTimePicker({ label: 'Time', id: 'at', step: 900 }));
  mount('range', vf.vfDateRangePicker({ label: 'Period', id: 'period', names: ['from', 'to'],
    onChange: function (e) { log('range ' + e.data.start + '..' + e.data.end); } }));
  mount('rating', vf.vfRating({ id: 'score', value: 3,
    onChange: function (e) { log('rating ' + e.data.value); } }));
  mount('select-button', vf.vfSelectButton({ label: 'Period', id: 'period-button', options: ['day', 'week', 'month'], value: 'week',
    onChange: function (e) { log('select ' + e.data.value); } }));

  mount('list', vf.vfListView({ label: 'Users', id: 'users', selectable: 'single',
    items: [{ id: 'a', title: 'Ada', description: 'Admin' }, { id: 'b', title: 'Grace', description: 'User' }, { id: 'c', title: 'Linus', description: 'Guest' }],
    onSelect: function (e) { log('list ' + e.data.value); } }));
  mount('carousel', vf.vfCarousel({ label: 'News', id: 'news',
    items: [{ content: html`<p class="gallery__lead">Slide one</p>` }, { content: html`<p class="gallery__lead">Slide two</p>` }, { content: html`<p class="gallery__lead">Slide three</p>` }],
    onChange: function (e) { log('carousel ' + e.data.index); } }));

  mount('breadcrumb', vf.vfunc({ render: function () {
    return vf.vsBreadcrumb({ items: [{ label: 'Home', href: '#/' }, { label: 'Components', href: '#/components' }, { label: 'Gallery' }] });
  } }));
  mount('tabs', vf.vfTabs({ label: 'Settings', id: 'settings',
    tabs: [{ id: 'profile', label: 'Profile', content: html`<p>Profile panel</p>` },
      { id: 'security', label: 'Security', content: html`<p>Security panel</p>` },
      { id: 'billing', label: 'Billing', content: html`<p>Billing panel</p>`, disabled: true },
      { id: 'about', label: 'About', content: html`<p>About panel</p>` }],
    onChange: function (e) { log('tab ' + e.data.id); } }));
  mount('accordion', vf.vfAccordion({ id: 'faq',
    items: [{ id: 'what', title: 'What is vfunc-ui?', content: html`<p>Layer 2 of vfunc.js.</p>`, open: true },
      { id: 'ie', title: 'Does it work in IE11?', content: html`<p>Yes, with the legacy files.</p>` }],
    onToggle: function (e) { log('accordion ' + e.data.id + ' ' + e.data.open); } }));
  mount('stepper', vf.vfStepper({ steps: ['Cart', 'Shipping', 'Payment'], active: 1, clickable: true, label: 'Checkout',
    onChange: function (e) { log('step ' + e.data.index); } }));
  mount('pagination', vf.vfPagination({ id: 'pages', total: 230, pageSize: 20,
    onChange: function (e) { log('page ' + e.data.page); } }));

  mount('split', vf.vfSplitButton({ id: 'save', label: 'Save', variant: 'primary', action: 'save',
    items: [{ label: 'Save as draft', action: 'draft' }, { label: 'Save and close', action: 'close' }],
    onClick: function (e) { log('split click ' + e.data.action); },
    onSelect: function (e) { log('split select ' + e.data.action); } }));

  // --- overlays ----------------------------------------------------------------------------------

  var toast = vf.vfToast({ duration: 5000 });
  var modal = vf.vfModal({ id: 'edit', title: 'Edit profile',
    content: html`${vf.vsInput({ name: 'first', label: 'First name', ref: 'first', id: 'first' })}${vf.vsInput({ name: 'last', label: 'Last name', id: 'last' })}`,
    footer: html`${vf.vsButton({ label: 'Cancel', action: 'cancel' })}${vf.vsButton({ label: 'Save', action: 'save', variant: 'primary', id: 'modal-save' })}`,
    onAction: function (e) {
      if (e.data.action === 'save') toast.show({ message: 'Profile saved', variant: 'success' });
      e.sender.close(e.data.action);
    },
    onClose: function (e) { log('modal ' + e.data.reason); } });
  var drawer = vf.vfDrawer({ id: 'filters', title: 'Filters', side: 'end',
    content: vf.vsRadioGroup({ name: 'status', label: 'Status', options: ['all', 'open', 'closed'], value: 'all' }),
    onClose: function (e) { log('drawer ' + e.data.reason); } });
  instances.push(toast, modal, drawer); // messages follow the language too

  vf.attach('#overlay-buttons', {
    render: function () {
      return html`
        ${vf.vsButton({ label: 'Open modal', action: 'open-modal', id: 'open-modal' })}
        ${vf.vsButton({ label: 'Open drawer', action: 'open-drawer', id: 'open-drawer' })}
        ${vf.vsButton({ label: 'Delete…', action: 'confirm', variant: 'danger', id: 'open-confirm' })}
        ${vf.vsButton({ label: 'Show toast', action: 'toast', id: 'show-toast' })}`;
    },
    delegates: [
      { selector: '[data-action="open-modal"]', eventType: 'click', onEvent: function () { modal.open(); } },
      { selector: '[data-action="open-drawer"]', eventType: 'click', onEvent: function () { drawer.open(); } },
      { selector: '[data-action="toast"]', eventType: 'click', onEvent: function () { toast.show({ title: 'Hello', message: 'A toast', action: { label: 'Undo', onClick: function () { log('toast undo'); } } }); } },
      {
        selector: '[data-action="confirm"]',
        eventType: 'click',
        onEvent: function () {
          vf.vfConfirm({ title: 'Delete 3 items?', message: 'This cannot be undone.', variant: 'danger', confirmLabel: 'Delete' })
            .open().then(function (ok) { log('confirm ' + ok); });
        }
      }
    ]
  });

  mount('dropdown', vf.vfDropdown({ id: 'actions', trigger: { label: 'Actions' },
    items: [{ label: 'Rename', action: 'rename' }, { label: 'Duplicate', action: 'duplicate' }, { separator: true },
      { label: 'Archive', action: 'archive', disabled: true }, { label: 'Delete', action: 'delete', danger: true }],
    onSelect: function (e) { log('menu ' + e.data.action); } }));
  mount('popover', vf.vfPopover({ id: 'help', trigger: { label: 'Help' }, title: 'Shortcuts',
    content: html`<p>Press / to search.</p><a href="#h-input">Go to inputs</a>`,
    onClose: function (e) { log('popover ' + e.data.reason); } }));

  // --- language and shortcut -------------------------------------------------------------------

  vf.vfSelectButton({ ariaLabel: 'Language', id: 'lang-switch', options: [{ value: 'en', label: 'English' }, { value: 'ko', label: '한국어' }], value: 'en',
    onChange: function (e) { vf.i18n.set(e.data.value); } }).mount('#lang');

  vf.i18n.setup({ locale: 'en', locales: ['en', 'ko'] });
  vf.i18n.subscribe(function () {
    form.refresh();
    display.refresh();
    for (var i = 0; i < instances.length; i++) instances[i].refresh();
  });

  var keys = vf.use(vfShortcut);
  keys.add('/', function () { search.focus(); }, { label: 'Search' });
}());
