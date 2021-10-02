function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Collects and combines all reducers
 */
define(['underscore', 'js/components/api_targets', '../actions/index', 'js/widgets/config', 'redux'], function (_, ApiTargets, actions, config, Redux) {
  var SET_QUERY = actions.SET_QUERY,
      SET_FORMAT = actions.SET_FORMAT,
      SET_FORMATS = actions.SET_FORMATS,
      SET_CUSTOM_FORMAT = actions.SET_CUSTOM_FORMAT,
      SET_PROGRESS = actions.SET_PROGRESS,
      SET_COUNT = actions.SET_COUNT,
      SET_PAGE = actions.SET_PAGE,
      SET_IGNORE = actions.SET_IGNORE,
      SET_HAS_ERROR = actions.SET_HAS_ERROR,
      SET_SHOW_CLOSER = actions.SET_SHOW_CLOSER,
      SET_ERROR_MSG = actions.SET_ERROR_MSG,
      SET_MAX_COUNT = actions.SET_MAX_COUNT,
      SET_TOTAL_RECS = actions.SET_TOTAL_RECS,
      SET_BATCH_SIZE = actions.SET_BATCH_SIZE,
      REQUEST_IDS = actions.REQUEST_IDS,
      RECEIVE_IDS = actions.RECEIVE_IDS,
      REQUEST_EXPORT = actions.REQUEST_EXPORT,
      RECEIVE_EXPORT = actions.RECEIVE_EXPORT,
      REQUEST_FAILED = actions.REQUEST_FAILED,
      REQUEST_CANCELLED = actions.REQUEST_CANCELLED,
      TAKE_SNAPSHOT = actions.TAKE_SNAPSHOT,
      SET_ORIGIN = actions.SET_ORIGIN,
      SET_SORT = actions.SET_SORT,
      RESET = actions.RESET,
      HARD_RESET = actions.HARD_RESET,
      SET_CUSTOM_FORMATS = actions.SET_CUSTOM_FORMATS,
      SET_BIBTEX_MAX_AUTHORS = actions.SET_BIBTEX_MAX_AUTHORS,
      SET_BIBTEX_KEY_FORMAT = actions.SET_BIBTEX_KEY_FORMAT,
      SET_BIBTEX_ABS_MAX_AUTHORS = actions.SET_BIBTEX_ABS_MAX_AUTHORS,
      SET_BIBTEX_ABS_KEY_FORMAT = actions.SET_BIBTEX_ABS_KEY_FORMAT,
      SET_BIBTEX_AUTHOR_CUTOFF = actions.SET_BIBTEX_AUTHOR_CUTOFF,
      SET_BIBTEX_ABS_AUTHOR_CUTOFF = actions.SET_BIBTEX_ABS_AUTHOR_CUTOFF,
      SET_BIBTEX_JOURNAL_FORMAT = actions.SET_BIBTEX_JOURNAL_FORMAT; // format reducer

  var format = function format() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      label: 'BibTeX',
      value: 'bibtex',
      id: '0'
    };
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case SET_FORMAT:
        return action.format;

      default:
        return state;
    }
  };

  var exFormats = _.map(config.export.formats, function (f, idx) {
    return _.extend(f, {
      id: String(idx)
    });
  }); // format collection reducer


  var formats = function formats() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : exFormats;
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case SET_FORMATS:
        return action.formats;

      default:
        return state;
    }
  }; // error messages reducer


  var error = function error() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      hasError: false,
      errorMsg: 'Sorry, something happened during the request. Please try again'
    };
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case SET_HAS_ERROR:
        return _objectSpread(_objectSpread({}, state), {}, {
          hasError: action.hasError
        });

      case SET_ERROR_MSG:
        return _objectSpread(_objectSpread({}, state), {}, {
          errorMsg: action.errorMsg
        });

      default:
        return state;
    }
  }; // exports reducer (main export functionality)


  var exports = function exports() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      isFetching: false,
      output: '',
      progress: 0,
      ids: [],
      sort: 'date desc, bibcode desc',
      count: 0,
      page: 0,
      maxCount: ApiTargets._limits.ExportWidget.default,
      batchSize: ApiTargets._limits.ExportWidget.default,
      ignore: false,
      totalRecs: 0,
      customFormatString: '',
      customFormats: [],
      snapshot: {},
      bibtexKeyFormat: null,
      bibtexMaxAuthors: 0,
      bibtexAuthorCutoff: 200,
      bibtexABSKeyFormat: null,
      bibtexABSMaxAuthors: 0,
      bibtexABSAuthorCutoff: 200,
      bibtexJournalFormat: 1
    };
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case REQUEST_IDS:
        return _objectSpread(_objectSpread({}, state), {}, {
          isFetching: true,
          progress: 0
        });

      case RECEIVE_IDS:
        return _objectSpread(_objectSpread({}, state), {}, {
          isFetching: false,
          progress: 100,
          ids: action.ids
        });

      case SET_TOTAL_RECS:
        return _objectSpread(_objectSpread({}, state), {}, {
          totalRecs: action.totalRecs
        });

      case REQUEST_EXPORT:
        return _objectSpread(_objectSpread({}, state), {}, {
          isFetching: true,
          progress: 0
        });

      case SET_CUSTOM_FORMAT:
        return _objectSpread(_objectSpread({}, state), {}, {
          customFormatString: action.format
        });

      case SET_CUSTOM_FORMATS:
        return _objectSpread(_objectSpread({}, state), {}, {
          customFormats: action.customFormats
        });

      case SET_BIBTEX_MAX_AUTHORS:
        return _objectSpread(_objectSpread({}, state), {}, {
          bibtexMaxAuthors: action.maxAuthors
        });

      case SET_BIBTEX_KEY_FORMAT:
        return _objectSpread(_objectSpread({}, state), {}, {
          bibtexKeyFormat: action.keyFormat
        });

      case SET_BIBTEX_AUTHOR_CUTOFF:
        return _objectSpread(_objectSpread({}, state), {}, {
          bibtexAuthorCutoff: action.payload
        });

      case SET_BIBTEX_ABS_MAX_AUTHORS:
        return _objectSpread(_objectSpread({}, state), {}, {
          bibtexABSMaxAuthors: action.maxAuthors
        });

      case SET_BIBTEX_ABS_KEY_FORMAT:
        return _objectSpread(_objectSpread({}, state), {}, {
          bibtexABSKeyFormat: action.keyFormat
        });

      case SET_BIBTEX_ABS_AUTHOR_CUTOFF:
        return _objectSpread(_objectSpread({}, state), {}, {
          bibtexABSAuthorCutoff: action.payload
        });

      case SET_BIBTEX_JOURNAL_FORMAT:
        return _objectSpread(_objectSpread({}, state), {}, {
          bibtexJournalFormat: action.payload
        });

      case RECEIVE_EXPORT:
        return _objectSpread(_objectSpread({}, state), {}, {
          isFetching: false,
          progress: 100,
          output: action.exports,
          ignore: false
        });

      case REQUEST_FAILED:
        return _objectSpread(_objectSpread({}, state), {}, {
          isFetching: false,
          progress: 0
        });

      case REQUEST_CANCELLED:
        return _objectSpread(_objectSpread({}, state), {}, {
          ignore: true,
          isFetching: false,
          progress: 0,
          output: ''
        });

      case SET_IGNORE:
        return _objectSpread(_objectSpread({}, state), {}, {
          ignore: action.ignore
        });

      case SET_PROGRESS:
        return _objectSpread(_objectSpread({}, state), {}, {
          progress: action.progress
        });

      case SET_BATCH_SIZE:
        return _objectSpread(_objectSpread({}, state), {}, {
          batchSize: action.batchSize
        });

      case SET_COUNT:
        return _objectSpread(_objectSpread({}, state), {}, {
          count: action.count > state.maxCount ? state.maxCount : action.count
        });

      case SET_MAX_COUNT:
        return _objectSpread(_objectSpread({}, state), {}, {
          maxCount: action.maxCount > state.totalRecs ? state.totalRecs : action.maxCount
        });

      case SET_PAGE:
        return _objectSpread(_objectSpread({}, state), {}, {
          page: action.page
        });

      case SET_SORT:
        return _objectSpread(_objectSpread({}, state), {}, {
          sort: action.sort
        });

      case TAKE_SNAPSHOT:
        return _objectSpread(_objectSpread({}, state), {}, {
          snapshot: action.snapshot
        });

      case RESET:
        {
          return _objectSpread(_objectSpread({}, state.snapshot), {}, {
            output: '',
            snapshot: state.snapshot
          });
        }

      default:
        return state;
    }
  }; // main state reducer


  var main = function main() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
      query: {},
      showCloser: true,
      showSlider: true,
      origin: 'results-page',
      showReset: true,
      splitCols: true,
      autoSubmit: false
    };
    var action = arguments.length > 1 ? arguments[1] : undefined;

    switch (action.type) {
      case SET_SHOW_CLOSER:
        return _objectSpread(_objectSpread({}, state), {}, {
          showCloser: action.showCloser
        });

      case SET_QUERY:
        return _objectSpread(_objectSpread({}, state), {}, {
          query: action.query
        });

      case SET_ORIGIN:
        return _objectSpread(_objectSpread({}, state), {}, {
          showCloser: action.origin === 'results-page',
          showSlider: action.origin === 'results-page',
          splitCols: action.origin === 'results-page',
          showReset: action.origin === 'results-page',
          autoSubmit: action.origin !== 'results-page',
          origin: action.origin
        });

      default:
        return state;
    }
  };

  var appReducer = Redux.combineReducers({
    format: format,
    formats: formats,
    error: error,
    exports: exports,
    main: main
  });

  var rootReducer = function rootReducer(state, action) {
    if (action.type === HARD_RESET) {
      state = undefined;
    }

    return appReducer(state, action);
  };

  return rootReducer;
});
