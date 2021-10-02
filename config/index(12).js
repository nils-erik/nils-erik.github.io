function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['../constants/actionNames', 'moment'], function (ACTIONS, Moment) {
  var currentYear = Number(new Moment().year()); // Initial state

  var initialState = {
    data: [],
    formats: ['| Lastname, Firstname | Affiliation | Last Active Date | [csv]', '| Lastname | Firstname | Affiliation | Last Active Date | [csv]', '| Lastname, Firstname | Affiliation | Last Active Date | [excel]', '| Lastname | Firstname | Affiliation | Last Active Date | [excel]', 'Lastname, Firstname(Affiliation)Last Active Date[text]', 'Lastname, Firstname(Affiliation)Last Active Date[browser]'],
    format: '| Lastname, Firstname | Affiliation | Last Active Date | [csv]',
    toggle: false,
    year: 4,
    currentYear: currentYear,
    message: {
      type: 'success',
      message: '',
      show: false
    },
    loading: false,
    exporting: false,
    author: 3,
    showReload: false,
    ids: []
  }; // Reducers

  var reducer = function reducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      // Set the current data and stop any loading
      case ACTIONS.setData:
        return _objectSpread(_objectSpread({}, state), {}, {
          data: action.value,
          loading: false,
          message: _objectSpread(_objectSpread({}, state.message), {}, {
            show: false
          })
        });
      // Flip the current toggle

      case ACTIONS.setToggle:
        return _objectSpread(_objectSpread({}, state), {}, {
          toggle: !state.toggle,
          message: _objectSpread(_objectSpread({}, state.message), {}, {
            show: false
          })
        });
      // Reset the current format

      case ACTIONS.setFormat:
        return _objectSpread(_objectSpread({}, state), {}, {
          format: action.value,
          message: _objectSpread(_objectSpread({}, state.message), {}, {
            show: false
          })
        });
      // Reset the current year

      case ACTIONS.setYear:
        return _objectSpread(_objectSpread({}, state), {}, {
          year: action.value,
          message: _objectSpread(_objectSpread({}, state.message), {}, {
            show: false
          })
        });
      // updates the current number of authors

      case ACTIONS.setAuthor:
        return _objectSpread(_objectSpread({}, state), {}, {
          author: action.value,
          message: _objectSpread(_objectSpread({}, state.message), {}, {
            show: false
          })
        });
      // Start loading

      case ACTIONS.fetchData:
        return _objectSpread(_objectSpread({}, state), {}, {
          loading: true,
          ids: action.value,
          message: _objectSpread(_objectSpread({}, state.message), {}, {
            show: false
          }),
          showReload: false
        });
      // set the current message

      case ACTIONS.setMessage:
        return _objectSpread(_objectSpread({}, state), {}, {
          message: _objectSpread(_objectSpread({}, state.message), action.value)
        });

      case ACTIONS.setShowReload:
        return _objectSpread(_objectSpread({}, state), {}, {
          showReload: action.value
        });
      // Set exporting flag

      case ACTIONS.setExporting:
        return _objectSpread(_objectSpread({}, state), {}, {
          exporting: action.value
        });
      // set the current loading value

      case ACTIONS.setLoading:
        return _objectSpread(_objectSpread({}, state), {}, {
          loading: action.value
        });

      case ACTIONS.appReset:
        return initialState;
      // return the current state

      default:
        return state;
    }
  };

  return reducer;
});
