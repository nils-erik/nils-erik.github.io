define(['react-redux', '../redux/modules/orcid-selector-app', '../components/orcid-selector-app.jsx'], function (ReactRedux, actions, OrcidSelectorApp) {
  // actions
  var sendEvent = actions.sendEvent; // mapping state to props

  var mapStateToProps = function mapStateToProps(state) {
    return {
      app: state // state is available on sub-components as 'app'

    };
  }; // dispatch to props


  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      onClaim: function onClaim() {
        return dispatch(sendEvent('orcid-bulk-claim'));
      },
      onDelete: function onDelete() {
        return dispatch(sendEvent('orcid-bulk-delete'));
      },
      onUpdate: function onUpdate() {
        return dispatch(sendEvent('orcid-bulk-update'));
      }
    };
  };

  return ReactRedux.connect(mapStateToProps, mapDispatchToProps)(OrcidSelectorApp);
});
