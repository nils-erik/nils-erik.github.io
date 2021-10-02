function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define([], function () {
  var actions = {
    GET_RECOMMENDATIONS: 'GET_RECOMMENDATIONS',
    GET_DOCS: 'GET_DOCS',
    SET_DOCS: 'SET_DOCS',
    SET_QUERY: 'SET_QUERY',
    UPDATE_SEARCH_BAR: 'UPDATE_SEARCH_BAR',
    GET_FULL_LIST: 'GET_FULL_LIST',
    EMIT_ANALYTICS: 'EMIT_ANALYTICS',
    SET_TAB: 'SET_TAB',
    SET_ORACLE_TARGET: 'SET_ORACLE_TARGET',
    SET_QUERY_PARAMS: 'SET_QUERY_PARAMS',
    UPDATE_USERNAME: 'UPDATE_USERNAME'
  };
  var actionCreators = {
    getRecommendations: function getRecommendations() {
      return {
        type: actions.GET_RECOMMENDATIONS
      };
    },
    getDocs: function getDocs(query) {
      return {
        type: 'API_REQUEST',
        scope: actions.GET_DOCS,
        options: {
          type: 'GET',
          target: 'search/query',
          query: query
        }
      };
    },
    setDocs: function setDocs(docs) {
      return {
        type: actions.SET_DOCS,
        payload: docs
      };
    },
    setQuery: function setQuery(query) {
      return {
        type: actions.SET_QUERY,
        payload: query
      };
    },
    setQueryParams: function setQueryParams(payload) {
      return {
        type: actions.SET_QUERY_PARAMS,
        payload: payload
      };
    },
    updateSearchBar: function updateSearchBar(text) {
      return {
        type: actions.UPDATE_SEARCH_BAR,
        payload: text
      };
    },
    updateUserName: function updateUserName(text) {
      return {
        type: actions.UPDATE_USERNAME,
        payload: text
      };
    },
    getFullList: function getFullList() {
      return {
        type: actions.GET_FULL_LIST
      };
    },
    emitAnalytics: function emitAnalytics(payload) {
      return {
        type: actions.EMIT_ANALYTICS,
        payload: payload
      };
    },
    setTab: function setTab(tab) {
      return {
        type: actions.SET_TAB,
        payload: tab
      };
    },
    setOracleTarget: function setOracleTarget(target) {
      return {
        type: actions.SET_ORACLE_TARGET,
        payload: target
      };
    }
  };
  return _objectSpread(_objectSpread({}, actions), actionCreators);
});
