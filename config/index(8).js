define(['./components/App.jsx', 'js/react/WithBackboneView', 'js/react/configureStore', 'react-redux', './actions', './middleware', './reducer', 'js/react/shared/helpers', 'js/react/shared/middleware/api'], function (App, WithBackboneView, configureStore, _ref, actions, middleware, reducer, _ref2, sharedMiddleware) {
  var connect = _ref.connect;
  var withContext = _ref2.withContext;

  var mapStateToProps = function mapStateToProps(_ref3) {
    var requests = _ref3.requests,
        generalError = _ref3.generalError,
        loggedIn = _ref3.loggedIn;
    return {
      requests: {
        addNotification: requests.ADD_NOTIFICATION,
        getQID: requests.GET_QID
      },
      loggedIn: loggedIn,
      generalError: generalError
    };
  };

  var saveNewNotification = actions.saveNewNotification,
      checkLoginStatus = actions.checkLoginStatus;
  var actionCreators = {
    saveNewNotification: saveNewNotification,
    checkLoginStatus: checkLoginStatus
  };
  return WithBackboneView(connect(mapStateToProps, actionCreators)(App), function (context) {
    return configureStore(context, reducer, withContext(middleware, sharedMiddleware));
  });
});
