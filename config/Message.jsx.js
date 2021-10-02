define(['react'], function (React) {
  /**
   * Simple Message
   */
  var Message = function Message(_ref) {
    var type = _ref.type,
        message = _ref.message,
        show = _ref.show;
    return /*#__PURE__*/React.createElement("div", {
      className: "col-xs-12"
    }, show && /*#__PURE__*/React.createElement("div", {
      className: "text-center alert alert-".concat(type)
    }, message));
  };

  return Message;
});
