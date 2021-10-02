function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['../shared/helpers', './actions'], function (_ref, _ref2) {
  var middleware = _ref.middleware,
      apiSuccess = _ref.apiSuccess,
      apiFailure = _ref.apiFailure,
      parseScope = _ref.parseScope;
  var GET_RECOMMENDATIONS = _ref2.GET_RECOMMENDATIONS,
      getDocs = _ref2.getDocs,
      GET_DOCS = _ref2.GET_DOCS,
      setDocs = _ref2.setDocs,
      setQuery = _ref2.setQuery,
      UPDATE_SEARCH_BAR = _ref2.UPDATE_SEARCH_BAR,
      GET_FULL_LIST = _ref2.GET_FULL_LIST,
      EMIT_ANALYTICS = _ref2.EMIT_ANALYTICS,
      updateUserName = _ref2.updateUserName,
      setTab = _ref2.setTab;
  var updateTarget = middleware(function (_ref3) {
    var next = _ref3.next,
        action = _ref3.action,
        getState = _ref3.getState;

    if (action.type === 'API_REQUEST' && action.scope === GET_RECOMMENDATIONS) {
      var _getState = getState(),
          oracleTarget = _getState.oracleTarget;

      action = _objectSpread(_objectSpread({}, action), {}, {
        options: _objectSpread(_objectSpread({}, action.options), {}, {
          target: oracleTarget
        })
      });
    }

    next(action);
  });
  var getRecommendations = middleware(function (_ref4) {
    var next = _ref4.next,
        action = _ref4.action,
        dispatch = _ref4.dispatch,
        getState = _ref4.getState;
    next(action);

    if (action.type === GET_RECOMMENDATIONS) {
      var _getState2 = getState(),
          queryParams = _getState2.queryParams;

      var func = queryParams.func,
          sort = queryParams.sort,
          numDocs = queryParams.numDocs,
          cutOffDays = queryParams.cutOffDays,
          topNReads = queryParams.topNReads,
          reader = queryParams.reader;
      dispatch({
        type: 'API_REQUEST',
        scope: GET_RECOMMENDATIONS,
        options: {
          type: 'POST',
          data: {
            function: func || queryParams.function,
            sort: sort,
            num_docs: numDocs,
            cutoff_days: cutOffDays,
            top_n_reads: topNReads,
            reader: reader
          }
        }
      });
    }

    if (action.type === apiSuccess(GET_RECOMMENDATIONS)) {
      dispatch(setQuery(action.result.query));
      dispatch(getDocs({
        fl: 'bibcode,title,author,[fields author=3],author_count',
        q: action.result.query
      }));
    }

    if (action.type === apiFailure(GET_RECOMMENDATIONS)) {
      if (action.result && action.result.query) {
        var _parseScope = parseScope(action.type),
            scope = _parseScope.scope;

        dispatch({
          type: "".concat(scope, "_RESET")
        });
        dispatch(setQuery(action.result.query));
      }
    }

    if (action.type === apiSuccess(GET_DOCS)) {
      dispatch(setDocs(action.result.response.docs));
    }
  });
  var updateSearchBar = middleware(function (_ref5) {
    var action = _ref5.action,
        next = _ref5.next,
        trigger = _ref5.trigger;
    next(action);

    if (action.type === UPDATE_SEARCH_BAR) {
      trigger('publishToPubSub', 'CUSTOM_EVENT', 'recommender/update-search-text', {
        text: action.payload
      });
    }
  });
  var getFullList = middleware(function (_ref6) {
    var next = _ref6.next,
        action = _ref6.action,
        trigger = _ref6.trigger,
        getState = _ref6.getState;
    next(action);

    if (action.type === GET_FULL_LIST) {
      var _getState3 = getState(),
          query = _getState3.query;

      trigger('doSearch', {
        q: query,
        sort: 'score desc'
      });
    }
  });
  var analytics = middleware(function (_ref7) {
    var next = _ref7.next,
        action = _ref7.action,
        trigger = _ref7.trigger;
    next(action);

    if (action.type === EMIT_ANALYTICS) {
      trigger.apply(void 0, ['analyticsEvent'].concat(_toConsumableArray(action.payload)));
    }
  });
  var updateUser = middleware(function (_ref8) {
    var next = _ref8.next,
        action = _ref8.action,
        dispatch = _ref8.dispatch;
    next(action);

    if (action.type.indexOf('USER_ANNOUNCEMENT/user_signed') > -1) {
      // break with the pattern; why define 3 consts when I don't need them?
      if (action.type.indexOf('user_signed_out') > -1) {
        // dispatch(setDocs([]));
        dispatch(setTab(2)); // switch to help {type: 'SET_TAB', payload: 2}
      }

      dispatch(updateUserName(action.payload || ''));
    }
  });
  return {
    getRecommendations: getRecommendations,
    updateSearchBar: updateSearchBar,
    getFullList: getFullList,
    analytics: analytics,
    updateTarget: updateTarget,
    updateUser: updateUser
  };
});
