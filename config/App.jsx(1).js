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

define(['underscore', 'react', 'react-redux', 'prop-types', '../actions/index', '../components/Closer.jsx', '../components/Setup.jsx', '../components/Export.jsx'], function (_, React, ReactRedux, ReactPropTypes, actions, Closer, Setup, Export) {
  var closeComponent = actions.closeComponent,
      setFormat = actions.setFormat,
      getNextBatch = actions.getNextBatch,
      fetchUsingQuery = actions.fetchUsingQuery,
      fetchUsingIds = actions.fetchUsingIds,
      setCount = actions.setCount,
      cancelRequest = actions.cancelRequest,
      reset = actions.reset,
      downloadFile = actions.downloadFile,
      getCustomFormats = actions.getCustomFormats;

  var App = /*#__PURE__*/function (_React$Component) {
    _inherits(App, _React$Component);

    var _super = _createSuper(App);

    function App(props) {
      var _this;

      _classCallCheck(this, App);

      _this = _super.call(this, props);

      _.bindAll(_assertThisInitialized(_this), ['handleCloseClick', 'handleApplyClick', 'handleFormatChange', 'handleCountChange', 'handleCancelClick', 'handleGetNextClick', 'handleResetClick', 'handleDownloadFileClick', 'onCopyText', 'onCustomFormatClick']);

      var dispatch = props.dispatch;
      /**
       * The count update is debounced, to make sure that lots of changes don't
       * send many requests.
       */

      _this.updateCount = _.debounce(function (val) {
        dispatch(setCount(parseInt(val)));
      }, 500);
      _this.onCustomFormatChange = _.debounce(function (val) {
        dispatch({
          type: 'SET_CUSTOM_FORMAT',
          format: val
        });
      }, 500);
      _this.state = {
        count: '0',
        showAlert: false,
        customFormatDirectEntry: true
      };
      return _this;
    }
    /**
     * On file download click, dispatch the download file action
     */


    _createClass(App, [{
      key: "handleDownloadFileClick",
      value: function handleDownloadFileClick() {
        this.props.dispatch(downloadFile());
      }
      /**
       * On copy button click, show a message which dissappears after 5 seconds
       */

    }, {
      key: "onCopyText",
      value: function onCopyText() {
        var _this2 = this;

        this.setState({
          showAlert: true,
          alertMsg: 'Text Copied!'
        });

        _.delay(function () {
          return _this2.setState({
            showAlert: false
          });
        }, 5000);
      }
      /**
       * On close click, close the widget
       */

    }, {
      key: "handleCloseClick",
      value: function handleCloseClick() {
        this.props.dispatch(closeComponent());
      }
      /**
       * On cancel, attempt to cancel request
       *
       * -- this mainly resets the form and ignores the pending request
       */

    }, {
      key: "handleCancelClick",
      value: function handleCancelClick() {
        this.props.dispatch(cancelRequest());
      }
      /**
       * When the count is updated, update the state accordingly
       *
       * @param {number} val - the count
       */

    }, {
      key: "handleCountChange",
      value: function handleCountChange(val) {
        var _this3 = this;

        this.setState({
          count: val
        }, function () {
          return _this3.updateCount(val);
        });
      }
      /**
       * On Apply, the export process is begun
       */

    }, {
      key: "handleApplyClick",
      value: function handleApplyClick() {
        var _this$props = this.props,
            dispatch = _this$props.dispatch,
            ids = _this$props.ids,
            query = _this$props.query;

        if (_.isEmpty(query) && !_.isEmpty(ids)) {
          dispatch(fetchUsingIds());
        } else {
          dispatch(fetchUsingQuery()).done(function () {
            return dispatch(fetchUsingIds());
          });
        }
      }
      /**
       * Dispatch a form reset
       */

    }, {
      key: "handleResetClick",
      value: function handleResetClick() {
        this.props.dispatch(reset());
      }
    }, {
      key: "onCustomFormatClick",
      value: function onCustomFormatClick() {
        if (this.state.customFormatDirectEntry && this.props.customFormats.length > 0) {
          this.onCustomFormatChange(this.props.customFormats[0].code);
        }

        this.setState({
          customFormatDirectEntry: !this.state.customFormatDirectEntry
        });
      }
      /**
       * Update the format on the state when the user selects a new one
       *
       * @param {string} id - format id
       */

    }, {
      key: "handleFormatChange",
      value: function handleFormatChange(id) {
        var _this$props2 = this.props,
            dispatch = _this$props2.dispatch,
            formats = _this$props2.formats,
            autoSubmit = _this$props2.autoSubmit;

        var format = _.find(formats, {
          id: id
        });

        if (format.value === 'custom' && this.props.customFormats.length > 0) {
          this.onCustomFormatChange(this.props.customFormats[0].code);
        }

        dispatch(setFormat(format)); // if autoSubmit, then hit apply as the format changes

        autoSubmit && format.value !== 'custom' && this.handleApplyClick();
      }
      /**
       * Get the next set of items
       */

    }, {
      key: "handleGetNextClick",
      value: function handleGetNextClick() {
        var dispatch = this.props.dispatch;
        dispatch(getNextBatch());
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(next) {
        var remaining = next.totalRecs - next.maxCount;
        this.setState({
          count: '' + next.count,
          hasMore: remaining > 0,
          remaining: remaining > next.batchSize ? next.batchSize : remaining
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props3 = this.props,
            format = _this$props3.format,
            formats = _this$props3.formats,
            isFetching = _this$props3.isFetching,
            output = _this$props3.output,
            batchSize = _this$props3.batchSize,
            showCloser = _this$props3.showCloser,
            showReset = _this$props3.showReset,
            progress = _this$props3.progress,
            maxCount = _this$props3.maxCount,
            hasError = _this$props3.hasError,
            errorMsg = _this$props3.errorMsg,
            totalRecs = _this$props3.totalRecs,
            showSlider = _this$props3.showSlider,
            splitCols = _this$props3.splitCols,
            autoSubmit = _this$props3.autoSubmit,
            customFormat = _this$props3.customFormat,
            customFormats = _this$props3.customFormats;
        var _this$state = this.state,
            count = _this$state.count,
            hasMore = _this$state.hasMore,
            showAlert = _this$state.showAlert,
            alertMsg = _this$state.alertMsg,
            remaining = _this$state.remaining,
            customFormatDirectEntry = _this$state.customFormatDirectEntry;
        var low = maxCount - batchSize;
        var lower = low === 0 ? 1 : low;
        var upper = Number(count) + low;
        var shouldShowSlider = totalRecs > 1 && showSlider;
        return /*#__PURE__*/React.createElement("div", {
          className: "container-fluid export-container"
        }, /*#__PURE__*/React.createElement("span", null, showCloser && /*#__PURE__*/React.createElement(Closer, {
          onClick: this.handleCloseClick
        }), /*#__PURE__*/React.createElement("div", {
          className: "h4"
        }, "Exporting record(s) ", /*#__PURE__*/React.createElement("strong", null, lower), " to", ' ', /*#__PURE__*/React.createElement("strong", null, upper), " ", /*#__PURE__*/React.createElement("small", null, "(total: ", totalRecs, ")"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: splitCols ? 'col-sm-6' : 'col-sm-12'
        }, /*#__PURE__*/React.createElement(Setup, {
          format: format,
          formats: formats,
          disabled: isFetching,
          count: count,
          maxCount: maxCount,
          totalRecs: totalRecs,
          batchSize: batchSize,
          hasMore: hasMore,
          showSlider: shouldShowSlider,
          showReset: showReset,
          autoSubmit: autoSubmit,
          remaining: remaining,
          customFormat: customFormat,
          customFormats: customFormats,
          customFormatDirectEntry: customFormatDirectEntry,
          onCustomFormatChange: this.onCustomFormatChange,
          onReset: this.handleResetClick,
          onApply: this.handleApplyClick,
          onCancel: this.handleCancelClick,
          setFormat: this.handleFormatChange,
          onGetNext: this.handleGetNextClick,
          setCount: this.handleCountChange,
          onCustomFormatClick: this.onCustomFormatClick
        }), hasError && /*#__PURE__*/React.createElement("div", {
          className: "row"
        }, /*#__PURE__*/React.createElement("div", {
          className: "col-sm-10"
        }, /*#__PURE__*/React.createElement("div", {
          className: "alert alert-danger"
        }, errorMsg))), showAlert && /*#__PURE__*/React.createElement("div", {
          className: "row"
        }, /*#__PURE__*/React.createElement("div", {
          className: "col-sm-10"
        }, /*#__PURE__*/React.createElement("div", {
          className: "alert alert-info"
        }, alertMsg)))), /*#__PURE__*/React.createElement("div", {
          className: splitCols ? 'col-sm-6' : 'col-sm-12'
        }, /*#__PURE__*/React.createElement(Export, {
          output: output,
          isFetching: isFetching,
          progress: progress,
          onDownloadFile: this.handleDownloadFileClick,
          onCopy: this.onCopyText
        }))));
      }
    }]);

    return App;
  }(React.Component);

  App.propTypes = {
    dispatch: ReactPropTypes.func.isRequired,
    format: ReactPropTypes.shape({
      id: ReactPropTypes.string,
      value: ReactPropTypes.string,
      label: ReactPropTypes.string
    }).isRequired,
    formats: ReactPropTypes.arrayOf(ReactPropTypes.shape({
      id: ReactPropTypes.string,
      value: ReactPropTypes.string,
      label: ReactPropTypes.string
    })).isRequired,
    isFetching: ReactPropTypes.bool.isRequired,
    output: ReactPropTypes.string.isRequired,
    progress: ReactPropTypes.number.isRequired,
    count: ReactPropTypes.number.isRequired,
    maxCount: ReactPropTypes.number.isRequired,
    hasError: ReactPropTypes.bool.isRequired,
    errorMsg: ReactPropTypes.string.isRequired,
    batchSize: ReactPropTypes.number.isRequired,
    totalRecs: ReactPropTypes.number.isRequired,
    showCloser: ReactPropTypes.bool.isRequired,
    showSlider: ReactPropTypes.bool.isRequired,
    splitCols: ReactPropTypes.bool.isRequired,
    showReset: ReactPropTypes.bool.isRequired,
    autoSubmit: ReactPropTypes.bool.isRequired
  };

  var mapStateToProps = function mapStateToProps(state) {
    return {
      format: state.format,
      formats: state.formats,
      output: state.exports.output,
      isFetching: state.exports.isFetching,
      progress: state.exports.progress,
      count: state.exports.count,
      maxCount: state.exports.maxCount,
      hasError: state.error.hasError,
      errorMsg: state.error.errorMsg,
      batchSize: state.exports.batchSize,
      totalRecs: state.exports.totalRecs,
      customFormat: state.exports.customFormat,
      showCloser: state.main.showCloser,
      showSlider: state.main.showSlider,
      autoSubmit: state.main.autoSubmit,
      splitCols: state.main.splitCols,
      showReset: state.main.showReset,
      ids: state.exports.ids,
      query: state.main.query,
      customFormats: state.exports.customFormats
    };
  };

  return ReactRedux.connect(mapStateToProps)(App);
});
