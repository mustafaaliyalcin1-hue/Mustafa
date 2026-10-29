// Alt sayfalar için ortak iskelet
import { h } from '../dom.js';

export function page(app, title, body, opts = {}) {
  const back = () => {
    app.audio.ui('click');
    if (opts.onBack) opts.onBack();
    else import('./menu.js').then((m) => app.show(new m.MenuScreen(app)));
  };
  const el = h('div.screen.page', null,
    h('div.page-head', null,
      h('button.btn.small', { onclick: back }, '← Geri'),
      h('h1', null, title),
      h('div.grow'),
      opts.right || null,
    ),
    h('div.page-body.scroll', null, body),
  );
  return el;
}

export function optGroup(options, value, onChange) {
  const g = h('div.opt-group');
  const render = () => {
    g.innerHTML = '';
    for (const o of options) {
      g.appendChild(h('button.btn.small' + (o.value === value ? '.on' : ''), { onclick: () => { value = o.value; onChange(value); render(); } }, o.label));
    }
  };
  render();
  return g;
}
