define(['react', 'react-bootstrap', 'prop-types', 'react-redux', '../actions', './RecommendedList.jsx', './SearchExamples.jsx'], function (React, _ref, PropTypes, _ref2, _ref3, RecommendedList, SearchExamples) {
  var Nav = _ref.Nav,
      NavItem = _ref.NavItem;
  var useDispatch = _ref2.useDispatch,
      useSelector = _ref2.useSelector;
  var setTab = _ref3.setTab,
      emitAnalytics = _ref3.emitAnalytics;

  var selector = function selector(state) {
    return {
      tab: state.tab
    };
  };

  var App = function App() {
    var dispatch = useDispatch();

    var _useSelector = useSelector(selector),
        tab = _useSelector.tab;

    var onSelected = function onSelected(key) {
      dispatch(setTab(key));
      dispatch(emitAnalytics(['send', 'event', 'interaction.main-page', key === 1 ? 'recommender' : 'help']));
    };

    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Nav, {
      bsStyle: "tabs",
      justified: true,
      activeKey: tab,
      onSelect: function onSelect(key) {
        return onSelected(key);
      }
    }, /*#__PURE__*/React.createElement(NavItem, {
      eventKey: 1,
      href: "javascript:void(0);"
    }, "Recommendations"), /*#__PURE__*/React.createElement(NavItem, {
      eventKey: 2,
      href: "javascript:void(0);"
    }, "Search examples")), /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: 200,
        padding: '1rem 0'
      }
    }, tab === 1 ? /*#__PURE__*/React.createElement(RecommendedList, null) : /*#__PURE__*/React.createElement(SearchExamples, null)));
  };

  return App;
});
