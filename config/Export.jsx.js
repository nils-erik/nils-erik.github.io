define(['react', 'prop-types', './ClipboardBtn.jsx'], function (React, ReactPropTypes, ClipboardBtn) {
  var Export = function Export(_ref) {
    var output = _ref.output,
        isFetching = _ref.isFetching,
        progress = _ref.progress,
        onDownloadFile = _ref.onDownloadFile,
        onCopy = _ref.onCopy;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-sm-12 btn-group"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-default",
      disabled: isFetching || _.isEmpty(output),
      onClick: onDownloadFile
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa fa-download fa-fw",
      "aria-hidden": "true"
    }), "Download to File"), /*#__PURE__*/React.createElement(ClipboardBtn, {
      disabled: isFetching || _.isEmpty(output),
      onCopy: onCopy,
      target: ".export-textarea"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "form-group"
    }, /*#__PURE__*/React.createElement("textarea", {
      className: "export-textarea form-control",
      readOnly: "true",
      value: output,
      disabled: isFetching,
      "aria-label": "export content"
    }))), isFetching && /*#__PURE__*/React.createElement("div", {
      className: "progress export-progress"
    }, /*#__PURE__*/React.createElement("div", {
      className: "progress-bar",
      role: "progressbar",
      "aria-valuenow": progress,
      "aria-valuemin": "0",
      "aria-valuemax": "100",
      style: {
        width: "".concat(progress, "%")
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sr-only"
    }, progress, "% Complete")), /*#__PURE__*/React.createElement("div", {
      className: "text-center"
    }, "Loading...")));
  };

  Export.propTypes = {
    output: ReactPropTypes.string.isRequired,
    isFetching: ReactPropTypes.bool.isRequired,
    progress: ReactPropTypes.number,
    onDownloadFile: ReactPropTypes.func.isRequired,
    onCopy: ReactPropTypes.func.isRequired
  };
  return Export;
});
