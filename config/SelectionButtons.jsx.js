define(['react'], function (React) {
  /**
   * Set of buttons
   */
  var SelectionButtons = function SelectionButtons(_ref) {
    var _onClick = _ref.onClick;
    return /*#__PURE__*/React.createElement("div", {
      className: "btn-toolbar pull-right"
    }, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-default",
      onClick: function onClick() {
        return _onClick('toggleall');
      }
    }, "Toggle All"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-default",
      onClick: function onClick() {
        return _onClick('reset');
      }
    }, "Reset"));
  };

  return SelectionButtons;
});
