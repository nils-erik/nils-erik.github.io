define(['react', 'prop-types', 'react-redux', '../models/index', '../actions'], function (React, PropTypes, _ref, _ref2, _ref3) {
  var useDispatch = _ref.useDispatch;
  var searchExamples = _ref2.searchExamples;
  var updateSearchBar = _ref3.updateSearchBar,
      emitAnalytics = _ref3.emitAnalytics;

  var Dl = function Dl(_ref4) {
    var children = _ref4.children;
    return /*#__PURE__*/React.createElement("dl", {
      className: "dl-horizontal"
    }, children);
  };

  Dl.propTypes = {
    children: PropTypes.element.isRequired
  };

  var Entry = function Entry(_ref5) {
    var label = _ref5.label,
        text = _ref5.text,
        onClick = _ref5.onClick,
        tooltip = _ref5.tooltip;
    return (
      /*#__PURE__*/
      // eslint-disable-next-line react/jsx-fragments
      React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("dt", null, label), /*#__PURE__*/React.createElement("dd", null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        onClick: onClick,
        className: "text-link",
        style: {
          border: 'dotted 1px rgba(0,0,0,0.3)',
          marginRight: '4px'
        }
      }, text), tooltip && /*#__PURE__*/React.createElement("i", {
        className: "icon-help",
        "aria-hidden": "true",
        "data-toggle": "tooltip",
        title: tooltip
      })))
    );
  };

  Entry.defaultProps = {
    label: '',
    text: '',
    tooltip: '',
    onClick: function onClick() {}
  };
  Entry.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
    text: PropTypes.string,
    tooltip: PropTypes.string
  };

  var SearchExamples = function SearchExamples() {
    var dispatch = useDispatch();

    var _onClick = function onClick(text) {
      dispatch(updateSearchBar(text));
      dispatch(emitAnalytics(['send', 'event', 'interaction.suggestion-used']));
    };

    return /*#__PURE__*/React.createElement("div", {
      style: {
        paddingTop: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "quick-reference"
    }, /*#__PURE__*/React.createElement(Dl, null, searchExamples.slice(0, 7).map(function (entry) {
      return /*#__PURE__*/React.createElement(Entry, {
        label: entry.label,
        text: entry.example,
        tooltip: entry.tooltip,
        onClick: function onClick() {
          return _onClick(entry.example);
        },
        key: entry.label
      });
    }))), /*#__PURE__*/React.createElement("div", {
      className: "quick-reference"
    }, /*#__PURE__*/React.createElement(Dl, null, searchExamples.slice(7).map(function (entry) {
      return /*#__PURE__*/React.createElement(Entry, {
        label: entry.label,
        text: entry.example,
        tooltip: entry.tooltip,
        onClick: function onClick() {
          return _onClick(entry.example);
        },
        key: entry.label
      });
    }))));
  };

  return SearchExamples;
});
