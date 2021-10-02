define(['underscore', 'react', 'react-dom', 'react-redux'], function (_, React, ReactDOM, _ref) {
  var Provider = _ref.Provider;

  var WithBackboneView = function WithBackboneView(component, getStore) {
    var view = Backbone.View.extend({
      initialize: function initialize() {
        var _this = this;

        this.setElement = _.once(this.setElement);
        this.props = {
          trigger: function trigger() {
            return _this.trigger.apply(_this, arguments);
          }
        };

        if (typeof getStore === 'function') {
          this._store = getStore(this.props);
        }
      },
      render: function render(el) {
        if (!this.el && el) {
          this.setElement(el);
        } else {
          this.setElement(document.createElement('div'));
        }

        if (this._store) {
          ReactDOM.render(React.createElement(Provider, {
            store: this._store
          }, React.createElement(component, this.props)), this.el);
        } else {
          ReactDOM.render(React.createElement(component, this.props), this.el);
        }

        return this;
      },
      destroy: function destroy() {
        ReactDOM.unmountComponentAtNode(this.el);
        return this;
      },
      triggerMethod: function triggerMethod() {// noop
      }
    });
    return view;
  };

  return WithBackboneView;
});
