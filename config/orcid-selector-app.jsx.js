function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

define(['react', 'prop-types'], function (React, PropTypes) {
  var styles = {
    button: {
      width: '50%'
    },
    img: {
      marginBottom: 7
    }
  };
  var initialState = {
    action: '',
    fire: function fire() {},
    showConfirm: false
  };

  var OrcidSelectorApp = /*#__PURE__*/function (_React$Component) {
    _inherits(OrcidSelectorApp, _React$Component);

    var _super = _createSuper(OrcidSelectorApp);

    function OrcidSelectorApp(props) {
      var _this;

      _classCallCheck(this, OrcidSelectorApp);

      _this = _super.call(this, props);
      _this.state = initialState;
      return _this;
    }

    _createClass(OrcidSelectorApp, [{
      key: "onClaim",
      value: function onClaim() {
        this.setState({
          action: 'claim',
          fire: this.props.onClaim,
          showConfirm: true
        });
      }
    }, {
      key: "onDelete",
      value: function onDelete() {
        this.setState({
          action: 'delete',
          fire: this.props.onDelete,
          showConfirm: true
        });
      }
    }, {
      key: "onConfirm",
      value: function onConfirm(confirm) {
        var cb = this.state.fire;
        this.setState(initialState, function () {
          return confirm && cb();
        });
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        // if nothing incoming, just reset
        if (next.app.selected.length === 0) {
          this.setState(initialState);
        }
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var app = this.props.app;
        var len = app.selected.length;

        if (app.mode) {
          return /*#__PURE__*/React.createElement("div", {
            className: "s-right-col-widget-container container-fluid"
          }, /*#__PURE__*/React.createElement("div", {
            className: "row"
          }, /*#__PURE__*/React.createElement("div", {
            className: "sr-only"
          }, "Orcid Bulk Actions"), /*#__PURE__*/React.createElement("div", {
            className: "text-center"
          }, /*#__PURE__*/React.createElement("img", {
            src: "../../styles/img/orcid-active.svg",
            alt: "orcid logo active",
            className: "s-orcid-img",
            "aria-hidden": "true",
            style: styles.img
          }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, "\xA0Bulk Actions")))), /*#__PURE__*/React.createElement("div", {
            className: "row"
          }, /*#__PURE__*/React.createElement("div", {
            className: "col-xs-12"
          }, /*#__PURE__*/React.createElement("div", {
            className: "btn-group btn-group-justified btn-group-sm",
            role: "group"
          }, /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-primary-faded ".concat(len === 0 ? 'disabled' : ''),
            title: "Claim all selected papers from Orcid",
            style: styles.button,
            onClick: function onClick() {
              return _this2.onClaim();
            }
          }, "Claim"), /*#__PURE__*/React.createElement("button", {
            type: "button",
            className: "btn btn-danger ".concat(len === 0 ? 'disabled' : ''),
            title: "Delete all selected papers from Orcid",
            style: styles.button,
            onClick: function onClick() {
              return _this2.onDelete();
            }
          }, "Delete")))), this.state.showConfirm && /*#__PURE__*/React.createElement("div", {
            className: "row",
            style: {
              marginTop: 5
            }
          }, /*#__PURE__*/React.createElement("div", {
            className: "col-xs-12 text-center"
          }, "Attempt to ", this.state.action, " ", len, " paper", "".concat(len > 1 ? 's' : ''), "?"), /*#__PURE__*/React.createElement("div", {
            className: "col-xs-12",
            style: {
              marginTop: 5
            }
          }, /*#__PURE__*/React.createElement("div", {
            className: "btn-group btn-group-sm pull-right",
            role: "group"
          }, /*#__PURE__*/React.createElement("button", {
            className: "btn btn-sm btn-success",
            title: "".concat(this.state.action, " selected papers"),
            onClick: function onClick() {
              return _this2.onConfirm(true);
            }
          }, "Apply"), /*#__PURE__*/React.createElement("button", {
            title: "Cancel ".concat(this.state.action, " selected papers"),
            className: "btn btn-sm btn-danger",
            onClick: function onClick() {
              return _this2.onConfirm(false);
            }
          }, "Cancel")))));
        }

        return null;
      }
    }]);

    return OrcidSelectorApp;
  }(React.Component);

  OrcidSelectorApp.propTypes = {
    app: PropTypes.object.isRequired
  };
  return OrcidSelectorApp;
});
