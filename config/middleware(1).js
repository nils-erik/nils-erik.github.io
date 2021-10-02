function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['underscore', './actions', 'js/react/shared/helpers'], function (_, _ref, _ref2) {
  var SET_UPDATE_DATA = _ref.SET_UPDATE_DATA,
      GET_QID = _ref.GET_QID,
      SAVE_NEW_NOTIFICATION = _ref.SAVE_NEW_NOTIFICATION,
      ERROR_RESET = _ref.ERROR_RESET,
      ERROR = _ref.ERROR,
      CHECK_LOGIN_STATUS = _ref.CHECK_LOGIN_STATUS,
      setLoginStatus = _ref.setLoginStatus,
      addNotification = _ref.addNotification,
      makeError = _ref.makeError,
      getQID = _ref.getQID;
  var middleware = _ref2.middleware;

  var apiSuccess = _.memoize(function (str) {
    return "".concat(str, "_API_REQUEST_SUCCESS");
  });

  var filterQueryParams = function filterQueryParams(queryParams) {
    return Object.keys(queryParams).reduce(function (acc, k) {
      if (!k.startsWith('filter_') && !k.startsWith('p_')) {
        acc[k] = queryParams[k];
      }

      return acc;
    }, {});
  };

  var saveNotification = middleware(function (_ref3) {
    var trigger = _ref3.trigger,
        next = _ref3.next,
        dispatch = _ref3.dispatch,
        action = _ref3.action,
        getState = _ref3.getState;
    next(action);

    if (action.type === SAVE_NEW_NOTIFICATION) {
      trigger('getCurrentQuery', function (currentQuery) {
        if (currentQuery && currentQuery.toJSON) {
          var queryParams = currentQuery.toJSON(); // if sort has 'score' then stateful is false

          var stateful = true;

          if (queryParams.sort && queryParams.sort[0].startsWith('score')) {
            stateful = false;
          }

          dispatch({
            type: SET_UPDATE_DATA,
            result: {
              stateful: stateful
            }
          });
          dispatch(getQID(filterQueryParams(queryParams)));
        } else {
          dispatch(makeError('Current query not found'));
        }
      });
      dispatch({
        type: SET_UPDATE_DATA,
        result: action.result
      });
    }

    if (action.type === apiSuccess(GET_QID)) {
      if (action.result && action.result.qid) {
        var qid = action.result.qid;

        var _getState = getState(),
            updateData = _getState.updateData;

        dispatch(addNotification(_objectSpread(_objectSpread({}, updateData), {}, {
          qid: qid
        })));
      } else {
        dispatch(makeError('No QID returned from the server'));
      }
    }
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

  var requestReset = middleware(function (_ref4) {
    var dispatch = _ref4.dispatch,
        next = _ref4.next,
        action = _ref4.action;
    next(action);

    if (/_API_REQUEST_(SUCCESS|FAILURE)$/.test(action.type)) {
      var _parseScope = parseScope(action.type),
          scope = _parseScope.scope;

      delay(function () {
        dispatch({
          type: "".concat(scope, "_RESET")
        });
      });
    }
  });
  var errorReset = middleware(function (_ref5) {
    var dispatch = _ref5.dispatch,
        next = _ref5.next,
        action = _ref5.action;
    next(action);

    if (action.type === ERROR) {
      delay(function () {
        dispatch({
          type: ERROR_RESET
        });
      });
    }
  });
  var loggedInStatus = middleware(function (_ref6) {
    var trigger = _ref6.trigger,
        dispatch = _ref6.dispatch,
        next = _ref6.next,
        action = _ref6.action;
    next(action);

    if (action.type === CHECK_LOGIN_STATUS || action.type === 'USER_ANNOUNCEMENT/user_signed_in' || action.type === 'USER_ANNOUNCEMENT/user_signed_out') {
      trigger('isLoggedIn', function (status) {
        return dispatch(setLoginStatus(status));
      });
    }
  });
  return {
    saveNotification: saveNotification,
    requestReset: requestReset,
    errorReset: errorReset,
    loggedInStatus: loggedInStatus
  };
});
