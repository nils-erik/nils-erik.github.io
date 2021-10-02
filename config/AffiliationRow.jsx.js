define(['react'], function (React) {
  /**
   * Affiliation section of the row
   */
  var AffiliationRow = function AffiliationRow(_ref) {
    var years = _ref.years,
        name = _ref.name,
        selected = _ref.selected,
        onChange = _ref.onChange;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "col-xs-8"
    }, /*#__PURE__*/React.createElement("label", {
      className: selected ? '' : 'auth-aff-label'
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: selected,
      onChange: onChange
    }), ' ', name === '-' ? '(None)' : name)), /*#__PURE__*/React.createElement("div", {
      className: 'col-xs-4' + (selected ? ' auth-aff-bold' : '')
    }, years.join(', ')));
  };

  return AffiliationRow;
});
