const fs = require('fs');
const path = require('path');

function makeClassList() {
  const values = new Set();
  return {
    add: (...items) => items.forEach(i => values.add(i)),
    remove: (...items) => items.forEach(i => values.delete(i)),
    toggle: (item, force) => { if (force === undefined ? !values.has(item) : force) values.add(item); else values.delete(item); },
    contains: item => values.has(item),
    toString: () => Array.from(values).join(' ')
  };
}

function makeElement(id) {
  return {
    id,
    textContent: '',
    innerHTML: '',
    value: '',
    className: '',
    classList: makeClassList(),
    style: {},
    addEventListener: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    closest: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  };
}

const elements = new Map();
['app','screenTitle','screenCaption','toast','backButton','themeButton'].forEach(id => elements.set(id, makeElement(id)));

global.window = global;
global.document = {
  readyState: 'complete',
  body: makeElement('body'),
  getElementById: (id) => elements.get(id) || elements.set(id, makeElement(id)).get(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.setTimeout = (fn) => { if (typeof fn === 'function') fn(); return 1; };
global.clearTimeout = () => {};

const root = path.resolve(__dirname, '..');
['data.js','utils.js','router.js','auth.js','profile.js','rides.js','delivery.js','driver.js','admin.js','app.js'].forEach(file => {
  require(path.join(root, 'js', file));
});

if (!elements.get('app').innerHTML.includes('Verified UTM campus rides')) {
  throw new Error('Auth screen did not render as expected');
}
console.log('Runtime smoke test passed: app initialized and auth screen rendered.');
