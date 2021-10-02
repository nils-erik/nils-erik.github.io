define(['react', 'prop-types', 'react-redux'], function (React, PropTypes, _ref) {
  var useSelector = _ref.useSelector;

  var Dropdown = function Dropdown(_ref2) {
    var activeFacets = _ref2.activeFacets,
        onSubmitFilter = _ref2.onSubmitFilter;

    var _useSelector = useSelector(function (state) {
      return {
        logicOptions: state.config.logicOptions,
        facetTitle: state.config.facetTitle
      };
    }),
        logicOptions = _useSelector.logicOptions,
        facetTitle = _useSelector.facetTitle; // no dropdown if no selected facets!


    if (activeFacets.length === 0) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'none'
        }
      });
    }

    if (activeFacets.length > 25) {
      return /*#__PURE__*/React.createElement("div", {
        className: "facet__dropdown"
      }, /*#__PURE__*/React.createElement("div", null, "select no more than 25 facets at a time"));
    }

    var arr = logicOptions[activeFacets.length === 1 ? 'single' : 'multiple'];

    if (arr[0] === 'invalid choice') {
      return /*#__PURE__*/React.createElement("div", {
        className: "facet__dropdown"
      }, /*#__PURE__*/React.createElement("div", null, "invalid choice!"));
    }

    return /*#__PURE__*/React.createElement("div", {
      className: "facet__dropdown"
    }, /*#__PURE__*/React.createElement("div", {
      className: "facet__dropdown__title",
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", null, facetTitle), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, activeFacets.length), " selected")), /*#__PURE__*/React.createElement("div", {
      className: "btn-group-vertical",
      style: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column'
      }
    }, arr.map(function (val) {
      return /*#__PURE__*/React.createElement("button", {
        key: val,
        className: "btn btn-default",
        type: "button",
        onClick: function onClick() {
          return onSubmitFilter(val);
        }
      }, val);
    })));
  };

  Dropdown.defaultProps = {
    activeFacets: [],
    onSubmitFilter: function onSubmitFilter() {}
  };
  Dropdown.propTypes = {
    activeFacets: PropTypes.arrayOf(PropTypes.string),
    onSubmitFilter: PropTypes.func
  };
  return Dropdown;
});
