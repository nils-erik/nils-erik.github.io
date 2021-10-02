define(['redux', 'redux-thunk', './modules/orcid-selector-app'], function (Redux, ReduxThunk, OrcidSelectorApp) {
  var createStore = Redux.createStore,
      applyMiddleware = Redux.applyMiddleware;
  return function configureStore(context) {
    var middleware = applyMiddleware(ReduxThunk.default.withExtraArgument(context));
    var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
    return createStore(OrcidSelectorApp.reducer, composeEnhancers(middleware));
  };
});
