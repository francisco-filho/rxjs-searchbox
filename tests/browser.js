require('babel-register')();

const jsdom = require('jsdom');
const {JSDOM} = jsdom
//var exposedProperties = ['window', 'navigator', 'document'];

const dom = new JSDOM('');
const document = dom.window.document
global.window = dom.window.document.defaultView;

Object.keys(document.defaultView).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    //exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

global.navigator = {
  userAgent: 'node.js'
};

global.td = require('testdouble')
