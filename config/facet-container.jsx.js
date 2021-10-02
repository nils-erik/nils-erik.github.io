define(['react', 'react-redux', 'prop-types', './toggle_list.jsx', './facet-dropdown.jsx', './reducers'], function (React, _ref, PropTypes, ToggleList, Dropdown, _ref2) {
  var connect = _ref.connect;
  var getActiveFacets = _ref2.getActiveFacets;

  var ContainerComponent = function ContainerComponent(_ref3) {
    var activeFacets = _ref3.activeFacets,
        state = _ref3.reduxState,
        resetVisibleFacets = _ref3.resetVisibleFacets,
        selectFacet = _ref3.selectFacet,
        showMoreFacets = _ref3.showMoreFacets,
        submitFilter = _ref3.submitFilter,
        toggleFacet = _ref3.toggleFacet,
        unselectFacet = _ref3.unselectFacet;
    var header = /*#__PURE__*/React.createElement("div", {
      role: "button",
      tabIndex: "0",
      onClick: function onClick() {
        return toggleFacet(undefined);
      },
      onKeyPress: function onKeyPress(e) {
        if (e.which === 13) {
          toggleFacet(undefined);
        }
      },
      style: {
        display: 'inline-block'
      }
    }, /*#__PURE__*/React.createElement("h3", {
      className: "facet__header"
    }, state.config.facetTitle));
    return /*#__PURE__*/React.createElement("div", {
      className: "facet__container"
    }, /*#__PURE__*/React.createElement(ToggleList, {
      reduxState: state,
      currentLevel: 1,
      showMoreFacets: showMoreFacets,
      resetVisibleFacets: resetVisibleFacets,
      toggleFacet: toggleFacet,
      selectFacet: selectFacet,
      unselectFacet: unselectFacet
    }, header, /*#__PURE__*/React.createElement(Dropdown, {
      activeFacets: activeFacets,
      onSubmitFilter: submitFilter
    })));
  };

  ContainerComponent.defaultProps = {};
  ContainerComponent.propTypes = {
    activeFacets: PropTypes.arrayOf(PropTypes.object).isRequired,
    reduxState: PropTypes.shape({
      config: PropTypes.object,
      state: PropTypes.object,
      pagination: PropTypes.object,
      children: PropTypes.array,
      facets: PropTypes.object
    }).isRequired,
    showMoreFacets: PropTypes.func.isRequired,
    resetVisibleFacets: PropTypes.func.isRequired,
    toggleFacet: PropTypes.func.isRequired,
    selectFacet: PropTypes.func.isRequired,
    unselectFacet: PropTypes.func.isRequired,
    submitFilter: PropTypes.func.isRequired
  };

  var mapStateToProps = function mapStateToProps(state) {
    return {
      reduxState: state,
      activeFacets: getActiveFacets(state, state.state.selected)
    };
  }; // ownProps contains the widget's actions object which has
  // overridden certain methods to be unique to the widget


  var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
    return {
      selectFacet: function selectFacet(id) {
        dispatch(ownProps.actions.select_facet(id));
      },
      unselectFacet: function unselectFacet(id) {
        dispatch(ownProps.actions.unselect_facet(id));
      },
      toggleFacet: function toggleFacet(id, open) {
        dispatch(ownProps.actions.toggle_facet(id, open));
      },
      showMoreFacets: function showMoreFacets(id) {
        dispatch(ownProps.actions.increase_visible(id));
      },
      resetVisibleFacets: function resetVisibleFacets(id) {
        dispatch(ownProps.actions.reset_visible(id));
      },
      submitFilter: function submitFilter(logicOption) {
        dispatch(ownProps.actions.submit_filter(logicOption));
      }
    };
  };

  return connect(mapStateToProps, mapDispatchToProps)(ContainerComponent);
});
