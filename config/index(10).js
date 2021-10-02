/**
 * Main collection point for all the actions
 */
define(['underscore', 'jquery', 'js/components/api_query', 'js/components/api_targets', 'filesaver'], function (_, $, ApiQuery, ApiTargets) {
  // set of action names
  var actions = {
    SET_TAB: 'SET_TAB',
    SET_QUERY: 'SET_QUERY',
    SET_FORMAT: 'SET_FORMAT',
    SET_FORMATS: 'SET_FORMATS',
    SET_CUSTOM_FORMAT: 'SET_CUSTOM_FORMAT',
    SET_PROGRESS: 'SET_PROGRESS',
    SET_COUNT: 'SET_COUNT',
    SET_IGNORE: 'SET_IGNORE',
    SET_HAS_ERROR: 'SET_HAS_ERROR',
    SET_ERROR_MSG: 'SET_ERROR_MSG',
    SET_MAX_COUNT: 'SET_MAX_COUNT',
    SET_TOTAL_RECS: 'SET_TOTAL_RECS',
    SET_SHOW_CLOSER: 'SET_SHOW_CLOSER',
    SET_PAGE: 'SET_PAGE',
    SET_SORT: 'SET_SORT',
    SET_BATCH_SIZE: 'SET_BATCH_SIZE',
    TAKE_SNAPSHOT: 'TAKE_SNAPSHOT',
    RESET: 'RESET',
    HARD_RESET: 'HARD_RESET',
    REQUEST_IDS: 'REQUEST_IDS',
    RECEIVE_IDS: 'RECEIVE_IDS',
    REQUEST_EXPORT: 'REQUEST_EXPORT',
    RECEIVE_EXPORT: 'RECEIVE_EXPORT',
    REQUEST_FAILED: 'REQUEST_FAILED',
    REQUEST_CANCELLED: 'REQUEST_CANCELLED',
    SET_ORIGIN: 'SET_ORIGIN',
    SET_CUSTOM_FORMATS: 'SET_CUSTOM_FORMATS',
    SET_BIBTEX_KEY_FORMAT: 'SET_BIBTEX_KEY_FORMAT',
    SET_BIBTEX_MAX_AUTHORS: 'SET_BIBTEX_MAX_AUTHORS',
    SET_BIBTEX_ABS_KEY_FORMAT: 'SET_BIBTEX_ABS_KEY_FORMAT',
    SET_BIBTEX_ABS_MAX_AUTHORS: 'SET_BIBTEX_ABS_MAX_AUTHORS',
    SET_BIBTEX_AUTHOR_CUTOFF: 'SET_BIBTEX_AUTHOR_CUTOFF',
    SET_BIBTEX_ABS_AUTHOR_CUTOFF: 'SET_BIBTEX_ABS_AUTHOR_CUTOFF',
    SET_BIBTEX_JOURNAL_FORMAT: 'SET_BIBTEX_JOURNAL_FORMAT'
  };

  actions.setTab = function (tab) {
    return {
      type: actions.SET_TAB,
      tab: tab
    };
  };

  actions.setFormat = function (format) {
    return {
      type: actions.SET_FORMAT,
      format: format
    };
  };

  actions.setFormats = function (formats) {
    return {
      type: actions.SET_FORMATS,
      formats: formats
    };
  };

  actions.setCustomFormat = function (format) {
    return {
      type: actions.SET_CUSTOM_FORMAT,
      format: format
    };
  };

  actions.setProgress = function (progress) {
    return {
      type: actions.SET_PROGRESS,
      progress: progress
    };
  };

  actions.setTotalRecs = function (totalRecs) {
    return {
      type: actions.SET_TOTAL_RECS,
      totalRecs: totalRecs
    };
  };

  actions.setShowCloser = function (showCloser) {
    return {
      type: actions.SET_SHOW_CLOSER,
      showCloser: showCloser
    };
  };

  actions.requestIds = function () {
    return {
      type: actions.REQUEST_IDS
    };
  };

  actions.receiveIds = function (ids) {
    return {
      type: actions.RECEIVE_IDS,
      ids: ids
    };
  };

  actions.requestExport = function () {
    return {
      type: actions.REQUEST_EXPORT
    };
  };

  actions.receiveExport = function (exports) {
    return {
      type: actions.RECEIVE_EXPORT,
      exports: exports
    };
  };

  actions.setBatchSize = function (batchSize) {
    return {
      type: actions.SET_BATCH_SIZE,
      batchSize: batchSize
    };
  };

  actions.setQuery = function (query) {
    return {
      type: actions.SET_QUERY,
      query: query
    };
  };

  actions.setCount = function (count) {
    return {
      type: actions.SET_COUNT,
      count: count
    };
  };

  actions.setMaxCount = function (maxCount) {
    return {
      type: actions.SET_MAX_COUNT,
      maxCount: maxCount
    };
  };

  actions.cancelRequest = function () {
    return {
      type: actions.REQUEST_CANCELLED
    };
  };

  actions.setIgnore = function (ignore) {
    return {
      type: actions.SET_IGNORE,
      ignore: ignore
    };
  };

  actions.setHasError = function (hasError) {
    return {
      type: actions.SET_HAS_ERROR,
      hasError: hasError
    };
  };

  actions.setErrorMsg = function (errorMsg) {
    return {
      type: actions.SET_ERROR_MSG,
      errorMsg: errorMsg
    };
  };

  actions.setPage = function (page) {
    return {
      type: actions.SET_PAGE,
      page: page
    };
  };

  actions.setSort = function (sort) {
    return {
      type: actions.SET_SORT,
      sort: sort
    };
  };

  actions.reset = function () {
    return {
      type: actions.RESET
    };
  };

  actions.hardReset = function () {
    return {
      type: actions.HARD_RESET
    };
  };

  actions.setOrigin = function (origin) {
    return {
      type: actions.SET_ORIGIN,
      origin: origin
    };
  };

  actions.setCustomFormats = function (customFormats) {
    return {
      type: actions.SET_CUSTOM_FORMATS,
      customFormats: customFormats
    };
  };

  actions.setBibtexMaxAuthors = function (maxAuthors) {
    return {
      type: actions.SET_BIBTEX_MAX_AUTHORS,
      maxAuthors: maxAuthors
    };
  };

  actions.setBibtexKeyFormat = function (keyFormat) {
    return {
      type: actions.SET_BIBTEX_KEY_FORMAT,
      keyFormat: keyFormat
    };
  };

  actions.setBibtexABSMaxAuthors = function (maxAuthors) {
    return {
      type: actions.SET_BIBTEX_ABS_MAX_AUTHORS,
      maxAuthors: maxAuthors
    };
  };

  actions.setBibtexABSKeyFormat = function (keyFormat) {
    return {
      type: actions.SET_BIBTEX_ABS_KEY_FORMAT,
      keyFormat: keyFormat
    };
  };

  actions.setBibtexAuthorCutoff = function (payload) {
    return {
      type: actions.SET_BIBTEX_AUTHOR_CUTOFF,
      payload: payload
    };
  };

  actions.setBibtexABSAuthorCutoff = function (payload) {
    return {
      type: actions.SET_BIBTEX_ABS_AUTHOR_CUTOFF,
      payload: payload
    };
  };

  actions.setBibtexJournalFormat = function (payload) {
    return {
      type: actions.SET_BIBTEX_JOURNAL_FORMAT,
      payload: payload
    };
  };
  /**
   * On request failure, we want to display a message to the user here
   *
   * @param args
   */


  actions.requestFailed = function () {
    return function (dispatch) {
      var setHasError = actions.setHasError;
      dispatch(setHasError(true));
      dispatch({
        type: 'REQUEST_FAILED'
      });
    };
  };
  /**
   * Update the selected format
   *
   * @param {string} format - the selected format
   */


  actions.findAndSetFormat = function (format) {
    return function (dispatch, getState) {
      var _getState = getState(),
          formats = _getState.formats;

      var found = _.find(formats, {
        value: format
      });

      dispatch(actions.setFormat(found || formats[0]));
    };
  };
  /**
   * Fetch ids using a query
   *
   * @returns {$.Promise} the request promise
   */


  actions.fetchUsingQuery = function () {
    return function (dispatch, getState, widget) {
      var _getState2 = getState(),
          exports = _getState2.exports,
          main = _getState2.main;

      var composeRequest = widget.composeRequest;
      var requestIds = actions.requestIds,
          receiveIds = actions.receiveIds,
          requestFailed = actions.requestFailed,
          setTotalRecs = actions.setTotalRecs,
          setHasError = actions.setHasError,
          setSort = actions.setSort; // create a new query from the serialized params

      var query = new ApiQuery(main.query);
      query.set({
        // use a specific count, if it's less than the default batchSize
        rows: exports.count < exports.batchSize ? exports.count : exports.batchSize,
        fl: 'bibcode',
        // start at the maxCount - batchSize, to get a particular window
        start: exports.maxCount - exports.batchSize
      });
      dispatch(setHasError(false)); // start requesting ids

      dispatch(requestIds());
      var req = composeRequest(query); // execute the actual request

      var prom = widget._executeApiRequest(req);

      prom.then(function (res) {
        // pull out only the bibcodes
        var ids = _.map(res.get('response.docs'), 'bibcode');

        var sort = res.get('responseHeader.params.sort', false, 'date desc'); // update the ids on the state

        dispatch(receiveIds(ids)); // get the sort from the query

        dispatch(setSort(sort)); // set the total recs to based on the number of ids found

        dispatch(setTotalRecs(res.get('response.numFound')));
      }); // on failure, dispatch our handler

      prom.fail(function () {
        return dispatch(requestFailed.apply(void 0, arguments));
      });
      return prom;
    };
  };
  /**
   * Fetch using ids, this will set up a request and fetch a request using
   * identifiers and some other information.
   */


  actions.fetchUsingIds = function (isLibrary) {
    return function (dispatch, getState, widget) {
      var requestExport = actions.requestExport,
          receiveExport = actions.receiveExport,
          requestFailed = actions.requestFailed,
          setIgnore = actions.setIgnore,
          setHasError = actions.setHasError;
      var composeRequest = widget.composeRequest;

      var _getState3 = getState(),
          format = _getState3.format,
          exports = _getState3.exports;

      dispatch(setHasError(false)); // starting an export

      dispatch(requestExport()); // get the current count, which the user selected

      var count = exports.count < exports.batchSize ? exports.count : exports.batchSize;
      var start = exports.maxCount - exports.batchSize; // only grab the first n records

      var ids = isLibrary ? exports.ids.slice(start, start + count) : _.take(exports.ids, count); // setting up a new query using our current ids

      var q = new ApiQuery();
      q.set('bibcode', ids);
      q.set('sort', exports.sort);

      if (format.value === 'custom' && exports.customFormatString.length > 0) {
        q.set('format', exports.customFormatString);
      } else if (format.value === 'custom' && exports.customFormatString.length <= 0) {
        // send back an empty response
        return $.Deferred().resolve().promise().then(function () {
          dispatch(receiveExport(''));
        });
      } else if (format.value === 'bibtex') {
        if (exports.bibtexKeyFormat) {
          q.set('keyformat', exports.bibtexKeyFormat);
        } // set maxauthor, convert it to number first


        q.set('maxauthor', +exports.bibtexMaxAuthors);
        q.set('authorcutoff', +exports.bibtexAuthorCutoff);
        q.set('journalformat', exports.bibtexJournalFormat);
      } else if (format.value === 'bibtexabs') {
        if (exports.bibtexABSKeyFormat) {
          q.set('keyformat', exports.bibtexABSKeyFormat);
        } // set maxauthor, convert it to number first


        q.set('maxauthor', +exports.bibtexABSMaxAuthors);
        q.set('authorcutoff', +exports.bibtexABSAuthorCutoff);
        q.set('journalformat', exports.bibtexJournalFormat);
      } else if (format.value === 'aastex') {
        q.set('journalformat', exports.bibtexJournalFormat);
      }

      var req = composeRequest(q);
      req.set({
        target: ApiTargets.EXPORT + format.value,
        options: {
          type: 'POST',
          contentType: 'application/json'
        }
      }); // send off the request

      return widget._executeApiRequest(req).done(function (res) {
        // if we are ignoring, then don't bother with the response
        if (!exports.ignore) {
          dispatch(receiveExport(res.get('export')));
        } // stop ignoring


        dispatch(setIgnore(false));
      }) // on failure, send off to our handler
      .fail(function () {
        return dispatch(requestFailed.apply(void 0, arguments));
      });
    };
  };
  /**
   * Get the next batch of records
   */


  actions.getNextBatch = function () {
    return function (dispatch, getState) {
      var setMaxCount = actions.setMaxCount,
          setBatchSize = actions.setBatchSize,
          setCount = actions.setCount,
          fetchUsingQuery = actions.fetchUsingQuery,
          fetchUsingIds = actions.fetchUsingIds;

      var _getState4 = getState(),
          exports = _getState4.exports; // get the total, based on the max count and our batchsize


      var max = exports.maxCount + exports.batchSize; // if that total is greater than the amount of records, we have to adjust it

      if (max > exports.totalRecs) {
        // reset the batch size to be the total records minus our max
        var batch = exports.totalRecs - exports.maxCount; // count is the current lower value (i.e. <count> of <maxCount>)
        // the next batch will be smaller than (maxCount - count)

        var count = exports.count < batch ? exports.count : batch; // max is the current upper value + the batch value, should be same as totalRecs

        max = exports.maxCount + batch;
        dispatch(setBatchSize(batch));
        dispatch(setCount(count));
      }

      dispatch(setMaxCount(max)); // check if we are in a library (been given all of our ids)

      if (exports.ids.length === exports.totalRecs) {
        dispatch(fetchUsingIds(true));
      } else {
        dispatch(fetchUsingQuery()).done(function () {
          return dispatch(fetchUsingIds());
        });
      }
    };
  };
  /**
   * Take a snapshot of the current state of the application
   *
   * We can use this in conjunction with reset, to reset back to an earlier state
   *
   * @param {object} snapshot - the current state
   */


  actions.takeSnapshot = function () {
    return function (dispatch, getState) {
      var snapshot = _.omit(getState().exports, 'snapshot');

      dispatch({
        type: actions.TAKE_SNAPSHOT,
        snapshot: snapshot
      });
    };
  };
  /**
   * Close the component using the widget method
   * also resets the widget so it's not in a weird state
   */


  actions.closeComponent = function () {
    return function (dispatch, getState, widget) {
      dispatch(actions.hardReset());
      widget.closeWidget();
    };
  };
  /**
   * Download the export string as a text file
   */


  actions.downloadFile = function () {
    return function (dispatch, getState) {
      var state = getState();
      var blob = new Blob([state.exports.output], {
        type: 'text/plain;charset=utf-8'
      }); // save Blob to file, passing true to not automatically add BOM

      saveAs(blob, "export-".concat(state.format.value, ".").concat(state.format.ext), true);
    };
  };

  return actions;
});
