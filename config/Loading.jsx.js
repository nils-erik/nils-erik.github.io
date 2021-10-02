function _objectDestructuringEmpty(obj) { if (obj == null) throw new TypeError("Cannot destructure undefined"); }

define(['react'], function (React) {
  var style = {
    icon: {
      fontSize: 120
    },
    text: {
      fontSize: 32
    }
  };
  /**
   * Loading Message/Icon
   */

  var Loading = function Loading(_ref) {
    _objectDestructuringEmpty(_ref);

    return /*#__PURE__*/React.createElement("div", {
      className: "row text-center",
      role: "alert",
      "aria-busy": true
    }, /*#__PURE__*/React.createElement("div", {
      className: "col-xs-12",
      style: style.icon
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa fa-spinner fa-spin",
      "aria-hidden": "true"
    })), /*#__PURE__*/React.createElement("div", {
      className: "col-xs-12",
      style: style.text
    }, "Loading..."));
  };

  return Loading;
});
