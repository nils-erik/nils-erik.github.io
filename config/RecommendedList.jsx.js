define(['react', 'prop-types', 'react-redux', '../actions'], function (React, PropTypes, _ref, _ref2) {
  var useSelector = _ref.useSelector,
      useDispatch = _ref.useDispatch;
  var getRecommendations = _ref2.getRecommendations,
      emitAnalytics = _ref2.emitAnalytics;

  var Paper = function Paper(_ref3) {
    var title = _ref3.title,
        bibcode = _ref3.bibcode,
        author = _ref3.author,
        totalAuthors = _ref3.totalAuthors,
        onClick = _ref3.onClick;
    var el = React.useRef(null);
    React.useEffect(function () {
      if (el.current) {
        el.current.addEventListener('click', onClick);
      }

      return function () {
        if (el.current) {
          el.current.removeEventListener('click', onClick);
        }
      };
    }, []);
    return /*#__PURE__*/React.createElement("li", {
      style: {
        marginTop: '1rem'
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#/abs/".concat(bibcode, "/abstract"),
      ref: el
    }, title), /*#__PURE__*/React.createElement("ul", {
      className: "list-inline"
    }, author.map(function (entry, i) {
      return /*#__PURE__*/React.createElement("li", {
        key: entry
      }, "".concat(entry).concat(i < 2 ? ';' : ''));
    }), totalAuthors > 3 && /*#__PURE__*/React.createElement("li", null, "...")));
  };

  Paper.defaultProps = {
    title: '',
    bibcode: '',
    author: [],
    totalAuthors: 0,
    onClick: function onClick() {}
  };
  Paper.propTypes = {
    title: PropTypes.string,
    bibcode: PropTypes.string,
    author: PropTypes.arrayOf(PropTypes.string),
    totalAuthors: PropTypes.number,
    onClick: PropTypes.func
  };

  var Message = function Message(_ref4) {
    var children = _ref4.children;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem 0'
      }
    }, children);
  };

  Message.propTypes = {
    children: PropTypes.element.isRequired
  };
  var executed = 0;
  var userName = null;
  var reported = false;

  var selector = function selector(state) {
    // reset if it is a different user
    if (state.userName !== userName) {
      executed = 0;
      userName = state.userName;
      reported = false;
    }

    return {
      getRecommendationsRequest: state.requests.GET_RECOMMENDATIONS,
      getDocsRequest: state.requests.GET_DOCS,
      docs: state.docs,
      queryParams: state.queryParams,
      executed: executed,
      reported: reported
    };
  };

  var RecommendedList = function RecommendedList() {
    var dispatch = useDispatch();
    /*
    const onGetMore = () => {
      dispatch(getFullList());
    };
    */

    var _useSelector = useSelector(selector),
        getRecommendationsRequest = _useSelector.getRecommendationsRequest,
        getDocsRequest = _useSelector.getDocsRequest,
        docs = _useSelector.docs,
        queryParams = _useSelector.queryParams,
        userName = _useSelector.userName;

    React.useEffect(function () {
      if (executed + 12 * 60 * 60 * 1000 < Date.now()) {
        // the hook gets called too many times even with [docs] in the args to useEffect
        // (and oracle returns 404 when nothing is found; which is IMHO wrong) but we can't
        // rely on status.failure for that reason
        executed = Date.now();
        dispatch(getRecommendations());
        reported = false;
      } else if (executed && docs.length === 0 && !reported) {
        // we are rendered (send the signal everytime -- even if it was sent already)
        dispatch(emitAnalytics(['send', 'event', 'interaction.no-recommendation', // category
        'no-useful-recommendations', // action
        '', // label,
        0 // value
        ]));
        reported = true;
      }
    });

    var onPaperSelect = function onPaperSelect(_ref5, index) {
      var bibcode = _ref5.bibcode;
      dispatch(emitAnalytics(['send', 'event', 'interaction.recommendation', // category
      queryParams.function, // action
      bibcode, // label,
      index // value
      ]));
    };

    if (getRecommendationsRequest.status === 'pending' || getDocsRequest.status === 'pending') {
      return /*#__PURE__*/React.createElement(Message, null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "fa fa-spinner fa-spin",
        "aria-hidden": "true"
      }), ' ', "Loading..."));
    }

    if (getRecommendationsRequest.status === 'failure' || getDocsRequest.status === 'failure') {
      return /*#__PURE__*/React.createElement(Message, null, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "fa fa-exclamation-triangle text-danger",
        "aria-hidden": "true"
      }), ' ', getRecommendationsRequest.error || getDocsRequest.error));
    }

    if (docs.length === 0) {
      return /*#__PURE__*/React.createElement(Message, null, "Sorry, we do not have any recommendations for you just yet! ADS provides users recommendations based on their reading history, and we suggest that you create an ADS account to take advantage of this feature. If you already have an account, then be sure you are logged in while searching and reading papers. In due time we will be able to provide you with suggestions based on your inferred interests.");
    }

    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("ul", {
      className: "list-unstyled"
    }, docs.map(function (_ref6, index) {
      var title = _ref6.title,
          bibcode = _ref6.bibcode,
          author = _ref6.author,
          totalAuthors = _ref6.totalAuthors;
      return /*#__PURE__*/React.createElement(Paper, {
        key: bibcode,
        title: title,
        bibcode: bibcode,
        author: author,
        totalAuthors: totalAuthors,
        onClick: function onClick() {
          return onPaperSelect(docs[index], index);
        }
      });
    })));
  };

  return RecommendedList;
});
