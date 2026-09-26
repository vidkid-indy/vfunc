// SPDX-License-Identifier: Apache-2.0
//
// Landing sections: the page is HTML; vf.attach islands fill the slots with vs* markup (cards,
// figures, buttons) and mount the few vf* pieces that have behavior (carousel, accordion, toast).
// The log line is read by the browser test (layer2/test/e2e/examples.e2e.js).
/* global vf */

(function () {
  'use strict';

  const html = vf.html;
  const log = (text) => { vf.$('#log').textContent = text; };
  const toast = vf.vfToast({ position: 'bottom-center' });

  // Buttons that scroll to a section: plain delegation on data-action.
  vf.attach('#cta', {
    render: () => html`
      ${vf.vsButton({ label: 'See pricing', variant: 'primary', size: 'lg', action: 'go', aria: { controls: 'pricing' } })}
      ${vf.vsButton({ label: 'Read the questions', variant: 'ghost', size: 'lg', action: 'go', aria: { controls: 'faq-section' } })}`,
    delegates: [{
      selector: '[data-action="go"]',
      eventType: 'click',
      onEvent: (e) => {
        const target = document.getElementById(e.target.getAttribute('aria-controls'));
        target.scrollIntoView({ behavior: 'smooth' });
        target.focus({ preventScroll: true });
        log('go ' + target.id);
      }
    }]
  });

  const FEATURES = [
    { title: 'Linked by default', body: 'Mention a note and both sides link to each other.', badge: 'New' },
    { title: 'Search in a second', body: 'Every word, every attachment, across the whole team.' },
    { title: 'Works offline', body: 'Keep writing on the train; it syncs when you are back.' }
  ];
  vf.attach('#features', {
    render: () => html`${FEATURES.map((f) => vf.vsCard({
      title: f.title,
      headingLevel: 3,
      actions: f.badge ? vf.vsBadge({ label: f.badge, variant: 'primary' }) : '',
      body: f.body
    }))}`
  });

  vf.attach('#numbers', {
    render: () => html`
      ${vf.vsStatCard({ label: 'Teams', value: 12400 })}
      ${vf.vsStatCard({ label: 'Notes written', value: 38000000, format: { notation: 'compact' } })}
      ${vf.vsStatCard({ label: 'Uptime', value: 0.9995, format: { style: 'percent', maximumFractionDigits: 2 } })}`
  });

  const QUOTES = [
    ['We stopped asking "where was that doc?"', 'Mina, product lead'],
    ['Onboarding went from two weeks to three days.', 'Tom, engineering manager'],
    ['The search is the feature.', 'Priya, support']
  ];
  vf.vfCarousel({
    id: 'quotes-carousel', label: 'Customer quotes',
    items: QUOTES.map((q) => ({ content: html`<figure class="landing__quote"><blockquote>${q[0]}</blockquote><figcaption>${q[1]}</figcaption></figure>` })),
    onChange: (e) => log('quote ' + e.data.index)
  }).mount('#quotes');

  const PLANS = [
    { id: 'free', name: 'Free', price: 0, points: ['3 members', '1 GB'] },
    { id: 'team', name: 'Team', price: 8, points: ['Unlimited members', '100 GB', 'Admin tools'], popular: true }
  ];
  vf.attach('#plans', {
    render: () => html`${PLANS.map((p) => vf.vsCard({
      title: p.name,
      subtitle: vf.fmt.currency(p.price, 'USD') + ' / month',
      headingLevel: 3,
      actions: p.popular ? vf.vsBadge({ label: 'Popular', variant: 'success' }) : '',
      body: html`<ul class="landing__points">${p.points.map((x) => html`<li>${x}</li>`)}</ul>`,
      footer: vf.vsButton({ label: 'Choose ' + p.name, variant: p.popular ? 'primary' : 'secondary', action: 'choose', id: 'choose-' + p.id })
    }))}`,
    delegates: [{
      selector: '[data-action="choose"]',
      eventType: 'click',
      onEvent: (e) => { toast.show({ message: e.target.textContent + ': we will email you a link.' }); log(e.target.id); }
    }]
  });

  vf.vfAccordion({
    id: 'questions', headingLevel: 3,
    items: [
      { id: 'data', title: 'Where is my data stored?', content: 'In the region you choose when you sign up.' },
      { id: 'export', title: 'Can I leave with my notes?', content: 'Yes. Export everything as Markdown at any time.' },
      { id: 'sso', title: 'Do you support single sign-on?', content: 'On the Team plan, with SAML and OIDC.' }
    ],
    onToggle: (e) => log('faq ' + e.data.id + ' ' + e.data.open)
  }).mount('#faq');

  // The sign-up form: vs* markup with an error prop, drawn again after a failed submit.
  let error = null;
  let email = '';
  vf.attach('#signup', {
    render: () => html`
      ${vf.vsInput({ id: 'signup-email', name: 'email', type: 'email', label: 'Email', value: email, autocomplete: 'email', error: error })}
      ${vf.vsButton({ label: 'Subscribe', type: 'submit', variant: 'primary' })}`,
    events: [
      { eventType: 'input', onEvent: (e) => { email = e.event.target.value; } },
      {
        eventType: 'submit',
        onEvent: (e) => {
          e.event.preventDefault();
          error = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : 'Enter an email address like name@example.com.';
          if (!error) email = '';
          e.sender.refresh();
          if (error) { document.getElementById('signup-email').focus(); log('signup invalid'); return; }
          toast.show({ message: 'Thanks! Check your inbox.', variant: 'success' });
          log('signup ok');
        }
      }
    ]
  });
}());
