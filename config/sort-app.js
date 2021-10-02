function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['underscore'], function (_) {
  // Action Constants
  var SET_DIRECTION = 'SET_DIRECTION';
  var SET_SORT = 'SET_SORT';
  var SET_QUERY = 'SET_QUERY';
  var SET_LOCKED = 'SET_LOCKED'; // Action Creators

  /**
   * Takes a new sort object and dispatches the update to the state.  If only a
   * string is passed, then it will attempt to find the value in the current
   * list of options.
   *
   * @param {string|object} value - The new selected sort
   * @param {boolean} silent - if true, a change event will not be triggered
   */

  var setSort = function setSort(value, silent) {
    return function (dispatch, getState, widget) {
      // if passed a string, convert it to one of our pre-defined options
      if (_.isString(value)) {
        var _getState = getState(),
            options = _getState.options; // attempt to find something, if not just provide the first option


        value = options.find(function (_ref) {
          var id = _ref.id;
          return id === value;
        }) || options[0];
      }

      dispatch({
        type: SET_SORT,
        value: value
      }); // only fire if we aren't being silent

      !silent && widget.onSortChange();
    };
  };
  /**
   * Takes in a direction and dispatches a request
   * if no direction is passed, it will toggle the current direction between
   * `asc` and `desc`
   *
   * @param {string} [value] - The new direction
   * @param {boolean} silent - if true, a change event will not be triggered
   */


  var setDirection = function setDirection(value, silent) {
    return function (dispatch, getState, widget) {
      // if a direction isn't passed, then just toggle
      if (_.isUndefined(value)) {
        var _getState2 = getState(),
            direction = _getState2.direction;

        value = direction === 'asc' ? 'desc' : 'asc';
      }

      dispatch({
        type: SET_DIRECTION,
        value: value
      }); // only fire if we aren't being silent

      !silent && widget.onSortChange();
    };
  };
  /**
   * Set the current query
   *
   * @param {object} value - the new query
   */


  var setQuery = function setQuery(value) {
    return {
      type: SET_QUERY,
      value: value
    };
  };
  /**
   * Set the current locked value
   *
   * @param {boolean} value - the new locked value
   */


  var setLocked = function setLocked(value) {
    return function (dispatch, getState) {
      // grab the current timer (if exists)
      var _getState3 = getState(),
          lockTimer = _getState3.lockTimer;

      if (lockTimer) {
        clearTimeout(lockTimer);
      } // create a new timer, which resets the locked state after a period of time


      var timer = setTimeout(function () {
        return dispatch({
          type: SET_LOCKED,
          value: false
        });
      }, 30000); // dispatch the new state

      dispatch({
        type: SET_LOCKED,
        value: value,
        timer: timer
      });
    };
  }; // initial state


  var initialState = {
    options: [{
      id: 'author_count',
      text: 'Author Count',
      desc: 'sort by number of authors'
    }, {
      id: 'bibcode',
      text: 'Bibcode',
      desc: 'sort by bibcode'
    }, {
      id: 'citation_count',
      text: 'Citation Count',
      desc: 'sort by number of citations'
    }, {
      id: 'citation_count_norm',
      text: 'Normalized Citation Count',
      desc: 'sort by number of normalized citations'
    }, {
      id: 'classic_factor',
      text: 'Classic Factor',
      desc: 'sort using classical score'
    }, {
      id: 'first_author',
      text: 'First Author',
      desc: 'sort by first author'
    }, {
      id: 'date',
      text: 'Date',
      desc: 'sort by publication date'
    }, {
      id: 'entry_date',
      text: 'Entry Date',
      desc: 'sort by date work entered the database'
    }, {
      id: 'read_count',
      text: 'Read Count',
      desc: 'sort by number of reads'
    }, {
      id: 'score',
      text: 'Score',
      desc: 'sort by the relative score'
    }],
    sort: {
      id: 'date',
      text: 'Date'
    },
    direction: 'desc',
    query: null,
    locked: false,
    lockTimer: null
  }; // reducer

  var reducer = function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case SET_SORT:
        return _objectSpread(_objectSpread({}, state), {}, {
          sort: action.value
        });

      case SET_DIRECTION:
        return _objectSpread(_objectSpread({}, state), {}, {
          direction: action.value
        });

      case SET_QUERY:
        return _objectSpread(_objectSpread({}, state), {}, {
          query: action.value
        });

      case SET_LOCKED:
        return _objectSpread(_objectSpread({}, state), {}, {
          locked: action.value,
          lockTimer: action.timer
        });

      default:
        return initialState;
    }
  };

  return {
    setSort: setSort,
    setDirection: setDirection,
    setQuery: setQuery,
    setLocked: setLocked,
    initialState: initialState,
    reducer: reducer
  };
});
