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

define(['underscore', 'react', 'redux', 'react-redux', '../actions/index', '../constants/actionNames', '../components/ExportFormatControl.jsx', '../components/SelectionButtons.jsx', '../components/Row.jsx', '../components/Message.jsx', '../components/Loading.jsx', '../components/Closer.jsx'], function (_, React, Redux, ReactRedux, actions, ACTIONS, ExportFormatControl, SelectionButtons, Row, Message, Loading, Closer) {
  var makeOptions = function makeOptions(arr, allVal) {
    return _.map(arr, function (i) {
      if (i === 'All') {
        return /*#__PURE__*/React.createElement("option", {
          key: allVal,
          value: allVal
        }, "All");
      }

      return /*#__PURE__*/React.createElement("option", {
        key: i,
        value: i
      }, i);
    });
  }; // actions


  var toggleSelection = actions.toggleSelection,
      toggleAll = actions.toggleAll,
      reset = actions.reset,
      _doExport = actions.doExport,
      closeWidget = actions.closeWidget,
      updateYear = actions.updateYear,
      updateAuthor = actions.updateAuthor,
      reload = actions.reload;
  /**
   * Main component
   *
   * This is a container component, it is the only type of component
   * that is connected directly to the store.  All dispatches and
   * state changes should happen here.
   */

  var App = /*#__PURE__*/function (_React$Component) {
    _inherits(App, _React$Component);

    var _super = _createSuper(App);

    function App(props) {
      var _this;

      _classCallCheck(this, App);

      _this = _super.call(this, props);
      _this.state = {
        reloadSpin: false
      };
      return _this;
    }
    /**
     * Start the export
     */


    _createClass(App, [{
      key: "doExport",
      value: function doExport() {
        var dispatch = this.props.dispatch;
        dispatch(_doExport());
      }
      /**
       * On new format selection, dispatch an update to the store
       *
       * @param {string} value
       */

    }, {
      key: "onFormatSelection",
      value: function onFormatSelection(value) {
        var dispatch = this.props.dispatch;
        dispatch({
          type: ACTIONS.setFormat,
          value: value
        });
      }
      /**
       * On new selection (toggle all, reset, etc.) make the corresponding dispatch
       *
       * @param {string} type
       */

    }, {
      key: "onSelectionClick",
      value: function onSelectionClick(type) {
        var dispatch = this.props.dispatch;

        switch (type) {
          case 'toggleall':
            return dispatch(toggleAll());

          case 'reset':
            return dispatch(reset());

          default:
        }
      }
    }, {
      key: "doRefresh",
      value: function doRefresh() {
        var dispatch = this.props.dispatch;
        this.setState({
          reloadSpin: true
        });
        dispatch(actions.reload());
      }
      /**
       * Dispatch close when we want to close the widget
       */

    }, {
      key: "onCloseClick",
      value: function onCloseClick() {
        var dispatch = this.props.dispatch;
        dispatch(closeWidget());
      }
      /**
       * When a checkbox is toggled, dispatch an event
       *
       * @param {object} authorData
       * @param {object} affData
       */

    }, {
      key: "onCheckboxChange",
      value: function onCheckboxChange(authorData, affData) {
        var dispatch = this.props.dispatch;
        dispatch(toggleSelection(authorData, affData));
      }
    }, {
      key: "onYearChange",
      value: function onYearChange(year) {
        var dispatch = this.props.dispatch;
        dispatch(updateYear(year));
      }
    }, {
      key: "onAuthorChange",
      value: function onAuthorChange(author) {
        var dispatch = this.props.dispatch;
        dispatch(updateAuthor(author));
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        this.setState({
          reloadSpin: false
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this2 = this;

        var _this$props = this.props,
            data = _this$props.data,
            showReload = _this$props.showReload,
            formats = _this$props.formats,
            format = _this$props.format,
            message = _this$props.message,
            loading = _this$props.loading,
            exporting = _this$props.exporting,
            year = _this$props.year,
            author = _this$props.author,
            currentYear = _this$props.currentYear;
        return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Closer, {
          onClick: function onClick() {
            return _this2.onCloseClick();
          }
        }), /*#__PURE__*/React.createElement("div", {
          className: "container auth-aff-tool"
        }, /*#__PURE__*/React.createElement("div", {
          className: "row",
          style: {
            marginTop: 40
          }
        }, !loading && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", {
          className: "col-xs-12 col-sm-6",
          style: {
            marginTop: 0
          }
        }, "Viewing Affiliation Data For ", /*#__PURE__*/React.createElement("strong", null, data.length), ' ', "Authors", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("small", null, year !== currentYear ? "From ".concat(currentYear - year, " to ").concat(currentYear) : '', year !== currentYear && author !== 0 && ' | ', author !== 0 ? "".concat(author, " authors from each work") : '')), /*#__PURE__*/React.createElement("div", {
          className: "col-xs-12 col-sm-6"
        }, /*#__PURE__*/React.createElement("div", {
          className: "col-xs-12 col-sm-offset-4 col-sm-8 no-padding-right"
        }, /*#__PURE__*/React.createElement("div", {
          className: "col-xs-3 text-right",
          style: {
            marginTop: 4
          }
        }, /*#__PURE__*/React.createElement("label", {
          htmlFor: "max-author-select"
        }, "Authors:")), /*#__PURE__*/React.createElement("div", {
          className: "col-xs-3 no-padding-right"
        }, /*#__PURE__*/React.createElement("select", {
          id: "max-author-select",
          className: "form-control input-sm",
          title: "Select the number of authors from each article to be included (default is 3)",
          value: author,
          onChange: function onChange(val) {
            return _this2.onAuthorChange(val.target.value);
          }
        }, makeOptions([1, 2, 3, 4, 5, 10, 'All'], 0))), /*#__PURE__*/React.createElement("div", {
          className: "col-xs-3 text-right",
          style: {
            marginTop: 4
          }
        }, /*#__PURE__*/React.createElement("label", {
          htmlFor: "year-select"
        }, "Years:")), /*#__PURE__*/React.createElement("div", {
          className: "col-xs-3 no-padding-right"
        }, /*#__PURE__*/React.createElement("select", {
          id: "year-select",
          className: "form-control input-sm",
          title: "Select the number of years to include in the results (default is 4)",
          value: year,
          onChange: function onChange(val) {
            return _this2.onYearChange(val.target.value);
          }
        }, makeOptions([1, 2, 3, 4, 5, 10, 'All'], 0)))))), /*#__PURE__*/React.createElement(Message, message)), loading ?
        /*#__PURE__*/
        // show loading screen (spinning icon)
        React.createElement(Loading, null) :
        /*#__PURE__*/
        // if not loading, we can show the top/bottom bar
        React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: "row"
        }, /*#__PURE__*/React.createElement("div", {
          className: "col-xs-12 col-sm-6"
        }, /*#__PURE__*/React.createElement(ExportFormatControl, {
          formats: formats,
          format: format,
          onChange: function onChange(val) {
            return _this2.onFormatSelection(val);
          }
        })), /*#__PURE__*/React.createElement("div", {
          className: "col-xs-12 col-sm-2"
        }, /*#__PURE__*/React.createElement("button", {
          className: "btn btn-primary",
          onClick: function onClick() {
            return _this2.doExport();
          },
          disabled: !!exporting
        }, exporting ? /*#__PURE__*/React.createElement("i", {
          className: "fa fa-spinner fa-fw fa-spin",
          "aria-hidden": "true"
        }) : 'Export')), /*#__PURE__*/React.createElement("div", {
          className: "col-xs-12 col-sm-4"
        }, /*#__PURE__*/React.createElement(SelectionButtons, {
          onClick: function onClick(type) {
            return _this2.onSelectionClick(type);
          }
        }))), /*#__PURE__*/React.createElement("div", {
          className: "row well"
        }, /*#__PURE__*/React.createElement("div", {
          className: "row auth-aff-heading"
        }, /*#__PURE__*/React.createElement("div", {
          className: "col-xs-2"
        }, "Author"), /*#__PURE__*/React.createElement("div", {
          className: "col-xs-8"
        }, /*#__PURE__*/React.createElement("div", {
          className: "col-xs-8"
        }, "Affiliations"), /*#__PURE__*/React.createElement("div", {
          className: "col-xs-4"
        }, "Years")), /*#__PURE__*/React.createElement("div", {
          className: "col-xs-2"
        }, "Last Active Date")), /*#__PURE__*/React.createElement("hr", {
          className: "hr"
        }), _.map(data, function (d, i) {
          return /*#__PURE__*/React.createElement("div", {
            key: d.id
          }, /*#__PURE__*/React.createElement(Row, {
            data: d,
            onChange: function onChange(el) {
              return _this2.onCheckboxChange(d, el);
            }
          }), data.length - 1 > i && /*#__PURE__*/React.createElement("hr", {
            className: "hr"
          }));
        }), !showReload && _.isEmpty(data) && /*#__PURE__*/React.createElement("div", {
          className: "text-center"
        }, "No Results"), showReload && /*#__PURE__*/React.createElement("div", {
          className: "text-center"
        }, /*#__PURE__*/React.createElement("button", {
          onClick: function onClick() {
            return _this2.doRefresh();
          },
          title: "Retry",
          className: "btn btn-default"
        }, /*#__PURE__*/React.createElement("i", {
          className: "fa fa-refresh ".concat(this.state.reloadSpin ? 'fa-spin' : '')
        }), ' ', "Retry"))))));
      }
    }]);

    return App;
  }(React.Component);

  var mapStateToProps = function mapStateToProps(state) {
    return {
      data: state.data,
      formats: state.formats,
      format: state.format,
      message: state.message,
      loading: state.loading,
      exporting: state.exporting,
      currentYear: state.currentYear,
      year: state.year,
      author: state.author,
      showReload: state.showReload
    };
  };

  return ReactRedux.connect(mapStateToProps)(App);
});
