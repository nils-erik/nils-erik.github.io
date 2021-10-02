define(['redux'], function (_ref) {
  var Redux = _ref.Redux,
      createStore = _ref.createStore,
      applyMiddleware = _ref.applyMiddleware,
      compose = _ref.compose;

  var configureStore = function configureStore(context, rootReducer, rootMiddleware) {
    var middleware = applyMiddleware.apply(Redux, rootMiddleware(context));
    var composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    var store = createStore(rootReducer, composeEnhancers(middleware));
    return store;
  };

  return configureStore;
});
