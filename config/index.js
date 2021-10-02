function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

!function (e, t) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module ? t(exports, require("react"), require("redux"), require("react-dom")) : "function" == typeof define && define.amd ? define(["exports", "react", "redux", "react-dom"], t) : t((e = e || self).ReactRedux = {}, e.React, e.Redux, e.ReactDOM);
}(this, function (e, t, r, n) {
  "use strict";

  var o = "default" in t ? t.default : t;

  function u(e, t) {
    return e(t = {
      exports: {}
    }, t.exports), t.exports;
  }

  var i = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";

  function a() {}

  function c() {}

  c.resetWarningCache = a;
  var s = u(function (e) {
    e.exports = function () {
      function e(e, t, r, n, o, u) {
        if (u !== i) {
          var a = Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");
          throw a.name = "Invariant Violation", a;
        }
      }

      function t() {
        return e;
      }

      e.isRequired = e;
      var r = {
        array: e,
        bool: e,
        func: e,
        number: e,
        object: e,
        string: e,
        symbol: e,
        any: e,
        arrayOf: t,
        element: e,
        elementType: e,
        instanceOf: t,
        node: e,
        objectOf: t,
        oneOf: t,
        oneOfType: t,
        shape: t,
        exact: t,
        checkPropTypes: c,
        resetWarningCache: a
      };
      return r.PropTypes = r, r;
    }();
  }),
      f = o.createContext(null);

  var p = function p(e) {
    e();
  },
      d = function d() {
    return p;
  },
      l = null,
      y = {
    notify: function notify() {}
  };

  var v = function () {
    function e(e, t) {
      this.store = e, this.parentSub = t, this.unsubscribe = null, this.listeners = y, this.handleChangeWrapper = this.handleChangeWrapper.bind(this);
    }

    var t = e.prototype;
    return t.addNestedSub = function (e) {
      return this.trySubscribe(), this.listeners.subscribe(e);
    }, t.notifyNestedSubs = function () {
      this.listeners.notify();
    }, t.handleChangeWrapper = function () {
      this.onStateChange && this.onStateChange();
    }, t.isSubscribed = function () {
      return !!this.unsubscribe;
    }, t.trySubscribe = function () {
      this.unsubscribe || (this.unsubscribe = this.parentSub ? this.parentSub.addNestedSub(this.handleChangeWrapper) : this.store.subscribe(this.handleChangeWrapper), this.listeners = function () {
        var e = d(),
            t = [],
            r = [];
        return {
          clear: function clear() {
            r = l, t = l;
          },
          notify: function notify() {
            var n = t = r;
            e(function () {
              for (var e = 0; n.length > e; e++) {
                n[e]();
              }
            });
          },
          get: function get() {
            return r;
          },
          subscribe: function subscribe(e) {
            var n = !0;
            return r === t && (r = t.slice()), r.push(e), function () {
              n && t !== l && (n = !1, r === t && (r = t.slice()), r.splice(r.indexOf(e), 1));
            };
          }
        };
      }());
    }, t.tryUnsubscribe = function () {
      this.unsubscribe && (this.unsubscribe(), this.unsubscribe = null, this.listeners.clear(), this.listeners = y);
    }, e;
  }();

  function m(e) {
    var r = e.store,
        n = e.context,
        u = e.children,
        i = t.useMemo(function () {
      var e = new v(r);
      return e.onStateChange = e.notifyNestedSubs, {
        store: r,
        subscription: e
      };
    }, [r]),
        a = t.useMemo(function () {
      return r.getState();
    }, [r]);
    return t.useEffect(function () {
      var e = i.subscription;
      return e.trySubscribe(), a !== r.getState() && e.notifyNestedSubs(), function () {
        e.tryUnsubscribe(), e.onStateChange = null;
      };
    }, [i, a]), o.createElement((n || f).Provider, {
      value: i
    }, u);
  }

  function h() {
    return (h = Object.assign || function (e) {
      for (var t = 1; arguments.length > t; t++) {
        var r = arguments[t];

        for (var n in r) {
          Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
        }
      }

      return e;
    }).apply(this, arguments);
  }

  function b(e, t) {
    if (null == e) return {};
    var r,
        n,
        o = {},
        u = Object.keys(e);

    for (n = 0; u.length > n; n++) {
      0 > t.indexOf(r = u[n]) && (o[r] = e[r]);
    }

    return o;
  }

  m.propTypes = {
    store: s.shape({
      subscribe: s.func.isRequired,
      dispatch: s.func.isRequired,
      getState: s.func.isRequired
    }),
    context: s.object,
    children: s.any
  };
  var P,
      S = u(function (e, t) {
    Object.defineProperty(t, "__esModule", {
      value: !0
    });
    var r = "function" == typeof Symbol && Symbol.for,
        n = r ? Symbol.for("react.element") : 60103,
        o = r ? Symbol.for("react.portal") : 60106,
        u = r ? Symbol.for("react.fragment") : 60107,
        i = r ? Symbol.for("react.strict_mode") : 60108,
        a = r ? Symbol.for("react.profiler") : 60114,
        c = r ? Symbol.for("react.provider") : 60109,
        s = r ? Symbol.for("react.context") : 60110,
        f = r ? Symbol.for("react.async_mode") : 60111,
        p = r ? Symbol.for("react.concurrent_mode") : 60111,
        d = r ? Symbol.for("react.forward_ref") : 60112,
        l = r ? Symbol.for("react.suspense") : 60113,
        y = r ? Symbol.for("react.suspense_list") : 60120,
        v = r ? Symbol.for("react.memo") : 60115,
        m = r ? Symbol.for("react.lazy") : 60116,
        h = r ? Symbol.for("react.fundamental") : 60117,
        b = r ? Symbol.for("react.responder") : 60118;

    function P(e) {
      if ("object" == _typeof(e) && null !== e) {
        var t = e.$$typeof;

        switch (t) {
          case n:
            switch (e = e.type) {
              case f:
              case p:
              case u:
              case a:
              case i:
              case l:
                return e;

              default:
                switch (e = e && e.$$typeof) {
                  case s:
                  case d:
                  case c:
                    return e;

                  default:
                    return t;
                }

            }

          case m:
          case v:
          case o:
            return t;
        }
      }
    }

    function S(e) {
      return P(e) === p;
    }

    t.typeOf = P, t.AsyncMode = f, t.ConcurrentMode = p, t.ContextConsumer = s, t.ContextProvider = c, t.Element = n, t.ForwardRef = d, t.Fragment = u, t.Lazy = m, t.Memo = v, t.Portal = o, t.Profiler = a, t.StrictMode = i, t.Suspense = l, t.isValidElementType = function (e) {
      return "string" == typeof e || "function" == typeof e || e === u || e === p || e === a || e === i || e === l || e === y || "object" == _typeof(e) && null !== e && (e.$$typeof === m || e.$$typeof === v || e.$$typeof === c || e.$$typeof === s || e.$$typeof === d || e.$$typeof === h || e.$$typeof === b);
    }, t.isAsyncMode = function (e) {
      return S(e) || P(e) === f;
    }, t.isConcurrentMode = S, t.isContextConsumer = function (e) {
      return P(e) === s;
    }, t.isContextProvider = function (e) {
      return P(e) === c;
    }, t.isElement = function (e) {
      return "object" == _typeof(e) && null !== e && e.$$typeof === n;
    }, t.isForwardRef = function (e) {
      return P(e) === d;
    }, t.isFragment = function (e) {
      return P(e) === u;
    }, t.isLazy = function (e) {
      return P(e) === m;
    }, t.isMemo = function (e) {
      return P(e) === v;
    }, t.isPortal = function (e) {
      return P(e) === o;
    }, t.isProfiler = function (e) {
      return P(e) === a;
    }, t.isStrictMode = function (e) {
      return P(e) === i;
    }, t.isSuspense = function (e) {
      return P(e) === l;
    };
  });
  (P = S) && P.__esModule && Object.prototype.hasOwnProperty.call(P, "default");
  var g = u(function (e) {
    e.exports = S;
  }),
      O = g.isContextConsumer,
      w = {
    childContextTypes: !0,
    contextType: !0,
    contextTypes: !0,
    defaultProps: !0,
    displayName: !0,
    getDefaultProps: !0,
    getDerivedStateFromError: !0,
    getDerivedStateFromProps: !0,
    mixins: !0,
    propTypes: !0,
    type: !0
  },
      C = {
    name: !0,
    length: !0,
    prototype: !0,
    caller: !0,
    callee: !0,
    arguments: !0,
    arity: !0
  },
      x = {
    $$typeof: !0,
    compare: !0,
    defaultProps: !0,
    displayName: !0,
    propTypes: !0,
    type: !0
  },
      R = {};

  function E(e) {
    return g.isMemo(e) ? x : R[e.$$typeof] || w;
  }

  R[g.ForwardRef] = {
    $$typeof: !0,
    render: !0,
    defaultProps: !0,
    displayName: !0,
    propTypes: !0
  };
  var M = Object.defineProperty,
      T = Object.getOwnPropertyNames,
      j = Object.getOwnPropertySymbols,
      $ = Object.getOwnPropertyDescriptor,
      N = Object.getPrototypeOf,
      q = Object.prototype;

  var _ = function e(t, r, n) {
    if ("string" != typeof r) {
      if (q) {
        var o = N(r);
        o && o !== q && e(t, o, n);
      }

      var u = T(r);
      j && (u = u.concat(j(r)));

      for (var i = E(t), a = E(r), c = 0; u.length > c; ++c) {
        var s = u[c];

        if (!(C[s] || n && n[s] || a && a[s] || i && i[s])) {
          var f = $(r, s);

          try {
            M(t, s, f);
          } catch (e) {}
        }
      }

      return t;
    }

    return t;
  },
      D = function D(e, t, r, n, o, u, i, a) {
    if (!e) {
      var c;
      if (void 0 === t) c = Error("Minified exception occurred; use the non-minified dev environment for the full error message and additional helpful warnings.");else {
        var s = [r, n, o, u, i, a],
            f = 0;
        (c = Error(t.replace(/%s/g, function () {
          return s[f++];
        }))).name = "Invariant Violation";
      }
      throw c.framesToPop = 1, c;
    }
  },
      k = "undefined" != typeof window && void 0 !== window.document && void 0 !== window.document.createElement ? t.useLayoutEffect : t.useEffect,
      F = [],
      W = [null, null];

  function A(e, t) {
    return [t.payload, e[1] + 1];
  }

  var H = function H() {
    return [null, 0];
  };

  function U(e, r) {
    void 0 === r && (r = {});
    var n = r.getDisplayName,
        u = void 0 === n ? function (e) {
      return "ConnectAdvanced(" + e + ")";
    } : n,
        i = r.methodName,
        a = void 0 === i ? "connectAdvanced" : i,
        c = r.renderCountProp,
        s = void 0 === c ? void 0 : c,
        p = r.shouldHandleStateChanges,
        d = void 0 === p || p,
        l = r.storeKey,
        y = void 0 === l ? "store" : l,
        m = r.withRef,
        P = void 0 !== m && m,
        S = r.forwardRef,
        g = void 0 !== S && S,
        w = r.context,
        C = void 0 === w ? f : w,
        x = b(r, ["getDisplayName", "methodName", "renderCountProp", "shouldHandleStateChanges", "storeKey", "withRef", "forwardRef", "context"]);
    D(void 0 === s, "renderCountProp is removed. render counting is built into the latest React Dev Tools profiling extension"), D(!P, "withRef is removed. To access the wrapped instance, use a ref on the connected component");
    D("store" === y, "storeKey has been removed and does not do anything. To use a custom Redux store for specific components, create a custom React context with React.createContext(), and pass the context object to React Redux's Provider and specific components like: <Provider context={MyContext}><ConnectedComponent context={MyContext} /></Provider>. You may also pass a {context : MyContext} option to connect");
    var R = C;
    return function (r) {
      var n = r.displayName || r.name || "Component",
          i = u(n),
          c = h({}, x, {
        getDisplayName: u,
        methodName: a,
        renderCountProp: s,
        shouldHandleStateChanges: d,
        storeKey: y,
        displayName: i,
        wrappedComponentName: n,
        WrappedComponent: r
      }),
          f = x.pure;
      var p = f ? t.useMemo : function (e) {
        return e();
      };

      function l(n) {
        var u = t.useMemo(function () {
          var e = n.forwardedRef,
              t = b(n, ["forwardedRef"]);
          return [n.context, e, t];
        }, [n]),
            a = u[0],
            s = u[1],
            f = u[2],
            l = t.useMemo(function () {
          return a && a.Consumer && O(o.createElement(a.Consumer, null)) ? a : R;
        }, [a, R]),
            y = t.useContext(l),
            m = !!n.store && !!n.store.getState && !!n.store.dispatch;
        D(m || !!y && !!y.store, 'Could not find "store" in the context of "' + i + '". Either wrap the root component in a <Provider>, or pass a custom React context provider to <Provider> and the corresponding React context consumer to ' + i + " in connect options.");
        var P = m ? n.store : y.store,
            S = t.useMemo(function () {
          return function (t) {
            return e(t.dispatch, c);
          }(P);
        }, [P]),
            g = t.useMemo(function () {
          if (!d) return W;
          var e = new v(P, m ? null : y.subscription),
              t = e.notifyNestedSubs.bind(e);
          return [e, t];
        }, [P, m, y]),
            w = g[0],
            C = g[1],
            x = t.useMemo(function () {
          return m ? y : h({}, y, {
            subscription: w
          });
        }, [m, y, w]),
            E = t.useReducer(A, F, H),
            M = E[0][0],
            T = E[1];
        if (M && M.error) throw M.error;

        var j = t.useRef(),
            $ = t.useRef(f),
            N = t.useRef(),
            q = t.useRef(!1),
            _ = p(function () {
          return N.current && f === $.current ? N.current : S(P.getState(), f);
        }, [P, M, f]);

        k(function () {
          $.current = f, j.current = _, q.current = !1, N.current && (N.current = null, C());
        }), k(function () {
          if (d) {
            var e = !1,
                t = null,
                r = function r() {
              if (!e) {
                var r,
                    n,
                    o = P.getState();

                try {
                  r = S(o, $.current);
                } catch (e) {
                  n = e, t = e;
                }

                n || (t = null), r === j.current ? q.current || C() : (j.current = r, N.current = r, q.current = !0, T({
                  type: "STORE_UPDATED",
                  payload: {
                    error: n
                  }
                }));
              }
            };

            w.onStateChange = r, w.trySubscribe(), r();
            return function () {
              if (e = !0, w.tryUnsubscribe(), w.onStateChange = null, t) throw t;
            };
          }
        }, [P, w, S]);
        var U = t.useMemo(function () {
          return o.createElement(r, h({}, _, {
            ref: s
          }));
        }, [s, r, _]);
        return t.useMemo(function () {
          return d ? o.createElement(l.Provider, {
            value: x
          }, U) : U;
        }, [l, U, x]);
      }

      var m = f ? o.memo(l) : l;

      if (m.WrappedComponent = r, m.displayName = i, g) {
        var P = o.forwardRef(function (e, t) {
          return o.createElement(m, h({}, e, {
            forwardedRef: t
          }));
        });
        return P.displayName = i, P.WrappedComponent = r, _(P, r);
      }

      return _(m, r);
    };
  }

  var I = Object.prototype.hasOwnProperty;

  function L(e, t) {
    return e === t ? 0 !== e || 0 !== t || 1 / e == 1 / t : e != e && t != t;
  }

  function K(e, t) {
    if (L(e, t)) return !0;
    if ("object" != _typeof(e) || null === e || "object" != _typeof(t) || null === t) return !1;
    var r = Object.keys(e);
    if (r.length !== Object.keys(t).length) return !1;

    for (var n = 0; r.length > n; n++) {
      if (!I.call(t, r[n]) || !L(e[r[n]], t[r[n]])) return !1;
    }

    return !0;
  }

  function z(e) {
    return function (t, r) {
      var n = e(t, r);

      function o() {
        return n;
      }

      return o.dependsOnOwnProps = !1, o;
    };
  }

  function V(e) {
    return null != e.dependsOnOwnProps ? !!e.dependsOnOwnProps : 1 !== e.length;
  }

  function Y(e, t) {
    return function (t, r) {
      var n = function n(e, t) {
        return n.dependsOnOwnProps ? n.mapToProps(e, t) : n.mapToProps(e);
      };

      return n.dependsOnOwnProps = !0, n.mapToProps = function (t, r) {
        n.mapToProps = e, n.dependsOnOwnProps = V(e);
        var o = n(t, r);
        return "function" == typeof o && (n.mapToProps = o, n.dependsOnOwnProps = V(o), o = n(t, r)), o;
      }, n;
    };
  }

  function B(e, t, r) {
    return h({}, r, {}, e, {}, t);
  }

  var G = [function (e) {
    return "function" == typeof e ? function (e) {
      return function (t, r) {
        var n,
            o = r.pure,
            u = r.areMergedPropsEqual,
            i = !1;
        return function (t, r, a) {
          var c = e(t, r, a);
          return i ? o && u(c, n) || (n = c) : (i = !0, n = c), n;
        };
      };
    }(e) : void 0;
  }, function (e) {
    return e ? void 0 : function () {
      return B;
    };
  }];

  function J(e, t, r, n) {
    return function (o, u) {
      return r(e(o, u), t(n, u), u);
    };
  }

  function Q(e, t, r, n, o) {
    var u,
        i,
        a,
        c,
        s,
        f = o.areStatesEqual,
        p = o.areOwnPropsEqual,
        d = o.areStatePropsEqual,
        l = !1;

    function y(o, l) {
      var y,
          v,
          m = !p(l, i),
          h = !f(o, u);
      return u = o, i = l, m && h ? (a = e(u, i), t.dependsOnOwnProps && (c = t(n, i)), s = r(a, c, i)) : m ? (e.dependsOnOwnProps && (a = e(u, i)), t.dependsOnOwnProps && (c = t(n, i)), s = r(a, c, i)) : h ? (y = e(u, i), v = !d(y, a), a = y, v && (s = r(a, c, i)), s) : s;
    }

    return function (o, f) {
      return l ? y(o, f) : (a = e(u = o, i = f), c = t(n, i), s = r(a, c, i), l = !0, s);
    };
  }

  function X(e, t) {
    var r = t.initMapStateToProps,
        n = t.initMapDispatchToProps,
        o = t.initMergeProps,
        u = b(t, ["initMapStateToProps", "initMapDispatchToProps", "initMergeProps"]),
        i = r(e, u),
        a = n(e, u),
        c = o(e, u);
    return (u.pure ? Q : J)(i, a, c, e, u);
  }

  function Z(e, t, r) {
    for (var n = t.length - 1; n >= 0; n--) {
      var o = t[n](e);
      if (o) return o;
    }

    return function (t, n) {
      throw Error("Invalid value of type " + _typeof(e) + " for " + r + " argument when connecting component " + n.wrappedComponentName + ".");
    };
  }

  function ee(e, t) {
    return e === t;
  }

  var te,
      re,
      ne,
      oe,
      ue,
      ie,
      ae,
      ce,
      se,
      fe,
      pe,
      de,
      le = (oe = void 0 === (ne = (re = void 0 === te ? {} : te).connectHOC) ? U : ne, ie = void 0 === (ue = re.mapStateToPropsFactories) ? [function (e) {
    return "function" == typeof e ? Y(e) : void 0;
  }, function (e) {
    return e ? void 0 : z(function () {
      return {};
    });
  }] : ue, ce = void 0 === (ae = re.mapDispatchToPropsFactories) ? [function (e) {
    return "function" == typeof e ? Y(e) : void 0;
  }, function (e) {
    return e ? void 0 : z(function (e) {
      return {
        dispatch: e
      };
    });
  }, function (e) {
    return e && "object" == _typeof(e) ? z(function (t) {
      return r.bindActionCreators(e, t);
    }) : void 0;
  }] : ae, fe = void 0 === (se = re.mergePropsFactories) ? G : se, de = void 0 === (pe = re.selectorFactory) ? X : pe, function (e, t, r, n) {
    void 0 === n && (n = {});
    var o = n.pure,
        u = void 0 === o || o,
        i = n.areStatesEqual,
        a = void 0 === i ? ee : i,
        c = n.areOwnPropsEqual,
        s = void 0 === c ? K : c,
        f = n.areStatePropsEqual,
        p = void 0 === f ? K : f,
        d = n.areMergedPropsEqual,
        l = void 0 === d ? K : d,
        y = b(n, ["pure", "areStatesEqual", "areOwnPropsEqual", "areStatePropsEqual", "areMergedPropsEqual"]),
        v = Z(e, ie, "mapStateToProps"),
        m = Z(t, ce, "mapDispatchToProps"),
        P = Z(r, fe, "mergeProps");
    return oe(de, h({
      methodName: "connect",
      getDisplayName: function getDisplayName(e) {
        return "Connect(" + e + ")";
      },
      shouldHandleStateChanges: !!e,
      initMapStateToProps: v,
      initMapDispatchToProps: m,
      initMergeProps: P,
      pure: u,
      areStatesEqual: a,
      areOwnPropsEqual: s,
      areStatePropsEqual: p,
      areMergedPropsEqual: l
    }, y));
  });

  function ye() {
    var e = t.useContext(f);
    return D(e, "could not find react-redux context value; please ensure the component is wrapped in a <Provider>"), e;
  }

  function ve(e) {
    void 0 === e && (e = f);
    var r = e === f ? ye : function () {
      return t.useContext(e);
    };
    return function () {
      return r().store;
    };
  }

  var me = ve();

  function he(e) {
    void 0 === e && (e = f);
    var t = e === f ? me : ve(e);
    return function () {
      return t().dispatch;
    };
  }

  var be = he(),
      Pe = function Pe(e, t) {
    return e === t;
  };

  function Se(e) {
    void 0 === e && (e = f);
    var r = e === f ? ye : function () {
      return t.useContext(e);
    };
    return function (e, n) {
      void 0 === n && (n = Pe), D(e, "You must pass a selector to useSelectors");
      var o = r();
      return function (e, r, n, o) {
        var u,
            i = t.useReducer(function (e) {
          return e + 1;
        }, 0)[1],
            a = t.useMemo(function () {
          return new v(n, o);
        }, [n, o]),
            c = t.useRef(),
            s = t.useRef(),
            f = t.useRef();

        try {
          u = e !== s.current || c.current ? e(n.getState()) : f.current;
        } catch (e) {
          var p = "An error occurred while selecting the store state: " + e.message + ".";
          throw c.current && (p += "\nThe error may be correlated with this previous error:\n" + c.current.stack + "\n\nOriginal stack trace:"), Error(p);
        }

        return k(function () {
          s.current = e, f.current = u, c.current = void 0;
        }), k(function () {
          function e() {
            try {
              var e = s.current(n.getState());
              if (r(e, f.current)) return;
              f.current = e;
            } catch (e) {
              c.current = e;
            }

            i({});
          }

          return a.onStateChange = e, a.trySubscribe(), e(), function () {
            return a.tryUnsubscribe();
          };
        }, [n, a]), u;
      }(e, n, o.store, o.subscription);
    };
  }

  var ge = Se();
  p = n.unstable_batchedUpdates, Object.defineProperty(e, "batch", {
    enumerable: !0,
    get: function get() {
      return n.unstable_batchedUpdates;
    }
  }), e.Provider = m, e.ReactReduxContext = f, e.connect = le, e.connectAdvanced = U, e.createDispatchHook = he, e.createSelectorHook = Se, e.createStoreHook = ve, e.shallowEqual = K, e.useDispatch = be, e.useSelector = ge, e.useStore = me, Object.defineProperty(e, "__esModule", {
    value: !0
  });
});
