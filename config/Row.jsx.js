function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

define(['react', '../components/LastActiveDateRow.jsx', '../components/AffiliationRow.jsx'], function (React, LastActiveDateRow, AffiliationRow) {
  /**
   * Simple Row which contains the Affiliation and LastActiveDate sections
   */
  var Row = function Row(_ref) {
    var _onChange = _ref.onChange,
        data = _ref.data;
    var author = data.author,
        selected = data.selected,
        affiliations = data.affiliations,
        lastActiveDates = data.lastActiveDates;
    return /*#__PURE__*/React.createElement("div", {
      className: "row"
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-xs-2"
    }, /*#__PURE__*/React.createElement("label", {
      className: selected ? '' : 'auth-aff-label'
    }, /*#__PURE__*/React.createElement("input", {
      checked: selected,
      type: "checkbox",
      onChange: function onChange() {
        return _onChange();
      }
    }), ' ', author)), /*#__PURE__*/React.createElement("div", {
      className: "col-xs-8"
    }, affiliations.map(function (a) {
      return /*#__PURE__*/React.createElement(AffiliationRow, _extends({
        key: a.id,
        onChange: function onChange() {
          return _onChange(a);
        }
      }, a));
    })), /*#__PURE__*/React.createElement("div", {
      className: "col-xs-2"
    }, lastActiveDates.map(function (d) {
      return /*#__PURE__*/React.createElement(LastActiveDateRow, _extends({
        key: d.id,
        onChange: function onChange() {
          return _onChange(d);
        }
      }, d));
    })));
  };

  return Row;
});
