function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define([], function () {
  // default fail object
  var defaultFail = {
    responseJSON: {
      error: 'Server-side issue occurred'
    }
  };
  /**
   * Scoped request
   *
   * This will trigger an api request
   */

  var request = function request(_ref, _ref2) {
    var trigger = _ref.trigger;
    var dispatch = _ref2.dispatch;
    return function (next) {
      return function (action) {
        next(action);

        if (action.type === 'API_REQUEST' && action.scope) {
          var done = function done(result) {
            dispatch({
              type: "".concat(action.scope, "_API_REQUEST_SUCCESS"),
              result: result
            });
          };

          var fail = function fail() {
            var error = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultFail;
            var responseJSON = error.responseJSON,
                statusText = error.statusText;
            var errorMsg = defaultFail.responseJSON.error;

            if (responseJSON) {
              errorMsg = responseJSON.error || responseJSON.message || responseJSON.msg;
            } else if (statusText) {
              errorMsg = statusText;
            }

            dispatch({
              type: "".concat(action.scope, "_API_REQUEST_FAILURE"),
              error: errorMsg,
              result: responseJSON
            });
          };

          var _action$options = action.options,
              target = _action$options.target,
              _action$options$query = _action$options.query,
              query = _action$options$query === void 0 ? {} : _action$options$query,
              _action$options$type = _action$options.type,
              type = _action$options$type === void 0 ? 'GET' : _action$options$type,
              data = _action$options.data,
              headers = _action$options.headers;

          if (!target) {
            return;
          }

          dispatch({
            type: "".concat(action.scope, "_API_REQUEST_PENDING")
          });
          trigger('sendRequest', {
            target: target,
            query: query,
            options: {
              type: type,
              done: done,
              fail: fail,
              data: JSON.stringify(data),
              headers: _objectSpread({
                Accept: 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8'
              }, headers)
            }
          });
        }
      };
    };
  };

  return {
    request: request
  };
});
