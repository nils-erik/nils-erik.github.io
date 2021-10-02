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

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

define(['react', 'prop-types', 'react-bootstrap', './CollapsePanel.jsx', '../containers/SaveQueryForm'], function (React, PropTypes, _ref, CollapsePanel, SaveQueryForm) {
  var Alert = _ref.Alert;

  var Message = function Message(_ref2) {
    var children = _ref2.children,
        show = _ref2.show,
        type = _ref2.type,
        otherProps = _objectWithoutProperties(_ref2, ["children", "show", "type"]);

    return show ? /*#__PURE__*/React.createElement(Alert, _extends({
      bsStyle: type
    }, otherProps), children) : null;
  };

  var MyADSFreeform = /*#__PURE__*/function (_React$Component) {
    _inherits(MyADSFreeform, _React$Component);

    var _super = _createSuper(MyADSFreeform);

    function MyADSFreeform(props) {
      var _this;

      _classCallCheck(this, MyADSFreeform);

      _this = _super.call(this, props);
      _this.loginStatusCheckTimer = null;
      return _this;
    }

    _createClass(MyADSFreeform, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var checkLoginStatus = this.props.checkLoginStatus;
        checkLoginStatus();
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        window.clearTimeout(this.loginStatusCheckTimer);
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props = this.props,
            requests = _this$props.requests,
            saveNewNotification = _this$props.saveNewNotification,
            generalError = _this$props.generalError,
            loggedIn = _this$props.loggedIn;

        if (!loggedIn) {
          return null;
        }

        var addNotificationStatus = requests.addNotification.status;
        var getQIDStatus = requests.getQID.status;
        var isPending = addNotificationStatus === 'pending' || getQIDStatus === 'pending';
        return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(CollapsePanel, {
          render: function render(_ref3) {
            var collapse = _ref3.collapse;
            return /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement(SaveQueryForm, {
              onSubmit: saveNewNotification,
              onCancel: collapse,
              disabled: isPending
            }), /*#__PURE__*/React.createElement(Message, {
              show: isPending,
              type: "info"
            }, /*#__PURE__*/React.createElement("i", {
              className: "fa fa-spinner fa-spin",
              "aria-hidden": "true"
            }), ' ', "Creating..."), /*#__PURE__*/React.createElement(Message, {
              show: addNotificationStatus === 'success',
              type: "success"
            }, /*#__PURE__*/React.createElement("strong", null, "Success!"), " Notification created."), /*#__PURE__*/React.createElement(Message, {
              show: addNotificationStatus === 'failure',
              type: "danger"
            }, /*#__PURE__*/React.createElement("strong", null, /*#__PURE__*/React.createElement("i", {
              className: "fa fa-exclamation-triangle",
              "aria-hidden": "true"
            }), ' ', "Error!"), ' ', requests.addNotification.error), /*#__PURE__*/React.createElement(Message, {
              show: getQIDStatus === 'failure',
              type: "danger"
            }, /*#__PURE__*/React.createElement("strong", null, /*#__PURE__*/React.createElement("i", {
              className: "fa fa-exclamation-triangle",
              "aria-hidden": "true"
            }), ' ', "Error!"), ' ', requests.getQID.error), /*#__PURE__*/React.createElement(Message, {
              show: generalError,
              type: "danger"
            }, /*#__PURE__*/React.createElement("strong", null, /*#__PURE__*/React.createElement("i", {
              className: "fa fa-exclamation-triangle",
              "aria-hidden": "true"
            }), ' ', "Error!"), ' ', generalError));
          }
        }));
      }
    }]);

    return MyADSFreeform;
  }(React.Component);

  MyADSFreeform.defaultProps = {
    saveNewNotification: function saveNewNotification() {},
    requests: {},
    generalError: null,
    checkLoginStatus: function checkLoginStatus() {},
    loggedIn: false
  };
  MyADSFreeform.propTypes = {
    saveNewNotification: PropTypes.func,
    checkLoginStatus: PropTypes.func,
    requests: PropTypes.object,
    generalError: PropTypes.object,
    loggedIn: PropTypes.bool
  };
  return MyADSFreeform;
});
