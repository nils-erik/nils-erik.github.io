function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

define(['underscore', '../models/authorAffiliation', '../constants/actionNames', 'filesaver'], function (_, authorAffiliation, ACTIONS) {
  /**
   * Format the data into something the server will accept
   *
   * @param {Array} arr
   * @returns {Array}
   */
  var createSelectedString = function createSelectedString(arr) {
    var out = [];

    _.forEach(arr, function (entry) {
      var val = [];

      if (!entry.selected) {
        return;
      } // get only the selected lastActiveDates


      var selectedDate = _.find(entry.lastActiveDates, {
        selected: true
      });

      selectedDate = selectedDate ? selectedDate.date : ' '; // get the selected affiliations

      var selectedAffiliations = _.filter(entry.affiliations, {
        selected: true
      }); // if no affiliations, then just make a ' ' instead


      if (_.isEmpty(selectedAffiliations)) {
        out.push([entry.author, ' ', selectedDate].join('|'));
      } // pull everything together into a big pipe-delimited string


      _.forEach(selectedAffiliations, function (a) {
        if (!a.selected) {
          return;
        }

        val.push(entry.author);
        val.push(a.name);
        val.push(selectedDate);
        out.push(val.join('|'));
      });
    });

    return out;
  };
  /**
   * insert a value into an array at a certain index, without mutation,
   * returning a new array containing the new value.
   *
   * @param {Array} arr
   * @param {Number} idx
   * @param {*} val
   * @returns {Array} the new array
   */


  var swap = function swap(arr, idx, val) {
    return [].concat(_toConsumableArray(arr.slice(0, idx)), [val], _toConsumableArray(arr.slice(idx + 1)));
  };
  /**
   * reset the current selected states of all the data entries
   *
   * Memoized so that it will only ever calculate the first time it is clicked,
   * after that the result should be cached.
   *
   * @param {Array} data - the current array of data points
   */


  var _reset = _.memoize(function (data) {
    return data.map(function (d, i) {
      return _objectSpread(_objectSpread({}, d), {}, {
        // set this author to be selected (that is default)
        selected: true,
        // for affiliations only the first element is selected
        affiliations: d.affiliations.map(function (a, i) {
          return _objectSpread(_objectSpread({}, a), {}, {
            selected: i === 0
          });
        }),
        // same for last active dates (only first is selected)
        lastActiveDates: d.lastActiveDates.map(function (l, i) {
          return _objectSpread(_objectSpread({}, l), {}, {
            selected: i === 0
          });
        })
      });
    });
  }, function () {
    return 0;
  });
  /**
   * Toggle all the current selected states
   *
   * @param {Array} data - the current array of data points
   * @param {boolean} toggle - flag to toggle entries
   */


  var _toggleAll = _.memoize(function (data, toggle) {
    return data.map(function (d) {
      return _objectSpread(_objectSpread({}, d), {}, {
        selected: toggle,
        affiliations: d.affiliations.map(function (a) {
          return _objectSpread(_objectSpread({}, a), {}, {
            selected: toggle
          });
        }),
        lastActiveDates: d.lastActiveDates.map(function (l, i) {
          return _objectSpread(_objectSpread({}, l), {}, {
            selected: toggle && i === 0
          });
        })
      });
    });
  }, function (data, toggle) {
    return toggle;
  });
  /**
   * This will toggle the selected state the affiliation section of a particular
   * row
   *
   * @param {Array} data - full data set
   * @param {number} affIdx - the id of the affiliation section
   * @param {number} authorIdx - the id of the parent (author) row
   * @param {object} authorData - the parent row data
   * @param {object} innerData - the affiliation data
   * @returns {Array} the new data set with the affiliation section (at index) toggled
   */


  var toggleAffiliationRow = function toggleAffiliationRow(data, affIdx, authorIdx, authorData, innerData) {
    /*
      Take the current affiliations (at index) and swap out the selected one
      for a modified version (toggled).
       The resulting array will be used later as the set of affiliations for the
      new author row.
     */
    var affiliations = swap(data[authorIdx].affiliations, affIdx, _objectSpread(_objectSpread({}, innerData), {}, {
      selected: !innerData.selected
    }));
    /*
      Determine if the entire author row should be selected (far left toggle)
       If any of the affiliations or lastActiveDates are selected, it will
      set the author to be selected as well.
     */

    var selected = _.any(affiliations, {
      selected: true
    }) || _.any(data[authorIdx].lastActiveDates, {
      selected: true
    });
    /*
      TODO: Find a more elegant solution, this is quite expensive
      Take the full data set, and swap out the current author row with a new set
      of data.  The new set will contain our modified (toggled) affiliation data.
       Returns a new (full) set of data
     */


    return swap(data, authorIdx, _objectSpread(_objectSpread({}, authorData), {}, {
      selected: selected,
      affiliations: affiliations
    }));
  };
  /**
   * This will toggle the lastActiveDate section of a particular row.
   *
   * If necessary it will also set the author to be selected/deselected.
   *
   * @param {Array} data - full data set
   * @param {number} dateIdx - the id of the lastActiveDate section
   * @param {number} authorIdx - the id of the parent (author) row
   * @param {object} authorData - the parent row data
   * @param {object} innerData - the affiliation data
   * @returns {Array} the new data set with the lastActiveDate section (at index) toggled
   */


  var toggleLastActiveDateRow = function toggleLastActiveDateRow(data, authorIdx, dateIdx, innerData, authorData) {
    // get the current ON date
    var currentSelectedIdx = _.findIndex(data[authorIdx].lastActiveDates, {
      selected: true
    });
    /*
      Create a new array of lastActiveDates based on the current one.
      Also, flip the one at `dateIdx`.
     */


    var lastActiveDates = swap(data[authorIdx].lastActiveDates, dateIdx, _objectSpread(_objectSpread({}, innerData), {}, {
      selected: !innerData.selected
    })); // Only allow one selected lastActiveDate (functions like radio buttons)

    if (currentSelectedIdx >= 0) {
      lastActiveDates = swap(lastActiveDates, currentSelectedIdx, _objectSpread(_objectSpread({}, lastActiveDates[currentSelectedIdx]), {}, {
        selected: false
      }));
    } // figure out if the whole row (author) should be selected


    var selected = _.any(lastActiveDates, {
      selected: true
    }) || _.any(data[authorIdx].affiliations, {
      selected: true
    });
    /*
      Finally, return a new set of data that has all the old values except for
      any changes done at `authorIdx`.
       The author might have been selected/deselected and a new set of lastActiveDates
      provided.
     */


    return swap(data, authorIdx, _objectSpread(_objectSpread({}, authorData), {}, {
      selected: selected,
      lastActiveDates: lastActiveDates
    }));
  };
  /**
   * Returns a new array of data with the author row at a particular index
   * selected/deselected.
   *
   * It will also determine the selected states of the inner sections and
   * if the parent row is deselected, it will deselect them too.
   *
   * The main data array containing all the author/affiliation information is never
   * mutated.  So we have to swap out values and create new sub-arrays as necessary
   * when changes are needed.
   *
   * @param {Array} data - full data set
   * @param {number} authorIdx - the id of the parent (author) row
   * @param {number} authorData - the parent row data
   * @returns {Array} the new data set with the author row (at index) toggled
   */


  var toggleAuthorRow = function toggleAuthorRow(data, authorIdx, authorData) {
    return swap(data, authorIdx, _objectSpread(_objectSpread({}, authorData), {}, {
      selected: !authorData.selected,
      // flip all the affiliations to false if turning off author
      affiliations: authorData.selected ? data[authorIdx].affiliations.map(function (a) {
        return _objectSpread(_objectSpread({}, a), {}, {
          selected: false
        });
      }) : data[authorIdx].affiliations,
      // same here with active dates (flip them all off)
      lastActiveDates: authorData.selected ? data[authorIdx].lastActiveDates.map(function (l) {
        return _objectSpread(_objectSpread({}, l), {}, {
          selected: false
        });
      }) : data[authorIdx].lastActiveDates
    }));
  };
  /**
   * Based on the format string, determine the file type
   *
   * @param {string} formatString - the format to be parsed
   * @returns {{ext:string, type:string}} extension and file type
   */


  var getFileType = function getFileType(formatString) {
    var type = /\[(.*)]/.exec(formatString);

    switch (type[1]) {
      case 'csv':
        return {
          ext: 'csv',
          type: 'text/csv'
        };

      case 'excel':
        return {
          ext: 'xls',
          type: 'application/vnd.ms-excel'
        };

      case 'browser':
        return {
          ext: 'browser',
          type: 'text/plain'
        };

      default:
        return {
          ext: 'txt',
          type: 'text/plain'
        };
    }
  };
  /**
   * Open the raw output in a new window/tab
   *
   * @param {string} data - raw data to be written
   */


  var openInNewTab = function openInNewTab(data) {
    var win = window.open();
    win.document.write(data);
    win.focus();
  };

  var actions = {
    /**
     * Reset the store to initial values
     */
    appReset: function appReset() {
      return function (dispatch) {
        return dispatch({
          type: ACTIONS.appReset
        });
      };
    },

    /**
     * Reset the current data set
     */
    reset: function reset() {
      return function (dispatch, getState) {
        var _getState = getState(),
            data = _getState.data;

        dispatch({
          type: ACTIONS.setData,
          value: _reset(data)
        });
      };
    },

    /**
     * Toggle all of the current authors/affilations/lastActiveDates and update
     * the current data set
     */
    toggleAll: function toggleAll() {
      return function (dispatch, getState) {
        var _getState2 = getState(),
            data = _getState2.data,
            toggle = _getState2.toggle;

        dispatch({
          type: ACTIONS.setData,
          value: _toggleAll(data, toggle)
        });
        dispatch({
          type: ACTIONS.setToggle
        });
      };
    },

    /**
     * Normalizing the raw data from the server.  This will group the data by
     * authorName and the create a new row for each grouping.
     *
     * @param {array} data - the raw data from the server
     */
    setAffiliationData: function setAffiliationData(data) {
      return function (dispatch) {
        data = _(data).groupBy('authorName').map(function (affs, author) {
          return authorAffiliation.create(author, affs);
        }).value();
        dispatch({
          type: ACTIONS.setData,
          value: data
        });
      };
    },

    /**
     * Close the widget
     */
    closeWidget: function closeWidget() {
      return function (dispatch, getState, widget) {
        widget.closeWidget();
      };
    },

    /**
     * Show a message with a timeout
     *
     * @param {string} [type='success'] - the type of alert
     * @param {string} [message=''] - the message
     * @param {number} [timeout=5000] - the timeout of the alert
     */
    showMessage: function showMessage() {
      var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'success';
      var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5000;
      return function (dispatch, getState) {
        if (timeout !== 0) {
          _.delay(function () {
            dispatch({
              type: ACTIONS.setMessage,
              value: {
                show: false
              }
            });
            dispatch({
              type: ACTIONS.setShowReload,
              value: false
            });
          }, timeout);
        } // don't show the button if it's an export error


        if (!getState().exporting) {
          dispatch({
            type: ACTIONS.setShowReload,
            value: type === 'danger'
          });
        }

        dispatch({
          type: ACTIONS.setMessage,
          value: {
            type: type,
            message: message,
            show: true
          }
        });
      };
    },
    _reload: _.debounce(function (getState, widget) {
      var ids = getState().ids;
      widget.fetchAffiliationData(ids);
    }, 500),
    reload: function reload() {
      return function (dispatch, getState, widget) {
        actions._reload(getState, widget);
      };
    },
    updateYear: function updateYear(year) {
      return function (dispatch, getState, widget) {
        var state = getState();

        try {
          year = Number(year);
        } catch (e) {
          year = state.year;
        } // set the new year


        dispatch({
          type: ACTIONS.setYear,
          value: year
        }); // restart the search

        widget.fetchAffiliationData(state.ids, year, state.author);
      };
    },
    updateAuthor: function updateAuthor(author) {
      return function (dispatch, getState, widget) {
        var state = getState();

        try {
          author = Number(author);
        } catch (e) {
          author = state.author;
        } // update the number of authors


        dispatch({
          type: ACTIONS.setAuthor,
          value: author
        }); // fetch data

        widget.fetchAffiliationData(state.ids, state.year, author);
      };
    }
  };
  /**
   * Toggle a particular selection.  This will be dispatched when a user selects
   * a checkbox/radio on the ui.  We need to figure out if the user is selecting
   * a parent element or a child element, in the latter case, we will need to do
   * additional work to make sure that the parent element is toggled accordingly.
   *
   * @param authorData
   * @param innerData
   */

  actions.toggleSelection = function (authorData, innerData) {
    return function (dispatch, getState) {
      var _getState3 = getState(),
          data = _getState3.data;

      var affIdx = -1;
      var dateIdx = -1;
      var newData = []; // find the author index

      var authorIdx = _.indexOf(data, authorData); // if true, we are inside a child element, update indexes


      if (innerData) {
        affIdx = _.indexOf(authorData.affiliations, innerData);
        dateIdx = _.indexOf(authorData.lastActiveDates, innerData);
      } // if an index is found for the innerData, run the toggle method for that section


      if (affIdx >= 0) {
        newData = toggleAffiliationRow(data, affIdx, authorIdx, authorData, innerData);
      } else if (dateIdx >= 0) {
        newData = toggleLastActiveDateRow(data, authorIdx, dateIdx, innerData, authorData);
      } else if (authorIdx >= 0) {
        newData = toggleAuthorRow(data, authorIdx, authorData);
      } else {
        newData = data;
      } // update the state with the new data set, which will update the table on the ui


      dispatch({
        type: ACTIONS.setData,
        value: newData
      });
    };
  };
  /**
   * Perform the export, this will depend on the export format that was chosen
   * by the user.
   */


  actions.doExport = function () {
    return function (dispatch, getState, widget) {
      var _getState4 = getState(),
          data = _getState4.data,
          format = _getState4.format; // get the file extension and type


      var file = getFileType(format); // start export loading

      dispatch({
        type: ACTIONS.setExporting,
        value: true
      }); // do the actual export using the method on the widget

      widget.exportAffiliationData({
        selected: createSelectedString(data),
        format: format
      }) // after the export, decide how to show/download the data
      .done(function (res) {
        // if browser, then open a new tab and show message if it's blocked
        if (file.ext === 'browser') {
          res.text().then(function (t) {
            return openInNewTab(t);
          });
          dispatch(actions.showMessage('info', "If new tab doesn't appear, you will need to allow popups"));
        } else {
          res.blob().then(function (b) {
            return saveAs(b, "authorAffiliations.".concat(file.ext));
          }); // show a message about successful download

          dispatch(actions.showMessage('success', 'Export Successful!'));
        }
      }) // on failure, show error message
      .fail(function () {
        actions.showMessage('danger', 'Something happened with the request, please try again');
      }) // always stop loading
      .always(function () {
        return dispatch({
          type: ACTIONS.setExporting,
          value: false
        });
      });
      actions.showMessage('info', 'Exporting...');
    };
  };

  return actions;
});
