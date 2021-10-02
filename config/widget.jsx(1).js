define(['jquery', 'underscore', 'backbone', 'react', 'react-redux', 'react-dom', 'redux', 'redux-thunk', 'js/components/api_targets', 'js/components/api_query', 'js/components/api_request', 'js/widgets/base/base_widget', './containers/App.jsx', './constants/actionNames', './actions/index', './reducers/index'], function ($, _, Backbone, React, ReactRedux, ReactDOM, Redux, ReduxThunk, ApiTargets, ApiQuery, ApiRequest, BaseWidget, App, ACTIONS, actions, reducers) {
  /**
   * Main entry point
   * this is where react will take over control of the view
   */
  var View = Backbone.View.extend({
    initialize: function initialize(options) {
      _.assign(this, options);
    },
    render: function render() {
      ReactDOM.render( /*#__PURE__*/React.createElement(ReactRedux.Provider, {
        store: this.store
      }, /*#__PURE__*/React.createElement(App, null)), this.el);
      return this;
    },
    destroy: function destroy() {
      ReactDOM.unmountComponentAtNode(this.el);
    }
  });
  var Widget = BaseWidget.extend({
    /**
     * Initialize the widget
     */
    initialize: function initialize() {
      // setup the thunk middleware
      var middleware = Redux.applyMiddleware(ReduxThunk.default.withExtraArgument(this)); // add redux devtools extension hook (safe for production)

      var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose; // setup the store

      this.store = Redux.createStore(reducers, composeEnhancers(middleware)); // create the view, passing in store

      this.view = new View({
        store: this.store
      });
    },

    /**
     * Activate the widget
     *
     * @param {object} beehive
     */
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      this.activateWidget();
    },

    /**
     * Take the current query object and fetch corresponding affiliation data
     *
     * @param {object} currentQuery
     */
    renderWidgetForCurrentQuery: function renderWidgetForCurrentQuery(_ref) {
      var _this = this;

      var currentQuery = _ref.currentQuery;
      var pubsub = this.getPubSub(); // reset on load

      this.store.dispatch(actions.appReset()); // do nothing if we don't get a query

      if (currentQuery) {
        var q = currentQuery.clone();
        q.unlock(); // get the first 1000 rows

        q.set('rows', 1000);
        q.set('fl', 'bibcode');
        var req = this.composeRequest(q);
        req.set('options', {
          // extract ids
          done: function done(res) {
            var ids = _.map(res.response.docs, 'bibcode');

            _this.fetchAffiliationData(ids);
          },
          // handle errors
          fail: function fail() {
            return _this.onError();
          },
          // stop loading after this either way
          always: function always() {
            _this.store.dispatch({
              type: ACTIONS.setLoading,
              value: false
            });
          }
        });
        pubsub.publish(pubsub.EXECUTE_REQUEST, req);
        this.store.dispatch({
          type: ACTIONS.fetchData
        });
      }
    },

    /**
     * Take an array of ids and fetch corresponding affiliation data
     *
     * @param {Array} ids
     * @returns {*}
     */
    renderWidgetForListOfBibcodes: function renderWidgetForListOfBibcodes(ids) {
      // reset on load
      this.store.dispatch(actions.appReset());
      return this.fetchAffiliationData(ids);
    },

    /**
     * Take an array of ids and fetch affiliation data about them
     * this will actually make the request
     *
     * @param {Array} [ids=[]] ids - the list of identifiers
     * @param {number} [numyears=4] numyears - the years to go back
     * @param {number} [maxauthor=4] maxauthor - max number of authors to list
     */
    fetchAffiliationData: function fetchAffiliationData() {
      var _this2 = this;

      var ids = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var numyears = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;
      var maxauthor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3;
      var pubsub = this.getPubSub();
      var $dd = $.Deferred(); // start loading (pending) action

      this.store.dispatch({
        type: ACTIONS.fetchData,
        value: ids
      });
      var req = new ApiRequest({
        target: ApiTargets.AUTHOR_AFFILIATION_SEARCH,
        query: new ApiQuery({
          bibcode: ids,
          numyears: numyears,
          maxauthor: maxauthor
        }),
        options: {
          type: 'post',
          processData: false,
          dataType: 'json',
          contentType: 'application/json',
          done: function done() {
            return $dd.resolve.apply($dd, arguments);
          },
          fail: function fail() {
            return $dd.reject.apply($dd, arguments);
          },
          always: function always() {
            return $dd.always.apply($dd, arguments);
          }
        }
      }); // when done set the data into the store

      $dd.done(function (data) {
        try {
          _this2.store.dispatch(actions.setAffiliationData(data.data));
        } catch (e) {
          console.error(e);
        }
      }); // handle errors

      $dd.fail(function () {
        return _this2.onError();
      }); // stop loading either way

      $dd.always(function () {
        return _this2.store.dispatch({
          type: ACTIONS.setLoading,
          value: false
        });
      });
      pubsub.publish(pubsub.EXECUTE_REQUEST, req);
      return $dd.promise();
    },

    /**
     * Export the current data
     *
     * @param {object} data
     */
    exportAffiliationData: function exportAffiliationData(data) {
      var _this3 = this;

      var pubsub = this.getPubSub();
      var $dd = $.Deferred();
      var req = new ApiRequest({
        target: ApiTargets.AUTHOR_AFFILIATION_EXPORT,
        query: new ApiQuery(),
        options: {
          useFetch: true,
          fetchOptions: {
            body: JSON.stringify(data),
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          },
          done: function done() {
            return $dd.resolve.apply($dd, arguments);
          },
          fail: function fail() {
            return $dd.reject.apply($dd, arguments);
          },
          always: function always() {
            return $dd.always.apply($dd, arguments);
          }
        }
      }); // handle errors

      $dd.fail(function () {
        return _this3.onError();
      }); // stop loading either way

      $dd.always(function () {
        return _this3.store.dispatch({
          type: ACTIONS.setLoading,
          value: false
        });
      });
      pubsub.publish(pubsub.EXECUTE_REQUEST, req);
      return $dd.promise();
    },

    /**
     * Close the widget
     */
    closeWidget: function closeWidget() {
      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.NAVIGATE, 'results-page');
    },

    /**
     * Show an error message
     */
    onError: function onError() {
      var dispatch = this.store.dispatch;
      dispatch(actions.showMessage('danger', 'Something happened during the request, please try again', 0));
    }
  });
  return Widget;
});
