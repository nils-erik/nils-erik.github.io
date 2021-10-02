function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

(function () {
  // ############ DON'T EDIT THIS LINE
  // prettier-ignore
  var APP_VERSION = "v1.2.94";
  ; // #################################

  /*
    Dynamically pick which configuration to use based on the url.
    Then attempt to load the resource, using require, upon failure we
    load a known resource (discovery.config.js)
  */

  var PATHS = {
    LANDING: 'landing-page',
    SEARCH: 'search-page',
    ABSTRACT: 'abstract-page'
  };

  var getDefaultLoader = function getDefaultLoader() {
    /* eslint-disable */
    // @ts-ignore
    return function () {
      return require(['config/main.config.js', 'config/discovery.config.js'], undefined, function () {
        return require(['config/discovery.config.js']);
      });
    };
    /* eslint-enable */
  };

  var getPathLoader = function getPathLoader(path) {
    /* eslint-disable */
    // @ts-ignore
    return function () {
      return require(['config/main.config.js', "config/".concat(path, ".config.js")], undefined, getDefaultLoader());
    };
    /* eslint-enable */
  };

  var load = getDefaultLoader();
  var version = APP_VERSION ? 'v=' + APP_VERSION : '';

  try {
    var loc = window.location;
    var fullPath = loc[loc.pathname === '/' ? 'hash' : 'pathname'].replace(/#/g, '');

    if (fullPath === '') {
      load = getPathLoader(PATHS.LANDING);
    } else if (fullPath.startsWith('/search')) {
      load = getPathLoader(PATHS.SEARCH);
    } else if (fullPath.startsWith('/abs')) {
      load = getPathLoader(PATHS.ABSTRACT);
    }
  } catch (e) {
    load = getDefaultLoader();
  } finally {
    (function checkLoad() {
      // sometimes requirejs isn't ready yet, this will wait for it
      if (window.requirejs) {
        window.requirejs.config({
          waitSeconds: 30,
          urlArgs: version
        });
        return load();
      }

      return setTimeout(checkLoad, 10);
    })();
  }
})();
/**
 * In the case of a proxied URL, we want to show a warning message
 * Do that by checking for the presence of the canonical URL ([ui|dev|qa].adsabs.harvard.edu)
 */


(function checkIfProxied() {
  var canonicalUrlPattern = /^(ui|qa|dev|devui)\.adsabs\.harvard\.edu$/; // if test fails, it is proxied url, set a class on body element

  if (!canonicalUrlPattern.test(window.location.hostname)) {
    var _document$getElements = document.getElementsByTagName('body'),
        _document$getElements2 = _slicedToArray(_document$getElements, 1),
        bodyEl = _document$getElements2[0];

    bodyEl.classList.add('is-proxied');
  }
})();
/**
 * Use a list of canonical URLs that might be changed by a proxy server, detect any
 * changes, and return the correct canonical URL.
 */


window.getCanonicalUrl = function () {
  var canonicalUrlPattern = /^https:\/\/(ui|qa|dev|devui)\.adsabs\.harvard\.edu$/; // URLs that could be rewritten by the proxy server

  var couldChangeUrls = [{
    env: 'ui',
    url: 'https://ui.adsabs.harvard.edu'
  }, {
    env: 'qa',
    url: 'https://qa.adsabs.harvard.edu'
  }, {
    env: 'dev',
    url: 'https://dev.adsabs.harvard.edu'
  }, {
    env: 'devui',
    url: 'https://devui.adsabs.harvard.edu'
  }];

  var _couldChangeUrls$filt = couldChangeUrls.filter(function (_ref) {
    var url = _ref.url;
    return !canonicalUrlPattern.test(url);
  }),
      _couldChangeUrls$filt2 = _slicedToArray(_couldChangeUrls$filt, 1),
      changedUrl = _couldChangeUrls$filt2[0]; // if we detect a change in one of the URLs, return an interpolated string to keep from getting rewritten


  if (typeof changedUrl !== 'undefined') {
    return "https://".concat([changedUrl.env, 'adsabs', 'harvard', 'edu'].join('.'));
  }

  return "https://".concat(['ui', 'adsabs', 'harvard', 'edu'].join('.'));
};
