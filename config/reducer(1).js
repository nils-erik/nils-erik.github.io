function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

define(['redux', './actions'], function (_ref, _ref2) {
  var combineReducers = _ref.combineReducers;
  var SET_UPDATE_DATA = _ref2.SET_UPDATE_DATA,
      RESET = _ref2.RESET,
      ERROR = _ref2.ERROR,
      ERROR_RESET = _ref2.ERROR_RESET,
      SET_LOGIN_STATUS = _ref2.SET_LOGIN_STATUS;
  var requestState = {
    ADD_NOTIFICATION: {
      status: null,
      result: null,
      error: null
    },
    GET_QID: {
      status: null,
      result: null,
      error: null
    }
  };

  var requests = function requests() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : requestState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    if (/_API_REQUEST_/.test(action.type)) {
      var _action$type$split = action.type.split('_API_REQUEST_'),
          _action$type$split2 = _slicedToArray(_action$type$split, 2),
          scope = _action$type$split2[0],
          status = _action$type$split2[1];

      var _action$result = action.result,
          result = _action$result === void 0 ? null : _action$result,
          _action$error = action.error,
          error = _action$error === void 0 ? null : _action$error;
      return _objectSpread(_objectSpread({}, state), {}, _defineProperty({}, scope, {
        status: status.toLowerCase(),
        result: result,
        error: error
      }));
    } else if (/_RESET$/.test(action.type)) {
      var _scope = action.type.replace('_RESET', '');

      return _objectSpread(_objectSpread({}, state), {}, _defineProperty({}, _scope, requestState[_scope]));
    }

    return state;
  };

  var updateDataState = null;

  var updateData = function updateData() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : updateDataState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    if (action.type === SET_UPDATE_DATA) {
      return _objectSpread(_objectSpread({}, state), action.result);
    }

    if (action.type === RESET) {
      return updateDataState;
    }

    return state;
  };

  var generalErrorState = null;

  var generalError = function generalError() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : generalErrorState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    if (action.type === ERROR && action.result) {
      return action.result;
    }

    if (action.type === RESET || action.type === ERROR_RESET) {
      return generalErrorState;
    }

    return state;
  };

  var loggedInState = false;

  var loggedIn = function loggedIn() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : loggedInState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    if (action.type === SET_LOGIN_STATUS) {
      return action.result;
    }

    return state;
  };

  return combineReducers({
    requests: requests,
    updateData: updateData,
    generalError: generalError,
    loggedIn: loggedIn
  });
});
