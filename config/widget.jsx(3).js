define(['underscore', 'backbone', 'react', 'react-redux', 'react-dom', './redux/configure-store', './redux/modules/orcid-selector-app', 'js/widgets/base/base_widget', './containers/orcid-selector-container'], function (_, Backbone, React, ReactRedux, ReactDOM, configureStore, OrcidSelectorApp, BaseWidget, OrcidSelectorContainer) {
  /**
   * Main App View
   *
   * This view is the entry point of the app, it will pass the
   * store down using a <provider></provider> higher-order component.
   *
   * All sub-components will automatically have `store` available via context
   */
  var View = Backbone.View.extend({
    initialize: function initialize(options) {
      _.assign(this, options);
    },
    render: function render() {
      ReactDOM.render( /*#__PURE__*/React.createElement(ReactRedux.Provider, {
        store: this.store
      }, /*#__PURE__*/React.createElement(OrcidSelectorContainer, null)), this.el);
      return this;
    },
    destroy: function destroy() {
      ReactDOM.unmountComponentAtNode(this.el);
    }
  });
  /**
   * Backbone widget which does the wiring between the react view and
   * the application
   */

  var Widget = BaseWidget.extend({
    /**
     * Initialize the widget
     */
    initialize: function initialize() {
      // create the store, using the configurator
      this.store = configureStore(this); // create the view, passing in store

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
      var pubsub = this.getPubSub(); // grab the current mode while activating, in case we should render

      var mode = beehive.hasObject('User') && beehive.getObject('User').isOrcidModeOn();
      this.store.dispatch(OrcidSelectorApp.updateMode(mode));
      pubsub.subscribe(pubsub.STORAGE_PAPER_UPDATE, _.bind(this.onStoragePaperChange, this));
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, _.bind(this.onUserAnnouncement, this));
    },
    onStoragePaperChange: function onStoragePaperChange() {
      var beehive = this.getBeeHive();
      var selected = beehive.getObject('AppStorage').getSelectedPapers();
      this.store.dispatch(OrcidSelectorApp.updateSelected(selected));
    },
    onUserAnnouncement: function onUserAnnouncement(msg, data) {
      // watch for orcid mode change
      if (_.has(data, 'isOrcidModeOn')) {
        this.store.dispatch(OrcidSelectorApp.updateMode(data.isOrcidModeOn));
      }
    },
    fireOrcidEvent: function fireOrcidEvent(event, bibcodes) {
      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.CUSTOM_EVENT, event, bibcodes);
    }
  });
  return Widget;
});
