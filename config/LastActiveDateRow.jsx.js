define(['react'], function (React) {
  /**
   * Last active date section
   */
  var LastActiveDateRow = function LastActiveDateRow(_ref) {
    var date = _ref.date,
        selected = _ref.selected,
        onChange = _ref.onChange;
    return /*#__PURE__*/React.createElement("div", {
      className: "col-xs-12"
    }, /*#__PURE__*/React.createElement("label", {
      className: selected ? '' : 'auth-aff-label'
    }, /*#__PURE__*/React.createElement("input", {
      checked: selected,
      type: "radio",
      onChange: onChange
    }), " ", date));
  };

  return LastActiveDateRow;
});
