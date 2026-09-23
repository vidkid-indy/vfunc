// SPDX-License-Identifier: Apache-2.0
// vf.html, vf.tpl and vf.unsafeHtml: context-aware escaping (plan section M, S1 and S2).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './setup-dom.js';
import vf from '../src/vfunc.js';

const { html, tpl, unsafeHtml } = vf;

/** Runs fn with strict mode on, so unsafe interpolations throw. */
function strict(fn) {
  vf.config({ strict: true });
  try { return fn(); } finally { vf.config({ strict: false }); }
}

/** Runs fn with console.error silenced (non-strict mode reports unsafe values there). */
function quiet(fn) {
  const original = console.error;
  console.error = () => {};
  try { return fn(); } finally { console.error = original; }
}

test('text content is escaped', () => {
  const name = '<img src=x onerror=alert(1)>';
  assert.equal(String(html`<p>${name}</p>`), '<p>&lt;img src=x onerror=alert(1)&gt;</p>');
});

test('null, undefined and false render nothing; numbers render as text', () => {
  assert.equal(String(html`<i>${null}${undefined}${false}${0}${12}</i>`), '<i>012</i>');
});

test('nested vf.html, arrays, unsafeHtml and vfunc instances are inserted as markup', () => {
  const items = ['a', '<b>'];
  const list = html`<ul>${items.map((x) => html`<li>${x}</li>`)}</ul>`;
  assert.equal(String(list), '<ul><li>a</li><li>&lt;b&gt;</li></ul>');
  // Trusted: a static icon string written by the developer.
  assert.equal(String(html`<i>${unsafeHtml('<svg></svg>')}</i>`), '<i><svg></svg></i>');
  const inst = vf.vfunc({ tag: 'span', innerHTML: 'x' });
  assert.equal(String(html`<div>${inst}</div>`), '<div><span>x</span></div>');
});

test('quoted attribute values are escaped, including quotes', () => {
  const value = `" onmouseover="alert(1)`;
  assert.equal(String(html`<input value="${value}">`), '<input value="&quot; onmouseover=&quot;alert(1)">');
  assert.equal(String(html`<p title='${"it's"}'>x</p>`), `<p title='it&#39;s'>x</p>`);
});

test('an apostrophe in static attribute text does not confuse the context', () => {
  assert.equal(String(html`<p title="it's ${'<ok>'}">x</p>`), `<p title="it's &lt;ok&gt;">x</p>`);
});

test('URL attributes pass through safeUrl', () => {
  assert.equal(String(html`<a href="${'javascript:alert(1)'}">x</a>`), '<a href="#">x</a>');
  assert.equal(String(html`<a href="${'https://ok.test/?a=1&b=2'}">x</a>`), '<a href="https://ok.test/?a=1&amp;b=2">x</a>');
  assert.equal(String(html`<img src="/img/${'../x.png'}">`), '<img src="/img/../x.png">', 'a fixed prefix keeps the scheme');
  assert.equal(String(html`<form action="${'data:text/html,x'}"></form>`), '<form action="#"></form>');
});

test('a scheme cannot be assembled from several interpolations', () => {
  const out = String(html`<a href="${'javascript'}${':alert(1)'}">x</a>`);
  assert.equal(out.indexOf('javascript:'), -1, out);
});

test('a ">" in static attribute text does not skip the URL check', () => {
  const out = String(html`<a title="a>b" href="${'javascript:x'}">y</a>`);
  assert.equal(out, '<a title="a>b" href="#">y</a>');
});

test('event handler attributes, srcdoc and unquoted values are refused', () => {
  assert.throws(() => strict(() => html`<b onclick="${'alert(1)'}">x</b>`), /event handler/);
  assert.throws(() => strict(() => html`<iframe srcdoc="${'<b>'}"></iframe>`), /srcdoc/);
  assert.throws(() => strict(() => html`<b class=${'x onclick=alert(1)'}>x</b>`), /quote the value/);
  // Non-strict: dropped and reported.
  assert.equal(quiet(() => String(html`<b onclick="${'alert(1)'}">x</b>`)), '<b onclick="">x</b>');
});

test('script and style content is refused', () => {
  assert.throws(() => strict(() => html`<script>var a = ${'1'};</script>`), /script/);
  assert.throws(() => strict(() => html`<style>.a { color: ${'red'} }</style>`), /style/);
  assert.equal(String(html`<script>1</script><p>${'<x>'}</p>`), '<script>1</script><p>&lt;x&gt;</p>', 'after </script> is text again');
});

test('inside a tag only bare attribute names are allowed', () => {
  assert.equal(String(html`<button ${'disabled'}>x</button>`), '<button disabled>x</button>');
  assert.equal(String(html`<button ${false}>x</button>`), '<button >x</button>');
  assert.throws(() => strict(() => html`<b ${'onmouseover=alert(1)'}>x</b>`), /bare attribute names/);
  assert.throws(() => strict(() => html`<b ${'onfocus autofocus'}>x</b>`), /bare attribute names/);
});

test('interpolated tag names are limited', () => {
  assert.equal(String(html`<${'h2'}>t</${'h2'}>`), '<h2>t</h2>');
  assert.throws(() => strict(() => html`<${'script'}>x</script>`), /tag name/);
});

test('comments are treated as text', () => {
  assert.equal(String(html`<!-- ${'-->'} -->`), '<!-- --&gt; -->');
});

test('functions are refused', () => {
  assert.throws(() => strict(() => html`<p>${() => 1}</p>`), /function/);
});

test('vf.tpl gives the same protection without template literals', () => {
  const out = tpl('<a href="{url}" title="{user.name}">{label}</a>', {
    url: 'javascript:alert(1)', user: { name: '"x"' }, label: '<b>'
  });
  assert.equal(String(out), '<a href="#" title="&quot;x&quot;">&lt;b&gt;</a>');
  assert.equal(String(tpl('<p>{missing}{__proto__}</p>', {})), '<p></p>');
  assert.equal(String(tpl('{a.constructor}', { a: {} })), '');
});

test('render with vf.html produces escaped markup in a component', () => {
  const c = vf.vfunc({ state: { name: '<b>' }, render: (s) => html`<p>${s.name}</p>` });
  assert.equal(c.$node.innerHTML, '<p>&lt;b&gt;</p>');
});

test('strictRender warns when render returns a plain string', () => {
  const messages = [];
  const original = console.warn;
  console.warn = (m) => messages.push(m);
  vf.config({ strictRender: true });
  try {
    vf.vfunc({ render: () => '<p>plain</p>' });
  } finally {
    vf.config({ strictRender: false });
    console.warn = original;
  }
  assert.equal(messages.length, 1);
  assert.match(messages[0], /plain string/);
});
