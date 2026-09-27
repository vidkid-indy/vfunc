# Tutorial: build a to-do app

A step-by-step guide for first-time users. You build a to-do app from three files, add saving and components, and put it on the internet. All you install is an editor and Python; there are no build tools. Each step takes about ten minutes.

> Every step has an **Open the finished step** link. If you get stuck, compare it with your files. The code on this page is the same code the tests run.

## Get ready

1. **Editor**: install [Visual Studio Code](https://code.visualstudio.com/). Notepad works too, but colors help.
2. **Python**: it runs a small server that shows your files in the browser. Type `python --version` in a terminal (PowerShell on Windows); if a version appears, you are ready.
   - If not, install it from [python.org](https://www.python.org/downloads/). On Windows, tick **Add python.exe to PATH** on the first screen of the installer.
3. **Folder**: make a folder named `todo` (on the desktop, for example) and open it in VS Code with **File → Open Folder**.

Run the server inside the `todo` folder. In VS Code open **Terminal → New Terminal**, type the line below, then open `http://localhost:8080/` in the browser. Press Ctrl+C in the terminal to stop it.

```bash
python -m http.server 8080
```

- If you open the file by double-clicking it (`file://`), the browser blocks some features. Always use the address above.
- Press **F12** in the browser to open the developer tools. Red text in the **Console** tab means something in the code is wrong. The development build of vfunc explains common mistakes with yellow warnings.

## Step 1: the first screen

Make three files in the `todo` folder. First **index.html**, the frame of the page, which loads vfunc and your code.

{{tutorial-01-html}}

- The `Content-Security-Policy` line is a security setting: only files from this site and the CDN (jsdelivr) may run. Leave it as it is.
- `vfunc.tokens.css` holds the **design tokens**: colors, spacing and fonts, with a light and a dark theme.
- `vfunc.js` is the development build. `integrity` lets the browser check that the file it received was not changed.
- `<div id="app">` is where the app is drawn.

You keep one **style.css** until the end, so copy it once and move on. Colors and spacing are all `var(--vf-…)` tokens, so they change with the theme.

{{tutorial-01-css}}

**app.js** is the vfunc code.

{{tutorial-01-js}}

- `vf.vfunc({ … })` makes a **component**, one part of the screen.
- `state` holds what the component remembers. `render` takes the state and returns HTML; it runs again when the state changes.
- HTML made with `vf.html` is safe. Type `<b>bold</b>` as the name: it is shown as text, not in bold.
- `delegates` connect events. When `input` happens on the element with `data-action="rename"`, the code changes `e.sender.name`, and the screen is drawn again.
- `hello.mount('#app')` puts the component in the `#app` spot.

![The greeting changes as you type a name](../tutorial/img/en/01-hello.png)

[Open the finished step](../tutorial/en/01-hello/index.html)

## Step 2: add to-dos

Now take to-dos instead of a name. Replace **app.js** with the code below; index.html and style.css stay the same.

{{tutorial-02-js}}

- The list is the `state.items` array. `render` makes an `<li>` for each item with `items.map(…)`.
- A form tries to reload the page when it is sent. `e.event.preventDefault()` stops that.
- The element with `data-ref="input"` is found as `e.sender.refs.input`.
- To change the list, make a **new array** with `concat` and assign it. The assignment makes vfunc draw again.

![The screen after adding two to-dos](../tutorial/img/en/02-add.png)

[Open the finished step](../tutorial/en/02-add/index.html)

## Step 3: mark as done and delete

Give each item a checkbox and a delete button, and show how many are left.

{{tutorial-03-js}}

- `row` draws one item. Each row gets a `data-id` so the code knows which item it is.
- You do not add an event to every button. The component has **one** delegate for `data-action="toggle"` and one for `data-action="remove"`, and `idOf(e)` reads the row's `data-id`. With 1000 items there are still three listeners.
- The actions live in `methods`. Inside, `this` is the component and `this.items` is `state.items`.
- A finished row has `data-state="done"`; the line through it comes from `[data-state="done"]` in style.css. The JavaScript never decides how things look.

![Finishing the first item crosses it out and leaves 2](../tutorial/img/en/03-done.png)

[Open the finished step](../tutorial/en/03-done/index.html)

## Step 4: save the list

Right now the list disappears when you reload. Save it in the browser's storage (localStorage).

{{tutorial-04-js}}

- `onUpdate` runs after every render. The list is drawn again whenever it changes, so this is the place to save.
- `load()` reads the saved text back into a list. Stored values can be changed from outside, so it keeps only the fields it needs (`id`, `text`, `done`).
- New item numbers (`nextId`) continue after the saved ones.
- The storage belongs to this browser and this address only. Another computer or a private window does not see it.

![The list and the done mark are still there after a reload](../tutorial/img/en/04-save.png)

[Open the finished step](../tutorial/en/04-save/index.html)

## Step 5: use components

vfunc comes with **components (vfunc-ui)** such as buttons, an empty screen, notifications and confirm dialogs. Use them only where they help. Add two lines to **index.html** (`vfunc-ui.css` and `vfunc-ui.js`).

{{tutorial-05-html}}

**app.js**:

{{tutorial-05-js}}

- `vf.vs…` returns a piece of HTML. Put it straight into `render`, like `${vf.vsButton({ … })}`. `action: 'remove'` becomes `data-action="remove"`, so the delegate from step 3 still works.
- `vf.vf…` returns a live component. The notification area `vf.vfToast()` is made once per page and used with `toast.show({ … })`.
- `open()` of `vf.vfConfirm` waits until the user chooses, so `remove` is `async` and gets the answer with `await`. After the answer, `destroy()` cleans it up.

![When the list is empty, a hint is shown](../tutorial/img/en/05-empty.png)

![Adding shows a notification in the lower right](../tutorial/img/en/05-toast.png)

![A dialog asks before deleting. Escape or Cancel keeps the item](../tutorial/img/en/05-confirm.png)

![Switch the computer to dark mode and the tokens turn dark. The code stays the same](../tutorial/img/en/05-dark.png)

[Open the finished step](../tutorial/en/05-components/index.html)

## Step 6: put it on the internet

**Switch to the production files.** The development `vfunc.js` carries its warning texts and is larger. Before publishing, change the scripts in index.html to the min files. Here is step 5's index.html for production (the `integrity` values changed with the files).

{{tutorial-05-html-min}}

**Publish with GitHub Pages** (free, you only need an account):

1. Sign up at [github.com](https://github.com/) and press **+ → New repository** in the top right. Give it a name (for example `todo`) and make it **Public**.
2. On the repository page press **Add file → Upload files**, drop `index.html`, `style.css` and `app.js`, and press **Commit changes**.
3. In **Settings → Pages**, set Source to **Deploy from a branch** and Branch to **main** and **/ (root)**, then press **Save**.
4. After a minute or two the address (`https://<your-name>.github.io/todo/`) appears at the top of the same screen. Send that address to anyone.

- To try it without an account, drop the `todo` folder on [Netlify Drop](https://app.netlify.com/drop).
- If you upload a change and still see the old page, reload with Ctrl+F5. Server cache settings are in [Deploy](deploy.md).

## When you are stuck

| What you see | What to check |
|---|---|
| The page is empty | F12 → red text in Console. `vf is not defined` means the vfunc address in index.html or the `<script>` order (vfunc before app.js) |
| The address starts with `file://` | You opened the file by double-clicking it. Start the server and open `http://localhost:8080/` |
| `Refused to load` or a `Content-Security-Policy` error | The security line in index.html has `https://cdn.jsdelivr.net`, and the file addresses are right |
| An `integrity` error | The version and the `integrity` value do not match. Copy the code on this page again |
| Pressing Add reloads the page | `e.event.preventDefault()` is missing |
| `onclick="…"` does nothing | The security setting blocks it. Use `data-action` and `delegates` |
| The list is gone after a reload | A private window, or the browser blocks storage. Check `onUpdate` in step 4 too |

If it still does not work, read the [FAQ](faq.md) or ask in [GitHub Discussions](https://github.com/vidkid-indy/vfunc/discussions). Include the console error text and you will get an answer faster.

## Next

- [Build apps with the starter and AI](starter.md): take an app skeleton with several screens, Korean/English and themes, and have an AI add features. There are ten practice projects.
- [Core concepts](guide.md): components, state, events and controlling existing HTML in detail.
- [Components](components.md): about sixty more besides the ones in step 5.
- [Examples](examples.md): the source and a running page for 21 examples.
