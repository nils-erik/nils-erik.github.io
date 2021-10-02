define(['redux', 'redux-thunk', './modules/sort-app'], function (Redux, ReduxThunk, SortApp) {
  var createStore = Redux.createStore,
      applyMiddleware = Redux.applyMiddleware;
  return function configureStore(context) {
    var middleware = applyMiddleware(ReduxThunk.default.withExtraArgument(context));
    var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
    return createStore(SortApp.reducer, composeEnhancers(middleware));
  };
});
