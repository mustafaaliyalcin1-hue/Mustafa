// Küçük DOM yardımcıları
export function h(tag, props, ...kids) {
  const [t, ...cls] = tag.split('.');
  const el = document.createElement(t || 'div');
  if (cls.length) el.className = cls.join(' ');
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className += (el.className ? ' ' : '') + v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const k of kids.flat(3)) {
    if (k === null || k === undefined || k === false) continue;
    el.appendChild(typeof k === 'string' || typeof k === 'number' ? document.createTextNode(String(k)) : k);
  }
  return el;
}

export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }

let toastBox = null;
export function toast(text, kind = '') {
  if (!toastBox) { toastBox = h('div.toasts'); document.body.appendChild(toastBox); }
  const t = h('div.toast' + (kind ? '.' + kind : ''), null, text);
  toastBox.appendChild(t);
  setTimeout(() => t.classList.add('out'), 2600);
  setTimeout(() => t.remove(), 3200);
}

export function modal(title, body, buttons) {
  const wrap = h('div.modal-wrap');
  const box = h('div.modal', null, h('h2', null, title), h('div.modal-body', null, body), h('div.modal-btns', null, ...buttons.map((b) => h('button.btn' + (b.cls ? '.' + b.cls : ''), { onclick: () => { wrap.remove(); b.on && b.on(); } }, b.label))));
  wrap.appendChild(box);
  document.body.appendChild(wrap);
  return wrap;
}

export function fmtTime(sec) {
  sec = Math.max(0, sec);
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
