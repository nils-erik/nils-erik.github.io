define(['react', 'prop-types'], function (React, ReactPropTypes) {
  var Setup = function Setup(_ref) {
    var onApply = _ref.onApply,
        setFormat = _ref.setFormat,
        disabled = _ref.disabled,
        onCancel = _ref.onCancel,
        batchSize = _ref.batchSize,
        hasMore = _ref.hasMore,
        onReset = _ref.onReset,
        format = _ref.format,
        formats = _ref.formats,
        count = _ref.count,
        setCount = _ref.setCount,
        maxCount = _ref.maxCount,
        onGetNext = _ref.onGetNext,
        totalRecs = _ref.totalRecs,
        showSlider = _ref.showSlider,
        showReset = _ref.showReset,
        remaining = _ref.remaining,
        autoSubmit = _ref.autoSubmit,
        customFormat = _ref.customFormat,
        onCustomFormatChange = _ref.onCustomFormatChange,
        customFormats = _ref.customFormats,
        customFormatSelected = _ref.customFormatSelected,
        onCustomFormatSelectionChange = _ref.onCustomFormatSelectionChange,
        customFormatDirectEntry = _ref.customFormatDirectEntry,
        onCustomFormatClick = _ref.onCustomFormatClick;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-sm-10"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "ex-dropdown"
    }, "Select Export Format"), /*#__PURE__*/React.createElement("select", {
      className: "form-control",
      autoFocus: "true",
      id: "ex-dropdown",
      value: format.id,
      onChange: function onChange(e) {
        return setFormat(e.target.value);
      },
      disabled: disabled
    }, formats.map(function (f) {
      return /*#__PURE__*/React.createElement("option", {
        key: f.id,
        value: f.id,
        title: f.help
      }, f.label);
    }))), disabled && /*#__PURE__*/React.createElement("div", {
      className: "col-sm-2"
    }, /*#__PURE__*/React.createElement("div", {
      className: "export-loading-icon fa fa-spinner fa-spin fa-2x",
      "aria-hidden": "true"
    }))), format.value === 'custom' && /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-sm-10"
    }, !customFormatDirectEntry && /*#__PURE__*/React.createElement("div", {
      className: "col-sm-12"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "ex-custom-input"
    }, "Select a Custom Format", /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 5
      }
    }, /*#__PURE__*/React.createElement("a", {
      title: "Get Help With ADS Custom Format Syntax",
      target: "_blank",
      rel: "noreferrer noopener",
      href: "/help/actions/export"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa fa-info-circle fa-invert",
      "aria-hidden": "true"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 5
      }
    }, /*#__PURE__*/React.createElement("a", {
      title: "manage custom formats",
      href: "/#user/settings/application"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa fa-cog fa-invert",
      "aria-hidden": "true"
    })))), /*#__PURE__*/React.createElement("select", {
      className: "form-control",
      value: customFormat,
      onChange: function onChange(e) {
        return onCustomFormatChange(e.target.value);
      }
    }, customFormats.map(function (f) {
      return /*#__PURE__*/React.createElement("option", {
        value: f.code,
        key: f.id
      }, f.name);
    })), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-link",
      role: "button",
      onClick: onCustomFormatClick
    }, "Or enter your own")), customFormatDirectEntry && /*#__PURE__*/React.createElement("div", {
      className: "col-sm-12"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "ex-custom-input"
    }, "Enter Custom Format", /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 5
      }
    }, /*#__PURE__*/React.createElement("a", {
      title: "Get Help With ADS Custom Format Syntax",
      target: "_blank",
      rel: "noreferrer noopener",
      href: "/help/actions/export"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa fa-info-circle fa-invert",
      "aria-hidden": "true"
    })))), /*#__PURE__*/React.createElement("input", {
      type: "text",
      className: "form-control",
      value: customFormat,
      onChange: function onChange(e) {
        return onCustomFormatChange(e.target.value);
      }
    }), customFormats.length > 0 && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-link",
      role: "button",
      onClick: onCustomFormatClick
    }, "Or select from your saved custom formats")))), showSlider && /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-sm-10"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "ex-range"
    }, "Limit to ", /*#__PURE__*/React.createElement("strong", null, count), ' ', count > 1 ? 'records' : 'record'), /*#__PURE__*/React.createElement("input", {
      type: "range",
      id: "ex-range",
      min: "1",
      max: totalRecs < batchSize ? totalRecs : batchSize,
      step: "1",
      value: count,
      disabled: disabled,
      onChange: function onChange(e) {
        return setCount(e.target.value);
      }
    }))), /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-sm-12 btn-toolbar"
    }, (!autoSubmit || format.value === 'custom') && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-primary",
      onClick: onApply,
      disabled: disabled
    }, "Apply"), !disabled && showReset && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-info",
      onClick: onReset
    }, "Reset"), !disabled && hasMore && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-link",
      onClick: onGetNext
    }, "Get Next ", remaining, " Record(s)"), disabled && (!autoSubmit || format.value === 'custom') && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-warning",
      onClick: onCancel
    }, "Cancel"))));
  };

  Setup.propTypes = {
    setFormat: ReactPropTypes.func.isRequired,
    format: ReactPropTypes.shape({
      id: ReactPropTypes.string,
      value: ReactPropTypes.string,
      label: ReactPropTypes.string
    }).isRequired,
    onApply: ReactPropTypes.func.isRequired,
    onCancel: ReactPropTypes.func.isRequired,
    formats: ReactPropTypes.arrayOf(ReactPropTypes.shape({
      id: ReactPropTypes.string,
      value: ReactPropTypes.string,
      label: ReactPropTypes.string
    })).isRequired,
    disabled: ReactPropTypes.bool.isRequired,
    count: ReactPropTypes.string.isRequired,
    setCount: ReactPropTypes.func.isRequired,
    maxCount: ReactPropTypes.number.isRequired,
    onGetNext: ReactPropTypes.func.isRequired,
    totalRecs: ReactPropTypes.number.isRequired,
    onReset: ReactPropTypes.func.isRequired,
    showSlider: ReactPropTypes.bool.isRequired,
    showReset: ReactPropTypes.bool.isRequired,
    autoSubmit: ReactPropTypes.bool.isRequired
  };
  return Setup;
});
