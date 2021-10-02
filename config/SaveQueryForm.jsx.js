function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

define(['underscore', 'react', 'prop-types', 'react-bootstrap', '../constants', 'js/react/shared/helpers'], function (_, React, PropTypes, _ref, _ref2, _ref3) {
  var FormGroup = _ref.FormGroup,
      FormControl = _ref.FormControl,
      ControlLabel = _ref.ControlLabel,
      Checkbox = _ref.Checkbox,
      Radio = _ref.Radio,
      Button = _ref.Button,
      ButtonToolbar = _ref.ButtonToolbar;
  var Frequency = _ref2.Frequency;
  var isEmpty = _ref3.isEmpty;
  var initialState = {
    name: '',
    frequency: Frequency.DAILY
  };

  var SaveQueryForm = /*#__PURE__*/function (_React$Component) {
    _inherits(SaveQueryForm, _React$Component);

    var _super = _createSuper(SaveQueryForm);

    function SaveQueryForm(props) {
      var _this;

      _classCallCheck(this, SaveQueryForm);

      _this = _super.call(this, props);
      _this.state = initialState;
      _this.onSubmit = _this.onSubmit.bind(_assertThisInitialized(_this));
      _this.onFormChange = _this.onFormChange.bind(_assertThisInitialized(_this));
      _this.onCancel = _this.onCancel.bind(_assertThisInitialized(_this));
      _this._onSubmit = _.debounce(_this._onSubmit, 1000, {
        leading: true,
        trailing: false
      });
      return _this;
    }

    _createClass(SaveQueryForm, [{
      key: "reset",
      value: function reset() {
        this.setState(initialState);
      }
    }, {
      key: "_onSubmit",
      value: function _onSubmit() {
        var _this$state = this.state,
            name = _this$state.name,
            frequency = _this$state.frequency;

        if (!isEmpty(name)) {
          this.props.onSubmit({
            name: name,
            frequency: frequency
          });
        }
      }
    }, {
      key: "onSubmit",
      value: function onSubmit(e) {
        e.preventDefault();

        this._onSubmit();
      }
    }, {
      key: "onCancel",
      value: function onCancel() {
        this.props.onCancel();
      }
    }, {
      key: "onFormChange",
      value: function onFormChange(prop) {
        var _this2 = this;

        return function (e) {
          var _this2$setState;

          var value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

          _this2.setState((_this2$setState = {}, _defineProperty(_this2$setState, prop, value), _defineProperty(_this2$setState, "updated", true), _this2$setState));
        };
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        if (nextProps.requests.addNotification.status === 'success') {
          this.reset();
        }
      }
    }, {
      key: "render",
      value: function render() {
        var isDisabled = this.props.disabled;
        return /*#__PURE__*/React.createElement("form", {
          onSubmit: this.onSubmit
        }, /*#__PURE__*/React.createElement(FormGroup, null, /*#__PURE__*/React.createElement("i", {
          className: "fa fa-question-circle",
          "aria-hidden": "true"
        }), " Create myADS email notification for this query"), /*#__PURE__*/React.createElement(FormGroup, {
          controlId: "notification-name"
        }, /*#__PURE__*/React.createElement(ControlLabel, null, "Notification Name"), /*#__PURE__*/React.createElement(FormControl, {
          type: "text",
          placeholder: "My Notification",
          value: this.state.name,
          onChange: this.onFormChange('name'),
          disabled: isDisabled,
          bsSize: "small",
          required: true
        })), /*#__PURE__*/React.createElement(FormGroup, {
          controlId: "notification-frequency"
        }, /*#__PURE__*/React.createElement(ControlLabel, {
          id: "frequency-check"
        }, "Frequency"), /*#__PURE__*/React.createElement(Radio, {
          name: "frequency",
          checked: this.state.frequency === Frequency.DAILY,
          value: "daily",
          onChange: this.onFormChange('frequency'),
          "aria-labelledby": "frequency-check",
          disabled: isDisabled
        }, "Daily"), /*#__PURE__*/React.createElement(Radio, {
          name: "frequency",
          checked: this.state.frequency === Frequency.WEEKLY,
          value: "weekly",
          onChange: this.onFormChange('frequency'),
          "aria-labelledby": "frequency-check",
          disabled: isDisabled
        }, "Weekly")), /*#__PURE__*/React.createElement(FormGroup, null, /*#__PURE__*/React.createElement(ButtonToolbar, null, /*#__PURE__*/React.createElement(Button, {
          type: "submit",
          bsStyle: "primary-faded",
          bsSize: "sm",
          disabled: isDisabled
        }, "Create"), /*#__PURE__*/React.createElement(Button, {
          bsStyle: "default",
          bsSize: "sm",
          onClick: this.onCancel,
          disabled: isDisabled
        }, "Cancel"))), /*#__PURE__*/React.createElement(FormGroup, null, /*#__PURE__*/React.createElement("a", {
          href: "#/user/settings/myads"
        }, "Go to myADS settings")));
      }
    }]);

    return SaveQueryForm;
  }(React.Component);

  SaveQueryForm.defaultProps = {
    onSubmit: function onSubmit() {},
    onCancel: function onCancel() {},
    disabled: false,
    requests: {}
  };
  SaveQueryForm.propTypes = {
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    disabled: PropTypes.bool,
    requests: PropTypes.object
  };
  return SaveQueryForm;
});
