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

define(['react', 'prop-types', 'react-bootstrap'], function (React, PropTypes, _ref) {
  var Panel = _ref.Panel;
  var initialState = {
    open: false,
    hovered: false,
    focused: false
  };

  var CollapsePanel = /*#__PURE__*/function (_React$Component) {
    _inherits(CollapsePanel, _React$Component);

    var _super = _createSuper(CollapsePanel);

    function CollapsePanel(props, context) {
      var _this;

      _classCallCheck(this, CollapsePanel);

      _this = _super.call(this, props, context);
      _this.state = initialState;
      _this.toggle = _this.toggle.bind(_assertThisInitialized(_this));
      _this.toggleHover = _this.toggleHover.bind(_assertThisInitialized(_this));
      _this.onChangeFocus = _this.onChangeFocus.bind(_assertThisInitialized(_this));
      return _this;
    }

    _createClass(CollapsePanel, [{
      key: "toggle",
      value: function toggle() {
        this.setState({
          open: !this.state.open
        });
      }
    }, {
      key: "toggleHover",
      value: function toggleHover() {
        this.setState({
          hovered: !this.state.hovered
        });
      }
    }, {
      key: "onChangeFocus",
      value: function onChangeFocus(val) {
        var _this2 = this;

        return function () {
          _this2.setState({
            focused: val
          });
        };
      }
    }, {
      key: "render",
      value: function render() {
        var _this3 = this;

        var caretDir = this.state.open ? 'down' : 'right';
        return /*#__PURE__*/React.createElement(Panel, {
          expanded: this.state.open,
          onToggle: this.toggle
        }, /*#__PURE__*/React.createElement(Panel.Heading, {
          style: {
            backgroundColor: 'white',
            padding: '0'
          }
        }, /*#__PURE__*/React.createElement(Panel.Title, null, /*#__PURE__*/React.createElement("button", {
          className: "btn btn-link btn-block",
          onMouseEnter: this.toggleHover,
          onMouseLeave: this.toggleHover,
          onFocus: this.onChangeFocus(true),
          onBlur: this.onChangeFocus(false),
          style: {
            color: '#5D5D5D',
            fontSize: '1.1em',
            backgroundColor: this.state.hovered || this.state.focused ? '#f2f2f2' : 'white',
            textDecoration: 'none'
          },
          "aria-expanded": this.state.open,
          onClick: this.toggle
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            justifyContent: 'space-between'
          }
        }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
          className: "fa fa-bell",
          "aria-hidden": "true"
        }), " Create email notification"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
          className: "fa fa-caret-".concat(caretDir),
          "aria-hidden": "true"
        })))))), /*#__PURE__*/React.createElement(Panel.Collapse, null, /*#__PURE__*/React.createElement(Panel.Body, null, this.props.render({
          collapse: function collapse() {
            return _this3.toggle();
          }
        }))));
      }
    }]);

    return CollapsePanel;
  }(React.Component);

  CollapsePanel.defaultProps = {
    render: function render() {}
  };
  CollapsePanel.propTypes = {
    render: PropTypes.func
  };
  return CollapsePanel;
});
