function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define([], function () {
  /**
   * middleware wrapper with a function that, when called,
   * binds it's first argument to the first argument of the middleware function
   * returns the wrapped middleware function
   *
   * This will also combine middlewares passed as arguments into a single object
   */
  var withContext = function withContext() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return function (context) {
      var fns = args.reduce(function (acc, a) {
        return _objectSpread(_objectSpread({}, acc), a);
      }, {});
      return Object.keys(fns).map(function (key) {
        return fns[key].bind(null, context);
      });
    };
  };

  var escape = function escape(string) {
    return string.replace(/(['"])/g, '\\$1');
  };

  var unescape = function unescape(string) {
    return string.replace(/\\(["'])/g, '$1');
  };

  var isEmpty = function isEmpty(value) {
    return !(typeof value === 'string' && value.length > 0);
  };

  var middleware = function middleware(callback) {
    return function (_ref, _ref2) {
      var trigger = _ref.trigger;
      var dispatch = _ref2.dispatch,
          getState = _ref2.getState;
      return function (next) {
        return function (action) {
          return callback({
            trigger: trigger,
            dispatch: dispatch,
            getState: getState,
            next: next,
            action: action
          });
        };
      };
    };
  };

  var apiSuccess = _.memoize(function (str) {
    return "".concat(str, "_API_REQUEST_SUCCESS");
  });

  var apiPending = _.memoize(function (str) {
    return "".concat(str, "_API_REQUEST_PENDING");
  });

  var apiFailure = _.memoize(function (str) {
    return "".concat(str, "_API_REQUEST_FAILURE");
  });

  var parseScope = function parseScope(requestType) {
    var _requestType$split = requestType.split('_API_REQUEST_'),
        _requestType$split2 = _slicedToArray(_requestType$split, 2),
        scope = _requestType$split2[0],
        status = _requestType$split2[1];

    return {
      scope: scope,
      status: status
    };
  };

  var delay = function delay(cb) {
    if (cb.toKey) {
      window.clearTimeout(cb.toKey);
    }

    cb.toKey = setTimeout(cb, 3000);
  };

  return {
    withContext: withContext,
    escape: escape,
    unescape: unescape,
    middleware: middleware,
    isEmpty: isEmpty,
    apiSuccess: apiSuccess,
    apiPending: apiPending,
    apiFailure: apiFailure,
    parseScope: parseScope,
    delay: delay
  };
});
