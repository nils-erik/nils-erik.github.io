function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['react', 'd3', 'prop-types', 'react-redux'], function (React, d3, PropTypes, _ref) {
  var _this = this;

  var useSelector = _ref.useSelector;

  var format = function format(count) {
    return d3.format('s')(count).replace(/\.\d{2,}/, function (m) {
      return m.slice(0, 2);
    }).replace('.0', '');
  };

  var FacetCheckbox = function FacetCheckbox(_ref2) {
    var state = _ref2.reduxState,
        toggleFacet = _ref2.toggleFacet,
        unselectFacet = _ref2.unselectFacet,
        value = _ref2.value,
        currentLevel = _ref2.currentLevel,
        showMoreFacets = _ref2.showMoreFacets,
        resetVisibleFacets = _ref2.resetVisibleFacets,
        selectFacet = _ref2.selectFacet,
        hierarchical = _ref2.hierarchical,
        isChecked = _ref2.isChecked,
        name = _ref2.name,
        count = _ref2.count,
        id = _ref2.id,
        index = _ref2.index;
    var config = useSelector(function (state) {
      return state.config;
    });

    var updateFacetSelect = function updateFacetSelect(e) {
      if (e.target.checked) {
        // toggle open author hierarchical facets here, so users can see what the hierarchy means
        selectFacet(id);

        if (config.hierMaxLevels === 2 && typeof toggleFacet === 'function') {
          toggleFacet(id, true);
        }
      } else {
        unselectFacet(id);
      }
    };

    var label = "facet-label__title_".concat(config.facetField, "_").concat(hierarchical ? '' : 'child', "_").concat(index);
    var checkbox = /*#__PURE__*/React.createElement("label", {
      className: "facet-label",
      htmlFor: "".concat(label, "__checkbox")
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      id: "".concat(label, "__checkbox"),
      onChange: updateFacetSelect,
      checked: isChecked,
      "aria-describedby": label
    }), "\xA0", /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "facet-label__title",
      id: label
    }, name), /*#__PURE__*/React.createElement("span", {
      className: "facet-label__amount",
      title: count
    }, format(count))));

    if (hierarchical) {
      return /*#__PURE__*/React.createElement(ToggleList, {
        id: value,
        reduxState: state,
        currentLevel: currentLevel + 1,
        showMoreFacets: showMoreFacets,
        resetVisibleFacets: resetVisibleFacets,
        toggleFacet: toggleFacet,
        selectFacet: selectFacet,
        unselectFacet: unselectFacet
      }, checkbox);
    }

    return checkbox;
  };

  FacetCheckbox.propTypes = {
    isChecked: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
    reduxState: PropTypes.shape({
      config: PropTypes.object,
      state: PropTypes.object,
      pagination: PropTypes.object,
      children: PropTypes.array,
      facets: PropTypes.object
    }).isRequired,
    currentLevel: PropTypes.number,
    showMoreFacets: PropTypes.func,
    resetVisibleFacets: PropTypes.func,
    toggleFacet: PropTypes.func,
    selectFacet: PropTypes.func,
    unselectFacet: PropTypes.func,
    id: PropTypes.string,
    index: PropTypes.number
  };

  var ToggleList = function ToggleList(_ref3) {
    var state = _ref3.reduxState,
        currentLevel = _ref3.currentLevel,
        children = _ref3.children,
        selectFacet = _ref3.selectFacet,
        unselectFacet = _ref3.unselectFacet,
        showMoreFacets = _ref3.showMoreFacets,
        resetVisibleFacets = _ref3.resetVisibleFacets,
        toggleFacet = _ref3.toggleFacet,
        id = _ref3.id;
    var data = currentLevel === 1 ? state : state.facets[id];
    var open = data.state.open;
    var visible = data.state.visible;
    var finished = data.pagination.finished || false;

    var facets = _.values(_.pick(state.facets, data.children));

    var stateMessage = '';

    if (data.pagination.state === 'loading') {
      stateMessage = /*#__PURE__*/React.createElement("span", null, "loading...");
    } else if (data.pagination.state === 'failure') {
      stateMessage = /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "icon-danger",
        "aria-hidden": "true"
      }), "request failed");
    } else if (data.pagination.state === 'success' && !facets.length) {
      stateMessage = /*#__PURE__*/React.createElement("span", null, "no data retrieved");
    }

    var list = null;

    if (!facets.length) {
      list = /*#__PURE__*/React.createElement("li", null);
    } else {
      list = facets.slice(0, visible).map(function (c, i) {
        var checkboxProps = {
          isChecked: state.state.selected.indexOf(c.value) > -1,
          name: c.name,
          count: c.count,
          hierarchical: state.config.hierMaxLevels > currentLevel,
          value: c.value,
          id: c.value,
          selectFacet: selectFacet,
          unselectFacet: unselectFacet,
          label: i
        }; // if it's hierarchical, pass down some more data so that the checkbox can instantiate its own toggleList

        if (checkboxProps.hierarchical) {
          checkboxProps = _objectSpread(_objectSpread({}, checkboxProps), {}, {
            showMoreFacets: showMoreFacets,
            resetVisibleFacets: resetVisibleFacets,
            reduxState: state,
            currentLevel: currentLevel,
            toggleFacet: toggleFacet
          });
        }

        return /*#__PURE__*/React.createElement("li", {
          key: c.value
        }, /*#__PURE__*/React.createElement(FacetCheckbox, _extends({}, checkboxProps, {
          index: i
        })));
      }, _this);
    }

    var showMore = !finished || facets.length > visible;
    var moreButtonClasses = showMore ? 'btn btn-default btn-xs facet__pagination-button' : ' hidden';
    var lessButtonClasses = visible > 5 ? 'btn btn-default btn-xs facet__pagination-button' : 'hidden';
    var facetList; // level will be either 1 or 2

    var parentClass = currentLevel > 1 ? 'facet__list-container facet__list-container--child' : 'facet__list-container';

    if (open) {
      facetList = /*#__PURE__*/React.createElement("div", {
        className: parentClass
      }, /*#__PURE__*/React.createElement("ul", {
        className: "facet__list"
      }, list), /*#__PURE__*/React.createElement("div", {
        className: "facet__state-message"
      }, stateMessage), /*#__PURE__*/React.createElement("div", {
        className: "facet__pagination-container"
      }, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: lessButtonClasses,
        onClick: function onClick() {
          return resetVisibleFacets(id);
        }
      }, "less"), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: moreButtonClasses,
        onClick: function onClick() {
          return showMoreFacets(id);
        }
      }, "more")));
    }

    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "facet__toggle"
    }, /*#__PURE__*/React.createElement("i", {
      role: "button",
      "aria-label": "facet toggle",
      "aria-hidden": "true",
      tabIndex: "0",
      className: open ? 'facet__icon facet__icon--open' : 'facet__icon facet__icon--closed',
      onClick: function onClick() {
        return toggleFacet(id, !open);
      },
      onKeyPress: function onKeyPress(e) {
        if (e.which === 13) {
          toggleFacet(id, !open);
        }
      }
    }), ' ', children), facetList);
  };

  ToggleList.defaultProps = {
    children: []
  };
  ToggleList.propTypes = {
    reduxState: PropTypes.shape({
      config: PropTypes.object,
      state: PropTypes.object,
      pagination: PropTypes.object,
      children: PropTypes.array,
      facets: PropTypes.object
    }).isRequired,
    children: PropTypes.children,
    currentLevel: PropTypes.number.isRequired,
    showMoreFacets: PropTypes.func.isRequired,
    resetVisibleFacets: PropTypes.func.isRequired,
    toggleFacet: PropTypes.func.isRequired,
    selectFacet: PropTypes.func.isRequired,
    unselectFacet: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired
  };
  return ToggleList;
});
