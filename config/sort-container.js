define(['react-redux', '../redux/modules/sort-app', '../components/sort-app.jsx'], function (ReactRedux, actions, SortApp) {
  // actions
  var _setSort = actions.setSort,
      _setDirection = actions.setDirection; // mapping state to props

  var mapStateToProps = function mapStateToProps(state) {
    return {
      app: state // state is available on sub-components as 'app'

    };
  }; // dispatch to props


  var mapDispatchToProps = function mapDispatchToProps(dispatch) {
    return {
      setSort: function setSort(value) {
        return dispatch(_setSort(value));
      },
      setDirection: function setDirection() {
        return dispatch(_setDirection());
      }
    };
  };

  return ReactRedux.connect(mapStateToProps, mapDispatchToProps)(SortApp);
});
