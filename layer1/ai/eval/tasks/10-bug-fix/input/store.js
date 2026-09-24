// Shared state and the only functions that change it.
import vf from './lib/vfunc.esm.js';

export const store = vf.store({
  prefs: { theme: 'light', lang: 'en' },
  tasks: [
    { id: 't1', title: 'Write the release notes', done: false },
    { id: 't2', title: 'Review the login page', done: false },
    { id: 't3', title: 'Update the icons', done: true }
  ]
});

export function setTheme(theme) {
  store.set((s) => ({ prefs: { theme: theme, lang: s.prefs.lang } }));
}

export function setLang(lang) {
  store.set({ prefs: { lang: lang } });
}

export function toggleTask(id) {
  store.set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { id: t.id, title: t.title, done: !t.done } : t)) }));
}

export function removeTask(id) {
  store.set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
}
