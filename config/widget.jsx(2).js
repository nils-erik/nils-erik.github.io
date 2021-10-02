define(['jquery', 'underscore', 'backbone', 'react', 'react-dom', 'redux', 'react-redux', 'redux-thunk', 'js/widgets/base/base_widget', './reducers/index', './actions/index', './containers/App.jsx', 'js/components/api_query', 'js/components/api_targets', 'js/components/api_feedback', 'js/widgets/config'], function ($, _, Backbone, React, ReactDOM, Redux, ReactRedux, ReduxThunk, BaseWidget, reducers, actions, App, ApiQuery, ApiTargets, ApiFeedback, config) {
  var View = Backbone.View.extend({
    /**
     * Initialize the view
     *
     * @param {object} options - view options
     */
    initialize: function initialize(options) {
      // provide this with all the options passed in
      _.assign(this, options);
    },

    /**
     * Renders the React view
     *
     * @returns {View}
     */
    render: function render() {
      // create provider component, that passes the store to <App>
      ReactDOM.render( /*#__PURE__*/React.createElement(ReactRedux.Provider, {
        store: this.store
      }, /*#__PURE__*/React.createElement(App, null)), this.el);
      return this;
    },
    destroy: function destroy() {
      // on destroy, make sure the React DOM is unmounted
      ReactDOM.unmountComponentAtNode(this.el);
    }
  });
  var Widget = BaseWidget.extend({
    /**
     * initialize the object
     *
     * @param {object} options - the widget options
     */
    initialize: function initialize(options) {
      this.options = options || {}; // create thunk middleware, passing in `this` as extra argument

      var middleware = Redux.applyMiddleware(ReduxThunk.default.withExtraArgument(this)); // create the redux store using reducers and applying middleware

      var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
      this.store = Redux.createStore(reducers, composeEnhancers(middleware)); // create the view passing the store as the only property

      this.view = new View({
        store: this.store
      });
      this.defaultFormat = 'BibTeX';
      this.customFormats = [];
      this.bibtexKeyFormat = null;
      this.bibtexMaxAuthors = 0;
      this.bibtexABSKeyFormat = null;
      this.bibtexABSMaxAuthors = 0;
      this.bibtexAuthorCutoff = 200;
      this.bibtexABSAuthorCutoff = 200;
      this.bibtexJournalFormat = 1;
    },

    /**
     * Activate the widget
     *
     * @param {Beehive} beehive - the application beehive object
     */
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      var dispatch = this.store.dispatch;
      var setQuery = actions.setQuery;
      this.activateWidget();
      pubsub.subscribe(pubsub.INVITING_REQUEST, function (query) {
        return dispatch(setQuery(query.toJSON()));
      });
      this.attachGeneralHandler(this.onApiFeedback);
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, _.bind(this.getFieldsFromUserData, this));
    },

    /**
     * Handle errors from api requests
     *
     * Show error messages, stop other operations, etc.
     *
     * @param {ApiFeedback} feedback - the feedback object
     */
    onApiFeedback: function onApiFeedback(feedback) {
      this.store.dispatch(actions.requestFailed(feedback));
    },
    getUserData: function getUserData() {
      try {
        var beehive = _.isFunction(this.getBeeHive) && this.getBeeHive();
        var user = _.isFunction(beehive.getObject) && beehive.getObject('User');

        if (_.isPlainObject(user)) {
          return _.isFunction(user.getUserData) && user.getUserData('USER_DATA');
        }
      } catch (e) {}

      return {};
    },
    getFieldsFromUserData: function getFieldsFromUserData() {
      var _this = this;

      var userData = this.getUserData();
      return _.reduce(['defaultExportFormat', 'customFormats', 'bibtexKeyFormat', 'bibtexMaxAuthors', 'bibtexABSKeyFormat', 'bibtexABSMaxAuthors', 'bibtexAuthorCutoff', 'bibtexABSAuthorCutoff', 'bibtexJournalFormat'], function (acc, prop) {
        var value = _.has(userData, prop) ? userData[prop] : _this[prop];

        if (prop === 'defaultExportFormat') {
          var v = _.find(config.export.formats, {
            label: value
          });

          acc[prop] = v ? v.value : config.export.formats[0];
        } else {
          acc[prop] = value;
        }

        _this[prop] = value;
        return acc;
      }, {});
    },
    getJournalFormatValue: function getJournalFormatValue(format) {
      switch (format) {
        case 'Use AASTeX macros':
          return 1;

        case 'Use Journal Abbreviations':
          return 2;

        case 'Use Full Journal Name':
          return 3;

        default:
          return 1;
      }
    },

    /**
     * Called from navigator when the widget is needed to get the bibcodes to
     * use for the export.  This will be used as an interaction point to the
     * redux store only.
     *
     * @param {ApiQuery} currentQuery - the current query
     * @param {number} numFound - the amount of records found
     * @param {string} format - the export format
     */
    renderWidgetForCurrentQuery: function renderWidgetForCurrentQuery(_ref) {
      var currentQuery = _ref.currentQuery,
          numFound = _ref.numFound,
          format = _ref.format;
      var dispatch = this.store.dispatch;
      var fetchUsingQuery = actions.fetchUsingQuery,
          fetchUsingIds = actions.fetchUsingIds,
          findAndSetFormat = actions.findAndSetFormat,
          hardReset = actions.hardReset,
          setCount = actions.setCount,
          setQuery = actions.setQuery,
          setTotalRecs = actions.setTotalRecs,
          takeSnapshot = actions.takeSnapshot,
          setOrigin = actions.setOrigin,
          setCustomFormats = actions.setCustomFormats,
          setBibtexKeyFormat = actions.setBibtexKeyFormat,
          setBibtexMaxAuthors = actions.setBibtexMaxAuthors,
          setBibtexABSKeyFormat = actions.setBibtexABSKeyFormat,
          setBibtexABSMaxAuthors = actions.setBibtexABSMaxAuthors,
          setBibtexAuthorCutoff = actions.setBibtexAuthorCutoff,
          setBibtexABSAuthorCutoff = actions.setBibtexABSAuthorCutoff,
          setBibtexJournalFormat = actions.setBibtexJournalFormat;

      var _this$getFieldsFromUs = this.getFieldsFromUserData(),
          customFormats = _this$getFieldsFromUs.customFormats,
          defaultFormat = _this$getFieldsFromUs.defaultFormat,
          bibtexMaxAuthors = _this$getFieldsFromUs.bibtexMaxAuthors,
          bibtexKeyFormat = _this$getFieldsFromUs.bibtexKeyFormat,
          bibtexABSMaxAuthors = _this$getFieldsFromUs.bibtexABSMaxAuthors,
          bibtexABSKeyFormat = _this$getFieldsFromUs.bibtexABSKeyFormat,
          bibtexAuthorCutoff = _this$getFieldsFromUs.bibtexAuthorCutoff,
          bibtexABSAuthorCutoff = _this$getFieldsFromUs.bibtexABSAuthorCutoff,
          bibtexJournalFormat = _this$getFieldsFromUs.bibtexJournalFormat;

      var fmt = format === 'default' || format === 'other' ? defaultFormat : format; // perform a full reset of the store

      dispatch(hardReset());
      dispatch(setCustomFormats(customFormats));
      dispatch(setBibtexMaxAuthors(bibtexMaxAuthors));
      dispatch(setBibtexABSMaxAuthors(bibtexABSMaxAuthors));
      dispatch(setBibtexKeyFormat(bibtexKeyFormat));
      dispatch(setBibtexABSKeyFormat(bibtexABSKeyFormat));
      dispatch(setBibtexAuthorCutoff(bibtexAuthorCutoff));
      dispatch(setBibtexABSAuthorCutoff(bibtexABSAuthorCutoff));
      dispatch(setBibtexJournalFormat(this.getJournalFormatValue(bibtexJournalFormat))); // set the origin of the request (abstract/results/etc.)

      dispatch(setOrigin(this.componentParams && this.componentParams.origin)); // set the current query

      dispatch(setQuery(currentQuery.toJSON())); // set the current format

      dispatch(findAndSetFormat(format)); // set the current count

      dispatch(setCount(numFound)); // set the total number of records we are exporting

      dispatch(setTotalRecs(numFound)); // if a format is selected, then we can start an actual export

      if (fmt !== 'other') {
        // take a snapshot of the state
        dispatch(takeSnapshot()); // fetch identifiers using our query

        dispatch(fetchUsingQuery()) // then use the ids to fetch the export string
        .then(function () {
          return dispatch(fetchUsingIds()) // take another snapshot
          .always(function () {
            return dispatch(takeSnapshot());
          });
        });
      } else {
        // take a snapshot if no export is selected
        dispatch(takeSnapshot());
      }
    },

    /**
     * Close the widget
     */
    closeWidget: function closeWidget() {
      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.NAVIGATE, 'results-page');
    },

    /**
     * Execute an api request, this will open up a new request and subscribe to
     * the response.
     *
     * @param {ApiRequest} req - request object
     * @returns {$.Promise} promise
     * @private
     */
    _executeApiRequest: function _executeApiRequest(req) {
      var $dd = $.Deferred();
      var pubsub = this.getPubSub();
      pubsub.subscribeOnce(pubsub.DELIVERING_RESPONSE, function (res) {
        return $dd.resolve(res);
      });
      pubsub.publish(pubsub.EXECUTE_REQUEST, req);
      return $dd.promise();
    },

    /**
     * Handle case where export widget is opened and passed a set of identifiers
     * This is the same as the currentQuery method, however it can skip the query
     * request part since we already have the identifiers.
     *
     * @param {Array} recs - current array of records (identifiers)
     * @param {object} data - object containing the format
     */
    renderWidgetForListOfBibcodes: function renderWidgetForListOfBibcodes(recs, data) {
      var dispatch = this.store.dispatch;
      var receiveIds = actions.receiveIds,
          findAndSetFormat = actions.findAndSetFormat,
          fetchUsingIds = actions.fetchUsingIds,
          hardReset = actions.hardReset,
          setSort = actions.setSort,
          setCount = actions.setCount,
          setTotalRecs = actions.setTotalRecs,
          takeSnapshot = actions.takeSnapshot,
          setOrigin = actions.setOrigin,
          setCustomFormats = actions.setCustomFormats,
          setBibtexKeyFormat = actions.setBibtexKeyFormat,
          setBibtexMaxAuthors = actions.setBibtexMaxAuthors,
          setBibtexABSKeyFormat = actions.setBibtexABSKeyFormat,
          setBibtexABSMaxAuthors = actions.setBibtexABSMaxAuthors,
          setBibtexAuthorCutoff = actions.setBibtexAuthorCutoff,
          setBibtexABSAuthorCutoff = actions.setBibtexABSAuthorCutoff,
          setBibtexJournalFormat = actions.setBibtexJournalFormat;

      var _this$getFieldsFromUs2 = this.getFieldsFromUserData(),
          customFormats = _this$getFieldsFromUs2.customFormats,
          defaultExportFormat = _this$getFieldsFromUs2.defaultExportFormat,
          bibtexMaxAuthors = _this$getFieldsFromUs2.bibtexMaxAuthors,
          bibtexKeyFormat = _this$getFieldsFromUs2.bibtexKeyFormat,
          bibtexABSMaxAuthors = _this$getFieldsFromUs2.bibtexABSMaxAuthors,
          bibtexABSKeyFormat = _this$getFieldsFromUs2.bibtexABSKeyFormat,
          bibtexAuthorCutoff = _this$getFieldsFromUs2.bibtexAuthorCutoff,
          bibtexABSAuthorCutoff = _this$getFieldsFromUs2.bibtexABSAuthorCutoff,
          bibtexJournalFormat = _this$getFieldsFromUs2.bibtexJournalFormat;

      var format = data.format === 'default' || data.format === 'other' ? defaultExportFormat : data.format;
      var sort = data.sort || 'date desc, bibcode desc';
      dispatch(hardReset());
      dispatch(setCustomFormats(customFormats));
      dispatch(setBibtexMaxAuthors(bibtexMaxAuthors));
      dispatch(setBibtexABSMaxAuthors(bibtexABSMaxAuthors));
      dispatch(setBibtexKeyFormat(bibtexKeyFormat));
      dispatch(setBibtexABSKeyFormat(bibtexABSKeyFormat));
      dispatch(setBibtexAuthorCutoff(bibtexAuthorCutoff));
      dispatch(setBibtexABSAuthorCutoff(bibtexABSAuthorCutoff));
      dispatch(setBibtexJournalFormat(this.getJournalFormatValue(bibtexJournalFormat)));
      dispatch(setSort(sort));
      dispatch(setOrigin(this.componentParams && this.componentParams.origin));
      dispatch(receiveIds(recs));
      dispatch(findAndSetFormat(format.toLowerCase()));
      dispatch(setCount(recs.length));
      dispatch(setTotalRecs(recs.length)); // only fetch using ids if user selected a format

      if (data.format !== 'other') {
        dispatch(fetchUsingIds()).done(function () {
          return dispatch(takeSnapshot());
        });
      } else {
        // otherwise only snapshot, so we can get back to this state later
        dispatch(takeSnapshot());
      }
    },
    processResponse: _.noop
  });
  return Widget;
});
