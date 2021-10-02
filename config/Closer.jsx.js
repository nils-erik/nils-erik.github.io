define(['react', 'prop-types'], function (React, ReactPropTypes) {
  var Closer = function Closer(_ref) {
    var onClick = _ref.onClick;

    var handleClick = function handleClick(e) {
      e.preventDefault();
      e.stopPropagation && e.stopPropagation();
      onClick();
    };

    return /*#__PURE__*/React.createElement("a", {
      href: "javascript:void(0)",
      className: "pull-right",
      onClick: function onClick(e) {
        return handleClick(e);
      },
      "aria-label": "close"
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa fa-times fa-2x",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("span", {
      className: "sr-only"
    }, "close"));
  };

  Closer.propTypes = {
    onClick: ReactPropTypes.func.isRequired
  };
  return Closer;
});
