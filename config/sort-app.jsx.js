define(['react', 'prop-types'], function (React, PropTypes) {
  var SortApp = function SortApp(_ref) {
    var setSort = _ref.setSort,
        setDirection = _ref.setDirection,
        app = _ref.app;
    var options = app.options,
        sort = app.sort,
        direction = app.direction;
    /**
     * Call the handler after a selection is made from the dropdown
     *
     * @param {object} item - the sort option
     * @param {object} e - the event object
     */

    var onSelect = function onSelect(item, e) {
      e.preventDefault();

      if (e.stopPropagation) {
        e.stopPropagation();
      }

      setSort(item);
    };

    var changeDirectionText = direction === 'asc' ? 'Change sort direction to descending' : 'Change sort direction to ascending';
    return /*#__PURE__*/React.createElement("div", {
      className: "btn-group"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "btn btn-default",
      onClick: setDirection,
      title: changeDirectionText
    }, /*#__PURE__*/React.createElement("i", {
      className: "fa fa-sort-amount-".concat(direction),
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("span", {
      className: "sr-only"
    }, changeDirectionText)), /*#__PURE__*/React.createElement("button", {
      style: {
        minWidth: 100
      },
      type: "button",
      className: "btn btn-default dropdown-toggle",
      "data-toggle": "dropdown",
      title: "Select a sort option"
    }, sort.text, " ", /*#__PURE__*/React.createElement("span", {
      className: "caret",
      "aria-hidden": "true"
    })), /*#__PURE__*/React.createElement("ul", {
      className: "dropdown-menu",
      role: "menu"
    }, options.map(function (o) {
      return /*#__PURE__*/React.createElement("li", {
        key: o.id
      }, /*#__PURE__*/React.createElement("a", {
        href: "javascript:void(0)",
        title: o.desc,
        onClick: function onClick(e) {
          return onSelect(o, e);
        }
      }, o.text));
    })));
  };

  SortApp.propTypes = {
    app: PropTypes.shape({
      options: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        desc: PropTypes.string,
        text: PropTypes.string
      })),
      sort: PropTypes.shape({
        text: PropTypes.string
      }),
      direction: PropTypes.string
    }).isRequired,
    setSort: PropTypes.func.isRequired,
    setDirection: PropTypes.func.isRequired
  };
  return SortApp;
});
