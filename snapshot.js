// Maps the verifier's server routes onto the static files of this snapshot.
(() => {
  const dir = location.pathname.replace(/[^/]*$/, '');
  const rewrite = url => {
    if (typeof url !== 'string' || url[0] !== '/' || url.startsWith('//')) return url;
    const path = url.split('?')[0];
    let m;
    if (path === '/api/state') return dir + 'data/state.json';
    if ((m = /^\/api\/audits\/([^/]+)\/artifacts\/([^/]+)$/.exec(path))) return dir + 'data/audits/' + m[1] + '/' + m[2] + (/^(ds-audit|handoff-map|review)/.test(decodeURIComponent(m[2])) ? '.json' : '.png');
    if ((m = /^\/api\/audits\/([^/]+)$/.exec(path))) return dir + 'data/audits/' + m[1] + '.json';
    if (path.startsWith('/api/')) return dir + 'data/missing.json';
    return dir + path.slice(1);
  };
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => typeof input === 'string' ? nativeFetch(rewrite(input), init && init.method && init.method !== 'GET' ? { ...init, method: 'GET', body: undefined } : init) : nativeFetch(input, init);
  const fix = el => { for (const attr of ['src', 'href', 'data-src']) { const v = el.getAttribute && el.getAttribute(attr); if (!v || v[0] !== '/' || v.startsWith('//') || (dir !== '/' && v.startsWith(dir))) continue; const next = rewrite(v); if (next !== v) el.setAttribute(attr, next); } };
  const fixTree = node => { if (node.nodeType !== 1) return; fix(node); node.querySelectorAll && node.querySelectorAll('[src],[href],[data-src]').forEach(fix); };
  new MutationObserver(list => list.forEach(r => r.type === 'attributes' ? fix(r.target) : r.addedNodes.forEach(fixTree)))
    .observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'href', 'data-src'] });
})();
