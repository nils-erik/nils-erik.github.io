define(['react'], function (React) {
  /**
   * Dropdown containing export format strings for the user to select
   */
  var ExportFormatControl = function ExportFormatControl(_ref) {
    var formats = _ref.formats,
        format = _ref.format,
        _onChange = _ref.onChange;
    return /*#__PURE__*/React.createElement("select", {
      onChange: function onChange(e) {
        return _onChange(e.target.value);
      },
      value: format,
      id: "export-format-control",
      className: "form-control",
      title: "Select a format"
    }, formats.map(function (f) {
      return /*#__PURE__*/React.createElement("option", {
        key: f,
        value: f
      }, f);
    }));
  };

  return ExportFormatControl;
});
