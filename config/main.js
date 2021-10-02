function _typeof2(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

define('config/common.config',[], function () {
  if (window.skipMain) {
    requirejs.config({
      baseUrl: '../../'
    });
  }

  requirejs.config({
    shim: {
      mathjax: {
        exports: 'MathJax',
        init: function init() {
          MathJax.Hub.Config({
            messageStyle: 'none',
            HTML: ['input/TeX', 'output/HTML-CSS'],
            TeX: {
              extensions: ['AMSmath.js', 'AMSsymbols.js'],
              equationNumbers: {
                autoNumber: 'AMS'
              }
            },
            extensions: ['tex2jax.js'],
            jax: ['input/TeX', 'output/HTML-CSS'],
            tex2jax: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true
            },
            'HTML-CSS': {
              availableFonts: ['TeX'],
              linebreaks: {
                automatic: true
              }
            }
          });
          MathJax.Hub.Startup.onload();
          return MathJax;
        }
      }
    }
  });

  require(['config/discovery.vars', 'regenerator-runtime', 'array-flat-polyfill'], function (config) {
    // rca: not sure why the ganalytics is loaded here instead of inside analytics.js
    //      perhaps it is because it is much/little sooner this way?
    // make sure that google analytics never blocks app load
    setTimeout(function () {
      require(['google-analytics', 'analytics'], function (_, analytics) {
        // set ganalytics debugging
        //window.ga_debug = {trace: true};
        analytics('create', config.googleTrackingCode || '', config.googleTrackingOptions); // if we ever want to modify what experiment/variant the user
        // is going to receive, it has to happen here - by modifying the
        // _gaexp cookie -- but at this stage we haven't yet downloaded
        // optimize AND we haven't setup any of our api calls
        // example that sets the variant 2 of the experiment
        // document.cookie = '_gaexp=GAX1.1.WFD4u8V3QkaI5EcZ969yeQ.18459.2;';

        if (config.googleOptimizeCode) {
          analytics('require', config.googleOptimizeCode);
          if (!config.debugExportBBB) console.warn('AB testing will be loaded, but bbb object is not exposed. Change debugExportBBB if needed.');
        }
      });
    }, 0);
  }); // set up handlebars helpers


  require(['hbs/handlebars'], function (Handlebars) {
    // register helpers
    // http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/#comment-44
    // eg  (where current is a variable): {{#compare current 1 operator=">"}}
    Handlebars.registerHelper('compare', function (lvalue, rvalue, options) {
      var operators;
      var result;
      var operator;

      if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
      }

      if (options === undefined || !options.hash || !options.hash.operator) {
        operator = '===';
      } else {
        operator = options.hash.operator;
      }

      operators = {
        '==': function _(l, r) {
          return l == r;
        },
        '===': function _(l, r) {
          return l === r;
        },
        '!=': function _(l, r) {
          return l != r;
        },
        '!==': function _(l, r) {
          return l !== r;
        },
        '<': function _(l, r) {
          return l < r;
        },
        '>': function _(l, r) {
          return l > r;
        },
        '<=': function _(l, r) {
          return l <= r;
        },
        '>=': function _(l, r) {
          return l >= r;
        },
        typeof: function _typeof(l, r) {
          return _typeof2(l) === r;
        }
      };

      if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
      }

      result = operators[operator](lvalue, rvalue);

      if (result) {
        return options.fn(this);
      }

      return options.inverse(this);
    });
    Handlebars.registerHelper('toJSON', function (object) {
      return JSON.stringify(object);
    });
    Handlebars.registerHelper('isdefined', function (value) {
      return typeof value !== 'undefined';
    });
  }); // set validation callbacks used by authentication and user settings widgets


  require(['backbone-validation'], function () {
    // this allows for instant validation of form fields using the backbone-validation plugin
    _.extend(Backbone.Validation.callbacks, {
      valid: function valid(view, attr, selector) {
        var $el = view.$('input[name=' + attr + ']');
        $el.closest('.form-group').removeClass('has-error').find('.help-block').html('').addClass('no-show');
      },
      invalid: function invalid(view, attr, error, selector) {
        var $el = view.$('[name=' + attr + ']');
        $group = $el.closest('.form-group');

        if (view.submit === true) {
          // only show error states if there has been a submit event
          $group.addClass('has-error');
          $group.find('.help-block').html(error).removeClass('no-show');
        }
      }
    });
  }); // d3/d3-cloud don't like to load normally from a CDN


  require(['d3', 'd3-cloud'], function (d3, cloud) {
    var g = window;

    if (!g.d3) {
      g.d3 = d3;
    }

    if (g.d3 && g.d3.layout && !g.d3.layout.cloud) {
      g.d3.layout.cloud = cloud;
    }
    /**
     * d3.legend.js
     * (C) 2012 ziggy.jonsson.nyc@gmail.com
     * MIT licence
     */


    (function () {
      d3.legend = function (g) {
        g.each(function () {
          var g = d3.select(this);
          var items = {};
          var svg = d3.select(g.property('nearestViewportElement'));
          var legendPadding = g.attr('data-style-padding') || 5;
          var lb = g.selectAll('.legend-box').data([true]);
          var li = g.selectAll('.legend-items').data([true]);
          lb.enter().append('rect').classed('legend-box', true);
          li.enter().append('g').classed('legend-items', true);

          try {
            svg.selectAll('[data-legend]').each(function () {
              var self = d3.select(this);
              items[self.attr('data-legend')] = {
                pos: self.attr('data-legend-pos') || this.getBBox().y,
                color: self.attr('data-legend-color') != undefined ? self.attr('data-legend-color') : self.style('fill') != 'none' ? self.style('fill') : self.style('stroke')
              };
            });
          } catch (e) {// firefox tends to have issue with hidden elements
            // should continue if it doesn't die here
          }

          items = d3.entries(items).sort(function (a, b) {
            return a.value.pos - b.value.pos;
          });
          var itemOffset = 0;
          li.selectAll('text').data(items, function (d) {
            return d.key;
          }).call(function (d) {
            d.enter().append('text');
          }).call(function (d) {
            d.exit().remove();
          }).attr('y', function (d, i) {
            if (i === 0) {
              return '0em';
            }

            itemOffset += 0.2;
            return i + itemOffset + 'em';
          }).attr('x', '1em').text(function (d) {
            return d.key;
          });
          li.selectAll('circle').data(items, function (d) {
            return d.key;
          }).call(function (d) {
            d.enter().append('circle');
          }).call(function (d) {
            d.exit().remove();
          }).attr('cy', function (d, i) {
            return i - 0.25 + 'em';
          }).attr('cx', 0).attr('r', '0.4em').style('fill', function (d) {
            return d.value.color;
          }); // Reposition and resize the box

          var lbbox = li[0][0].getBBox();
          lb.attr('x', lbbox.x - legendPadding).attr('y', lbbox.y - legendPadding).attr('height', lbbox.height + 2 * legendPadding).attr('width', lbbox.width + 2 * legendPadding);
        });
        return g;
      };
    })();
  });

  require(['jquery'], function ($) {
    $.fn.getCursorPosition = function () {
      var input = this.get(0);
      if (!input) return; // No (input) element found

      if ('selectionStart' in input) {
        // Standard-compliant browsers
        return input.selectionStart;
      }

      if (document.selection) {
        // IE
        input.focus();
        var sel = document.selection.createRange();
        var selLen = document.selection.createRange().text.length;
        sel.moveStart('character', -input.value.length);
        return sel.text.length - selLen;
      }
    }; // manually highlight a selection of text, or just move the cursor if no end val is given


    $.fn.selectRange = function (start, end) {
      if (!end) end = start;
      return this.each(function () {
        if (this.setSelectionRange) {
          this.focus();
          this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
          var range = this.createTextRange();
          range.collapse(true);
          range.moveEnd('character', end);
          range.moveStart('character', start);
          range.select();
        }
      });
    };
  });
});

// Main config file for the Discovery application
require.config({
  // Initialize the application with the main application file or if we run
  // as a test, then load the test unittests
  deps: function () {
    if (typeof window !== 'undefined' && window.skipMain) {
      return ['common.config'];
    }

    return ['config/common.config', 'js/apps/discovery/main'];
  }(),
  // this will be overridden in the compiled file
  waitSeconds: 30,
  // Configuration we want to make available to modules of ths application
  // see: http://requirejs.org/docs/api.html#config-moduleconfig
  config: {
    es6: {
      modules: undefined
    },
    'js/components/persistent_storage': {
      // the unique namespace under which the local storage will be created
      // so every new instance of the storage will be saving its data into
      // <namespace>[other-name]
      namespace: 'bumblebee'
    },
    'js/apps/discovery/main': {
      core: {
        controllers: {
          FeedbackMediator: 'js/wraps/discovery_mediator',
          QueryMediator: 'js/components/query_mediator',
          Diagnostics: 'js/bugutils/diagnostics',
          AlertsController: 'js/wraps/alerts_mediator',
          Orcid: 'js/modules/orcid/module',
          SecondOrderController: 'js/components/second_order_controller',
          HotkeysController: 'js/components/hotkeys_controller',
          Experiments: 'js/components/experiments'
        },
        services: {
          Api: 'js/services/api',
          PubSub: 'js/services/pubsub',
          Navigator: 'js/apps/discovery/navigator',
          PersistentStorage: 'js/services/storage',
          HistoryManager: 'js/components/history_manager'
        },
        objects: {
          User: 'js/components/user',
          Session: 'js/components/session',
          DynamicConfig: 'config/discovery.vars',
          MasterPageManager: 'js/page_managers/master',
          AppStorage: 'js/components/app_storage',
          RecaptchaManager: 'recaptcha!js/components/recaptcha_manager',
          CSRFManager: 'js/components/csrf_manager',
          LibraryController: 'js/components/library_controller',
          DocStashController: 'js/components/doc_stash_controller',
          Utils: 'utils'
        },
        modules: {
          FacetFactory: 'js/widgets/facet/factory'
        }
      },
      widgets: {
        LandingPage: 'js/wraps/landing_page_manager/landing_page_manager',
        SearchPage: 'js/wraps/results_page_manager',
        DetailsPage: 'js/wraps/abstract_page_manager/abstract_page_manager',
        AuthenticationPage: 'js/wraps/authentication_page_manager',
        SettingsPage: 'js/wraps/user_settings_page_manager/user_page_manager',
        OrcidPage: 'js/wraps/orcid_page_manager/orcid_page_manager',
        OrcidInstructionsPage: 'js/wraps/orcid-instructions-page-manager/manager',
        ReactPageManager: 'js/react/PageManager',
        LibrariesPage: 'js/wraps/libraries_page_manager/libraries_page_manager',
        HomePage: 'js/wraps/home_page_manager/home_page_manager',
        PublicLibrariesPage: 'js/wraps/public_libraries_page_manager/public_libraries_manager',
        ErrorPage: 'js/wraps/error_page_manager/error_page_manager',
        Authentication: 'js/widgets/authentication/widget',
        UserSettings: 'js/widgets/user_settings/widget',
        UserPreferences: 'js/widgets/preferences/widget',
        LibraryImport: 'js/widgets/library_import/widget',
        BreadcrumbsWidget: 'js/widgets/filter_visualizer/widget',
        NavbarWidget: 'js/widgets/navbar/widget',
        UserNavbarWidget: 'js/widgets/user_navbar/widget',
        AlertsWidget: 'js/widgets/alerts/widget',
        ClassicSearchForm: 'js/widgets/classic_form/widget',
        SearchWidget: 'js/widgets/search_bar/search_bar_widget',
        PaperSearchForm: 'js/widgets/paper_search_form/widget',
        Results: 'js/widgets/results/widget',
        QueryInfo: 'js/widgets/query_info/query_info_widget',
        QueryDebugInfo: 'js/widgets/api_query/widget',
        ExportWidget: 'js/widgets/export/widget.jsx',
        Sort: 'js/widgets/sort/widget.jsx',
        ExportDropdown: 'js/wraps/export_dropdown',
        VisualizationDropdown: 'js/wraps/visualization_dropdown',
        AuthorNetwork: 'js/wraps/author_network',
        PaperNetwork: 'js/wraps/paper_network',
        ConceptCloud: 'js/widgets/wordcloud/widget',
        BubbleChart: 'js/widgets/bubble_chart/widget',
        AuthorAffiliationTool: 'js/widgets/author_affiliation_tool/widget.jsx',
        Metrics: 'js/widgets/metrics/widget',
        CitationHelper: 'js/widgets/citation_helper/widget',
        OrcidBigWidget: 'js/modules/orcid/widget/widget',
        OrcidSelector: 'js/widgets/orcid-selector/widget.jsx',
        AffiliationFacet: 'js/wraps/affiliation_facet',
        AuthorFacet: 'js/wraps/author_facet',
        BibgroupFacet: 'js/wraps/bibgroup_facet',
        BibstemFacet: 'js/wraps/bibstem_facet',
        DataFacet: 'js/wraps/data_facet',
        DatabaseFacet: 'js/wraps/database_facet',
        GrantsFacet: 'js/wraps/grants_facet',
        KeywordFacet: 'js/wraps/keyword_facet',
        ObjectFacet: 'js/wraps/simbad_object_facet',
        NedObjectFacet: 'js/wraps/ned_object_facet',
        RefereedFacet: 'js/wraps/refereed_facet',
        VizierFacet: 'js/wraps/vizier_facet',
        GraphTabs: 'js/wraps/graph_tabs',
        FooterWidget: 'js/widgets/footer/widget',
        PubtypeFacet: 'js/wraps/pubtype_facet',
        ShowAbstract: 'js/widgets/abstract/widget',
        ShowGraphics: 'js/widgets/graphics/widget',
        ShowGraphicsSidebar: 'js/wraps/sidebar-graphics-widget',
        ShowReferences: 'js/wraps/references',
        ShowCitations: 'js/wraps/citations',
        ShowCoreads: 'js/wraps/coreads',
        ShowSimilar: 'js/wraps/similar',
        MetaTagsWidget: 'js/widgets/meta_tags/widget',
        // can't camel case because router only capitalizes first letter
        ShowToc: 'js/wraps/table_of_contents',
        ShowResources: 'js/widgets/resources/widget.jsx',
        ShowAssociated: 'js/widgets/associated/widget.jsx',
        ShowRecommender: 'js/widgets/recommender/widget',
        ShowMetrics: 'js/wraps/paper_metrics',
        ShowExportcitation: 'js/wraps/paper_export',
        ShowFeedback: 'reactify!js/react/BumblebeeWidget?FeedbackForms',
        ShowLibraryAdd: 'js/wraps/abstract_page_library_add/widget',
        IndividualLibraryWidget: 'js/widgets/library_individual/widget',
        LibraryActionsWidget: 'js/widgets/library_actions/widget.jsx',
        AllLibrariesWidget: 'js/widgets/libraries_all/widget',
        LibraryListWidget: 'js/widgets/library_list/widget',
        // react widgets
        MyAdsFreeform: 'reactify!js/react/BumblebeeWidget?MyAdsFreeform',
        MyAdsDashboard: 'reactify!js/react/BumblebeeWidget?MyAdsDashboard',
        RecommenderWidget: 'reactify!js/react/BumblebeeWidget?Recommender'
      },
      plugins: {}
    }
  },
  // Configuration for the facades (you can pick specific implementation, just for your
  // application) see http://requirejs.org/docs/api.html#config-map
  map: {
    '*': {
      pubsub_service_impl: 'js/services/default_pubsub'
    }
  },
  paths: {
    // bumblebee components (here we'll lists simple names), paths are relative
    // to the config (the module that bootstraps our application; look at the html)
    // as a convention, all modules should be loaded using 'symbolic' names
    router: 'js/apps/discovery/router',
    analytics: 'js/components/analytics',
    // Opt for Lo-Dash Underscore compatibility build over Underscore.
    underscore: ['//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.2/lodash.min', 'libs/lodash/lodash.compat'],
    // 3rd party dependencies
    // I can't for the life of my figure out how to swap non-minified libs in dev
    // to minified libs in the r.js optimize task
    async: 'libs/requirejs-plugins/async',
    babel: 'libs/requirejs-babel-plugin/babel-5.8.34.min',
    backbone: ['//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min', 'libs/backbone/backbone'],
    'backbone-validation': ['//cdnjs.cloudflare.com/ajax/libs/backbone.validation/0.11.3/backbone-validation-amd-min', 'libs/backbone-validation/backbone-validation'],
    'backbone.stickit': ['//cdnjs.cloudflare.com/ajax/libs/backbone.stickit/0.8.0/backbone.stickit.min', 'libs/backbone.stickit/backbone.stickit'],
    'backbone.wreqr': ['//cdnjs.cloudflare.com/ajax/libs/backbone.wreqr/1.0.0/backbone.wreqr.min', 'libs/backbone.wreqr/lib/backbone.wreqr'],
    bootstrap: ['//ajax.aspnetcdn.com/ajax/bootstrap/3.3.5/bootstrap.min', 'libs/bootstrap/bootstrap'],
    bowser: '//cdn.jsdelivr.net/npm/bowser@2.11.0/es5.min',
    // '//cdn.jsdelivr.net/npm/bowser@2.4.0/bundled',
    cache: 'libs/cache/index',
    classnames: ['//cdnjs.cloudflare.com/ajax/libs/classnames/2.2.5/index.min', '../bower_components/classnames/index'],
    clipboard: ['//cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.7.1/clipboard.min', 'libs/clipboard/clipboard'],
    d3: ['//cdnjs.cloudflare.com/ajax/libs/d3/3.4.6/d3.min', 'libs/d3/d3.min'],
    'd3-cloud': ['//cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.min', 'libs/d3-cloud/d3.layout.cloud'],
    enzyme: 'libs/enzyme/index',
    es6: 'libs/requirejs-babel-plugin/es6',
    filesaver: ['//cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/FileSaver.min', 'libs/file-saver/index'],
    'google-analytics': [// to activate local tunnel (for us to collect all analytics data)
    // uncomment this; k12 should have ingress-nginx-proxy image deployed
    // that can proxy requests to /analytics
    // '/analytics/analytics'
    'libs/g', 'data:application/javascript,'],
    hbs: 'libs/require-handlebars-plugin/hbs',
    hotkeys: 'libs/hotkeys/index',
    jquery: ['//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min', 'libs/jquery/jquery'],
    'jquery-ui': ['//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min', 'libs/jqueryui/jquery-ui'],
    jsonpath: ['//cdn.jsdelivr.net/npm/jsonpath@0.2.12/jsonpath.min', 'libs/jsonpath/jsonpath'],
    marionette: ['//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.5/backbone.marionette.min', 'libs/marionette/backbone.marionette'],
    mathjax: ['//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured', 'libs/mathjax/index'],
    moment: ['//cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min', 'libs/momentjs/moment'],
    'persist-js': ['//cdn.jsdelivr.net/npm/persist-js@0.3.1/src/persist.min', 'libs/persist-js/src/persist'],
    react: ['//unpkg.com/react@16/umd/react.production.min', 'libs/react/index'],
    'react-bootstrap': [// '//cdnjs.cloudflare.com/ajax/libs/react-bootstrap/0.32.1/react-bootstrap.min',
    'libs/react-bootstrap/index'],
    'react-dom': [// '//unpkg.com/react-dom@16/umd/react-dom.production.min',
    'libs/react-dom/index'],
    'prop-types': [// '//cdnjs.cloudflare.com/ajax/libs/prop-types/15.7.2/prop-types.min',
    'libs/prop-types/index'],
    'react-redux': [// '//cdnjs.cloudflare.com/ajax/libs/react-redux/7.1.3/react-redux.min',
    'libs/react-redux/index'],
    'react-transition-group': 'libs/react-transition-group/index',
    recaptcha: 'js/plugins/recaptcha',
    reactify: 'js/plugins/reactify',
    redux: [// '//cdnjs.cloudflare.com/ajax/libs/redux/3.5.2/redux.min',
    'libs/redux/index'],
    'redux-thunk': ['//cdnjs.cloudflare.com/ajax/libs/redux-thunk/2.1.0/redux-thunk.min', 'libs/redux-thunk/index'],
    select2: ['//cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.min', 'libs/select2/select2'],
    sprintf: ['//cdnjs.cloudflare.com/ajax/libs/sprintf/1.0.2/sprintf.min', 'libs/sprintf/sprintf'],
    utils: 'js/utils',
    mocha: 'libs/mocha/mocha',
    chai: 'bower_components/chai/chai',
    sinon: 'https://cdnjs.cloudflare.com/ajax/libs/sinon.js/1.9.0/sinon.min',
    suit: 'shared/dist/index.umd.production.min',
    yup: 'libs/yup/index',
    'react-hook-form': [// 'https://cdn.jsdelivr.net/npm/react-hook-form@6.9.6/dist/index.umd.production.min',
    'libs/react-hook-form/index'],
    'react-flexview': 'libs/react-flexview/index',
    'styled-components': 'libs/styled-components/index',
    'react-is': 'libs/react-is/index',
    'react-data-table-component': 'libs/react-data-table-component/index',
    'react-window': 'libs/react-window/index',
    'react-async': 'libs/react-async/index',
    'deep-object-diff': 'libs/deep-object-diff/index',
    diff: 'https://cdnjs.cloudflare.com/ajax/libs/jsdiff/4.0.2/diff.min',
    'regenerator-runtime': 'libs/regenerator-runtime/index',
    '@hookform/resolvers': 'libs/@hookform/index',
    recoil: 'libs/recoil/index',
    xstate: 'libs/xstate/index',
    '@xstate/react': 'libs/xstate-react/index',
    'array-flat-polyfill': 'libs/polyfills/array-flat-polyfill'
  },
  hbs: {
    templateExtension: 'html',
    helpers: false
  },
  shim: {
    Backbone: {
      deps: ['backbone'],
      exports: 'Backbone'
    },
    'backbone.stickit': {
      deps: ['backbone']
    },
    'backbone-validation': {
      deps: ['backbone']
    },
    bootstrap: {
      deps: ['jquery', 'jquery-ui']
    },
    backbone: {
      deps: ['jquery', 'underscore']
    },
    marionette: {
      deps: ['jquery', 'underscore', 'backbone'],
      exports: 'Marionette'
    },
    cache: {
      exports: 'Cache'
    },
    mocha: {
      exports: 'mocha'
    },
    filesaver: {
      exports: 'saveAs'
    },
    d3: {
      exports: 'd3'
    },
    'd3-cloud': {
      deps: ['d3']
    },
    'google-analytics': {
      exports: '__ga__'
    },
    'jquery-ui': {
      deps: ['jquery']
    },
    'jquery-querybuilder': {
      deps: ['jquery']
    },
    sprintf: {
      exports: 'sprintf'
    },
    'persist-js': {
      exports: 'Persist'
    }
  }
});

define("config/discovery.config", function(){});

/* eslint-disable global-require */

/**
 * Discovery application: main bootstrapping routine
 *
 * Here we will bring up to life the discovery application,
 * all configuration is provided through the discovery.config.js
 *
 * Inside the config, there are sections for:
 *
 *  - where to find js libraries
 *  - which widgets to load (for this application)
 *  - which environmental variables are used
 *        (and how to bootstrap run-time values)
 *
 */
define('js/apps/discovery/main',['config/discovery.config', 'module'], function (config, module) {
  // eslint-disable-next-line import/no-dynamic-require
  require(['router', 'js/components/application', 'js/mixins/discovery_bootstrap', 'js/mixins/api_access', 'js/components/api_feedback', 'analytics'], function (Router, Application, DiscoveryBootstrap, ApiAccess, ApiFeedback, analytics) {
    var updateProgress = typeof window.__setAppLoadingProgress === 'function' ? window.__setAppLoadingProgress : function () {};
    var timeStart = Date.now();
    Application.prototype.shim(); // at the beginning, we don't know anything about ourselves...

    var debug = window.location.href.indexOf('debug=true') > -1; // app object will load everything

    var app = new (Application.extend(DiscoveryBootstrap))({
      debug: debug,
      timeout: 300000 // 5 minutes

    }); // load the objects/widgets/modules (using discovery.config.js)

    var appPromise = app.loadModules(module.config());
    updateProgress(20, 'Starting Application');

    var startApp = function startApp() {
      updateProgress(50, 'Modules Loaded');
      var timeLoaded = Date.now(); // this will activate all loaded modules

      app.activate();
      var pubsub = app.getService('PubSub');
      pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_LOADED); // set some important urls, parameters before doing anything

      app.configure();
      updateProgress(95, 'Finishing Up...');
      app.bootstrap().done(function (data) {
        updateProgress(100);
        app.onBootstrap(data);
        var dynConf = app.getObject('DynamicConfig');

        if (dynConf && dynConf.debugExportBBB) {
          window.bbb = app;
        }

        pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_BOOTSTRAPPED);
        pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_STARTING);
        app.start(Router).done(function () {
          pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_STARTED);

          var getUserData = function getUserData() {
            try {
              var beehive = _.isFunction(this.getBeeHive) && this.getBeeHive();
              var user = _.isFunction(beehive.getObject) && beehive.getObject('User');

              if (user) {
                return user.getUserData('USER_DATA');
              }
            } catch (e) {// do nothing
            }

            return {};
          }; // handle user preferences for external link actions


          var updateExternalLinkBehavior = _.debounce(function () {
            var userData = getUserData.call(app);
            var action = userData.externalLinkAction && userData.externalLinkAction.toUpperCase() || 'AUTO';

            if (action === 'OPEN IN CURRENT TAB') {
              var max = 10;
              var timeout;

              (function updateLinks(count) {
                clearTimeout(timeout);

                if (count < max) {
                  $('a[target="_blank"]').attr('target', '');
                  timeout = setTimeout(updateLinks, 1000, count + 1);
                }
              })(0);
            }
          }, 3000, {
            leading: true,
            trailing: false
          }, false);

          pubsub.subscribe(pubsub.getCurrentPubSubKey(), pubsub.NAVIGATE, updateExternalLinkBehavior);
          updateExternalLinkBehavior();

          var toggle = function toggle($sidebar, $content, $button) {
            $sidebar.toggleClass('show');
            var text = '<i class="fa fa-close" aria-hidden="true"></i> Close Menu';

            if ($sidebar.hasClass('show')) {
              $content.removeClass('full-width');
            } else {
              text = '<i class="fa fa-bars" aria-hidden="true"></i> Show Menu';
              $content.addClass('full-width');
            }

            $button.html(text);
          }; // some global event handlers, not sure if right place


          $('body').on('click', 'button.toggle-menu', function (e) {
            var $button = $(e.target);
            var $sidebar = $button.parents().eq(1).find('.nav-container');
            var $content = $button.parents().eq(1).find('.user-pages__main-content');
            toggle($sidebar, $content, $button);
            $('a', $sidebar).on('click', function () {
              toggle($sidebar, $content, $button);
            });
          }); // accessibility: skip to main content

          $('body').on('click', '#skip-to-main-content', function () {
            $('#main-content').trigger('focus');
            return false;
          }); // check for is-proxied class, and if present, send alert

          if ($('body').hasClass('is-proxied')) {
            var url = window.getCanonicalUrl();
            var msg = "\n              <p>\n                You are using a proxied version of ADS, we recommend you switch to the regular non-proxied URL: \n                <a href=\"".concat(url).concat(location.pathname, "\" rel=\"noopener noreferrer\">").concat(url, "</a></p>\n              <p>\n                Configure authenticated access to publisher content via the Library Link Server in your account  \n                <a href=\"").concat(url, "/user/settings/librarylink\" rel=\"noopener noreferrer\">preferences</a>.\n              </p>\n            ");
            pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.ALERT, new ApiFeedback({
              type: 'danger',
              msg: msg
            }));
          } // app is loaded, send timing event


          if (window.__PAGE_LOAD_TIMESTAMP) {
            var time = new Date() - window.__PAGE_LOAD_TIMESTAMP;
            analytics('send', {
              hitType: 'timing',
              timingCategory: 'Application',
              timingVar: 'Loaded',
              timingValue: time
            });

            if (debug) {
              console.log('Application Started: ' + time + 'ms');
            }
          } // clear the app loading timer


          window.clearTimeout(window.APP_LOADING_TIMER);
        });
      });
    };

    var failedLoad = function failedLoad() {
      analytics('send', 'event', 'introspection', 'failed-load', arguments);

      if (!debug) {
        app.redirect('500.html');
      }
    };

    var failedReload = function failedReload() {
      analytics('send', 'event', 'introspection', 'failed-reloading', arguments);

      if (debug) {
        // so error messages remain in the console
        return;
      } // if we failed loading, retry *once again* (and give up eventually)


      app.reload('404.html');
    }; // after they are loaded; we'll kick off the application


    appPromise.done(startApp).fail(failedLoad).fail(failedReload);
  });
});

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define('cache',[], f);
  } else {
    var g;

    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }

    g.dsjslib = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }

          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }

        return n[i].exports;
      }

      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) {
        o(t[i]);
      }

      return o;
    }

    return r;
  }()({
    1: [function (require, module, exports) {
      // shim for using process in browser
      var process = module.exports = {}; // cached from whatever global is present so that test runners that stub it
      // don't break things.  But we need to wrap it in a try catch in case it is
      // wrapped in strict mode code which doesn't define any globals.  It's inside a
      // function because try/catches deoptimize in certain engines.

      var cachedSetTimeout;
      var cachedClearTimeout;

      function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
      }

      function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
      }

      (function () {
        try {
          if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
          } else {
            cachedSetTimeout = defaultSetTimout;
          }
        } catch (e) {
          cachedSetTimeout = defaultSetTimout;
        }

        try {
          if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
          } else {
            cachedClearTimeout = defaultClearTimeout;
          }
        } catch (e) {
          cachedClearTimeout = defaultClearTimeout;
        }
      })();

      function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
        } // if setTimeout wasn't available but was latter defined


        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
        }

        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
          }
        }
      }

      function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
        } // if clearTimeout wasn't available but was latter defined


        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
        }

        try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
        } catch (e) {
          try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
          } catch (e) {
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
          }
        }
      }

      var queue = [];
      var draining = false;
      var currentQueue;
      var queueIndex = -1;

      function cleanUpNextTick() {
        if (!draining || !currentQueue) {
          return;
        }

        draining = false;

        if (currentQueue.length) {
          queue = currentQueue.concat(queue);
        } else {
          queueIndex = -1;
        }

        if (queue.length) {
          drainQueue();
        }
      }

      function drainQueue() {
        if (draining) {
          return;
        }

        var timeout = runTimeout(cleanUpNextTick);
        draining = true;
        var len = queue.length;

        while (len) {
          currentQueue = queue;
          queue = [];

          while (++queueIndex < len) {
            if (currentQueue) {
              currentQueue[queueIndex].run();
            }
          }

          queueIndex = -1;
          len = queue.length;
        }

        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
      }

      process.nextTick = function (fun) {
        var args = new Array(arguments.length - 1);

        if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
          }
        }

        queue.push(new Item(fun, args));

        if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
        }
      }; // v8 likes predictible objects


      function Item(fun, array) {
        this.fun = fun;
        this.array = array;
      }

      Item.prototype.run = function () {
        this.fun.apply(null, this.array);
      };

      process.title = 'browser';
      process.browser = true;
      process.env = {};
      process.argv = [];
      process.version = ''; // empty string to avoid regexp issues

      process.versions = {};

      function noop() {}

      process.on = noop;
      process.addListener = noop;
      process.once = noop;
      process.off = noop;
      process.removeListener = noop;
      process.removeAllListeners = noop;
      process.emit = noop;
      process.prependListener = noop;
      process.prependOnceListener = noop;

      process.listeners = function (name) {
        return [];
      };

      process.binding = function (name) {
        throw new Error('process.binding is not supported');
      };

      process.cwd = function () {
        return '/';
      };

      process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
      };

      process.umask = function () {
        return 0;
      };
    }, {}],
    2: [function (require, module, exports) {
      (function (process) {
        (function () {
          "use strict";
          /**
           * @class Cache
           * @classdesc In-Memory LRU Cache. For feature overview see
           * [wiki](https://github.com/monmohan/dsjslib/wiki/LRU-Cache-Feature-and-usage-overview)
           * @param cachespec {Object} See wiki for details
           */

          function Cache(cachespec) {
            var that = this;

            function configure(inSpec) {
              var maxWeight = inSpec.maximumWeight,
                  weighFn = inSpec.weigherFunction,
                  maxSize = inSpec.maximumSize,
                  isMaxW = typeof maxWeight === 'number' && maxWeight > -1,
                  isWFn = typeof weighFn === 'function';

              if (!isMaxW && isWFn || isMaxW && !isWFn) {
                throw new Error("Maximum weight or weight function has illegal values");
              }

              if (isMaxW && isWFn && typeof maxSize === 'number' && maxSize > -1) {
                throw new Error('Both max weight and size can\'t be configured');
              }

              that._spec = {
                'loaderFn': typeof inSpec.loaderFunction === 'function' && inSpec.loaderFunction,
                'expiresAfterWrite'
                /*miliseconds*/
                : typeof inSpec.expiresAfterWrite === 'number' ? inSpec.expiresAfterWrite * 1000 : null,
                'recordStats': inSpec.recordStats,
                'maxSize': maxSize,
                'maxWeight': maxWeight,
                'weighFn': weighFn,
                "onRemove": typeof inSpec.onRemove === 'function' && inSpec.onRemove //listener for entry removal

              };
            }

            configure(cachespec);

            _init.apply(this);
          }

          Cache.prototype._REMOVAL_CAUSE_I = 'explicit';
          Cache.prototype._REMOVAL_CAUSE_C = 'capacity';
          Cache.prototype._REMOVAL_CAUSE_E = 'expired';

          var _init = function _init() {
            this._accessQueue = new Queue('A');
            this._writeQueue = this._spec.expiresAfterWrite ? new Queue('W') : null;
            var accessCleanup = cleanupQ(this._REMOVAL_CAUSE_C, this._canReap, this._accessQueue, this),
                writeCleanup = cleanupQ(this._REMOVAL_CAUSE_E, this.isExpired, this._writeQueue, this);

            this._cleanup = function (condition) {
              accessCleanup(condition);
              writeCleanup(this._writeQueue);
            };

            this.size = 0;
            this.weight = 0;
            this._cache = Object.create(null);
            Object.defineProperty(this, 'stats', {
              value: {
                'hitCount': 0,
                'missCount': 0,
                'requestCount': 0
              },
              configurable: true
            });

            function cleanupQ(cause, cleanupFn, queue, cache) {
              if (queue) {
                return function (prefnarg) {
                  if (prefnarg) {
                    var lruEntry = queue.tail.prev(queue),
                        next = null;

                    while (lruEntry && cleanupFn.apply(cache, [lruEntry])) {
                      if (lruEntry) {
                        next = lruEntry.prev(queue);

                        cache._rmEntry(lruEntry, cause);

                        lruEntry = next;
                      }
                    }
                  }
                }.bind(queue);
              } else {
                return function () {};
              }
            }
          };

          function Queue(type) {
            this.tail = this.head = Object.create(Entry.prototype);
            this.type = type;
          }

          function Entry(key, value, loading, onLoadCb) {
            this.key = key;
            this.loading = loading;

            if (!loading) {
              this.setValue(value);
            }

            this.onLoad = onLoadCb ? [onLoadCb] : [];
            this.writeTime = Date.now();
          }

          Entry.prototype.setValue = function (v) {
            //we can allow falsey values except undefined and null
            if (v === undefined || v === null) {
              throw new Error('Illegal value for key ' + v);
            }

            this.value = v;
            this.writeTime = Date.now();
          };

          Entry.prototype.moveToHead = function (queues) {
            var entry = this;
            queues.forEach(function (queue) {
              if (queue) {
                var head = queue.head;
                entry.next(queue, head);
                head.prev(queue, entry);
                queue.head = entry;
              }
            });
          };

          Entry.prototype.next = function (queue, e) {
            var next = 'next' + queue.type;

            if (typeof e !== 'undefined') {
              this[next] = e;
            }

            return this[next];
          };

          Entry.prototype.prev = function (queue, e) {
            var prev = 'prev' + queue.type;

            if (typeof e !== 'undefined') {
              this[prev] = e;
            }

            return this[prev];
          };

          Entry.prototype.remove = function (queue) {
            if (queue) {
              var ePrev = this.prev(queue),
                  eNext = this.next(queue);

              if (ePrev) {
                ePrev.next(queue, eNext);
                eNext.prev(queue, ePrev);
              } else
                /*removing head*/
                {
                  eNext.prev(queue, null);
                  queue.head = eNext;
                }

              if (!eNext.next(queue)) {
                //move tail
                queue.tail = eNext;
              }

              this.next(queue, null);
              this.prev(queue, null);
            }
          };

          Entry.prototype.promote = function () {
            var entry = this;
            var queues = Array.prototype.slice.call(arguments);
            queues.forEach(function (queue) {
              if (queue && entry.prev(queue)
              /*is not head entry already*/
              ) {
                  entry.remove(queue);
                  entry.moveToHead([queue]);
                }
            });
          };

          Entry.prototype.forEach = function (traversalFn, queue) {
            var entry = this;

            while (entry) {
              traversalFn.call(this, entry);
              entry = entry.next(queue);
            }
          };
          /**
           * @memberOf  Cache.prototype
           * @param key {*} Although using other than String or Number may not be meaningful since underlying object
           * used as backing cache will do a toString() on the key
           * @param value {*} Null and undefined are not allowed
           */


          Cache.prototype.put = function (key, value) {
            var exists = this._cache[key];

            if (!exists) {
              this._createEntry(key, value);
            } else {
              exists.setValue(value);
              exists.writeTime = Date.now();
              exists.promote(this._accessQueue, this._writeQueue);

              this._cleanup(false);
            }
          };

          Cache.prototype._createEntry = function (key, value, loading, calback) {
            var entry = new Entry(key, value, loading, calback);

            this._cleanup(true);

            this._cache[key] = entry;

            this._updateCacheSize(entry, true);

            entry.moveToHead([this._accessQueue, this._writeQueue]);
            return entry;
          };

          Cache.prototype.isExpired = function (entry) {
            var exp = this._spec.expiresAfterWrite,
                now = Date.now();
            return !entry.loading && exp && exp > 0 && now - entry.writeTime > exp;
          };

          Cache.prototype._updateCacheSize = function (entry, incr) {
            var w, s;

            if (this._spec.maxWeight) {
              w = this._spec.weighFn.apply(this, [entry.key, entry.value]);
              this.weight += incr ? w : -w;
            }

            this.size += incr ? 1 : -1;
          };
          /**
           * Get value for key, NOTE: ** This is ASYNCHRONOUS and result is available from callback function**
           * Automatically load the value if not present and an auto loader function is configured.
           * Callback is called with two arguments (error,result) . Error contains any error reported by auto loader,
           * or any error while creating the entry in cache, otherwise its null. Result contains the result
           * from the cache, which in turn may have been received from the autoloader, if the entry had expired
           * or was not present. If no autoloader is configured or the entry was present in cache, the callback is called
           * with the result in cache. In conformance to async laws, the callback is still asynchronous and
           * not called immediately. For synchronous get, see {@link Cache#getSync}
           * @memberOf Cache.prototype
           * @param key {String}
           * @param callback {Function}
           */


          Cache.prototype.get = function (key, callback) {
            callback = callback || function () {};

            this.stats.requestCount++;
            var cache = this;
            process.nextTick(function () {
              _asyncGet.call(cache, key, callback);
            });
          };

          var _asyncLoad = function _asyncLoad(cache, onLoad, key) {
            var loaderFn = cache._spec.loaderFn,
                err;

            if (loaderFn) {
              loaderFn.apply(null, [key, function (error, result) {
                onLoad(cache, error, result);
              }]);
            }
          };

          var _onLoad = function _onLoad(cache, err, result) {
            if (!err) {
              try {
                this.setValue(result);
                this.promote(cache._accessQueue, cache._writeQueue);
                this.onLoad.forEach(function (callback) {
                  callback.apply(null, [err, result]);
                });
                this.onLoad = [];
                this.loading = false;
              } catch (e) {
                err = e;
              }
            }

            if (err) {
              this.onLoad.forEach(function (callback) {
                callback.apply(null, [err, result]);
              });

              cache._rmEntry(this);
            }
          };

          function _asyncGet(key, callback) {
            /*jshint validthis:true */
            var cache = this,
                entry = this._cache[key];

            if (entry) {
              if (entry.loading) {
                //record miss, register callback and return
                cache.stats.missCount++;
                entry.onLoad.push(callback);
                return;
              }

              if (!this.isExpired(entry)) {
                entry.promote(this._accessQueue);
                cache.stats.hitCount++;
                callback.apply(null, [null, entry.value]);
              } else {
                cache.stats.missCount++;

                cache._notify(entry, cache._REMOVAL_CAUSE_E);

                entry.loading = true;
                entry.onLoad.push(callback);

                _asyncLoad(cache, _onLoad.bind(entry), key);
              }
            } else {
              cache.stats.missCount++;
              entry = cache._createEntry(key, null, true, callback);

              _asyncLoad(cache, _onLoad.bind(entry), key);
            }
          }

          function _syncLoad(cache, onLoad, key) {
            var err,
                result = null,
                loaderFn = cache._spec.loaderFn;

            if (loaderFn) {
              loaderFn.apply(null, [key, function (e, r) {
                err = e;
                result = r;
              }]);
              onLoad(err, result);
            }

            return result;
          }
          /**
           * Get value for key, NOTE: ** This is SYNChronous and result is returned by the function itself**
           * Automatically load the value if not present and an auto loader function is configured.
           * In this case, we assume that autoloader will also be calling the cache callback synchronously
           * Returns result contains the result from the cache, which in turn may have been
           * received from the autoloader, if the entry had expired or was not present
           * @memberOf Cache.prototype
           * @instance
           * @param key {String}
           * @returns {*} Value associated with the key in cache
           */


          Cache.prototype.getSync = function (key) {
            var suppressLoad = arguments.length > 2 && arguments[2];
            this.stats.requestCount++;
            var entry = this._cache[key],
                ret,
                cache = this;

            if (entry) {
              if (!this.isExpired(entry)) {
                entry.promote(this._accessQueue);
                ret = entry.value;
                this.stats.hitCount++;
              } else {
                this.stats.missCount++;

                if (!suppressLoad) {
                  ret = _syncLoad(cache, function (err, result) {
                    if (err) throw err;

                    cache._notify(entry, cache._REMOVAL_CAUSE_E);

                    entry.setValue(result);
                    entry.promote(cache._accessQueue, cache._writeQueue);
                  }, key);
                } else {
                  this._rmEntry(entry, this._REMOVAL_CAUSE_E);
                }
              }
            } else {
              this.stats.missCount++;

              if (!suppressLoad) {
                ret = _syncLoad(cache, function (err, result) {
                  if (err) throw err;

                  cache._createEntry(key, result);
                }, key);
              }
            }

            return ret;
          };
          /**
           * Get value for key as present in cache, No attempt to load the key will be done
           * even if a loader is configured
           * @memberOf Cache.prototype
           * @instance
           * @param key {String}
           * @return {*} value if present, null otherwise
           */


          Cache.prototype.getIfPresent = function (key) {
            return this.getSync(key, null, true);
          };
          /**
           * Invalidate value associated with the key
           * the given key(and associated value pair) is removed from cache.
           * If a removal listener is configured, it will be invoked with key value pair
           //and removal cause as 'explicit'
           * @memberOf Cache.prototype
           * @instance
           * @param key
           */


          Cache.prototype.invalidate = function (key) {
            var entry = this._cache[key];

            this._rmEntry(entry, this._REMOVAL_CAUSE_I);
          };

          Cache.prototype._notify = function (entry, cause) {
            if (this._spec.onRemove) {
              this._spec.onRemove.apply(null, [entry.key, entry.value, cause]);
            }
          };
          /**
           * Remove a cache entry
           * @param entry
           * @private
           */


          Cache.prototype._rmEntry = function (entry, cause) {
            entry.remove(this._accessQueue);
            entry.remove(this._writeQueue);

            this._updateCacheSize(entry, false);

            delete this._cache[entry.key];

            if (cause) {
              this._notify(entry, cause);
            }
          };
          /**
           * Invalidate all entries
           * Doesn't clean the stats
           */


          Cache.prototype.invalidateAll = function () {
            var cache = this;
            Object.keys(this._cache).forEach(function (key) {
              cache.invalidate(key);
            });
          };
          /**
           * Can we remove entries
           * @return {*}
           * @private
           */


          Cache.prototype._canReap = function () {
            return this._spec.maxSize && this.size >= this._spec.maxSize || this._spec.maxWeight && this.weight > this._spec.maxWeight;
          };

          module.exports = Cache;
          /**
           * @name stats
           * @memberOf Cache.prototype
           * @instance
           * @type {Object}
           * @desc {'hitCount':{Number}, 'missCount':{Number}, 'reqeustCount':{Number}}
           */
        })();
      }).call(this, require('_process'));
    }, {
      "_process": 1
    }]
  }, {}, [2])(2);
});

/*
 * A generic class to be used for building modules (the Marionette.Module)
 * just complicates things. For simple things, just use this class.
 */
define('js/components/generic_module',['backbone', 'underscore'], function (Backbone, _) {
  // A list of options to be attached directly to the module, if provided.
  var moduleOptions = ['className', 'activate'];

  var Module = function Module(options) {
    var defaults;
    options = options || {};
    this.mid = _.uniqueId('module');

    _.extend(this, _.pick(options, moduleOptions));

    this.initialize.call(this, options);
  }; // every module has the Events mixin


  _.extend(Module.prototype, Backbone.Events, {
    className: 'GenericModule',
    initialize: function initialize() {},
    destroy: function destroy() {},
    activate: function activate(options) {
      _.extend(this, _.pick(options, moduleOptions));
    }
  }); // give the module subclassing functionality


  Module.extend = Backbone.Model.extend;
  return Module;
});

/**
 * Created by rchyla on 3/30/14.
 */

/**
 * Catalogue of PubSub events; we assume this:
 *
 *  - FC = the component lives in the 'Forbidden City'
 *         inside Application, typically this is a PubSub or Api, Mediator
 *         or any component with elevated access
 *
 *  - OC = Outer City: the suburbs of the application; these are typically
 *         UI components (behind the wall), untrusted citizens of the
 *         BumbleBee state
 *
 *  WARNING: do not use spaces; events with spaces are considered to be
 *        multiple events! (e.g. '[PubSub] New-Query' will be two events)
 *
 */
define('js/components/pubsub_events',[], function () {
  var PubSubEvents = {
    /**
     * Usually called by OC's as a first step in the query processing.
     * It means: 'user did something', we need to start reacting. The OC
     * will build a new ApiQuery and send it together with this event
     */
    START_SEARCH: '[PubSub]-New-Query',

    /**
     * Called by FC's (usually: Mediator) - this is a signal to *all* OC's
     * they should receive ApiQuery object, compare it against their
     * own query; find diff and create a new ApiRequest (asking for a data)
     * and send that back
     */
    INVITING_REQUEST: '[PubSub]-Inviting-Request',

    /**
     * Will be called by OC's, this is response to ApiQuery input.
     */
    DELIVERING_REQUEST: '[PubSub]-New-Request',

    /**
     * Will be called by OC's, this is one-time forget action (outside of the
     * the search cycle); use this for any query that needs to be executed
     * and not be tracked by search cycle
     */
    EXECUTE_REQUEST: '[PubSub]-Execute-Request',

    /**
     * Called from the router, the QID will be passed; the query needs to be
     * loaded and executed
     */
    EXECUTE_STORED_QUERY: '[PubSub]-Execute-Stored-Query',

    /**
     * Published by FC's - typically Mediator - when a response has been retrieved
     * for a given ApiRequest.
     *
     * OC's should subscribe to this event when they want to receive data
     * from the treasury (api)
     *
     *  - input: ApiRequest
     *  - output: ApiResponse
     */
    DELIVERING_RESPONSE: '[PubSub]-New-Response',

    /**
     * The walls of the FC are being closed; and no new requests will be served
     */
    CLOSING_GATES: '[PubSub]-Closing',

    /**
     * PubSub will not receive any requests any more
     */
    CLOSED_FOR_BUSINESS: '[PubSub]-Closed',

    /**
     * ForbiddenCity is about to receive requests
     */
    OPENING_GATES: '[PubSub]-Opening',

    /**
     * Called after PubSub became ready - it is fully operational
     */
    OPEN_FOR_BUSINESS: '[PubSub]-Ready',

    /**
     *  Set of error warnings issues by PubSub - or by some other FC's - to
     *  deal with congestion or other problems
     */
    SMALL_FIRE: '[PubSub]-Problem',
    BIG_FIRE: '[PubSub]-Big-Problem',
    CITY_BURNING: '[PubSub]-Disaster',

    /**
     * A message containing feedback from the FC; traveling towards OC
     * The feedback will be instance of ApiFeedback
     */
    FEEDBACK: '[FC]-FeedBack',

    /**
     * A message from the router requesting showing citizens of the
     * city
     */
    DISPLAY_DOCUMENTS: '[Router]-Display-Documents',
    DISPLAY_DOCUMENTS_DETAILS: '[Router]-Display-Documents-Details',

    /**
     * Used by OC to request parsed query tree - to check a query
     * for example
     */
    GET_QTREE: '[FC]-GetQTree',
    NAVIGATE: '[Router]-Navigate-With-Trigger',

    /*
     * so navigator can notify interested widgets about a change
     * from search page to user page, for instance-- navigator cannot
     * to this since it listens to many events including widget-show events
     * */
    PAGE_CHANGE: '[Navigator]Page-Changed',

    /* for custom widget-to-widget events */
    CUSTOM_EVENT: '[PubSub]-Custom-Event',
    ARIA_ANNOUNCEMENT: '[PubSub]-Aria-Announcement',

    /* anything to do with changing the state of the user, including session events */
    USER_ANNOUNCEMENT: '[PubSub]-User-Announcement',

    /**
     * A message/action that should be displayed to the user (on prominent)
     * place
     */
    ALERT: '[Alert]-Message',
    ORCID_ANNOUNCEMENT: '[PubSub]-Orcid-Announcement',

    /**
     * Happens during the main cycle of the application birth
     *  LOADED = when all components were successfuly loaded
     *  BOOTSTRAPPED = + when all dynamic config was loaded
     *  STARTING = + right before the router and history objects start()
     *  STARTED = app is alive and handling requests
     */
    APP_LOADED: '[App]-Application-Loaded',
    APP_BOOTSTRAPPED: '[App]-Application-Bootstrapped',
    APP_STARTING: '[App]-Application-Starting',
    APP_STARTED: '[App]-Application-Started',
    APP_EXIT: '[App]-Exit',

    /**
     * Is triggered when user selects/deselects records
     */
    PAPER_SELECTION: '[User]-Paper-Selection',
    // instead of toggling, adds all papers
    BULK_PAPER_SELECTION: '[User]-Bulk-Paper-Selection',

    /*
     * is triggered by app storage itself when list of selected papers changes
     * */
    STORAGE_PAPER_UPDATE: '[User]-Paper-Update',
    LIBRARY_CHANGE: '[PubSub]-Library-Change'
  };
  return PubSubEvents;
});

/**
 * Created by rchyla on 3/14/14.
 */

/*
 * A simple, yet important, class - every subscriber
 * to the PubSub must contain one key. This class
 * should be instantiated in a safe manner. ie.
 *
 * PubSubKey.newInstance({creator: this});
 *
 * But beware that as long as the subscriber is alive
 * reference to the creator will be saved inside
 * the key! So choose carefully whether you use this
 * functionality
 */
define('js/components/pubsub_key',['underscore'], function (_) {
  var PubSubKey = function PubSubKey(options) {
    _.extend(this, options);
  };

  _.extend(PubSubKey, {
    /*
     * Creates a new Instances of the PubSubKey
     * with a storage that cannot be changed.
     * To double sign the key, you can pass
     * an object that identifies creator of the
     * key and test identity, eg.
     *
     * var creator = {};
     * var k = PubSubKey(creator);
     * k.getCreator() === k;
     *
     */
    newInstance: function newInstance(options) {
      var priv = {
        id: _.has(options, 'id') ? options.id : _.uniqueId(':psk'),
        creator: _.has(options, 'creator') ? options.creator : null
      };
      return new PubSubKey({
        getId: function getId() {
          return priv.id;
        },
        getCreator: function getCreator() {
          return priv.creator;
        }
      });
    }
  });

  return PubSubKey;
});

/**
 * Created by rchyla on 3/13/14.
 */

/*
 * This module contains a set of utilities that can be added to classes
 * to give them certain functionality
 */
define('js/mixins/dependon',['underscore', 'js/components/pubsub_events', 'js/components/pubsub_key'], function (_, PubSubEvents, PubSubKey) {
  var Mixin = {
    /*
     * BeeHive is the object that allows modules to get access to objects
     * of the application (but we make sure these objects are protected
     * and only application can set/change them). This mixin gives objects
     * functions to query 'BeeHive'
     */
    BeeHive: {
      // called by parents (app) to give modules access
      setBeeHive: function setBeeHive(brundibar) {
        if (_.isEmpty(brundibar)) throw new Error('Huh? Empty Beehive? Trying to be funny?');
        this.__beehive = brundibar;
      },
      getBeeHive: function getBeeHive() {
        if (!this.hasBeeHive()) throw new Error('The BeeHive is inactivate (or dead :<})');
        return this.__beehive;
      },
      hasBeeHive: function hasBeeHive() {
        if (this.__beehive && (this.__beehive.active || this.__beehive.__facade__ && this.__beehive.getActive())) {
          return true;
        }

        return false;
      },

      /**
       * Method which returns a masked instance of PubSub (unless the PubSub
       * is already a hardened instance; which carries its own key)
       *
       * You can call pubsub.publish() without having to supply the pubsub key
       * (which is what most controllers want to do; there are only some
       * exceptions to this rule; ie. query-mediator). If you need to get
       * access to the full PubSub (and you have it inside BeeHive) then do
       * this.getBeeHive().getService('PubSub')
       */
      getPubSub: function getPubSub() {
        if (!this.hasBeeHive()) throw new Error('The BeeHive is inactive (or dead >:})');
        if (!this.__ctx) this.__ctx = {};
        if (this.__ctx.pubsub) return this.__ctx.pubsub;

        var pubsub = this.__beehive.getService('PubSub');

        if (pubsub && pubsub.__facade__) return pubsub; // build a unique key for this instance

        this.__ctx.pubsub = {
          _key: pubsub.getPubSubKey(),
          _exec: function _exec(name, args) {
            args = _.toArray(args);
            if (args[0] instanceof PubSubKey) throw Error('You have given us a PubSub key, this.publish() method does not need it.');
            args.unshift(this._key);
            pubsub[name].apply(pubsub, args);
          },
          publish: function publish() {
            this._exec('publish', arguments);
          },
          subscribe: function subscribe() {
            this._exec('subscribe', arguments);
          },
          subscribeOnce: function subscribeOnce() {
            this._exec('subscribeOnce', arguments);
          },
          unsubscribe: function unsubscribe() {
            this._exec('unsubscribe', arguments);
          },
          getCurrentPubSubKey: function getCurrentPubSubKey() {
            return this._key;
          }
        };

        _.extend(this.__ctx.pubsub, PubSubEvents);

        return this.__ctx.pubsub;
      },
      hasPubSub: function hasPubSub() {
        if (this.hasBeeHive()) return _.isObject(this.__beehive.getService('PubSub'));
        return false;
      }
    },
    App: {
      setApp: function setApp(app) {
        if (_.isUndefined(app)) throw new Error('App object cannot be empty');
        this.__app = app;
      },
      getApp: function getApp() {
        return this.__app;
      },
      hasApp: function hasApp() {
        return !_.isEmpty(this.__app);
      }
    }
  };
  return Mixin;
});

define('js/components/transition',['underscore'], function (_) {
  var Transition = function Transition(endpoint, options) {
    if (!_.isString(endpoint)) {
      throw new Error('Endpoint name must be a string');
    }

    this.endpoint = endpoint;

    _.extend(this, options);
  };

  _.extend(Transition.prototype, {
    route: false,
    trigger: false,
    replace: false,
    title: false,
    execute: function execute() {
      throw new Error('You must override this method');
    }
  });

  return Transition;
});

define('js/components/transition_catalog',['underscore', 'js/components/transition'], function (_, Transition) {
  var TransitionCatalog = function TransitionCatalog(options) {
    this._catalog = {};
  };

  _.extend(TransitionCatalog.prototype, {
    add: function add(transition) {
      if (!(transition instanceof Transition)) {
        throw new Error('You can add only Transition objects');
      }

      this._catalog[transition.endpoint] = transition;
      return transition;
    },
    get: function get(name) {
      return this._catalog[name];
    },
    remove: function remove(name) {
      delete this._catalog[name];
    }
  });

  return TransitionCatalog;
});

define('analytics',['underscore', 'jquery'], function (_, $) {
  /*
   * Set of targets
   * each has a set of hooks which coorespond to the event label passed
   * types represents the possible event targets which can be used
   * url is a template which will be passed the incoming data
   */
  var TARGETS = {
    resolver: {
      hooks: ['toc-link-followed', 'abstract-link-followed', 'citations-link-followed', 'associated-link-followed'],
      types: ['abstract', 'citations', 'references', 'metrics', 'coreads', 'similar', 'graphics', 'associated', 'toc'],
      url: _.template('link_gateway/<%= bibcode %>/<%= target %>')
    }
  };
  /**
   * fire off the xhr request to the url
   *
   * @param {string} url
   * @param {object} data
   */

  var sendEvent = function sendEvent(url) {
    $.ajax({
      url: url,
      type: 'GET'
    });
  };
  /**
   * Go through the targets and fire the event if the label passed
   * matches one of the hooks specified.  Also the data.target must match one
   * of the types listed on the target config
   *
   * @param {string} label - the event label
   * @param {object} data - the event data
   */


  var adsLogger = function adsLogger(label, data) {
    // if label or data is not present, do nothing
    if (_.isString(label) && _.isPlainObject(data) && _.has(data, 'target')) {
      _.forEach(TARGETS, function (val) {
        var target = null;

        _.forEach(val.types, function (type) {
          if (_.isArray(type)) {
            if (type[0] === data.target && _.has(type[1], 'redirectTo')) {
              target = type[1].redirectTo;
            }
          } else if (type === data.target) {
            target = type;
          }
        }); // send event if we find a hook and the target is in the list of types


        if (_.contains(val.hooks, label) && target) {
          var params = _.assign({}, data, {
            target: target
          });

          sendEvent(data.url ? data.url : val.url(params));
        }
      });
    }
  };

  var buffer = [];
  var gaName = window.GoogleAnalyticsObject || 'ga';

  var cleanBuffer = function cleanBuffer() {
    if (window[gaName]) {
      for (var i = 0; i < buffer.length; i++) {
        window[gaName].apply(this, buffer[i]);
      }

      buffer = [];
    }
  };

  var Analytics = function Analytics() {
    adsLogger.apply(null, _.rest(arguments, 3));

    if (window[gaName]) {
      if (buffer.length > 0) cleanBuffer();
      window[gaName].apply(this, arguments);
      return true;
    } else {
      console.log('Buffering GA signal', arguments);
      buffer.push(arguments);
      setTimeout(cleanBuffer, 1000);
      return false;
    }
  };

  return Analytics;
});

/**
/**
 * Created by rchyla on 3/10/14.
 */

/**
 * Mediator (event aggregator) to coordinate transitions/navigations
 * inside application. Each applications should have one 'navigator'
 * and one 'router' - the router is responsible for 'going into the
 * state directly' (ie. from a bookmarked ursl) and for updating the
 * history object. The rest is handled by the navigator. There is a
 * one-to-one relation between router<->navigator
 */
define('js/components/navigator',['underscore', 'jquery', 'cache', 'js/components/generic_module', 'js/mixins/dependon', 'js/components/transition', 'js/components/transition_catalog', 'analytics'], function (_, $, Cache, GenericModule, Mixins, Transition, TransitionCatalog, analytics) {
  // Document Title Constants
  var APP_TITLE = 'NASA/ADS';
  var TITLE_SEP = ' - ';
  var Navigator = GenericModule.extend({
    initialize: function initialize(options) {
      options = options || {};
      this.router = options.router;
      this.catalog = new TransitionCatalog(); // catalog of nagivation points (later we can build FST)
    },

    /**
     * Starts listening on the PubSub
     *
     * @param beehive - the full access instance; we excpect PubSub to be
     *    present
     */
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      this.storage = beehive.getObject('AppStorage');
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.NAVIGATE, _.bind(this.navigate, this));
      pubsub.subscribe(pubsub.CUSTOM_EVENT, _.bind(this._onCustomEvent, this));
    },
    _onCustomEvent: function _onCustomEvent(ev, data) {
      if (ev === 'update-document-title') {
        this._updateDocumentTitle(data);
      }
    },
    _cleanRoute: function _cleanRoute(route) {
      var r = route.match(/[#\/]?([^\/]*)\//);

      if (r && r.length > 1) {
        return '/' + r[1];
      }

      return route;
    },
    _setPageAndEmitEvent: _.debounce(function (route, pageName) {
      analytics('set', 'page', this._cleanRoute(route));
      analytics('send', 'pageview', {
        dimension1: pageName
      });
    }, 300),

    /**
     * Responds to PubSubEvents.NAVIGATE signal
     */
    navigate: function navigate(ev, arg1, arg2) {
      var defer = $.Deferred();
      var self = this;

      if (!this.router || !(this.router instanceof Backbone.Router)) {
        defer.reject(new Error("Navigator must be given 'router' instance"));
        return defer.promise();
      }

      var transition = this.catalog.get(ev);

      if (!transition) {
        this.handleMissingTransition(arguments);
        defer.reject(new Error('Missing route; going to 404'));
        return defer.promise();
      }

      if (!transition.execute) {
        // do nothing
        return defer.resolve().promise();
      }

      var afterNavigation = _.bind(function () {
        // router can communicate directly with navigator to replace url
        var replace = !!(transition.replace || arg1 && arg1.replace);

        if (transition.route === '' || transition.route) {
          var route = transition.route === '' ? '/' : transition.route;

          this._setPageAndEmitEvent(route, ev);

          this.router.navigate(route, {
            trigger: false,
            replace: replace
          });
        } // clear any metadata added to head on the previous page


        $('head').find('meta[data-highwire]').remove();

        this._updateDocumentTitle(transition.title);

        defer.resolve();
      }, this);

      var p;

      try {
        p = transition.execute.apply(transition, arguments);
        p && _.isFunction(p.then) ? p.then(afterNavigation) : afterNavigation();
      } catch (e) {
        this.handleTransitionError(transition, e, arguments);
        var err = new Error('Error transitioning to route; going to 404');
        return defer.reject(err).promise();
      }

      return defer.promise();
    },
    _updateDocumentTitle: function _updateDocumentTitle(title) {
      if (_.isUndefined(title) || title === false) return;
      var currTitle = this.storage.getDocumentTitle();

      var setDocTitle = _.bind(function (t) {
        document.title = t === '' ? APP_TITLE : t + TITLE_SEP + APP_TITLE;
        this.storage.setDocumentTitle(t);
      }, this); // title is defined and it is different from the current one, it should be updated


      if (title !== currTitle) {
        setDocTitle(title);
      }
    },
    handleMissingTransition: function handleMissingTransition(transition) {
      console.error("Cannot handle 'navigate' event: " + JSON.stringify(arguments));
      var ps = this.getPubSub();
      ps.publish(ps.BIG_FIRE, 'navigation-error', arguments);
      if (this.catalog.get('404')) ps.publish(ps.NAVIGATE, '404');
    },
    handleTransitionError: function handleTransitionError(transition, error, args) {
      console.error('Error while executing transition', transition, args);
      console.error(error.stack);
      var ps = this.getPubSub();
      ps.publish(ps.CITY_BURNING, 'navigation-error', arguments);
      if (this.catalog.get('404')) ps.publish(ps.NAVIGATE, '404');
    },

    /**
     * Sets the transition inside the catalog; you can pass simplified
     * list of options or the Transition instance
     */
    set: function set() {
      if (arguments.length == 1) {
        if (arguments[1] instanceof Transition) {
          return this.catalog.add(arguments[1]);
        }

        throw new Error("You must be kiddin' sir!");
      } else if (arguments.length == 2) {
        var endpoint = arguments[0];

        if (_.isFunction(arguments[1])) {
          return this.catalog.add(new Transition(endpoint, {
            execute: arguments[1]
          }));
        }

        if (_.isObject(arguments[1]) && arguments[1].execute) {
          return this.catalog.add(new Transition(endpoint, arguments[1]));
        }

        throw new Error('Himmm, I dont know how to create a catalog rule with this input:', arguments);
      } else {
        // var args = array.slice.call(arguments, 1);
        throw new Error('Himmm, I dont know how to create a catalog rule with this input:', arguments);
      }
    },
    get: function get(endpoint) {
      return this.catalog.get(endpoint);
    }
  });

  _.extend(Navigator.prototype, Mixins.BeeHive);

  return Navigator;
});

/**
 * Created by rchyla on 3/16/14. inspiration: http://jsfiddle.net/pajtai/GD5qR/35/
 */

/*
 * // Interface
 *  var remoteInterface = {
 *    on: 'turn on'
 *  };
 *  // Implementation
 *  var htmlRemote = {
 *    on: function() { console.log("remote on"); return this; }
 *  };
 *  // Protecting the implementation
 *  var htmlInterface = new Facade(remoteInterface, htmlRemote);
 *
 */
define('js/components/facade',['underscore', 'js/components/facade'], function (_, Facade) {
  // The Facade encapsulates objectIn according to the description
  // The exposed facade is guaranteed to have exactly the functions described in description.
  var Facade = function Facade(description, objectIn) {
    var facade; // TODO: add enforce of "new"

    facade = {};
    this.mixIn(description, objectIn, facade); // TODO: check that "mixIn" is not taken

    facade.mixIn = this.mixIn;
    return facade;
  };

  Facade.prototype.mixIn = function (description, objectIn, facade) {
    var property;
    var propertyValue;
    facade = facade || this;

    for (property in description) {
      propertyValue = description[property];

      if (property in objectIn) {
        var p = objectIn[property];

        if (typeof propertyValue === 'function') {
          // redefining the method
          facade[property] = _.bind(propertyValue, objectIn);
        } else if (typeof p === 'function') {
          // exposing the method
          facade[property] = _.bind(p, objectIn);
        } else if (_.isUndefined(p)) {// pass
        } else if (_.isString(p) || _.isNumber(p) || _.isBoolean(p) || _.isDate(p) || _.isNull(p) || _.isRegExp(p)) {
          // build getter method
          facade['get' + property.substring(0, 1).toUpperCase() + property.substring(1)] = _.bind(function () {
            return this.ctx[this.name];
          }, {
            ctx: objectIn,
            name: property
          });
          facade[property] = p; // copy the value (it is immutable anyways)
        } else if (p.hasOwnProperty('__facade__') && p.__facade__) {
          // exposing internal facade
          facade[property] = p;
        } else if (_.isObject(p) && 'getHardenedInstance' in p) {
          // builds a facade
          facade[property] = p.getHardenedInstance();
        } else {
          throw new Error("Sorry, you can't wrap '" + property + "': " + p);
        }
      } else if (typeof propertyValue === 'function') {
        facade[property] = _.bind(propertyValue, objectIn);
      } else {
        throw new Error('Unknown key: ' + property + '(' + propertyValue + ')');
      }
    }

    if (objectIn) {
      // .name is not supported in IE
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
      facade.__facade__ = Boolean(objectIn.constructor ? objectIn.constructor.name ? objectIn.constructor.name : true : true);
    } else {
      facade.__facade__ = true;
    } // TODO:rca - shall we use?
    // if (Object.freeze)
    //  facade = Object.freeze(facade);


    return facade;
  };

  return Facade;
});

/**
 * Created by rchyla on 3/18/14.
 */
define('js/mixins/hardened',['underscore', 'js/components/facade'], function (_, Facade) {
  var Mixin = {
    /*
     * Creates a hardened instance of itself, it uses
     * interface description from 'hardenedInterface'
     * Implementations need to populate 'hardenedInterface'
     * with list of properties and methods that should be exposed
     * through the Facade
     */
    _getHardenedInstance: function _getHardenedInstance(iface, objectIn) {
      if (!('hardenedInterface' in this) && !iface) {
        throw Error('Error: this.hardenedInterface is not defined');
      }

      return new Facade(iface || ('hardenedInterface' in this ? this.hardenedInterface : {}), objectIn);
    },
    getHardenedInstance: function getHardenedInstance(iface) {
      return this._getHardenedInstance(iface, this);
    }
  };
  return Mixin;
});

define('js/components/api_feedback',['underscore', 'backbone', 'js/mixins/hardened'], function (_, Backbone, Hardened) {
  var ApiFeedback = function ApiFeedback(options) {
    _.extend(this, _.defaults(options || {}, {
      code: 200,
      msg: undefined
    }));

    this.setCode(this.code);
  };

  ApiFeedback.CODES = {
    INVALID_PASSWORD: 498,
    ACCOUNT_NOT_FOUND: 495,
    // Account not found during signin
    ALREADY_LOGGED_IN: 493,
    // Already signed during signup
    REQUIRES_LOGIN: 491,
    TOO_MANY_CHARACTERS: 486,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVER_ERROR: 503,
    TOO_MANY_FAILURES: 580,
    ALL_FINE: 200,
    KEEP_WAITING: 190,
    TESTING: 0,
    // Internal events
    MAKE_SPACE: -1,
    UNMAKE_SPACE: -1.1,
    SEARCH_CYCLE_STARTED: -2,
    SEARCH_CYCLE_FAILED_TO_START: -3,
    SEARCH_CYCLE_PROGRESS: -4,
    SEARCH_CYCLE_STOP_MONITORING: -5,
    SEARCH_CYCLE_FINISHED: -6,
    QUERY_ASSISTANT: -7,
    ALERT: -8,
    CANNOT_ROUTE: -9,
    API_REQUEST_ERROR: -10,
    BIBCODE_DATA_REQUESTED: -11
  };
  var _codes = {};

  _.each(_.pairs(ApiFeedback.CODES), function (p) {
    _codes[p[1]] = p[0];
  });

  _.extend(ApiFeedback.prototype, {
    hardenedInterface: {
      code: 'integer value of the code',
      msg: 'string message',
      toJSON: 'for cloning',
      getApiRequest: 'to get the original request',
      getSenderKey: 'retrieve the senders key'
    },
    initialize: function initialize() {},
    toJSON: function toJSON() {
      return {
        code: this.code,
        msg: this.msg
      };
    },
    setCode: function setCode(c) {
      if (!_codes[c]) {
        throw new Error('This code is not in the list ApiCodes - please extend js/components/api_feedback first:', this.code);
      }

      this.code = c;
    },
    setApiRequest: function setApiRequest(apiRequest) {
      this.req = apiRequest;
    },
    getApiRequest: function getApiRequest() {
      return this.req;
    },
    setMsg: function setMsg(msg) {
      this.msg = msg;
    },
    getSenderKey: function getSenderKey() {
      return this.senderKey;
    },
    setSenderKey: function setSenderKey(key) {
      this.senderKey = key;
    }
  }, Hardened);

  ApiFeedback.extend = Backbone.Model.extend;
  return ApiFeedback;
});

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 multi_params is a generic class to store any parameters;
 it is backed by BB.Model and has all the functionality
 the values are always stored as an array of values; so
 even if you try to set strings, you will always have
 list of strings
 */
define('js/components/multi_params',['backbone', 'underscore', 'jquery'], function (Backbone, _, $) {
  var Model = Backbone.Model.extend({
    locked: false,
    _checkLock: function _checkLock() {
      if (this.locked === true) {
        throw Error('Object locked for modifications');
      }
    },
    isLocked: function isLocked() {
      return this.locked;
    },
    lock: function lock() {
      this.locked = true;
    },
    unlock: function unlock() {
      this.locked = false;
    },
    clone: function clone() {
      if (this.isLocked()) {
        var c = new this.constructor(this.attributes);
        c.lock();
        return c;
      }

      return new this.constructor(this.attributes);
    },
    hasVal: function hasVal(key) {
      return !_.isEmpty(this.get(key));
    },
    // we allow only strings and numbers; instead of sending
    // signal we throw a direct error
    _validate: function _validate(attributes, options) {
      // check we have only numbers and/or finite numbers
      for (var attr in attributes) {
        if (!_.isString(attr)) {
          throw new Error('Keys must be strings, not: ' + attr);
        } // remove empty strings


        var tempVal = attributes[attr];
        tempVal = _.without(_.flatten(tempVal), '', false, null, undefined, NaN);

        if (!_.isArray(tempVal)) {
          throw new Error('Values were not converted to an Array');
        }

        if (_.isEmpty(tempVal) && options.unset !== true) {
          throw new Error('Empty values not allowed');
        }

        if (!_.every(tempVal, function (v) {
          return _.isString(v) || _.isNumber(v) && !_.isNaN(v);
        })) {
          throw new Error('Invalid value (not a string or number): ' + tempVal);
        }

        attributes[attr] = tempVal;
      }

      return true;
    },
    // Every value is going to be multi-valued by default
    // in this way we can treat all objects in the same way
    set: function set(key, val, options) {
      this._checkLock();

      var attrs;
      if (key == null) return this; // Handle both `"key", value` and `{key: value}` -style arguments.

      if (_typeof(key) === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      for (var attr in attrs) {
        var tempVal = attrs[attr]; // convert to array if necessary

        if (!_.isArray(tempVal)) {
          attrs[attr] = _.flatten([tempVal]);
        }
      }

      Backbone.Model.prototype.set.call(this, attrs, options);
    },
    unset: function unset() {
      this._checkLock();

      Backbone.Model.prototype.unset.apply(this, arguments);
    },
    // adds values to existing (like set, but keeps the old vals)
    add: function add(key, val, options) {
      this._checkLock();

      var attrs;
      if (key == null) return this; // Handle both `"key", value` and `{key: value}` -style arguments.

      if (_typeof(key) === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      for (var attr in attrs) {
        var tempVal = attrs[attr]; // convert to array if necessary

        if (!_.isArray(tempVal)) {
          tempVal = _.flatten([tempVal]);
        }

        if (this.has(attr)) {
          tempVal = _.clone(this.get(attr)).concat(tempVal);
        }

        attrs[attr] = tempVal;
      }

      Backbone.Model.prototype.set.call(this, attrs, options);
    },
    // synchronization is disabled
    sync: function sync() {
      throw Error('MultiParams cannot be saved to server');
    },

    /*
     * Return the url string encoding all parameters that made
     * this query. The parameters will be sorted alphabetically
     * by their keys and URL encoded so that they can be used
     * in requests.
     */
    url: function url(whatToSort) {
      if (!whatToSort) {
        whatToSort = this.attributes;
      } // sort keys alphabetically


      var sorted = _.pairs(whatToSort).sort(function (a, b) {
        return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
      }); // June1:rca - I need to preserve order of values (becuaes of the query modifications/updates) the logic
      // just requires us to be careful and we need order to be preserved when the query is cloned
      // also sort values
      // var s = {};
      // sorted.map(function(item) { s[item[0]] = (_.isArray(item[1]) ? item[1].sort() : item[1]) });
      // we have to double encode certain elements
      // sorted = _.map(sorted, function(pair) { return [pair[0], _.map(pair[1], function(v) {return (v.indexOf && v.indexOf('=') > -1) ? encodeURIComponent(v) : v })]});
      // use traditional encoding
      // use %20 instead of + (url encoding instead of form encoding)


      var encoded = $.param(_.object(sorted), true);
      encoded = encoded.replace(/\+/g, '%20'); // Replace funky unicode quotes with normal ones

      encoded = encoded.replace(/%E2%80%9[ECD]/g, '%22');
      return encoded;
    },

    /**
     * Parses string (urlparams) and returns it as an object
     * @param resp
     * @param options
     * @returns {*}
     */
    parse: function parse(resp, options) {
      if (_.isString(resp)) {
        var attrs = {};
        resp = decodeURI(resp);

        if (resp.indexOf('?') > -1) {
          attrs['#path'] = [resp.slice(0, resp.indexOf('?'))];
          resp = resp.slice(resp.indexOf('?') + 1);
        }

        if (resp.indexOf('#') > -1) {
          attrs['#hash'] = this._parse(resp.slice(resp.indexOf('#') + 1));
          resp = resp.slice(0, resp.indexOf('#'));
        }

        attrs['#query'] = this._parse(resp);
        return this._checkParsed(attrs);
      }

      return this._checkParsed(resp); // else return resp object
    },
    _parse: function _parse(resp) {
      var attrs = {};
      var hash;

      if (!resp.trim()) {
        return attrs;
      }

      var hashes = resp.slice(resp.indexOf('?') + 1).split('&'); // resp = decodeURIComponent(resp);

      var key;
      var value;

      for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        key = decodeURIComponent(hash[0].split('+').join(' ')); // optimized: .replace(/\+/g, " ")

        var vall = hash[1];

        if (hash.length > 2) {
          hash.shift();
          vall = hash.join('=');
        } // replace literal '%' with code and '+' become literal spaces


        value = decodeURIComponent(vall.replace(/%(?!\d|[ABCDEF]+)/gi, '%25').split('+').join(' '));

        if (attrs[key] !== undefined) {
          attrs[key].push(value);
        } else {
          attrs[key] = [value];
        }
      }

      return attrs;
    },
    // default behaviour is just to keep the query parameters
    // after the string was parsed, you can override it to suit other needs
    _checkParsed: function _checkParsed(attrs) {
      if (_.isObject(attrs)) {
        if ('#query' in attrs) {
          return attrs['#query'];
        }
      }

      return attrs;
    },

    /**
     * Re-constructs the query from the url string, returns the json attributes;
     * cannot be used it the instance is locked
     *
     * @param query (String)
     * @returns {Model}
     */
    load: function load(query) {
      this._checkLock();

      var vals = this.parse(query);
      this.clear();
      this.set(vals);
      return this;
    }
  });
  return Model;
});

/*
Subclass of the multi-param with a functionality specific for
SOLR queries. Do not use this class directly inside your app!
Instead, import 'api_query' and configure it properly

 * <p>For a list of possible parameters, please consult the links below.</p>
 *
 * @see http://wiki.apache.org/solr/CoreQueryParameters
 * @see http://wiki.apache.org/solr/CommonQueryParameters
 * @see http://wiki.apache.org/solr/SimpleFacetParameters
 * @see http://wiki.apache.org/solr/HighlightingParameters
 * @see http://wiki.apache.org/solr/MoreLikeThis
 * @see http://wiki.apache.org/solr/SpellCheckComponent
 * @see http://wiki.apache.org/solr/StatsComponent
 * @see http://wiki.apache.org/solr/TermsComponent
 * @see http://wiki.apache.org/solr/TermVectorComponent
 * @see http://wiki.apache.org/solr/LocalParams
 *
 * @param properties A map of fields to set. Refer to the list of public fields.
 * @class ParameterStore
 */
define('js/components/solr_params',['js/components/multi_params', 'backbone', 'underscore', 'jquery'], function (MultiParams, Backbone, _, $) {
  var SolrParams = MultiParams.extend({
    fieldsToConcatenate: [],
    defaultOperator: ' ',
    fieldProcessors: {
      '*': function _(vals, self) {
        return [vals.join(self.defaultOperator)];
      }
    },
    initialize: function initialize(attributes, options) {
      if (options) {
        _.extend(this, _.pick(options, ['fieldsToConcatenate', 'defaultOperator', 'fieldProcessors']));
      }
    },
    url: function url(resp, options) {
      // first massage the fields, but do not touch the original values
      // lodash has a parameter isDeep that can be set to true, but
      // for compatibility reasons with underscore, lets' not use it
      // the values should always be only one level deep
      var values = _.clone(this.attributes);

      var l = this.fieldsToConcatenate.length;
      var k = '';

      for (var i = 0; i < l; i++) {
        k = this.fieldsToConcatenate[i];

        if (this.has(k)) {
          if (this.fieldProcessors[k]) {
            values[k] = this.fieldProcessors[k](this.get(k), this);
          } else {
            values[k] = this.fieldProcessors['*'](this.get(k), this);
          }
        }
      } // then call the default implementation of the url handling


      return MultiParams.prototype.url.call(this, values);
    }
  });
  return SolrParams;
});

/*
 A facade: api query exposing only the set of functions that we allow. This is
 the module that you want to load in the application (do not load the concrete
 implementaions, such as solr_params !)

 Put in your config:
 map: {
 'your/module': {
 'api_query_impl': 'js/components/specific_impl_of_the_api_query'
 }
 },

 */
define('js/components/api_query',['backbone', 'underscore', 'js/components/solr_params', 'js/components/facade'], function (Backbone, _, ApiQueryImplementation, Facade) {
  var hardenedInterface = {
    add: 'add values',
    set: 'set (replace existing)',
    get: 'get values',
    has: 'has a key',
    hasVal: 'more specific `has` using _.isEmpty',
    url: 'url string of the params',
    load: 'loads query as a string',
    clear: 'clears all values',
    unset: 'removes a key',
    toJSON: 'values back as JSON object',
    clone: 'make a copy',
    isLocked: true,
    lock: true,
    unlock: true,
    pairs: 'get all values as pairs',
    keys: 'as keys',
    values: 'only values',
    hasChanged: 'whether this object has modification (since its creation)',
    previousAttributes: 'get all changed attributes',
    previous: 'previous values for a given attribute'
  };

  var ApiQuery = function ApiQuery(data, options) {
    // Facade pattern, we want to expose only limited API
    // despite the fact that the underlying instance has
    // all power of the Backbone.Model
    if (data instanceof ApiQueryImplementation) {
      this.innerQuery = new Facade(hardenedInterface, data);
    } else {
      this.innerQuery = new Facade(hardenedInterface, new ApiQueryImplementation(data, options));
    }
  };

  var toInsert = {};

  _.each(_.keys(hardenedInterface), function (element, index, list) {
    toInsert[element] = function () {
      return this.innerQuery[element].apply(this.innerQuery, arguments);
    };
  });

  _.extend(ApiQuery.prototype, toInsert, {
    clone: function clone() {
      var clone = this.innerQuery.clone.apply(this.innerQuery, arguments);
      return new ApiQuery(clone);
    },
    load: function load() {
      var clone = this.innerQuery.load.apply(this.innerQuery, arguments);
      return new ApiQuery(clone);
    }
  });

  return ApiQuery;
});

/**
 * Created by rchyla on 5/24/14.
 *
 * Set of utilities for manipulating ApiQuery object. These are mainly
 * useful for widgets that often do the same operations with the
 * query.
 *
 * The object must be initialized with an 'identifier' -- this identifier
 * will represent a context; so we'll be touching all elements that
 * belong to the context
 *
 * TODO: need to distinguish globalOperator from 'operator' inside clauses
 * TODO: the 'globalOperator' joins clauses; 'operator' joins elements of the
 * TODO: clauses
 *
 */
define('js/components/api_query_updater',['underscore', 'js/components/api_query'], function (_, ApiQuery) {
  var ApiQueryUpdater = function ApiQueryUpdater(contextIdentifier, options) {
    if (!contextIdentifier || !_.isString(contextIdentifier)) {
      throw new Error('You must initialize the ApiQueryUpdater with a context (which is a string)');
    }

    this.context = contextIdentifier;
    this.defaultOperator = ' ';
    this.operators = [' ', 'AND', 'OR', 'NOT', 'NEAR'];
    this.defaultMode = 'limit';
    this.operationModes = ['limit', 'exclude', 'expand', 'replace', 'remove'];
    this.impossibleString = "\uFFFC\uFFFC\uFFFC";

    _.extend(this, options);
  };

  _.extend(ApiQueryUpdater.prototype, {
    /**
     * Modifies the query - it will search for a string inside the query (using previously
     * saved state) and update the query 'parameter'
     *
     * @param field
     *      this is the name of the parameter we are changing inside apiQeury
     * @param apiQuery
     *      the apiQuery object we are updating
     * @param queryCondition
     *      String|[String] - new conditions to set
     * @param operator
     *      String: this will serve as concatenator for the conditions
     */
    updateQuery: function updateQuery(apiQuery, field, mode, queryCondition, options) {
      options = _.defaults({}, options, {
        prefix: '__'
      });

      if (!field || !_.isString(field)) {
        throw new Error('You must tell us what parameter to update in the ApiQuery');
      } // globalOperator = this._sanitizeOperator(globalOperator);
      // local name


      var n = this._n(field, options.prefix); // create copy of the field


      var q = _.clone(apiQuery.get(field));

      var oldConditionAsString;
      var newConditionAsString;
      var newConditions;
      var existingConditions; // first check if we have any existing conditions

      existingConditions = this._getExistingVals(apiQuery, n);
      queryCondition = this._sanitizeConditionAsArray(queryCondition);
      mode = this._sanitizeMode(mode);
      var operator;

      if (mode == 'limit') {
        operator = 'AND';
      } else if (mode == 'exclude') {
        operator = 'NOT';
      } else if (mode == 'expand') {
        operator = 'OR';
      } else if (mode == 'replace') {
        this._closeExistingVals(apiQuery, this._n(field, options.prefix));

        apiQuery.set(this._n(field, options.prefix), ['AND', queryCondition[0]]);
        return apiQuery.set(field, queryCondition[0]);
      } else if (mode == 'remove') {
        operator = existingConditions[0];
      } else {
        throw new Error('Unsupported mode/operator:', mode);
      }

      if (!apiQuery.has(field)) {
        var conditions = [operator].concat(queryCondition);
        apiQuery.set(field, this._buildQueryFromConditions(conditions));
        apiQuery.set(this._n(field, options.prefix), conditions);
        return;
      }

      if (existingConditions) {
        // if the operators differ, it means we cannot safely update the query
        // we must treat it as a new query
        if (existingConditions[0] !== operator) {
          this._closeExistingVals(apiQuery, n);

          return this.updateQuery(apiQuery, field, mode, queryCondition);
        }

        oldConditionAsString = this._buildQueryFromConditions(existingConditions);
      } else {
        existingConditions = [operator]; // first value is always operator

        if (q.length == 1) {
          // we got a string, but that string could be a whole phrase
          if (q[0].indexOf(' ') == -1) {
            // simple string
            oldConditionAsString = q[0];
            existingConditions.push(q[0]);
          } else {
            oldConditionAsString = q[0];
            var sillyTest = q[0].toLowerCase();

            if (sillyTest.indexOf(' and ') > -1 || sillyTest.indexOf(' or ') > -1 || sillyTest.indexOf(' not ') > -1 || sillyTest.indexOf(' near') > -1 || sillyTest.indexOf('(') > 2) {
              existingConditions.push('(' + q[0] + ')'); // enclose the expression in brackets, just to be safe
            } else {
              existingConditions.push(q[0]);
            }
          }
        } else {
          oldConditionAsString = this.impossibleString;
        }
      } // 'limit' means that the broader query will become 'narrower'
      // by gaining more AND'ed 'conditions'
      // 'expand' means that the query is becoming broader by gaining
      // more conditions (these are OR'ed)


      if (mode == 'limit' || mode == 'expand') {
        // join the old and the new conditoins (remove the duplicates)
        // we are basically trying to update the existing query
        // by adding more conditions into the same clause
        newConditions = _.union(existingConditions, queryCondition);
        newConditionAsString = this._buildQueryFromConditions(newConditions);

        var testq = _.clone(q); // try to find the pre-condition and replace it with a new value


        if (this._modifyArrayReplaceString(testq, oldConditionAsString, newConditionAsString)) {
          apiQuery.set(field, testq); // success
          // save the values inside the query (so that we can use them if we are called next time)

          apiQuery.set(n, newConditions);
          return;
        }
      } // 'exclude' means that we are ADDING more conditions to the query; the query
      // was broader; not it will explicitly 'exclude' some documents; again - there
      // can also be 'exclude' conditions; so if possible, we'll enlarge their number


      if (mode == 'exclude') {
        var modifiedExisting = _.clone(existingConditions);

        modifiedExisting[0] = 'OR';
        oldConditionAsString = ' NOT ' + this._buildQueryFromConditions(modifiedExisting);
        newConditions = _.union(existingConditions, queryCondition);

        var modifiedConditions = _.clone(newConditions);

        modifiedConditions[0] = 'OR';
        newConditionAsString = ' NOT ' + this._buildQueryFromConditions(modifiedConditions);

        var testq = _.clone(q); // try to find the pre-condition and replace it with a new value


        if (this._modifyArrayReplaceString(testq, oldConditionAsString, newConditionAsString)) {
          apiQuery.set(field, testq); // success
          // save the values inside the query (so that we can use them if we are called next time)

          apiQuery.set(n, newConditions);
          return;
        }
      } else if (mode == 'remove') {
        newConditions = _.difference(existingConditions, queryCondition);
        newConditionAsString = this._buildQueryFromConditions(newConditions); // we'll be deleting

        var testq = _.clone(q); // try to find the pre-condition and replace it with a new value


        if (this._modifyArrayReplaceString(testq, oldConditionAsString, newConditionAsString)) {
          apiQuery.set(field, testq); // success
          // save the values inside the query (so that we can use them if we are called next time)

          apiQuery.set(n, newConditions);
          return;
        }
      } // we didn't find an old query that could be updated, so this means that we have
      // to add a new logical condition to the existing query string.


      if (mode == 'limit') {
        newConditions = this._modifyArrayAddString(q, queryCondition, 'AND');
      } else if (mode == 'exclude') {
        newConditions = this._modifyArrayAddString(q, queryCondition, 'NOT');
      } else if (mode == 'expand') {
        newConditions = this._modifyArrayAddString(q, queryCondition, 'OR');
      }

      apiQuery.set(n, newConditions);
      apiQuery.set(field, q);
    },

    /**
     * Tells whether the string needs escaping (it ignores empty space)
     *
     * @param value
     */
    needsEscape: function needsEscape(s) {
      var sb = [];
      var c;

      for (var i = 0; i < s.length; i++) {
        c = s[i]; // These characters are part of the query syntax and must be escaped

        if (c == '\\' || c == '+' || c == '-' || c == '!' || c == '(' || c == ')' || c == ':' || c == '^' || c == '[' || c == ']' || c == '"' || c == '{' || c == '}' || c == '~' || c == '*' || c == '?' || c == '|' || c == '&' || c == '/') {
          return true;
        }
      }

      return false;
    },

    /**
     * Escapes special characters (but not whitespace)
     *
     * @param value
     */
    escape: function escape(s) {
      var sb = [];
      var c;

      for (var i = 0; i < s.length; i++) {
        c = s[i]; // These characters are part of the query syntax and must be escaped

        if (c == '\\' || c == '+' || c == '-' || c == '!' || c == '(' || c == ')' || c == ':' || c == '^' || c == '[' || c == ']' || c == '"' || c == '{' || c == '}' || c == '~' || c == '*' || c == '?' || c == '|' || c == '&' || c == '/') {
          sb.push('\\');
        }

        sb.push(c);
      }

      return sb.join('');
    },
    escapeInclWhitespace: function escapeInclWhitespace(s) {
      var sb = [];
      var c;

      for (var i = 0; i < s.length; i++) {
        c = s[i]; // These characters are part of the query syntax and must be escaped

        if (c == '\\' || c == '+' || c == '-' || c == '!' || c == '(' || c == ')' || c == ':' || c == '^' || c == '[' || c == ']' || c == '"' || c == '{' || c == '}' || c == '~' || c == '*' || c == '?' || c == '|' || c == '&' || c == '/' || c == ' ' || c == '\t') {
          sb.push('\\');
        }

        sb.push(c);
      }

      return sb.join('');
    },

    /**
     * Wraps string between quotes - and escapes any quotes if present
     * @param s
     * @returns {string}
     */
    quoteIfNecessary: function quoteIfNecessary(s, quoteChar, quoteCharEnd) {
      return this.quote(s, quoteChar, quoteCharEnd, true);
    },

    /**
     * Wraps string between quotes - and escapes any quotes if present
     * @param s
     * @returns {string}
     */
    quote: function quote(s, quoteChar, quoteCharEnd, onlyIfNecessary) {
      if (!quoteChar) quoteChar = '"';
      if (!quoteCharEnd) quoteCharEnd = quoteChar;
      if (_.isUndefined(onlyIfNecessary)) onlyIfNecessary = false;
      var sb = [];
      var c;
      var needsQuotes = false;

      for (var i = 0; i < s.length; i++) {
        c = s[i];

        if (c == '\\' || c == '+' || c == '-' || c == '!' || c == '(' || c == ')' || c == ':' || c == '^' || c == '[' || c == ']' || c == '"' || c == '{' || c == '}' || c == '~' || // || c == '*' || c == '?'
        c == '|' || c == '&' || c == '/' || c == ' ' || c == '\t') {
          needsQuotes = true;
        }

        if ((c == quoteChar || c == quoteCharEnd) && (i == 0 || i > 0 && s[i - 1] !== '\\')) {
          sb.push('\\');
        }

        sb.push(c);
      } // detect presence of quotes in the original string


      if (onlyIfNecessary == true && sb[0] == '\\' && sb[1] == '"' && sb[sb.length - 2] == '\\' && sb[sb.length - 1] == '"') {
        sb[0] = '';
        sb[sb.length - 2] = '';
        return sb.join('');
      }

      if (needsQuotes || onlyIfNecessary == false) {
        return quoteChar + sb.join('') + quoteCharEnd;
      }

      return sb.join('');
    },

    /**
     * Attaches to the ApiQuery object a storage of tmp values; these are
     * not affecting anything inside the query; but the query is carrying them
     * around as long as it was not cloned() etc
     *
     * @param key
     * @param value
     */
    saveTmpEntry: function saveTmpEntry(apiQuery, key, value) {
      var storage = this._getTmpStorage(apiQuery, true);

      var oldVal;

      if (key in storage) {
        oldVal = storage[key];
      }

      storage[key] = value;
      return oldVal;
    },
    removeTmpEntry: function removeTmpEntry(apiQuery, key) {
      var storage = this._getTmpStorage(apiQuery, true);

      var val = storage[key];
      delete storage[key];
      return val;
    },
    getTmpEntry: function getTmpEntry(apiQuery, key, defaultValue) {
      var storage;

      if (defaultValue) {
        storage = this._getTmpStorage(apiQuery, true);
      } else {
        storage = this._getTmpStorage(apiQuery, false);
      }

      if (key in storage) {
        return storage[key];
      }

      storage[key] = defaultValue;
      return defaultValue;
    },
    hasTmpEntry: function hasTmpEntry(apiQuery, key) {
      var storage = this._getTmpStorage(apiQuery);

      return key in storage;
    },
    _getTmpStorage: function _getTmpStorage(apiQuery, createIfNotExists) {
      var n = this._n('__tmpStorage');

      if (!apiQuery.hasOwnProperty(n)) {
        if (!createIfNotExists) return {};
        apiQuery[n] = {};
      }

      return apiQuery[n];
    },
    _n: function _n(name, prefix) {
      return (_.isString(prefix) ? prefix : '__') + this.context + '_' + name;
    },
    _buildQueryFromConditions: function _buildQueryFromConditions(conditions) {
      if (conditions.length <= 1) {
        throw new Error('Violation of contract: first condition is always an operator');
      }

      var op = conditions[0];

      if (op != ' ') {
        op = ' ' + op + ' ';
      }

      return '(' + conditions.slice(1).join(op) + ')';
    },

    /**
     * Searches for values inside the array and replaces sections
     * Returns number of modifications made
     *
     * @param arr
     * @param search
     * @param replace
     * @param maxNumMod
     *    maximum number of modifications to make; you can choose to
     *    replace only the first value found
     * @returns {integer}
     * @private
     */
    _modifyArrayReplaceString: function _modifyArrayReplaceString(arr, search, replace, maxNumMod) {
      var numMod = 0;
      if (!maxNumMod) maxNumMod = -1;

      if (!search) {
        throw new Error('Your search is empty, you fool');
      }

      var modified = false;

      _.each(arr, function (text, i) {
        if (maxNumMod > 0 && numMod > maxNumMod) {
          return;
        }

        if (text.indexOf(search) > -1) {
          arr[i] = text.replace(search, replace);
          numMod += 1;
        }
      });

      return numMod;
    },

    /**
     * Adds the new value into the array
     * @param arr
     * @param conditions
     * @private
     */
    _modifyArrayAddString: function _modifyArrayAddString(arr, conditions, operator) {
      // will always add to the latest string
      if ((arr.length == 0 || arr[arr.length - 1].trim() == '') && (operator == 'NOT' || operator == 'NEAR')) {
        throw new Error('Invalid operation; cannot apply NOT/NEAR on single clause');
      }

      var newQ = arr[arr.length - 1];
      var newConditions = [operator, newQ].concat(conditions);
      arr[arr.length - 1] = this._buildQueryFromConditions(newConditions);
      return newConditions;
    },

    /**
     * Gets the valus of the condition
     * @param apiQuery
     * @param key
     *    the conditon 'name', typically st like __condition_author_q; it differs based on the
     *    operation (type of update/widget/filter etc)
     * @param defaults
     *    what to return if 'key' is not present
     * @returns {*}
     * @private
     */
    _getExistingVals: function _getExistingVals(apiQuery, key, defaults) {
      if (apiQuery.has(key)) {
        return apiQuery.get(key);
      }

      return defaults;
    },

    /**
     * When we have conditions for the previous context; but their operator is
     * different, it means that the new conditions represent a new clause. So
     * we need to do something with the old conditions (we could stack them
     * but for now, the simple/robust solution is to simply remove them ->
     * this means they will not be available for updates/manipulation -->
     * theh query will be extended)
     *
     * @param condName
     * @private
     */
    _closeExistingVals: function _closeExistingVals(apiQuery, condName) {
      apiQuery.unset(condName);
    },
    _sanitizeMode: function _sanitizeMode(mode) {
      if (!mode) {
        return this.defaultMode;
      }

      var i = _.indexOf(this.operationModes, mode);

      if (i == -1) {
        throw new Error('Unkwnown mode: ' + mode);
      }

      return this.operationModes[i];
    },
    _sanitizeOperator: function _sanitizeOperator(operator) {
      if (!operator) {
        return this.defaultOperator;
      }

      if (_.isString(operator)) {
        if (operator.trim() == '') {
          return this.defaultOperator;
        }
      } else {
        throw new Error('Operator must be a string');
      }

      operator = operator.toUpperCase();

      var i = _.indexOf(this.operators, operator);

      if (i == -1) {
        throw new Error('Unknown operator: ', operator);
      }

      return this.operators[i];
    },
    _sanitizeConditionAsArray: function _sanitizeConditionAsArray(condition) {
      if (!condition) {
        throw new Error('The condition must be set (string/array of strings)');
      }

      if (_.isString(condition)) {
        return [condition];
      }

      condition = _.without(_.flatten(condition), '', false, null, undefined, NaN);

      if (condition.length == 0) {
        throw new Error('After removing empty values, no condition was left');
      }

      return condition;
    },

    /**
     * Cleans up the *clone* of the apiQuery by removing all the entries
     * that are inserted into ApiQuery by the query updater.
     *
     * @param apiQuery
     */
    clean: function clean(apiQuery) {
      var q = {};

      if (apiQuery && apiQuery.keys) {
        _.each(apiQuery.keys(), function (key) {
          if (!(key.substring(0, 2) == '__')) {
            q[key] = apiQuery.get(key);
          }
        });
      }

      return new ApiQuery(q);
    }
  });

  return ApiQueryUpdater;
});

/*
 * A simple wrapper around the API response for ADS
 * This class is extended/enhanced by other implementations
 * (e.g. solr_response)
 */
define('js/components/json_response',['underscore', 'backbone', 'js/components/api_query'], function (_, Backbone, ApiQuery) {
  var JSONResponse = function JSONResponse(attributes, options) {
    var defaults;
    var attrs = attributes || {};
    options || (options = {});
    this.rid = _.uniqueId('r');
    this.readOnly = options.hasOwnProperty('readOnly') ? options.readOnly : true;
    this._url = options.hasOwnProperty('url') ? options.url : null;
    if (options.parse) attrs = this.parse(attrs, options) || {};

    if (defaults = _.result(this, 'defaults')) {
      attrs = _.defaults({}, attrs, defaults);
    }

    this.attributes = attrs;
    this.initialize.apply(this, arguments);
  };

  _.extend(JSONResponse.prototype, {
    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function initialize() {},
    getApiQuery: function getApiQuery() {
      return this.apiQuery;
    },
    setApiQuery: function setApiQuery(q) {
      if (!q) {
        return;
      }

      if (!(q instanceof ApiQuery)) {
        throw new Error('Only ApiQuery instances accepted');
      }

      this.apiQuery = q;
    },
    // Return a copy of the model's `attributes` object.
    toJSON: function toJSON(options) {
      return this._clone(this.attributes);
    },
    // url string that identifies this object
    url: function url() {
      if (this._url) {
        return this._url;
      }

      return this.rid; // default is just to return response id
    },
    set: function set(key, val, options) {
      if (this.readOnly) {
        throw Error("You can't change read-only response object");
      }

      var parts = this._split(key);

      if (parts.length == 1) {
        this.attributes[parts[0]] = val;
      } else {
        var pointer = this.get(key);
        pointer = val;
      }
    },
    _split: function _split(key) {
      var parts = [];
      var i = 0;
      var l = key.length;
      var start = 0;
      var quotes = [];

      while (i < l) {
        if (key[i] == quotes[quotes.length - 1]) {
          quotes.pop();
        } else if (key[i] == '"' || key[i] == "'") {
          quotes.push(key[i]);
        } else if (key[i] == '.' && quotes.length == 0) {
          parts.push(key.substring(start, i));
          start = i + 1;
        } else if (key[i] == '[' && quotes.length == 0) {
          parts.push(key.substring(start, i));
          parts.push(key.substring(i, key.indexOf(']', i + 1) + 1));
          start = i = key.indexOf(']', i + 1) + 1;
        }

        i += 1;
      }

      if (start < l) {
        parts.push(key.substring(start));
      } // console.log(key, parts);


      return parts;
    },
    has: function has(key) {
      return this.get(key, true);
    },
    get: function get(key, justCheck, defaultValue) {
      // if key empty, return everything
      if (!key) {
        return this._clone(this.attributes);
      }

      var parts = this._split(key);

      var found = [];
      var pointer = this.attributes;

      while (parts.length > 0) {
        var k = parts.shift();

        if (pointer.hasOwnProperty(k)) {
          pointer = pointer[k];
          found.push(k);
        } else if (k.indexOf('[') > -1) {
          // foo['something'] or foo[0]
          var m = k.trim().substring(1, k.length - 1);

          if ((m.indexOf('"') > -1 || m.indexOf("'") > -1) && pointer.hasOwnProperty(m.substring(1, m.length - 1))) {
            // object property access
            pointer = pointer[m.substring(1, m.length - 1)];
            found.push(m);
          } else if (_.isArray(pointer)) {
            var ix = null;

            try {
              ix = parseInt(m);

              if (_.isNaN(ix) || pointer.length <= ix || ix < 0) {
                if (justCheck) {
                  return false;
                }

                if (typeof defaultValue !== 'undefined') {
                  return defaultValue;
                }

                throw new Error();
              }

              pointer = pointer[ix];
              found.push(m);
            } catch (e) {
              if (justCheck) {
                return false;
              }

              if (typeof defaultValue !== 'undefined') {
                return defaultValue;
              }

              throw new Error("Can't find: " + key + (found.length > 0 ? ' (worked up to: ' + found.join('.') + ')' : ''));
            }
          } else {
            if (justCheck) {
              return false;
            }

            if (typeof defaultValue !== 'undefined') {
              return defaultValue;
            }

            throw new Error("Can't find: " + key + (found.length > 0 ? ' (worked up to: ' + found.join('.') + ')' : ''));
          }
        } else {
          if (justCheck) {
            return false;
          }

          if (typeof defaultValue !== 'undefined') {
            return defaultValue;
          }

          throw new Error("Can't find: " + key + (found.length > 0 ? ' (worked up to: ' + found.join('.') + ')' : ''));
        }
      }

      if (justCheck) {
        return true;
      }

      return this._clone(pointer);
    },
    clone: function clone() {
      return new this.constructor(this.attributes);
    },
    // creates a copy of the requested elements
    _clone: function _clone(elem) {
      if (!this.readOnly || !_.isObject(elem)) {
        return elem;
      }

      if (_.cloneDeep) {
        // lodash
        return _.cloneDeep(elem);
      }

      return JSON.parse(JSON.stringify(elem));
    },
    isLocked: function isLocked() {
      return this.readOnly;
    },
    lock: function lock() {
      return this.readOnly = true;
    },
    unlock: function unlock() {
      return this.readOnly = false;
    }
  }); // use the bb extend function for classes hierarchy


  JSONResponse.extend = Backbone.Model.extend;
  return JSONResponse;
});
/**
 * Created by rchyla on 3/3/14.
 */
;
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Created by rchyla on 3/28/14.
 */
define('js/components/default_request',['underscore', 'backbone', 'js/components/api_query', 'js/components/multi_params'], function (_, Backbone, ApiQuery, MultiParams) {
  var basicCheck = function basicCheck(s) {
    if (_.isString(s)) {
      return true;
    }

    if (_.isArray(s)) {
      var l = s.length;

      for (var i = 0; i < l; i++) {
        var x = s[i];

        if (!(_.isString(x) || _.isNumber(x))) {
          return false;
        }
      }
    }

    return true;
  };

  var allowedAttrs = {
    query: function query(v) {
      if (_.isUndefined(v)) {
        return true;
      }

      return v instanceof ApiQuery;
    },
    target: basicCheck,
    sender: basicCheck,
    options: basicCheck
  };
  var checker = {
    target: function target(s) {
      if (s && s.substring(0, 1) !== '/') {
        return '/' + s;
      }
    }
  };
  var Request = MultiParams.extend({
    /**
     * Internal method: we allow only certain keys
     *
     * @param attributes
     * @param options
     * @returns {boolean}
     * @private
     */
    _validate: function _validate(attributes, options) {
      _.forOwn(attributes, function (val, attr) {
        var tempVal = attributes[attr];

        if (!(attr in allowedAttrs)) {
          throw new Error('Invalid attr: ' + attr);
        }

        if (!allowedAttrs[attr].call(allowedAttrs, tempVal)) {
          throw new Error('Invalid value:key ' + attr + tempVal);
        }
      });

      return true;
    },

    /**
     * Modified version of the multi-valued set(); we do not insist
     * on having the values in array
     *
     * @param key
     * @param val
     * @param options
     * @returns {Request}
     */
    set: function set(key, val, options) {
      this._checkLock();

      var attrs;
      if (key == null) return this; // Handle both `"key", value` and `{key: value}` -style arguments.

      if (_typeof(key) === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      Backbone.Model.prototype.set.call(this, attrs, options);
    },
    // for requests, we use all components: path, query, hash
    _checkParsed: function _checkParsed(attrs) {
      if (_.isObject(attrs)) {
        var ret = {};

        if ('#query' in attrs && !_.isEmpty(attrs['#query'])) {
          ret.query = new ApiQuery(attrs['#query']);
        }

        if ('#path' in attrs) {
          ret.target = attrs['#path'][0];
        }

        if ('#hash' in attrs) {
          _.extend(ret, _.each(attrs['#hash'], function (val, key, obj) {
            if (val.length == 1) {
              obj[key] = val[0];
            }
          }));
        }

        return ret;
      }

      return attrs;
    },

    /*
     * Return the url string encoding all parameters that made
     * this request. The parameters will be sorted alphabetically
     * by their keys and URL encoded so that they can be used
     * in requests.
     */
    url: function url(whatToSort) {
      if (!whatToSort) {
        whatToSort = this.attributes;
      }

      var target = whatToSort.target;
      var url = target ? _.isArray(target) ? target.join('/') : target : '';

      if ('query' in whatToSort) {
        url += '?' + whatToSort.query.url();
      }

      if ('sender' in whatToSort) {
        url += '#' + MultiParams.prototype.url.call(this, {
          sender: whatToSort.sender
        });
      }

      return url;
    },

    /**
     * Re-constructs the query from the url string, returns the json attributes;
     * cannot be used it the instance is locked
     *
     * @param query (String)
     * @returns {Model}
     */
    load: function load(query) {
      return MultiParams.prototype.load.call(this, query.indexOf('?') > -1 ? query : query + '?');
    }
  });
  return Request;
});

/**
 * Created by rchyla on 3/28/14.
 */
define('js/components/api_request',['underscore', 'backbone', 'js/components/facade', 'js/components/default_request'], function (_, Backbone, Facade, ApiRequestImpl) {
  var hardenedInterface = {
    // add makes no sense with request
    get: 'get a key',
    set: 'set (replace existing)',
    url: 'url string defining this request',
    has: 'has a key',
    load: 'loads request as a string',
    clear: 'clears all values',
    unset: 'removes a key',
    toJSON: 'values back as JSON object',
    clone: 'make a copy',
    isLocked: true,
    lock: true,
    unlock: true,
    pairs: 'get all values as pairs',
    keys: 'as keys',
    values: 'only values',
    hasChanged: 'whether this object has modification (since its creation)',
    previousAttributes: 'get all changed attributes',
    previous: 'previous values for a given attribute'
  };

  var ApiRequest = function ApiRequest(data, options) {
    // Facade pattern, we want to expose only limited API
    // despite the fact that the underlying instance has
    // all power of the Backbone.Model
    if (data instanceof ApiRequestImpl) {
      this.innerRequest = new Facade(hardenedInterface, data);
    } else {
      this.innerRequest = new Facade(hardenedInterface, new ApiRequestImpl(data, options));
    }
  };

  var toInsert = {};

  _.each(_.keys(hardenedInterface), function (element, index, list) {
    toInsert[element] = function () {
      return this.innerRequest[element].apply(this.innerRequest, arguments);
    };
  });

  _.extend(ApiRequest.prototype, toInsert, {
    clone: function clone() {
      var clone = this.innerRequest.clone.apply(this.innerRequest, arguments);
      return new ApiRequest(clone);
    },
    load: function load() {
      var clone = this.innerRequest.load.apply(this.innerRequest, arguments);
      return new ApiRequest(clone);
    }
  });

  return ApiRequest;
});

/**
 * Created by rchyla on 1/20/15
 *
 * contains api targets
 * and any related limits
 */
define('js/components/api_targets',[], function () {
  var config = {
    BOOTSTRAP: '/accounts/bootstrap',
    SEARCH: 'search/query',
    QTREE: 'search/qtree',
    BIGQUERY: 'search/bigquery',
    EXPORT: 'export/',
    SERVICE_AUTHOR_NETWORK: 'vis/author-network',
    SERVICE_PAPER_NETWORK: 'vis/paper-network',
    SERVICE_WORDCLOUD: 'vis/word-cloud',
    SERVICE_METRICS: 'metrics',
    SERVICE_OBJECTS: 'objects',
    SERVICE_OBJECTS_QUERY: 'objects/query',
    SERVICE_CITATION_HELPER: 'citation_helper',
    SERVICE_AUTHOR_AFFILIATION_EXPORT: 'authoraff',
    MYADS_STORAGE: 'vault',
    MYADS_NOTIFICATIONS: 'vault/_notifications',
    AUTHOR_AFFILIATION_SEARCH: 'author-affiliation/search',
    AUTHOR_AFFILIATION_EXPORT: 'author-affiliation/export',
    RESOLVER: 'resolver',
    CSRF: 'accounts/csrf',
    USER: 'accounts/user',
    USER_DATA: 'vault/user-data',
    SITE_CONFIGURATION: 'vault/configuration',
    TOKEN: 'accounts/token',
    LOGOUT: 'accounts/logout',
    REGISTER: 'accounts/register',
    VERIFY: 'accounts/verify',
    DELETE: 'accounts/user/delete',
    RESET_PASSWORD: 'accounts/reset-password',
    CHANGE_PASSWORD: 'accounts/change-password',
    CHANGE_EMAIL: 'accounts/change-email',
    RECOMMENDER: 'recommender',
    GRAPHICS: 'graphics',
    FEEDBACK: 'feedback/userfeedback',
    // library import from classic
    LIBRARY_IMPORT_CLASSIC_AUTH: 'harbour/auth/classic',
    LIBRARY_IMPORT_CLASSIC_MIRRORS: 'harbour/mirrors',
    LIBRARY_IMPORT_CLASSIC_TO_BBB: 'biblib/classic',
    // library import from 2.0
    LIBRARY_IMPORT_ADS2_AUTH: 'harbour/auth/twopointoh',
    LIBRARY_IMPORT_ADS2_TO_BBB: 'biblib/twopointoh',
    LIBRARY_IMPORT_ZOTERO: 'harbour/export/twopointoh/zotero',
    LIBRARY_IMPORT_MENDELEY: 'harbour/export/twopointoh/mendeley',
    // returns credentials from both classic and 2.0 if they exist
    LIBRARY_IMPORT_CREDENTIALS: 'harbour/user',
    // store ADS information connected with ORCID here
    ORCID_PREFERENCES: 'orcid/preferences',
    ORCID_NAME: 'orcid/orcid-name',
    // library endpoints
    // can get info about all libraries, or list of bibcodes associated w/specific lib (libraries/id)
    // post to /libraries/ to create a library
    LIBRARIES: 'biblib/libraries',
    LIBRARY_TRANSFER: 'biblib/transfer',
    // can post, put, and delete changes to individual libs using this endpoint
    DOCUMENTS: 'biblib/documents',
    PERMISSIONS: 'biblib/permissions',
    REFERENCE: 'reference/text',

    /*
     * this is used by the mixin 'user_change_rows' to set max allowed/default requested
     */
    _limits: {
      // use the same name from discovery.config.js
      ExportWidget: {
        default: 500,
        limit: 3000
      },
      Metrics: {
        default: 7000,
        limit: 7000
      },
      AuthorNetwork: {
        default: 400,
        limit: 1000
      },
      PaperNetwork: {
        default: 400,
        limit: 1000
      },
      ConceptCloud: {
        default: 150,
        limit: 150
      },
      BubbleChart: {
        // default == limit
        default: 1500
      }
    }
  }; // add credential info
  // doesn't require cross domain cookies

  config._doesntNeedCredentials = [config.SEARCH, config.QTREE, config.BIGQUERY, config.EXPORT, config.SERVICE_AUTHOR_NETWORK, config.SERVICE_PAPER_NETWORK, config.SERVICE_WORDCLOUD, config.SERVICE_METRICS, config.RECOMMENDER, config.GRAPHICS, config.FEEDBACK];
  return config;
});

/*!

 handlebars v3.0.3

 Copyright (C) 2011-2014 by Yehuda Katz

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 @license
 */
(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory();
  else if(typeof define === 'function' && define.amd)
    define('hbs/handlebars',factory);
  else if(typeof exports === 'object')
    exports["Handlebars"] = factory();
  else
    root["Handlebars"] = factory();
})(this, function() {
  return /******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};

    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {

      /******/ 		// Check if module is in cache
      /******/ 		if(installedModules[moduleId])
      /******/ 			return installedModules[moduleId].exports;

      /******/ 		// Create a new module (and put it into the cache)
      /******/ 		var module = installedModules[moduleId] = {
        /******/ 			exports: {},
        /******/ 			id: moduleId,
        /******/ 			loaded: false
        /******/ 		};

      /******/ 		// Execute the module function
      /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

      /******/ 		// Flag the module as loaded
      /******/ 		module.loaded = true;

      /******/ 		// Return the exports of the module
      /******/ 		return module.exports;
      /******/ 	}


    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;

    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;

    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "";

    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(0);
    /******/ })
    /************************************************************************/
    /******/ ([
    /* 0 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireDefault = __webpack_require__(8)['default'];

      exports.__esModule = true;

      var _runtime = __webpack_require__(1);

      var _runtime2 = _interopRequireDefault(_runtime);

      // Compiler imports

      var _AST = __webpack_require__(2);

      var _AST2 = _interopRequireDefault(_AST);

      var _Parser$parse = __webpack_require__(3);

      var _Compiler$compile$precompile = __webpack_require__(4);

      var _JavaScriptCompiler = __webpack_require__(5);

      var _JavaScriptCompiler2 = _interopRequireDefault(_JavaScriptCompiler);

      var _Visitor = __webpack_require__(6);

      var _Visitor2 = _interopRequireDefault(_Visitor);

      var _noConflict = __webpack_require__(7);

      var _noConflict2 = _interopRequireDefault(_noConflict);

      var _create = _runtime2['default'].create;
      function create() {
        var hb = _create();

        hb.compile = function (input, options) {
          return _Compiler$compile$precompile.compile(input, options, hb);
        };
        hb.precompile = function (input, options) {
          return _Compiler$compile$precompile.precompile(input, options, hb);
        };

        hb.AST = _AST2['default'];
        hb.Compiler = _Compiler$compile$precompile.Compiler;
        hb.JavaScriptCompiler = _JavaScriptCompiler2['default'];
        hb.Parser = _Parser$parse.parser;
        hb.parse = _Parser$parse.parse;

        return hb;
      }

      var inst = create();
      inst.create = create;

      _noConflict2['default'](inst);

      inst.Visitor = _Visitor2['default'];

      inst['default'] = inst;

      exports['default'] = inst;
      module.exports = exports['default'];

      /***/ },
    /* 1 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireWildcard = __webpack_require__(9)['default'];

      var _interopRequireDefault = __webpack_require__(8)['default'];

      exports.__esModule = true;

      var _import = __webpack_require__(10);

      var base = _interopRequireWildcard(_import);

      // Each of these augment the Handlebars object. No need to setup here.
      // (This is done to easily share code between commonjs and browse envs)

      var _SafeString = __webpack_require__(11);

      var _SafeString2 = _interopRequireDefault(_SafeString);

      var _Exception = __webpack_require__(12);

      var _Exception2 = _interopRequireDefault(_Exception);

      var _import2 = __webpack_require__(13);

      var Utils = _interopRequireWildcard(_import2);

      var _import3 = __webpack_require__(14);

      var runtime = _interopRequireWildcard(_import3);

      var _noConflict = __webpack_require__(7);

      var _noConflict2 = _interopRequireDefault(_noConflict);

      // For compatibility and usage outside of module systems, make the Handlebars object a namespace
      function create() {
        var hb = new base.HandlebarsEnvironment();

        Utils.extend(hb, base);
        hb.SafeString = _SafeString2['default'];
        hb.Exception = _Exception2['default'];
        hb.Utils = Utils;
        hb.escapeExpression = Utils.escapeExpression;

        hb.VM = runtime;
        hb.template = function (spec) {
          return runtime.template(spec, hb);
        };

        return hb;
      }

      var inst = create();
      inst.create = create;

      _noConflict2['default'](inst);

      inst['default'] = inst;

      exports['default'] = inst;
      module.exports = exports['default'];

      /***/ },
    /* 2 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      exports.__esModule = true;
      var AST = {
        Program: function Program(statements, blockParams, strip, locInfo) {
          this.loc = locInfo;
          this.type = 'Program';
          this.body = statements;

          this.blockParams = blockParams;
          this.strip = strip;
        },

        MustacheStatement: function MustacheStatement(path, params, hash, escaped, strip, locInfo) {
          this.loc = locInfo;
          this.type = 'MustacheStatement';

          this.path = path;
          this.params = params || [];
          this.hash = hash;
          this.escaped = escaped;

          this.strip = strip;
        },

        BlockStatement: function BlockStatement(path, params, hash, program, inverse, openStrip, inverseStrip, closeStrip, locInfo) {
          this.loc = locInfo;
          this.type = 'BlockStatement';

          this.path = path;
          this.params = params || [];
          this.hash = hash;
          this.program = program;
          this.inverse = inverse;

          this.openStrip = openStrip;
          this.inverseStrip = inverseStrip;
          this.closeStrip = closeStrip;
        },

        PartialStatement: function PartialStatement(name, params, hash, strip, locInfo) {
          this.loc = locInfo;
          this.type = 'PartialStatement';

          this.name = name;
          this.params = params || [];
          this.hash = hash;

          this.indent = '';
          this.strip = strip;
        },

        ContentStatement: function ContentStatement(string, locInfo) {
          this.loc = locInfo;
          this.type = 'ContentStatement';
          this.original = this.value = string;
        },

        CommentStatement: function CommentStatement(comment, strip, locInfo) {
          this.loc = locInfo;
          this.type = 'CommentStatement';
          this.value = comment;

          this.strip = strip;
        },

        SubExpression: function SubExpression(path, params, hash, locInfo) {
          this.loc = locInfo;

          this.type = 'SubExpression';
          this.path = path;
          this.params = params || [];
          this.hash = hash;
        },

        PathExpression: function PathExpression(data, depth, parts, original, locInfo) {
          this.loc = locInfo;
          this.type = 'PathExpression';

          this.data = data;
          this.original = original;
          this.parts = parts;
          this.depth = depth;
        },

        StringLiteral: function StringLiteral(string, locInfo) {
          this.loc = locInfo;
          this.type = 'StringLiteral';
          this.original = this.value = string;
        },

        NumberLiteral: function NumberLiteral(number, locInfo) {
          this.loc = locInfo;
          this.type = 'NumberLiteral';
          this.original = this.value = Number(number);
        },

        BooleanLiteral: function BooleanLiteral(bool, locInfo) {
          this.loc = locInfo;
          this.type = 'BooleanLiteral';
          this.original = this.value = bool === 'true';
        },

        UndefinedLiteral: function UndefinedLiteral(locInfo) {
          this.loc = locInfo;
          this.type = 'UndefinedLiteral';
          this.original = this.value = undefined;
        },

        NullLiteral: function NullLiteral(locInfo) {
          this.loc = locInfo;
          this.type = 'NullLiteral';
          this.original = this.value = null;
        },

        Hash: function Hash(pairs, locInfo) {
          this.loc = locInfo;
          this.type = 'Hash';
          this.pairs = pairs;
        },
        HashPair: function HashPair(key, value, locInfo) {
          this.loc = locInfo;
          this.type = 'HashPair';
          this.key = key;
          this.value = value;
        },

        // Public API used to evaluate derived attributes regarding AST nodes
        helpers: {
          // a mustache is definitely a helper if:
          // * it is an eligible helper, and
          // * it has at least one parameter or hash segment
          helperExpression: function helperExpression(node) {
            return !!(node.type === 'SubExpression' ||  node.params.length || node.hash);
          },

          scopedId: function scopedId(path) {
            return /^\.|this\b/.test(path.original);
          },

          // an ID is simple if it only has one part, and that part is not
          // `..` or `this`.
          simpleId: function simpleId(path) {
            return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;
          }
        }
      };

      // Must be exported as an object rather than the root of the module as the jison lexer
      // must modify the object to operate properly.
      exports['default'] = AST;
      module.exports = exports['default'];

      /***/ },
    /* 3 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireDefault = __webpack_require__(8)['default'];

      var _interopRequireWildcard = __webpack_require__(9)['default'];

      exports.__esModule = true;
      exports.parse = parse;

      var _parser = __webpack_require__(15);

      var _parser2 = _interopRequireDefault(_parser);

      var _AST = __webpack_require__(2);

      var _AST2 = _interopRequireDefault(_AST);

      var _WhitespaceControl = __webpack_require__(16);

      var _WhitespaceControl2 = _interopRequireDefault(_WhitespaceControl);

      var _import = __webpack_require__(17);

      var Helpers = _interopRequireWildcard(_import);

      var _extend = __webpack_require__(13);

      exports.parser = _parser2['default'];

      var yy = {};
      _extend.extend(yy, Helpers, _AST2['default']);

      function parse(input, options) {
        // Just return if an already-compiled AST was passed in.
        if (input.type === 'Program') {
          return input;
        }

        _parser2['default'].yy = yy;

        // Altering the shared object here, but this is ok as parser is a sync operation
        yy.locInfo = function (locInfo) {
          return new yy.SourceLocation(options && options.srcName, locInfo);
        };

        var strip = new _WhitespaceControl2['default']();
        return strip.accept(_parser2['default'].parse(input));
      }

      /***/ },
    /* 4 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireDefault = __webpack_require__(8)['default'];

      exports.__esModule = true;
      exports.Compiler = Compiler;
      exports.precompile = precompile;
      exports.compile = compile;

      var _Exception = __webpack_require__(12);

      var _Exception2 = _interopRequireDefault(_Exception);

      var _isArray$indexOf = __webpack_require__(13);

      var _AST = __webpack_require__(2);

      var _AST2 = _interopRequireDefault(_AST);

      var slice = [].slice;

      function Compiler() {}

      // the foundHelper register will disambiguate helper lookup from finding a
      // function in a context. This is necessary for mustache compatibility, which
      // requires that context functions in blocks are evaluated by blockHelperMissing,
      // and then proceed as if the resulting value was provided to blockHelperMissing.

      Compiler.prototype = {
        compiler: Compiler,

        equals: function equals(other) {
          var len = this.opcodes.length;
          if (other.opcodes.length !== len) {
            return false;
          }

          for (var i = 0; i < len; i++) {
            var opcode = this.opcodes[i],
                otherOpcode = other.opcodes[i];
            if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
              return false;
            }
          }

          // We know that length is the same between the two arrays because they are directly tied
          // to the opcode behavior above.
          len = this.children.length;
          for (var i = 0; i < len; i++) {
            if (!this.children[i].equals(other.children[i])) {
              return false;
            }
          }

          return true;
        },

        guid: 0,

        compile: function compile(program, options) {
          this.sourceNode = [];
          this.opcodes = [];
          this.children = [];
          this.options = options;
          this.stringParams = options.stringParams;
          this.trackIds = options.trackIds;

          options.blockParams = options.blockParams || [];

          // These changes will propagate to the other compiler components
          var knownHelpers = options.knownHelpers;
          options.knownHelpers = {
            helperMissing: true,
            blockHelperMissing: true,
            each: true,
            'if': true,
            unless: true,
            'with': true,
            log: true,
            lookup: true
          };
          if (knownHelpers) {
            for (var _name in knownHelpers) {
              if (_name in knownHelpers) {
                options.knownHelpers[_name] = knownHelpers[_name];
              }
            }
          }

          return this.accept(program);
        },

        compileProgram: function compileProgram(program) {
          var childCompiler = new this.compiler(),
          // eslint-disable-line new-cap
              result = childCompiler.compile(program, this.options),
              guid = this.guid++;

          this.usePartial = this.usePartial || result.usePartial;

          this.children[guid] = result;
          this.useDepths = this.useDepths || result.useDepths;

          return guid;
        },

        accept: function accept(node) {
          this.sourceNode.unshift(node);
          var ret = this[node.type](node);
          this.sourceNode.shift();
          return ret;
        },

        Program: function Program(program) {
          this.options.blockParams.unshift(program.blockParams);

          var body = program.body,
              bodyLength = body.length;
          for (var i = 0; i < bodyLength; i++) {
            this.accept(body[i]);
          }

          this.options.blockParams.shift();

          this.isSimple = bodyLength === 1;
          this.blockParams = program.blockParams ? program.blockParams.length : 0;

          return this;
        },

        BlockStatement: function BlockStatement(block) {
          transformLiteralToPath(block);

          var program = block.program,
              inverse = block.inverse;

          program = program && this.compileProgram(program);
          inverse = inverse && this.compileProgram(inverse);

          var type = this.classifySexpr(block);

          if (type === 'helper') {
            this.helperSexpr(block, program, inverse);
          } else if (type === 'simple') {
            this.simpleSexpr(block);

            // now that the simple mustache is resolved, we need to
            // evaluate it by executing `blockHelperMissing`
            this.opcode('pushProgram', program);
            this.opcode('pushProgram', inverse);
            this.opcode('emptyHash');
            this.opcode('blockValue', block.path.original);
          } else {
            this.ambiguousSexpr(block, program, inverse);

            // now that the simple mustache is resolved, we need to
            // evaluate it by executing `blockHelperMissing`
            this.opcode('pushProgram', program);
            this.opcode('pushProgram', inverse);
            this.opcode('emptyHash');
            this.opcode('ambiguousBlockValue');
          }

          this.opcode('append');
        },

        PartialStatement: function PartialStatement(partial) {
          this.usePartial = true;

          var params = partial.params;
          if (params.length > 1) {
            throw new _Exception2['default']('Unsupported number of partial arguments: ' + params.length, partial);
          } else if (!params.length) {
            params.push({ type: 'PathExpression', parts: [], depth: 0 });
          }

          var partialName = partial.name.original,
              isDynamic = partial.name.type === 'SubExpression';
          if (isDynamic) {
            this.accept(partial.name);
          }

          this.setupFullMustacheParams(partial, undefined, undefined, true);

          var indent = partial.indent || '';
          if (this.options.preventIndent && indent) {
            this.opcode('appendContent', indent);
            indent = '';
          }

          this.opcode('invokePartial', isDynamic, partialName, indent);
          this.opcode('append');
        },

        MustacheStatement: function MustacheStatement(mustache) {
          this.SubExpression(mustache); // eslint-disable-line new-cap

          if (mustache.escaped && !this.options.noEscape) {
            this.opcode('appendEscaped');
          } else {
            this.opcode('append');
          }
        },

        ContentStatement: function ContentStatement(content) {
          if (content.value) {
            this.opcode('appendContent', content.value);
          }
        },

        CommentStatement: function CommentStatement() {},

        SubExpression: function SubExpression(sexpr) {
          transformLiteralToPath(sexpr);
          var type = this.classifySexpr(sexpr);

          if (type === 'simple') {
            this.simpleSexpr(sexpr);
          } else if (type === 'helper') {
            this.helperSexpr(sexpr);
          } else {
            this.ambiguousSexpr(sexpr);
          }
        },
        ambiguousSexpr: function ambiguousSexpr(sexpr, program, inverse) {
          var path = sexpr.path,
              name = path.parts[0],
              isBlock = program != null || inverse != null;

          this.opcode('getContext', path.depth);

          this.opcode('pushProgram', program);
          this.opcode('pushProgram', inverse);

          this.accept(path);

          this.opcode('invokeAmbiguous', name, isBlock);
        },

        simpleSexpr: function simpleSexpr(sexpr) {
          this.accept(sexpr.path);
          this.opcode('resolvePossibleLambda');
        },

        helperSexpr: function helperSexpr(sexpr, program, inverse) {
          var params = this.setupFullMustacheParams(sexpr, program, inverse),
              path = sexpr.path,
              name = path.parts[0];

          if (this.options.knownHelpers[name]) {
            this.opcode('invokeKnownHelper', params.length, name);
          } else if (this.options.knownHelpersOnly) {
            throw new _Exception2['default']('You specified knownHelpersOnly, but used the unknown helper ' + name, sexpr);
          } else {
            path.falsy = true;

            this.accept(path);
            this.opcode('invokeHelper', params.length, path.original, _AST2['default'].helpers.simpleId(path));
          }
        },

        PathExpression: function PathExpression(path) {
          this.addDepth(path.depth);
          this.opcode('getContext', path.depth);

          var name = path.parts[0],
              scoped = _AST2['default'].helpers.scopedId(path),
              blockParamId = !path.depth && !scoped && this.blockParamIndex(name);

          if (blockParamId) {
            this.opcode('lookupBlockParam', blockParamId, path.parts);
          } else if (!name) {
            // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
            this.opcode('pushContext');
          } else if (path.data) {
            this.options.data = true;
            this.opcode('lookupData', path.depth, path.parts);
          } else {
            this.opcode('lookupOnContext', path.parts, path.falsy, scoped);
          }
        },

        StringLiteral: function StringLiteral(string) {
          this.opcode('pushString', string.value);
        },

        NumberLiteral: function NumberLiteral(number) {
          this.opcode('pushLiteral', number.value);
        },

        BooleanLiteral: function BooleanLiteral(bool) {
          this.opcode('pushLiteral', bool.value);
        },

        UndefinedLiteral: function UndefinedLiteral() {
          this.opcode('pushLiteral', 'undefined');
        },

        NullLiteral: function NullLiteral() {
          this.opcode('pushLiteral', 'null');
        },

        Hash: function Hash(hash) {
          var pairs = hash.pairs,
              i = 0,
              l = pairs.length;

          this.opcode('pushHash');

          for (; i < l; i++) {
            this.pushParam(pairs[i].value);
          }
          while (i--) {
            this.opcode('assignToHash', pairs[i].key);
          }
          this.opcode('popHash');
        },

        // HELPERS
        opcode: function opcode(name) {
          this.opcodes.push({ opcode: name, args: slice.call(arguments, 1), loc: this.sourceNode[0].loc });
        },

        addDepth: function addDepth(depth) {
          if (!depth) {
            return;
          }

          this.useDepths = true;
        },

        classifySexpr: function classifySexpr(sexpr) {
          var isSimple = _AST2['default'].helpers.simpleId(sexpr.path);

          var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);

          // a mustache is an eligible helper if:
          // * its id is simple (a single part, not `this` or `..`)
          var isHelper = !isBlockParam && _AST2['default'].helpers.helperExpression(sexpr);

          // if a mustache is an eligible helper but not a definite
          // helper, it is ambiguous, and will be resolved in a later
          // pass or at runtime.
          var isEligible = !isBlockParam && (isHelper || isSimple);

          // if ambiguous, we can possibly resolve the ambiguity now
          // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
          if (isEligible && !isHelper) {
            var _name2 = sexpr.path.parts[0],
                options = this.options;

            if (options.knownHelpers[_name2]) {
              isHelper = true;
            } else if (options.knownHelpersOnly) {
              isEligible = false;
            }
          }

          if (isHelper) {
            return 'helper';
          } else if (isEligible) {
            return 'ambiguous';
          } else {
            return 'simple';
          }
        },

        pushParams: function pushParams(params) {
          for (var i = 0, l = params.length; i < l; i++) {
            this.pushParam(params[i]);
          }
        },

        pushParam: function pushParam(val) {
          var value = val.value != null ? val.value : val.original || '';

          if (this.stringParams) {
            if (value.replace) {
              value = value.replace(/^(\.?\.\/)*/g, '').replace(/\//g, '.');
            }

            if (val.depth) {
              this.addDepth(val.depth);
            }
            this.opcode('getContext', val.depth || 0);
            this.opcode('pushStringParam', value, val.type);

            if (val.type === 'SubExpression') {
              // SubExpressions get evaluated and passed in
              // in string params mode.
              this.accept(val);
            }
          } else {
            if (this.trackIds) {
              var blockParamIndex = undefined;
              if (val.parts && !_AST2['default'].helpers.scopedId(val) && !val.depth) {
                blockParamIndex = this.blockParamIndex(val.parts[0]);
              }
              if (blockParamIndex) {
                var blockParamChild = val.parts.slice(1).join('.');
                this.opcode('pushId', 'BlockParam', blockParamIndex, blockParamChild);
              } else {
                value = val.original || value;
                if (value.replace) {
                  value = value.replace(/^\.\//g, '').replace(/^\.$/g, '');
                }

                this.opcode('pushId', val.type, value);
              }
            }
            this.accept(val);
          }
        },

        setupFullMustacheParams: function setupFullMustacheParams(sexpr, program, inverse, omitEmpty) {
          var params = sexpr.params;
          this.pushParams(params);

          this.opcode('pushProgram', program);
          this.opcode('pushProgram', inverse);

          if (sexpr.hash) {
            this.accept(sexpr.hash);
          } else {
            this.opcode('emptyHash', omitEmpty);
          }

          return params;
        },

        blockParamIndex: function blockParamIndex(name) {
          for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {
            var blockParams = this.options.blockParams[depth],
                param = blockParams && _isArray$indexOf.indexOf(blockParams, name);
            if (blockParams && param >= 0) {
              return [depth, param];
            }
          }
        }
      };

      function precompile(input, options, env) {
        if (input == null || typeof input !== 'string' && input.type !== 'Program') {
          throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.precompile. You passed ' + input);
        }

        options = options || {};
        if (!('data' in options)) {
          options.data = true;
        }
        if (options.compat) {
          options.useDepths = true;
        }

        var ast = env.parse(input, options),
            environment = new env.Compiler().compile(ast, options);
        return new env.JavaScriptCompiler().compile(environment, options);
      }

      function compile(input, _x, env) {
        var options = arguments[1] === undefined ? {} : arguments[1];

        if (input == null || typeof input !== 'string' && input.type !== 'Program') {
          throw new _Exception2['default']('You must pass a string or Handlebars AST to Handlebars.compile. You passed ' + input);
        }

        if (!('data' in options)) {
          options.data = true;
        }
        if (options.compat) {
          options.useDepths = true;
        }

        var compiled = undefined;

        function compileInput() {
          var ast = env.parse(input, options),
              environment = new env.Compiler().compile(ast, options),
              templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
          return env.template(templateSpec);
        }

        // Template is only compiled on first use and cached after that point.
        function ret(context, execOptions) {
          if (!compiled) {
            compiled = compileInput();
          }
          return compiled.call(this, context, execOptions);
        }
        ret._setup = function (setupOptions) {
          if (!compiled) {
            compiled = compileInput();
          }
          return compiled._setup(setupOptions);
        };
        ret._child = function (i, data, blockParams, depths) {
          if (!compiled) {
            compiled = compileInput();
          }
          return compiled._child(i, data, blockParams, depths);
        };
        return ret;
      }

      function argEquals(a, b) {
        if (a === b) {
          return true;
        }

        if (_isArray$indexOf.isArray(a) && _isArray$indexOf.isArray(b) && a.length === b.length) {
          for (var i = 0; i < a.length; i++) {
            if (!argEquals(a[i], b[i])) {
              return false;
            }
          }
          return true;
        }
      }

      function transformLiteralToPath(sexpr) {
        if (!sexpr.path.parts) {
          var literal = sexpr.path;
          // Casting to string here to make false and 0 literal values play nicely with the rest
          // of the system.
          sexpr.path = new _AST2['default'].PathExpression(false, 0, [literal.original + ''], literal.original + '', literal.loc);
        }
      }

      /***/ },
    /* 5 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireDefault = __webpack_require__(8)['default'];

      exports.__esModule = true;

      var _COMPILER_REVISION$REVISION_CHANGES = __webpack_require__(10);

      var _Exception = __webpack_require__(12);

      var _Exception2 = _interopRequireDefault(_Exception);

      var _isArray = __webpack_require__(13);

      var _CodeGen = __webpack_require__(18);

      var _CodeGen2 = _interopRequireDefault(_CodeGen);

      function Literal(value) {
        this.value = value;
      }

      function JavaScriptCompiler() {}

      JavaScriptCompiler.prototype = {
        // PUBLIC API: You can override these methods in a subclass to provide
        // alternative compiled forms for name lookup and buffering semantics
        nameLookup: function nameLookup(parent, name /* , type*/) {
          if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
            return [parent, '.', name];
          } else {
            return [parent, '[\'', name, '\']'];
          }
        },
        depthedLookup: function depthedLookup(name) {
          return [this.aliasable('this.lookup'), '(depths, "', name, '")'];
        },

        compilerInfo: function compilerInfo() {
          var revision = _COMPILER_REVISION$REVISION_CHANGES.COMPILER_REVISION,
              versions = _COMPILER_REVISION$REVISION_CHANGES.REVISION_CHANGES[revision];
          return [revision, versions];
        },

        appendToBuffer: function appendToBuffer(source, location, explicit) {
          // Force a source as this simplifies the merge logic.
          if (!_isArray.isArray(source)) {
            source = [source];
          }
          source = this.source.wrap(source, location);

          if (this.environment.isSimple) {
            return ['return ', source, ';'];
          } else if (explicit) {
            // This is a case where the buffer operation occurs as a child of another
            // construct, generally braces. We have to explicitly output these buffer
            // operations to ensure that the emitted code goes in the correct location.
            return ['buffer += ', source, ';'];
          } else {
            source.appendToBuffer = true;
            return source;
          }
        },

        initializeBuffer: function initializeBuffer() {
          return this.quotedString('');
        },
        // END PUBLIC API

        compile: function compile(environment, options, context, asObject) {
          this.environment = environment;
          this.options = options;
          this.stringParams = this.options.stringParams;
          this.trackIds = this.options.trackIds;
          this.precompile = !asObject;

          this.name = this.environment.name;
          this.isChild = !!context;
          this.context = context || {
                programs: [],
                environments: []
              };

          this.preamble();

          this.stackSlot = 0;
          this.stackVars = [];
          this.aliases = {};
          this.registers = { list: [] };
          this.hashes = [];
          this.compileStack = [];
          this.inlineStack = [];
          this.blockParams = [];

          this.compileChildren(environment, options);

          this.useDepths = this.useDepths || environment.useDepths || this.options.compat;
          this.useBlockParams = this.useBlockParams || environment.useBlockParams;

          var opcodes = environment.opcodes,
              opcode = undefined,
              firstLoc = undefined,
              i = undefined,
              l = undefined;

          for (i = 0, l = opcodes.length; i < l; i++) {
            opcode = opcodes[i];

            this.source.currentLocation = opcode.loc;
            firstLoc = firstLoc || opcode.loc;
            this[opcode.opcode].apply(this, opcode.args);
          }

          // Flush any trailing content that might be pending.
          this.source.currentLocation = firstLoc;
          this.pushSource('');

          /* istanbul ignore next */
          if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
            throw new _Exception2['default']('Compile completed with content left on stack');
          }

          var fn = this.createFunctionContext(asObject);
          if (!this.isChild) {
            var ret = {
              compiler: this.compilerInfo(),
              main: fn
            };
            var programs = this.context.programs;
            for (i = 0, l = programs.length; i < l; i++) {
              if (programs[i]) {
                ret[i] = programs[i];
              }
            }

            if (this.environment.usePartial) {
              ret.usePartial = true;
            }
            if (this.options.data) {
              ret.useData = true;
            }
            if (this.useDepths) {
              ret.useDepths = true;
            }
            if (this.useBlockParams) {
              ret.useBlockParams = true;
            }
            if (this.options.compat) {
              ret.compat = true;
            }

            if (!asObject) {
              ret.compiler = JSON.stringify(ret.compiler);

              this.source.currentLocation = { start: { line: 1, column: 0 } };
              ret = this.objectLiteral(ret);

              if (options.srcName) {
                ret = ret.toStringWithSourceMap({ file: options.destName });
                ret.map = ret.map && ret.map.toString();
              } else {
                ret = ret.toString();
              }
            } else {
              ret.compilerOptions = this.options;
            }

            return ret;
          } else {
            return fn;
          }
        },

        preamble: function preamble() {
          // track the last context pushed into place to allow skipping the
          // getContext opcode when it would be a noop
          this.lastContext = 0;
          this.source = new _CodeGen2['default'](this.options.srcName);
        },

        createFunctionContext: function createFunctionContext(asObject) {
          var varDeclarations = '';

          var locals = this.stackVars.concat(this.registers.list);
          if (locals.length > 0) {
            varDeclarations += ', ' + locals.join(', ');
          }

          // Generate minimizer alias mappings
          //
          // When using true SourceNodes, this will update all references to the given alias
          // as the source nodes are reused in situ. For the non-source node compilation mode,
          // aliases will not be used, but this case is already being run on the client and
          // we aren't concern about minimizing the template size.
          var aliasCount = 0;
          for (var alias in this.aliases) {
            // eslint-disable-line guard-for-in
            var node = this.aliases[alias];

            if (this.aliases.hasOwnProperty(alias) && node.children && node.referenceCount > 1) {
              varDeclarations += ', alias' + ++aliasCount + '=' + alias;
              node.children[0] = 'alias' + aliasCount;
            }
          }

          var params = ['depth0', 'helpers', 'partials', 'data'];

          if (this.useBlockParams || this.useDepths) {
            params.push('blockParams');
          }
          if (this.useDepths) {
            params.push('depths');
          }

          // Perform a second pass over the output to merge content when possible
          var source = this.mergeSource(varDeclarations);

          if (asObject) {
            params.push(source);

            return Function.apply(this, params);
          } else {
            return this.source.wrap(['function(', params.join(','), ') {\n  ', source, '}']);
          }
        },
        mergeSource: function mergeSource(varDeclarations) {
          var isSimple = this.environment.isSimple,
              appendOnly = !this.forceBuffer,
              appendFirst = undefined,
              sourceSeen = undefined,
              bufferStart = undefined,
              bufferEnd = undefined;
          this.source.each(function (line) {
            if (line.appendToBuffer) {
              if (bufferStart) {
                line.prepend('  + ');
              } else {
                bufferStart = line;
              }
              bufferEnd = line;
            } else {
              if (bufferStart) {
                if (!sourceSeen) {
                  appendFirst = true;
                } else {
                  bufferStart.prepend('buffer += ');
                }
                bufferEnd.add(';');
                bufferStart = bufferEnd = undefined;
              }

              sourceSeen = true;
              if (!isSimple) {
                appendOnly = false;
              }
            }
          });

          if (appendOnly) {
            if (bufferStart) {
              bufferStart.prepend('return ');
              bufferEnd.add(';');
            } else if (!sourceSeen) {
              this.source.push('return "";');
            }
          } else {
            varDeclarations += ', buffer = ' + (appendFirst ? '' : this.initializeBuffer());

            if (bufferStart) {
              bufferStart.prepend('return buffer + ');
              bufferEnd.add(';');
            } else {
              this.source.push('return buffer;');
            }
          }

          if (varDeclarations) {
            this.source.prepend('var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n'));
          }

          return this.source.merge();
        },

        // [blockValue]
        //
        // On stack, before: hash, inverse, program, value
        // On stack, after: return value of blockHelperMissing
        //
        // The purpose of this opcode is to take a block of the form
        // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
        // replace it on the stack with the result of properly
        // invoking blockHelperMissing.
        blockValue: function blockValue(name) {
          var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
              params = [this.contextName(0)];
          this.setupHelperArgs(name, 0, params);

          var blockName = this.popStack();
          params.splice(1, 0, blockName);

          this.push(this.source.functionCall(blockHelperMissing, 'call', params));
        },

        // [ambiguousBlockValue]
        //
        // On stack, before: hash, inverse, program, value
        // Compiler value, before: lastHelper=value of last found helper, if any
        // On stack, after, if no lastHelper: same as [blockValue]
        // On stack, after, if lastHelper: value
        ambiguousBlockValue: function ambiguousBlockValue() {
          // We're being a bit cheeky and reusing the options value from the prior exec
          var blockHelperMissing = this.aliasable('helpers.blockHelperMissing'),
              params = [this.contextName(0)];
          this.setupHelperArgs('', 0, params, true);

          this.flushInline();

          var current = this.topStack();
          params.splice(1, 0, current);

          this.pushSource(['if (!', this.lastHelper, ') { ', current, ' = ', this.source.functionCall(blockHelperMissing, 'call', params), '}']);
        },

        // [appendContent]
        //
        // On stack, before: ...
        // On stack, after: ...
        //
        // Appends the string value of `content` to the current buffer
        appendContent: function appendContent(content) {
          if (this.pendingContent) {
            content = this.pendingContent + content;
          } else {
            this.pendingLocation = this.source.currentLocation;
          }

          this.pendingContent = content;
        },

        // [append]
        //
        // On stack, before: value, ...
        // On stack, after: ...
        //
        // Coerces `value` to a String and appends it to the current buffer.
        //
        // If `value` is truthy, or 0, it is coerced into a string and appended
        // Otherwise, the empty string is appended
        append: function append() {
          if (this.isInline()) {
            this.replaceStack(function (current) {
              return [' != null ? ', current, ' : ""'];
            });

            this.pushSource(this.appendToBuffer(this.popStack()));
          } else {
            var local = this.popStack();
            this.pushSource(['if (', local, ' != null) { ', this.appendToBuffer(local, undefined, true), ' }']);
            if (this.environment.isSimple) {
              this.pushSource(['else { ', this.appendToBuffer('\'\'', undefined, true), ' }']);
            }
          }
        },

        // [appendEscaped]
        //
        // On stack, before: value, ...
        // On stack, after: ...
        //
        // Escape `value` and append it to the buffer
        appendEscaped: function appendEscaped() {
          this.pushSource(this.appendToBuffer([this.aliasable('this.escapeExpression'), '(', this.popStack(), ')']));
        },

        // [getContext]
        //
        // On stack, before: ...
        // On stack, after: ...
        // Compiler value, after: lastContext=depth
        //
        // Set the value of the `lastContext` compiler value to the depth
        getContext: function getContext(depth) {
          this.lastContext = depth;
        },

        // [pushContext]
        //
        // On stack, before: ...
        // On stack, after: currentContext, ...
        //
        // Pushes the value of the current context onto the stack.
        pushContext: function pushContext() {
          this.pushStackLiteral(this.contextName(this.lastContext));
        },

        // [lookupOnContext]
        //
        // On stack, before: ...
        // On stack, after: currentContext[name], ...
        //
        // Looks up the value of `name` on the current context and pushes
        // it onto the stack.
        lookupOnContext: function lookupOnContext(parts, falsy, scoped) {
          var i = 0;

          if (!scoped && this.options.compat && !this.lastContext) {
            // The depthed query is expected to handle the undefined logic for the root level that
            // is implemented below, so we evaluate that directly in compat mode
            this.push(this.depthedLookup(parts[i++]));
          } else {
            this.pushContext();
          }

          this.resolvePath('context', parts, i, falsy);
        },

        // [lookupBlockParam]
        //
        // On stack, before: ...
        // On stack, after: blockParam[name], ...
        //
        // Looks up the value of `parts` on the given block param and pushes
        // it onto the stack.
        lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
          this.useBlockParams = true;

          this.push(['blockParams[', blockParamId[0], '][', blockParamId[1], ']']);
          this.resolvePath('context', parts, 1);
        },

        // [lookupData]
        //
        // On stack, before: ...
        // On stack, after: data, ...
        //
        // Push the data lookup operator
        lookupData: function lookupData(depth, parts) {
          if (!depth) {
            this.pushStackLiteral('data');
          } else {
            this.pushStackLiteral('this.data(data, ' + depth + ')');
          }

          this.resolvePath('data', parts, 0, true);
        },

        resolvePath: function resolvePath(type, parts, i, falsy) {
          var _this = this;

          if (this.options.strict || this.options.assumeObjects) {
            this.push(strictLookup(this.options.strict, this, parts, type));
            return;
          }

          var len = parts.length;
          for (; i < len; i++) {
            /*eslint-disable no-loop-func */
            this.replaceStack(function (current) {
              var lookup = _this.nameLookup(current, parts[i], type);
              // We want to ensure that zero and false are handled properly if the context (falsy flag)
              // needs to have the special handling for these values.
              if (!falsy) {
                return [' != null ? ', lookup, ' : ', current];
              } else {
                // Otherwise we can use generic falsy handling
                return [' && ', lookup];
              }
            });
            /*eslint-enable no-loop-func */
          }
        },

        // [resolvePossibleLambda]
        //
        // On stack, before: value, ...
        // On stack, after: resolved value, ...
        //
        // If the `value` is a lambda, replace it on the stack by
        // the return value of the lambda
        resolvePossibleLambda: function resolvePossibleLambda() {
          this.push([this.aliasable('this.lambda'), '(', this.popStack(), ', ', this.contextName(0), ')']);
        },

        // [pushStringParam]
        //
        // On stack, before: ...
        // On stack, after: string, currentContext, ...
        //
        // This opcode is designed for use in string mode, which
        // provides the string value of a parameter along with its
        // depth rather than resolving it immediately.
        pushStringParam: function pushStringParam(string, type) {
          this.pushContext();
          this.pushString(type);

          // If it's a subexpression, the string result
          // will be pushed after this opcode.
          if (type !== 'SubExpression') {
            if (typeof string === 'string') {
              this.pushString(string);
            } else {
              this.pushStackLiteral(string);
            }
          }
        },

        emptyHash: function emptyHash(omitEmpty) {
          if (this.trackIds) {
            this.push('{}'); // hashIds
          }
          if (this.stringParams) {
            this.push('{}'); // hashContexts
            this.push('{}'); // hashTypes
          }
          this.pushStackLiteral(omitEmpty ? 'undefined' : '{}');
        },
        pushHash: function pushHash() {
          if (this.hash) {
            this.hashes.push(this.hash);
          }
          this.hash = { values: [], types: [], contexts: [], ids: [] };
        },
        popHash: function popHash() {
          var hash = this.hash;
          this.hash = this.hashes.pop();

          if (this.trackIds) {
            this.push(this.objectLiteral(hash.ids));
          }
          if (this.stringParams) {
            this.push(this.objectLiteral(hash.contexts));
            this.push(this.objectLiteral(hash.types));
          }

          this.push(this.objectLiteral(hash.values));
        },

        // [pushString]
        //
        // On stack, before: ...
        // On stack, after: quotedString(string), ...
        //
        // Push a quoted version of `string` onto the stack
        pushString: function pushString(string) {
          this.pushStackLiteral(this.quotedString(string));
        },

        // [pushLiteral]
        //
        // On stack, before: ...
        // On stack, after: value, ...
        //
        // Pushes a value onto the stack. This operation prevents
        // the compiler from creating a temporary variable to hold
        // it.
        pushLiteral: function pushLiteral(value) {
          this.pushStackLiteral(value);
        },

        // [pushProgram]
        //
        // On stack, before: ...
        // On stack, after: program(guid), ...
        //
        // Push a program expression onto the stack. This takes
        // a compile-time guid and converts it into a runtime-accessible
        // expression.
        pushProgram: function pushProgram(guid) {
          if (guid != null) {
            this.pushStackLiteral(this.programExpression(guid));
          } else {
            this.pushStackLiteral(null);
          }
        },

        // [invokeHelper]
        //
        // On stack, before: hash, inverse, program, params..., ...
        // On stack, after: result of helper invocation
        //
        // Pops off the helper's parameters, invokes the helper,
        // and pushes the helper's return value onto the stack.
        //
        // If the helper is not found, `helperMissing` is called.
        invokeHelper: function invokeHelper(paramSize, name, isSimple) {
          var nonHelper = this.popStack(),
              helper = this.setupHelper(paramSize, name),
              simple = isSimple ? [helper.name, ' || '] : '';

          var lookup = ['('].concat(simple, nonHelper);
          if (!this.options.strict) {
            lookup.push(' || ', this.aliasable('helpers.helperMissing'));
          }
          lookup.push(')');

          this.push(this.source.functionCall(lookup, 'call', helper.callParams));
        },

        // [invokeKnownHelper]
        //
        // On stack, before: hash, inverse, program, params..., ...
        // On stack, after: result of helper invocation
        //
        // This operation is used when the helper is known to exist,
        // so a `helperMissing` fallback is not required.
        invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
          var helper = this.setupHelper(paramSize, name);
          this.push(this.source.functionCall(helper.name, 'call', helper.callParams));
        },

        // [invokeAmbiguous]
        //
        // On stack, before: hash, inverse, program, params..., ...
        // On stack, after: result of disambiguation
        //
        // This operation is used when an expression like `{{foo}}`
        // is provided, but we don't know at compile-time whether it
        // is a helper or a path.
        //
        // This operation emits more code than the other options,
        // and can be avoided by passing the `knownHelpers` and
        // `knownHelpersOnly` flags at compile-time.
        invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
          this.useRegister('helper');

          var nonHelper = this.popStack();

          this.emptyHash();
          var helper = this.setupHelper(0, name, helperCall);

          var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

          var lookup = ['(', '(helper = ', helperName, ' || ', nonHelper, ')'];
          if (!this.options.strict) {
            lookup[0] = '(helper = ';
            lookup.push(' != null ? helper : ', this.aliasable('helpers.helperMissing'));
          }

          this.push(['(', lookup, helper.paramsInit ? ['),(', helper.paramsInit] : [], '),', '(typeof helper === ', this.aliasable('"function"'), ' ? ', this.source.functionCall('helper', 'call', helper.callParams), ' : helper))']);
        },

        // [invokePartial]
        //
        // On stack, before: context, ...
        // On stack after: result of partial invocation
        //
        // This operation pops off a context, invokes a partial with that context,
        // and pushes the result of the invocation back.
        invokePartial: function invokePartial(isDynamic, name, indent) {
          var params = [],
              options = this.setupParams(name, 1, params, false);

          if (isDynamic) {
            name = this.popStack();
            delete options.name;
          }

          if (indent) {
            options.indent = JSON.stringify(indent);
          }
          options.helpers = 'helpers';
          options.partials = 'partials';

          if (!isDynamic) {
            params.unshift(this.nameLookup('partials', name, 'partial'));
          } else {
            params.unshift(name);
          }

          if (this.options.compat) {
            options.depths = 'depths';
          }
          options = this.objectLiteral(options);
          params.push(options);

          this.push(this.source.functionCall('this.invokePartial', '', params));
        },

        // [assignToHash]
        //
        // On stack, before: value, ..., hash, ...
        // On stack, after: ..., hash, ...
        //
        // Pops a value off the stack and assigns it to the current hash
        assignToHash: function assignToHash(key) {
          var value = this.popStack(),
              context = undefined,
              type = undefined,
              id = undefined;

          if (this.trackIds) {
            id = this.popStack();
          }
          if (this.stringParams) {
            type = this.popStack();
            context = this.popStack();
          }

          var hash = this.hash;
          if (context) {
            hash.contexts[key] = context;
          }
          if (type) {
            hash.types[key] = type;
          }
          if (id) {
            hash.ids[key] = id;
          }
          hash.values[key] = value;
        },

        pushId: function pushId(type, name, child) {
          if (type === 'BlockParam') {
            this.pushStackLiteral('blockParams[' + name[0] + '].path[' + name[1] + ']' + (child ? ' + ' + JSON.stringify('.' + child) : ''));
          } else if (type === 'PathExpression') {
            this.pushString(name);
          } else if (type === 'SubExpression') {
            this.pushStackLiteral('true');
          } else {
            this.pushStackLiteral('null');
          }
        },

        // HELPERS

        compiler: JavaScriptCompiler,

        compileChildren: function compileChildren(environment, options) {
          var children = environment.children,
              child = undefined,
              compiler = undefined;

          for (var i = 0, l = children.length; i < l; i++) {
            child = children[i];
            compiler = new this.compiler(); // eslint-disable-line new-cap

            var index = this.matchExistingProgram(child);

            if (index == null) {
              this.context.programs.push(''); // Placeholder to prevent name conflicts for nested children
              index = this.context.programs.length;
              child.index = index;
              child.name = 'program' + index;
              this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
              this.context.environments[index] = child;

              this.useDepths = this.useDepths || compiler.useDepths;
              this.useBlockParams = this.useBlockParams || compiler.useBlockParams;
            } else {
              child.index = index;
              child.name = 'program' + index;

              this.useDepths = this.useDepths || child.useDepths;
              this.useBlockParams = this.useBlockParams || child.useBlockParams;
            }
          }
        },
        matchExistingProgram: function matchExistingProgram(child) {
          for (var i = 0, len = this.context.environments.length; i < len; i++) {
            var environment = this.context.environments[i];
            if (environment && environment.equals(child)) {
              return i;
            }
          }
        },

        programExpression: function programExpression(guid) {
          var child = this.environment.children[guid],
              programParams = [child.index, 'data', child.blockParams];

          if (this.useBlockParams || this.useDepths) {
            programParams.push('blockParams');
          }
          if (this.useDepths) {
            programParams.push('depths');
          }

          return 'this.program(' + programParams.join(', ') + ')';
        },

        useRegister: function useRegister(name) {
          if (!this.registers[name]) {
            this.registers[name] = true;
            this.registers.list.push(name);
          }
        },

        push: function push(expr) {
          if (!(expr instanceof Literal)) {
            expr = this.source.wrap(expr);
          }

          this.inlineStack.push(expr);
          return expr;
        },

        pushStackLiteral: function pushStackLiteral(item) {
          this.push(new Literal(item));
        },

        pushSource: function pushSource(source) {
          if (this.pendingContent) {
            this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
            this.pendingContent = undefined;
          }

          if (source) {
            this.source.push(source);
          }
        },

        replaceStack: function replaceStack(callback) {
          var prefix = ['('],
              stack = undefined,
              createdStack = undefined,
              usedLiteral = undefined;

          /* istanbul ignore next */
          if (!this.isInline()) {
            throw new _Exception2['default']('replaceStack on non-inline');
          }

          // We want to merge the inline statement into the replacement statement via ','
          var top = this.popStack(true);

          if (top instanceof Literal) {
            // Literals do not need to be inlined
            stack = [top.value];
            prefix = ['(', stack];
            usedLiteral = true;
          } else {
            // Get or create the current stack name for use by the inline
            createdStack = true;
            var _name = this.incrStack();

            prefix = ['((', this.push(_name), ' = ', top, ')'];
            stack = this.topStack();
          }

          var item = callback.call(this, stack);

          if (!usedLiteral) {
            this.popStack();
          }
          if (createdStack) {
            this.stackSlot--;
          }
          this.push(prefix.concat(item, ')'));
        },

        incrStack: function incrStack() {
          this.stackSlot++;
          if (this.stackSlot > this.stackVars.length) {
            this.stackVars.push('stack' + this.stackSlot);
          }
          return this.topStackName();
        },
        topStackName: function topStackName() {
          return 'stack' + this.stackSlot;
        },
        flushInline: function flushInline() {
          var inlineStack = this.inlineStack;
          this.inlineStack = [];
          for (var i = 0, len = inlineStack.length; i < len; i++) {
            var entry = inlineStack[i];
            /* istanbul ignore if */
            if (entry instanceof Literal) {
              this.compileStack.push(entry);
            } else {
              var stack = this.incrStack();
              this.pushSource([stack, ' = ', entry, ';']);
              this.compileStack.push(stack);
            }
          }
        },
        isInline: function isInline() {
          return this.inlineStack.length;
        },

        popStack: function popStack(wrapped) {
          var inline = this.isInline(),
              item = (inline ? this.inlineStack : this.compileStack).pop();

          if (!wrapped && item instanceof Literal) {
            return item.value;
          } else {
            if (!inline) {
              /* istanbul ignore next */
              if (!this.stackSlot) {
                throw new _Exception2['default']('Invalid stack pop');
              }
              this.stackSlot--;
            }
            return item;
          }
        },

        topStack: function topStack() {
          var stack = this.isInline() ? this.inlineStack : this.compileStack,
              item = stack[stack.length - 1];

          /* istanbul ignore if */
          if (item instanceof Literal) {
            return item.value;
          } else {
            return item;
          }
        },

        contextName: function contextName(context) {
          if (this.useDepths && context) {
            return 'depths[' + context + ']';
          } else {
            return 'depth' + context;
          }
        },

        quotedString: function quotedString(str) {
          return this.source.quotedString(str);
        },

        objectLiteral: function objectLiteral(obj) {
          return this.source.objectLiteral(obj);
        },

        aliasable: function aliasable(name) {
          var ret = this.aliases[name];
          if (ret) {
            ret.referenceCount++;
            return ret;
          }

          ret = this.aliases[name] = this.source.wrap(name);
          ret.aliasable = true;
          ret.referenceCount = 1;

          return ret;
        },

        setupHelper: function setupHelper(paramSize, name, blockHelper) {
          var params = [],
              paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
          var foundHelper = this.nameLookup('helpers', name, 'helper');

          return {
            params: params,
            paramsInit: paramsInit,
            name: foundHelper,
            callParams: [this.contextName(0)].concat(params)
          };
        },

        setupParams: function setupParams(helper, paramSize, params) {
          var options = {},
              contexts = [],
              types = [],
              ids = [],
              param = undefined;

          options.name = this.quotedString(helper);
          options.hash = this.popStack();

          if (this.trackIds) {
            options.hashIds = this.popStack();
          }
          if (this.stringParams) {
            options.hashTypes = this.popStack();
            options.hashContexts = this.popStack();
          }

          var inverse = this.popStack(),
              program = this.popStack();

          // Avoid setting fn and inverse if neither are set. This allows
          // helpers to do a check for `if (options.fn)`
          if (program || inverse) {
            options.fn = program || 'this.noop';
            options.inverse = inverse || 'this.noop';
          }

          // The parameters go on to the stack in order (making sure that they are evaluated in order)
          // so we need to pop them off the stack in reverse order
          var i = paramSize;
          while (i--) {
            param = this.popStack();
            params[i] = param;

            if (this.trackIds) {
              ids[i] = this.popStack();
            }
            if (this.stringParams) {
              types[i] = this.popStack();
              contexts[i] = this.popStack();
            }
          }

          if (this.trackIds) {
            options.ids = this.source.generateArray(ids);
          }
          if (this.stringParams) {
            options.types = this.source.generateArray(types);
            options.contexts = this.source.generateArray(contexts);
          }

          if (this.options.data) {
            options.data = 'data';
          }
          if (this.useBlockParams) {
            options.blockParams = 'blockParams';
          }
          return options;
        },

        setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
          var options = this.setupParams(helper, paramSize, params, true);
          options = this.objectLiteral(options);
          if (useRegister) {
            this.useRegister('options');
            params.push('options');
            return ['options=', options];
          } else {
            params.push(options);
            return '';
          }
        }
      };

      (function () {
        var reservedWords = ('break else new var' + ' case finally return void' + ' catch for switch while' + ' continue function this with' + ' default if throw' + ' delete in try' + ' do instanceof typeof' + ' abstract enum int short' + ' boolean export interface static' + ' byte extends long super' + ' char final native synchronized' + ' class float package throws' + ' const goto private transient' + ' debugger implements protected volatile' + ' double import public let yield await' + ' null true false').split(' ');

        var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

        for (var i = 0, l = reservedWords.length; i < l; i++) {
          compilerWords[reservedWords[i]] = true;
        }
      })();

      JavaScriptCompiler.isValidJavaScriptVariableName = function (name) {
        return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
      };

      function strictLookup(requireTerminal, compiler, parts, type) {
        var stack = compiler.popStack(),
            i = 0,
            len = parts.length;
        if (requireTerminal) {
          len--;
        }

        for (; i < len; i++) {
          stack = compiler.nameLookup(stack, parts[i], type);
        }

        if (requireTerminal) {
          return [compiler.aliasable('this.strict'), '(', stack, ', ', compiler.quotedString(parts[i]), ')'];
        } else {
          return stack;
        }
      }

      exports['default'] = JavaScriptCompiler;
      module.exports = exports['default'];

      /***/ },
    /* 6 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireDefault = __webpack_require__(8)['default'];

      exports.__esModule = true;

      var _Exception = __webpack_require__(12);

      var _Exception2 = _interopRequireDefault(_Exception);

      var _AST = __webpack_require__(2);

      var _AST2 = _interopRequireDefault(_AST);

      function Visitor() {
        this.parents = [];
      }

      Visitor.prototype = {
        constructor: Visitor,
        mutating: false,

        // Visits a given value. If mutating, will replace the value if necessary.
        acceptKey: function acceptKey(node, name) {
          var value = this.accept(node[name]);
          if (this.mutating) {
            // Hacky sanity check:
            if (value && (!value.type || !_AST2['default'][value.type])) {
              throw new _Exception2['default']('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
            }
            node[name] = value;
          }
        },

        // Performs an accept operation with added sanity check to ensure
        // required keys are not removed.
        acceptRequired: function acceptRequired(node, name) {
          this.acceptKey(node, name);

          if (!node[name]) {
            throw new _Exception2['default'](node.type + ' requires ' + name);
          }
        },

        // Traverses a given array. If mutating, empty respnses will be removed
        // for child elements.
        acceptArray: function acceptArray(array) {
          for (var i = 0, l = array.length; i < l; i++) {
            this.acceptKey(array, i);

            if (!array[i]) {
              array.splice(i, 1);
              i--;
              l--;
            }
          }
        },

        accept: function accept(object) {
          if (!object) {
            return;
          }

          if (this.current) {
            this.parents.unshift(this.current);
          }
          this.current = object;

          var ret = this[object.type](object);

          this.current = this.parents.shift();

          if (!this.mutating || ret) {
            return ret;
          } else if (ret !== false) {
            return object;
          }
        },

        Program: function Program(program) {
          this.acceptArray(program.body);
        },

        MustacheStatement: function MustacheStatement(mustache) {
          this.acceptRequired(mustache, 'path');
          this.acceptArray(mustache.params);
          this.acceptKey(mustache, 'hash');
        },

        BlockStatement: function BlockStatement(block) {
          this.acceptRequired(block, 'path');
          this.acceptArray(block.params);
          this.acceptKey(block, 'hash');

          this.acceptKey(block, 'program');
          this.acceptKey(block, 'inverse');
        },

        PartialStatement: function PartialStatement(partial) {
          this.acceptRequired(partial, 'name');
          this.acceptArray(partial.params);
          this.acceptKey(partial, 'hash');
        },

        ContentStatement: function ContentStatement() {},
        CommentStatement: function CommentStatement() {},

        SubExpression: function SubExpression(sexpr) {
          this.acceptRequired(sexpr, 'path');
          this.acceptArray(sexpr.params);
          this.acceptKey(sexpr, 'hash');
        },

        PathExpression: function PathExpression() {},

        StringLiteral: function StringLiteral() {},
        NumberLiteral: function NumberLiteral() {},
        BooleanLiteral: function BooleanLiteral() {},
        UndefinedLiteral: function UndefinedLiteral() {},
        NullLiteral: function NullLiteral() {},

        Hash: function Hash(hash) {
          this.acceptArray(hash.pairs);
        },
        HashPair: function HashPair(pair) {
          this.acceptRequired(pair, 'value');
        }
      };

      exports['default'] = Visitor;
      module.exports = exports['default'];
      /* content */ /* comment */ /* path */ /* string */ /* number */ /* bool */ /* literal */ /* literal */

      /***/ },
    /* 7 */
    /***/ function(module, exports, __webpack_require__) {

      /* WEBPACK VAR INJECTION */(function(global) {'use strict';

        exports.__esModule = true;
        /*global window */

        exports['default'] = function (Handlebars) {
          /* istanbul ignore next */
          var root = typeof global !== 'undefined' ? global : window,
              $Handlebars = root.Handlebars;
          /* istanbul ignore next */
          Handlebars.noConflict = function () {
            if (root.Handlebars === Handlebars) {
              root.Handlebars = $Handlebars;
            }
          };
        };

        module.exports = exports['default'];
        /* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

      /***/ },
    /* 8 */
    /***/ function(module, exports, __webpack_require__) {

      "use strict";

      exports["default"] = function (obj) {
        return obj && obj.__esModule ? obj : {
          "default": obj
        };
      };

      exports.__esModule = true;

      /***/ },
    /* 9 */
    /***/ function(module, exports, __webpack_require__) {

      "use strict";

      exports["default"] = function (obj) {
        if (obj && obj.__esModule) {
          return obj;
        } else {
          var newObj = {};

          if (typeof obj === "object" && obj !== null) {
            for (var key in obj) {
              if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
            }
          }

          newObj["default"] = obj;
          return newObj;
        }
      };

      exports.__esModule = true;

      /***/ },
    /* 10 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireWildcard = __webpack_require__(9)['default'];

      var _interopRequireDefault = __webpack_require__(8)['default'];

      exports.__esModule = true;
      exports.HandlebarsEnvironment = HandlebarsEnvironment;
      exports.createFrame = createFrame;

      var _import = __webpack_require__(13);

      var Utils = _interopRequireWildcard(_import);

      var _Exception = __webpack_require__(12);

      var _Exception2 = _interopRequireDefault(_Exception);

      var VERSION = '3.0.1';
      exports.VERSION = VERSION;
      var COMPILER_REVISION = 6;

      exports.COMPILER_REVISION = COMPILER_REVISION;
      var REVISION_CHANGES = {
        1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
        2: '== 1.0.0-rc.3',
        3: '== 1.0.0-rc.4',
        4: '== 1.x.x',
        5: '== 2.0.0-alpha.x',
        6: '>= 2.0.0-beta.1'
      };

      exports.REVISION_CHANGES = REVISION_CHANGES;
      var isArray = Utils.isArray,
          isFunction = Utils.isFunction,
          toString = Utils.toString,
          objectType = '[object Object]';

      function HandlebarsEnvironment(helpers, partials) {
        this.helpers = helpers || {};
        this.partials = partials || {};

        registerDefaultHelpers(this);
      }

      HandlebarsEnvironment.prototype = {
        constructor: HandlebarsEnvironment,

        logger: logger,
        log: log,

        registerHelper: function registerHelper(name, fn) {
          if (toString.call(name) === objectType) {
            if (fn) {
              throw new _Exception2['default']('Arg not supported with multiple helpers');
            }
            Utils.extend(this.helpers, name);
          } else {
            this.helpers[name] = fn;
          }
        },
        unregisterHelper: function unregisterHelper(name) {
          delete this.helpers[name];
        },

        registerPartial: function registerPartial(name, partial) {
          if (toString.call(name) === objectType) {
            Utils.extend(this.partials, name);
          } else {
            if (typeof partial === 'undefined') {
              throw new _Exception2['default']('Attempting to register a partial as undefined');
            }
            this.partials[name] = partial;
          }
        },
        unregisterPartial: function unregisterPartial(name) {
          delete this.partials[name];
        }
      };

      function registerDefaultHelpers(instance) {
        instance.registerHelper('helperMissing', function () {
          if (arguments.length === 1) {
            // A missing field in a {{foo}} constuct.
            return undefined;
          } else {
            // Someone is actually trying to call something, blow up.
            throw new _Exception2['default']('Missing helper: "' + arguments[arguments.length - 1].name + '"');
          }
        });

        instance.registerHelper('blockHelperMissing', function (context, options) {
          var inverse = options.inverse,
              fn = options.fn;

          if (context === true) {
            return fn(this);
          } else if (context === false || context == null) {
            return inverse(this);
          } else if (isArray(context)) {
            if (context.length > 0) {
              if (options.ids) {
                options.ids = [options.name];
              }

              return instance.helpers.each(context, options);
            } else {
              return inverse(this);
            }
          } else {
            if (options.data && options.ids) {
              var data = createFrame(options.data);
              data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
              options = { data: data };
            }

            return fn(context, options);
          }
        });

        instance.registerHelper('each', function (context, options) {
          if (!options) {
            throw new _Exception2['default']('Must pass iterator to #each');
          }

          var fn = options.fn,
              inverse = options.inverse,
              i = 0,
              ret = '',
              data = undefined,
              contextPath = undefined;

          if (options.data && options.ids) {
            contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
          }

          if (isFunction(context)) {
            context = context.call(this);
          }

          if (options.data) {
            data = createFrame(options.data);
          }

          function execIteration(field, index, last) {
            if (data) {
              data.key = field;
              data.index = index;
              data.first = index === 0;
              data.last = !!last;

              if (contextPath) {
                data.contextPath = contextPath + field;
              }
            }

            ret = ret + fn(context[field], {
                  data: data,
                  blockParams: Utils.blockParams([context[field], field], [contextPath + field, null])
                });
          }

          if (context && typeof context === 'object') {
            if (isArray(context)) {
              for (var j = context.length; i < j; i++) {
                execIteration(i, i, i === context.length - 1);
              }
            } else {
              var priorKey = undefined;

              for (var key in context) {
                if (context.hasOwnProperty(key)) {
                  // We're running the iterations one step out of sync so we can detect
                  // the last iteration without have to scan the object twice and create
                  // an itermediate keys array.
                  if (priorKey) {
                    execIteration(priorKey, i - 1);
                  }
                  priorKey = key;
                  i++;
                }
              }
              if (priorKey) {
                execIteration(priorKey, i - 1, true);
              }
            }
          }

          if (i === 0) {
            ret = inverse(this);
          }

          return ret;
        });

        instance.registerHelper('if', function (conditional, options) {
          if (isFunction(conditional)) {
            conditional = conditional.call(this);
          }

          // Default behavior is to render the positive path if the value is truthy and not empty.
          // The `includeZero` option may be set to treat the condtional as purely not empty based on the
          // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
          if (!options.hash.includeZero && !conditional || Utils.isEmpty(conditional)) {
            return options.inverse(this);
          } else {
            return options.fn(this);
          }
        });

        instance.registerHelper('unless', function (conditional, options) {
          return instance.helpers['if'].call(this, conditional, { fn: options.inverse, inverse: options.fn, hash: options.hash });
        });

        instance.registerHelper('with', function (context, options) {
          if (isFunction(context)) {
            context = context.call(this);
          }

          var fn = options.fn;

          if (!Utils.isEmpty(context)) {
            if (options.data && options.ids) {
              var data = createFrame(options.data);
              data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
              options = { data: data };
            }

            return fn(context, options);
          } else {
            return options.inverse(this);
          }
        });

        instance.registerHelper('log', function (message, options) {
          var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
          instance.log(level, message);
        });

        instance.registerHelper('lookup', function (obj, field) {
          return obj && obj[field];
        });
      }

      var logger = {
        methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

        // State enum
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        level: 1,

        // Can be overridden in the host environment
        log: function log(level, message) {
          if (typeof console !== 'undefined' && logger.level <= level) {
            var method = logger.methodMap[level];
            (console[method] || console.log).call(console, message); // eslint-disable-line no-console
          }
        }
      };

      exports.logger = logger;
      var log = logger.log;

      exports.log = log;

      function createFrame(object) {
        var frame = Utils.extend({}, object);
        frame._parent = object;
        return frame;
      }

      /* [args, ]options */

      /***/ },
    /* 11 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      exports.__esModule = true;
      // Build out our basic SafeString type
      function SafeString(string) {
        this.string = string;
      }

      SafeString.prototype.toString = SafeString.prototype.toHTML = function () {
        return '' + this.string;
      };

      exports['default'] = SafeString;
      module.exports = exports['default'];

      /***/ },
    /* 12 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      exports.__esModule = true;

      var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

      function Exception(message, node) {
        var loc = node && node.loc,
            line = undefined,
            column = undefined;
        if (loc) {
          line = loc.start.line;
          column = loc.start.column;

          message += ' - ' + line + ':' + column;
        }

        var tmp = Error.prototype.constructor.call(this, message);

        // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
        for (var idx = 0; idx < errorProps.length; idx++) {
          this[errorProps[idx]] = tmp[errorProps[idx]];
        }

        if (Error.captureStackTrace) {
          Error.captureStackTrace(this, Exception);
        }

        if (loc) {
          this.lineNumber = line;
          this.column = column;
        }
      }

      Exception.prototype = new Error();

      exports['default'] = Exception;
      module.exports = exports['default'];

      /***/ },
    /* 13 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      exports.__esModule = true;
      exports.extend = extend;

      // Older IE versions do not directly support indexOf so we must implement our own, sadly.
      exports.indexOf = indexOf;
      exports.escapeExpression = escapeExpression;
      exports.isEmpty = isEmpty;
      exports.blockParams = blockParams;
      exports.appendContextPath = appendContextPath;
      var escape = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        '\'': '&#x27;',
        '`': '&#x60;'
      };

      var badChars = /[&<>"'`]/g,
          possible = /[&<>"'`]/;

      function escapeChar(chr) {
        return escape[chr];
      }

      function extend(obj /* , ...source */) {
        for (var i = 1; i < arguments.length; i++) {
          for (var key in arguments[i]) {
            if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
              obj[key] = arguments[i][key];
            }
          }
        }

        return obj;
      }

      var toString = Object.prototype.toString;

      exports.toString = toString;
      // Sourced from lodash
      // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
      /*eslint-disable func-style, no-var */
      var isFunction = function isFunction(value) {
        return typeof value === 'function';
      };
      // fallback for older versions of Chrome and Safari
      /* istanbul ignore next */
      if (isFunction(/x/)) {
        exports.isFunction = isFunction = function (value) {
          return typeof value === 'function' && toString.call(value) === '[object Function]';
        };
      }
      var isFunction;
      exports.isFunction = isFunction;
      /*eslint-enable func-style, no-var */

      /* istanbul ignore next */
      var isArray = Array.isArray || function (value) {
            return value && typeof value === 'object' ? toString.call(value) === '[object Array]' : false;
          };exports.isArray = isArray;

      function indexOf(array, value) {
        for (var i = 0, len = array.length; i < len; i++) {
          if (array[i] === value) {
            return i;
          }
        }
        return -1;
      }

      function escapeExpression(string) {
        if (typeof string !== 'string') {
          // don't escape SafeStrings, since they're already safe
          if (string && string.toHTML) {
            return string.toHTML();
          } else if (string == null) {
            return '';
          } else if (!string) {
            return string + '';
          }

          // Force a string conversion as this will be done by the append regardless and
          // the regex test will do this transparently behind the scenes, causing issues if
          // an object's to string has escaped characters in it.
          string = '' + string;
        }

        if (!possible.test(string)) {
          return string;
        }
        return string.replace(badChars, escapeChar);
      }

      function isEmpty(value) {
        if (!value && value !== 0) {
          return true;
        } else if (isArray(value) && value.length === 0) {
          return true;
        } else {
          return false;
        }
      }

      function blockParams(params, ids) {
        params.path = ids;
        return params;
      }

      function appendContextPath(contextPath, id) {
        return (contextPath ? contextPath + '.' : '') + id;
      }

      /***/ },
    /* 14 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireWildcard = __webpack_require__(9)['default'];

      var _interopRequireDefault = __webpack_require__(8)['default'];

      exports.__esModule = true;
      exports.checkRevision = checkRevision;

      // TODO: Remove this line and break up compilePartial

      exports.template = template;
      exports.wrapProgram = wrapProgram;
      exports.resolvePartial = resolvePartial;
      exports.invokePartial = invokePartial;
      exports.noop = noop;

      var _import = __webpack_require__(13);

      var Utils = _interopRequireWildcard(_import);

      var _Exception = __webpack_require__(12);

      var _Exception2 = _interopRequireDefault(_Exception);

      var _COMPILER_REVISION$REVISION_CHANGES$createFrame = __webpack_require__(10);

      function checkRevision(compilerInfo) {
        var compilerRevision = compilerInfo && compilerInfo[0] || 1,
            currentRevision = _COMPILER_REVISION$REVISION_CHANGES$createFrame.COMPILER_REVISION;

        if (compilerRevision !== currentRevision) {
          if (compilerRevision < currentRevision) {
            var runtimeVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[currentRevision],
                compilerVersions = _COMPILER_REVISION$REVISION_CHANGES$createFrame.REVISION_CHANGES[compilerRevision];
            throw new _Exception2['default']('Template was precompiled with an older version of Handlebars than the current runtime. ' + 'Please update your precompiler to a newer version (' + runtimeVersions + ') or downgrade your runtime to an older version (' + compilerVersions + ').');
          } else {
            // Use the embedded version info since the runtime doesn't know about this revision yet
            throw new _Exception2['default']('Template was precompiled with a newer version of Handlebars than the current runtime. ' + 'Please update your runtime to a newer version (' + compilerInfo[1] + ').');
          }
        }
      }

      function template(templateSpec, env) {
        /* istanbul ignore next */
        if (!env) {
          throw new _Exception2['default']('No environment passed to template');
        }
        if (!templateSpec || !templateSpec.main) {
          throw new _Exception2['default']('Unknown template object: ' + typeof templateSpec);
        }

        // Note: Using env.VM references rather than local var references throughout this section to allow
        // for external users to override these as psuedo-supported APIs.
        env.VM.checkRevision(templateSpec.compiler);

        function invokePartialWrapper(partial, context, options) {
          if (options.hash) {
            context = Utils.extend({}, context, options.hash);
          }

          partial = env.VM.resolvePartial.call(this, partial, context, options);
          var result = env.VM.invokePartial.call(this, partial, context, options);

          if (result == null && env.compile) {
            options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
            result = options.partials[options.name](context, options);
          }
          if (result != null) {
            if (options.indent) {
              var lines = result.split('\n');
              for (var i = 0, l = lines.length; i < l; i++) {
                if (!lines[i] && i + 1 === l) {
                  break;
                }

                lines[i] = options.indent + lines[i];
              }
              result = lines.join('\n');
            }
            return result;
          } else {
            throw new _Exception2['default']('The partial ' + options.name + ' could not be compiled when running in runtime-only mode');
          }
        }

        // Just add water
        var container = {
          strict: function strict(obj, name) {
            if (!(name in obj)) {
              throw new _Exception2['default']('"' + name + '" not defined in ' + obj);
            }
            return obj[name];
          },
          lookup: function lookup(depths, name) {
            var len = depths.length;
            for (var i = 0; i < len; i++) {
              if (depths[i] && depths[i][name] != null) {
                return depths[i][name];
              }
            }
          },
          lambda: function lambda(current, context) {
            return typeof current === 'function' ? current.call(context) : current;
          },

          escapeExpression: Utils.escapeExpression,
          invokePartial: invokePartialWrapper,

          fn: function fn(i) {
            return templateSpec[i];
          },

          programs: [],
          program: function program(i, data, declaredBlockParams, blockParams, depths) {
            var programWrapper = this.programs[i],
                fn = this.fn(i);
            if (data || depths || blockParams || declaredBlockParams) {
              programWrapper = wrapProgram(this, i, fn, data, declaredBlockParams, blockParams, depths);
            } else if (!programWrapper) {
              programWrapper = this.programs[i] = wrapProgram(this, i, fn);
            }
            return programWrapper;
          },

          data: function data(value, depth) {
            while (value && depth--) {
              value = value._parent;
            }
            return value;
          },
          merge: function merge(param, common) {
            var obj = param || common;

            if (param && common && param !== common) {
              obj = Utils.extend({}, common, param);
            }

            return obj;
          },

          noop: env.VM.noop,
          compilerInfo: templateSpec.compiler
        };

        function ret(context) {
          var options = arguments[1] === undefined ? {} : arguments[1];

          var data = options.data;

          ret._setup(options);
          if (!options.partial && templateSpec.useData) {
            data = initData(context, data);
          }
          var depths = undefined,
              blockParams = templateSpec.useBlockParams ? [] : undefined;
          if (templateSpec.useDepths) {
            depths = options.depths ? [context].concat(options.depths) : [context];
          }

          return templateSpec.main.call(container, context, container.helpers, container.partials, data, blockParams, depths);
        }
        ret.isTop = true;

        ret._setup = function (options) {
          if (!options.partial) {
            container.helpers = container.merge(options.helpers, env.helpers);

            if (templateSpec.usePartial) {
              container.partials = container.merge(options.partials, env.partials);
            }
          } else {
            container.helpers = options.helpers;
            container.partials = options.partials;
          }
        };

        ret._child = function (i, data, blockParams, depths) {
          if (templateSpec.useBlockParams && !blockParams) {
            throw new _Exception2['default']('must pass block params');
          }
          if (templateSpec.useDepths && !depths) {
            throw new _Exception2['default']('must pass parent depths');
          }

          return wrapProgram(container, i, templateSpec[i], data, 0, blockParams, depths);
        };
        return ret;
      }

      function wrapProgram(container, i, fn, data, declaredBlockParams, blockParams, depths) {
        function prog(context) {
          var options = arguments[1] === undefined ? {} : arguments[1];

          return fn.call(container, context, container.helpers, container.partials, options.data || data, blockParams && [options.blockParams].concat(blockParams), depths && [context].concat(depths));
        }
        prog.program = i;
        prog.depth = depths ? depths.length : 0;
        prog.blockParams = declaredBlockParams || 0;
        return prog;
      }

      function resolvePartial(partial, context, options) {
        if (!partial) {
          partial = options.partials[options.name];
        } else if (!partial.call && !options.name) {
          // This is a dynamic partial that returned a string
          options.name = partial;
          partial = options.partials[partial];
        }
        return partial;
      }

      function invokePartial(partial, context, options) {
        options.partial = true;

        if (partial === undefined) {
          throw new _Exception2['default']('The partial ' + options.name + ' could not be found');
        } else if (partial instanceof Function) {
          return partial(context, options);
        }
      }

      function noop() {
        return '';
      }

      function initData(context, data) {
        if (!data || !('root' in data)) {
          data = data ? _COMPILER_REVISION$REVISION_CHANGES$createFrame.createFrame(data) : {};
          data.root = context;
        }
        return data;
      }

      /***/ },
    /* 15 */
    /***/ function(module, exports, __webpack_require__) {

      "use strict";

      exports.__esModule = true;
      /* istanbul ignore next */
      /* Jison generated parser */
      var handlebars = (function () {
        var parser = { trace: function trace() {},
          yy: {},
          symbols_: { error: 2, root: 3, program: 4, EOF: 5, program_repetition0: 6, statement: 7, mustache: 8, block: 9, rawBlock: 10, partial: 11, content: 12, COMMENT: 13, CONTENT: 14, openRawBlock: 15, END_RAW_BLOCK: 16, OPEN_RAW_BLOCK: 17, helperName: 18, openRawBlock_repetition0: 19, openRawBlock_option0: 20, CLOSE_RAW_BLOCK: 21, openBlock: 22, block_option0: 23, closeBlock: 24, openInverse: 25, block_option1: 26, OPEN_BLOCK: 27, openBlock_repetition0: 28, openBlock_option0: 29, openBlock_option1: 30, CLOSE: 31, OPEN_INVERSE: 32, openInverse_repetition0: 33, openInverse_option0: 34, openInverse_option1: 35, openInverseChain: 36, OPEN_INVERSE_CHAIN: 37, openInverseChain_repetition0: 38, openInverseChain_option0: 39, openInverseChain_option1: 40, inverseAndProgram: 41, INVERSE: 42, inverseChain: 43, inverseChain_option0: 44, OPEN_ENDBLOCK: 45, OPEN: 46, mustache_repetition0: 47, mustache_option0: 48, OPEN_UNESCAPED: 49, mustache_repetition1: 50, mustache_option1: 51, CLOSE_UNESCAPED: 52, OPEN_PARTIAL: 53, partialName: 54, partial_repetition0: 55, partial_option0: 56, param: 57, sexpr: 58, OPEN_SEXPR: 59, sexpr_repetition0: 60, sexpr_option0: 61, CLOSE_SEXPR: 62, hash: 63, hash_repetition_plus0: 64, hashSegment: 65, ID: 66, EQUALS: 67, blockParams: 68, OPEN_BLOCK_PARAMS: 69, blockParams_repetition_plus0: 70, CLOSE_BLOCK_PARAMS: 71, path: 72, dataName: 73, STRING: 74, NUMBER: 75, BOOLEAN: 76, UNDEFINED: 77, NULL: 78, DATA: 79, pathSegments: 80, SEP: 81, $accept: 0, $end: 1 },
          terminals_: { 2: "error", 5: "EOF", 13: "COMMENT", 14: "CONTENT", 16: "END_RAW_BLOCK", 17: "OPEN_RAW_BLOCK", 21: "CLOSE_RAW_BLOCK", 27: "OPEN_BLOCK", 31: "CLOSE", 32: "OPEN_INVERSE", 37: "OPEN_INVERSE_CHAIN", 42: "INVERSE", 45: "OPEN_ENDBLOCK", 46: "OPEN", 49: "OPEN_UNESCAPED", 52: "CLOSE_UNESCAPED", 53: "OPEN_PARTIAL", 59: "OPEN_SEXPR", 62: "CLOSE_SEXPR", 66: "ID", 67: "EQUALS", 69: "OPEN_BLOCK_PARAMS", 71: "CLOSE_BLOCK_PARAMS", 74: "STRING", 75: "NUMBER", 76: "BOOLEAN", 77: "UNDEFINED", 78: "NULL", 79: "DATA", 81: "SEP" },
          productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [12, 1], [10, 3], [15, 5], [9, 4], [9, 4], [22, 6], [25, 6], [36, 6], [41, 2], [43, 3], [43, 1], [24, 3], [8, 5], [8, 5], [11, 5], [57, 1], [57, 1], [58, 5], [63, 1], [65, 3], [68, 3], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [18, 1], [54, 1], [54, 1], [73, 2], [72, 1], [80, 3], [80, 1], [6, 0], [6, 2], [19, 0], [19, 2], [20, 0], [20, 1], [23, 0], [23, 1], [26, 0], [26, 1], [28, 0], [28, 2], [29, 0], [29, 1], [30, 0], [30, 1], [33, 0], [33, 2], [34, 0], [34, 1], [35, 0], [35, 1], [38, 0], [38, 2], [39, 0], [39, 1], [40, 0], [40, 1], [44, 0], [44, 1], [47, 0], [47, 2], [48, 0], [48, 1], [50, 0], [50, 2], [51, 0], [51, 1], [55, 0], [55, 2], [56, 0], [56, 1], [60, 0], [60, 2], [61, 0], [61, 1], [64, 1], [64, 2], [70, 1], [70, 2]],
          performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {

            var $0 = $$.length - 1;
            switch (yystate) {
              case 1:
                return $$[$0 - 1];
                break;
              case 2:
                this.$ = new yy.Program($$[$0], null, {}, yy.locInfo(this._$));
                break;
              case 3:
                this.$ = $$[$0];
                break;
              case 4:
                this.$ = $$[$0];
                break;
              case 5:
                this.$ = $$[$0];
                break;
              case 6:
                this.$ = $$[$0];
                break;
              case 7:
                this.$ = $$[$0];
                break;
              case 8:
                this.$ = new yy.CommentStatement(yy.stripComment($$[$0]), yy.stripFlags($$[$0], $$[$0]), yy.locInfo(this._$));
                break;
              case 9:
                this.$ = new yy.ContentStatement($$[$0], yy.locInfo(this._$));
                break;
              case 10:
                this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                break;
              case 11:
                this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };
                break;
              case 12:
                this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
                break;
              case 13:
                this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
                break;
              case 14:
                this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                break;
              case 15:
                this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                break;
              case 16:
                this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 5], $$[$0]) };
                break;
              case 17:
                this.$ = { strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };
                break;
              case 18:
                var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$),
                    program = new yy.Program([inverse], null, {}, yy.locInfo(this._$));
                program.chained = true;

                this.$ = { strip: $$[$0 - 2].strip, program: program, chain: true };

                break;
              case 19:
                this.$ = $$[$0];
                break;
              case 20:
                this.$ = { path: $$[$0 - 1], strip: yy.stripFlags($$[$0 - 2], $$[$0]) };
                break;
              case 21:
                this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                break;
              case 22:
                this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
                break;
              case 23:
                this.$ = new yy.PartialStatement($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.stripFlags($$[$0 - 4], $$[$0]), yy.locInfo(this._$));
                break;
              case 24:
                this.$ = $$[$0];
                break;
              case 25:
                this.$ = $$[$0];
                break;
              case 26:
                this.$ = new yy.SubExpression($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], yy.locInfo(this._$));
                break;
              case 27:
                this.$ = new yy.Hash($$[$0], yy.locInfo(this._$));
                break;
              case 28:
                this.$ = new yy.HashPair(yy.id($$[$0 - 2]), $$[$0], yy.locInfo(this._$));
                break;
              case 29:
                this.$ = yy.id($$[$0 - 1]);
                break;
              case 30:
                this.$ = $$[$0];
                break;
              case 31:
                this.$ = $$[$0];
                break;
              case 32:
                this.$ = new yy.StringLiteral($$[$0], yy.locInfo(this._$));
                break;
              case 33:
                this.$ = new yy.NumberLiteral($$[$0], yy.locInfo(this._$));
                break;
              case 34:
                this.$ = new yy.BooleanLiteral($$[$0], yy.locInfo(this._$));
                break;
              case 35:
                this.$ = new yy.UndefinedLiteral(yy.locInfo(this._$));
                break;
              case 36:
                this.$ = new yy.NullLiteral(yy.locInfo(this._$));
                break;
              case 37:
                this.$ = $$[$0];
                break;
              case 38:
                this.$ = $$[$0];
                break;
              case 39:
                this.$ = yy.preparePath(true, $$[$0], this._$);
                break;
              case 40:
                this.$ = yy.preparePath(false, $$[$0], this._$);
                break;
              case 41:
                $$[$0 - 2].push({ part: yy.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });this.$ = $$[$0 - 2];
                break;
              case 42:
                this.$ = [{ part: yy.id($$[$0]), original: $$[$0] }];
                break;
              case 43:
                this.$ = [];
                break;
              case 44:
                $$[$0 - 1].push($$[$0]);
                break;
              case 45:
                this.$ = [];
                break;
              case 46:
                $$[$0 - 1].push($$[$0]);
                break;
              case 53:
                this.$ = [];
                break;
              case 54:
                $$[$0 - 1].push($$[$0]);
                break;
              case 59:
                this.$ = [];
                break;
              case 60:
                $$[$0 - 1].push($$[$0]);
                break;
              case 65:
                this.$ = [];
                break;
              case 66:
                $$[$0 - 1].push($$[$0]);
                break;
              case 73:
                this.$ = [];
                break;
              case 74:
                $$[$0 - 1].push($$[$0]);
                break;
              case 77:
                this.$ = [];
                break;
              case 78:
                $$[$0 - 1].push($$[$0]);
                break;
              case 81:
                this.$ = [];
                break;
              case 82:
                $$[$0 - 1].push($$[$0]);
                break;
              case 85:
                this.$ = [];
                break;
              case 86:
                $$[$0 - 1].push($$[$0]);
                break;
              case 89:
                this.$ = [$$[$0]];
                break;
              case 90:
                $$[$0 - 1].push($$[$0]);
                break;
              case 91:
                this.$ = [$$[$0]];
                break;
              case 92:
                $$[$0 - 1].push($$[$0]);
                break;
            }
          },
          table: [{ 3: 1, 4: 2, 5: [2, 43], 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: [1, 11], 14: [1, 18], 15: 16, 17: [1, 21], 22: 14, 25: 15, 27: [1, 19], 32: [1, 20], 37: [2, 2], 42: [2, 2], 45: [2, 2], 46: [1, 12], 49: [1, 13], 53: [1, 17] }, { 1: [2, 1] }, { 5: [2, 44], 13: [2, 44], 14: [2, 44], 17: [2, 44], 27: [2, 44], 32: [2, 44], 37: [2, 44], 42: [2, 44], 45: [2, 44], 46: [2, 44], 49: [2, 44], 53: [2, 44] }, { 5: [2, 3], 13: [2, 3], 14: [2, 3], 17: [2, 3], 27: [2, 3], 32: [2, 3], 37: [2, 3], 42: [2, 3], 45: [2, 3], 46: [2, 3], 49: [2, 3], 53: [2, 3] }, { 5: [2, 4], 13: [2, 4], 14: [2, 4], 17: [2, 4], 27: [2, 4], 32: [2, 4], 37: [2, 4], 42: [2, 4], 45: [2, 4], 46: [2, 4], 49: [2, 4], 53: [2, 4] }, { 5: [2, 5], 13: [2, 5], 14: [2, 5], 17: [2, 5], 27: [2, 5], 32: [2, 5], 37: [2, 5], 42: [2, 5], 45: [2, 5], 46: [2, 5], 49: [2, 5], 53: [2, 5] }, { 5: [2, 6], 13: [2, 6], 14: [2, 6], 17: [2, 6], 27: [2, 6], 32: [2, 6], 37: [2, 6], 42: [2, 6], 45: [2, 6], 46: [2, 6], 49: [2, 6], 53: [2, 6] }, { 5: [2, 7], 13: [2, 7], 14: [2, 7], 17: [2, 7], 27: [2, 7], 32: [2, 7], 37: [2, 7], 42: [2, 7], 45: [2, 7], 46: [2, 7], 49: [2, 7], 53: [2, 7] }, { 5: [2, 8], 13: [2, 8], 14: [2, 8], 17: [2, 8], 27: [2, 8], 32: [2, 8], 37: [2, 8], 42: [2, 8], 45: [2, 8], 46: [2, 8], 49: [2, 8], 53: [2, 8] }, { 18: 22, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 33, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 4: 34, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 37: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 4: 35, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 12: 36, 14: [1, 18] }, { 18: 38, 54: 37, 58: 39, 59: [1, 40], 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 9], 13: [2, 9], 14: [2, 9], 16: [2, 9], 17: [2, 9], 27: [2, 9], 32: [2, 9], 37: [2, 9], 42: [2, 9], 45: [2, 9], 46: [2, 9], 49: [2, 9], 53: [2, 9] }, { 18: 41, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 42, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 43, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 31: [2, 73], 47: 44, 59: [2, 73], 66: [2, 73], 74: [2, 73], 75: [2, 73], 76: [2, 73], 77: [2, 73], 78: [2, 73], 79: [2, 73] }, { 21: [2, 30], 31: [2, 30], 52: [2, 30], 59: [2, 30], 62: [2, 30], 66: [2, 30], 69: [2, 30], 74: [2, 30], 75: [2, 30], 76: [2, 30], 77: [2, 30], 78: [2, 30], 79: [2, 30] }, { 21: [2, 31], 31: [2, 31], 52: [2, 31], 59: [2, 31], 62: [2, 31], 66: [2, 31], 69: [2, 31], 74: [2, 31], 75: [2, 31], 76: [2, 31], 77: [2, 31], 78: [2, 31], 79: [2, 31] }, { 21: [2, 32], 31: [2, 32], 52: [2, 32], 59: [2, 32], 62: [2, 32], 66: [2, 32], 69: [2, 32], 74: [2, 32], 75: [2, 32], 76: [2, 32], 77: [2, 32], 78: [2, 32], 79: [2, 32] }, { 21: [2, 33], 31: [2, 33], 52: [2, 33], 59: [2, 33], 62: [2, 33], 66: [2, 33], 69: [2, 33], 74: [2, 33], 75: [2, 33], 76: [2, 33], 77: [2, 33], 78: [2, 33], 79: [2, 33] }, { 21: [2, 34], 31: [2, 34], 52: [2, 34], 59: [2, 34], 62: [2, 34], 66: [2, 34], 69: [2, 34], 74: [2, 34], 75: [2, 34], 76: [2, 34], 77: [2, 34], 78: [2, 34], 79: [2, 34] }, { 21: [2, 35], 31: [2, 35], 52: [2, 35], 59: [2, 35], 62: [2, 35], 66: [2, 35], 69: [2, 35], 74: [2, 35], 75: [2, 35], 76: [2, 35], 77: [2, 35], 78: [2, 35], 79: [2, 35] }, { 21: [2, 36], 31: [2, 36], 52: [2, 36], 59: [2, 36], 62: [2, 36], 66: [2, 36], 69: [2, 36], 74: [2, 36], 75: [2, 36], 76: [2, 36], 77: [2, 36], 78: [2, 36], 79: [2, 36] }, { 21: [2, 40], 31: [2, 40], 52: [2, 40], 59: [2, 40], 62: [2, 40], 66: [2, 40], 69: [2, 40], 74: [2, 40], 75: [2, 40], 76: [2, 40], 77: [2, 40], 78: [2, 40], 79: [2, 40], 81: [1, 45] }, { 66: [1, 32], 80: 46 }, { 21: [2, 42], 31: [2, 42], 52: [2, 42], 59: [2, 42], 62: [2, 42], 66: [2, 42], 69: [2, 42], 74: [2, 42], 75: [2, 42], 76: [2, 42], 77: [2, 42], 78: [2, 42], 79: [2, 42], 81: [2, 42] }, { 50: 47, 52: [2, 77], 59: [2, 77], 66: [2, 77], 74: [2, 77], 75: [2, 77], 76: [2, 77], 77: [2, 77], 78: [2, 77], 79: [2, 77] }, { 23: 48, 36: 50, 37: [1, 52], 41: 51, 42: [1, 53], 43: 49, 45: [2, 49] }, { 26: 54, 41: 55, 42: [1, 53], 45: [2, 51] }, { 16: [1, 56] }, { 31: [2, 81], 55: 57, 59: [2, 81], 66: [2, 81], 74: [2, 81], 75: [2, 81], 76: [2, 81], 77: [2, 81], 78: [2, 81], 79: [2, 81] }, { 31: [2, 37], 59: [2, 37], 66: [2, 37], 74: [2, 37], 75: [2, 37], 76: [2, 37], 77: [2, 37], 78: [2, 37], 79: [2, 37] }, { 31: [2, 38], 59: [2, 38], 66: [2, 38], 74: [2, 38], 75: [2, 38], 76: [2, 38], 77: [2, 38], 78: [2, 38], 79: [2, 38] }, { 18: 58, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 28: 59, 31: [2, 53], 59: [2, 53], 66: [2, 53], 69: [2, 53], 74: [2, 53], 75: [2, 53], 76: [2, 53], 77: [2, 53], 78: [2, 53], 79: [2, 53] }, { 31: [2, 59], 33: 60, 59: [2, 59], 66: [2, 59], 69: [2, 59], 74: [2, 59], 75: [2, 59], 76: [2, 59], 77: [2, 59], 78: [2, 59], 79: [2, 59] }, { 19: 61, 21: [2, 45], 59: [2, 45], 66: [2, 45], 74: [2, 45], 75: [2, 45], 76: [2, 45], 77: [2, 45], 78: [2, 45], 79: [2, 45] }, { 18: 65, 31: [2, 75], 48: 62, 57: 63, 58: 66, 59: [1, 40], 63: 64, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 66: [1, 70] }, { 21: [2, 39], 31: [2, 39], 52: [2, 39], 59: [2, 39], 62: [2, 39], 66: [2, 39], 69: [2, 39], 74: [2, 39], 75: [2, 39], 76: [2, 39], 77: [2, 39], 78: [2, 39], 79: [2, 39], 81: [1, 45] }, { 18: 65, 51: 71, 52: [2, 79], 57: 72, 58: 66, 59: [1, 40], 63: 73, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 24: 74, 45: [1, 75] }, { 45: [2, 50] }, { 4: 76, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 37: [2, 43], 42: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 45: [2, 19] }, { 18: 77, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 4: 78, 6: 3, 13: [2, 43], 14: [2, 43], 17: [2, 43], 27: [2, 43], 32: [2, 43], 45: [2, 43], 46: [2, 43], 49: [2, 43], 53: [2, 43] }, { 24: 79, 45: [1, 75] }, { 45: [2, 52] }, { 5: [2, 10], 13: [2, 10], 14: [2, 10], 17: [2, 10], 27: [2, 10], 32: [2, 10], 37: [2, 10], 42: [2, 10], 45: [2, 10], 46: [2, 10], 49: [2, 10], 53: [2, 10] }, { 18: 65, 31: [2, 83], 56: 80, 57: 81, 58: 66, 59: [1, 40], 63: 82, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 59: [2, 85], 60: 83, 62: [2, 85], 66: [2, 85], 74: [2, 85], 75: [2, 85], 76: [2, 85], 77: [2, 85], 78: [2, 85], 79: [2, 85] }, { 18: 65, 29: 84, 31: [2, 55], 57: 85, 58: 66, 59: [1, 40], 63: 86, 64: 67, 65: 68, 66: [1, 69], 69: [2, 55], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 65, 31: [2, 61], 34: 87, 57: 88, 58: 66, 59: [1, 40], 63: 89, 64: 67, 65: 68, 66: [1, 69], 69: [2, 61], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 18: 65, 20: 90, 21: [2, 47], 57: 91, 58: 66, 59: [1, 40], 63: 92, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 31: [1, 93] }, { 31: [2, 74], 59: [2, 74], 66: [2, 74], 74: [2, 74], 75: [2, 74], 76: [2, 74], 77: [2, 74], 78: [2, 74], 79: [2, 74] }, { 31: [2, 76] }, { 21: [2, 24], 31: [2, 24], 52: [2, 24], 59: [2, 24], 62: [2, 24], 66: [2, 24], 69: [2, 24], 74: [2, 24], 75: [2, 24], 76: [2, 24], 77: [2, 24], 78: [2, 24], 79: [2, 24] }, { 21: [2, 25], 31: [2, 25], 52: [2, 25], 59: [2, 25], 62: [2, 25], 66: [2, 25], 69: [2, 25], 74: [2, 25], 75: [2, 25], 76: [2, 25], 77: [2, 25], 78: [2, 25], 79: [2, 25] }, { 21: [2, 27], 31: [2, 27], 52: [2, 27], 62: [2, 27], 65: 94, 66: [1, 95], 69: [2, 27] }, { 21: [2, 89], 31: [2, 89], 52: [2, 89], 62: [2, 89], 66: [2, 89], 69: [2, 89] }, { 21: [2, 42], 31: [2, 42], 52: [2, 42], 59: [2, 42], 62: [2, 42], 66: [2, 42], 67: [1, 96], 69: [2, 42], 74: [2, 42], 75: [2, 42], 76: [2, 42], 77: [2, 42], 78: [2, 42], 79: [2, 42], 81: [2, 42] }, { 21: [2, 41], 31: [2, 41], 52: [2, 41], 59: [2, 41], 62: [2, 41], 66: [2, 41], 69: [2, 41], 74: [2, 41], 75: [2, 41], 76: [2, 41], 77: [2, 41], 78: [2, 41], 79: [2, 41], 81: [2, 41] }, { 52: [1, 97] }, { 52: [2, 78], 59: [2, 78], 66: [2, 78], 74: [2, 78], 75: [2, 78], 76: [2, 78], 77: [2, 78], 78: [2, 78], 79: [2, 78] }, { 52: [2, 80] }, { 5: [2, 12], 13: [2, 12], 14: [2, 12], 17: [2, 12], 27: [2, 12], 32: [2, 12], 37: [2, 12], 42: [2, 12], 45: [2, 12], 46: [2, 12], 49: [2, 12], 53: [2, 12] }, { 18: 98, 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 36: 50, 37: [1, 52], 41: 51, 42: [1, 53], 43: 100, 44: 99, 45: [2, 71] }, { 31: [2, 65], 38: 101, 59: [2, 65], 66: [2, 65], 69: [2, 65], 74: [2, 65], 75: [2, 65], 76: [2, 65], 77: [2, 65], 78: [2, 65], 79: [2, 65] }, { 45: [2, 17] }, { 5: [2, 13], 13: [2, 13], 14: [2, 13], 17: [2, 13], 27: [2, 13], 32: [2, 13], 37: [2, 13], 42: [2, 13], 45: [2, 13], 46: [2, 13], 49: [2, 13], 53: [2, 13] }, { 31: [1, 102] }, { 31: [2, 82], 59: [2, 82], 66: [2, 82], 74: [2, 82], 75: [2, 82], 76: [2, 82], 77: [2, 82], 78: [2, 82], 79: [2, 82] }, { 31: [2, 84] }, { 18: 65, 57: 104, 58: 66, 59: [1, 40], 61: 103, 62: [2, 87], 63: 105, 64: 67, 65: 68, 66: [1, 69], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 30: 106, 31: [2, 57], 68: 107, 69: [1, 108] }, { 31: [2, 54], 59: [2, 54], 66: [2, 54], 69: [2, 54], 74: [2, 54], 75: [2, 54], 76: [2, 54], 77: [2, 54], 78: [2, 54], 79: [2, 54] }, { 31: [2, 56], 69: [2, 56] }, { 31: [2, 63], 35: 109, 68: 110, 69: [1, 108] }, { 31: [2, 60], 59: [2, 60], 66: [2, 60], 69: [2, 60], 74: [2, 60], 75: [2, 60], 76: [2, 60], 77: [2, 60], 78: [2, 60], 79: [2, 60] }, { 31: [2, 62], 69: [2, 62] }, { 21: [1, 111] }, { 21: [2, 46], 59: [2, 46], 66: [2, 46], 74: [2, 46], 75: [2, 46], 76: [2, 46], 77: [2, 46], 78: [2, 46], 79: [2, 46] }, { 21: [2, 48] }, { 5: [2, 21], 13: [2, 21], 14: [2, 21], 17: [2, 21], 27: [2, 21], 32: [2, 21], 37: [2, 21], 42: [2, 21], 45: [2, 21], 46: [2, 21], 49: [2, 21], 53: [2, 21] }, { 21: [2, 90], 31: [2, 90], 52: [2, 90], 62: [2, 90], 66: [2, 90], 69: [2, 90] }, { 67: [1, 96] }, { 18: 65, 57: 112, 58: 66, 59: [1, 40], 66: [1, 32], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 22], 13: [2, 22], 14: [2, 22], 17: [2, 22], 27: [2, 22], 32: [2, 22], 37: [2, 22], 42: [2, 22], 45: [2, 22], 46: [2, 22], 49: [2, 22], 53: [2, 22] }, { 31: [1, 113] }, { 45: [2, 18] }, { 45: [2, 72] }, { 18: 65, 31: [2, 67], 39: 114, 57: 115, 58: 66, 59: [1, 40], 63: 116, 64: 67, 65: 68, 66: [1, 69], 69: [2, 67], 72: 23, 73: 24, 74: [1, 25], 75: [1, 26], 76: [1, 27], 77: [1, 28], 78: [1, 29], 79: [1, 31], 80: 30 }, { 5: [2, 23], 13: [2, 23], 14: [2, 23], 17: [2, 23], 27: [2, 23], 32: [2, 23], 37: [2, 23], 42: [2, 23], 45: [2, 23], 46: [2, 23], 49: [2, 23], 53: [2, 23] }, { 62: [1, 117] }, { 59: [2, 86], 62: [2, 86], 66: [2, 86], 74: [2, 86], 75: [2, 86], 76: [2, 86], 77: [2, 86], 78: [2, 86], 79: [2, 86] }, { 62: [2, 88] }, { 31: [1, 118] }, { 31: [2, 58] }, { 66: [1, 120], 70: 119 }, { 31: [1, 121] }, { 31: [2, 64] }, { 14: [2, 11] }, { 21: [2, 28], 31: [2, 28], 52: [2, 28], 62: [2, 28], 66: [2, 28], 69: [2, 28] }, { 5: [2, 20], 13: [2, 20], 14: [2, 20], 17: [2, 20], 27: [2, 20], 32: [2, 20], 37: [2, 20], 42: [2, 20], 45: [2, 20], 46: [2, 20], 49: [2, 20], 53: [2, 20] }, { 31: [2, 69], 40: 122, 68: 123, 69: [1, 108] }, { 31: [2, 66], 59: [2, 66], 66: [2, 66], 69: [2, 66], 74: [2, 66], 75: [2, 66], 76: [2, 66], 77: [2, 66], 78: [2, 66], 79: [2, 66] }, { 31: [2, 68], 69: [2, 68] }, { 21: [2, 26], 31: [2, 26], 52: [2, 26], 59: [2, 26], 62: [2, 26], 66: [2, 26], 69: [2, 26], 74: [2, 26], 75: [2, 26], 76: [2, 26], 77: [2, 26], 78: [2, 26], 79: [2, 26] }, { 13: [2, 14], 14: [2, 14], 17: [2, 14], 27: [2, 14], 32: [2, 14], 37: [2, 14], 42: [2, 14], 45: [2, 14], 46: [2, 14], 49: [2, 14], 53: [2, 14] }, { 66: [1, 125], 71: [1, 124] }, { 66: [2, 91], 71: [2, 91] }, { 13: [2, 15], 14: [2, 15], 17: [2, 15], 27: [2, 15], 32: [2, 15], 42: [2, 15], 45: [2, 15], 46: [2, 15], 49: [2, 15], 53: [2, 15] }, { 31: [1, 126] }, { 31: [2, 70] }, { 31: [2, 29] }, { 66: [2, 92], 71: [2, 92] }, { 13: [2, 16], 14: [2, 16], 17: [2, 16], 27: [2, 16], 32: [2, 16], 37: [2, 16], 42: [2, 16], 45: [2, 16], 46: [2, 16], 49: [2, 16], 53: [2, 16] }],
          defaultActions: { 4: [2, 1], 49: [2, 50], 51: [2, 19], 55: [2, 52], 64: [2, 76], 73: [2, 80], 78: [2, 17], 82: [2, 84], 92: [2, 48], 99: [2, 18], 100: [2, 72], 105: [2, 88], 107: [2, 58], 110: [2, 64], 111: [2, 11], 123: [2, 70], 124: [2, 29] },
          parseError: function parseError(str, hash) {
            throw new Error(str);
          },
          parse: function parse(input) {
            var self = this,
                stack = [0],
                vstack = [null],
                lstack = [],
                table = this.table,
                yytext = "",
                yylineno = 0,
                yyleng = 0,
                recovering = 0,
                TERROR = 2,
                EOF = 1;
            this.lexer.setInput(input);
            this.lexer.yy = this.yy;
            this.yy.lexer = this.lexer;
            this.yy.parser = this;
            if (typeof this.lexer.yylloc == "undefined") this.lexer.yylloc = {};
            var yyloc = this.lexer.yylloc;
            lstack.push(yyloc);
            var ranges = this.lexer.options && this.lexer.options.ranges;
            if (typeof this.yy.parseError === "function") this.parseError = this.yy.parseError;
            function popStack(n) {
              stack.length = stack.length - 2 * n;
              vstack.length = vstack.length - n;
              lstack.length = lstack.length - n;
            }
            function lex() {
              var token;
              token = self.lexer.lex() || 1;
              if (typeof token !== "number") {
                token = self.symbols_[token] || token;
              }
              return token;
            }
            var symbol,
                preErrorSymbol,
                state,
                action,
                a,
                r,
                yyval = {},
                p,
                len,
                newState,
                expected;
            while (true) {
              state = stack[stack.length - 1];
              if (this.defaultActions[state]) {
                action = this.defaultActions[state];
              } else {
                if (symbol === null || typeof symbol == "undefined") {
                  symbol = lex();
                }
                action = table[state] && table[state][symbol];
              }
              if (typeof action === "undefined" || !action.length || !action[0]) {
                var errStr = "";
                if (!recovering) {
                  expected = [];
                  for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'" + this.terminals_[p] + "'");
                  }
                  if (this.lexer.showPosition) {
                    errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                  } else {
                    errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
                  }
                  this.parseError(errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected });
                }
              }
              if (action[0] instanceof Array && action.length > 1) {
                throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
              }
              switch (action[0]) {
                case 1:
                  stack.push(symbol);
                  vstack.push(this.lexer.yytext);
                  lstack.push(this.lexer.yylloc);
                  stack.push(action[1]);
                  symbol = null;
                  if (!preErrorSymbol) {
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0) recovering--;
                  } else {
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                  }
                  break;
                case 2:
                  len = this.productions_[action[1]][1];
                  yyval.$ = vstack[vstack.length - len];
                  yyval._$ = { first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column };
                  if (ranges) {
                    yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
                  }
                  r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                  if (typeof r !== "undefined") {
                    return r;
                  }
                  if (len) {
                    stack = stack.slice(0, -1 * len * 2);
                    vstack = vstack.slice(0, -1 * len);
                    lstack = lstack.slice(0, -1 * len);
                  }
                  stack.push(this.productions_[action[1]][0]);
                  vstack.push(yyval.$);
                  lstack.push(yyval._$);
                  newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                  stack.push(newState);
                  break;
                case 3:
                  return true;
              }
            }
            return true;
          }
        };
        /* Jison generated lexer */
        var lexer = (function () {
          var lexer = { EOF: 1,
            parseError: function parseError(str, hash) {
              if (this.yy.parser) {
                this.yy.parser.parseError(str, hash);
              } else {
                throw new Error(str);
              }
            },
            setInput: function setInput(input) {
              this._input = input;
              this._more = this._less = this.done = false;
              this.yylineno = this.yyleng = 0;
              this.yytext = this.matched = this.match = "";
              this.conditionStack = ["INITIAL"];
              this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
              if (this.options.ranges) this.yylloc.range = [0, 0];
              this.offset = 0;
              return this;
            },
            input: function input() {
              var ch = this._input[0];
              this.yytext += ch;
              this.yyleng++;
              this.offset++;
              this.match += ch;
              this.matched += ch;
              var lines = ch.match(/(?:\r\n?|\n).*/g);
              if (lines) {
                this.yylineno++;
                this.yylloc.last_line++;
              } else {
                this.yylloc.last_column++;
              }
              if (this.options.ranges) this.yylloc.range[1]++;

              this._input = this._input.slice(1);
              return ch;
            },
            unput: function unput(ch) {
              var len = ch.length;
              var lines = ch.split(/(?:\r\n?|\n)/g);

              this._input = ch + this._input;
              this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
              //this.yyleng -= len;
              this.offset -= len;
              var oldLines = this.match.split(/(?:\r\n?|\n)/g);
              this.match = this.match.substr(0, this.match.length - 1);
              this.matched = this.matched.substr(0, this.matched.length - 1);

              if (lines.length - 1) this.yylineno -= lines.length - 1;
              var r = this.yylloc.range;

              this.yylloc = { first_line: this.yylloc.first_line,
                last_line: this.yylineno + 1,
                first_column: this.yylloc.first_column,
                last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
              };

              if (this.options.ranges) {
                this.yylloc.range = [r[0], r[0] + this.yyleng - len];
              }
              return this;
            },
            more: function more() {
              this._more = true;
              return this;
            },
            less: function less(n) {
              this.unput(this.match.slice(n));
            },
            pastInput: function pastInput() {
              var past = this.matched.substr(0, this.matched.length - this.match.length);
              return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
            },
            upcomingInput: function upcomingInput() {
              var next = this.match;
              if (next.length < 20) {
                next += this._input.substr(0, 20 - next.length);
              }
              return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
            },
            showPosition: function showPosition() {
              var pre = this.pastInput();
              var c = new Array(pre.length + 1).join("-");
              return pre + this.upcomingInput() + "\n" + c + "^";
            },
            next: function next() {
              if (this.done) {
                return this.EOF;
              }
              if (!this._input) this.done = true;

              var token, match, tempMatch, index, col, lines;
              if (!this._more) {
                this.yytext = "";
                this.match = "";
              }
              var rules = this._currentRules();
              for (var i = 0; i < rules.length; i++) {
                tempMatch = this._input.match(this.rules[rules[i]]);
                if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                  match = tempMatch;
                  index = i;
                  if (!this.options.flex) break;
                }
              }
              if (match) {
                lines = match[0].match(/(?:\r\n?|\n).*/g);
                if (lines) this.yylineno += lines.length;
                this.yylloc = { first_line: this.yylloc.last_line,
                  last_line: this.yylineno + 1,
                  first_column: this.yylloc.last_column,
                  last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length };
                this.yytext += match[0];
                this.match += match[0];
                this.matches = match;
                this.yyleng = this.yytext.length;
                if (this.options.ranges) {
                  this.yylloc.range = [this.offset, this.offset += this.yyleng];
                }
                this._more = false;
                this._input = this._input.slice(match[0].length);
                this.matched += match[0];
                token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
                if (this.done && this._input) this.done = false;
                if (token) {
                  return token;
                } else {
                  return;
                }
              }
              if (this._input === "") {
                return this.EOF;
              } else {
                return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), { text: "", token: null, line: this.yylineno });
              }
            },
            lex: function lex() {
              var r = this.next();
              if (typeof r !== "undefined") {
                return r;
              } else {
                return this.lex();
              }
            },
            begin: function begin(condition) {
              this.conditionStack.push(condition);
            },
            popState: function popState() {
              return this.conditionStack.pop();
            },
            _currentRules: function _currentRules() {
              return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
            },
            topState: function topState() {
              return this.conditionStack[this.conditionStack.length - 2];
            },
            pushState: function begin(condition) {
              this.begin(condition);
            } };
          lexer.options = {};
          lexer.performAction = function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {

            function strip(start, end) {
              return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
            }

            var YYSTATE = YY_START;
            switch ($avoiding_name_collisions) {
              case 0:
                if (yy_.yytext.slice(-2) === "\\\\") {
                  strip(0, 1);
                  this.begin("mu");
                } else if (yy_.yytext.slice(-1) === "\\") {
                  strip(0, 1);
                  this.begin("emu");
                } else {
                  this.begin("mu");
                }
                if (yy_.yytext) {
                  return 14;
                }break;
              case 1:
                return 14;
                break;
              case 2:
                this.popState();
                return 14;

                break;
              case 3:
                yy_.yytext = yy_.yytext.substr(5, yy_.yyleng - 9);
                this.popState();
                return 16;

                break;
              case 4:
                return 14;
                break;
              case 5:
                this.popState();
                return 13;

                break;
              case 6:
                return 59;
                break;
              case 7:
                return 62;
                break;
              case 8:
                return 17;
                break;
              case 9:
                this.popState();
                this.begin("raw");
                return 21;

                break;
              case 10:
                return 53;
                break;
              case 11:
                return 27;
                break;
              case 12:
                return 45;
                break;
              case 13:
                this.popState();return 42;
                break;
              case 14:
                this.popState();return 42;
                break;
              case 15:
                return 32;
                break;
              case 16:
                return 37;
                break;
              case 17:
                return 49;
                break;
              case 18:
                return 46;
                break;
              case 19:
                this.unput(yy_.yytext);
                this.popState();
                this.begin("com");

                break;
              case 20:
                this.popState();
                return 13;

                break;
              case 21:
                return 46;
                break;
              case 22:
                return 67;
                break;
              case 23:
                return 66;
                break;
              case 24:
                return 66;
                break;
              case 25:
                return 81;
                break;
              case 26:
                // ignore whitespace
                break;
              case 27:
                this.popState();return 52;
                break;
              case 28:
                this.popState();return 31;
                break;
              case 29:
                yy_.yytext = strip(1, 2).replace(/\\"/g, "\"");return 74;
                break;
              case 30:
                yy_.yytext = strip(1, 2).replace(/\\'/g, "'");return 74;
                break;
              case 31:
                return 79;
                break;
              case 32:
                return 76;
                break;
              case 33:
                return 76;
                break;
              case 34:
                return 77;
                break;
              case 35:
                return 78;
                break;
              case 36:
                return 75;
                break;
              case 37:
                return 69;
                break;
              case 38:
                return 71;
                break;
              case 39:
                return 66;
                break;
              case 40:
                return 66;
                break;
              case 41:
                return "INVALID";
                break;
              case 42:
                return 5;
                break;
            }
          };
          lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]*?(?=(\{\{\{\{\/)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)|])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:undefined(?=([~}\s)])))/, /^(?:null(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/];
          lexer.conditions = { mu: { rules: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42], inclusive: false }, emu: { rules: [2], inclusive: false }, com: { rules: [5], inclusive: false }, raw: { rules: [3, 4], inclusive: false }, INITIAL: { rules: [0, 1, 42], inclusive: true } };
          return lexer;
        })();
        parser.lexer = lexer;
        function Parser() {
          this.yy = {};
        }Parser.prototype = parser;parser.Parser = Parser;
        return new Parser();
      })();exports["default"] = handlebars;
      module.exports = exports["default"];

      /***/ },
    /* 16 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireDefault = __webpack_require__(8)['default'];

      exports.__esModule = true;

      var _Visitor = __webpack_require__(6);

      var _Visitor2 = _interopRequireDefault(_Visitor);

      function WhitespaceControl() {}
      WhitespaceControl.prototype = new _Visitor2['default']();

      WhitespaceControl.prototype.Program = function (program) {
        var isRoot = !this.isRootSeen;
        this.isRootSeen = true;

        var body = program.body;
        for (var i = 0, l = body.length; i < l; i++) {
          var current = body[i],
              strip = this.accept(current);

          if (!strip) {
            continue;
          }

          var _isPrevWhitespace = isPrevWhitespace(body, i, isRoot),
              _isNextWhitespace = isNextWhitespace(body, i, isRoot),
              openStandalone = strip.openStandalone && _isPrevWhitespace,
              closeStandalone = strip.closeStandalone && _isNextWhitespace,
              inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

          if (strip.close) {
            omitRight(body, i, true);
          }
          if (strip.open) {
            omitLeft(body, i, true);
          }

          if (inlineStandalone) {
            omitRight(body, i);

            if (omitLeft(body, i)) {
              // If we are on a standalone node, save the indent info for partials
              if (current.type === 'PartialStatement') {
                // Pull out the whitespace from the final line
                current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
              }
            }
          }
          if (openStandalone) {
            omitRight((current.program || current.inverse).body);

            // Strip out the previous content node if it's whitespace only
            omitLeft(body, i);
          }
          if (closeStandalone) {
            // Always strip the next node
            omitRight(body, i);

            omitLeft((current.inverse || current.program).body);
          }
        }

        return program;
      };
      WhitespaceControl.prototype.BlockStatement = function (block) {
        this.accept(block.program);
        this.accept(block.inverse);

        // Find the inverse program that is involed with whitespace stripping.
        var program = block.program || block.inverse,
            inverse = block.program && block.inverse,
            firstInverse = inverse,
            lastInverse = inverse;

        if (inverse && inverse.chained) {
          firstInverse = inverse.body[0].program;

          // Walk the inverse chain to find the last inverse that is actually in the chain.
          while (lastInverse.chained) {
            lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
          }
        }

        var strip = {
          open: block.openStrip.open,
          close: block.closeStrip.close,

          // Determine the standalone candiacy. Basically flag our content as being possibly standalone
          // so our parent can determine if we actually are standalone
          openStandalone: isNextWhitespace(program.body),
          closeStandalone: isPrevWhitespace((firstInverse || program).body)
        };

        if (block.openStrip.close) {
          omitRight(program.body, null, true);
        }

        if (inverse) {
          var inverseStrip = block.inverseStrip;

          if (inverseStrip.open) {
            omitLeft(program.body, null, true);
          }

          if (inverseStrip.close) {
            omitRight(firstInverse.body, null, true);
          }
          if (block.closeStrip.open) {
            omitLeft(lastInverse.body, null, true);
          }

          // Find standalone else statments
          if (isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
            omitLeft(program.body);
            omitRight(firstInverse.body);
          }
        } else if (block.closeStrip.open) {
          omitLeft(program.body, null, true);
        }

        return strip;
      };

      WhitespaceControl.prototype.MustacheStatement = function (mustache) {
        return mustache.strip;
      };

      WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function (node) {
        /* istanbul ignore next */
        var strip = node.strip || {};
        return {
          inlineStandalone: true,
          open: strip.open,
          close: strip.close
        };
      };

      function isPrevWhitespace(body, i, isRoot) {
        if (i === undefined) {
          i = body.length;
        }

        // Nodes that end with newlines are considered whitespace (but are special
        // cased for strip operations)
        var prev = body[i - 1],
            sibling = body[i - 2];
        if (!prev) {
          return isRoot;
        }

        if (prev.type === 'ContentStatement') {
          return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
        }
      }
      function isNextWhitespace(body, i, isRoot) {
        if (i === undefined) {
          i = -1;
        }

        var next = body[i + 1],
            sibling = body[i + 2];
        if (!next) {
          return isRoot;
        }

        if (next.type === 'ContentStatement') {
          return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
        }
      }

      // Marks the node to the right of the position as omitted.
      // I.e. {{foo}}' ' will mark the ' ' node as omitted.
      //
      // If i is undefined, then the first child will be marked as such.
      //
      // If mulitple is truthy then all whitespace will be stripped out until non-whitespace
      // content is met.
      function omitRight(body, i, multiple) {
        var current = body[i == null ? 0 : i + 1];
        if (!current || current.type !== 'ContentStatement' || !multiple && current.rightStripped) {
          return;
        }

        var original = current.value;
        current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, '');
        current.rightStripped = current.value !== original;
      }

      // Marks the node to the left of the position as omitted.
      // I.e. ' '{{foo}} will mark the ' ' node as omitted.
      //
      // If i is undefined then the last child will be marked as such.
      //
      // If mulitple is truthy then all whitespace will be stripped out until non-whitespace
      // content is met.
      function omitLeft(body, i, multiple) {
        var current = body[i == null ? body.length - 1 : i - 1];
        if (!current || current.type !== 'ContentStatement' || !multiple && current.leftStripped) {
          return;
        }

        // We omit the last node if it's whitespace only and not preceeded by a non-content node.
        var original = current.value;
        current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, '');
        current.leftStripped = current.value !== original;
        return current.leftStripped;
      }

      exports['default'] = WhitespaceControl;
      module.exports = exports['default'];

      /***/ },
    /* 17 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      var _interopRequireDefault = __webpack_require__(8)['default'];

      exports.__esModule = true;
      exports.SourceLocation = SourceLocation;
      exports.id = id;
      exports.stripFlags = stripFlags;
      exports.stripComment = stripComment;
      exports.preparePath = preparePath;
      exports.prepareMustache = prepareMustache;
      exports.prepareRawBlock = prepareRawBlock;
      exports.prepareBlock = prepareBlock;

      var _Exception = __webpack_require__(12);

      var _Exception2 = _interopRequireDefault(_Exception);

      function SourceLocation(source, locInfo) {
        this.source = source;
        this.start = {
          line: locInfo.first_line,
          column: locInfo.first_column
        };
        this.end = {
          line: locInfo.last_line,
          column: locInfo.last_column
        };
      }

      function id(token) {
        if (/^\[.*\]$/.test(token)) {
          return token.substr(1, token.length - 2);
        } else {
          return token;
        }
      }

      function stripFlags(open, close) {
        return {
          open: open.charAt(2) === '~',
          close: close.charAt(close.length - 3) === '~'
        };
      }

      function stripComment(comment) {
        return comment.replace(/^\{\{~?\!-?-?/, '').replace(/-?-?~?\}\}$/, '');
      }

      function preparePath(data, parts, locInfo) {
        locInfo = this.locInfo(locInfo);

        var original = data ? '@' : '',
            dig = [],
            depth = 0,
            depthString = '';

        for (var i = 0, l = parts.length; i < l; i++) {
          var part = parts[i].part,

          // If we have [] syntax then we do not treat path references as operators,
          // i.e. foo.[this] resolves to approximately context.foo['this']
              isLiteral = parts[i].original !== part;
          original += (parts[i].separator || '') + part;

          if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
            if (dig.length > 0) {
              throw new _Exception2['default']('Invalid path: ' + original, { loc: locInfo });
            } else if (part === '..') {
              depth++;
              depthString += '../';
            }
          } else {
            dig.push(part);
          }
        }

        return new this.PathExpression(data, depth, dig, original, locInfo);
      }

      function prepareMustache(path, params, hash, open, strip, locInfo) {
        // Must use charAt to support IE pre-10
        var escapeFlag = open.charAt(3) || open.charAt(2),
            escaped = escapeFlag !== '{' && escapeFlag !== '&';

        return new this.MustacheStatement(path, params, hash, escaped, strip, this.locInfo(locInfo));
      }

      function prepareRawBlock(openRawBlock, content, close, locInfo) {
        if (openRawBlock.path.original !== close) {
          var errorNode = { loc: openRawBlock.path.loc };

          throw new _Exception2['default'](openRawBlock.path.original + ' doesn\'t match ' + close, errorNode);
        }

        locInfo = this.locInfo(locInfo);
        var program = new this.Program([content], null, {}, locInfo);

        return new this.BlockStatement(openRawBlock.path, openRawBlock.params, openRawBlock.hash, program, undefined, {}, {}, {}, locInfo);
      }

      function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
        // When we are chaining inverse calls, we will not have a close path
        if (close && close.path && openBlock.path.original !== close.path.original) {
          var errorNode = { loc: openBlock.path.loc };

          throw new _Exception2['default'](openBlock.path.original + ' doesn\'t match ' + close.path.original, errorNode);
        }

        program.blockParams = openBlock.blockParams;

        var inverse = undefined,
            inverseStrip = undefined;

        if (inverseAndProgram) {
          if (inverseAndProgram.chain) {
            inverseAndProgram.program.body[0].closeStrip = close.strip;
          }

          inverseStrip = inverseAndProgram.strip;
          inverse = inverseAndProgram.program;
        }

        if (inverted) {
          inverted = inverse;
          inverse = program;
          program = inverted;
        }

        return new this.BlockStatement(openBlock.path, openBlock.params, openBlock.hash, program, inverse, openBlock.strip, inverseStrip, close && close.strip, this.locInfo(locInfo));
      }

      /***/ },
    /* 18 */
    /***/ function(module, exports, __webpack_require__) {

      'use strict';

      exports.__esModule = true;
      /*global define */

      var _isArray = __webpack_require__(13);

      var SourceNode = undefined;

      try {
        /* istanbul ignore next */
        if (false) {
          // We don't support this in AMD environments. For these environments, we asusme that
          // they are running on the browser and thus have no need for the source-map library.
          var SourceMap = require('source-map');
          SourceNode = SourceMap.SourceNode;
        }
      } catch (err) {}

      /* istanbul ignore if: tested but not covered in istanbul due to dist build  */
      if (!SourceNode) {
        SourceNode = function (line, column, srcFile, chunks) {
          this.src = '';
          if (chunks) {
            this.add(chunks);
          }
        };
        /* istanbul ignore next */
        SourceNode.prototype = {
          add: function add(chunks) {
            if (_isArray.isArray(chunks)) {
              chunks = chunks.join('');
            }
            this.src += chunks;
          },
          prepend: function prepend(chunks) {
            if (_isArray.isArray(chunks)) {
              chunks = chunks.join('');
            }
            this.src = chunks + this.src;
          },
          toStringWithSourceMap: function toStringWithSourceMap() {
            return { code: this.toString() };
          },
          toString: function toString() {
            return this.src;
          }
        };
      }

      function castChunk(chunk, codeGen, loc) {
        if (_isArray.isArray(chunk)) {
          var ret = [];

          for (var i = 0, len = chunk.length; i < len; i++) {
            ret.push(codeGen.wrap(chunk[i], loc));
          }
          return ret;
        } else if (typeof chunk === 'boolean' || typeof chunk === 'number') {
          // Handle primitives that the SourceNode will throw up on
          return chunk + '';
        }
        return chunk;
      }

      function CodeGen(srcFile) {
        this.srcFile = srcFile;
        this.source = [];
      }

      CodeGen.prototype = {
        prepend: function prepend(source, loc) {
          this.source.unshift(this.wrap(source, loc));
        },
        push: function push(source, loc) {
          this.source.push(this.wrap(source, loc));
        },

        merge: function merge() {
          var source = this.empty();
          this.each(function (line) {
            source.add(['  ', line, '\n']);
          });
          return source;
        },

        each: function each(iter) {
          for (var i = 0, len = this.source.length; i < len; i++) {
            iter(this.source[i]);
          }
        },

        empty: function empty() {
          var loc = arguments[0] === undefined ? this.currentLocation || { start: {} } : arguments[0];

          return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
        },
        wrap: function wrap(chunk) {
          var loc = arguments[1] === undefined ? this.currentLocation || { start: {} } : arguments[1];

          if (chunk instanceof SourceNode) {
            return chunk;
          }

          chunk = castChunk(chunk, this, loc);

          return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
        },

        functionCall: function functionCall(fn, type, params) {
          params = this.generateList(params);
          return this.wrap([fn, type ? '.' + type + '(' : '(', params, ')']);
        },

        quotedString: function quotedString(str) {
          return '"' + (str + '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\u2028/g, '\\u2028') // Per Ecma-262 7.3 + 7.8.4
                  .replace(/\u2029/g, '\\u2029') + '"';
        },

        objectLiteral: function objectLiteral(obj) {
          var pairs = [];

          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              var value = castChunk(obj[key], this);
              if (value !== 'undefined') {
                pairs.push([this.quotedString(key), ':', value]);
              }
            }
          }

          var ret = this.generateList(pairs);
          ret.prepend('{');
          ret.add('}');
          return ret;
        },

        generateList: function generateList(entries, loc) {
          var ret = this.empty(loc);

          for (var i = 0, len = entries.length; i < len; i++) {
            if (i) {
              ret.add(',');
            }

            ret.add(castChunk(entries[i], this, loc));
          }

          return ret;
        },

        generateArray: function generateArray(entries, loc) {
          var ret = this.generateList(entries, loc);
          ret.prepend('[');
          ret.add(']');

          return ret;
        }
      };

      exports['default'] = CodeGen;
      module.exports = exports['default'];

      /* NOP */

      /***/ }
    /******/ ])
});
;


//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

define('hbs/underscore',[],function() {

  // Baseline setup
  // --------------

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) results.length = obj.length;
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.max.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0]) return Math.min.apply(Math, obj);
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var shuffled = [], rand;
    each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    var result = {};
    var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
    each(obj, function(value, index) {
      var key = iterator(value, index);
      (result[key] || (result[key] = [])).push(value);
    });
    return result;
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especcialy useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(shallow ? value : _.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    // The `isSorted` flag is irrelevant if the array only contains two elements.
    if (array.length < 3) isSorted = true;
    _.reduce(initial, function (memo, value, index) {
      if (isSorted ? _.last(memo) !== value || !memo.length : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays. (Aliased as "intersect" for back-compat.)
  _.intersection = _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = _.flatten(slice.call(arguments, 1), true);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (i in array && array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        result = func.apply(context, args);
      }
      whenDone();
      throttling = true;
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      if (immediate && !timeout) func.apply(context, args);
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(_.flatten(slice.call(arguments, 1)), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function.
  function eq(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  }

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return toString.call(obj) == '[object Arguments]';
  };
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given value a function?
  _.isFunction = function(obj) {
    return toString.call(obj) == '[object Function]';
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return toString.call(obj) == '[object String]';
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return toString.call(obj) == '[object Number]';
  };

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return toString.call(obj) == '[object Date]';
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return toString.call(obj) == '[object RegExp]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Has own property?
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return (''+string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g,'&#x2F;');
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\': '\\',
    "'": "'",
    'r': '\r',
    'n': '\n',
    't': '\t',
    'u2028': '\u2028',
    'u2029': '\u2029'
  };

  for (var p in escapes) escapes[escapes[p]] = p;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n_.escape(" + unescape(code) + ")+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n(" + unescape(code) + ")+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n;__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __p='';" +
      "var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for build time
    // precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' +
      source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var wrapped = this._wrapped;
      method.apply(wrapped, arguments);
      var length = wrapped.length;
      if ((name == 'shift' || name == 'splice') && length === 0) delete wrapped[0];
      return result(wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

    return _;

});
;
/*
    http://www.JSON.org/json2.js
    2011-10-19

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

(function (window){

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

// Return the window JSON element if it exists;
var JSON = window.JSON || {};

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

define('hbs/json2',[],function(){
    return JSON;
});
// otherwise just leave it alone
    
}).call(this, this);
;
/**
 * @license Handlebars hbs 2.0.0 - Alex Sexton, but Handlebars has its own licensing junk
 *
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/require-cs for details on the plugin this was based off of
 */

/* Yes, deliciously evil. */
/*jslint evil: true, strict: false, plusplus: false, regexp: false */
/*global require: false, XMLHttpRequest: false, ActiveXObject: false,
define: false, process: false, window: false */
define('hbs',[
  'hbs/handlebars', 'hbs/underscore', 'hbs/json2'
], function (
  Handlebars, _, JSON
) {
    function precompile(string, _unused, options) {
    var ast, environment;

    options = options || {};

    if (!('data' in options)) {
      options.data = true;
    }

    if (options.compat) {
      options.useDepths = true;
    }

    ast = Handlebars.parse(string);

    environment = new Handlebars.Compiler().compile(ast, options);
    return new Handlebars.JavaScriptCompiler().compile(environment, options);
  }

  var fs;
  var getXhr;
  var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
  var fetchText = function () {
      throw new Error('Environment unsupported.');
  };
  var buildMap = [];
  var filecode = 'w+';
  var templateExtension = 'hbs';
  var customNameExtension = '@hbs';
  var devStyleDirectory = '/styles/';
  var buildStyleDirectory = '/demo-build/styles/';
  var helperDirectory = 'templates/helpers/';
  var buildCSSFileName = 'screen.build.css';
  var onHbsReadMethod = "onHbsRead";

  Handlebars.registerHelper('$', function() {
    //placeholder for translation helper
  });

  if (typeof window !== 'undefined' && window.navigator && window.document && !window.navigator.userAgent.match(/Node.js/)) {
    // Browser action
    getXhr = function () {
      // Would love to dump the ActiveX crap in here. Need IE 6 to die first.
      var xhr;
      var i;
      var progId;
      if (typeof XMLHttpRequest !== 'undefined') {
        return ((arguments[0] === true)) ? new XDomainRequest() : new XMLHttpRequest();
      }
      else {
        for (i = 0; i < 3; i++) {
          progId = progIds[i];
          try {
            xhr = new ActiveXObject(progId);
          }
          catch (e) {}

          if (xhr) {
            // Faster next time
            progIds = [progId];
            break;
          }
        }
      }

      if (!xhr) {
          throw new Error('getXhr(): XMLHttpRequest not available');
      }

      return xhr;
    };

    // Returns the version of Windows Internet Explorer or a -1
    // (indicating the use of another browser).
    // Note: this is only for development mode. Does not run in production.
    getIEVersion = function(){
      // Return value assumes failure.
      var rv = -1;
      if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
        if (re.exec(ua) != null) {
          rv = parseFloat( RegExp.$1 );
        }
      }
      return rv;
    };

    fetchText = function (url, callback) {
      var xdm = false;
      // If url is a fully qualified URL, it might be a cross domain request. Check for that.
      // IF url is a relative url, it cannot be cross domain.
      if (url.indexOf('http') != 0 ){
          xdm = false;
      }else{
          var uidx = (url.substr(0,5) === 'https') ? 8 : 7;
          var hidx = (window.location.href.substr(0,5) === 'https') ? 8 : 7;
          var dom = url.substr(uidx).split('/').shift();
          var msie = getIEVersion();
              xdm = ( dom != window.location.href.substr(hidx).split('/').shift() ) && (msie >= 7);
      }

      if ( xdm ) {
         var xdr = getXhr(true);
        xdr.open('GET', url);
        xdr.onload = function() {
          callback(xdr.responseText, url);
        };
        xdr.onprogress = function(){};
        xdr.ontimeout = function(){};
        xdr.onerror = function(){};
        setTimeout(function(){
          xdr.send();
        }, 0);
      }
      else {
        var xhr = getXhr();
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function (evt) {
          //Do not explicitly handle errors, those should be
          //visible via console output in the browser.
          if (xhr.readyState === 4) {
            callback(xhr.responseText, url);
          }
        };
        xhr.send(null);
      }
    };

  }
  else if (
    typeof process !== 'undefined' &&
    process.versions &&
    !!process.versions.node
  ) {
    //Using special require.nodeRequire, something added by r.js.
    fs = require.nodeRequire('fs');
    fetchText = function ( path, callback ) {
      var body = fs.readFileSync(path, 'utf8') || '';
      // we need to remove BOM stuff from the file content
      body = body.replace(/^\uFEFF/, '');
      callback(body, path);
    };
  }
  else if (typeof java !== 'undefined' && typeof java.io !== 'undefined') {
    fetchText = function(path, callback) {
      var fis = new java.io.FileInputStream(path);
      var streamReader = new java.io.InputStreamReader(fis, "UTF-8");
      var reader = new java.io.BufferedReader(streamReader);
      var line;
      var text = '';
      while ((line = reader.readLine()) !== null) {
        text += new String(line) + '\n';
      }
      reader.close();
      callback(text, path);
    };
  }

  var cache = {};
  var fetchOrGetCached = function ( path, callback ){
    if ( cache[path] ){
      callback(cache[path]);
    }
    else {
      fetchText(path, function(data, path){
        cache[path] = data;
        callback.call(this, data);
      });
    }
  };
  var styleList = [];
  var styleMap = {};
  
  var config;
  var filesToRemove = [];

  return {

    get: function () {
      return Handlebars;
    },

    write: function (pluginName, name, write) {
      if ( (name + customNameExtension ) in buildMap) {
        var text = buildMap[name + customNameExtension];
        write.asModule(pluginName + '!' + name, text);
      }
    },

    version: '3.0.3',

    load: function (name, parentRequire, load, _config) {
            config = config || _config;

      var compiledName = name + customNameExtension;
      config.hbs = config.hbs || {};
      var disableHelpers = (config.hbs.helpers == false); // be default we enable helpers unless config.hbs.helpers is false
      var partialsUrl = '';
      if(config.hbs.partialsUrl) {
        partialsUrl = config.hbs.partialsUrl;
        if(!partialsUrl.match(/\/$/)) partialsUrl += '/';
      }

      // Let redefine default fetchText
      if(config.hbs.fetchText) {
          fetchText = config.hbs.fetchText;
      }

      var partialDeps = [];

      function recursiveNodeSearch( statements, res ) {
        _(statements).forEach(function ( statement ) {
          if ( statement && statement.type && statement.type === 'PartialStatement' ) {
          //Don't register dynamic partials as undefined
            if(statement.name.type !== "SubExpression"){
              res.push(statement.name.original);
            }
          }
          if ( statement && statement.program && statement.program.body ) {
            recursiveNodeSearch( statement.program.body, res );
          }
          if ( statement && statement.inverse && statement.inverse.body ) {
            recursiveNodeSearch( statement.inverse.body, res );
          }
        });
        return res;
      }

      // TODO :: use the parser to do this!
      function findPartialDeps( nodes , metaObj) {
      var res = [];
      if ( nodes && nodes.body ) {
        res = recursiveNodeSearch( nodes.body, [] );
      }

      if(metaObj && metaObj.partials && metaObj.partials.length){
        _(metaObj.partials).forEach(function ( partial ) {
          res.push(partial);
        });
      }

        return _.unique(res);
      }

      // See if the first item is a comment that's json
      function getMetaData( nodes ) {
        var statement, res, test;
        if ( nodes && nodes.body ) {
          statement = nodes.body[0];
          if ( statement && statement.type === 'CommentStatement' ) {
            try {
              res = ( statement.value ).replace(new RegExp('^[\\s]+|[\\s]+$', 'g'), '');
              test = JSON.parse(res);
              return res;
            }
            catch (e) {
              return JSON.stringify({
                description: res
              });
            }
          }
        }
        return '{}';
      }

      function composeParts ( parts ) {
        if ( !parts ) {
          return [];
        }
        var res = [parts[0]];
        var cur = parts[0];
        var i;

        for (i = 1; i < parts.length; ++i) {
          if ( parts.hasOwnProperty(i) ) {
            cur += '.' + parts[i];
            res.push( cur );
          }
        }
        return res;
      }

      //Taken from Handlebar.AST.helpers.helperExpression with slight modification
      function isHelper(statement){
        return !!(statement.type === 'SubExpression' || (statement.params && statement.params.length) || statement.hash);
      }

      function checkStatementForHelpers(statement, helpersres){

        if(isHelper(statement)){
          if(typeof statement.path !== 'undefined'){
            registerHelper(statement.path.original,helpersres);
          }
        }

        if(statement && statement.params){
          statement.params.forEach(function (param) {
            checkStatementForHelpers(param, helpersres);
          });
        }

        if(statement && statement.hash && statement.hash.pairs){
          _(statement.hash.pairs).forEach(function(pair) {
            checkStatementForHelpers(pair.value, helpersres);
          });
        }
      }

      function registerHelper(helperName,helpersres){
        if(typeof Handlebars.helpers[helperName] === 'undefined'){
          helpersres.push(helperName);
        }
      }

      function recursiveVarSearch( statements, res, prefix, helpersres ) {
        prefix = prefix ? prefix + '.' : '';

        var  newprefix = '';
        var flag = false;

        // loop through each statement
        _(statements).forEach(function(statement) {
          var parts;
          var part;
          var sideways;

          //Its a helper or a mustache statement
          if (isHelper(statement) || statement.type === 'MustacheStatement') {
            checkStatementForHelpers(statement, helpersres);
          }

          // If it's a meta block, not sure what this is. It should probably never happen
          if ( statement && statement.mustache  ) {
            recursiveVarSearch( [statement.mustache], res, prefix + newprefix, helpersres );
          }

          // if it's a whole new program
          if ( statement && statement.program && statement.program.body ) {
            sideways = recursiveVarSearch([statement.path],[], '', helpersres)[0] || '';
            if ( statement.inverse && statement.inverse.body ) {
             recursiveVarSearch( statement.inverse.body, res, prefix + newprefix + (sideways ? (prefix+newprefix) ? '.'+sideways : sideways : ''), helpersres);
            }
            recursiveVarSearch( statement.program.body, res, prefix + newprefix + (sideways ? (prefix+newprefix) ? '.'+sideways : sideways : ''), helpersres);
          }
        });
        return res;
      }

      // This finds the Helper dependencies since it's soooo similar
      function getExternalDeps( nodes ) {
        var res   = [];
        var helpersres = [];

        if ( nodes && nodes.body ) {
          res = recursiveVarSearch( nodes.body, [], undefined, helpersres );
        }

        var defaultHelpers = [
          'helperMissing',
          'blockHelperMissing',
          'each',
          'if',
          'unless',
          'with',
          'log',
          'lookup'
        ];

        return {
          vars: _(res).chain().unique().map(function(e) {
            if ( e === '' ) {
              return '.';
            }
            if ( e.length && e[e.length-1] === '.' ) {
              return e.substr(0,e.length-1) + '[]';
            }
            return e;
          }).value(),

          helpers: _(helpersres).chain().unique().map(function(e){
            if ( _(defaultHelpers).contains(e) ) {
              return undefined;
            }
            return e;
          }).compact().value()
        };
      }

      function cleanPath(path) {
        var tokens = path.split('/');
        for(var i=0;i<tokens.length; i++) {
          if(tokens[i] === '..') {
            delete tokens[i-1];
            delete tokens[i];
          } else if (tokens[i] === '.') {
            delete tokens[i];
          }
        }
        return tokens.join('/').replace(/\/\/+/g,'/');
      }

      function fetchAndRegister(langMap) {
          fetchText(path, function(text, path) {

          var readCallback = (config.isBuild && config[onHbsReadMethod]) ? config[onHbsReadMethod]:  function(name,path,text){return text} ;
          // for some reason it doesn't include hbs _first_ when i don't add it here...
          var nodes = Handlebars.parse( readCallback(name, path, text));
          var meta = getMetaData( nodes );
          var extDeps = getExternalDeps( nodes );
          var vars = extDeps.vars;
          var helps = (extDeps.helpers || []);
          var debugOutputStart = '';
          var debugOutputEnd   = '';
          var debugProperties = '';
          var deps = [];
          var depStr, helpDepStr, metaObj, head, linkElem;
          var baseDir = name.substr(0,name.lastIndexOf('/')+1);

          if(meta !== '{}') {
            try {
              metaObj = JSON.parse(meta);
            } catch(e) {
              console.log('couldn\'t parse meta for %s', path);
            }
          }
          var partials = findPartialDeps( nodes,metaObj );
          config.hbs = config.hbs || {};
          config.hbs._partials = config.hbs._partials || {};

          for ( var i in partials ) {
            if ( partials.hasOwnProperty(i) && typeof partials[i] === 'string') {  // make sure string, because we're iterating over all props
              var partialReference = partials[i];

              var partialPath;
              if(partialReference.match(/^(\.|\/)+/)) {
                // relative path
                partialPath = cleanPath(baseDir + partialReference);
              }
              else {
                // absolute path relative to config.hbs.partialsUrl if defined
                partialPath = cleanPath(partialsUrl + partialReference);
              }

              // check for recursive partials
              if (omitExtension) {
                if(path === parentRequire.toUrl(partialPath)) {
                  continue;
                }
              } else {
                if(path === parentRequire.toUrl(partialPath +'.'+ (config.hbs && config.hbs.templateExtension ? config.hbs.templateExtension : templateExtension))) {
                  continue;
                }
              }

              config.hbs._partials[partialPath] = config.hbs._partials[partialPath] || [];

              // we can reference a same template with different paths (with absolute or relative)
              config.hbs._partials[partialPath].references = config.hbs._partials[partialPath].references || [];
              config.hbs._partials[partialPath].references.push(partialReference);

              config.hbs._loadedDeps = config.hbs._loadedDeps || {};

              deps[i] = "hbs!"+partialPath;
            }
          }

          depStr = deps.join("', '");

          helps = helps.concat((metaObj && metaObj.helpers) ? metaObj.helpers : []);
          helpDepStr = disableHelpers ?
            '' : (function (){
              var i;
              var paths = [];
              var pathGetter = config.hbs && config.hbs.helperPathCallback
                ? config.hbs.helperPathCallback
                : function (name){
                  return (config.hbs && config.hbs.helperDirectory ? config.hbs.helperDirectory : helperDirectory) + name;
                };

              for ( i = 0; i < helps.length; i++ ) {
                paths[i] = "'" + pathGetter(helps[i], path) + "'"
              }
              return paths;
            })().join(',');

          if ( helpDepStr ) {
            helpDepStr = ',' + helpDepStr;
          }

          if (metaObj) {
            try {
              if (metaObj.styles) {
                styleList = _.union(styleList, metaObj.styles);

                // In dev mode in the browser
                if ( require.isBrowser && ! config.isBuild ) {
                  head = document.head || document.getElementsByTagName('head')[0];
                  _(metaObj.styles).forEach(function (style) {
                    if ( !styleMap[style] ) {
                      linkElem = document.createElement('link');
                      linkElem.href = config.baseUrl + devStyleDirectory + style + '.css';
                      linkElem.media = 'all';
                      linkElem.rel = 'stylesheet';
                      linkElem.type = 'text/css';
                      head.appendChild(linkElem);
                      styleMap[style] = linkElem;
                    }
                  });
                }
                else if ( config.isBuild ) {
                  (function(){
                    var fs  = require.nodeRequire('fs');
                    var str = _(metaObj.styles).map(function (style) {
                      if (!styleMap[style]) {
                        styleMap[style] = true;
                        return '@import url('+style+'.css);\n';
                      }
                      return '';
                    }).join('\n');

                    // I write out my import statements to a file in order to help me build stuff.
                    // Then I use a tool to inline my import statements afterwards. (you can run r.js on it too)
                    fs.open(__dirname + buildStyleDirectory + buildCSSFileName, filecode, '0666', function( e, id ) {
                      fs.writeSync(id, str, null, encoding='utf8');
                      fs.close(id);
                    });
                    filecode = 'a';
                  })();
                }
              }
            }
            catch(e){
              console.log('error injecting styles');
            }
          }

          if ( ! config.isBuild && ! config.serverRender ) {
            debugOutputStart = '<!-- START - ' + name + ' -->';
            debugOutputEnd = '<!-- END - ' + name + ' -->';
            debugProperties = 't.meta = ' + meta + ';\n' +
                              't.helpers = ' + JSON.stringify(helps) + ';\n' +
                              't.deps = ' + JSON.stringify(deps) + ';\n' +
                              't.vars = ' + JSON.stringify(vars) + ';\n';
          }

          var mapping = false;
          var configHbs = config.hbs || {};
          var options = _.extend(configHbs.compileOptions || {}, { originalKeyFallback: configHbs.originalKeyFallback });
          var prec = precompile( text, mapping, options);
          var tmplName = "'hbs!" + name + "',";

          if(depStr) depStr = ", '"+depStr+"'";

          var partialReferences = [];
          if(config.hbs._partials[name])
            partialReferences = config.hbs._partials[name].references;

          var handlebarsPath = (config.hbs && config.hbs.handlebarsPath) ? config.hbs.handlebarsPath : 'hbs/handlebars';

          text = '/* START_TEMPLATE */\n' +
                 'define('+tmplName+"['hbs','"+handlebarsPath+"'"+depStr+helpDepStr+'], function( hbs, Handlebars ){ \n' +
                   'var t = Handlebars.template(' + prec + ');\n' +
                   "Handlebars.registerPartial('" + name + "', t);\n";

          for(var i=0; i<partialReferences.length;i++)
            text += "Handlebars.registerPartial('" + partialReferences[i] + "', t);\n";

          text += debugProperties +
                   'return t;\n' +
                 '});\n' +
                 '/* END_TEMPLATE */\n';

          //Hold on to the transformed text if a build.
          if (config.isBuild) {
            buildMap[compiledName] = text;
          }

          //IE with conditional comments on cannot handle the
          //sourceURL trick, so skip it if enabled.
          /*@if (@_jscript) @else @*/
          if (!config.isBuild) {
            text += '\r\n//# sourceURL=' + path;
          }
          /*@end@*/

          if ( !config.isBuild ) {
            parentRequire( deps, function (){
              load.fromText(text);

              //Give result to load. Need to wait until the module
              //is fully parse, which will happen after this
              //execution.
              parentRequire([name], function (value) {
                load(value);
              });
            });
          }
          else {
            load.fromText(name, text);

            //Give result to load. Need to wait until the module
            //is fully parse, which will happen after this
            //execution.
            parentRequire([name], function (value) {
              load(value);
            });
          }

          if ( config.removeCombined && path ) {
            filesToRemove.push(path);
          }

        });
      }

      var path;
      var omitExtension = config.hbs && config.hbs.templateExtension === false;

      if (omitExtension) {
        path = parentRequire.toUrl(name);
      }
      else {
        path = parentRequire.toUrl(name +'.'+ (config.hbs && config.hbs.templateExtension ? config.hbs.templateExtension : templateExtension));
      }

      fetchAndRegister(false);
          },

    onLayerEnd: function () {
      if (config.removeCombined && fs) {
        filesToRemove.forEach(function (path) {
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        });
      }
    }
  };
});
/* END_hbs_PLUGIN */
;

/* START_TEMPLATE */
define('hbs!404',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<!doctype html>\n<html>\n<head>\n  <link rel=\"preload\" href=\"./styles/css/styles.css\" as=\"style\">\n  <link rel=\"stylesheet\" href=\"./styles/css/styles.css\">\n  <script src=\"//cdnjs.cloudflare.com/ajax/libs/require.js/2.3.5/require.min.js\"></script>\n  <script>\n    !window.requirejs && document.write('<script src=\"./libs/requirejs/require.js\">\\x3C/script>');\n  </script>\n  <script>\n    require.config({\n      paths: {\n        'underscore': '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.2/lodash.min',\n        'google-analytics': [\n          'libs/g',\n          'data:application/javascript,'\n        ],\n        'analytics': 'js/components/analytics',\n        'jquery': '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min'\n      },\n      shim: {\n        'google-analytics': {\n          exports: '__ga__'\n        }\n      },\n      callback: function () {\n        window.GoogleAnalyticsObject = '__ga__';\n\n        require(['config/discovery.vars'], function(config) {\n          setTimeout(function () {\n            require(['google-analytics', 'analytics'], function () {\n              var qa = window[window.GoogleAnalyticsObject];\n              qa.l = Date.now();\n              qa('create', config.googleTrackingCode || '', config.googleTrackingOptions);\n            });\n          }, 0);\n        });\n      }\n    });\n    require(['analytics'], function (analytics) {\n      analytics('send', 'pageview');\n      analytics('send', 'event', 'error', 'automatic_redirection', '404.html');\n    });\n  </script>\n</head>\n<body>\n  <div>\n    <p> Bumblebee failed to load. Please try again.</p>\n  </div>\n</body>\n</html>\n";
},"useData":true});
Handlebars.registerPartial('404', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
define('hbs!js/apps/discovery/templates/orcid-modal-template',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "\n    <p>\n        If you <strong>wish for your ORCID claims to be accessible in the ADS,</strong> please first\n        <a href=\"#user/settings/orcid\">fill out this brief form. </a>\n    </p>\n\n    <p>\n        After you have completed the form, you can immediately begin claiming papers.\n    </p>\n\n\n";
},"3":function(depth0,helpers,partials,data) {
    return "\n    <p>\n        If you <strong>want your ORCID claims to be accessible in the ADS,</strong>\n        please sign in to ADS or create an account and provide us with your permission to\n        make your claims public, along with a few other key pieces of information.\n\n    </p>\n    <p>\n        <a href=\"#user/account/login\" class=\"btn btn-primary\">log in to ADS </a>\n        or\n        <a href=\"#user/account/register\" class=\"btn btn-primary\">create a new account</a>\n\n    </p>\n    <p>\n        After you are signed in to your account, go to the \"User Preferences\" page,\n        click on the \"ORCID Settings\" tab, and fill in the brief form.\n    </p>\n\n\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.adsLoggedIn : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "\n<p>\n    <b>If you don't care about your information being searchable in the ADS, just close this message and continue.</b>\n</p>";
},"useData":true});
Handlebars.registerPartial('js/apps/discovery/templates/orcid-modal-template', t);
return t;
});
/* END_TEMPLATE */
;
define('js/mixins/api_access',['underscore', 'backbone', 'js/components/api_query', 'js/components/api_request'], function (_, Backbone, ApiQuery, ApiRequest) {
  /*
   * this simple mixin contacts the api (getApiAccess), and if the {reconnect: true} option
   * is passed to getApiAccess, will save the relevant data.
   * */
  return {
    /**
     * After bootstrap receives all data, this routine should decide what to do with
     * them
     */
    onBootstrap: function onBootstrap(data) {
      var beehive = this.getBeeHive(); // set the API key and other data from bootstrap

      if (data.access_token) {
        beehive.getService('Api').setVals({
          access_token: data.token_type + ':' + data.access_token,
          refresh_token: data.refresh_token,
          expire_in: data.expire_in
        });
        console.warn('Redefining access_token: ' + data.access_token);
        var userObject = beehive.getObject('User');
        var userName = data.anonymous ? undefined : data.username;
        userObject.setUser(userName);
        var storage = beehive.getService('PersistentStorage');
        storage && storage.set && storage.set('appConfig', data);
      } else {
        console.warn("bootstrap didn't provide access_token!");
      }
    },
    getApiAccess: function getApiAccess(options) {
      options = options || {};
      var api = this.getBeeHive().getService('Api');
      var self = this;
      var defer = $.Deferred(); // if token expired, make a _request

      var request = options.tokenRefresh ? '_request' : 'request';
      api[request](new ApiRequest({
        query: new ApiQuery(),
        target: this.bootstrapUrls ? this.bootstrapUrls[0] : '/accounts/bootstrap'
      }), {
        done: function done(data) {
          if (options.reconnect) {
            self.onBootstrap(data);
          }

          defer.resolve(data);
        },
        fail: function fail() {
          defer.reject.apply(defer, arguments);
        },
        type: 'GET'
      });
      return defer;
    }
  };
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * The main 'navigation' endpoints (the part executed inside
 * the application) - this is a companion to the 'router'
 */
define('js/apps/discovery/navigator',['jquery', 'backbone', 'underscore', 'js/components/navigator', 'js/components/api_feedback', 'js/components/api_query_updater', 'js/components/json_response', 'js/components/api_query', 'js/components/api_request', 'js/components/api_targets', 'hbs!404', 'hbs!js/apps/discovery/templates/orcid-modal-template', 'js/mixins/api_access', 'react-redux'], function ($, Backbone, _, Navigator, ApiFeedback, ApiQueryUpdater, JsonResponse, ApiQuery, ApiRequest, ApiTargets, ErrorTemplate, OrcidModalTemplate, ApiAccessMixin, ReactRedux) {
  var NavigatorService = Navigator.extend({
    start: function start(app) {
      /**
       * These 'transitions' are what happens inside 'discovery' application
       *
       * As a convention, navigation events are all lowercase, and widgets/page managers
       * are CamelCase (for example the table of contents menu on the left side of the
       * abstract/detail page is triggering navigation events using just the name of
       * the widget, e.g. ShowReferences - when References tab was selected)
       *
       */
      var self = this;
      var queryUpdater = new ApiQueryUpdater('navigator');

      var publishFeedback = function publishFeedback(data) {
        self.getPubSub().publish(self.getPubSub().FEEDBACK, new ApiFeedback(data));
      }; // right now, user navbar widget depends on this to show the correct highlighted pill


      var publishPageChange = function publishPageChange(pageName) {
        self.getPubSub().publish(self.getPubSub().PAGE_CHANGE, pageName);
      };

      var searchPageAlwaysVisible = ['Results', 'MyAdsFreeform', 'QueryInfo', 'AffiliationFacet', 'AuthorFacet', 'DatabaseFacet', 'RefereedFacet', 'KeywordFacet', 'BibstemFacet', 'BibgroupFacet', 'DataFacet', 'ObjectFacet', 'NedObjectFacet', 'VizierFacet', 'GraphTabs', 'QueryDebugInfo', 'ExportDropdown', 'VisualizationDropdown', 'SearchWidget', 'Sort', 'BreadcrumbsWidget', 'PubtypeFacet', 'OrcidSelector'];
      var detailsPageAlwaysVisible = ['TOCWidget', 'SearchWidget', 'ShowResources', 'ShowAssociated', 'ShowGraphicsSidebar', 'ShowLibraryAdd', 'MetaTagsWidget'];

      function redirectIfNotSignedIn(next) {
        var loggedIn = app.getBeeHive().getObject('User').isLoggedIn();

        if (!loggedIn) {
          // redirect to authentication page
          app.getService('Navigator').navigate('authentication-page', {
            subView: 'login',
            redirect: true,
            next: next
          });
          return true;
        }

        return false;
      }

      function makeProxyHandler(id) {
        return function () {
          var proxy = self.get(id);
          var args = Array.prototype.slice.call(arguments, 1);
          return proxy.execute.apply(proxy, [id].concat(args));
        };
      }

      this.set('index-page', function (data) {
        var that = this;
        var defer = $.Deferred();
        app.getObject('MasterPageManager').show('LandingPage', ['SearchWidget', 'RecommenderWidget']).then(function () {
          return app.getWidget('LandingPage').then(function (widget) {
            if (data && data.origin === 'SearchWidget') {
              // we know it came from the searchWidget handler, so call it without extra params
              widget.setActive('SearchWidget');
            } else {
              // only set the origin flag if we know it wasn't a redirect from the other handler (SearchWidget)
              widget.setActive('SearchWidget', null, {
                origin: 'index-page'
              });
            }

            that.route = '';
            that.title = '';
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('SearchWidget', function () {
        // you must set a route within the function, even if you are calling
        // another function that sets a route
        var that = this;
        var defer = $.Deferred();

        var exec = _.bind(self.get('index-page').execute, this, {
          origin: 'SearchWidget'
        });

        exec().then(function () {
          that.route = '';
          that.title = '';
          defer.resolve();
        });
        return defer.promise();
      });
      this.set('404', function () {
        var defer = $.Deferred();
        var that = this;
        app.getObject('MasterPageManager').show('ErrorPage').then(function () {
          that.route = '404';
          that.replace = true;
          defer.resolve();
        });
        return defer.promise();
      });
      this.set('ClassicSearchForm', function (widgetName, _ref) {
        var query = _ref.query;
        var defer = $.Deferred();
        var that = this;
        app.getObject('MasterPageManager').show('LandingPage', [widgetName]).then(function () {
          app.getWidget('LandingPage').done(function (widget) {
            widget.setActive(widgetName);
            widget.widgets[widgetName].applyQueryParams(query);
          });
          that.route = '#classic-form';
          that.title = 'Classic Form';
          defer.resolve();
        });
        return defer.promise();
      });
      this.set('PaperSearchForm', function () {
        var defer = $.Deferred();
        var that = this;
        app.getObject('MasterPageManager').show('LandingPage', ['PaperSearchForm']).then(function () {
          app.getWidget('LandingPage').done(function (widget) {
            widget.setActive('PaperSearchForm');
          });
          that.route = '#paper-form';
          that.title = 'Paper Form';
          defer.resolve();
        });
        return defer.promise();
      });
      this.set('LibraryImport', function (page, data) {
        var defer = $.Deferred();
        var that = this;

        if (redirectIfNotSignedIn(that.endpoint)) {
          defer.resolve();
          return defer.promise();
        }

        app.getObject('MasterPageManager').show('SettingsPage', ['LibraryImport', 'UserNavbarWidget']).then(function () {
          app.getWidget('SettingsPage').done(function (widget) {
            widget.setActive('LibraryImport');
            that.route = '#user/settings/libraryimport';
            that.title = 'Library Import';
            publishPageChange('settings-page');
            defer.resolve();
          });
        });
        return defer.promise();
      });

      function settingsPreferencesView(widgetName, defaultView, title) {
        return function (page, data) {
          var defer = $.Deferred();
          var that = this;

          if (redirectIfNotSignedIn(that.endpoint)) {
            defer.resolve();
            return defer.promise();
          }

          var subView = data.subView || defaultView;

          if (!subView) {
            console.error('no subview or default view provided /' + 'to the navigator function!');
          }

          app.getObject('MasterPageManager').show('SettingsPage', [widgetName, 'UserNavbarWidget']).then(function () {
            app.getWidget('SettingsPage').done(function (widget) {
              widget.setActive(widgetName, subView);
            });
            that.route = '#user/settings/' + subView;
            that.title = 'Settings' + (title ? ' | ' + title : '');
            publishPageChange('settings-page');
            defer.resolve();
          });
          return defer.promise();
        };
      } // request for the widget


      this.set('UserSettings', settingsPreferencesView('UserSettings', undefined)); // request for the widget

      this.set('UserPreferences', settingsPreferencesView('UserPreferences', 'application', 'Application Settings'));
      this.set('MyAdsDashboard', function () {
        var defer = $.Deferred();
        var that = this;

        if (redirectIfNotSignedIn(that.endpoint)) {
          defer.resolve();
          return defer.promise();
        }

        app.getObject('MasterPageManager').show('SettingsPage', ['MyAdsDashboard', 'UserNavbarWidget']).then(function () {
          app.getWidget('SettingsPage').done(function (widget) {
            widget.setActive('MyAdsDashboard');
            that.route = '#user/settings/myads';
            that.title = 'myADS Notifications';
            publishPageChange('settings-page');
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('LibraryActionsWidget', function () {
        var $dd = $.Deferred();
        var that = this;

        if (redirectIfNotSignedIn(that.endpoint)) {
          return $dd.resolve().promise();
        }

        app.getObject('MasterPageManager').show('LibrariesPage', ['LibraryActionsWidget', 'UserNavbarWidget']).then(function () {
          app.getWidget('LibraryActionsWidget').done(function (widget) {
            widget.reset();
            that.route = '#user/libraries/actions';
            publishPageChange('libraries-page');
            $dd.resolve();
          });
        });
        return $dd.promise();
      });
      this.set('AllLibrariesWidget', function (widget, subView) {
        var defer = $.Deferred();
        var that = this;

        if (redirectIfNotSignedIn(that.endpoint)) {
          defer.resolve();
          return defer.promise();
        }

        var subView = subView || 'libraries';
        app.getObject('MasterPageManager').show('LibrariesPage', ['AllLibrariesWidget', 'UserNavbarWidget']).then(function () {
          app.getWidget('AllLibrariesWidget').done(function (widget) {
            widget.setSubView({
              view: subView
            });
            widget.reset();
            that.route = '#user/libraries/';
            that.title = 'My Libraries';
            publishPageChange('libraries-page');
          });
          defer.resolve();
        });
        return defer.promise();
      });
      this.set('LibraryAdminView', function (widget) {
        var defer = $.Deferred();
        var that = this; // this is NOT navigable from outside, so library already has data
        // only setting a nav event to hide previous widgets

        app.getObject('MasterPageManager').show('LibrariesPage', ['IndividualLibraryWidget', 'UserNavbarWidget']).then(function () {
          app.getWidget('IndividualLibraryWidget').done(function (widget) {
            widget.setSubView({
              subView: 'admin'
            });
          });
          publishPageChange('libraries-page');
          defer.resolve();
        });
        return defer.promise();
      });
      this.set('IndividualLibraryWidget', function (widget, data) {
        var defer = $.Deferred();
        var that = this; // data in form of { subView: subView, id: id, publicView: false }

        data.publicView = data.publicView ? data.publicView : false; // only check for logged in user if not public library

        if (!data.publicView && redirectIfNotSignedIn(that.endpoint)) {
          return defer.resolve().promise();
        }

        this.route = data.publicView ? '#public-libraries/' + data.id : '#user/libraries/' + data.id;
        var pub = data.publicView;
        app.getObject('MasterPageManager').show(pub ? 'PublicLibrariesPage' : 'LibrariesPage', pub ? ['IndividualLibraryWidget', 'LibraryListWidget'] : ['IndividualLibraryWidget', 'LibraryListWidget', 'UserNavbarWidget']).then(function () {
          app.getObject('LibraryController').getLibraryMetadata(data.id).done(function (metadata) {
            data.editRecords = _.contains(['write', 'admin', 'owner'], metadata.permission) && !data.publicView;
            that.title = data.publicView ? 'Public' : 'Private' + ' Library | ' + metadata.name;
            app.getWidget('LibraryListWidget', 'IndividualLibraryWidget').then(function (w) {
              w['LibraryListWidget'].setData(data);
              w['IndividualLibraryWidget'].setSubView(data);

              if (pub) {
                publishPageChange('libraries-page');
              }

              defer.resolve();
            });
            app.getWidget('Library');
          });
        });
        return defer.promise();
      }); // for external widgets shown by library

      function navToLibrarySubView(widget, data) {
        var defer = $.Deferred();
        var that = this; // actual name of widget to be shown in main area

        var widgetName = data.widgetName; // additional info that the renderWidgetForListOfBibcodes function might need (only used by export right now)

        var additional = data.additional;
        var format = additional.format || 'bibtex'; // tab description for library widget

        var subView = data.subView; // id of library being shown

        var id = data.id;
        var publicView = data.publicView; // Author-affiliation has a specific widget

        if (widgetName === 'ExportWidget' && format === 'authoraff') {
          widgetName = 'AuthorAffiliationTool';
        }

        function renderLibrarySub(id) {
          var defer = $.Deferred();
          app.getObject('LibraryController').getLibraryBibcodes(id).done(function (bibcodes) {
            // XXX - this was async in the original version; likely wrong
            // one block should be main...
            app.getWidget('LibraryListWidget').then(function (listWidget) {
              var sort = listWidget.model.get('sort');
              app.getWidget(widgetName).then(function (subWidget) {
                additional = _.extend({}, additional, {
                  sort: sort
                });
                subWidget.renderWidgetForListOfBibcodes(bibcodes, additional);
                app.getWidget('IndividualLibraryWidget').then(function (indWidget) {
                  indWidget.setSubView({
                    subView: subView,
                    publicView: publicView,
                    id: id
                  });
                  defer.resolve();
                });
              });
            });
          });
          return defer.promise();
        } // clear current data


        app.getWidget(widgetName).done(function (widget) {
          if (widget.reset) widget.reset();else if (widget.resetWidget) widget.resetWidget();
        }).done(function () {
          // just stick the empty views in there, otherwise the interface lags as the lib controller
          // paginates through the library bibcodes
          if (!(widgetName === 'ExportWidget' && format === 'classic')) {
            // export to classic opens a new tab, nothing to update here
            if (publicView) {
              app.getObject('MasterPageManager').show('PublicLibrariesPage', ['IndividualLibraryWidget', widgetName]).then(function () {
                renderLibrarySub(id).done(function () {
                  that.route = '#public-libraries/' + data.id; // XXX:rca - i think this should be that.route

                  defer.resolve();
                });
              });
            } else {
              app.getObject('MasterPageManager').show('LibrariesPage', ['IndividualLibraryWidget', 'UserNavbarWidget', widgetName]).then(function () {
                renderLibrarySub(id).done(function () {
                  that.route = '#user/libraries/' + data.id;
                  publishPageChange('libraries-page');
                  defer.resolve();
                });
              });
            }
          } else {
            defer.resolve();
          }
        });
        return defer.promise();
      } // end navToLibrarySubview


      this.set('library-export', navToLibrarySubView);
      this.set('library-visualization', navToLibrarySubView);
      this.set('library-metrics', navToLibrarySubView);
      this.set('library-citation_helper', navToLibrarySubView);
      this.set('home-page', function () {
        var defer = $.Deferred();
        var that = this;

        if (redirectIfNotSignedIn(that.endpoint)) {
          return defer.resolve().promise();
        }

        app.getObject('MasterPageManager').show('HomePage', []).then(function () {
          publishPageChange('home-page');
          that.title = 'Home';
          that.route = '#user/home';
          defer.resolve();
        });
        return defer.promise();
      });
      this.set('authentication-page', function (page, data) {
        var defer = $.Deferred();
        var data = data || {},
            subView = data.subView || 'login',
            loggedIn = app.getBeeHive().getObject('User').isLoggedIn(),
            that = this;

        if (loggedIn) {
          // redirect to index
          self.get('index-page').execute().then(function () {
            defer.resolve();
          });
        } else {
          // redirect will be set if we are redirecting from an internal page
          if (data.redirect) {
            that.replace = true;
          }

          app.getObject('MasterPageManager').show('AuthenticationPage', ['Authentication']).then(function () {
            app.getWidget('Authentication').done(function (w) {
              if (data.next) {
                w.setNextNavigation(data.next);
              }

              w.setSubView(subView);
              that.route = '#user/account/' + subView;
              that.title = subView === 'login' ? 'Sign In' : 'Register';
              defer.resolve();
            });
          });
        }

        return defer.promise();
      });
      this.set('results-page', function (widget, args) {
        var that = this;
        var defer = $.Deferred();
        app.getObject('MasterPageManager').show('SearchPage', searchPageAlwaysVisible).done(function () {
          // allowing widgets to override appstorage query (so far only used for orcid redirect)
          // XXX:rca - not sure I understand why
          var q = app.getObject('AppStorage').getCurrentQuery();

          if (q && q.get('__original_url')) {
            var route = '#search/' + q.get('__original_url');
            q.unset('__original_url');
          } else {
            var route = '#search/' + queryUpdater.clean(q).url();
          } // XXX:rca why here and not inside mediator???
          // update the pagination of the results widget


          if (q instanceof ApiQuery) {
            var update = {};

            var par = function par(str) {
              if (_.isString(str)) {
                try {
                  return parseInt(str);
                } catch (e) {// do nothing
                }
              }

              return false;
            };

            if (q.has('p_')) {
              var page = par(q.get('p_')[0]);
              update.page = page;
            } else {
              route += '&p_=0';
            }

            if (!_.isEmpty(update)) {
              app.getWidget('Results').then(function (w) {
                if (_.isFunction(w.updatePagination)) {
                  w.updatePagination(update);
                }
              });
            }
          } // taking care of inserting bigquery key here, not sure if right place
          // clean(q) above got rid of qid key, reinsert it


          if (q && q.get('__qid')) {
            route += '&__qid=' + q.get('__qid')[0];
          }

          that.title = q && q.get('q').length && q.get('q')[0];
          that.route = route;
          publishFeedback({
            code: ApiFeedback.CODES.UNMAKE_SPACE
          });
          defer.resolve();
        });
        return defer.promise();
      });
      this.set('export', function (nav, options) {
        var defer = $.Deferred();
        var format = options.format || 'bibtex';
        var storage = app.getObject('AppStorage');
        app.getObject('MasterPageManager').show('SearchPage', ['ExportWidget'].concat(searchPageAlwaysVisible.slice(1))).then(function () {
          app.getWidget('ExportWidget').done(function (widget) {
            if (format === 'authoraff') {
              if (options.onlySelected && storage.hasSelectedPapers()) {
                widget.getAuthorAffForm({
                  bibcodes: storage.getSelectedPapers()
                });
              } else {
                widget.getAuthorAffForm({
                  currentQuery: storage.getCurrentQuery()
                });
              }

              return;
            } // first, open central panel


            publishFeedback({
              code: ApiFeedback.CODES.MAKE_SPACE
            }); // is a special case, it opens in a new tab

            if (options.onlySelected && storage.hasSelectedPapers()) {
              widget.renderWidgetForListOfBibcodes(storage.getSelectedPapers(), {
                format: format,
                sort: storage.hasCurrentQuery() && storage.getCurrentQuery().get('sort')[0]
              });
            } // all records specifically requested
            else if (options.onlySelected === false && storage.hasCurrentQuery()) {
                widget.renderWidgetForCurrentQuery({
                  format: format,
                  currentQuery: storage.getCurrentQuery(),
                  numFound: storage.get('numFound')
                });
              } // no request for selected or not selected, show selected
              else if (options.onlySelected === undefined && storage.hasSelectedPapers()) {
                  widget.renderWidgetForListOfBibcodes(storage.getSelectedPapers(), {
                    format: format
                  });
                } // no selected, show all papers
                else if (storage.hasCurrentQuery()) {
                    widget.exportQuery({
                      format: format,
                      currentQuery: storage.getCurrentQuery(),
                      numFound: storage.get('numFound')
                    });
                  } else {
                    var alerts = app.getController('AlertsController');
                    alerts.alert({
                      msg: 'There are no records to export yet (please search or select some)'
                    });
                    self.get('results-page')(); // XXX:rca - .execute?, also
                  }
          }).done(function () {
            defer.resolve(); // XXX:rca - may cause problem when 'results-page' gets called
          });
        });
        return defer.promise();
      });
      this.set('export-query', function () {
        var defer = $.Deferred();
        var api = app.getService('Api');
        var q = app.getObject('AppStorage').getCurrentQuery();
        var alerter = app.getController('AlertsController'); // TODO: modify filters (move them to the main q)

        q = new ApiQuery({
          query: q.url()
        }); // save the query / obtain query id

        api.request(new ApiRequest({
          query: q,
          target: ApiTargets.MYADS_STORAGE + '/query',
          options: {
            done: function done() {},
            type: 'POST',
            xhrFields: {
              withCredentials: false
            }
          }
        })).done(function (data) {
          alerter.alert(new ApiFeedback({
            code: ApiFeedback.CODES.ALERT,
            msg: 'The query has been saved. You can insert the following snippet in a webpage: <br/>' + '<img src="' + ApiTargets.MYADS_STORAGE + '/query2svg/' + data.qid + '"></img><br/>' + '<br/><textarea rows="10" cols="50">' + '<a href="' + location.protocol + '//' + location.host + location.pathname + '#execute-query/' + data.qid + '"><img src="' + ApiTargets.MYADS_STORAGE + '/query2svg/' + data.qid + '"></img>' + '</a>' + '</textarea>',
            modal: true
          }));
          defer.resolve();
        });
        return defer.promise();
      });
      this.set('search-page', function (endPoint, data) {
        var isTugboat = false;

        try {
          isTugboat = document.referrer.indexOf('tugboat/adsabs') > -1;
        } catch (e) {}

        var defer = $.Deferred();
        var possibleSearchSubPages = ['Metrics', 'AuthorNetwork', 'PaperNetwork', 'ConceptCloud', 'BubbleChart'];
        var widgetName, pages; // convention is that a navigate command for search page widget starts with "show-"
        // waits for the navigate to results page emitted by the discovery_mediator
        // once the solr search has been received

        if (data.page) {
          widgetName = _.map(data.page.split('-').slice(1), function (w) {
            return w[0].toUpperCase() + w.slice(1);
          }).join('');
        }

        if (widgetName && possibleSearchSubPages.indexOf(widgetName) > -1) {
          pages = [widgetName].concat(searchPageAlwaysVisible.slice(1));
        } else {
          pages = searchPageAlwaysVisible;
        }

        var that = this;
        var ctx = data && data.context || {};
        showResultsPage(pages, ctx).then(function () {
          var handler = function handler() {
            // the current query should have been updated, use that instead
            var query = self.getBeeHive().getObject('AppStorage').getCurrentQuery();

            if (!query) {
              query = data.q;
            }

            var cleaned = queryUpdater.clean(query); // re-apply the qid if was lost

            if (query.has('__qid')) {
              cleaned.set('__qid', query.get('__qid'));
            }

            that.route = '#search/' + cleaned.url();

            if (query.has('__bigquerySource')) {
              that.title = query.get('__bigquerySource')[0];
            } else {
              that.title = query.get('q').length && query.get('q')[0];
            }

            if (isTugboat) {
              that.route += '&__tb=1';
            }

            var q = query;

            if (q instanceof ApiQuery) {
              var update = {};

              var par = function par(str) {
                if (_.isString(str)) {
                  try {
                    return parseInt(str);
                  } catch (e) {// do nothing
                  }
                }

                return false;
              };

              if (q.has('p_')) {
                var page = par(q.get('p_')[0]);
                update.page = page;
              } else {
                that.route += '&p_=0';
              }

              if (!_.isEmpty(update)) {
                app.getWidget('Results').then(function (w) {
                  if (_.isFunction(w.updatePagination)) {
                    w.updatePagination(update);
                  }
                });
              }
            } // check if there is a subpage, if so execute that handler w/ our current context


            if (data.page && self.get(data.page)) {
              var exec = _.bind(self.get(data.page).execute, that, data.page, {
                q: query
              });

              exec(data.page).then(function () {
                defer.resolve();
              });
            } else {
              defer.resolve();
            }
          }; // subscribe to the search cycle finished event
          // so that we know that the current query has been set


          var onFeedback = function onFeedback(feedback) {
            if (feedback && feedback.code === ApiFeedback.CODES.SEARCH_CYCLE_FINISHED) {
              handler();
              ps.unsubscribe(ps.FEEDBACK, onFeedback);
            }
          }; // make sure that we unfold sidebars


          publishFeedback({
            code: ApiFeedback.CODES.UNMAKE_SPACE
          });
          var ps = self.getPubSub();
          ps.subscribe(ps.FEEDBACK, onFeedback);
          ps.publish(ps.START_SEARCH, data.q);
        });
        return defer.promise();
      });
      this.set('execute-query', function (endPoint, queryId) {
        var defer = $.Deferred();
        var api = app.getService('Api');
        api.request(new ApiRequest({
          target: ApiTargets.MYADS_STORAGE + '/query/' + queryId,
          options: {
            done: function done(data) {
              var q = new ApiQuery().load(JSON.parse(data.query).query);
              self.getPubSub().publish(self.getPubSub().START_SEARCH, q);
              defer.resolve();
            },
            fail: function fail() {
              var alerter = app.getController('AlertsController');
              alerter.alert(new ApiFeedback({
                code: ApiFeedback.CODES.ERROR,
                msg: 'The query with the given UUID cannot be found'
              }));
              self.get('index-page').execute().then(function () {
                defer.resolve();
              });
            },
            type: 'GET',
            xhrFields: {
              withCredentials: false
            }
          }
        }));
        return defer.promise();
      });
      this.set('user-action', function (endPoint, data) {
        var failMessage = '',
            failTitle = '',
            route,
            done,
            defer = $.Deferred();
        var token = data.token,
            subView = data.subView;

        function fail(jqXHR, status, errorThrown) {
          self.get('index-page').execute().then(function () {
            var error = jqXHR.responseJSON && jqXHR.responseJSON.error ? jqXHR.responseJSON.error : 'error unknown'; // call alerts widget

            self.getPubSub().publish(self.getPubSub().ALERT, new ApiFeedback({
              code: 0,
              title: failTitle,
              msg: ' <b>' + error + '</b> <br/>' + failMessage,
              modal: true,
              type: 'danger'
            }));
            defer.reject();
          });
        }

        if (subView === 'register') {
          failTitle = 'Registration failed.';
          failMessage = '<p>Please try again, or contact <b> adshelp@cfa.harvard.edu for support </b></p>';
          route = ApiTargets.VERIFY + '/' + token;

          done = function done(reply) {
            // user has been logged in already by server
            // request bootstrap
            self.getApiAccess({
              reconnect: true
            }).done(function () {
              self.get('index-page').execute().then(function () {
                var msg = '<p>You have been successfully registered with the username</p> <p><b>' + reply.email + '</b></p>';
                self.getPubSub().publish(self.getPubSub().ALERT, new ApiFeedback({
                  code: 0,
                  title: 'Welcome to ADS',
                  msg: msg,
                  modal: true,
                  type: 'success'
                }));
                defer.resolve();
              });
            }).fail(function () {
              this.apply(fail, arguments); // XXX:rca - infinite loop?
            });
          };
        } else if (subView === 'change-email') {
          failTitle = 'Attempt to change email failed';
          failMessage = 'Please try again, or contact adshelp@cfa.harvard.edu for support';
          route = ApiTargets.VERIFY + '/' + token;

          done = function done(reply) {
            // user has been logged in already
            // request bootstrap
            self.getApiAccess({
              reconnect: true
            }).done(function () {
              self.get('index-page').execute().then(function () {
                var msg = 'Your new ADS email is <b>' + reply.email + '</b>';
                self.getPubSub().publish(self.getPubSub().ALERT, new ApiFeedback({
                  code: 0,
                  title: 'Email has been changed.',
                  msg: msg,
                  modal: true,
                  type: 'success'
                }));
                defer.resolve();
              });
            }).fail(function () {
              this.apply(fail, arguments);
            });
          };
        } else if (subView === 'reset-password') {
          done = function done() {
            // route to reset-password-2 form
            // set the token so that session can use it in the put request with the new password
            self.getBeeHive().getObject('Session').setChangeToken(token);
            self.getPubSub().publish(self.getPubSub().NAVIGATE, 'authentication-page', {
              subView: 'reset-password-2'
            });
            defer.resolve();
          };

          failTitle = 'Password reset failed';
          failMessage = 'Reset password token was invalid.';
          route = ApiTargets.RESET_PASSWORD + '/' + token;
        } else {
          defer.reject('Unknown subView: ' + subView);
          return defer.promise();
        }

        var request = new ApiRequest({
          target: route,
          options: {
            type: 'GET',
            context: self,
            done: done,
            fail: fail
          }
        });
        self.getBeeHive().getService('Api').request(request);
        return defer.promise();
      });
      this.set('orcid-instructions', function () {
        var that = this;
        var defer = $.Deferred();
        app.getObject('MasterPageManager').show('OrcidInstructionsPage').then(function () {
          that.route = '#orcid-instructions';
          that.title = 'Orcid Instructions';
        });
        return defer.promise();
      });
      this.set('orcid-page', function (view, targetRoute) {
        var defer = $.Deferred();
        var orcidApi = app.getService('OrcidApi');
        var persistentStorage = app.getService('PersistentStorage');
        var appStorage = app.getObject('AppStorage');
        var user = app.getObject('User');
        var that = this; // traffic from Orcid - user has authorized our access

        if (!orcidApi.hasAccess() && orcidApi.hasExchangeCode()) {
          // since app will exit, store the information that we're authenticating
          if (persistentStorage) {
            persistentStorage.set('orcidAuthenticating', true);
          } else {
            console.warn('no persistent storage service available');
          }

          orcidApi.getAccessData(orcidApi.getExchangeCode()).done(function (data) {
            orcidApi.saveAccessData(data);
            user.setOrcidMode(true);
            self.getPubSub().publish(self.getPubSub().APP_EXIT, {
              url: window.location.pathname + (targetRoute && _.isString(targetRoute) ? targetRoute : window.location.hash)
            });
          }).fail(function () {
            user.setOrcidMode(false);
            console.warn('Unsuccessful login to ORCID');
            var alerter = app.getController('AlertsController');
            alerter.alert(new ApiFeedback({
              code: ApiFeedback.CODES.ALERT,
              msg: 'Error getting OAuth code to access ORCID',
              modal: true,
              events: {
                click: 'button[data-dismiss=modal]'
              }
            })).done(function () {
              self.get('index-page').execute(); // after modal is closed
            });
          });
          return;
        } else if (orcidApi.hasAccess()) {
          // XXX:rca = this block is async; showing modals even if the page under may be
          // changing; likely not intended to be doing that but not sure...
          if (persistentStorage.get('orcidAuthenticating')) {
            persistentStorage.remove('orcidAuthenticating'); // check if we need to trigger modal alert to ask user to fill in necessary data
            // we only want to show this immediately after user has authenticated with orcid

            orcidApi.getADSUserData().done(function (data) {
              // don't show modal if we're just going to redirect to the ads-orcid form anyway
              if (!data.hasOwnProperty('authorizedUser') && JSON.stringify(appStorage.get('stashedNav')) !== '["UserPreferences",{"subView":"orcid"}]') {
                // the form has yet to be filled out by the user
                // now tailor the message depending on whether they are signed in to ADS or not
                var alerter = app.getController('AlertsController');
                alerter.alert(new ApiFeedback({
                  code: ApiFeedback.CODES.ALERT,
                  msg: OrcidModalTemplate({
                    adsLoggedIn: app.getObject('User').isLoggedIn()
                  }),
                  type: 'success',
                  title: 'You are now logged in to ORCID',
                  modal: true
                }));
              } // end check if user has already provided data

            }).fail(function (error) {
              console.warn(error);
            });
          }

          app.getObject('MasterPageManager').show('OrcidPage', ['OrcidBigWidget', 'SearchWidget']).then(function () {
            // go to the orcidbigwidget
            that.route = '/user/orcid';
            that.title = 'My Orcid';
            defer.resolve();
          });
        } else {
          // just redirect to index page, no orcid access
          self.get('index-page').execute().then(function () {
            that.route = '';
            defer.resolve();
          });
        }

        return defer.promise();
      });
      /*
       * functions for showing "explore" widgets on results page
       * */

      function showResultsPageWidgetWithUniqueUrl(command, options) {
        var defer = $.Deferred(),
            that = this;
        options = options || {};
        var q = app.getObject('AppStorage').getCurrentQuery();

        if (!q && options.q) {
          q = options.q;
        } else if (!q && !options.q) {
          return defer.resolve().promise();
        }

        publishFeedback({
          code: ApiFeedback.CODES.MAKE_SPACE
        });

        var widgetName = _.map(command.split('-').slice(1), function (w) {
          return w[0].toUpperCase() + w.slice(1);
        }).join('');

        app.getObject('MasterPageManager').show('SearchPage', [widgetName].concat(searchPageAlwaysVisible.slice(1))).done(function () {
          var route = '#search/' + queryUpdater.clean(q.clone()).url() + '/' + command.split('-').slice(1).join('-'); // show selected, need to explicitly tell widget to show bibcodes

          if (options && options.onlySelected) {
            app.getWidget(widgetName).done(function (w) {
              var selected = app.getObject('AppStorage').getSelectedPapers();
              w.renderWidgetForListOfBibcodes(selected);
              that.route = route;
              defer.resolve();
            });
          } else {
            app.getWidget(widgetName).done(function (w) {
              w.renderWidgetForCurrentQuery({
                currentQuery: q
              });
              that.route = route;
              defer.resolve();
            });
          }
        });
        return defer.promise();
      }

      this.set('show-author-network', function (command, options) {
        return showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });
      this.set('show-concept-cloud', function (command, options) {
        return showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });
      this.set('show-paper-network', function (command, options) {
        return showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });
      this.set('show-bubble-chart', function (command, options) {
        return showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });
      this.set('show-metrics', function (command, options) {
        return showResultsPageWidgetWithUniqueUrl.apply(this, arguments);
      });
      this.set('visualization-closed', this.get('results-page'));

      var showResultsPage = function showResultsPage(pages, ctx) {
        return app.getObject('MasterPageManager').show('SearchPage', pages, ctx);
      };
      /*
       * Below are functions for abstract pages
       */


      var showDetail = function showDetail(pages, toActivate) {
        var defer = $.Deferred();
        app.getObject('MasterPageManager').show('DetailsPage', pages).then(function () {
          return app.getWidget('DetailsPage').then(function (w) {
            defer.resolve(w);
          });
        });
        return defer.promise();
      };

      this.set('verify-abstract', function () {
        // XXX:rca - moved from router; not in a working state
        // check we are using the canonical bibcode and redirect to it if necessary
        var q,
            req,
            defer = $.Deferred,
            that = this;
        q = new ApiQuery({
          q: 'identifier:' + this.queryUpdater.quoteIfNecessary(bibcode),
          fl: 'bibcode'
        });
        req = new ApiRequest({
          query: q,
          target: ApiTargets.SEARCH,
          options: {
            done: function done(resp) {
              var navigateString, href;

              if (!subPage) {
                navigateString = 'ShowAbstract';
              } else {
                navigateString = 'Show' + subPage[0].toUpperCase() + subPage.slice(1);
                href = '#abs/' + bibcode + '/' + subPage;
              } //self.routerNavigate(navigateString, { href: href });


              if (resp.response && resp.response.docs && resp.response.docs[0]) {
                bibcode = resp.response.docs[0].bibcode;
                self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({
                  q: 'bibcode:' + bibcode
                }));
              } else if (resp.response && resp.response.docs && !resp.response.docs.length) {
                console.error('the query  ' + q.get('q')[0] + '  did not return any bibcodes');
              }
            },
            fail: function fail() {
              console.log('Cannot identify page to load, bibcode: ' + bibcode);
              self.getPubSub().publish(this.getPubSub().NAVIGATE, 'index-page');
            }
          }
        });
        this.getPubSub().publish(this.getPubSub().EXECUTE_REQUEST, req);
      }); // translate identifier to bibcode, this only sends a request if the identifier is NOT bibcode-like

      var translateIdentifier = function translateIdentifier(id) {
        var $dd = $.Deferred();
        var ps = self.getPubSub(); // super naive bibcode confirmation

        if (id.length === 19 && /^\d{4}[A-z].*\d[A-z]$/.test(id)) {
          return $dd.resolve(id).promise();
        }

        var request = new ApiRequest({
          target: ApiTargets.SEARCH,
          query: new ApiQuery({
            q: 'identifier:' + id,
            fl: 'bibcode',
            rows: 1
          }),
          options: {
            done: function done(res) {
              if (res && res.response && res.response.numFound > 0) {
                $dd.resolve(res.response.docs[0].bibcode);
              }

              $dd.resolve('null');
            },
            fail: function fail() {
              $dd.resolve('null');
            }
          }
        });
        ps.publish(ps.EXECUTE_REQUEST, request);
        return $dd.promise();
      };

      var showDetailsSubPage = function showDetailsSubPage(_ref2) {
        var id = _ref2.id,
            bibcode = _ref2.bibcode,
            page = _ref2.page,
            prefix = _ref2.prefix,
            subView = _ref2.subView;
        var ps = self.getPubSub();
        ps.publish(ps.DISPLAY_DOCUMENTS, new ApiQuery({
          q: "identifier:".concat(bibcode)
        }));
        page.setActive(id, subView);

        if (prefix) {
          // we can grab the current title from storage and just add our prefix from there
          var title = app.getObject('AppStorage').getDocumentTitle();

          if (title && title.indexOf(prefix) === -1) {
            this.title = prefix + ' | ' + title;
          }
        } else {
          // get the title from the list of stashed docs, if available
          var doc = _.find(self.getBeeHive().getObject('DocStashController').getDocs() || [], {
            bibcode: bibcode
          });

          if (doc) {
            this.title = doc.title && doc.title[0];
          }
        }
      };

      this.set('ShowAbstract', function (id, data) {
        var _this = this;

        var defer = $.Deferred();
        showDetail([id].concat(detailsPageAlwaysVisible), id).then(function (page) {
          if (!data.bibcode) {
            return;
          }

          translateIdentifier(data.bibcode).then(function (bibcode) {
            showDetailsSubPage.call(_this, {
              id: id,
              bibcode: bibcode,
              page: page
            });
            _this.route = data.href;
            _this.replace = true;
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('ShowCitations', function (id, data) {
        var _this2 = this;

        var defer = $.Deferred();
        showDetail([id].concat(detailsPageAlwaysVisible), id).then(function (page) {
          if (!data.bibcode) {
            return;
          }

          translateIdentifier(data.bibcode).then(function (bibcode) {
            showDetailsSubPage.call(_this2, {
              id: id,
              bibcode: bibcode,
              page: page,
              prefix: 'Citations'
            });
            _this2.route = data.href;
            _this2.replace = true;
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('ShowReferences', function (id, data) {
        var _this3 = this;

        var defer = $.Deferred();
        showDetail([id].concat(detailsPageAlwaysVisible), id).then(function (page) {
          if (!data.bibcode) {
            return;
          }

          translateIdentifier(data.bibcode).then(function (bibcode) {
            showDetailsSubPage.call(_this3, {
              id: id,
              bibcode: bibcode,
              page: page,
              prefix: 'References'
            });
            _this3.route = data.href;
            _this3.replace = true;
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('ShowCoreads', function (id, data) {
        var _this4 = this;

        var defer = $.Deferred();
        showDetail([id].concat(detailsPageAlwaysVisible), id).then(function (page) {
          if (!data.bibcode) {
            return;
          }

          translateIdentifier(data.bibcode).then(function (bibcode) {
            showDetailsSubPage.call(_this4, {
              id: id,
              bibcode: bibcode,
              page: page,
              prefix: 'Co-Reads'
            });
            _this4.route = data.href;
            _this4.replace = true;
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('ShowSimilar', function (id, data) {
        var _this5 = this;

        var defer = $.Deferred();
        showDetail([id].concat(detailsPageAlwaysVisible), id).then(function (page) {
          if (!data.bibcode) {
            return;
          }

          translateIdentifier(data.bibcode).then(function (bibcode) {
            showDetailsSubPage.call(_this5, {
              id: id,
              bibcode: bibcode,
              page: page,
              prefix: 'Similar Papers'
            });
            _this5.route = data.href;
            _this5.replace = true;
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('ShowToc', function (id, data) {
        var _this6 = this;

        var defer = $.Deferred();
        showDetail([id].concat(detailsPageAlwaysVisible), id).then(function (page) {
          if (!data.bibcode) {
            return;
          }

          translateIdentifier(data.bibcode).then(function (bibcode) {
            showDetailsSubPage.call(_this6, {
              id: id,
              bibcode: bibcode,
              page: page,
              prefix: 'Volume Content'
            });
            _this6.route = data.href;
            _this6.replace = true;
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('ShowMetrics', function (id, data) {
        var _this7 = this;

        var defer = $.Deferred();
        showDetail([id].concat(detailsPageAlwaysVisible), id).then(function (page) {
          if (!data.bibcode) {
            return;
          }

          translateIdentifier(data.bibcode).then(function (bibcode) {
            showDetailsSubPage.call(_this7, {
              id: id,
              bibcode: bibcode,
              page: page,
              prefix: 'Metrics'
            });
            _this7.route = data.href;
            _this7.replace = true;
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('ShowExportcitation', function (id, data) {
        var _this8 = this;

        var defer = $.Deferred(); // the default subView should be `default`

        var format = data.subView || 'default';
        app.getObject('MasterPageManager').show('DetailsPage', [id].concat(detailsPageAlwaysVisible)).done(function () {
          app.getWidget('DetailsPage').done(function (page) {
            if (!data.bibcode) {
              return;
            }

            translateIdentifier(data.bibcode).then(function (bibcode) {
              self.getPubSub().publish(self.getPubSub().DISPLAY_DOCUMENTS, new ApiQuery({
                q: 'identifier:' + bibcode
              }));

              if (bibcode === 'null') {
                return page.setActive(null);
              } // guarantees the bibcode is set on the widget


              page.widgets[id].ingestBroadcastedPayload(bibcode);
              page.setActive(id, format);
              _this8.route = data.href;
              _this8.replace = true;
              defer.resolve();
            });
          });
        });
        return defer.promise();
      });
      this.set('ShowGraphics', function (id, data) {
        var _this9 = this;

        var defer = $.Deferred();
        showDetail([id].concat(detailsPageAlwaysVisible), id).then(function (page) {
          if (!data.bibcode) {
            return;
          }

          translateIdentifier(data.bibcode).then(function (bibcode) {
            showDetailsSubPage.call(_this9, {
              bibcode: bibcode,
              page: page,
              id: id,
              prefix: 'Graphics'
            });
            _this9.route = data.href;
            _this9.replace = true;
            defer.resolve();
          });
        });
        return defer.promise();
      });
      this.set('show-author-affiliation-tool', function (id, options) {
        var defer = $.Deferred(),
            that = this;
        var q = app.getObject('AppStorage').getCurrentQuery();
        app.getObject('MasterPageManager').show('SearchPage', ['AuthorAffiliationTool'].concat(searchPageAlwaysVisible.slice(1))).done(function () {
          publishFeedback({
            code: ApiFeedback.CODES.MAKE_SPACE
          });
          app.getWidget('AuthorAffiliationTool').done(function (w) {
            if (options && options.onlySelected) {
              var selected = app.getObject('AppStorage').getSelectedPapers();
              w.renderWidgetForListOfBibcodes(selected);
            } else {
              w.renderWidgetForCurrentQuery({
                currentQuery: q
              });
            }

            that.route = '#search/' + queryUpdater.clean(q).url();
            defer.resolve();
          });
        });
        return defer.promise();
      }); // ---- react components ----

      var createReactPage = /*#__PURE__*/function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(id) {
          var pm, widget;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.next = 2;
                  return app._getWidget('ReactPageManager');

                case 2:
                  pm = _context.sent;
                  _context.next = 5;
                  return app._getWidget(id);

                case 5:
                  widget = _context.sent;
                  pm.widgets[id] = widget.render();
                  pm.view = pm.createView({
                    widgets: _defineProperty({}, id, pm.widgets[id])
                  });
                  _context.next = 10;
                  return app.getObject('MasterPageManager').show('ReactPageManager', [id]);

                case 10:
                  return _context.abrupt("return", widget);

                case 11:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function createReactPage(_x) {
          return _ref3.apply(this, arguments);
        };
      }();

      this.set('ShowFeedback', /*#__PURE__*/function () {
        var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(id, _ref4) {
          var subview, bibcode, widget, form;
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  subview = _ref4.subview, bibcode = _ref4.bibcode;
                  _context2.next = 3;
                  return createReactPage('ShowFeedback');

                case 3:
                  widget = _context2.sent;
                  ReactRedux.batch(function () {
                    widget.dispatch({
                      type: 'SET_FORM',
                      payload: subview
                    });
                    widget.dispatch({
                      type: 'SET_BIBCODE',
                      payload: bibcode
                    });
                  });
                  form = widget.getState().main.form;
                  publishPageChange("feedback-".concat(form));
                  this.title = 'Feedback';

                case 8:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        return function (_x2, _x3) {
          return _ref5.apply(this, arguments);
        };
      }());
    }
  });

  _.extend(NavigatorService.prototype, ApiAccessMixin);

  return NavigatorService;
});

/**
 * Catalogue of Alerts (these are the messages that get displayed
 * to the user)
 */
define('js/components/alerts',['backbone', 'js/mixins/hardened'], function (Backbone, Hardened) {
  var Alerts = {
    TYPE: {
      ERROR: 'error',
      INFO: 'info',
      WARNING: 'warning',
      SUCCESS: 'success',
      DANGER: 'danger'
    },
    ACTION: {
      CALL_PUBSUB: 2,
      TRIGGER_FEEDBACK: 1
    }
  };
  return Alerts;
});

/**
 * Service which receives alerts, it can be used by both widgets and
 * trusted components. Its purpose is to communicate to users important
 * messages.
 */
define('js/components/alerts_mediator',['underscore', 'jquery', 'cache', 'js/components/generic_module', 'js/mixins/dependon', 'js/components/api_feedback', 'js/mixins/hardened', 'js/components/alerts'], function (_, $, Cache, GenericModule, Dependon, ApiFeedback, Hardened, Alerts) {
  var AlertsMediator = GenericModule.extend({
    initialize: function initialize(options) {
      _.extend(this, _.pick(options, ['debug', 'widgetName']));
    },

    /**
     * This controller does need elevated beehive
     * and applicaiton
     *
     * @param beehive
     * @param app
     */
    activate: function activate(beehive, app) {
      this.setBeeHive(beehive);
      this.setApp(app);
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.ALERT, _.bind(this.onAlert, this));
      pubsub.subscribe(pubsub.NAVIGATE, _.bind(this.onNavigate, this));
      this.getWidget().fail(function () {
        console.error('If you want to use AlertController, you also need to have a Widget capable of displaying the messages (default: AlertsWidget)');
        pubsub.publish(pubsub.BIG_FIRE, 'Alerts Widget not available');
      });
    },
    onNavigate: function onNavigate(route) {
      var self = this;
      var pubSub = this.getPubSub(); // Close any errors produced on the login page on the next page navigation

      if (route === 'authentication-page') {
        pubSub.subscribeOnce(pubSub.NAVIGATE, function () {
          var widget = self.getWidget();

          if (widget && widget.closeView) {
            widget.closeView();
          }
        });
      }
    },
    onAlert: function onAlert(apiFeedback, psk) {
      var self = this;
      var promise = this.alert(apiFeedback).done(function (result) {
        if (_.isFunction(result)) {
          result();
          return;
        } // non-privileged components can reach alerts sending limited
        // definition of actions; we'll turn those into functions/actions


        if (_.isObject(result) && result.action) {
          switch (result.action) {
            case Alerts.ACTION.TRIGGER_FEEDBACK:
              self.getPubSub().publish(self.getPubSub().FEEDBACK, new ApiFeedback(result.arguments));
              break;

            case Alerts.ACTION.CALL_PUBSUB:
              self.getPubSub().publish(result.signal, result.arguments);
              break;

            default:
              throw new Error('Unknown action type:' + result);
          } // close the widget immediately


          if (self._widget && self._widget.closeView) {
            self._widget.closeView();
          }
        }
      });
      return promise;
    },
    getWidget: function getWidget() {
      var defer = $.Deferred();
      var self = this;

      if (this._widget) {
        defer.resolve(this._widget);
      } else {
        this.getApp()._getWidget(this.widgetName || 'AlertsWidget').done(function (widget) {
          self._widget = widget;
          defer.resolve(widget);
        }).fail(function () {
          defer.reject();
        });
      }

      return defer.promise();
    },
    alert: function alert(apiFeedback) {
      var defer = $.Deferred();
      this.getWidget().done(function (w) {
        if (!w) {
          console.warn('"AlertsWidget" has disappeared, we cant display messages to the user');
          defer.reject('AlertsWidget has disappeared');
        } else {
          // since alerts widget returns a promise that gets
          // resolved once the widget rendered; we have to
          // wait little bit more
          w.alert(apiFeedback).done(function () {
            defer.resolve.apply(defer, arguments);
          });
        }
      }).fail(function () {
        defer.reject('AlertsWidget not available');
      });
      return defer.promise();
    },
    hardenedInterface: {
      debug: 'state of the alerts',
      getHardenedInstance: 'allow to create clone of the already hardened instance'
    }
  });

  _.extend(AlertsMediator.prototype, Dependon.BeeHive, Dependon.App);

  _.extend(AlertsMediator.prototype, Hardened);

  return AlertsMediator;
});

/**
 * Created by rchyla on 3/28/14.
 */

/**
 * Collection of ApiRequests wrapped into a convenient package
 * that can be passed to the Api service and it will call
 * callback 'success' once all of the requests were finished
 */

/**
 * class R.ApiRequestQueue
 *
 * Available options:
 *
 * - callAllSuccessCallbacks (Boolean): If true, success callbacks will only
 *   be called for every queued request, instead of just the final one.
 *   Default: false
 * */
define('js/components/api_request_queue',['underscore', 'js/components/api_request'], function (_, ApiRequest) {
  var ApiRequestQueue = ApiRequest.extend({
    _queue: [],
    _lock: false,
    _options: {},
    successAllCallback: null,
    initialize: function initialize(attrs, options) {
      _.extend(this, _.pick(attrs, ['successAllCallback']));
    },
    push: function push(request) {
      if (!(request instanceof ApiRequest)) {
        throw Error('ApiRequestQueue works only with ApiRequest instances');
      }

      this._queue.push(request);

      if (!this.isLocked()) {
        this.lock();

        this._processQueue();
      }
    },
    _processQueue: function _processQueue() {
      if (!this.isEmpty()) {
        var doNothing = function doNothing() {};

        var args = this._queue.shift();

        var _success = args.success ? args.success : doNothing;

        var _error = args.error ? args.error : doNothing;

        var self = this;

        args.success = function (response) {
          // Wrap the success callback
          if (self._callAllSuccessCallbacks || self.isEmpty()) {
            _success(response);
          }

          if (self.isEmpty()) {
            self.unlock();
          }

          self._processQueue();
        };

        args.error = function (response) {
          // Wrap the error callback
          _error(response); // Cancel the queued commands on error.
          // Aborting requests on error is the appropriate behavior because
          // queued requests depend on the outcome of the previous requests.
          // If the outcome is unsuccessful, the subsequent requests are probably invalid.


          if (!self.isEmpty()) {
            console.error('Error encountered while processing queued commands. Remaining commands will not be processed.');
            self._queue = [];
          }

          self.unlock();
        };

        R.Api.request(args);
      }
    },
    lock: function lock() {
      this._lock = true;
    },
    unlock: function unlock() {
      this._lock = false;
    },
    isLocked: function isLocked() {
      return this._lock;
    },
    isEmpty: function isEmpty() {
      return this._queue.length === 0;
    }
  });
  return ApiRequestQueue;
});

/**
 * Created by rchyla on 3/10/14.
 */

/*
 * Subclass of the JSON response - it understands the JSON object as returned
 * by SOLR.
 */
define('js/components/solr_response',['js/components/json_response', 'js/components/solr_params', 'backbone', 'underscore', 'jquery'], function (JsonResponse, SolrParams, Backbone, _, $) {
  var SolrResponse = JsonResponse.extend({
    initialize: function initialize() {
      if (!this.has('responseHeader.params')) {
        throw new Error('SOLR data error - missing: responseHeader.params');
      }

      if (_.isString(this._url)) {
        // TODO: this seems ugly, relying on the parent for values
        var p = new SolrParams();
        this._url = new SolrParams(p.parse(this._url)).url();
      } else {
        var queryParams = this.get('responseHeader.params');
        this._url = new SolrParams(queryParams).url();
      }
    },
    url: function url(resp, options) {
      return this._url;
    }
  });
  return SolrResponse;
});

/*
 * A simple wrapper around the API response for ADS. The underlying
 * implementation of the Response object can provide a specific
 * logic, so don't be surprised if you see a different behaviour.
 * But the API remains the same!
 *
 * To configure what implementation you want for your module, use this
 * in the app config:
 *
 * map: {
 *  'your/module': {
 *    'api_response_impl': 'js/components/specific_impl_of_the_api_response'
 *  }
 * },
 */
define('js/components/api_response',['underscore', 'backbone', 'js/components/solr_response', 'js/components/facade'], function (_, Backbone, ApiResponseImplementation, Facade) {
  var hardenedInterface = {
    set: 'set (replace existing)',
    get: 'get values',
    has: 'has a key',
    toJSON: 'values back as JSON object',
    clone: 'make a copy',
    url: 'url string of the params',
    isLocked: true,
    lock: true,
    unlock: true,
    setApiQuery: 'sets the ApiQuery',
    getApiQuery: 'gets the query'
  };

  var ApiResponse = function ApiResponse(data, options) {
    // Facade pattern, we want to expose only limited API
    // despite the fact that the underlying instance has
    // all power of the Backbone.Model
    if (data instanceof ApiResponseImplementation) {
      this.innerResponse = new Facade(hardenedInterface, data);
    } else {
      this.innerResponse = new Facade(hardenedInterface, new ApiResponseImplementation(data, options));
    }
  };

  var toInsert = {};

  _.each(_.keys(hardenedInterface), function (element, index, list) {
    toInsert[element] = function () {
      return this.innerResponse[element].apply(this.innerResponse, arguments);
    };
  });

  _.extend(ApiResponse.prototype, toInsert, {
    clone: function clone() {
      var clone = this.innerResponse.clone.apply(this.innerResponse, arguments);
      return new ApiResponse(clone);
    }
  });

  return ApiResponse;
});
/**
 * Created by rchyla on 3/3/14.
 */
;
/*
 * A generic class that holds the application storage
 */
define('js/components/app_storage',['backbone', 'underscore', 'js/components/api_query', 'js/mixins/hardened', 'js/mixins/dependon'], function (Backbone, _, ApiQuery, Hardened, Dependon) {
  var AppStorage = Backbone.Model.extend({
    activate: function activate(beehive) {
      this.setBeeHive(beehive);

      _.bindAll(this, 'onPaperSelection', 'onBulkPaperSelection');

      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.PAPER_SELECTION, this.onPaperSelection);
      pubsub.subscribe(pubsub.BULK_PAPER_SELECTION, this.onBulkPaperSelection);
    },
    initialize: function initialize() {
      this.on('change:selectedPapers', function (model) {
        this._updateNumSelected();

        if (this.hasPubSub()) var pubsub = this.getPubSub();
        pubsub.publish(pubsub.STORAGE_PAPER_UPDATE, this.getNumSelectedPapers());
      });
    },

    /**
     * functions related to remembering/removing the
     * current query object
     * @param apiQuery
     */
    setCurrentQuery: function setCurrentQuery(apiQuery) {
      if (!apiQuery) apiQuery = new ApiQuery();

      if (!(apiQuery instanceof ApiQuery)) {
        throw new Error('You must save ApiQuery instance');
      }

      this.set('currentQuery', apiQuery); // save to storage

      if (this.getBeeHive().hasService('PersistentStorage')) {
        this.getBeeHive().getService('PersistentStorage').set('currentQuery', apiQuery.toJSON());
      }
    },
    setCurrentNumFound: function setCurrentNumFound(numFound) {
      this.set('numFound', numFound);
    },
    getCurrentQuery: function getCurrentQuery() {
      return this.get('currentQuery');
    },
    hasCurrentQuery: function hasCurrentQuery() {
      return this.has('currentQuery');
    },

    /**
     * Functions to remember save bibcodes (that were
     * selected by an user)
     *
     * @returns {*}
     */
    hasSelectedPapers: function hasSelectedPapers() {
      return !!_.keys(this.get('selectedPapers')).length;
    },
    getSelectedPapers: function getSelectedPapers() {
      return _.keys(this.get('selectedPapers') || {});
    },
    clearSelectedPapers: function clearSelectedPapers() {
      this.set('selectedPapers', {});
    },
    addSelectedPapers: function addSelectedPapers(identifiers) {
      var data = _.clone(this.get('selectedPapers') || {});

      var updated = false;

      if (_.isArray(identifiers)) {
        _.each(identifiers, function (idx) {
          if (!data[idx]) {
            data[idx] = true;
            updated = true;
          }
        });
      } else if (!data[identifiers]) {
        data[identifiers] = true;
        updated = true;
      }

      if (updated) this.set('selectedPapers', data);
    },
    isPaperSelected: function isPaperSelected(identifier) {
      if (_.isArray(identifier)) throw new Error('Identifier must be a string or a number');
      var data = this.get('selectedPapers') || {};
      return !!data[identifier];
    },
    removeSelectedPapers: function removeSelectedPapers(identifiers) {
      var data = _.clone(this.get('selectedPapers') || {});

      if (_.isArray(identifiers)) {
        _.each(identifiers, function (i) {
          delete data[i];
        });
      } else if (identifiers) {
        delete data[identifiers];
      } else {
        data = {};
      }

      this.set('selectedPapers', data);
    },
    getNumSelectedPapers: function getNumSelectedPapers() {
      return this._numSelectedPapers || 0;
    },
    _updateNumSelected: function _updateNumSelected() {
      this._numSelectedPapers = _.keys(this.get('selectedPapers') || {}).length;
    },
    onPaperSelection: function onPaperSelection(data) {
      if (this.isPaperSelected(data)) {
        this.removeSelectedPapers(data);
      } else {
        this.addSelectedPapers(data);
      }
    },
    onBulkPaperSelection: function onBulkPaperSelection(bibs, flag) {
      if (flag == 'remove') {
        this.removeSelectedPapers(bibs);
        return;
      }

      this.addSelectedPapers(bibs);
    },
    // this is used by the auth and user settings widgets
    setConfig: function setConfig(conf) {
      this.set('dynamicConfig', conf);
    },
    getConfigCopy: function getConfigCopy() {
      return JSON.parse(JSON.stringify(this.get('dynamicConfig')));
    },
    setDocumentTitle: function setDocumentTitle(title) {
      this.set('documentTitle', title);
    },
    getDocumentTitle: function getDocumentTitle() {
      return this.get('documentTitle');
    },
    hardenedInterface: {
      getNumSelectedPapers: 'getNumSelectedPapers',
      isPaperSelected: 'isPaperSelected',
      hasSelectedPapers: 'hasSelectedPapers',
      getSelectedPapers: 'getSelectedPapers',
      clearSelectedPapers: 'clearSelectedPapers',
      getCurrentQuery: 'getCurrentQuery',
      hasCurrentQuery: 'hasCurrentQuery',
      setDocumentTitle: 'setDocumentTitle',
      getDocumentTitle: 'getDocumentTitle',
      getConfigCopy: 'get read-only copy of dynamic config',
      set: 'set a value into app storage',
      get: 'get a val from app storage'
    }
  });

  _.extend(AppStorage.prototype, Hardened, Dependon.BeeHive);

  return AppStorage;
});

/**
 * Created by rchyla on 3/18/14.
 */
define('js/components/services_container',['js/components/facade', 'js/components/generic_module', 'js/mixins/hardened', 'underscore'], function (Facade, GenericModule, Hardened, _) {
  var Services = GenericModule.extend({
    initialize: function initialize(options) {
      this._services = _.has(options, 'services') ? _.clone(options.services) : {};
    },
    activate: function activate() {
      var args = arguments;

      _.each(_.values(this._services), function (service) {
        // _.keys() preserves access order
        if (_.isObject(service) && 'activate' in service) {
          service.activate.apply(service, args);
        }
      });
    },
    destroy: function destroy() {
      for (var service in this._services) {
        this.remove(service);
      }
    },
    add: function add(name, service) {
      if (this._services.hasOwnProperty(name)) {
        throw new Error('The service: ' + name + ' is already registered, remove it first!');
      }

      if (!(name && service) || !_.isString(name)) {
        throw new Error('The key must be a string and the service is an object');
      }

      this._services[name] = service;
    },
    remove: function remove(name, service) {
      if (this._services.hasOwnProperty(name)) {
        var s = this._services[name];

        if ('destroy' in s) {
          s.destroy();
        }

        delete this._services[name];
        return s;
      }

      return null;
    },
    has: function has(name) {
      return this._services.hasOwnProperty(name);
    },
    get: function get(name) {
      return this._services[name];
    },
    getAll: function getAll() {
      return _.pairs(this._services);
    }
  });

  _.extend(Services.prototype, Hardened, {
    /*
     * A simple facade, we'll expose only services that
     * have 'getHardenedMethod' (ie. they know to protect
     * themselves)
     */
    getHardenedInstance: function getHardenedInstance() {
      var iface = {};
      var s;

      for (var service in this._services) {
        s = this._services[service];

        if (_.isObject(s) && 'getHardenedInstance' in s) {
          iface[service] = true;
        }
      }

      var newContainer = new this.constructor({
        services: this._getHardenedInstance(iface, this._services)
      });
      return this._getHardenedInstance({
        get: true,
        has: true
      }, newContainer);
    }
  });

  return Services;
});

/**
 * Created by rchyla on 3/16/14.
 *
 * Beehive is where all the communication happens ('Application' object
 * is where setup happens; application will load beehive)
 */
define('js/components/beehive',['backbone', 'underscore', 'js/components/generic_module', 'js/mixins/dependon', 'js/mixins/hardened', 'js/components/services_container'], function (Backbone, _, GenericModule, Dependon, Hardened, ServicesContainer) {
  var hiveOptions = [];
  var BeeHive = GenericModule.extend({
    initialize: function initialize(options) {
      _.extend(this, _.pick(options, hiveOptions));

      this.Services = new ServicesContainer();
      this.Objects = new ServicesContainer();
      this.debug = false;
      this.active = true;
    },
    activate: function activate() {
      this.Services.activate.apply(this.Services, arguments);
      this.Objects.activate(this);
      this.active = true;
    },
    destroy: function destroy() {
      this.Services.destroy(arguments);
      this.Objects.destroy(arguments);
      this.active = false;
    },
    getService: function getService(name) {
      return this.Services.get(name);
    },
    hasService: function hasService(name) {
      return this.Services.has(name);
    },
    addService: function addService(name, service) {
      return this.Services.add(name, service);
    },
    removeService: function removeService(name) {
      return this.Services.remove(name);
    },
    getObject: function getObject(name) {
      return this.Objects.get(name);
    },
    hasObject: function hasObject(name) {
      return this.Objects.has(name);
    },
    addObject: function addObject(name, service) {
      return this.Objects.add(name, service);
    },
    removeObject: function removeObject(name) {
      return this.Objects.remove(name);
    },
    getDebug: function getDebug() {
      return this.debug;
    },
    getAllServices: function getAllServices() {
      return this.Services.getAll();
    },
    getAllObjects: function getAllObjects() {
      return this.Objects.getAll();
    },

    /*
     * Wraps itself into a Facade that can be shared with other modules
     * (it is read-only); absolutely non-modifiable and provides the
     * following callbacks and properties:
     *  - Services
     */
    hardenedInterface: {
      Services: 'services container',
      Objects: 'objects container',
      debug: 'state of the app',
      active: 'active or not',
      getHardenedInstance: 'allow to create clone of the already hardened instance'
    }
  });

  _.extend(BeeHive.prototype, Hardened, {
    getHardenedInstance: function getHardenedInstance(iface) {
      iface = _.clone(iface || this.hardenedInterface); // because 'facade' functions are normally bound to the
      // original object, we have to do this to access 'facade'

      iface.getService = function (name) {
        // 'get service X (but only the hardened ones)',
        return hardened.Services.get(name);
      };

      iface.hasService = function (name) {
        return hardened.Services.has(name);
      };

      iface.getObject = function (name) {
        // 'get object X (but only the hardened ones)',
        return hardened.Objects.get(name);
      };

      iface.hasObject = function (name) {
        return hardened.Objects.has(name);
      };

      var hardened = this._getHardenedInstance(iface, this);

      return hardened;
    }
  });

  return BeeHive;
});

/**
 * Application object contains methods for asynochronous loading of other modules
 * It will load BeeHive by default, and it recognizes the following types of
 * objects
 *
 *  core:
 *    modules - any module you want to load and give it access to the full
 *              BeeHive (these guys are loaded first)
 *    services - these instances will be inserted into Beehive.Services
 *              (loaded after modules)
 *    objects - these will be inserted into BeeHive.Objects
 *              (loaded after services)
 *
 *  plugins - any object you want to instantiate
 *  widgets - any visual object you want to instantiate
 *
 *
 *  this is the normal workflow
 *
 *  var app = new Application();
 *  var promise = app.loadModules({
 *       core: {
 *         services: {
 *           PubSub: 'js/services/pubsub',
 *           Api: 'js/services/api'
 *         },
 *         modules: {
 *           QueryMediator: 'js/components/query_mediator'
 *         }
 *       },
 *       widgets: {
 *         YearFacet: 'js/widgets/facets/factory'
 *       }
 *     });
 *   promise.done(function() {
 *     app.activate();
 *     //....continue setting up layout etc
 *   });
 *
 *
 */
define('js/components/application',['underscore', 'jquery', 'backbone', 'module', 'js/components/beehive', 'js/mixins/api_access'], function (_, $, Backbone, module, BeeHive, ApiAccess) {
  var Application = function Application(options) {
    options || (options = {});
    this.aid = _.uniqueId('application');
    this.debug = true;

    _.extend(this, _.pick(options, ['timeout', 'debug']));

    this.initialize.apply(this, arguments);
  };

  var Container = function Container() {
    this.container = {};
  };

  _.extend(Container.prototype, {
    has: function has(name) {
      return this.container.hasOwnProperty(name);
    },
    get: function get(name) {
      return this.container[name];
    },
    remove: function remove(name) {
      delete this.container[name];
    },
    add: function add(name, obj) {
      this.container[name] = obj;
    }
  });

  _.extend(Application.prototype, {
    initialize: function initialize(config, options) {
      // these are core (elevated access)
      this.__beehive = new BeeHive();
      this.__modules = new Container();
      this.__controllers = new Container(); // these are barbarians behind the gates

      this.__widgets = new Container();
      this.__plugins = new Container();
      this.__barbarianRegistry = {};
      this.__barbarianInstances = {};
    },

    /*
     * code that accounts for browser deficiencies
     */
    shim: function shim() {
      if (!window.location.origin) {
        window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
      }
    },

    /**
     * Purpose of this call is to load dynamically all modules
     * that you pass in a configuration. We'll load them using
     * requirejs and set them into BeeHive
     *
     * This method returns 'Deferred' object, which tells you
     * whether initialization has finished. You *have to* use it
     * in the following way;
     *
     * app = new Application();
     * defer = app.loadModules(config, options);
     * defer.done(function() {
     *    // .... do something with the application
     * })
     *
     * @param config
     * @param options
     */
    loadModules: function loadModules(config, options) {
      var promises = [];
      var self = this;
      var promise;
      var core = config.core;

      if (core) {
        _.each(['controllers', 'modules', 'services', 'objects'], function (name) {
          if (core[name]) {
            promise = self._loadModules(name, core[name]);
            if (promise) promises.push(promise);
          }
        });
      } // plugins and widgets will be lazy-loaded (default)


      var plugins = config.plugins;
      var widgets = config.widgets;

      if (options && options.eagerLoad) {
        if (plugins) {
          promise = self._loadModules('plugins', plugins);
          if (promise) promises.push(promise);
        }

        if (widgets) {
          promise = self._loadModules('widgets', widgets);
          if (promise) promises.push(promise);
        }
      } else {
        if (plugins) {
          _.each(plugins, function (value, key) {
            var x = {};
            x[key] = value;

            self.__plugins.add(key, self._loadModules('plugins', x, false, true));
          });
        }

        if (widgets) {
          _.each(widgets, function (value, key) {
            var x = {};
            x[key] = value;

            self.__widgets.add(key, self._loadModules('widgets', x, false, true));
          });
        }
      } // hack, so that $.when() always returns []


      promises.length === 1 && promises.push(promise);
      var bigPromise = $.Deferred();
      $.when.apply($, promises).then(function () {
        _.each(arguments, function (promisedValues, idx) {
          if (_.isArray(promisedValues)) {
            if (self.debug) {
              console.log('application: registering ' + promisedValues[0]);
            }

            self._registerLoadedModules.apply(self, promisedValues);
          }
        });
      }).done(function () {
        bigPromise.resolve();
      }).fail(function () {
        console.error('Generic error - we were not successul in loading all modules for config', config);
        if (arguments.length) console.error(arguments);
        bigPromise.reject.apply(bigPromise, arguments);
      });
      return bigPromise.promise();
    },
    getBeeHive: function getBeeHive() {
      return this.__beehive;
    },
    _registerLoadedModules: function _registerLoadedModules(section, modules) {
      var beehive = this.getBeeHive();
      var key;
      var module;
      var hasKey;
      var addKey;
      var removeKey;
      var createInstance;
      var self = this;

      createInstance = function createInstance(key, module) {
        if (!module) {
          console.warn('Object ' + key + ' is empty, cannot instantiate it!');
          return;
        }

        if (self.debug) {
          console.log('Creating instance of: ' + key);
        }

        if (module.prototype) {
          return new module();
        }

        if (module && module.hasOwnProperty(key)) {
          return module[key];
        }

        return module;
      }; // console.log('registering', section, modules);


      if (section == 'controllers') {
        hasKey = _.bind(this.hasController, this);
        removeKey = _.bind(function (key) {
          this.__controllers.remove(key);
        }, this);
        addKey = _.bind(function (key, module) {
          this.__controllers.add(key, module);
        }, this);
      } else if (section == 'services') {
        hasKey = _.bind(beehive.hasService, beehive);
        removeKey = _.bind(beehive.removeService, beehive);
        addKey = _.bind(beehive.addService, beehive);
      } else if (section == 'objects') {
        hasKey = _.bind(beehive.hasObject, beehive);
        removeKey = _.bind(beehive.removeObject, beehive);
        addKey = _.bind(beehive.addObject, beehive);
      } else if (section == 'modules') {
        createInstance = function createInstance(key, module) {
          return module;
        };

        hasKey = _.bind(this.hasModule, this);
        removeKey = _.bind(function (key) {
          this.__modules.remove(key);
        }, this);
        addKey = _.bind(function (key, module) {
          this.__modules.add(key, module);
        }, this);
      } else if (section == 'widgets') {
        hasKey = _.bind(this.hasWidget, this);
        removeKey = _.bind(function (key) {
          this.__widgets.remove(key);
        }, this);
        addKey = _.bind(function (key, module) {
          this.__widgets.add(key, module);
        }, this);

        createInstance = function createInstance(key, module) {
          return module;
        };
      } else if (section == 'plugins') {
        hasKey = _.bind(this.hasPlugin, this);
        removeKey = _.bind(function (key) {
          this.__plugins.remove(key);
        }, this);
        addKey = _.bind(function (key, module) {
          this.__plugins.add(key, module);
        }, this);

        createInstance = function createInstance(key, module) {
          return module;
        };
      } else {
        throw new Error('Unknown section: ' + section);
      }

      _.each(_.pairs(modules), function (m) {
        key = m[0], module = m[1];

        if (hasKey(key)) {
          removeKey(key);
        }

        var inst = createInstance(key, module);

        if (!inst) {
          console.warn('Removing ' + key + '(because it is null!)');
          return;
        }

        addKey(key, inst);
      });
    },
    _checkPrescription: function _checkPrescription(modulePrescription) {
      // basic checking
      _.each(_.pairs(modulePrescription), function (module, idx, list) {
        var symbolicName = module[0];
        var impl = module[1];
        if (!_.isString(symbolicName) || !_.isString(impl)) throw new Error('You are kidding me, the key/implementation must be string values');
      });
    },

    /**
     * Loads modules *asynchronously* from the following structure
     *
     * {
     *  'Api': 'js/services/api',
     *  'PubSub': 'js/services/pubsub'
     * },
     *
     * Returns Deferred - once that deferred object is resolved
     * all modules have been loaded.
     *
     * @param modulePrescription
     * @private
     */
    _loadModules: function _loadModules(sectionName, modulePrescription, ignoreErrors, lazyLoad) {
      var self = this;

      this._checkPrescription(modulePrescription);

      if (this.debug) {
        console.log('application: loading ' + sectionName, modulePrescription);
      }

      var ret = {}; // create the promise object - load the modules asynchronously

      var implNames = _.keys(modulePrescription);

      var impls = _.values(modulePrescription);

      var defer = $.Deferred();

      var callback = function callback() {
        if (self.debug) console.timeEnd('startLoading' + sectionName);
        var modules = arguments;

        _.each(implNames, function (name, idx, implList) {
          ret[name] = modules[idx];
        });

        defer.resolve(sectionName, ret);

        if (self.debug) {
          console.log('Loaded: type=' + sectionName + ' state=' + defer.state(), ret);
        }
      };

      var errback = function errback(err) {
        var symbolicName = err.requireModules && err.requireModules[0];
        if (self.debug) console.warn('Error loading impl=' + symbolicName, err.requireMap);

        if (ignoreErrors) {
          if (self.debug) console.warn('Ignoring error');
          return;
        }

        defer.reject(err);
      };

      var run = function run() {
        if (self.debug) console.time('startLoading' + sectionName); // start loading the modules
        // console.log('loading', implNames, impls)

        require(impls, callback, errback);

        return self._setTimeout(defer).promise();
      };

      run.lazyLoad = lazyLoad;
      return lazyLoad ? run : run();
    },
    _setTimeout: function _setTimeout(deferred) {
      setTimeout(function () {
        if (deferred.state() != 'resolved') {
          deferred.reject('Timeout, application is loading too long');
        }
      }, this.timeout || 30000);
      return deferred;
    },
    destroy: function destroy() {
      this.getBeeHive().destroy();
    },
    activate: function activate(options) {
      var beehive = this.getBeeHive();
      var self = this; // services are activated by beehive itself

      if (self.debug) {
        console.log('application: beehive.activate()');
      }

      beehive.activate(beehive); // controllers receive application itself and elevated beehive object
      // all of them must succeed; we don't catch errors

      _.each(this.getAllControllers(), function (el) {
        if (self.debug) {
          console.log('application: controllers: ' + el[0] + '.activate(beehive, app)');
        }

        var plugin = el[1];

        if ('activate' in plugin) {
          plugin.activate(beehive, self);
        }
      }); // modules receive elevated beehive object


      _.each(this.getAllModules(), function (el) {
        try {
          if (self.debug) {
            console.log('application: modules: ' + el[0] + '.activate(beehive)');
          }

          var plugin = el[1];

          if ('activate' in plugin) {
            plugin.activate(beehive);
          }
        } catch (e) {
          console.error('Error activating:' + el[0]);
          console.error(e);
        }
      });

      this.__activated = true;
    },
    isActivated: function isActivated() {
      return this.__activated || false;
    },
    hasService: function hasService(name) {
      return this.getBeeHive().hasService(name);
    },
    getService: function getService(name) {
      return this.getBeeHive().getService(name);
    },
    hasObject: function hasObject(name) {
      return this.getBeeHive().hasObject(name);
    },
    getObject: function getObject(name) {
      return this.getBeeHive().getObject(name);
    },
    hasController: function hasController(name) {
      return this.__controllers.has(name);
    },
    getController: function getController(name) {
      return this.__controllers.get(name);
    },
    hasModule: function hasModule(name) {
      return this.__modules.has(name);
    },
    getModule: function getModule(name) {
      return this.__modules.get(name);
    },
    hasWidget: function hasWidget(name) {
      return this.__widgets.has(name);
    },
    getWidgetRefCount: function getWidgetRefCount(name, prefix) {
      var ds = this.__barbarianInstances[(prefix || 'widget:') + name];

      if (ds) {
        return ds.counter;
      }

      return -1;
    },
    incrRefCount: function incrRefCount(cat, name) {
      var symbolicName = cat + ':' + name;

      if (this.__barbarianInstances[symbolicName]) {
        this.__barbarianInstances[symbolicName].counter++;
      } else {
        throw Error('Invalid operation' + symbolicName + ' is not initialized');
      }
    },
    getWidget: function getWidget(name) {
      var defer = $.Deferred();
      var self = this;

      if (arguments.length > 1) {
        var w = {};
        var promises = [];

        _.each(arguments, function (x) {
          var wName = x;
          promises.push(self._getWidget(x).fail(function () {
            console.error('Error loading: ' + x);

            _.each(w, function (val, key) {
              self.returnWidget(key);
              delete w[key];
            });

            throw er;
          }).done(function (widget) {
            w[wName] = widget;
          }));
        });

        $.when.apply($, promises).done(function () {
          defer.resolve(w);
        });
      } else if (name) {
        this._getWidget(name).done(function (widget) {
          defer.resolve(widget);
        });
      } // this happens right after the callback


      setTimeout(function () {
        defer.done(function (widget) {
          if (_.isArray(name)) {
            _.each(name, function (x) {
              self.returnWidget(x);
            });
          } else {
            self.returnWidget(name);
          }
        });
      }, 1);
      return defer.promise();
    },
    _getWidget: function _getWidget(name) {
      return this._getThing('widget', name); // returns a promise
    },
    _getThing: function _getThing(cat, name) {
      var defer = $.Deferred();
      var self = this;

      this._lazyLoadIfNecessary(cat, name).done(function () {
        var w = self._getOrCreateBarbarian(cat, name);

        self.incrRefCount(cat, name);
        defer.resolve(w);
      });

      return defer.promise();
    },
    returnWidget: function returnWidget(name) {
      var ds = this.__barbarianInstances['widget:' + name]; // very rarely, a widget will want to be kept in memory

      if (ds && ds.parent.dontKillMe) return;

      if (ds) {
        ds.counter--;

        this._killBarbarian('widget:' + name);

        return ds.counter;
      }

      return -1;
    },
    hasPlugin: function hasPlugin(name) {
      return this.__plugins.has(name);
    },

    /**
     * Increase the plugin counter and return the instance
     * (already activated, with proper beehive in place)
     *
     * @param name
     * @return {*}
     */
    getPlugin: function getPlugin(name) {
      var defer = $.Deferred();
      var self = this;
      var w = {};

      if (arguments.length > 1) {
        w = {};

        _.each(arguments, function (x) {
          if (!x) return;

          try {
            w[x] = self._getPlugin(x);
          } catch (er) {
            console.error('Error loading: ' + x);

            _.each(w, function (val, key) {
              self.returnPlugin(key);
              delete w[key];
            });

            throw er;
          }
        });
      } else if (name) {
        w = this._getPlugin(name);
      }

      setTimeout(function () {
        defer.done(function (widget) {
          if (_.isArray(name)) {
            _.each(name, function (x) {
              self.returnPlugin(x);
            });
          } else {
            self.returnPlugin(name);
          }
        });
      }, 1);
      defer.resolve(w);
      return defer.promise();
    },
    getPluginRefCount: function getPluginRefCount(name) {
      return this.getWidgetRefCount(name, 'plugin:');
    },
    _getPlugin: function _getPlugin(name) {
      return this._getThing('plugin', name);
    },

    /**
     * Decrease the instance counter; when we reach zero
     * the plugin will be destroyed automatically
     *
     * @param name
     */
    returnPlugin: function returnPlugin(name) {
      var ds = this.__barbarianInstances['plugin:' + name];

      if (ds) {
        ds.counter--;

        this._killBarbarian('plugin:' + name);

        return ds.counter;
      }

      return -1;
    },

    /**
     * Given the pubsub key, it finds the name of the widget
     * (provided the widget is registered with the application)
     * Returns undefined for other components, such as controllers
     * objects etc (it searches only plugins and widgets)
     *
     * @param psk
     * @returns {*}
     */
    getPluginOrWidgetName: function getPluginOrWidgetName(psk) {
      if (!_.isString(psk)) throw Error('The psk argument must be a string');
      var k;

      if (this.__barbarianRegistry[psk]) {
        k = this.__barbarianRegistry[psk];
      } else {
        return undefined;
      }

      return k;
    },
    getPluginOrWidgetByPubSubKey: function getPluginOrWidgetByPubSubKey(psk) {
      var k = this.getPluginOrWidgetName(psk);
      if (k === undefined) return undefined;
      if (this._isBarbarianAlive(k)) return this._getBarbarian(k);
      throw new Error('Eeeek, thisis unexpectEED bEhAvjor! Cant find barbarian with ID: ' + psk);
    },
    getPskOfPluginOrWidget: function getPskOfPluginOrWidget(symbolicName) {
      var parts = symbolicName.split(':');
      var psk;

      if (this._isBarbarianAlive(symbolicName)) {
        var b = this._getBarbarian(symbolicName);

        if (b.getPubSub && b.getPubSub().getCurrentPubSubKey) return b.getPubSub().getCurrentPubSubKey().getId();
      }

      return psk;
    },

    /**
     * I think the analogy is getting over-stretched; it is true that the author of this application
     * loves history, and you could find many analogies...but let me hope that I would never treat
     * humans in the same way I name variable names and methods :_)
     *
     * @param category
     * @param name
     * @private
     */
    _getOrCreateBarbarian: function _getOrCreateBarbarian(cat, name) {
      var symbolicName = cat + ':' + name;

      if (cat == 'plugin' && !this.hasPlugin(name) || cat == 'widget' && !this.hasWidget(name)) {
        throw new Error('We cannot give you ' + symbolicName + ' (cause there is no constructor for it)');
      }

      if (this._isBarbarianAlive(symbolicName)) return this._getBarbarian(symbolicName);
      var constructor = cat == 'plugin' ? this.__plugins.get(name) : this.__widgets.get(name);
      var instance = new constructor();
      var hardenedBee = this.getBeeHive().getHardenedInstance();
      var children; // we'll monitor all new pubsub instances (created by the widget) - we don't want to rely
      // on widgets to do the right thing (and tells us what children they made)

      var pubsub = this.getService('PubSub');

      var existingSubscribers = _.keys(pubsub._issuedKeys);

      if ('activate' in instance) {
        if (this.debug) {
          console.log('application: ' + symbolicName + '.activate(beehive)');
        }

        children = instance.activate(hardenedBee);
      }

      var newSubscribers = _.without(_.keys(pubsub._issuedKeys), _.keys(pubsub._issuedKeys));

      this._registerBarbarian(symbolicName, instance, children, hardenedBee, newSubscribers);

      return instance;
    },
    _lazyLoadIfNecessary: function _lazyLoadIfNecessary(cat, name) {
      var defer = $.Deferred();
      var self = this;
      var loader;
      var placeholder;

      if (cat == 'plugin') {
        placeholder = self.__plugins;
      } else if (cat == 'widget') {
        placeholder = self.__widgets;
      } else {
        throw new Error(cat + ' cannot be lazy loaded, sorry');
      }

      var thing = placeholder.get(name);

      if (thing == null) {
        defer.reject(name + ' does not exist');
      } else if (thing && thing.lazyLoad) {
        // load it
        thing().done(function (cat, loadedModule) {
          self._registerLoadedModules(cat, loadedModule);

          defer.resolve();
        });
      } else {
        // has already been loaded
        defer.resolve();
      }

      return defer.promise();
    },
    _isBarbarianAlive: function _isBarbarianAlive(symbolicName) {
      return !!this.__barbarianInstances[symbolicName];
    },
    _getBarbarian: function _getBarbarian(symbolicName) {
      return this.__barbarianInstances[symbolicName].parent;
    },
    _registerBarbarian: function _registerBarbarian(symbolicName, instance, children, hardenedBee, illegitimateChildren) {
      this._killBarbarian(symbolicName);

      if ('getBeeHive' in instance) {
        this.__barbarianRegistry[instance.getBeeHive().getService('PubSub').getCurrentPubSubKey().getId()] = symbolicName;
      } else {
        this.__barbarianRegistry[hardenedBee.getService('PubSub').getCurrentPubSubKey().getId()] = symbolicName;
      }

      var childNames = [];

      if (children) {
        childNames = this._registerBarbarianChildren(symbolicName, children);
      }

      if (illegitimateChildren) {
        _.each(illegitimateChildren, function (childKey) {
          if (this.__barbarianRegistry[childKey]) {
            // already declared
            delete illegitimateChildren[childKey];
          }
        }, this);
      }

      this.__barbarianInstances[symbolicName] = {
        parent: instance,
        children: childNames,
        beehive: hardenedBee,
        counter: 0,
        psk: hardenedBee.getService('PubSub').getCurrentPubSubKey(),
        bastards: illegitimateChildren // no, i'm not mean, i'm French

      };
    },

    /**
     *
     * @param prefix
     *  (String) the name of the father
     * @param children
     *  (Object) where keys are the 'strings' (names) and values are
     *  instances (of the widgets)
     * @return {Array}
     * @private
     */
    _registerBarbarianChildren: function _registerBarbarianChildren(prefix, children) {
      var childrenNames = [];

      _.each(children, function (child, key) {
        var name = prefix + '-' + (child.name || key);
        if (this.debug) console.log('adding child object to registry: ' + name);

        if (this._isBarbarianAlive(name)) {
          throw new Error('Contract breach, there already exists instance with a name: ' + name);
        }

        if ('getBeeHive' in child) {
          var childPubKey = child.getBeeHive().getService('PubSub').getCurrentPubSubKey().getId();
          if (this.__barbarianRegistry[childPubKey]) throw new Error('Contract breach, the child of ' + prefix + 'is using the same pub-sub-key');
          this.__barbarianRegistry[childPubKey] = name;
        }

        childrenNames.unshift(name);
      }, this);

      return childrenNames;
    },

    /**
     * Remove/destroy the instance - but only if the counter reaches zero (or if the
     * force parameter is true) - that means that the children are exterminated together
     * with their parents. this is to avoid polluting the memory, because every child
     * has a name of the parent. So if the parent is not used by anyone, then the
     * counter is zero
     *
     * @param symbolicName
     * @param force
     * @private
     */
    _killBarbarian: function _killBarbarian(symbolicName, force) {
      var b = this.__barbarianInstances[symbolicName];
      if (!b) return;

      if (b.counter > 0 && force !== true) {
        // keep it alive, it is referenced somewhere else
        return;
      }

      if (b.children) {
        _.each(b.children, function (childName) {
          this._killBarbarian(childName, true);
        }, this);
      }

      _.each(this.__barbarianRegistry, function (value, key) {
        if (value == symbolicName) delete this.__barbarianRegistry[key];
      }, this); // unsubscribe this widget from pubsub (don't rely on the widget
      // doing the right thing)


      var pubsub = this.getService('PubSub');

      if (b.psk) {
        pubsub.unsubscribe(b.psk);
      } // painstaikingly discover undeclared children and unsubscribe them


      if (b.bastards && false) {
        // deactivate, it causes problems
        var kmap = {};

        _.each(b.bastards, function (psk) {
          kmap[psk] = 1;
        }, this);

        _.each(pubsub._events, function (val, evName) {
          _.each(val, function (v) {
            if (v.ctx.getId && kmap[v.ctx.getId()]) {
              pubsub.unsubscribe(v.ctx);
            }
          }, this);
        }, this);
      }

      b.parent.destroy();
      delete this.__barbarianInstances[symbolicName];
      if ('setBeeHive' in b.parent) b.parent.setBeeHive({
        fake: 'one'
      });
      b = null;
      if (this.debug) console.log('Destroyed: ' + symbolicName);
    },
    getAllControllers: function getAllControllers() {
      return _.pairs(this.__controllers.container);
    },
    getAllModules: function getAllModules() {
      return _.pairs(this.__modules.container);
    },
    getAllPlugins: function getAllPlugins(key) {
      key = key || 'plugin:';
      var defer = $.Deferred();
      var w = [];

      _.each(this.__barbarianInstances, function (val, k) {
        if (k.indexOf(key) > -1) w.unshift(k.replace(key, ''));
      });

      var getter = key.indexOf('plugin:') > -1 ? this.getPlugin : this.getWidget;
      getter.apply(this, w).done(function (widget) {
        var out = [];

        if (w.length > 1) {
          out = _.pairs(widget);
        } else if (w.length == 1) {
          out = [[w[0], widget]];
        }

        defer.resolve(out);
      });
      return defer.promise();
    },
    getAllWidgets: function getAllWidgets() {
      return this.getAllPlugins('widget:');
    },
    getAllServices: function getAllServices() {
      return this.getBeeHive().getAllServices();
    },
    getAllObjects: function getAllObjects() {
      return this.getBeeHive().getAllObjects();
    },

    /**
     * Helper method to invoke a 'function' on all objects
     * that are inside the application
     *
     * @param funcName
     * @param options
     */
    triggerMethodOnAll: function triggerMethodOnAll(funcName, options) {
      this.triggerMethod(this.getAllControllers(), 'controllers', funcName, options);
      this.triggerMethod(this.getAllModules(), 'modules', funcName, options);
      var self = this;
      this.getAllPlugins().done(function (plugins) {
        if (plugins.length) self.triggerMethod(plugins, 'plugins', funcName, options);
      });
      this.getAllWidgets().done(function (widgets) {
        if (widgets.length) self.triggerMethod(widgets, 'widgets', funcName, options);
      });
      this.triggerMethod(this.getBeeHive().getAllServices(), 'BeeHive:services', funcName, options);
      this.triggerMethod(this.getBeeHive().getAllObjects(), 'BeeHive:objects', funcName, options);
    },
    triggerMethod: function triggerMethod(objects, msg, funcName, options) {
      var self = this;

      var rets = _.map(objects, function (el) {
        var obj = el[1];

        if (funcName in obj) {
          if (self.debug) {
            console.log('application.triggerMethod: ' + msg + ': ' + el[0] + '.' + funcName + '()');
          }

          obj[funcName].call(obj, options);
        } else if (_.isFunction(funcName)) {
          if (self.debug) {
            console.log('application.triggerMethod: ' + msg + ': ' + el[0] + ' customCallback()');
          }

          funcName.call(obj, msg + ':' + el[0], options);
        }
      });

      return rets;
    }
  }); // give it subclassing functionality


  Application.extend = Backbone.Model.extend;
  return Application.extend(ApiAccess);
});

/*
 widgets can attach callbacks to a deferred that waits until
 * a new csrf token has been requested
 *
 * */
define('js/components/csrf_manager',['backbone', 'js/components/generic_module', 'js/mixins/hardened', 'js/components/api_request', 'js/components/api_targets', 'js/mixins/dependon'], function (Backbone, GenericModule, Hardened, ApiRequest, ApiTargets, Dependon) {
  var CSRFManager = GenericModule.extend({
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();

      _.bindAll(this, ['resolvePromiseWithNewKey']);

      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.resolvePromiseWithNewKey);
    },
    getCSRF: function getCSRF() {
      this.deferred = $.Deferred();
      var request = new ApiRequest({
        target: ApiTargets.CSRF
      });
      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.EXECUTE_REQUEST, request);
      return this.deferred.promise();
    },
    resolvePromiseWithNewKey: function resolvePromiseWithNewKey(response) {
      // get csrf here
      var csrf = response.toJSON().csrf;
      this.deferred.resolve(csrf);
    },
    hardenedInterface: {
      getCSRF: 'getCSRF'
    }
  });

  _.extend(CSRFManager.prototype, Hardened, Dependon.BeeHive);

  return CSRFManager;
});

define('js/components/doc_stash_controller',['backbone', 'js/components/generic_module', 'js/mixins/hardened', 'js/mixins/dependon'], function (Backbone, GenericModule, Hardened, Dependon) {
  /*
   * this is used to store docs requested by results widget
   * for the use of other widgets, to reduce api requests
   * and speed loading. Right now it's only used by
   * the abstract widget.
   * */
  var DocStashController = GenericModule.extend({
    _docs: [],
    activate: function activate(beehive) {
      this.setBeeHive(beehive.getHardenedInstance());
      var pubsub = this.getBeeHive().getService('PubSub');
      pubsub.subscribe(pubsub.START_SEARCH, _.bind(this.emptyStash, this));
    },
    stashDocs: function stashDocs(docs) {
      this._docs.push.apply(this._docs, docs);
    },
    getDocs: function getDocs() {
      return _.cloneDeep(this._docs);
    },
    emptyStash: function emptyStash() {
      this._docs = [];
    },
    hardenedInterface: {
      stashDocs: 'stash docs',
      getDocs: 'getDocs'
    }
  });

  _.extend(DocStashController.prototype, Hardened, Dependon.BeeHive);

  return DocStashController;
});

define('js/components/experiments',['underscore', 'jquery', 'js/components/generic_module', 'js/mixins/dependon', 'analytics', 'js/components/pubsub_events'], function (_, $, GenericModule, Dependon, analytics, PubsubEvents) {
  var Experiments = GenericModule.extend({
    initialize: function initialize() {
      // store all metadata entries here
      this.isRunning = false;
    },
    activate: function activate(beehive, app) {
      this.setApp(app);
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();

      if (!window.gtag) {
        window.gtag = function () {
          if (_.isArray(window.dataLayer)) {
            window.dataLayer.push(arguments);
          }
        };

        window.gtag('event', 'optimize.callback', {
          callback: function callback(value, name) {
            console.log('Experiment with ID: ' + name + ' is on variant: ' + value);
          }
        });
      }

      pubsub.subscribe(pubsub.APP_BOOTSTRAPPED, _.bind(this.onAppStarted, this));
    },

    /**
     *
     * callback that can be used by external components; they can listen to BBB and then run their experiment
     *
     * */
    subscribe: function subscribe(event, callback) {
      var pubsub = this.getPubSub();

      if (PubsubEvents[event]) {
        pubsub.subscribe(PubsubEvents[event], callback);
      }
    },
    subscribeOnce: function subscribeOnce(event, callback) {
      var pubsub = this.getPubSub();

      if (PubsubEvents[event]) {
        pubsub.subscribeOnce(PubsubEvents[event], callback);
      }
    },
    onAppStarted: function onAppStarted() {
      this.toggleOptimize();
    },
    toggleOptimize: function toggleOptimize() {
      if (!window.dataLayer) {
        console.warn('Optimize is not available, we are not running any experiment');
        return;
      }

      if (this.isRunning) {
        window.dataLayer.push({
          event: 'optimize.deactivate'
        });
      } else {
        window.dataLayer.push({
          event: 'optimize.activate'
        });
      }

      this.isRunning = !this.isRunning;
    }
  });

  _.extend(Experiments.prototype, Dependon.BeeHive, Dependon.App);

  return Experiments;
});

/**
 * Created by rchyla on 12/2/14.
 */

/**
 * Mediator to coordinate API-feedback exchange
 * and react on them
 */
define('js/components/feedback_mediator',['underscore', 'jquery', 'cache', 'js/components/generic_module', 'js/components/api_request', 'js/components/api_response', 'js/components/api_query_updater', 'js/components/api_feedback', 'js/components/pubsub_key', 'js/mixins/dependon'], function (_, $, Cache, GenericModule, ApiRequest, ApiResponse, ApiQueryUpdater, ApiFeedback, PubSubKey, Dependon) {
  var ErrorMediator = GenericModule.extend({
    initialize: function initialize(options) {
      this._cache = this._getNewCache(options.cache);
      this.debug = options.debug || false;
      this._handlers = {};
      this.app = null; // reference to the main application
    },
    _getNewCache: function _getNewCache(options) {
      return new Cache(_.extend({
        maximumSize: 150,
        expiresAfterWrite: 60 * 30 // 30 mins

      }, _.isObject(options) ? options : {}));
    },

    /**
     * Starts listening on the PubSub
     *
     * @param beehive - the full access instance; we excpect PubSub to be
     *    present
     */
    activate: function activate(beehive, app) {
      if (!app) throw new Error('This controller absolutely needs access to the app');
      this.setBeeHive(beehive);
      this.setApp(app);
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.FEEDBACK, _.bind(this.receiveFeedback, this));
    },

    /**
     * This method receives ApiFeedback objects (usually from the API)
     * and decides what to do with them.
     *
     * @param apiFeedback
     * @param senderKey - if present, identifies the widget that made
     *                    the request
     */
    receiveFeedback: function receiveFeedback(apiFeedback, senderKey) {
      if (this.debug) console.log('[EM]: received feedback:', apiFeedback.toJSON(), senderKey ? senderKey.getId() : null);

      var componentKey = this._getCacheKey(apiFeedback, senderKey);

      var entry = this._retrieveCacheEntry(componentKey);

      if (!entry) {
        entry = this.createNewCacheEntry(componentKey);

        this._cache.put(componentKey, entry);
      }

      var handler = this.getFeedbackHandler(apiFeedback, entry);

      if (handler) {
        if (handler.execute && handler.execute(apiFeedback, entry)) {
          return;
        }

        if (handler.call(this, apiFeedback, entry)) {
          return;
        }
      }

      this.handleFeedback(apiFeedback, entry);
    },
    removeFeedbackHandler: function removeFeedbackHandler(name) {
      if (name.toString() in this._handlers) delete this._handlers[name.toString()];
    },
    addFeedbackHandler: function addFeedbackHandler(code, func) {
      if (!code && !_.isNumber(code)) throw new Error('first argument must be code or code:string or string');
      if (!_.isFunction(func)) throw new Error('second argument must be executable');
      this._handlers[code.toString()] = func;
    },
    getFeedbackHandler: function getFeedbackHandler(apiFeedback, entry) {
      var keys = [apiFeedback.code + ':' + entry.id, entry.id, apiFeedback.code ? apiFeedback.code.toString() : Date.now()];

      for (var i = 0; i < keys.length; i++) {
        if (keys[i] in this._handlers) {
          return this._handlers[keys[i]];
        }
      }
    },
    _retrieveCacheEntry: function _retrieveCacheEntry(componentKey) {
      return this._cache.getSync(componentKey);
    },

    /**
     * Creates a unique, cleaned key from the request and the apiQuery
     * @param apiFeedback
     *    instance of {ApiFeedback}
     * @param senderKey
     *    string or instance of {PubSubKey}
     */
    _getCacheKey: function _getCacheKey(apiFeedback, senderKey) {
      if (!apiFeedback) throw new Error('ApiFeedback cannot be empty');
      if (apiFeedback.getSenderKey()) return apiFeedback.getSenderKey();

      if (senderKey) {
        if (senderKey instanceof PubSubKey) {
          return senderKey.getId();
        }

        if (_.isString(senderKey)) {
          return senderKey;
        }
      }

      var req = apiFeedback.getApiRequest();

      if (req) {
        return req.url();
      }

      throw new Error('We cannot identify the origin (recipient) of this feedback');
    },
    createNewCacheEntry: function createNewCacheEntry(componentKey) {
      return {
        waiting: 0,
        max: 0,
        errors: 0,
        counter: 0,
        created: Date.now(),
        id: componentKey
      };
    },

    /**
     * This is a default feedback handling; it executes only IFF
     * it was not handled by specific handlers.
     *
     * @param apiFeedback
     * @param entry
     */
    handleFeedback: function handleFeedback(apiFeedback, entry) {
      var c = ApiFeedback.CODES;
      entry.counter += 1;

      switch (apiFeedback.code) {
        case c.ALL_FINE:
          entry.errors = 0;
          break;

        case c.KEEP_WAITING:
          entry.waiting += entry.started;
          break;

        case c.SERVER_ERROR:
          break;

        case c.ALERT:
          this.getApp().getController('AlertsController').onAlert(apiFeedback, entry);
          break;

        default:
      }
    }
  });

  _.extend(ErrorMediator.prototype, Dependon.BeeHive, Dependon.App);

  return ErrorMediator;
});

define('js/components/history_manager',['js/components/generic_module', 'js/mixins/dependon', 'js/mixins/hardened', 'js/components/pubsub_key'], function (GenericModule, Dependon, Hardened, PubSubKey) {
  var History = GenericModule.extend({
    initialize: function initialize() {
      this._history = [];
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.NAVIGATE, _.bind(this.recordNav, this));
    },
    recordNav: function recordNav() {
      this._history.push([].slice.apply(arguments));
    },
    getCurrentNav: function getCurrentNav() {
      return this._history[this._history.length - 1];
    },
    getPreviousNav: function getPreviousNav() {
      return this._history[this._history.length - 2];
    },
    hardenedInterface: {
      getPreviousNav: '',
      getCurrentNav: ''
    }
  });

  _.extend(History.prototype, Dependon.BeeHive, Hardened);

  return History;
});

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*! hotkeys-js v3.8.3 | MIT (c) 2021 kenny wong <wowohoo@qq.com> | http://jaywcjlove.github.io/hotkeys */
!function (e, t) {
  "object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define('hotkeys',t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).hotkeys = t();
}(this, function () {
  "use strict";

  var e = "undefined" != typeof navigator && 0 < navigator.userAgent.toLowerCase().indexOf("firefox");

  function u(e, t, n) {
    e.addEventListener ? e.addEventListener(t, n, !1) : e.attachEvent && e.attachEvent("on".concat(t), function () {
      n(window.event);
    });
  }

  function p(e, t) {
    for (var n = t.slice(0, t.length - 1), o = 0; o < n.length; o++) {
      n[o] = e[n[o].toLowerCase()];
    }

    return n;
  }

  function d(e) {
    "string" != typeof e && (e = "");

    for (var t = (e = e.replace(/\s/g, "")).split(","), n = t.lastIndexOf(""); 0 <= n;) {
      t[n - 1] += ",", t.splice(n, 1), n = t.lastIndexOf("");
    }

    return t;
  }

  for (var t = {
    backspace: 8,
    tab: 9,
    clear: 12,
    enter: 13,
    return: 13,
    esc: 27,
    escape: 27,
    space: 32,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    del: 46,
    delete: 46,
    ins: 45,
    insert: 45,
    home: 36,
    end: 35,
    pageup: 33,
    pagedown: 34,
    capslock: 20,
    num_0: 96,
    num_1: 97,
    num_2: 98,
    num_3: 99,
    num_4: 100,
    num_5: 101,
    num_6: 102,
    num_7: 103,
    num_8: 104,
    num_9: 105,
    num_multiply: 106,
    num_add: 107,
    num_enter: 108,
    num_subtract: 109,
    num_decimal: 110,
    num_divide: 111,
    "\u21EA": 20,
    ",": 188,
    ".": 190,
    "/": 191,
    "`": 192,
    "-": e ? 173 : 189,
    "=": e ? 61 : 187,
    ";": e ? 59 : 186,
    "'": 222,
    "[": 219,
    "]": 221,
    "\\": 220
  }, y = {
    "\u21E7": 16,
    shift: 16,
    "\u2325": 18,
    alt: 18,
    option: 18,
    "\u2303": 17,
    ctrl: 17,
    control: 17,
    "\u2318": 91,
    cmd: 91,
    command: 91
  }, h = {
    16: "shiftKey",
    18: "altKey",
    17: "ctrlKey",
    91: "metaKey",
    shiftKey: 16,
    ctrlKey: 17,
    altKey: 18,
    metaKey: 91
  }, m = {
    16: !1,
    18: !1,
    17: !1,
    91: !1
  }, v = {}, n = 1; n < 20; n++) {
    t["f".concat(n)] = 111 + n;
  }

  var g = [],
      o = "all",
      w = [],
      k = function k(e) {
    return t[e.toLowerCase()] || y[e.toLowerCase()] || e.toUpperCase().charCodeAt(0);
  };

  function r(e) {
    o = e || "all";
  }

  function O() {
    return o || "all";
  }

  function a(e) {
    var a = e.scope,
        f = e.method,
        t = e.splitKey,
        c = void 0 === t ? "+" : t;
    d(e.key).forEach(function (e) {
      var t = e.split(c),
          n = t.length,
          o = t[n - 1],
          i = "*" === o ? "*" : k(o);

      if (v[i]) {
        a = a || O();
        var r = 1 < n ? p(y, t) : [];
        v[i] = v[i].map(function (e) {
          return f && e.method !== f || e.scope !== a || !function (e, t) {
            for (var n = e.length < t.length ? t : e, o = e.length < t.length ? e : t, i = !0, r = 0; r < n.length; r++) {
              ~o.indexOf(n[r]) || (i = !1);
            }

            return i;
          }(e.mods, r) ? e : {};
        });
      }
    });
  }

  function K(e, t, n) {
    var o;

    if (t.scope === n || "all" === t.scope) {
      for (var i in o = 0 < t.mods.length, m) {
        Object.prototype.hasOwnProperty.call(m, i) && (!m[i] && ~t.mods.indexOf(+i) || m[i] && !~t.mods.indexOf(+i)) && (o = !1);
      }

      (0 !== t.mods.length || m[16] || m[18] || m[17] || m[91]) && !o && "*" !== t.shortcut || !1 === t.method(e, t) && (e.preventDefault ? e.preventDefault() : e.returnValue = !1, e.stopPropagation && e.stopPropagation(), e.cancelBubble && (e.cancelBubble = !0));
    }
  }

  function b(n) {
    var e = v["*"],
        t = n.keyCode || n.which || n.charCode;

    if (x.filter.call(this, n)) {
      if (93 !== t && 224 !== t || (t = 91), ~g.indexOf(t) || 229 === t || g.push(t), ["ctrlKey", "altKey", "shiftKey", "metaKey"].forEach(function (e) {
        var t = h[e];
        n[e] && !~g.indexOf(t) ? g.push(t) : !n[e] && ~g.indexOf(t) ? g.splice(g.indexOf(t), 1) : "metaKey" === e && n[e] && 3 === g.length && (n.ctrlKey || n.shiftKey || n.altKey || (g = g.slice(g.indexOf(t))));
      }), t in m) {
        for (var o in m[t] = !0, y) {
          y[o] === t && (x[o] = !0);
        }

        if (!e) return;
      }

      for (var i in m) {
        Object.prototype.hasOwnProperty.call(m, i) && (m[i] = n[h[i]]);
      }

      n.getModifierState && (!n.altKey || n.ctrlKey) && n.getModifierState("AltGraph") && (~g.indexOf(17) || g.push(17), ~g.indexOf(18) || g.push(18), m[17] = !0, m[18] = !0);
      var r = O();
      if (e) for (var a = 0; a < e.length; a++) {
        e[a].scope === r && ("keydown" === n.type && e[a].keydown || "keyup" === n.type && e[a].keyup) && K(n, e[a], r);
      }
      if (t in v) for (var f = 0; f < v[t].length; f++) {
        if (("keydown" === n.type && v[t][f].keydown || "keyup" === n.type && v[t][f].keyup) && v[t][f].key) {
          for (var c = v[t][f], l = c.key.split(c.splitKey), s = [], u = 0; u < l.length; u++) {
            s.push(k(l[u]));
          }

          s.sort().join("") === g.sort().join("") && K(n, c, r);
        }
      }
    }
  }

  function x(e, t, n) {
    g = [];
    var o = d(e),
        i = [],
        r = "all",
        a = document,
        f = 0,
        c = !1,
        l = !0,
        s = "+";

    for (void 0 === n && "function" == typeof t && (n = t), "[object Object]" === Object.prototype.toString.call(t) && (t.scope && (r = t.scope), t.element && (a = t.element), t.keyup && (c = t.keyup), void 0 !== t.keydown && (l = t.keydown), "string" == typeof t.splitKey && (s = t.splitKey)), "string" == typeof t && (r = t); f < o.length; f++) {
      i = [], 1 < (e = o[f].split(s)).length && (i = p(y, e)), (e = "*" === (e = e[e.length - 1]) ? "*" : k(e)) in v || (v[e] = []), v[e].push({
        keyup: c,
        keydown: l,
        scope: r,
        mods: i,
        shortcut: o[f],
        method: n,
        key: o[f],
        splitKey: s
      });
    }

    void 0 !== a && !~w.indexOf(a) && window && (w.push(a), u(a, "keydown", function (e) {
      b(e);
    }), u(window, "focus", function () {
      g = [];
    }), u(a, "keyup", function (e) {
      b(e), function (e) {
        var t = e.keyCode || e.which || e.charCode,
            n = g.indexOf(t);
        if (n < 0 || g.splice(n, 1), e.key && "meta" == e.key.toLowerCase() && g.splice(0, g.length), 93 !== t && 224 !== t || (t = 91), t in m) for (var o in m[t] = !1, y) {
          y[o] === t && (x[o] = !1);
        }
      }(e);
    }));
  }

  var i = {
    setScope: r,
    getScope: O,
    deleteScope: function deleteScope(e, t) {
      var n, o;

      for (var i in e = e || O(), v) {
        if (Object.prototype.hasOwnProperty.call(v, i)) for (n = v[i], o = 0; o < n.length;) {
          n[o].scope === e ? n.splice(o, 1) : o++;
        }
      }

      O() === e && r(t || "all");
    },
    getPressedKeyCodes: function getPressedKeyCodes() {
      return g.slice(0);
    },
    isPressed: function isPressed(e) {
      return "string" == typeof e && (e = k(e)), !!~g.indexOf(e);
    },
    filter: function filter(e) {
      var t = e.target || e.srcElement,
          n = t.tagName,
          o = !0;
      return !t.isContentEditable && ("INPUT" !== n && "TEXTAREA" !== n && "SELECT" !== n || t.readOnly) || (o = !1), o;
    },
    unbind: function unbind(e) {
      if (e) {
        if (Array.isArray(e)) e.forEach(function (e) {
          e.key && a(e);
        });else if ("object" == _typeof(e)) e.key && a(e);else if ("string" == typeof e) {
          for (var t = arguments.length, n = Array(1 < t ? t - 1 : 0), o = 1; o < t; o++) {
            n[o - 1] = arguments[o];
          }

          var i = n[0],
              r = n[1];
          "function" == typeof i && (r = i, i = ""), a({
            key: e,
            scope: i,
            method: r,
            splitKey: "+"
          });
        }
      } else Object.keys(v).forEach(function (e) {
        return delete v[e];
      });
    }
  };

  for (var f in i) {
    Object.prototype.hasOwnProperty.call(i, f) && (x[f] = i[f]);
  }

  if ("undefined" != typeof window) {
    var c = window.hotkeys;
    x.noConflict = function (e) {
      return e && window.hotkeys === x && (window.hotkeys = c), x;
    }, window.hotkeys = x;
  }

  return x;
});

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

define('js/components/hotkeys_controller',['js/components/generic_module', 'js/mixins/dependon', 'js/mixins/hardened', 'js/components/api_feedback', 'hotkeys'], function (GenericModule, Dependon, Hardened, ApiFeedback, hotkeys) {
  var MODIFIER = 'alt+shift';

  var mod = function mod(val) {
    var arr = Array.isArray(val) ? val : [val];
    return arr.map(function (key) {
      return "".concat(MODIFIER, "+").concat(key);
    }).join(', ');
  };

  var HOTKEYS = [{
    hotkey: mod('a'),
    event: 'search',
    description: 'Focus on search bar'
  }, {
    hotkey: mod('left'),
    event: 'prev',
    description: 'Previous results page'
  }, {
    hotkey: mod('right'),
    event: 'next',
    description: 'Next results page'
  }, {
    hotkey: mod('down'),
    event: 'item-next',
    description: 'Focus on next result entry'
  }, {
    hotkey: mod('up'),
    event: 'item-prev',
    description: 'Focus on previous result entry'
  }, {
    hotkey: mod('s'),
    event: 'item-select',
    description: 'Select currently focused result entry'
  }, {
    hotkey: mod('`'),
    event: 'show-help',
    description: 'Show help dialog'
  }];
  var HotkeysController = GenericModule.extend({
    initialize: function initialize() {},
    createEvent: function createEvent(name) {
      var ps = this.getPubSub();
      return function (e) {
        ps.publish(ps.CUSTOM_EVENT, name, e);
      };
    },
    activate: function activate(beehive) {
      var _this = this;

      this.setBeeHive(beehive);
      HOTKEYS.forEach(function (_ref) {
        var hotkey = _ref.hotkey,
            event = _ref.event;
        hotkeys(hotkey, _this.createEvent("hotkey/".concat(event)));
      });
      var ps = this.getPubSub();
      ps.subscribe(ps.CUSTOM_EVENT, function (e) {
        if (e === 'hotkey/show-help') {
          _this.showHelpModal();
        }
      });
    },
    getHotkeys: function getHotkeys() {
      return HOTKEYS;
    },
    showHelpModal: function showHelpModal() {
      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.FEEDBACK, new ApiFeedback({
        code: ApiFeedback.CODES.ALERT,
        msg: this.getModalMessage(),
        title: 'Hotkeys',
        modal: true
      }));
    },
    getModalMessage: function getModalMessage() {
      return ['<dl style="display: flex; flex-flow: row wrap;">'].concat(_toConsumableArray(HOTKEYS.map(function (_ref2) {
        var hotkey = _ref2.hotkey,
            description = _ref2.description;
        var hotkeyList = hotkey.split(', ').map(function (c) {
          return "<code>".concat(c, "</code>");
        }).join(', ');
        return "\n            <dt style=\"flex-basis: 40%; text-align: right; padding-right: 10px\">".concat(hotkeyList, "</dt>\n            <dd style=\"flex-basis: 60%\">").concat(description, "</dd>\n          ");
      })), ['</dl>']).join('');
    },
    hardenedInterface: {}
  });

  _.extend(HotkeysController.prototype, Dependon.BeeHive, Hardened);

  return HotkeysController;
});

define('js/components/library_controller',['backbone', 'js/components/generic_module', 'js/mixins/hardened', 'js/components/api_targets', 'js/components/api_request', 'js/components/api_feedback', 'js/components/api_query', 'js/mixins/dependon'], function (Backbone, GenericModule, Hardened, ApiTargets, ApiRequest, ApiFeedback, ApiQuery, Dependon) {
  var LibraryModel = Backbone.Model.extend({
    defaults: function defaults() {
      // this is the data we expect to get from the server
      return {
        num_documents: 0,
        date_last_modified: undefined,
        permission: undefined,
        description: '',
        public: false,
        num_users: 1,
        owner: undefined,
        date_created: undefined,
        id: undefined,
        title: ''
      };
    }
  });
  var LibraryCollection = Backbone.Collection.extend({
    model: LibraryModel
  });
  var LibraryController = GenericModule.extend({
    initialize: function initialize() {
      // store all metadata entries here
      this.collection = new LibraryCollection();
    },
    activate: function activate(beehive) {
      var self = this;
      this.setBeeHive(beehive.getHardenedInstance());
      var pubsub = this.getBeeHive().getService('PubSub');
      pubsub.subscribe(pubsub.INVITING_REQUEST, _.bind(this.updateCurrentQuery, this));
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, _.bind(this.handleUserAnnouncement, this));
      pubsub.subscribe(pubsub.CUSTOM_EVENT, function (event) {
        if (event === 'invalidate-library-metadata') {
          self._metadataLoaded = false;
        }
      });
      /*
       * the three events that come from changing a collection:
       * -change if a model's contents were changed
       * -add if models were added
       * -reset if the entire collection was reset
       * -remove when a model is removed (library deleted)
       * */

      _.each(['change', 'add', 'reset', 'remove'], function (ev) {
        this.listenTo(this.collection, ev, function (arg1, arg2) {
          if (ev == 'change' && arg1 instanceof Backbone.Model) {
            // a single model changed, widgets might want to know which one
            pubsub.publish(pubsub.LIBRARY_CHANGE, this.collection.toJSON(), {
              ev: ev,
              id: arg1.id
            }); // also clear out the bibcode cache if necessary

            delete this._libraryBibcodeCache[arg1.id];
          } else {
            pubsub.publish(pubsub.LIBRARY_CHANGE, this.collection.toJSON(), {
              ev: ev
            });
          }
        });
      }, this);
    },
    handleUserAnnouncement: function handleUserAnnouncement(event) {
      if (event == 'user_signed_in') {
        this._fetchAllMetadata();
      } else if (event == 'user_signed_out') {
        this.collection.reset({});
      }
    },

    /*
     * private methods
     */
    updateCurrentQuery: function updateCurrentQuery(apiQuery) {
      this._currentQuery = apiQuery;
    },
    composeRequest: function composeRequest(target, method, options) {
      var request;
      var options = options || {};
      var data = options.data || undefined; // using "endpoint" to mean the actual url string
      // get data from the relevant model based on the endpoint

      var deferred = $.Deferred();

      function done() {
        var args = [_.extend(arguments[0], options.extraArguments), [].slice(arguments, 1)];
        deferred.resolve.apply(undefined, args);
      }

      function fail(error) {
        // on fail, send a custom event to alert library widgets
        var ps = this.getPubSub();
        ps.publish(ps.CUSTOM_EVENT, 'libraries:request:fail', error);
        deferred.reject.apply(undefined, arguments);
      }

      request = new ApiRequest({
        target: target,
        options: {
          context: this,
          type: method,
          data: JSON.stringify(data),
          contentType: 'application/json',
          done: done,
          fail: fail
        }
      });
      this.getBeeHive().getService('Api').request(request);
      return deferred.promise();
    },
    _executeApiRequest: function _executeApiRequest(apiQuery) {
      var req = new ApiRequest({
        target: ApiTargets.SEARCH,
        query: apiQuery
      });
      var defer = $.Deferred();
      var pubsub = this.getPubSub();
      pubsub.subscribeOnce(pubsub.DELIVERING_RESPONSE, _.bind(function (data) {
        defer.resolve(data);
      }), this);
      pubsub.publish(pubsub.EXECUTE_REQUEST, req);
      return defer.promise();
    },
    _getBibcodes: function _getBibcodes(options) {
      var deferred = $.Deferred();
      var that = this;

      if (options.bibcodes == 'all') {
        var makeRequest = function makeRequest() {
          q.set('start', start);

          this._executeApiRequest(q).done(function (apiResponse) {
            var bibs = _.map(apiResponse.get('response.docs'), function (d) {
              return d.bibcode;
            });

            [].push.apply(bibcodes, bibs);
            start += rows;

            if (start < limit) {
              makeRequest.call(that);
            } else {
              deferred.resolve(bibcodes);
            }
          });
        };

        var limit = options.limit || 2000;
        var start = 0;
        var rows = 100;
        var bibcodes = [];

        var q = this._currentQuery.clone();

        q.unlock();
        q.set('rows', 100);
        q.set('fl', 'bibcode');
        makeRequest.call(this);
      } else if (options.bibcodes == 'selected') {
        var bibs = this.getBeeHive().getObject('AppStorage').getSelectedPapers();
        deferred.resolve(bibs);
      } // for abstract widget
      else if (_.isArray(options.bibcodes)) {
          deferred.resolve(options.bibcodes);
        } else {
          throw new Error('should we add all bibcodes or only selected ones?');
        }

      return deferred.promise();
    },
    _fetchAllMetadata: function _fetchAllMetadata() {
      var that = this;
      var endpoint = ApiTargets.LIBRARIES;
      return this.composeRequest(endpoint, 'GET').done(function (data) {
        that._metadataLoaded = true;
        that.collection.reset(data.libraries);
      });
    },

    /*
     * public methods
     *
     */

    /*
     * this is how widgets/controllers can learn about
     * all libraries
     * if you provide an id, you just get info
     * about the lib with that id
     * */
    getLibraryMetadata: function getLibraryMetadata(id) {
      // check to see if the id is even in the collection,
      // if not return fetchLibraryMetadata;
      if (id && !this.collection.get(id)) {
        return this.fetchLibraryMetadata(id);
      }

      var deferred = $.Deferred();
      var that = this; // if this is the initial check, just wait until we can load the metadata

      if (!this._metadataLoaded) {
        this._fetchAllMetadata().done(function (data) {
          // make sure the collection is refilled before this promise is resolved
          setTimeout(function () {
            var data = id ? that.collection.get(id).toJSON() : that.collection.toJSON();
            deferred.resolve(data);
          }, 1);
        });
      } else {
        var data = id ? that.collection.get(id).toJSON() : that.collection.toJSON();
        deferred.resolve(data);
      }

      return deferred.promise();
    },

    /*
     * fetch the data especially -- useful for public libraries but also
     * in case the new data hasn't been added to the collection yet
     * */
    fetchLibraryMetadata: function fetchLibraryMetadata(id) {
      var that = this;
      if (!id) throw new Error('need to provide a library id');
      var deferred = $.Deferred();
      this.composeRequest(ApiTargets.LIBRARIES + '/' + id).done(function (data) {
        deferred.resolve(data.metadata); // set into collection

        that.collection.add(data.metadata, {
          merge: true
        });
      }).fail(function () {
        // just navigate to a 404 page
        that.getPubSub().publish(that.getPubSub().NAVIGATE, '404');
      });
      return deferred.promise();
    },

    /*
     *
     * here, store lists of bibcodes requested from the 'getLibraryBibcodes'
     * method. they are stored here so that if a user quickly toggles back
     * and forth between the export/metrics/vis widget, we won't have to re-fetch
     * the bibcodes
     * */
    _libraryBibcodeCache: {},

    /*
     * get list of 2000 bibcodes,
     * this is used for fetching data for export, metrics, etc
     *
     * */
    getLibraryBibcodes: function getLibraryBibcodes(id) {
      var deferred = $.Deferred();
      var that = this; // hard limit, no more than 10,000 records can be exported to search results page

      var maxReturned = 10000; // we already have it in the cache, so just resolve + return promise

      if (this._libraryBibcodeCache[id]) {
        deferred.resolve(this._libraryBibcodeCache[id]);
        return deferred.promise();
      }

      var limit = maxReturned; // start gets incremented

      var start = 0;
      var rows = 100;
      var bibcodes = [];
      var endpoint = ApiTargets.LIBRARIES + '/' + id;
      var that = this; // this function gets called repeatedly

      function done(data) {
        limit = data.solr.response.numFound > maxReturned ? maxReturned : data.solr.response.numFound;

        var bibs = _.pluck(data.solr.response.docs, 'bibcode');

        [].push.apply(bibcodes, bibs);
        start += rows;

        if (start < limit) {
          makeRequest();
        } else {
          that._libraryBibcodeCache[id] = bibcodes;
          deferred.resolve(bibcodes);
        }
      }

      function makeRequest() {
        var q = new ApiQuery();
        q.set('rows', 100);
        q.set('fl', 'bibcode');
        q.set('start', start);
        var request = new ApiRequest({
          target: endpoint,
          query: q,
          options: {
            context: this,
            contentType: 'application/x-www-form-urlencoded',
            done: done,
            fail: this.handleError
          }
        });
        that.getBeeHive().getService('Api').request(request);
      }

      makeRequest.call(this);
      return deferred.promise();
    },

    /*
     * requires id, name, description
     */
    createLibrary: function createLibrary(data) {
      var that = this;
      var endpoint = ApiTargets.LIBRARIES;
      return this.composeRequest(endpoint, 'POST', {
        data: data
      }).done(function () {
        // refresh collection
        that._fetchAllMetadata();
      });
    },
    deleteLibrary: function deleteLibrary(id, name) {
      var that = this;
      var endpoint = ApiTargets.DOCUMENTS + '/' + id;
      var name;
      var promise = this.composeRequest(endpoint, 'DELETE').done(function () {
        // delete library from internal representation
        that.collection.remove(id); // take care of ui

        that.getBeeHive().getService('PubSub').publish(that.getBeeHive().getService('PubSub').NAVIGATE, 'AllLibrariesWidget', 'libraries');
        var message = 'Library <b>' + name + '</b> was successfully deleted';
        that.getBeeHive().getService('PubSub').publish(that.getBeeHive().getService('PubSub').ALERT, new ApiFeedback({
          code: 0,
          msg: message,
          type: 'success'
        }));
      }).fail(function (jqXHR) {
        var error = JSON.parse(jqXHR.responseText).error;
        var message = 'Library <b>' + name + '</b> could not be deleted : (' + error + ')';
        that.getBeeHive().getService('PubSub').publish(that.getBeeHive().getService('PubSub').ALERT, new ApiFeedback({
          code: 0,
          msg: message,
          type: 'danger'
        }));
      });
      return promise;
    },

    /*
     * @param id
     * @param updateData e.g. {bibcode:[1,2,3], action: "add/remove" }
     *
     */
    updateLibraryContents: function updateLibraryContents(id, updateData) {
      var that = this;
      var data = {
        data: updateData,
        extraArguments: {
          numBibcodesRequested: updateData.bibcode.length
        }
      };
      var endpoint = ApiTargets.DOCUMENTS + '/' + id;
      return this.composeRequest(endpoint, 'POST', data).done(function () {
        that.fetchLibraryMetadata(id);
      }).fail(function (jqXHR) {
        var error = JSON.parse(jqXHR.responseText).error;
        var message = 'Library <b>' + that.collection.get(id).title + '</b> could not be updated: (' + error + ')';
        that.getBeeHive().getService('PubSub').publish(that.getBeeHive().getService('PubSub').ALERT, new ApiFeedback({
          code: 0,
          msg: message,
          type: 'danger'
        }));
      });
    },
    performLibraryOperation: function performLibraryOperation(libId, options) {
      if (!options) {
        throw new Error('must provide options object with action and set of secondary libraries (if necessary)');
      }

      var data = {};
      var action = options.action && options.action.toLowerCase();
      var libraries = options.libraries;
      var name = options.name;
      var isAdvancedAction = /^(union|intersection|difference)$/.test(action);
      var isCopyAction = /^copy$/.test(action);
      var isEmptyAction = /^empty$/.test(action);

      if (!_.isString(action) || !isAdvancedAction && !isCopyAction && !isEmptyAction) {
        throw new Error(action + ' is not one of the defined actions');
      }

      if (!_.isString(libId)) {
        throw new Error('must pass library ID as first parameter');
      }

      if (isAdvancedAction && !_.isArray(libraries)) {
        throw new Error('libraries must be an array');
      }

      if (isCopyAction && (!_.isArray(libraries) || libraries.length !== 1)) {
        throw new Error('for copy action, libraries must have exactly 1 entry');
      } // make sure that we don't send duplicate library ids


      libraries = _.unique(libraries);

      _.extend(data, {
        action: action
      });

      if (isAdvancedAction) {
        _.extend(data, {
          libraries: libraries,
          name: name
        });
      } else if (isCopyAction) {
        _.extend(data, {
          libraries: libraries
        });
      }

      var endpoint = ApiTargets.LIBRARIES + '/operations/' + libId;
      return this.composeRequest(endpoint, 'POST', {
        data: data
      });
    },
    transferOwnership: function transferOwnership(libId, newOwnerEmail) {
      if (!newOwnerEmail || !_.isString(newOwnerEmail)) {
        throw 'new owner email address must be a string';
      }

      if (!libId || !_.isString(libId)) {
        throw 'library Id must be a string';
      }

      var endpoint = ApiTargets.LIBRARY_TRANSFER + '/' + libId;
      var data = {
        email: newOwnerEmail
      };
      return this.composeRequest(endpoint, 'POST', {
        data: data
      });
    },
    //      /*
    //      * email, permission, value
    //      * */
    //
    //      updateLibraryPermissions : function(id, data){
    //
    //        var that = this;
    //
    //        var endpoint = ApiTargets["PERMISSIONS"] + "/" + id;
    //        return this.composeRequest(endpoint, "POST", {data : data})
    //          .done(function(data){
    //            this.collection.get(id).set(data);
    //          })
    //          .fail(function(jqXHR){
    //            var error = JSON.parse(jqXHR.responseText).error;
    //            var message = "Library <b>" +  that.collection.get(id).title + "</b> could not be updated: ("  + error + ")";
    //            that.getBeeHive().getService("PubSub").publish(that.key, that.getBeeHive().getService("PubSub").ALERT, new ApiFeedback({code: 0, msg: message, type : "danger"}));
    //          });
    //
    //      },
    updateLibraryMetadata: function updateLibraryMetadata(id, data) {
      var that = this;
      var endpoint = ApiTargets.DOCUMENTS + '/' + id;
      return this.composeRequest(endpoint, 'PUT', {
        data: data
      }).done(function (data) {
        that.collection.get(id).set(data);
      }).fail(function (jqXHR) {
        var error = JSON.parse(jqXHR.responseText).error;
        var message = 'Library <b>' + that.collection.get(id).get('name') + '</b> could not be updated: (' + error + ')';
        that.getBeeHive().getService('PubSub').publish(that.getBeeHive().getService('PubSub').ALERT, new ApiFeedback({
          code: 0,
          msg: message,
          type: 'danger'
        }));
      });
    },

    /* fetches bibcodes, then submits them to library endpoint
     *
     * @param data e.g. {"library": [library_id], "bibcodes": ["all"/ "selected"]}
     *
     */
    addBibcodesToLib: function addBibcodesToLib(data) {
      var that = this;

      var promise = this._getBibcodes(data).then(function (bibcodes) {
        // should return success or fail message
        return that.updateLibraryContents(data.library, {
          bibcode: bibcodes,
          action: 'add'
        }).fail(function () {
          var message = 'Library <b>' + that.collection.get(data.library).title + '</b> could not be updated';
          that.getBeeHive().getService('PubSub').publish(that.getBeeHive().getService('PubSub').ALERT, new ApiFeedback({
            code: 0,
            msg: message,
            type: 'danger'
          }));
        });
      });

      return promise;
    },

    /* fetch the bibcodes, then POST to the create endpoint with the bibcodes
     *
     * @param data: e.g. {bibcodes: ["all"/"selected"], name: "ddddd"}
     *
     */
    createLibAndAddBibcodes: function createLibAndAddBibcodes(data) {
      var that = this;

      var promise = this._getBibcodes(data).then(function (bibcodes) {
        if (!bibcodes) {
          throw new Error("Solr returned no bibcodes, can't put them in the new library");
        }

        data.bibcode = bibcodes;
        var createLibraryPromise = that.createLibrary(data).fail(function () {
          var message = 'Library <b>' + name + '</b> could not be created';
          that.getBeeHive().getService('PubSub').publish(that.getBeeHive().getService('PubSub').ALERT, new ApiFeedback({
            code: 0,
            msg: message,
            type: 'danger'
          }));
        });
        return createLibraryPromise;
      });

      return promise;
    },
    importLibraries: function importLibraries(service) {
      var endpoint;
      var d = $.Deferred();
      var that = this;

      if (service === 'classic') {
        endpoint = ApiTargets.LIBRARY_IMPORT_CLASSIC_TO_BBB;
      } else if (service === 'twopointoh') {
        endpoint = ApiTargets.LIBRARY_IMPORT_ADS2_TO_BBB;
      } else {
        console.error("didn't recognize library endpoint! should be one of 'classic' or 'twopointoh' ");
        return;
      }

      this.getBeeHive().getService('Api').request(new ApiRequest({
        target: endpoint,
        options: {
          done: function done(data) {
            d.resolve.apply(undefined, [].slice.apply(arguments)); // re-fetch metadata, since new libs were imported

            that._fetchAllMetadata();
          },
          fail: function fail(data) {
            d.reject.apply(undefined, [].slice.apply(arguments));
          }
        }
      }));
      return d.promise();
    },
    hardenedInterface: {
      getLibraryMetadata: 'returns json list of libraries, optional lib id as param',
      createLibrary: 'createLibrary',
      // these two functions fetch bibcodes based on the arguments given
      createLibAndAddBibcodes: 'createLibAndAddBibcodes',
      addBibcodesToLib: 'addBibcodesToLib',
      deleteLibrary: 'deleteLibrary',
      updateLibraryContents: 'updateLibraryContents',
      //      updateLibraryPermissions : "updateLibraryPermissions",
      updateLibraryMetadata: 'updateLibraryMetadata',
      importLibraries: 'importLibraries',
      transferOwnership: 'transferOwnership',
      // currently called by library individual widget to get
      // lists of bibs to pass to export, metrics, vis widgets etc
      getLibraryBibcodes: 'getLibraryBibcodes',
      performLibraryOperation: 'performLibraryOperation'
    }
  });

  _.extend(LibraryController.prototype, Hardened, Dependon.BeeHive);

  return LibraryController;
});

/**
 * Created by alex on 5/10/14.
 * Updated by roman on 5/17/14
 *
 * The Paginator object updates the ApiQuery by setting the new pagination
 * parameters (or replacing the existing ones). It is typically used by
 * a widget before a new query is sent to the Forbidden City
 *
 * The paginator should be 'reset' if it is dealing with a totally new
 * query.
 *
 * Paginator doesn't know how many total results there are until
 * you call 'setMaxNum' -- this typically happens after the first
 * batch of results arrives from server (the widget must call 'setMaxNum')
 */
define('js/components/paginator',['underscore'], function (_) {
  var Paginator = function Paginator(options) {
    this.start = options.start || 0; // the beginning offset

    this.rows = options.rows || 20; // how many to fetch in one go

    this.initialStart = options.start || 0; // useful for reset

    this.startName = options.startName || 'start'; // name of the parameter for offset

    this.rowsName = options.rowsName || 'rows'; // name of the parameter for num of items to fetch

    this.cycle = 0; // counter of how many times we were called

    this.maxNum = -1; // set from outside to limit how many items there are to fetch (for this query)
  };

  _.extend(Paginator.prototype, {
    /**
     * Changes ApiQuery setting the correct parameters for the next
     * pagination
     *
     * @param apiQuery
     * @returns {*}
     */
    run: function run(apiQuery) {
      if (!this.hasMore()) {
        return apiQuery;
      }

      apiQuery.set(this.startName, this.start);
      apiQuery.set(this.rowsName, this.rows); // increment the actual value

      this.start += this.rows;
      if (this.maxNum > 0 && this.maxNum < this.start) this.start = this.maxNum;
      this.cycle += 1;
      return apiQuery;
    },
    reset: function reset(initialStart) {
      this.start = initialStart || this.initialStart;
      this.maxNum = -1;
      this.cycle = 0;
    },
    getCycle: function getCycle() {
      return this.cycle;
    },
    setMaxNum: function setMaxNum(maxNum) {
      this.maxNum = maxNum;
    },
    hasMore: function hasMore() {
      if (this.maxNum == -1 || this.maxNum > this.start) {
        return true;
      }

      return false;
    },

    /**
     * Removes any notion of pagination from the ApiQuery
     * @returns {ApiQuery}
     */
    cleanQuery: function cleanQuery(apiQuery) {
      apiQuery.unset(this.startName);
      apiQuery.unset(this.rowsName);
      return apiQuery;
    }
  });

  return Paginator;
});

define('js/components/persistent_storage',['underscore', 'js/components/generic_module', 'js/mixins/dependon', 'persist-js', 'module'], function (_, GenericModule, Mixins, PersistJS, module) {
  var namespace = module.config().namespace || '';
  var LocalStorage = GenericModule.extend({
    constructor: function constructor(opts) {
      opts = opts || {};
      this._store = this.createStore(namespace + (opts.name || ''));
    },
    createStore: function createStore(name) {
      return this._createStore(name);
    },
    _createStore: function _createStore(name) {
      var s = new PersistJS.Store(name, {
        about: 'This is bumblebee persistent storage',
        defer: true
      });
      var keys = s.get('#keys');

      if (!keys) {
        s.set('#keys', '{}');
      } else {
        try {
          keys = JSON.parse(keys);

          if (!_.isObject(keys)) {
            s.set('#keys', '{}');
          }
        } catch (e) {
          s.set('#keys', '{}');
        }
      }

      return s;
    },
    set: function set(key, value) {
      this._checkKey(key);

      if (!_.isString(value)) {
        value = JSON.stringify(value);
      }

      this._store.set(key, value);

      this._setKey(key);
    },
    get: function get(key) {
      this._checkKey(key);

      var v = this._store.get(key);

      if (!v) return v;

      try {
        return JSON.parse(v);
      } catch (e) {
        return v;
      }
    },
    remove: function remove(key) {
      this._checkKey(key);

      this._store.remove(key);

      this._delKey(key);
    },
    clear: function clear() {
      var keys = this.get('#keys');

      for (var k in keys) {
        this._store.remove(k);
      }

      this._store.set('#keys', '{}');
    },
    keys: function keys() {
      return JSON.parse(this._store.get('#keys'));
    },
    _setKey: function _setKey(key) {
      var keys = this.keys() || {};
      keys[key] = 1;

      this._store.set('#keys', JSON.stringify(keys));
    },
    _delKey: function _delKey(key) {
      var keys = this.keys() || {};
      delete keys[key];

      this._store.set('#keys', JSON.stringify(keys));
    },
    _checkKey: function _checkKey(key) {
      if (!_.isString(key)) {
        throw new Error('key must be string, received: ' + key);
      }
    }
  });

  _.extend(LocalStorage.prototype, Mixins.BeeHive);

  return LocalStorage;
});

define('js/mixins/add_secondary_sort',[], function () {
  return {
    // add secondary sort with correct asc/desc
    addSecondarySort: function addSecondarySort(apiQuery) {
      // ensure we always apply a default sort
      if (!apiQuery.has('sort')) {
        apiQuery.set('sort', 'date desc');
      } // only get before the first column to prevent adding redundant secondary sort


      var primarySort = apiQuery.get('sort')[0].split(',')[0];
      var secondarySort = primarySort.indexOf(' asc') > -1 ? 'bibcode asc' : 'bibcode desc';
      apiQuery.set('sort', primarySort + ', ' + secondarySort);
    }
  };
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

define('utils',['jquery', 'underscore', 'analytics', 'react', 'js/components/api_query', 'js/components/api_request'], function ($, _, analytics, React, ApiQuery, ApiRequest) {
  var qs = function qs(key, str, separator) {
    var k = key.replace(/[*+?^$.[\]{}()|\\/]/g, '\\$&'); // escape RegEx meta chars

    var pattern = '(^|[\\?&])' + k + '=[^&]*';
    var match = (str || window.location.hash).match(new RegExp(pattern, 'g'));

    if (!match) {
      return null;
    }

    var clean = []; // remove 'key=' from string, combine with optional separator and unquote spaces

    for (var i = 0; i < match.length; i += 1) {
      clean.push(match[i].replace(new RegExp('(^|[\\?&])' + k + '='), ''));
    }

    if (separator) {
      var msg = clean.join(separator); // works even if separator is undefined

      return decodeURIComponent(msg.replace(/\+/g, ' '));
    }

    if (separator === false) {
      return _.map(clean, function (msg) {
        return decodeURIComponent(msg.replace(/\+/g, ' '));
      });
    }

    return null;
  };

  var updateHash = function updateHash(key, value, hash) {
    var k = key.replace(/[*+?^$.[\]{}()|\\/]/g, '\\$&');
    var h = _.isString(hash) ? hash : window.location.hash;
    var match = h.match(new RegExp('&?' + k + '=([^&]+)(&|$)'));

    if (match) {
      var mat = match[0].replace(match[1], value);
      return h.replace(match[0], mat);
    }

    return hash;
  };

  var difference = function difference(obj, base) {
    return _.transform(obj, function (result, value, key) {
      if (!_.isEqual(value, base[key])) {
        result[key] = _.isObject(value) && _.isObject(base[key]) ? difference(value, base[key]) : value;
      }
    });
  }; // get the current browser information


  var getBrowserInfo = function getBrowserInfo() {
    // do this inline, so we only request when necessary
    var $dd = $.Deferred(); // reject after 3 seconds

    var timeoutId = setTimeout(function () {
      $dd.reject();
    }, 3000);

    window.require(['bowser'], function (bowser) {
      window.clearTimeout(timeoutId);
      $dd.resolve(bowser.parse(window.navigator.userAgent));
    }, function () {
      $dd.reject();
    });

    return $dd.promise();
  };

  var TimingEvent = /*#__PURE__*/function () {
    function TimingEvent() {
      var timingVar = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Timers';
      var timingCategory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Generic Timer';
      var timingLabel = arguments.length > 2 ? arguments[2] : undefined;

      _classCallCheck(this, TimingEvent);

      this.timingCategory = timingCategory;
      this.timingVar = timingVar;
      this.timingLabel = timingLabel;
      this.time = null;
    }

    _createClass(TimingEvent, [{
      key: "start",
      value: function start() {
        this.time = +new Date();
        this._emitted = false;
      }
    }, {
      key: "stop",
      value: function stop() {
        // do not emit an event if we haven't started timing or already emitted
        if (this._emitted) {
          return;
        }

        var time = +new Date() - this.time;
        analytics('send', {
          hitType: 'timing',
          timingCategory: this.timingCategory,
          timingVar: this.timingVar,
          timingLabel: this.timingLabel,
          timingValue: time
        });
        this._emitted = true;
      }
    }]);

    return TimingEvent;
  }();

  var waitForSelector = function waitForSelector() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var $dd = $.Deferred();
    var timeout = 3100; // 31 seconds

    var ref = null;

    (function check(n) {
      var $el = $.apply(void 0, args);

      if ($el.length) {
        return $dd.resolve($el);
      }

      if (n >= timeout) {
        return $dd.reject('timeout');
      }

      ref = setTimeout(function () {
        window.requestAnimationFrame(function () {
          check(n += 1);
        });
      }, 100);
      return null;
    })(0);

    $dd.promise.destroy = function () {
      window.clearTimeout(ref);
      $dd.reject();
    };

    return $dd.promise();
  };

  var withPrerenderedContent = function withPrerenderedContent(view) {
    view.handlePrerenderedContent = function (content, $el) {
      // setup the elements so events are properly delegated
      var selector = view.tagName + '.' + view.className;
      view.$el = $(selector, $el); // stops mathjax from pre-rendering before we replace the content

      $('>', view.$el).addClass('tex2jax_ignore');
      view.el = view.$el.get(0);
      view.delegateEvents(); // replace the current marionette template renderer for a moment

      var _renderTmpl = view._renderTemplate;

      view._renderTemplate = function () {}; // reset template renderer on first model change


      view.model.once('change', function () {
        view._renderTemplate = _renderTmpl;
      });
    };

    return view;
  };

  var escapeRegExp = function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  var makeApiQuery = function makeApiQuery(params) {
    return new ApiQuery(params);
  };

  var makeApiRequest = function makeApiRequest(params) {
    return new ApiRequest(params);
  };

  return {
    qs: qs,
    updateHash: updateHash,
    difference: difference,
    getBrowserInfo: getBrowserInfo,
    TimingEvent: TimingEvent,
    waitForSelector: waitForSelector,
    withPrerenderedContent: withPrerenderedContent,
    escapeRegExp: escapeRegExp,
    makeApiQuery: makeApiQuery,
    makeApiRequest: makeApiRequest
  };
});

/**
 * Created by rchyla on 3/30/14.
 */

/**
 * Mediator to coordinate UI-query exchange
 */
define('js/components/query_mediator',['underscore', 'jquery', 'cache', 'js/components/generic_module', 'js/mixins/dependon', 'js/mixins/add_secondary_sort', 'js/components/api_request', 'js/components/api_response', 'js/components/api_query_updater', 'js/components/api_feedback', 'js/components/json_response', 'js/components/api_targets', 'js/components/api_query', 'js/components/alerts', 'utils', 'analytics'], function (_, $, Cache, GenericModule, Dependon, SecondarySort, ApiRequest, ApiResponse, ApiQueryUpdater, ApiFeedback, JsonResponse, ApiTargets, ApiQuery, Alerts, utils, analytics) {
  var QueryMediator = GenericModule.extend({
    initialize: function initialize(options) {
      options = options || {};
      this._cache = null;
      this.debug = options.debug || false;
      this.queryUpdater = new ApiQueryUpdater('QueryMediator');
      this.failedRequestsCache = this._getNewCache({
        expiresAfterWrite: 5
      });
      this.maxRetries = options.maxRetries || 3;
      this.recoveryDelayInMs = _.isNumber(options.recoveryDelayInMs) ? options.recoveryDelayInMs : 700;
      this.__searchCycle = {
        waiting: {},
        inprogress: {},
        done: {},
        failed: {}
      };
      this.shortDelayInMs = _.isNumber(options.shortDelayInMs) ? options.shortDelayInMs : 300;
      this.longDelayInMs = _.isNumber(options.longDelayInMs) ? options.longDelayInMs : 100;
      this.monitoringDelayInMs = _.isNumber(options.monitoringDelayInMs) ? options.monitoringDelayInMs : 200;
      this.mostRecentQuery = new ApiQuery();
    },
    activateCache: function activateCache(options) {
      this._cache = this._getNewCache((options || {}).cache);
    },
    _getNewCache: function _getNewCache(options) {
      return new Cache(_.extend({
        maximumSize: 100,
        expiresAfterWrite: 60 * 30 // 30 mins

      }, _.isObject(options) ? options : {}));
    },

    /**
     * Starts listening on the PubSub
     *
     * @param beehive - the full access instance; we excpect PubSub to be
     *    present
     */
    activate: function activate(beehive, app) {
      this.setBeeHive(beehive);
      this.setApp(app);
      var pubsub = this.getPubSub(); // if you run discovery-mediator; this signal may be removed from the
      // queue (and instead, the discovery mediator will serve the request)

      pubsub.subscribe(pubsub.START_SEARCH, _.bind(this.getQueryAndStartSearchCycle, this));
      pubsub.subscribe(pubsub.DELIVERING_REQUEST, _.bind(this.receiveRequests, this));
      pubsub.subscribe(pubsub.EXECUTE_REQUEST, _.bind(this.executeRequest, this));
      pubsub.subscribe(pubsub.GET_QTREE, _.bind(this.getQTree, this));
    },
    getQTree: function getQTree(apiQuery, senderKey) {
      var apiRequest = new ApiRequest({
        query: apiQuery,
        target: ApiTargets.QTREE
      });

      this._executeRequest(apiRequest, senderKey);
    },
    doQueryTranslation: function doQueryTranslation(q) {
      var d = $.Deferred();
      var pubsub = this.getPubSub();
      var options = {
        type: 'POST',
        contentType: 'application/json'
      }; // Send the entire query to the "query" endpoint of the "object_service" micro service
      // this endpoint will grab the "object:<expression>" from the query string and send back
      // a translated query string which will have "simbid:<expression with SIMBAD identifiers>"
      // instead of the "object:" part

      var request = new ApiRequest({
        target: ApiTargets.SERVICE_OBJECTS_QUERY,
        query: new ApiQuery({
          query: q
        }),
        options: options
      }); // when the promise gets resolved, it will have the JSON response of the micro service
      // which will have the translated object query

      pubsub.subscribeOnce(pubsub.DELIVERING_RESPONSE, function (response) {
        d.resolve(response.toJSON());
      });
      pubsub.publish(pubsub.EXECUTE_REQUEST, request);
      return d.promise();
    },
    getQueryAndStartSearchCycle: function getQueryAndStartSearchCycle(apiQuery, senderKey) {
      var that = this;
      var ps = this.getPubSub(); // modifies apiQuery in place

      SecondarySort.addSecondarySort(apiQuery); // Watch for simbid references and use a masked version of the
      // query to generate the url if any are found.

      if (this.original_url && apiQuery.get('q') && apiQuery.get('q')[0].indexOf('simbid') !== -1) {
        var newQ = apiQuery.clone();
        var origQ = apiQuery.get('q')[0];

        if (apiQuery.has('__original_query')) {
          origQ = apiQuery.get('__original_query')[0];
        } // Use the old query for the clone's query string, then get url


        newQ.set('q', origQ);
        this.original_url = this.queryUpdater.clean(newQ).url();
      } else {
        this.original_url = this.queryUpdater.clean(apiQuery).url();
      }

      this.original_query = apiQuery.get('q'); // checking if it's a new big query

      if (apiQuery.get('__bigquery')) {
        apiQuery.set('bigquery', 'bibcode\n' + apiQuery.get('__bigquery').join('\n')); // don't need this anymore

        apiQuery.unset('__bigquery'); // query might have a q, otherwise q is everything

        if (!apiQuery.get('q')) apiQuery.set('q', '*:*'); // bigquery endpoint needs this value set

        apiQuery.add('fq', '{!bitset}');
        var request = new ApiRequest({
          target: ApiTargets.MYADS_STORAGE + '/query',
          query: apiQuery,
          options: {
            type: 'POST',
            contentType: 'application/json',
            done: function done(response) {
              var newQuery = new ApiQuery({
                q: apiQuery.get('q'),
                __qid: response.qid
              });
              var bigquerySource = apiQuery.get('__bigquerySource');

              if (bigquerySource) {
                newQuery.set('__bigquerySource', bigquerySource[0]);
              }

              if (apiQuery.get('sort')) {
                newQuery.set('sort', apiQuery.get('sort'));
              }

              that.startSearchCycle(newQuery, senderKey);
            },
            fail: function fail(jqXHR, textStatus, errorThrown) {
              console.warn('bigquery failed:', [].slice.apply(arguments).join(','));
              ps.publish(ps.FEEDBACK, new ApiFeedback({
                code: ApiFeedback.CODES.SEARCH_CYCLE_FAILED_TO_START,
                error: {
                  jqXHR: jqXHR,
                  textStatus: textStatus,
                  errorThrown: errorThrown
                }
              }));
            }
          }
        }); // it needs to be a bigquery, we need to formulate the query

        this.getBeeHive().getService('Api').request(request);
      } // check if this is an "object:" query
      else if (apiQuery.get('q')[0].indexOf('object:') > -1) {
          // we have an "object:" query as part of the query
          // first define a callback function to process the response of the micro service
          // and bind it to "this" so that we can use the trigger
          var callback = function (v) {
            apiQuery.set({
              q: v.query
            });
            this.startSearchCycle(apiQuery, senderKey);
          }.bind(this); // call the callback function when the promise has been resolved


          this.doQueryTranslation(apiQuery.get('q')[0]).done(callback);
        } else {
          this.startSearchCycle.apply(this, arguments);
        }
    },

    /**
     * Happens at the beginning of the new search cycle. This is the 'race started' signal
     */
    startSearchCycle: function startSearchCycle(apiQuery, senderKey) {
      this.resetFailures(); // we have to clear selected records in app storage here too

      if (this.getBeeHive().getObject('AppStorage')) {
        this.getBeeHive().getObject('AppStorage').clearSelectedPapers();
      } // clear bigqueries by default when a new search cycle is started, unless
      // explicitly saved by using "__saveBigQuery" flag


      if (apiQuery.has('__saveBigQuery') && this.mostRecentQuery.has('__qid') && !apiQuery.has('__qid')) {
        this.mostRecentQuery.set('q', apiQuery.get('q'));
        apiQuery = this.mostRecentQuery;
      }

      this.mostRecentQuery = apiQuery;

      if (this.debug) {
        console.log('[QM]: received query:', this.hasApp() ? this.getApp().getPluginOrWidgetName(senderKey.getId()) || senderKey.getId() : senderKey.getId(), apiQuery.url());
      }

      if (apiQuery.keys().length <= 0) {
        console.error('[QM] : received empty query (huh?!)');
        return;
      }

      if (apiQuery.get('q')[0].indexOf('simbid') > -1) {
        apiQuery.add('__original_url', this.original_url);
        apiQuery.add('__original_query', this.original_query);
      }

      var ps = this.getPubSub();

      if (this.__searchCycle.running && this.__searchCycle.waiting && _.keys(this.__searchCycle.waiting)) {
        console.error('The previous search cycle did not finish, and there already comes the next!'); // mark all current waiting requests with a STALE flag

        _.forEach(_.extend({}, this.__searchCycle.waiting, this.__searchCycle.inprogress), function (psks) {
          psks.request.__STALE = true;
        });
      }

      this.reset();
      this.__searchCycle.initiator = senderKey.getId();
      this.__searchCycle.collectingRequests = true;
      this.__searchCycle.query = apiQuery.clone(); // we will protect the query -- in the future i can consider removing 'unlock' to really
      // cement the fact the query MUST NOT be changed (we want to receive a modified version)

      var q = apiQuery.clone(); // q = this.queryUpdater.clean(q);
      // since widgets are dirty bastards, we will remove the fl parameter (to avoid cross-
      // contamination)

      q.unset('fl');
      q.lock();
      ps.publish(ps.INVITING_REQUEST, q); // give widgets some time to submit their requests

      var self = this;

      var startExecuting = function startExecuting() {
        self.__searchCycle.collectingRequests = false;
        self.startExecutingQueries() && self.monitorExecution();
      };

      this.shortDelayInMs ? setTimeout(startExecuting, this.shortDelayInMs) : startExecuting();
    },

    /**
     * Starts executing queries from the search cycle
     *
     * Return value indicates whether the process starter;
     * if 'true', then you can start monitoring
     *
     * @param force
     */
    startExecutingQueries: function startExecutingQueries(force) {
      var self = this;
      var cycle = this.__searchCycle;
      if (cycle.running) return; // safety barrier

      if (_.isEmpty(cycle.waiting)) return;
      if (!this.hasBeeHive()) return;
      cycle.running = true;
      var data;
      var beehive = this.getBeeHive();
      var api = beehive.getService('Api');
      var ps = this.getPubSub();
      if (!(ps && api)) return; // application is gone

      var app = this.getApp();
      var pskToExecuteFirst;

      if (pskToExecuteFirst = app.getPskOfPluginOrWidget('widget:Results')) {
        // pick a request that will be executed first
        if (cycle.waiting[pskToExecuteFirst]) {
          data = cycle.waiting[pskToExecuteFirst];
          delete cycle.waiting[pskToExecuteFirst];
        }
      }

      if (!data && cycle.waiting[cycle.initiator]) {
        // grab the query/request which started the cycle
        data = cycle.waiting[cycle.initiator];
        delete cycle.waiting[cycle.initiator];
      }

      if (!data) {
        if (this.debug) console.warn('DynamicConfig does not tell us which request to execute first (grabbing random one).');
        var kx;
        data = cycle.waiting[kx = _.keys(cycle.waiting)[0]];
        delete cycle.waiting[kx];
      } // execute the first search (if it succeeds, fire the rest)


      var firstReqKey = data.key.getId();
      cycle.inprogress[firstReqKey] = data;

      this._executeRequest(data.request, data.key).done(function (response) {
        if (data.request.__STALE) {
          return;
        }

        cycle.done[firstReqKey] = data;
        delete cycle.inprogress[firstReqKey];
        var numFound;

        if (response.response && response.response.numFound) {
          numFound = response.response.numFound;
        }

        ps.publish(ps.FEEDBACK, new ApiFeedback({
          code: ApiFeedback.CODES.SEARCH_CYCLE_STARTED,
          query: cycle.query,
          request: data.request,
          numFound: numFound,
          cycle: cycle,
          response: response // this is a raw response (and it is save to send, cause it was already copied by the first 'done' callback

        }));
        self.displayTugboatMessages(); // after we are done with the first query, start executing other queries

        var f = function f() {
          _.each(_.keys(cycle.waiting), function (k) {
            data = cycle.waiting[k];
            delete cycle.waiting[k];
            cycle.inprogress[k] = data;
            var psk = k;

            self._executeRequest.call(self, data.request, data.key).done(function () {
              if (data.request.__STALE) {
                return;
              }

              cycle.done[psk] = cycle.inprogress[psk];
              delete cycle.inprogress[psk];
            }).fail(function () {
              if (data.request.__STALE) {
                return;
              }

              cycle.failed[psk] = cycle.inprogress[psk];
              delete cycle.inprogress[psk];
            }).always(function () {
              if (cycle.finished) return;

              if (_.isEmpty(cycle.inprogress)) {
                ps.publish(ps.FEEDBACK, new ApiFeedback({
                  code: ApiFeedback.CODES.SEARCH_CYCLE_FINISHED,
                  cycle: cycle
                }));
                cycle.finished = true;
              }
            });
          });
        }; // for the display experience, it is better to introduce delays


        if (self.longDelayInMs && self.longDelayInMs > 0) {
          setTimeout(function () {
            f();
          }, self.longDelayInMs);
        } else {
          f();
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        self.__searchCycle.error = true;
        ps.publish(ps.FEEDBACK, new ApiFeedback({
          code: ApiFeedback.CODES.SEARCH_CYCLE_FAILED_TO_START,
          cycle: cycle,
          request: this.request,
          error: {
            jqXHR: jqXHR,
            textStatus: textStatus,
            errorThrown: errorThrown
          }
        }));
      });

      return true; // means that the process can be monitored
    },
    monitorExecution: function monitorExecution() {
      if (!this.hasBeeHive()) return; // app is closed

      var self = this;
      var ps = this.getPubSub();
      if (!ps) return; // application is gone

      this.__searchCycle.monitor += 1;

      if (this.__searchCycle.monitor > 100) {
        console.warn('Stopping monitoring of queries, it is running too long');
        ps.publish(ps.FEEDBACK, new ApiFeedback({
          code: ApiFeedback.CODES.SEARCH_CYCLE_STOP_MONITORING,
          cycle: this.__searchCycle
        }));
        return;
      }

      if (this.__searchCycle.inprogress && _.isEmpty(this.__searchCycle.inprogress)) {
        if (this.__searchCycle.finished) return; // it was already signalled

        ps.publish(ps.FEEDBACK, new ApiFeedback({
          code: ApiFeedback.CODES.SEARCH_CYCLE_FINISHED,
          cycle: this.__searchCycle
        }));
        return;
      }

      var lenToDo = _.keys(this.__searchCycle.waiting).length;

      var lenDone = _.keys(this.__searchCycle.done).length;

      var lenInProgress = _.keys(this.__searchCycle.inprogress).length;

      var lenFailed = _.keys(this.__searchCycle.failed).length;

      var total = lenToDo + lenDone + lenInProgress + lenFailed;
      ps.publish(ps.FEEDBACK, new ApiFeedback({
        code: ApiFeedback.CODES.SEARCH_CYCLE_PROGRESS,
        msg: lenToDo / total,
        total: total,
        todo: lenToDo,
        cycle: this.__searchCycle
      }));
      setTimeout(function () {
        self.monitorExecution();
      }, self.monitoringDelayInMs);
    },

    /**
     * This method harvest requests from the PubSub and stores them inside internal
     * datastruct
     *
     * @param apiRequest
     * @param senderKey
     */
    receiveRequests: function receiveRequests(apiRequest, senderKey) {
      if (this.debug) {
        console.log('[QM]: received request:', this.hasApp() ? this.getApp().getPluginOrWidgetName(senderKey.getId()) || senderKey.getId() : senderKey.getId(), apiRequest.url());
      }

      if (this.__searchCycle.collectingRequests) {
        this.__searchCycle.waiting[senderKey.getId()] = {
          request: apiRequest,
          key: senderKey
        };
      } else {
        this.executeRequest(apiRequest, senderKey);
      }
    },

    /**
     * This method executes a request, we check
     * the local cache and also prepare context for the done/fail callbacks
     *
     * @param apiRequest
     * @param senderKey
     */
    executeRequest: function executeRequest(apiRequest, senderKey) {
      if (!(apiRequest instanceof ApiRequest)) {
        throw new Error('Sir, I belive you forgot to send me a valid ApiRequest!');
      } else if (!senderKey) {
        throw new Error('Request executed, but no widget id provided!');
      }

      return this._executeRequest(apiRequest, senderKey);
    },
    getFailCacheValue: function getFailCacheValue(key) {
      var failCache = this.failedRequestsCache;
      return failCache && failCache.getSync(key) || failCache._cache[key] && failCache._cache[key].value;
    },
    _executeRequest: function _executeRequest(apiRequest, senderKey) {
      // for altering widget queries
      // from regular solr requests to execute_query requests
      // if bigquery is being used
      // it's a bigquery
      if (apiRequest.get('query') && apiRequest.get('query').get('__qid')) {
        var qid = apiRequest.get('query').get('__qid')[0];
        apiRequest.set('target', ApiTargets.MYADS_STORAGE + '/execute_query/' + qid);
      }

      var ps = this.getPubSub();
      var api = this.getBeeHive().getService('Api');

      var requestKey = this._getCacheKey(apiRequest);

      var maxTry = this.getFailCacheValue(requestKey) || 0;

      if (maxTry >= this.maxRetries) {
        this.onApiRequestFailure.apply({
          request: apiRequest,
          key: senderKey,
          requestKey: requestKey,
          qm: this
        }, [{
          status: ApiFeedback.CODES.TOO_MANY_FAILURES
        }, 'Error', 'This request has reached maximum number of failures (wait before retrying)']);
        var d = $.Deferred();
        return d.reject();
      }

      if (this._cache) {
        var resp = this._cache.getSync(requestKey);

        var self = this;

        if (resp && resp.promise) {
          // we have already created ajax request
          resp.done(function () {
            self._cache.put(requestKey, arguments);

            self.onApiResponse.apply({
              request: apiRequest,
              key: senderKey,
              requestKey: requestKey,
              qm: self
            }, arguments);
          });
          resp.fail(function () {
            self._cache.invalidate(requestKey);

            self.onApiRequestFailure.apply({
              request: apiRequest,
              pubsub: ps,
              key: senderKey,
              requestKey: requestKey,
              qm: self
            }, arguments);
          });
          return resp;
        }

        if (resp) {
          // we already have data (in the cache)
          var defer = $.Deferred();
          defer.done(function () {
            self.onApiResponse.apply({
              request: apiRequest,
              key: senderKey,
              requestKey: requestKey,
              qm: self
            }, resp);
          });
          defer.resolve();
          return defer.promise();
        } // create a new query


        var promise = api.request(apiRequest, {
          done: function done() {
            self._cache.put(requestKey, arguments);

            self.onApiResponse.apply(this, arguments);
          },
          fail: function fail() {
            self._cache.invalidate(requestKey);

            self.onApiRequestFailure.apply(this, arguments);
          },
          context: {
            request: apiRequest,
            key: senderKey,
            requestKey: requestKey,
            qm: self
          }
        });

        this._cache.put(requestKey, promise);

        return promise;
      }

      return api.request(apiRequest, {
        done: this.onApiResponse,
        fail: this.onApiRequestFailure,
        context: {
          request: apiRequest,
          key: senderKey,
          requestKey: requestKey,
          qm: this
        }
      });
    },
    onApiResponse: function onApiResponse(data, textStatus, jqXHR) {
      var qm = this.qm;

      if (this.request.__STALE) {
        return;
      } // TODO: check the status responses


      var response = data.responseHeader && data.responseHeader.params ? new ApiResponse(data) : new JsonResponse(data);
      response.setApiQuery(this.request.get('query'));

      if (qm.debug) {
        console.log('[QM]: sending response:', qm.hasApp() ? qm.getApp().getPluginOrWidgetName(this.key.getId()) || this.key.getId() : this.key.getId(), data);
      }

      var pubsub = qm.getBeeHive().getService('PubSub'); // we cant use getPubSub() as we are sending the key

      if (pubsub) pubsub.publish(this.key, pubsub.DELIVERING_RESPONSE + this.key.getId(), response);

      if (qm.failedRequestsCache.getIfPresent(this.requestKey)) {
        qm.failedRequestsCache.invalidate(this.requestKey);
      }
    },
    onApiRequestFailure: function onApiRequestFailure(jqXHR, textStatus, errorThrown) {
      var qm = this.qm;

      if (this.request.__STALE) {
        return;
      }

      var query = this.request.get('query');

      if (qm.debug) {
        console.warn('[QM]: request failed', jqXHR, textStatus, errorThrown);
      }

      var errCount = qm.getFailCacheValue(this.requestKey) || 0;
      qm.failedRequestsCache.put(this.requestKey, errCount + 1);

      if (qm.tryToRecover.apply(this, arguments)) {
        console.warn('[QM]: attempting recovery');
        return true; // means we are trying to recover
      }

      var feedback = new ApiFeedback({
        code: ApiFeedback.CODES.API_REQUEST_ERROR,
        msg: textStatus,
        request: this.request,
        error: jqXHR,
        psk: this.key,
        errorThrown: errorThrown,
        text: textStatus
      });
      var pubsub = qm.getBeeHive().getService('PubSub');
      if (pubsub) pubsub.publish(this.key, pubsub.FEEDBACK, feedback);
      return false; // means: we gave up
    },

    /**
     * Method that receives the same arguments as the error callback. It can try to
     * recover (re-issue) the request. Note: it doesn't need to check whether the
     * recovery is needed - if we are here, it means 'do what you can to recover'
     *
     * This method MUST return 'true' when the request was resent. If it doesn't
     * return 'true' the sender will be notified about the error.
     *
     * If it returns a Feedback object, the sender will be notified using it
     *
     * @param jqXHR
     * @param textStatus
     * @param errorThrown
     */
    tryToRecover: function tryToRecover(jqXHR, textStatus, errorThrown) {
      var qm = this.qm; // QueryMediator

      var senderKey = this.key;
      var request = this.request;
      var requestKey = this.requestKey;
      var status = jqXHR.status;

      if (status) {
        switch (status) {
          case 408: // proxy timeout

          case 409: // conflict

          case 500: // server error

          case 502: // bad gateway

          case 503: // service unavailable

          case 504:
            // gateway timeout
            analytics('send', 'event', 'introspection', 'retrying', status);
            setTimeout(function () {
              // we can remove the entry from the cache, because
              // if they eventually succeed, sender will receive
              // its data (because the promise object inside the
              // cache contains the function to call delivery
              if (qm._cache) {
                var resp = qm._cache.getSync(requestKey);

                if (resp && resp.promise) {
                  qm._cache.invalidate(requestKey);
                } else if (resp) {
                  // it must have succeeded, good!
                  return;
                }
              } // re-send the query


              qm._executeRequest.call(qm, request, senderKey);
            }, qm.recoveryDelayInMs);
            return true;
            break;

          default:
            analytics('send', 'event', 'introspection', 'not-retrying', status, JSON.stringify(qm.mostRecentQuery.toJSON()));
        }
      }
    },

    /**
     * Creates a unique, cleaned key from the request and the apiQuery
     * @param apiRequest
     */
    _getCacheKey: function _getCacheKey(apiRequest) {
      var oldQ = apiRequest.get('query');
      var newQ = this.queryUpdater.clean(oldQ);
      apiRequest.set('query', newQ);
      var key = apiRequest.url();
      apiRequest.set('query', oldQ);
      return key;
    },
    reset: function reset() {
      this.__searchCycle = {
        waiting: {},
        inprogress: {},
        done: {},
        failed: {}
      }; // reset the datastruct

      if (this._cache) {
        this._cache.invalidateAll();
      }
    },
    getAlerter: function getAlerter() {
      return this.getApp().getController(this.alertsController || 'AlertsController');
    },
    // display tugboat messages if they exist
    displayTugboatMessages: function displayTugboatMessages() {
      var TUGBOAT_MESSAGES = {
        AUTHOR_ANDED_WARNING: 'Author search terms combined with AND rather than OR',
        ENTRY_DATE_OFFSET_ERROR: 'Can not combine a date and offset (negative value) for the Entry Date',
        ENTRY_DATE_NON_NUMERIC_ERROR: 'Found a non numeric value in the Entry Date',
        UNRECOGNIZABLE_VALUE: 'Invalid value for {} supplied'
      };

      if (!this.original_url) {
        // without the original url there can be no messages to display
        return;
      }

      var messages = [].concat(utils.qs('error_message', this.original_url, false) || [], utils.qs('warning_message', this.original_url, false) || []);
      var uParams = utils.qs('unprocessed_parameter', this.original_url, false) || [];
      messages = _.reduce(messages, function (acc, msg) {
        msg = msg.toUpperCase();

        if (_.has(TUGBOAT_MESSAGES, msg)) {
          var updatedMsg = TUGBOAT_MESSAGES[msg];

          if (msg === 'UNRECOGNIZABLE_VALUE' && uParams.length > 0) {
            var param = encodeURIComponent(uParams.pop());
            updatedMsg = updatedMsg.replace('{}', /^\w+$/.test(param) ? param : 'parameter');
          }

          acc.push(updatedMsg);
        }

        return acc;
      }, []);
      var message;

      if (messages.length > 0) {
        messages.push('See our <a style="text-decoration: underline; font-weight: bold" href="/help/faq/#classic-search-translator">docs</a> for more information');
        message = messages.join('<br/>');
        this.getAlerter().alert(new ApiFeedback({
          type: Alerts.TYPE.INFO,
          msg: message
        }));
      }
    },
    resetFailures: function resetFailures() {
      this.failedRequestsCache.invalidateAll();
    }
  });

  _.extend(QueryMediator.prototype, Dependon.BeeHive, Dependon.App);

  return QueryMediator;
});

define('js/components/query_validator',['underscore'], function (_) {
  /**
   * Validator object
   * provides value checking
   * @param match
   * @param opts
   * @constructor
   */
  function Validator(match, opts) {
    var matcher = new RegExp(match, opts);
    return function test(str) {
      return matcher.test(str) ? null : str;
    };
  }
  /**
   * QueryToken object for holding the field and value
   * @param field
   * @param value
   * @param token
   * @constructor
   */


  function QueryToken(field, value, token) {
    this.field = field;
    this.value = value;
    this.token = token;
  }
  /**
   * Parse and validate queries
   * @constructor
   */


  function QueryValidator() {
    /**
     * Parse the query into new validator objects
     * @param q
     * @returns {Array}
     */
    var parseTokens = function parseTokens(q) {
      var splitter = new RegExp(/:/);
      var tokens = q.split(/\s+\b/);
      var parsedTokens = [];

      for (var j = 0; j < tokens.length; j++) {
        var subTokens = tokens[j].split(splitter);

        if (subTokens.length !== 2) {
          // Unable to split or nested fields, either way continue on
          continue;
        }

        parsedTokens.push(new QueryToken(subTokens[0], subTokens[1], tokens[j]));
      }

      return parsedTokens;
    };
    /**
     * Composed function finisher, returns boolean equivalent of result
     * @param res
     * @returns {boolean}
     */


    var completeValidation = function completeValidation(res) {
      return res !== null;
    };
    /**
     * Create composed function from validators
     * return the boolean result
     * @param validators
     * @param tokens
     * @returns {Array}
     */


    var test = function test(validators, tokens) {
      var tests = [];

      for (var i in tokens) {
        var res = _.compose.apply(_, validators)(tokens[i].value);

        if (!res) {
          tests.push({
            token: tokens[i].token,
            result: res
          });
        }
      }

      return tests;
    };
    /**
     * Validate the query string
     * @param apiQuery
     * @returns {object}
     */


    this.validate = function (apiQuery) {
      var output = {
        result: true
      }; // Validators - This should match things you DON'T want in the query
      // any confirmed match will make query invalid

      var validators = [completeValidation, new Validator(/^""$/), // matches -> `foo:""`
      new Validator(/^\(\)$/), // matches -> `foo:()`
      new Validator(/^\(\^\)$/), // matches -> `foo:(^)`
      new Validator(/^\(""\)$/), // matches -> `foo:("^")`
      new Validator(/^\("\^"\)$/), // matches -> `foo:("^")`
      new Validator(/^"\^"$/) // matches -> `foo:"^"`
      ]; // Attempt to parse the query string to tokens

      try {
        var q = apiQuery.get('q').join(' ').trim();

        if (!q.length) {
          // query is empty string, continue on
          return output;
        }

        var parsedTokens = parseTokens(q);
      } catch (e) {
        // parsing error, allow it to continue on
        return output;
      }

      var tests = test(validators, parsedTokens);
      output.result = _.every(_.pluck(tests, 'result'));

      if (tests.length) {
        output.tests = tests;
      }

      return output;
    };
  }

  return QueryValidator;
});

/*
 widgets can attach callbacks to a deferred that waits until
 * grecaptcha is loaded from google, and sitekey info is loaded from discovery.vars.js
 *
 * */
define('js/components/recaptcha_manager',['backbone', 'js/components/generic_module', 'js/mixins/hardened', 'js/mixins/dependon'], function (Backbone, GenericModule, Hardened, Dependon) {
  var RecaptchaManager = GenericModule.extend({
    initialize: function initialize() {
      this.grecaptchaDeferred = window.__grecaptcha__;
      this.siteKeyDeferred = $.Deferred();
      this.when = $.when(this.siteKeyDeferred, this.grecaptchaDeferred);
      this.execPromise = $.Deferred();
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();

      _.bindAll(this, ['getRecaptchaKey']);

      pubsub.subscribe(pubsub.APP_STARTED, this.getRecaptchaKey);
    },
    getRecaptchaKey: function getRecaptchaKey() {
      var siteKey = this.getBeeHive().getObject('AppStorage').getConfigCopy().recaptchaKey;
      this.siteKeyDeferred.resolve(siteKey);
    },

    /**
     * widgets use this to attach a callback to the recaptcha promise
     * the callback  will automatically put the completed recaptcha into the view's model
     * view template needs an element with the class of "g-recaptcha" for this to work
     *
     * @param view to render recaptcha on
     */
    activateRecaptcha: function activateRecaptcha(view) {
      if (this.when.state() !== 'resolved') {
        this.renderLoading(view);
      }

      var self = this;
      clearTimeout(this.to);
      this.to = setTimeout(function () {
        if (self.when.state() !== 'resolved') {
          self.renderError(view);
        }
      }, 5000);
      this.when.done(_.partial(_.bind(this.renderRecaptcha, this), view)).fail(function () {
        self.renderError(view);
      });
    },
    getEl: function getEl(view) {
      var $el;

      if (typeof view.$ === 'function') {
        $el = view.$('.g-recaptcha');
      } else if (view.el) {
        $el = $('.g-recaptcha', view.el);
      } else {
        $el = $('.g-recaptcha');
      }

      return $el;
    },
    execute: function execute() {
      this.execPromise = $.Deferred();
      grecaptcha.execute();
      return this.execPromise.promise();
    },
    renderLoading: function renderLoading(view) {
      this.getEl(view).html('<p><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></p>');
      this.enableSubmit(view, false);
    },
    enableSubmit: function enableSubmit(view, bool) {
      var $el;
      var selector = 'button[type=submit],input[type=submit]';

      if (typeof view.$ === 'function') {
        $el = view.$(selector);
      } else if (view.el) {
        $el = $(selector, view.el);
      } else {
        $el = $(selector);
      }

      if ($el.length > 0) {
        $el.attr('disabled', !bool);
      }
    },
    renderError: function renderError(view) {
      var msg = 'Error loading ReCAPTCHA, please try again';
      this.getEl(view).html('<p class="text-danger">' + msg + '</p>');
      this.enableSubmit(view, false);
    },
    googleMsg: function googleMsg() {
      return "<small class=\"recaptcha-msg\">This site is protected by reCAPTCHA and the Google\n      <a href=\"https://policies.google.com/privacy\" target=\"_blank\" rel=\"noreferrer\">Privacy Policy</a> and\n      <a href=\"https://policies.google.com/terms\" target=\"_blank\" rel=\"noreferrer\">Terms of Service</a> apply.</small>";
    },
    renderRecaptcha: function renderRecaptcha(view, siteKey) {
      var _this = this;

      var $el = this.getEl(view);
      var msg = $('<div class="form-group"></div>').append(this.googleMsg());
      $el.closest('form').append(msg);
      grecaptcha.render($el[0], {
        sitekey: siteKey,
        size: 'invisible',
        badge: 'inline',
        callback: function callback(response) {
          // this might need to be inserted into the model.
          // or in the case of feedback form, it just needs
          // to be in the serialized form
          if (view.model) {
            view.model.set('g-recaptcha-response', response);
          }

          _this.execPromise.resolve(response);
        }
      });
      this.enableSubmit(view, true);
    },
    hardenedInterface: {
      activateRecaptcha: 'activateRecaptcha',
      execute: 'execute'
    }
  });

  _.extend(RecaptchaManager.prototype, Hardened, Dependon.BeeHive);

  return RecaptchaManager;
});

define('js/components/second_order_controller',['js/components/generic_module', 'js/mixins/dependon', 'js/components/api_query', 'js/components/api_request', 'js/components/api_targets', 'analytics'], function (GenericModule, Dependon, ApiQuery, ApiRequest, ApiTargets, analytics) {
  /**
   * Triggered via pubsub event, this will take a set of identifiers
   * and generate a bigquery id, then replace the current query
   * with a specified field
   *
   * example query: `similar(docs(99999))`
   */
  var SecondOrderController = GenericModule.extend({
    initialize: function initialize(options) {
      this.options = _.defaults({}, options, {
        maxQueryRows: 6000,
        transformDebounce: 1000
      }); // set up debounced transform

      if (this.options.transformDebounce) {
        this.transform = _.debounce(this.transform, this.options.transformDebounce);
      }
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive.getHardenedInstance());
      var ps = this.getBeeHive().getService('PubSub');
      ps.subscribe(ps.CUSTOM_EVENT, _.bind(this.onCustomEvent, this));
    },

    /**
     * Expecting an event in the following format
     * `second-order-search/{ field }`
     * then call the transform method
     */
    onCustomEvent: function onCustomEvent(event) {
      if (event.startsWith('second-order-search/')) {
        this.transform.apply(this, [event.split('/')[1]].concat(_.rest(arguments)));
      }
    },

    /**
     * Grab the list of currently selected papers from app storage
     */
    getSelectedIds: function getSelectedIds() {
      var storage = this.getBeeHive().getObject('AppStorage');

      if (storage && storage.getSelectedPapers) {
        return storage.getSelectedPapers() || [];
      }

      return [];
    },

    /**
     * get the current query from local storage
     */
    getCurrentQuery: function getCurrentQuery() {
      var storage = this.getBeeHive().getObject('AppStorage');

      if (storage && storage.getCurrentQuery && storage.getCurrentQuery() instanceof ApiQuery) {
        return storage.getCurrentQuery();
      }
    },

    /**
     * Grab the qid from vault by sending our list of bibcodes
     * returning a promise
     */
    getBigQueryResponse: function getBigQueryResponse(ids) {
      var ps = this.getPubSub();
      var $dd = $.Deferred(); // create vault-style bigquery query

      var bigQuery = new ApiQuery({
        bigquery: "bibcode\n".concat(ids.join('\n')),
        q: '*:*',
        fq: '{!bitset}',
        sort: 'date desc'
      }); // create request

      var request = new ApiRequest({
        target: ApiTargets.MYADS_STORAGE + '/query',
        query: bigQuery,
        options: {
          type: 'POST',
          done: function done(_ref) {
            var qid = _ref.qid;
            return $dd.resolve(qid);
          },
          fail: function fail(ev) {
            return $dd.reject(ev);
          }
        }
      });
      ps.publish(ps.EXECUTE_REQUEST, request);
      return $dd.promise();
    },

    /**
     * send a *normal* query outside of search cycle
     */
    sendQuery: function sendQuery(query) {
      var ps = this.getPubSub();
      var $dd = $.Deferred(); // create request

      var request = new ApiRequest({
        target: ApiTargets.SEARCH,
        query: query,
        options: {
          type: 'GET',
          done: function done(res) {
            return $dd.resolve(res);
          },
          fail: function fail(ev) {
            return $dd.reject(ev);
          }
        }
      });
      ps.publish(ps.EXECUTE_REQUEST, request);
      return $dd.promise();
    },

    /**
     * Checks if the passed in field is one of our defined FIELDS
     */
    validField: function validField(field) {
      return _.contains(_.values(SecondOrderController.FIELDS), field);
    },

    /**
     * send analytics event
     */
    submitAnalyticsEvent: function submitAnalyticsEvent(field) {
      analytics('send', 'event', 'interaction', 'second-order-operation', field);
    },

    /**
     * Check field, get selected ids, get qid from vault, and finally send
     * navigate to the search page, starting the search cycle
     */
    transform: function transform(field, opts) {
      if (!field || !this.validField(field)) {
        throw 'must pass in a valid field';
      }

      var options = _.defaults({}, opts, {
        onlySelected: false,
        libraryId: null,
        ids: [],
        query: null
      }); // get the selected records from appStorage


      var selectedIds = options.ids.length > 0 ? options.ids : this.getSelectedIds(); // if field is 'limit' it should generate qid from selection

      if ((selectedIds.length === 0 || !options.onlySelected) && field !== SecondOrderController.FIELDS.LIMIT && field !== SecondOrderController.FIELDS.LIBRARY && field !== SecondOrderController.FIELDS.EXCLUDE) {
        this.transformCurrentQuery(field, options.query);
      } else if (field === SecondOrderController.FIELDS.LIBRARY) {
        // if field is library, no need to make the request to vault, just start search
        this.startSearch(field, options.libraryId);
      } else {
        this.getQidAndStartSearch(field, selectedIds);
      }
    },

    /**
     * General error handler
     */
    handleError: function handleError(ev) {
      var msg = 'Error occurred';

      if (ev.responseJSON && ev.responseJSON.error) {
        msg = ev.responseJSON.error;
      }

      var ps = this.getPubSub();
      ps.publish(ps.CUSTOM_EVENT, 'second-order-search/error', {
        message: msg
      });
      throw msg;
    },

    /**
     * Wrap the current query and pull together all filter queries into
     * the selected field.
     *
     * This will navigate to the search page when done
     */
    transformCurrentQuery: function transformCurrentQuery(field, _query) {
      var ps = this.getPubSub();
      var currentQuery = _query instanceof ApiQuery ? _query : this.getCurrentQuery();

      if (!currentQuery) {
        return;
      }

      var query = currentQuery.clone();
      var q = [];
      q.push(query.get('q'));

      _.forEach(Object.keys(query.toJSON()), function (key) {
        if (key.startsWith('fq_')) {
          q.push(query.get(key));
        }
      });

      var newQuery = new ApiQuery({
        q: "".concat(field, "(").concat(q.join(' AND '), ")"),
        sort: 'score desc'
      });
      ps.publish(ps.NAVIGATE, 'search-page', {
        q: newQuery
      });
    },

    /**
     * Send the ids to vault get a qid, which we then use to generate
     * the final query.
     *
     * This will navigate to the search page when done
     */
    getQidAndStartSearch: function getQidAndStartSearch(field, ids) {
      var _this = this;

      // get the big query response from vault
      this.getBigQueryResponse(ids).then(function (qid) {
        _this.startSearch(field, qid);
      }).fail(function () {
        return _this.handleError.apply(_this, arguments);
      });
    },
    startSearch: function startSearch(field, id) {
      if (!id) {
        throw 'no id';
      }

      var newQuery;

      if (field === SecondOrderController.FIELDS.LIMIT) {
        var currentQuery = this.getCurrentQuery() || new ApiQuery(); // if field is limit, only do docs and retain the current sort

        newQuery = new ApiQuery({
          q: "docs(".concat(id, ")"),
          sort: currentQuery.get('sort') || 'score desc'
        });
      } else if (field === SecondOrderController.FIELDS.LIBRARY) {
        // if library id, use the library/ prefix with the passed in ID
        newQuery = new ApiQuery({
          q: "docs(library/".concat(id, ")"),
          sort: 'date desc'
        });
      } else if (field === SecondOrderController.FIELDS.EXCLUDE) {
        // modify current query, to negate set of docs
        var _currentQuery = this.getCurrentQuery() || new ApiQuery();

        newQuery = _currentQuery.clone();
        newQuery.set({
          q: "-docs(".concat(id, ") ").concat(_currentQuery.get('q'))
        });
      } else {
        // replace the current query with our operator
        newQuery = new ApiQuery({
          q: "".concat(field, "(docs(").concat(id, "))"),
          sort: 'score desc'
        });
      }

      var ps = this.getPubSub();
      ps.publish(ps.NAVIGATE, 'search-page', {
        q: newQuery
      });
      this.submitAnalyticsEvent(field);
    }
  });
  SecondOrderController.FIELDS = {
    USEFUL: 'useful',
    SIMILAR: 'similar',
    TRENDING: 'trending',
    REVIEWS: 'reviews',
    LIMIT: 'limit',
    LIBRARY: 'library',
    EXCLUDE: 'exclude'
  };

  _.extend(SecondOrderController.prototype, Dependon.BeeHive);

  return SecondOrderController;
});

/*
 * A generic class that lazy-loads User info
 *
 *
 * there are only three USER_ANNOUNCEMENT events that widgets can subscribe to:
 *
 * user.USER_SIGNED_IN: (third argument is username)
 * user.USER_SIGNED_OUT: (third argument is undefined)
 * user.USER_INFO_CHANGE: (third argument is dict of changed values)
 *
 * the user has two models:
 *
 * userModel represents the logged-in user and
 * stores values that should be synced with the user account,
 *
 * localStorageModel represents all values stored in local storage,
 * right now this is limited to orcidModeOn
 *
 */
define('js/components/user',['underscore', 'backbone', 'js/components/api_request', 'js/components/api_targets', 'js/components/generic_module', 'js/mixins/dependon', 'js/mixins/hardened', 'js/components/api_feedback', 'js/mixins/api_access'], function (_, Backbone, ApiRequest, ApiTargets, GenericModule, Dependon, Hardened, ApiFeedback, ApiAccess) {
  var LocalStorageModel;
  var UserModel;
  var User; // any variable that doesn't track with user accounts

  LocalStorageModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        isOrcidModeOn: false,
        // eventually propagate this to user account
        perPage: undefined
      };
    }
  }); // this data reflects user accounts

  UserModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        user: undefined,
        link_server: undefined,
        minAuthorPerResult: 4,
        externalLinkAction: 'Open in new tab',
        defaultDatabase: [{
          name: 'Physics',
          value: false
        }, {
          name: 'Astronomy',
          value: false
        }, {
          name: 'General',
          value: false
        }],
        defaultExportFormat: 'BibTeX',
        defaultHideSidebars: 'Show',
        customFormats: [],
        recentQueries: []
      };
    }
  });
  User = GenericModule.extend({
    initialize: function initialize(options) {
      // this model is for settings that come from PersistentStorage service
      this.localStorageModel = new LocalStorageModel();
      this.listenTo(this.localStorageModel, 'change', this.broadcastUserDataChange); // this model is for settings that come from user accounts

      this.userModel = new UserModel();
      this.listenTo(this.userModel, 'change:user', this.broadcastUserChange);
      this.listenTo(this.userModel, 'change', function (key) {
        if (key !== 'user') this.broadcastUserDataChange.apply(this, arguments);
      });

      _.bindAll(this, 'completeLogIn', 'completeLogOut'); // set base url, currently only necessary for change_email endpoint


      this.base_url = this.test ? 'location.origin' : location.origin;
      this.buildAdditionalParameters();
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive); // Check if the Orcid access was revoked by the user
      // It will only be considered 'revoked' if a 401 is received by the API handler

      var checkOrcidToken = function checkOrcidToken() {
        var orcidApi = beehive.getService('OrcidApi');
        var user = beehive.getObject('User'); // Only run if there is actually authData stored in the user object

        if (orcidApi.authData !== null) {
          orcidApi.checkAccessOrcidApiAccess().fail(function (xHr) {
            var statusCode = xHr && xHr.status;

            if (statusCode && statusCode === '401') {
              orcidApi.signOut();
              user.setOrcidMode(0);
            }
          });
        }
      };

      this.getPubSub().subscribe(this.getPubSub().APP_STARTING, checkOrcidToken);
      var storage = beehive.getService('PersistentStorage');

      if (storage) {
        var prefs = storage.get('UserPreferences');

        if (prefs) {
          this.localStorageModel.set(prefs);
        }
      }
    },
    // general persistent storage
    _persistModel: function _persistModel() {
      var storage = this.getBeeHive().getService('PersistentStorage');

      if (storage) {
        storage.set('UserPreferences', this.localStorageModel.toJSON());
      }
    },

    /* generic set localStorage function */
    setLocalStorage: function setLocalStorage(obj) {
      this.localStorageModel.set(obj);

      this._persistModel();
    },

    /* generic get localStorage function, gives you everything */
    getLocalStorage: function getLocalStorage(obj) {
      return this.localStorageModel.toJSON();
    },
    // add a query to a recent queries list
    addToRecentQueries: function addToRecentQueries(apiQuery) {
      var MAX = 10;

      try {
        var recent = this.userModel.get('recentQueries'); // only allow a max number of recent queries

        recent.length >= MAX && recent.pop();
        recent.unshift(apiQuery.clone().toJSON());
        this.userModel.set('recentQueries', recent); // on set, attempt to synchronize with server

        this.setUserData({
          recentQueries: recent
        });
      } catch (e) {
        recent = [];
      }

      return recent;
    },
    getRecentQueries: function getRecentQueries() {
      return this.userModel.get('recentQueries') || [];
    },

    /* orcid functions */
    setOrcidMode: function setOrcidMode(val) {
      this.localStorageModel.set('isOrcidModeOn', val);

      this._persistModel();
    },
    isOrcidModeOn: function isOrcidModeOn() {
      return this.localStorageModel.get('isOrcidModeOn');
    },

    /* general functions */
    // tell widgets that data changed, and send them that data
    broadcastUserDataChange: function broadcastUserDataChange(changedModel) {
      this.getPubSub().publish(this.getPubSub().USER_ANNOUNCEMENT, this.USER_INFO_CHANGE, changedModel.changed);
    },
    broadcastUserChange: function broadcastUserChange() {
      // user has signed in or out
      var message = this.userModel.get('user') ? this.USER_SIGNED_IN : this.USER_SIGNED_OUT;
      this.getPubSub().publish(this.getPubSub().USER_ANNOUNCEMENT, message, this.userModel.get('user'));
      this.redirectIfNecessary();
    },
    buildAdditionalParameters: function buildAdditionalParameters() {
      // any extra info that needs to be sent in post or get requests
      // but not known about by the widget models goes here
      var additional = {};
      additional.CHANGE_EMAIL = {
        verify_url: this.base_url + '/#user/account/verify/change-email'
      };
      this.additionalParameters = additional;
    },
    handleFailedPOST: function handleFailedPOST(jqXHR, status, errorThrown, target) {
      var pubsub = this.getPubSub();
      var error;

      if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
        error = jqXHR.responseJSON.error;
      } else if (jqXHR.responseText) {
        error = jqXHR.responseText;
      } else {
        error = 'error unknown';
      }

      console.error('POST request failed for endpoint: [' + target + ']', error);
    },
    handleFailedGET: function handleFailedGET(jqXHR, status, errorThrown, target) {
      var pubsub = this.getPubSub();
      var error;

      if (jqXHR.responseJSON && jqXHR.responseJSON.error) {
        error = jqXHR.responseJSON.error;
      } else if (jqXHR.responseText) {
        error = jqXHR.responseText;
      } else {
        error = 'error unknown';
      }

      console.error('GET request failed for endpoint: [' + target + ']', error);
    },
    fetchData: function fetchData(target) {
      return this.composeRequest({
        target: target,
        method: 'GET'
      });
    },

    /*
     * POST data to endpoint: accessible through facade
     *
     * */
    postData: function postData(target, data) {
      if (this.additionalParameters[target]) {
        _.extend(data, this.additionalParameters[target]);
      }

      return this.composeRequest({
        target: target,
        method: 'POST',
        data: data
      });
    },

    /* PUT data to pre-existing endpoint: accessible through facade */
    putData: function putData(target, data) {
      if (this.additionalParameters[target]) {
        _.extend(data, this.additionalParameters[target]);
      }

      return this.composeRequest({
        target: target,
        method: 'PUT',
        data: data
      });
    },

    /*
     * every time a csrf token is required, app storage will request a new token,
     * so it allows you to attach callbacks to the promise it returns
     * */
    sendRequestWithNewCSRF: function sendRequestWithNewCSRF(callback) {
      callback = _.bind(callback, this);
      this.getBeeHive().getObject('CSRFManager').getCSRF().done(callback);
    },

    /*
     * returns a promise
     * */
    composeRequest: function composeRequest(config) {
      var target = config.target;
      var method = config.method;
      var data = config.data || {};
      var csrf = data.csrf; // don't want to send this to the endpoint

      var data = _.omit(data, 'csrf');

      var endpoint = ApiTargets[target];
      var that = this;
      var deferred = $.Deferred();
      var requestData;

      function done() {
        deferred.resolve.apply(deferred, arguments);
      } // will have a default fail message for get requests or put/post requests


      function fail() {
        var toCall = method == 'GET' ? that.handleFailedGET : that.handleFailedPOST;
        var argsWithTarget = [].slice.apply(arguments);
        argsWithTarget.push(target);
        toCall.apply(that, argsWithTarget);
        deferred.reject.apply(deferred, arguments);
      }

      requestData = {
        target: endpoint,
        options: {
          context: this,
          type: method,
          data: !_.isEmpty(data) ? JSON.stringify(data) : undefined,
          contentType: 'application/json',
          done: done,
          fail: fail
        }
      }; // it came from a form, needs to have a csrf token

      if (csrf) {
        this.sendRequestWithNewCSRF(function (csrfToken) {
          requestData.options.headers = {
            'X-CSRFToken': csrfToken
          };
          this.getBeeHive().getService('Api').request(new ApiRequest(requestData));
        });
      } else {
        this.getBeeHive().getService('Api').request(new ApiRequest(requestData));
      }

      return deferred.promise();
    },
    redirectIfNecessary: function redirectIfNecessary() {
      var pubsub = this.getPubSub(); // redirect user to wherever they were before authentication page

      if (this.getBeeHive().getObject('MasterPageManager').currentChild === 'AuthenticationPage' && this.isLoggedIn()) {
        // so that navigator can redirect to the proper page
        var previousNav = this.getBeeHive().getService('HistoryManager').getPreviousNav(); // If there there was no history, redirect to landing page

        if (!previousNav) {
          previousNav = 'index-page';
        }

        pubsub.publish.apply(pubsub, [pubsub.NAVIGATE].concat(previousNav));
      } else if (this.getBeeHive().getObject('MasterPageManager').currentChild === 'SettingsPage' && !this.isLoggedIn()) {
        pubsub.publish(pubsub.NAVIGATE, 'authentication-page');
      }
    },

    /* set user */
    setUser: function setUser(username) {
      this.userModel.set('user', username);

      if (this.isLoggedIn()) {
        this.completeLogIn();
      }
    },
    // this function is called immediately after the login is confirmed
    // get the user's data from myads
    completeLogIn: function completeLogIn() {
      var that = this;
      this.fetchData('USER_DATA').done(function (data) {
        that.userModel.set(data);
      });
    },
    // this function is called immediately after the logout is confirmed
    completeLogOut: function completeLogOut() {
      this.userModel.clear();
    },
    // publicly accessible
    deleteAccount: function deleteAccount() {
      var that = this;
      return this.postData('DELETE', {
        csrf: true
      }).done(function () {
        that.getApiAccess({
          reconnect: true
        }).done(function () {
          that.completeLogOut();
        });
      });
    },
    changeEmail: function changeEmail(data) {
      var _this = this;

      var new_email = data.email;

      var onDone = function onDone() {
        // publish alert
        var alertSuccess = function alertSuccess() {
          setTimeout(function () {
            var message = '<p>Please check <b>' + new_email + "</b> for further instructions</p><p>(If you don't see the email, please <b>check your spam folder</b>)</p>";

            _this.getPubSub().publish(_this.getPubSub().ALERT, new ApiFeedback({
              code: 0,
              msg: message,
              type: 'success',
              title: 'Success',
              modal: true
            }));
          }, 100);
        }; // need to do it this way so the alert doesnt get lost after page is changed


        _this.getPubSub().subscribeOnce(_this.getPubSub().NAVIGATE, alertSuccess);

        _this.getPubSub().publish(_this.getPubSub().NAVIGATE, 'index-page');
      };

      data = _.extend(data, {
        csrf: true
      });
      return this.postData('CHANGE_EMAIL', data).done(onDone);
    },
    changePassword: function changePassword(data) {
      data = _.extend(data, {
        csrf: true
      });
      return this.postData('CHANGE_PASSWORD', data);
    },
    // returns a promise
    getToken: function getToken() {
      return this.fetchData('TOKEN');
    },
    generateToken: function generateToken() {
      return this.putData('TOKEN', {
        csrf: true
      });
    },
    getUserData: function getUserData() {
      return this.userModel.toJSON();
    },

    /*
     * POST an update to the myads user_data endpoint
     * (success will automatically update the user object's model of myads data)
     * */
    setUserData: function setUserData(data) {
      var that = this;
      return this.postData('USER_DATA', data).done(function (data) {
        that.userModel.set(data);
      });
    },
    getUserName: function getUserName() {
      return this.userModel.get('user');
    },
    isLoggedIn: function isLoggedIn() {
      return !!this.userModel.get('user');
    },

    /*
     * POST an update to the myads user_data endpoint
     * (success will automatically update the user object's model of myads data)
     * */
    setMyADSData: function setMyADSData(data) {
      return this.postData('USER_DATA', data);
    },

    /*
     * this function queries the myads open url configuration endpoint
     * and returns a promise that it resolves with the data
     * (it is only needed by the preferences widget)
     * */
    getOpenURLConfig: function getOpenURLConfig() {
      return this.getSiteConfig('link_servers');
    },
    getSiteConfig: function getSiteConfig(key) {
      var deferred = $.Deferred();

      function done(data) {
        deferred.resolve(data);
      }

      function fail(data) {
        deferred.reject(data);
      }

      var request = new ApiRequest({
        target: key ? ApiTargets.SITE_CONFIGURATION + '/' + key : ApiTargets.SITE_CONFIGURATION,
        options: {
          type: 'GET',
          done: done,
          fail: fail
        }
      });
      this.getBeeHive().getService('Api').request(request);
      return deferred.promise();
    },
    hardenedInterface: {
      setUser: 'set username into user',
      isLoggedIn: 'whether the user is logged in',
      getUserName: "get the user's email before the @",
      setLocalStorage: "sets an object in to user's local storage",
      getLocalStorage: "gives you a json object for user's local storage",
      isOrcidModeOn: 'figure out if user has Orcid mode activated',
      setOrcidMode: 'set orcid ui on or off',
      getOpenURLConfig: 'get list of openurl endpoints',
      getUserData: 'myads data',
      setUserData: 'POST user data to myads endpoint',
      getRecentQueries: 'get the 10 most recent queries as array',
      addToRecentQueries: 'add a query to the set of recent queries',
      generateToken: 'PUT to token endpoint to make a new token',
      getToken: 'GET from token endpoint',
      deleteAccount: 'POST to delete account endpoint',
      changePassword: 'POST to change password endpoint',
      changeEmail: 'POST to change email endpoint',
      setMyADSData: '',
      USER_SIGNED_IN: 'constant',
      USER_SIGNED_OUT: 'constant',
      USER_INFO_CHANGE: 'constant'
    }
  });

  _.extend(User.prototype, Hardened, Dependon.BeeHive, Dependon.App, ApiAccess, {
    USER_SIGNED_IN: 'user_signed_in',
    USER_SIGNED_OUT: 'user_signed_out',
    USER_INFO_CHANGE: 'user_info_change'
  });

  return User;
});

/*
 * A generic class that lazy-loads User info
 */
define('js/components/session',['backbone', 'js/components/api_request', 'js/components/api_targets', 'js/mixins/hardened', 'js/components/generic_module', 'js/mixins/dependon', 'js/components/api_query', 'js/components/user', 'js/components/api_feedback', 'js/mixins/api_access'], function (Backbone, ApiRequest, ApiTargets, Hardened, GenericModule, Dependon, ApiQuery, User, ApiFeedback, ApiAccess) {
  var SessionModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        resetPasswordToken: undefined
      };
    }
  });
  var Session = GenericModule.extend({
    initialize: function initialize(options) {
      var options = options || {}; // right now, this will only be used if someone forgot their password

      this.model = new SessionModel();
      this.test = options.test ? true : undefined;

      _.bindAll(this, ['loginSuccess', 'loginFail', 'registerSuccess', 'registerFail', 'resetPassword1Success', 'resetPassword1Fail', 'resetPassword2Success', 'resetPassword2Fail']);
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
    },

    /* methods that will be available to widgets */
    login: function login(data) {
      var d = $.Deferred();
      var that = this;
      this.sendRequestWithNewCSRF(function (csrfToken) {
        var request = new ApiRequest({
          target: ApiTargets.USER,
          query: new ApiQuery({}),
          options: {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            headers: {
              'X-CSRFToken': csrfToken
            },
            done: function done() {
              // allow widgets to listen for success or failure
              d.resolve.apply(d, arguments); // session response to success

              that.loginSuccess.apply(that, arguments);
            },
            fail: function fail() {
              d.reject.apply(d, arguments);
              that.loginFail.apply(that, arguments);
            },
            beforeSend: function beforeSend(jqXHR, settings) {
              jqXHR.session = this;
            }
          }
        });
        return this.getBeeHive().getService('Api').request(request);
      });
      return d.promise();
    },

    /*
     * every time a csrf token is required, csrf manager will request a new token,
     * and it allows you to attach callbacks to the promise it returns
     * */
    sendRequestWithNewCSRF: function sendRequestWithNewCSRF(callback) {
      callback = _.bind(callback, this);
      this.getBeeHive().getObject('CSRFManager').getCSRF().done(callback);
    },
    logout: function logout() {
      this.sendRequestWithNewCSRF(function (csrfToken) {
        var request = new ApiRequest({
          target: ApiTargets.LOGOUT,
          query: new ApiQuery({}),
          options: {
            context: this,
            type: 'POST',
            headers: {
              'X-CSRFToken': csrfToken
            },
            contentType: 'application/json',
            fail: this.logoutSuccess,
            done: this.logoutSuccess
          }
        });
        return this.getBeeHive().getService('Api').request(request);
      });
    },
    register: function register(data) {
      var current_loc = this.test ? 'location.origin' : location.origin; // add base_url to data so email redirects to right url

      _.extend(data, {
        verify_url: current_loc + '/#user/account/verify/register'
      });

      this.sendRequestWithNewCSRF(function (csrfToken) {
        var request = new ApiRequest({
          target: ApiTargets.REGISTER,
          query: new ApiQuery({}),
          options: {
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            headers: {
              'X-CSRFToken': csrfToken
            },
            done: this.registerSuccess,
            fail: this.registerFail
          }
        });
        return this.getBeeHive().getService('Api').request(request);
      });
    },
    resetPassword1: function resetPassword1(data) {
      var current_loc = this.test ? 'location.origin' : location.origin; // add base_url to data so email redirects to right url

      _.extend(data, {
        reset_url: current_loc + '/#user/account/verify/reset-password'
      });

      var email = data.email;

      var data = _.omit(data, 'email');

      this.sendRequestWithNewCSRF(function (csrfToken) {
        var request = new ApiRequest({
          target: ApiTargets.RESET_PASSWORD + '/' + email,
          query: new ApiQuery({}),
          options: {
            type: 'POST',
            data: JSON.stringify(data),
            headers: {
              'X-CSRFToken': csrfToken
            },
            contentType: 'application/json',
            done: this.resetPassword1Success,
            fail: this.resetPassword1Fail
          }
        });
        return this.getBeeHive().getService('Api').request(request);
      });
    },
    resetPassword2: function resetPassword2(data) {
      this.sendRequestWithNewCSRF(function (csrfToken) {
        var request = new ApiRequest({
          target: ApiTargets.RESET_PASSWORD + '/' + this.model.get('resetPasswordToken'),
          query: new ApiQuery({}),
          options: {
            type: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            headers: {
              'X-CSRFToken': csrfToken
            },
            done: this.resetPassword2Success,
            fail: this.resetPassword2Fail
          }
        });
        return this.getBeeHive().getService('Api').request(request);
      });
    },
    setChangeToken: function setChangeToken(token) {
      this.model.set('resetPasswordToken', token);
    },

    /* private methods */
    loginSuccess: function loginSuccess(response, status, jqXHR) {
      // reset auth token by contacting Bootstrap, which will log user in
      var that = this;
      this.getApiAccess({
        reconnect: true
      }).done(function () {});
    },
    loginFail: function loginFail(xhr, status, errorThrown) {
      var pubsub = this.getPubSub();
      var error;

      if (xhr.responseJSON && xhr.responseJSON.error) {
        error = xhr.responseJSON.error;
      } else if (xhr.responseJSON && xhr.responseJSON.message) {
        error = xhr.responseJSON.message;
      } else {
        error = 'error unknown';
      }

      var message = 'Log in was unsuccessful (' + error + ')';
      pubsub.publish(pubsub.ALERT, new ApiFeedback({
        code: 0,
        msg: message,
        type: 'danger',
        fade: true
      }));
      pubsub.publish(pubsub.USER_ANNOUNCEMENT, 'login_fail', message);
    },
    logoutSuccess: function logoutSuccess(response, status, jqXHR) {
      var that = this;
      this.getApiAccess({
        reconnect: true
      }).done(function () {
        // set session state to logged out
        that.getBeeHive().getObject('User').completeLogOut();
      });
    },
    registerSuccess: function registerSuccess(response, status, jqXHR) {
      var pubsub = this.getPubSub(); // authentication widget will show a "success" view in response to this user announcement

      pubsub.publish(pubsub.USER_ANNOUNCEMENT, 'register_success');
    },
    registerFail: function registerFail(xhr, status, errorThrown) {
      var pubsub = this.getPubSub();
      var error = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'error unknown';
      var message = 'Registration was unsuccessful (' + error + ')';
      pubsub.publish(pubsub.ALERT, new ApiFeedback({
        code: 0,
        msg: message,
        type: 'danger',
        fade: true
      }));
      pubsub.publish(pubsub.USER_ANNOUNCEMENT, 'register_fail', message);
    },
    resetPassword1Success: function resetPassword1Success(response, status, jqXHR) {
      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.USER_ANNOUNCEMENT, 'reset_password_1_success');
    },
    resetPassword1Fail: function resetPassword1Fail(xhr, status, errorThrown) {
      var pubsub = this.getPubSub();
      var error = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'error unknown';
      var message = 'password reset step 1 was unsuccessful (' + error + ')';
      pubsub.publish(pubsub.ALERT, new ApiFeedback({
        code: 0,
        msg: message,
        type: 'danger',
        fade: true
      }));
      pubsub.publish(pubsub.USER_ANNOUNCEMENT, 'reset_password_1_fail', message);
    },
    resetPassword2Success: function resetPassword2Success(response, status, jqXHR) {
      var promise;
      var pubsub; // reset auth token by contacting Bootstrap
      // this will log the user in

      promise = this.getApiAccess({
        reconnect: true
      }); // notify interested widgets

      pubsub = this.getPubSub();
      promise.done(function () {
        pubsub.publish(pubsub.USER_ANNOUNCEMENT, 'reset_password_2_success');
        var message = 'Your password has been successfully reset!'; // navigate to home page

        pubsub.publish(pubsub.NAVIGATE, 'index-page');
        pubsub.publish(pubsub.ALERT, new ApiFeedback({
          code: 0,
          msg: message,
          type: 'success',
          modal: true
        }));
      });
      promise.fail(function (xhr) {
        var error = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'error unknown';
        var message = 'Your password was not successfully reset. Please try to follow the link from the email you received again.\n\n(' + error + ')';
        pubsub.publish(pubsub.USER_ANNOUNCEMENT, 'reset_password_2_fail', message);
        pubsub.publish(pubsub.ALERT, new ApiFeedback({
          code: 0,
          msg: message,
          type: 'danger',
          modal: true
        }));
      });
    },
    resetPassword2Fail: function resetPassword2Fail(xhr, status, errorThrown) {
      var pubsub = this.getPubSub();
      var error = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'error unknown';
      var message = 'password reset step 2 was unsuccessful (' + error + ')';
      pubsub.publish(pubsub.ALERT, new ApiFeedback({
        code: 0,
        msg: message,
        type: 'danger',
        fade: true
      }));
      pubsub.publish(pubsub.USER_ANNOUNCEMENT, 'reset_password_2_fail', message);
    },
    hardenedInterface: {
      login: 'log the user in',
      logout: 'log the user out',
      register: 'registers a new user',
      resetPassword1: 'sends an email to account',
      resetPassword2: 'updates the password',
      setChangeToken: 'the router stores the token to reset password here'
    }
  });

  _.extend(Session.prototype, Dependon.BeeHive, Hardened, ApiAccess);

  return Session;
});

/**
 * This mixin (only has a single function) will reset the collection if numFound doesn't exist,
 * or else add  to the collection. Make sure the model for the collection has idAttribute : "resultsIndex"
 * to allow for the collection to add records properly.
 *
 *
 */
define('js/mixins/add_stable_index_to_collection',['underscore'], function (_) {
  var WidgetPaginator = {
    /**
     * returns zero-indexed start val (we expect the page
     * to be zero-indexed!)
     */
    getPageStart: function getPageStart(page, perPage, numFound) {
      return numFound ? Math.min(page * perPage, numFound) : page * perPage;
    },

    /**
     * returns final row value for constructing a page (inclusive)
     */
    getPageEnd: function getPageEnd(page, perPage, numFound) {
      var endVal = this.getPageStart(page, perPage) + perPage;
      return endVal > numFound ? numFound : endVal;
    },

    /**
     * Returns the page number (on which the position falls)
     * It is zero-based count
     *
     * @param start (zero indexed start value of record, returned by solr)
     * @param perPage
     * @returns {number}
     */
    getPageVal: function getPageVal(start, perPage) {
      return Math.floor(start / perPage);
    },

    /**
     * Add 'resultsIndex' attribute into the model.
     *
     * @param docs
     * @param start
     * @returns {*}
     */
    addPaginationToDocs: function addPaginationToDocs(docs, start) {
      var s = _.isArray(start) ? start[0] : parseInt(start);

      _.each(docs, function (d) {
        d.resultsIndex = s; // non zero-indexed

        d.indexToShow = s + 1;
        s += 1;
      });

      return docs;
    }
  };
  return WidgetPaginator;
});

/*
 * This module contains a set of utilities to bootstrap Discovery app
 */
define('js/mixins/discovery_bootstrap',['underscore', 'backbone', 'js/components/api_query', 'js/components/api_request', 'js/components/pubsub_events', 'hbs', 'js/components/api_targets'], function (_, Backbone, ApiQuery, ApiRequest, PubSubEvents, HandleBars, ApiTargets) {
  var startGlobalHandler = function startGlobalHandler() {
    var routes = ['classic-form', 'paper-form', 'index', 'search', 'execute-query', 'abs', 'user', 'orcid-instructions', 'public-libraries'];
    var regx = new RegExp('^#(/?(' + routes.join('|') + ').*/?)?$', 'i');

    var isPushState = function isPushState() {
      return Backbone.history && Backbone.history.options && Backbone.history.options.pushState;
    };

    var transformHref = _.memoize(function (href) {
      return regx.test(href) ? href.replace(/^\/?#\/?/, '/') : false;
    });

    var navigate = function navigate(ev) {
      if (window.bbb) {
        try {
          var nav = bbb.getBeeHive().getService('Navigator');
          nav.router.navigate(ev.data.url, {
            trigger: true,
            replace: false
          });
          return false;
        } catch (e) {
          console.error(e.message);
        }
      } else {
        console.error('cannot find application object');
      }
    };

    var metaKey = false;

    var handleNavigation = function handleNavigation(event) {
      if (!isPushState()) return;
      var $el = $(this); // elements can set `data-dont-handle="true"` to explicitly tell handler to skip

      if ($el.data().dontHandle) {
        return;
      }

      var url = transformHref($el.attr('href'));

      if (url) {
        var old = $el.attr('href'); // update the href on the element

        $el.attr('href', url); // handle metakey presses

        if (event.metaKey || event.ctrlKey) {
          metaKey = true;
          return;
        }

        if (metaKey && event.type === 'focusin') {
          metaKey = false;
          return;
        }

        metaKey = false; // add the click handler (run once)

        $el.one('click', {
          url: url
        }, navigate); // reset to the old url

        $el.one('mouseup blur', function () {
          $el.attr('href', old);
        });
        return false;
      }
    };

    $(document).on('mousedown focus', 'a', handleNavigation);
  };

  var Mixin = {
    configure: function configure() {
      var conf = this.getObject('DynamicConfig');

      if (conf) {
        var beehive = this.getBeeHive();
        var api = beehive.getService('Api');

        if (conf.root) {
          api.url = conf.root + '/' + api.url;
          this.root = conf.root;
        }

        if (conf.debug !== undefined) {
          beehive.debug = conf.debug;
          this.getController('QueryMediator').debug = conf.debug;
        }

        if (conf.apiRoot) {
          api.url = conf.apiRoot;
        }

        if (conf.version) {
          api.clientVersion = conf.version;
        } // ApiTargets has a _needsCredentials array that contains all endpoints
        // that require cookies


        api.modifyRequestOptions = function (opts, request) {
          // there is a list of endpoints that DONT require cookies, if this endpoint
          // is not in that list,
          if (ApiTargets._doesntNeedCredentials.indexOf(request.get('target')) == -1) {
            opts.xhrFields = {
              withCredentials: true
            };
          }
        };

        var orcidApi = beehive.getService('OrcidApi');

        if (conf.orcidProxy) {
          orcidApi.orcidProxyUri = location.origin + conf.orcidProxy;
        }

        this.bootstrapUrls = conf.bootstrapUrls;

        if (conf.useCache) {
          this.triggerMethodOnAll('activateCache');
        }
      }
    },
    bootstrap: function bootstrap() {
      // XXX:rca - solve this better, through config
      var beehive = this.getBeeHive();
      var dynConf = this.getObject('DynamicConfig');
      var timeout = 10000;
      var defer = $.Deferred(); // check out the local storage to see if we have a copy

      var storage = beehive.getService('PersistentStorage');
      var config = storage.get('appConfig');

      if (config && config.expire_in && new Date(config.expire_in) > new Date()) {
        return defer.resolve(config).promise();
      } // this is the application dynamic config


      var api = this.getBeeHive().getService('Api'); // load configuration from remote endpoints

      if (this.bootstrapUrls) {
        var pendingReqs = this.bootstrapUrls.length;
        var retVal = {}; // harvest information from the remote urls and merge it into one object

        var opts = {
          done: function done(data) {
            pendingReqs--;

            _.extend(retVal, data);

            if (pendingReqs <= 0) defer.resolve(retVal);
          },
          fail: function fail() {
            pendingReqs--;
            if (pendingReqs <= 0) defer.resolve(retVal);
          },
          type: 'GET',
          timeout: timeout - 1
        };

        _.each(this.bootstrapUrls, function (url) {
          if (url.indexOf('http') > -1) {
            opts.u = url;
            api.request(new ApiRequest({
              query: new ApiQuery(),
              target: ''
            }), opts);
          } else {
            delete opts.u;
            api.request(new ApiRequest({
              query: new ApiQuery(),
              target: url
            }), opts);
          }
        });

        setTimeout(function () {
          if (defer.state() === 'resolved') {
            return;
          }

          defer.reject(new Error('Timed out while loading modules'));
        }, timeout);
      } else {
        setTimeout(function () {
          defer.resolve({});
        }, 1);
      }

      return defer;
    },

    /**
     * Reload the application - by simply changing the URL (append bbbRedirect=1)
     * If the url already contains 'bbbRedirect', redirect to the error page.
     * @param errorPage
     */
    reload: function reload(endPage) {
      if (location.search.indexOf('debug') > -1) {
        console.warn('Debug stop, normally would reload to: ' + endPage);
        return; // do nothing
      }

      if (location.search && location.search.indexOf('bbbRedirect=1') > -1) {
        return this.redirect(endPage);
      }

      location.search = location.search ? location.search + '&bbbRedirect=1' : 'bbbRedirect=1';
    },
    redirect: function redirect(endPage) {
      if (this.router) {
        location.pathname = this.router.root + endPage;
      } // let's replace the last element from pathname - this code will run only when
      // router is not yet available; therefore it should hit situations when the app
      // was not loaded (but it is not bulletproof - the urls can vary greatly)
      // TODO: intelligently explore the rigth url (by sending HEAD requests)


      location.href = location.protocol + '//' + location.hostname + ':' + location.port + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/' + endPage;
    },
    start: function start(Router) {
      var defer = $.Deferred();
      var app = this;
      var beehive = this.getBeeHive();
      var api = beehive.getService('Api');
      var conf = this.getObject('DynamicConfig'); // set the config into the appstorage
      // TODO: find a more elegant solution

      this.getBeeHive().getObject('AppStorage').setConfig(conf);

      var complain = function complain(x) {
        throw new Error('Ooops. Check you config! There is no ' + x + ' component @#!');
      };

      var navigator = app.getBeeHive().Services.get('Navigator');
      if (!navigator) complain('services.Navigator');
      var masterPageManager = app.getObject('MasterPageManager');
      if (!masterPageManager) complain('objects.MasterPageManager'); // get together all pages and insert widgets there

      masterPageManager.assemble(app).done(function () {
        // attach the master page to the body
        var $main = $('div#body-template-container');

        if (window.__PRERENDERED) {
          var $content = $('div#content-container');
          $($content.selector, masterPageManager.view.el).html($content.html());
          $main.html(masterPageManager.view.el);
        } else {
          $main.html(masterPageManager.view.el);
        } // kick off routing


        app.router = new Router();
        app.router.activate(beehive.getHardenedInstance()); // get ready to handle navigation signals

        navigator.start(app);
        navigator.router = app.router; // this feels hackish

        var noPushState = location.search.indexOf('pushstate=false') > -1; // Trigger the initial route and enable HTML5 History API support

        var newConf = _.defaults({
          pushState: noPushState ? false : undefined
        }, conf && conf.routerConf);

        Backbone.history.start(newConf); // apply a global link handler for push state (after router is started)

        startGlobalHandler();
        defer.resolve();
      });
      return defer.promise();
    }
  };
  return Mixin;
});

define('js/mixins/expose_metadata',['underscore', 'js/components/api_targets', 'js/components/api_query', 'js/components/api_request'], function (_, ApiTargets, ApiQuery, ApiRequest) {
  var NAME = '__EXPORT_RESULTS_AS_BIBTEX__';
  var mixin = {
    /**
     *
     * Gets an array of documents and exposes a function on
     * the global object which, when called, will make a request
     * to `/export` to retrieve a bibtex string.
     *
     * This global method can't be called
     * more than once per cycle.
     *
     * @param {object[]} docs - array of documents
     */
    __exposeMetadata: function __exposeMetadata() {
      var _this = this;

      var docs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      window[NAME] = _.once(function () {
        return new Promise(function (resolve, reject) {
          var ids = docs.map(function (d) {
            return _.isArray(d.identifier) ? d.identifier[0] : d.identifier;
          });

          var ps = _this.getPubSub();

          var request = new ApiRequest({
            target: ApiTargets.EXPORT + 'bibtex',
            query: new ApiQuery({
              bibcode: ids
            }),
            options: {
              type: 'POST',
              done: function done(_ref) {
                var bibtexString = _ref.export;
                resolve({
                  identifiers: ids,
                  bibtexString: bibtexString
                });
              },
              fail: function fail(ev) {
                return reject(ev);
              }
            }
          });
          ps.publish(ps.EXECUTE_REQUEST, request);
        });
      });
    }
  };
  return mixin;
});

define('js/mixins/form_view_functions',['underscore'], function (_) {
  // some functions to be used by form views which auto-validate
  var formFunctions = {
    // for the view
    checkValidationState: function checkValidationState() {
      // hide help
      if (this.model.isValidSafe()) {
        this.$('button[type=submit]').prev('.help-block').html('').addClass('no-show');
      }
    },
    // for the view
    // when someone clicks on submit button
    // parent views/controllers need to listen for "submit-form" event
    triggerSubmit: function triggerSubmit(e) {
      // (only show error messages if submit == true), so once user has unsuccessfully
      // submitted 1 time
      // don't need to reset because view will be disposed of after successful submit event
      this.submit = true;

      if (this.model.isValid(true)) {
        var working = '<i class="fa fa-lg fa-spinner fa-pulse" aria-hidden="true"></i> Working...';
        this.trigger('submit-form', this.model);
        this.$('button[type=submit]').prev('.help-block').addClass('no-show');
        this.$('button[type=submit]').removeClass('btn-success').addClass('disabled').html(working);
      } else {
        this.$('button[type=submit]').prev('.help-block').removeClass('no-show').html('Fields missing or incomplete');
      }

      return false;
    },
    // for the view, to be called onRender
    activateValidation: function activateValidation() {
      Backbone.Validation.bind(this, {
        forceUpdate: true
      });
      this.stickit();
    },
    // for the model
    // a way to validate all fields without causing invalid states for empty fields
    isValidSafe: function isValidSafe() {
      // check everything that has required=true before you do this.isValid(), and make sure it isn't empty
      // otherwise the way it is set up, the form will show invalid markers for unentered fields
      var allRequired = true;

      _.each(this.validation, function (v, k) {
        if (v.required && !this.get(k)) {
          allRequired = false;
        }
      }, this);

      if (allRequired && this.isValid(true)) {
        return true;
      }
    },
    // for the model, if it has a validation hash from backbone-validation
    // right now, useful only for user setting models that combine user-entered info and info from the server
    reset: function reset() {
      var valKeys = _.keys(this.validation);

      _.each(this.attributes, function (v, k) {
        if (_.contains(valKeys, k)) {
          this.unset(k, {
            silent: true
          });
        }
      }, this);
    }
  };
  return formFunctions;
});

define('js/mixins/formatter',[], function () {
  var f = {};
  /*
   * takes a number or string, returns a string
   * */

  f.formatNum = function (num) {
    var withCommas = [];
    num += '';
    var parts = num.split('.');
    var extra = '';

    if (parts.length === 2) {
      num = parts[0];
      extra = '.' + parts[1];
    }

    if (num.length < 4) {
      return num + extra;
    }

    num = num.split('').reverse();

    _.each(num, function (n, i) {
      withCommas.unshift(n);

      if ((i + 1) % 3 === 0 && i !== num.length - 1) {
        withCommas.unshift(',');
      }
    });

    return withCommas.join('') + extra;
  };

  return f;
});

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define('js/mixins/openurl_generator',['underscore'], function (_) {
  /**
   * @typedef Metadata
   * @property {string[]} page
   * @property {string[]} doi
   * @property {string} doctype
   * @property {string} bibcode
   * @property {string} author
   * @property {string} issue
   * @property {string} volume
   * @property {string} pub
   * @property {string} year
   * @property {string[]} title
   * @property {string[]} issn
   * @property {string[]} isbn
   */

  /**
   * check if value is string
   * @param {any} val value to test
   * @returns {boolean}
   */
  var isString = function isString(val) {
    return _.isString(val);
  };
  /**
   * Check if value is an array
   * @param {any} val value to test
   * @returns {boolean}
   */


  var isArray = function isArray(val) {
    return _.isArray(val);
  };
  /**
   * ADS specific fields
   */


  var STATIC_FIELDS = {
    url_ver: 'Z39.88-2004',
    rft_val_fmt: 'info:ofi/fmt:kev:mtx:',
    rfr_id: 'info:sid/ADS',
    sid: 'ADS'
  };
  /**
   * Generates an OpenUrl using metadata and a linkServer
   * @param {object} options
   * @param {Metadata} options.metadata field data from database
   * @param {string} options.linkServer base url to use for generating link
   * @returns {string} the openUrl url
   */

  var getOpenUrl = function getOpenUrl(options) {
    var _ref = options || {},
        metadata = _ref.metadata,
        _ref$linkServer = _ref.linkServer,
        linkServer = _ref$linkServer === void 0 ? '' : _ref$linkServer;

    var _ref2 = metadata || {},
        page = _ref2.page,
        doi = _ref2.doi,
        doctype = _ref2.doctype,
        bibcode = _ref2.bibcode,
        author = _ref2.author,
        issue = _ref2.issue,
        volume = _ref2.volume,
        pub = _ref2.pub,
        year = _ref2.year,
        title = _ref2.title,
        issn = _ref2.issn,
        isbn = _ref2.isbn; // parse out degree based on bibcode


    var degree = isString(bibcode) && (bibcode.includes('PhDT') ? 'PhD' : bibcode.includes('MsT') ? 'Masters' : false); // genre is "disseration" for phd thesis, otherwise use doctype/article

    var genre = isString(doctype) && isString(bibcode) && bibcode.includes('PhDT') ? 'dissertation' : isString(doctype) ? doctype : 'article'; // parse various fields to create a context object

    var parsed = _objectSpread(_objectSpread({}, STATIC_FIELDS), {}, {
      'rft.spage': isArray(page) ? page[0].split('-')[0] : false,
      id: isArray(doi) ? 'doi:' + doi[0] : false,
      genre: genre,
      rft_id: [isArray(doi) ? 'info:doi/' + doi[0] : false, isString(bibcode) ? 'info:bibcode/' + bibcode : false],
      'rft.degree': degree,
      'rft.aulast': isString(author) ? author.split(', ')[0] : false,
      'rft.aufirst': isString(author) ? author.split(', ')[1] : false,
      'rft.issue': isString(issue) ? issue : false,
      'rft.volume': isString(volume) ? volume : false,
      'rft.jtitle': isString(pub) ? pub : false,
      'rft.date': isString(year) ? year : false,
      'rft.atitle': isArray(title) ? title[0] : false,
      'rft.issn': isArray(issn) ? issn[0] : false,
      'rft.isbn': isArray(isbn) ? isbn[0] : false,
      'rft.genre': genre,
      rft_val_fmt: STATIC_FIELDS.rft_val_fmt + (isString(doctype) ? doctype : 'article')
    }); // add extra fields to context object


    var context = _objectSpread(_objectSpread({}, parsed), {}, {
      spage: parsed['rft.spage'],
      volume: parsed['rft.volume'],
      title: parsed['rft.jtitle'],
      atitle: parsed['rft.atitle'],
      aulast: parsed['rft.aulast'],
      aufirst: parsed['rft.aufirst'],
      date: parsed['rft.date'],
      isbn: parsed['rft.isbn'],
      issn: parsed['rft.issn']
    }); // if the linkServer has query string, just append to the end


    var openUrl = linkServer.includes('?') ? linkServer + '&' : linkServer + '?'; // generate array of query params from the context object

    var fields = Object.keys(context).filter(function (k) {
      return context[k];
    }).map(function (key) {
      if (context[key]) {
        if (isArray(context[key])) {
          return context[key].filter(function (v) {
            return v;
          }).map(function (val) {
            return "".concat(key, "=").concat(val);
          }).join('&');
        }

        return "".concat(key, "=").concat(context[key]);
      }
    });
    return encodeURI(openUrl + fields.join('&'));
  };

  return {
    getOpenUrl: getOpenUrl
  };
});

define('js/mixins/link_generator_mixin',['underscore', 'js/mixins/openurl_generator'], function (_, _ref) {
  var getOpenUrl = _ref.getOpenUrl;
  var GATEWAY_BASE_URL = '/link_gateway/';
  var DEFAULT_ORDERING = ['ADS PDF', 'ADS Scanned Article', 'My Institution', 'Publisher Article', 'Publisher PDF', 'arXiv PDF']; // set of link types and descriptions

  var LINK_TYPES = {
    AcA: {
      shortName: 'AcA',
      description: 'Acta Astronomica Data Files'
    },
    ADS_PDF: {
      name: 'ADS PDF',
      shortName: 'ADS',
      description: 'ADS PDF',
      type: 'PDF'
    },
    ADS_SCAN: {
      name: 'ADS Scanned Article',
      description: 'ADS scanned article',
      shortName: 'ADS',
      type: 'SCAN'
    },
    ALMA: {
      shortName: 'ALMA',
      description: 'Atacama Large Millimeter/submillimeter Array'
    },
    ARI: {
      shortName: 'ARI',
      description: 'Astronomisches Rechen-Institut'
    },
    Astroverse: {
      shortName: 'Astroverse',
      description: 'CfA Dataverse'
    },
    ATNF: {
      shortName: 'ATNF',
      description: 'Australia Telescope Online Archive'
    },
    Author: {
      shortName: 'Author',
      description: 'Author Hosted Dataset'
    },
    AUTHOR_HTML: {
      name: 'Author Article',
      shortName: 'Author',
      description: 'Link to HTML page provided by author',
      type: 'HTML'
    },
    AUTHOR_PDF: {
      name: 'Author PDF',
      shortName: 'Author',
      description: 'Link to PDF page provided by author',
      type: 'PDF'
    },
    BAVJ: {
      shortName: 'BAVJ',
      description: 'Data of the German Association for Variable Stars'
    },
    BICEP2: {
      shortName: 'BICEP2',
      description: 'BICEP/Keck Data'
    },
    CADC: {
      shortName: 'CADC',
      description: 'Canadian Astronomy Data Center'
    },
    CDS: {
      shortName: 'CDS',
      description: 'Strasbourg Astronomical Data Center'
    },
    Chandra: {
      shortName: 'Chandra',
      description: 'Chandra X-Ray Observatory'
    },
    Dryad: {
      shortName: 'Dryad',
      description: 'International Repository of Research Data'
    },
    EPRINT_HTML: {
      name: 'arXiv Article',
      shortName: 'arXiv',
      description: 'Arxiv article',
      type: 'HTML'
    },
    EPRINT_PDF: {
      name: 'arXiv PDF',
      shortName: 'arXiv',
      description: 'ArXiv eprint',
      type: 'PDF'
    },
    ESA: {
      shortName: 'ESA',
      description: 'ESAC Science Data Center'
    },
    ESO: {
      shortName: 'ESO',
      description: 'European Southern Observatory'
    },
    Figshare: {
      shortName: 'Figshare',
      description: 'Online Open Access Repository'
    },
    GCPD: {
      shortName: 'GCPD',
      description: 'The General Catalogue of Photometric Data'
    },
    Github: {
      shortName: 'Github',
      description: 'Web-based version-control and collaboration platform for software developers.'
    },
    GTC: {
      shortName: 'GTC',
      description: 'Gran Telescopio CANARIAS Public Archive'
    },
    HEASARC: {
      shortName: 'HEASARC',
      description: "NASA's High Energy Astrophysics Science Archive Research Center"
    },
    Herschel: {
      shortName: 'Herschel',
      description: 'Herschel Science Center'
    },
    IBVS: {
      shortName: 'IBVS',
      description: 'Information Bulletin on Variable Stars'
    },
    INES: {
      shortName: 'INES',
      description: 'IUE Newly Extracted Spectra'
    },
    IRSA: {
      shortName: 'IRSA',
      description: 'NASA/IPAC Infrared Science Archive'
    },
    ISO: {
      shortName: 'ISO',
      description: 'Infrared Space Observatory'
    },
    JWST: {
      shortName: 'JWST',
      description: 'JWST Proposal Info'
    },
    KOA: {
      shortName: 'KOA',
      description: 'Keck Observatory Archive'
    },
    MAST: {
      shortName: 'MAST',
      description: 'Mikulski Archive for Space Telescopes'
    },
    NED: {
      shortName: 'NED',
      description: 'NASA/IPAC Extragalactic Database'
    },
    NExScI: {
      shortName: 'NExScI',
      description: 'NASA Exoplanet Archive'
    },
    NOAO: {
      shortName: 'NOAO',
      description: 'National Optical Astronomy Observatory'
    },
    PANGAEA: {
      shortName: 'PANGAEA',
      description: 'Digital Data Library and a Data Publisher for Earth System Science'
    },
    PASA: {
      shortName: 'PASA',
      description: 'Publication of the Astronomical Society of Australia Datasets'
    },
    PDG: {
      shortName: 'PDG',
      description: 'Particle Data Group'
    },
    PDS: {
      shortName: 'PDS',
      description: 'The NASA Planetary Data System'
    },
    protocols: {
      shortName: 'protocols',
      description: 'Collaborative Platform and Preprint Server for Science Methods and Protocols'
    },
    PUB_HTML: {
      name: 'Publisher Article',
      shortName: 'Publisher',
      description: 'Electronic on-line publisher article (HTML)',
      type: 'HTML'
    },
    PUB_PDF: {
      name: 'Publisher PDF',
      shortName: 'Publisher',
      description: 'Publisher PDF',
      type: 'PDF'
    },
    SIMBAD: {
      shortName: 'SIMBAD',
      description: 'SIMBAD Database at the CDS'
    },
    Spitzer: {
      shortName: 'Spitzer',
      description: 'Spitzer Space Telescope'
    },
    TNS: {
      shortName: 'TNS',
      description: 'Transient Name Server'
    },
    Vizier: {
      shortName: 'VizieR',
      description: 'VizieR Catalog Service'
    },
    XMM: {
      shortName: 'XMM',
      description: 'XMM Newton Science Archive'
    },
    Zenodo: {
      shortName: 'Zenodo',
      description: 'Zenodo Archive'
    }
  };
  /**
   * Create the resolver url
   * @param {string} bibcode - the bibcode
   * @param {string} target - the source target (i.e. PUB_HTML)
   * @returns {string} - the new url
   */

  var _createGatewayUrl = function _createGatewayUrl(bibcode, target) {
    if (_.isString(bibcode) && _.isString(target)) {
      return GATEWAY_BASE_URL + enc(bibcode) + '/' + target;
    }

    return '';
  };
  /**
   * process the link data
   *
   * Proceeds in this manner:
   * 1. Check the property to find ESOURCE and DATA
   * 2. If there, find the property on the parent object
   * 3. Process by some rules
   *  3.1. If OPENACCESS property is present, then all esourses ending with _HTML are open
   *  3.2. If <field>_OPENACCESS property is present, then the corresponding esource field is open
   *  3.3. If electr field is present, check if a linkServer is provided among some other things
   *
   * @param {object} data - the data object to process
   * @returns {object} - the fulltext and data sources
   */


  var _processLinkData = function _processLinkData(data) {
    var createGatewayUrl = this._createGatewayUrl;
    var fullTextSources = [];
    var dataProducts = [];
    var countOpenUrls = 0;
    var property = data.property; // check the esources property

    _.forEach(data.esources, function (el, ids, sources) {
      var parts = el.split('_');
      var linkInfo = LINK_TYPES[el];
      var linkServer = data.link_server;
      var identifier = data.doi || data.issn || data.isbn; // Create an OpenURL
      // Only create an openURL if the following is true:
      //   - The article HAS an Identifier (doi, issn, isbn)
      //   - The user is authenticated
      //   - the user HAS a library link server

      if (identifier && linkServer && countOpenUrls < 1) {
        fullTextSources.push({
          url: getOpenUrl({
            metadata: data,
            linkServer: linkServer
          }),
          openUrl: true,
          type: 'INSTITUTION',
          shortName: 'My Institution',
          name: 'My Institution',
          description: 'Find Article At My Institution'
        });
        countOpenUrls += 1;
      }

      if (parts.length > 1) {
        fullTextSources.push({
          url: createGatewayUrl(data.bibcode, el),
          open: _.contains(property, parts[0] + '_OPENACCESS'),
          shortName: linkInfo && linkInfo.shortName || el,
          name: linkInfo && linkInfo.name || el,
          type: linkInfo && linkInfo.type || 'HTML',
          description: linkInfo && linkInfo.description
        }); // if entry cannot be split, then it will not be open access
      } else {
        fullTextSources.push({
          url: createGatewayUrl(data.bibcode, el),
          open: false,
          shortName: linkInfo && linkInfo.shortName || el,
          name: linkInfo && linkInfo.name || el,
          type: linkInfo && linkInfo.type || 'HTML',
          description: linkInfo && linkInfo.description
        });
      }
    }); // if no arxiv link is present, check links_data as well to make sure


    var hasEprint = _.find(fullTextSources, {
      name: LINK_TYPES.EPRINT_PDF.name
    });

    if (!hasEprint && _.isArray(data.links_data)) {
      _.forEach(data.links_data, function (linkData) {
        var link = JSON.parse(linkData);

        if (/preprint/i.test(link.type)) {
          var info = LINK_TYPES.EPRINT_PDF;
          fullTextSources.push({
            url: link.url,
            open: true,
            shortName: info && info.shortName || link.type,
            name: info && info.name || link.type,
            type: info && info.type || 'HTML',
            description: info && info.description
          });
        }
      });
    } // reorder the full text sources based on our default ordering


    fullTextSources = _.sortBy(fullTextSources, function (source) {
      var rank = DEFAULT_ORDERING.indexOf(source.name);
      return rank > -1 ? rank : 9999;
    }); // check the data property

    _.forEach(data.data, function (product) {
      var parts = product.split(':');
      var linkInfo = LINK_TYPES[parts[0]]; // are there any without a count? just make them 1

      if (parts.length > 1) {
        dataProducts.push({
          url: createGatewayUrl(data.bibcode, parts[0]),
          count: parts[1],
          name: linkInfo ? linkInfo.shortName : parts[0],
          description: linkInfo ? linkInfo.description : parts[0]
        });
      } else {
        dataProducts.push({
          url: createGatewayUrl(data.bibcode, product),
          count: '1',
          name: linkInfo ? linkInfo.shortName : product,
          description: linkInfo ? linkInfo.description : product
        });
      }
    }); // sort the data products by descending by count


    dataProducts = _.sortBy(dataProducts, 'count').reverse();
    return {
      fullTextSources: fullTextSources,
      dataProducts: dataProducts
    };
  };
  /**
   * Parse a data object to pull out the references/citations and table of contents
   * it will also return a copy of the data object with a links property added
   * @param {object} _data - the data object to parse
   * @returns {object} - copy of the data object with links prop added
   */


  var _parseLinksDataForModel = function _parseLinksDataForModel(_data, linksData) {
    var links = {
      list: [],
      data: [],
      text: []
    };

    var data = _.extend({}, _data, {
      links: links
    }); // map linksData to links object


    if (_.isPlainObject(linksData)) {
      links = _.assign(links, {
        data: links.data.concat(linksData.dataProducts || []),
        text: links.text.concat(linksData.fullTextSources || [])
      });
    }

    if (_.isPlainObject(data)) {
      // check for the citations property
      if (_.isPlainObject(data['[citations]']) && _.isString(data.bibcode)) {
        var citations = data['[citations]']; // push it onto the links if the citation count is higher than 0

        if (_.isNumber(citations.num_citations) && citations.num_citations > 0) {
          links.list.push({
            letter: 'C',
            name: 'Citations (' + citations.num_citations + ')',
            url: '#abs/' + enc(data.bibcode) + '/citations'
          });
        } // push onto the links if the reference count is higher than 0


        if (_.isNumber(citations.num_references) && citations.num_references > 0) {
          links.list.push({
            letter: 'R',
            name: 'References (' + citations.num_references + ')',
            url: '#abs/' + enc(data.bibcode) + '/references'
          });
        }
      } // check that we have property and whether table of contents is found


      if (_.isArray(data.property) && _.isString(data.bibcode)) {
        if (_.contains(data.property, 'TOC')) {
          links.list.push({
            letter: 'T',
            name: 'Table of Contents',
            url: '#abs/' + enc(data.bibcode) + '/toc'
          });
        }
      }
    } else {
      throw new Error('data must be a plain object');
    }

    return data;
  };
  /**
   * Takes data--a json object from apiResponse--and augments it with a "links"
   * object. This is used for item views in the results widget. This is to be called
   * by the processData method of a widget.
   *
   */


  var parseLinksData = function parseLinksData(data) {
    var parseLinksDataForModel = _.bind(this._parseLinksDataForModel, this);

    var parseResourcesData = _.bind(this.parseResourcesData, this);

    if (_.isArray(data)) {
      return _.map(data, function (d) {
        try {
          var linkData = parseResourcesData(d);
          return parseLinksDataForModel(d, linkData);
        } catch (e) {
          return d;
        }
      });
    }

    return [];
  };
  /**
   * Check that data is an object and that it has the correct properties
   *
   * @param {object} data - the data to parse
   */


  var parseResourcesData = function parseResourcesData(data) {
    var processLinkData = _.bind(this._processLinkData, this); // data must have 'property' and sub-props


    if (_.isPlainObject(data)) {
      if (_.isArray(data.property) && _.isString(data.bibcode)) {
        // make sure if property has a esource or data, we find it on data as well
        if (_.contains(data.property, 'ESOURCE') && !_.has(data, 'esources')) {
          throw new Error('if `property` property contains `ESOURCE`, then data must have `esources` field');
        }

        if (_.contains(data.property, 'DATA') && !_.has(data, 'data')) {
          throw new Error('if `property` property contains `DATA`, then data must have `data` field');
        }

        return processLinkData(_.extend({}, data));
      }

      throw new Error('data must have `property` and `bibcode`');
    } else {
      throw new Error('data must be a plain object');
    }
  };
  /**
   * Takes in a type and an identifier and will generate a link
   * @param {string} bibcode - the bibcode
   * @param {string} type - the type of identifier
   * @param {string|array} identifier - the identifier to use to build the url
   * @returns {string}
   */


  var createUrlByType = function createUrlByType(bibcode, type, identifier) {
    var id = identifier;

    if (_.isArray(id)) {
      id = id[0];
    }

    if (_.isString(bibcode) && _.isString(type) && _.isString(id)) {
      return GATEWAY_BASE_URL + bibcode + '/' + type + ':' + id;
    }

    return '';
  };

  var enc = function enc(str) {
    return encodeURIComponent(str);
  };

  return {
    LINK_TYPES: LINK_TYPES,
    parseLinksData: parseLinksData,
    parseResourcesData: parseResourcesData,
    createUrlByType: createUrlByType,
    _createGatewayUrl: _createGatewayUrl,
    _processLinkData: _processLinkData,
    _parseLinksDataForModel: _parseLinksDataForModel
  };
});

define('js/mixins/papers_utils',['underscore', 'jquery-ui', 'jquery'], function (_, $ui, $) {
  var Utils = {
    /**
     * Receives the  ISO8601 date string (actually, browsers will be able to parse
     * range of date strings, but you should be careful and not count on that!)
     *
     * And returns a string in requested format; when the minute is set to 0,
     * we will that the month was not given (ADS didn't know about it)
     *
     * @param dateString
     *    string in ISO8601 format
     * @param format
     *    string, jquery-ui datepicker for options
     * @param foolsFormat
     *    array, jquery-ui datepicker format to use when we detect that
     *    hour == minute == second == 0 (this is ADS convention to mark
     *    unknown publication dates) or when a day or month are missing
     * @returns {*}
     */
    formatDate: function formatDate(dateString, format) {
      if (format && !_.isObject(format)) {
        throw new Error('format must be an object of string formats');
      }

      format = _.defaults(format || {}, {
        format: 'yy/mm/dd',
        missing: {
          day: 'yy/mm',
          month: 'yy'
        },
        separator: '-',
        junk: '-00'
      });
      var fooIndex = ['day', 'month'];
      var localDatePretendingToBeUtc;
      var utc;
      var formatToUse;
      formatToUse = format.format;
      utc = new Date(dateString);

      if (_.isNaN(utc.getYear())) {
        // we have to modify dateString, removing pattern until it parses
        var i = 0;
        var dateCopy = dateString;
        var p = format.junk;

        while (dateCopy.indexOf(p) > -1) {
          dateCopy = dateCopy.substring(0, dateCopy.lastIndexOf(p));

          try {
            utc = new Date(dateCopy);

            if (!_.isNaN(utc.getYear())) {
              formatToUse = format.missing[fooIndex[i]];

              if (!formatToUse) {
                throw new Error('format is missing: ' + fooIndex[i]);
              }
            }
          } catch (e) {// pass
          }

          i += 1;
        }

        if (_.isNaN(utc.getYear())) throw new Error('Error parsing input: ' + dateString);
      } else {
        // it parsed well, but the string was too short
        var s = format.separator;

        if (dateString.indexOf(s) > -1) {
          var parts = dateString.split(s);

          if (parts.length == 2) {
            formatToUse = format.missing[fooIndex[0]];
          } else if (parts.length == 1) {
            formatToUse = format.missing[fooIndex[1]];
          }

          if (!formatToUse) {
            throw new Error('format is missing: missing.' + fooIndex[i]);
          }
        }
      } // the 'utc' contains UTC time, but it is displayed by browser in local time zone
      // so we'll create another time, which will pretend to be UTC (but in reality it
      // is just UTC+local offset); but it will display things as UTC; confused? ;-)


      localDatePretendingToBeUtc = new Date(utc.getTime() + utc.getTimezoneOffset() * 60000);
      return $.datepicker.formatDate(formatToUse, localDatePretendingToBeUtc);
    },
    shortenAbstract: function shortenAbstract(abs, maxLen) {
      maxLen = maxLen || 300; // if this function returns undefined,
      // the template knows to just show the whole abstract

      if (abs.length <= maxLen) return undefined;
      var i = abs.slice(0, maxLen).lastIndexOf(' ');
      return abs.slice(0, i + 1) + '...';
    },

    /**
     * This method prepares data for consumption by the template on a per-doc basis
     *
     * @returns {*}
     */
    prepareDocForViewing: function prepareDocForViewing(data) {
      var shownAuthors;
      var maxAuthorNames = 3;

      if (data.author && data.author.length > maxAuthorNames) {
        data.extraAuthors = data.author.length - maxAuthorNames;
        shownAuthors = data.author.slice(0, maxAuthorNames);
      } else if (data.author) {
        shownAuthors = data.author;
      }

      if (data.author) {
        var format = function format(d, i, arr) {
          var l = arr.length - 1;

          if (i === l || l === 0) {
            return d; // last one, or only one
          }

          return d + ';';
        };

        data.authorFormatted = _.map(shownAuthors, format);
        data.allAuthorFormatted = _.map(data.author, format);
      }

      data.formattedDate = data.formattedDate || (data.pubdate ? this.formatDate(data.pubdate) : undefined);
      data.shortAbstract = data.abstract ? this.shortenAbstract(data.abstract) : undefined;
      data.details = data.details || {
        shortAbstract: data.shortAbstract,
        pub: data.pub,
        abstract: data.abstract
      };
      data.num_citations = data['[citations]'] ? data['[citations]'].num_citations : undefined;
      data.identifier = data.bibcode ? data.bibcode : data.identifier; // make sure undefined doesn't become "undefined"

      data.encodedIdentifier = _.isUndefined(data.identifier) ? data.identifier : encodeURIComponent(data.identifier);

      if (data.pubdate || data.shortAbstract) {
        data.popover = true;
      }

      if (this.model) data.orderNum = this.model.get('resultsIndex') + 1;
      return data;
    }
  };
  return Utils;
});

/**
 * manages the state of the side bars
 */
define('js/mixins/side_bar_manager',['backbone', 'js/components/api_feedback'], function (Backbone, ApiFeedback) {
  var state = new (Backbone.Model.extend({
    defaults: {
      recent: true,
      show: true
    }
  }))();
  var SideBarManager = {
    /**
     * Try to get the current sidebar state from user data
     * This will be the value coming from user settings
     */
    _getUpdateFromUserData: function _getUpdateFromUserData() {
      try {
        var ud = this.getBeeHive().getObject('User').getUserData();
        if (!ud) return false;
        return /show/i.test(ud.defaultHideSidebars);
      } catch (e) {
        return false;
      }
    },

    /**
     * Initialize the manager
     * this will start subscriptions and do an initial check on user data
     */
    init: function init() {
      this.setSidebarState(this._getUpdateFromUserData());

      _.bindAll(this, ['_onFeedback', '_onUserAnnouncement', '_updateSidebarState']);

      var ps = this.getPubSub();
      if (!ps) return;
      ps.subscribe(ps.FEEDBACK, this._onFeedback);
      ps.subscribe(ps.USER_ANNOUNCEMENT, this._onUserAnnouncement);
      state.on('change:show', this._updateSidebarState);
    },

    /**
     * Update the sidebar state, this will trigger/broadcast the change
     * and update the view to actually spread the middle panel to full screen
     */
    _updateSidebarState: _.throttle(function () {
      var val = this.getSidebarState();
      var view = this.view;

      if (view && view.showCols) {
        view.showCols({
          left: val,
          right: val
        });
      }

      this.broadcast('page-manager-message', 'side-bars-update', val);
      this.trigger('page-manager-message', 'side-bars-update', val);
    }, 100),

    /**
     * On user announcement (user data change) update the sidebar state
     */
    _onUserAnnouncement: function _onUserAnnouncement(ev, changed) {
      // only update if the changed key was defaultHideSidebars
      if (_.contains('defaultHideSidebars', _.keys(changed))) {
        this.setSidebarState(this._getUpdateFromUserData());
      }
    },

    /**
     * Feedback handler
     * this will update the state when either of the *_SPACE events are called
     * @param {ApiFeedback} feedback
     */
    _onFeedback: function _onFeedback(feedback) {
      switch (feedback.code) {
        case ApiFeedback.CODES.MAKE_SPACE:
          return this.onMakeSpace();

        case ApiFeedback.CODES.UNMAKE_SPACE:
          return this.onUnMakeSpace();

        default:
          return null;
      }
    },

    /**
     * Save the current state and
     * set the sidebar state to `false`
     */
    onMakeSpace: function onMakeSpace() {
      if (!state.has('recent')) {
        state.set('recent', this.getSidebarState());
      }

      this.setSidebarState(false);
    },

    /**
     * if the saved state is set, then update the side bar to that value
     * and unset the saved state.
     *
     * only "unmake space" if "make space" was called previously
     */
    onUnMakeSpace: function onUnMakeSpace() {
      if (state.has('recent')) {
        this.setSidebarState(state.get('recent'));
        state.unset('recent');
      }
    },

    /**
     * Toggle the current state
     */
    toggleSidebarState: function toggleSidebarState() {
      this.setSidebarState(!this.getSidebarState());
    },

    /**
     * Set the sidebar state to a new value
     * this will trigger an update even if the value doesn't change
     * @param {Boolean} value - the new state value
     */
    setSidebarState: function setSidebarState(value) {
      state.set('show', value);
      state.trigger('change:show');
    },

    /**
     * get the current sidebar state
     * @returns {Boolean} - the current state
     */
    getSidebarState: function getSidebarState() {
      return state.get('show');
    }
  };
  return SideBarManager;
});

define('js/mixins/user_change_rows',['marionette', 'js/components/api_targets'], function (Marionette, ApiTargets) {
  /*
   * use this model as a base for any widget that needs to request
   * varying numbers of records from solr and visualize/export/etc them
   * in some way.
   *
   * Currently used by metrics and visualization widgets (not export for now)
   * they set the relevant solr vals into the model in the
   * processResponse function
   * */
  var mixin = {};
  mixin.Model = Backbone.Model.extend({
    initialize: function initialize(options) {
      this.on('change:numFound', this.updateMax);
      this.on('change:rows', this.updateCurrent);

      if (!options.widgetName) {
        throw new Error('need to configure with widget name so we can get limit/default info from api_targets._limits');
      }

      var defaults = {
        // returned by solr query: rows requested
        rows: undefined,
        // returned by solr query: total available
        numFound: undefined,
        // the smaller of either rows or numFound
        current: undefined,
        // the smaller of either numFound or maxAllowed
        max: undefined,
        // records that user has requested
        userVal: undefined
      };

      _.extend(defaults, ApiTargets._limits[options.widgetName]);

      this.defaults = function () {
        return defaults;
      };

      this.set(this.defaults());
    },
    updateMax: function updateMax() {
      var m = _.min([this.get('limit'), this.get('numFound')]);

      this.set('max', m);
    },
    updateCurrent: function updateCurrent() {
      this.set('current', _.min([this.get('rows'), this.get('numFound')]));
    }
  });
  return mixin;
});

define('js/mixins/widget_utility',[], function () {
  var Utils = {}; // Helper method to extend an already existing method

  Utils.extendMethod = function (to, from, methodName) {
    // if the method is defined on from ...
    if (!_.isUndefined(from[methodName])) {
      var old = to[methodName]; // ... we create a new function on to

      to[methodName] = function () {
        // wherein we first call the method which exists on `to`
        var oldReturn = old.apply(this, arguments); // and then call the method on `from`

        from[methodName].apply(this, arguments); // and then return the expected result,
        // i.e. what the method on `to` returns

        return oldReturn;
      };
    }
  };

  return Utils;
});

define('js/mixins/widget_mixin_method',['js/mixins/widget_utility'], function (Utils) {
  var mixin = function mixin(from, methods) {
    var to = this.prototype; // we add those methods which exists on `from` but not on `to` to the latter

    _.extend(from, to); // … and we do the same for events


    _.extend(from.events, to.events);

    _.each(Array.prototype.slice.call(arguments, 1), function (m) {
      Utils.extendMethod(to, from, m);
    });
  };

  return mixin;
});

/**
 * This mixins adds predefined pagination interaction to the 'View'
 *
 *
 */
define('js/mixins/widget_pagination',['underscore'], function (_) {
  var PaginatorInteraction = {
    /**
     * This method will automatically paginate through results, provided
     * your view contains the right methods and the paginator instance
     * is available
     *
     *
     * @param displayNum
     *    - int, how many items to load during this step
     * @param maxDisplayNum
     *    - int, maximum number of items that are allowed to be displayed;
     *      we'll ignore all further requests once this number is reached
     * @param numOfLoadedButHiddenItems
     *    - int, number of items that were loaded and rendered by the
     *      view, but are not yet shown to the user; the view should
     *      provide this information because we don't know how to
     *      extract it
     * @param paginator
     *    - properly initialized instance of 'Paginator'
     * @param view
     *    - must contain methods:
     *        disableShowMore([msg])
     *        displayMore(num)
     *
     * @param collection
     *
     *
     * @return either null or an object with following semantics
     *      before: a function that you should execute before dispatching
     *              the query
     */
    handlePagination: function handlePagination(displayNum, maxDisplayNum, numOfLoadedButHiddenItems, paginator, view, collection) {
      var _adjustMaxDisplay = function _adjustMaxDisplay(currentLen, toDisplay) {
        var allowedMax = maxDisplayNum - currentLen;

        if (allowedMax < toDisplay) {
          return allowedMax;
        }

        return toDisplay;
      }; // basic sanity validation


      if (!(_.isNumber(displayNum) && displayNum > 0 && _.isNumber(maxDisplayNum) && maxDisplayNum > 0 && _.isNumber(numOfLoadedButHiddenItems) && numOfLoadedButHiddenItems >= 0)) {
        throw new Error('Wrong arguments');
      }

      if (!(paginator && paginator.hasMore && view && view.displayMore && view.disableShowMore)) {
        throw new Error('Your paginator (hasMore) and/or view are missing important methods (displayMore/disableShowMore)');
      }

      if (!(collection && collection.models)) {
        throw new Error('You collection is weird');
      }

      if (paginator.hasMore()) {
        // sanity check - there is a maximum that we'll allow to display
        // even if we may load slightly more
        var realDisplayLength = collection.models.length - numOfLoadedButHiddenItems;

        if (realDisplayLength >= maxDisplayNum) {
          view.disableShowMore('Reached max ' + this.maxDisplayNum);
          return;
        }

        if (numOfLoadedButHiddenItems > 0) {
          // we have some docs (hidden)
          var toDisplay = displayNum;

          if (numOfLoadedButHiddenItems > displayNum) {
            // if it is more then necessary, we just display them
            view.displayMore(_adjustMaxDisplay(realDisplayLength, toDisplay));
            return;
          }

          var cachedDisplay = _adjustMaxDisplay(realDisplayLength, numOfLoadedButHiddenItems);

          view.displayMore(cachedDisplay); // display one part from the hidden items

          realDisplayLength += cachedDisplay;
          toDisplay = _adjustMaxDisplay(realDisplayLength, toDisplay - cachedDisplay);
        }

        var output = {
          runQuery: false
        }; // console.log('toDisplay', toDisplay);

        if (toDisplay > 0) {
          output.before = function () {
            // we'll wait 50 mills after the first item was added to the collection
            // and then show the remaining items
            view.once('add:child', function () {
              var self = this;
              setTimeout(function () {
                // console.log('DisplayMore', toDisplay);
                self.displayMore(toDisplay);
              }, 50);
            }, view);
          };
        }

        if (toDisplay + realDisplayLength >= maxDisplayNum) {
          view.disableShowMore('Reached max ' + maxDisplayNum);
        } else {
          output.runQuery = true;
        }

        return output;
      }

      view.displayMore(numOfLoadedButHiddenItems);
      view.disableShowMore();
    }
  };
  return PaginatorInteraction;
});

define('js/widgets/widget_states',[], function () {
  var States = {
    READY: 0,
    LOADING: 1,
    IDLE: 2,
    FAILED: 3
  };
  return States;
});


/* START_TEMPLATE */
define('hbs!js/widgets/base/templates/loading-template',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"s-loading\" aria-label=\"loading indicator\">\n\n</div>\n";
},"useData":true});
Handlebars.registerPartial('js/widgets/base/templates/loading-template', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
define('hbs!js/widgets/base/templates/loading-template-small',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"s-loading s-small\" aria-label=\"loading indicator\">\n\n</div>\n";
},"useData":true});
Handlebars.registerPartial('js/widgets/base/templates/loading-template-small', t);
return t;
});
/* END_TEMPLATE */
;
/**
 * This mixins adds predefined changeState interaction to the 'Widget'
 * (i.e. to the controller - this should not be used for views; see
 * 'view_states')
 *
 */
define('js/mixins/widget_state_handling',['underscore', 'jquery', 'js/widgets/widget_states', 'hbs!js/widgets/base/templates/loading-template', 'hbs!js/widgets/base/templates/loading-template-small'], function (_, $, WidgetStates, LoadingTemplate, LoadingTemplateSmall) {
  /**
   * This function tries hard to grab the topmost container (view)
   * of the widget (just using some probable locations)
   *
   * @param widget
   * @returns {*}
   */
  var getView = function getView(widget) {
    if (widget.view && widget.view.itemContainerView) return widget.view.itemContainerView;
    if (_.isFunction(widget.getView)) return widget.getView();
    if (widget.view) return widget.view;
  };

  var handlers = {};
  /**
   * By default, this widget will indicate error by changing its
   * color
   *
   * @param state
   */

  handlers[WidgetStates.ERRORED] = {
    set: function set(state) {
      var view = getView(this);

      if (view && view.$el) {
        view.$el.addClass('s-error'); // TODO: eventually, add an error msg
      }
    },
    revert: function revert() {
      var view = getView(this);

      if (view && view.$el) {
        view.$el.removeClass('s-error');
      }
    }
  };
  handlers[WidgetStates.IDLE] = {
    set: function set(state) {
      this._getStateHandler({
        state: WidgetStates.WAITING
      }).revert.apply(this, state);
    },
    revert: function revert() {// pass
    }
  };
  var Mixin = {
    widgetStateHandlers: handlers,

    /**
     * This is the entry point for controllers to provide
     * feedback to the user
     */
    changeState: function changeState(newState) {
      this._states = this._states || [];

      if (newState.state == WidgetStates.RESET) {
        if (this._states.length > 0) {
          var self = this;

          for (var i = this._states.length - 1; i >= 0; i--) {
            var state = this._states[i];

            this._getStateHandler(state).revert.call(this, state);
          }
        }

        this._states = [];
        return;
      }

      var stateHandler = this._getStateHandler(newState);

      if (!stateHandler) {
        throw new Error('This is unknown/unhandled widget state: ', newState);
      }

      stateHandler.set.call(this, newState);

      this._saveNewState(newState);
    },
    _getStateHandler: function _getStateHandler(newState) {
      return this.widgetStateHandlers[newState.state];
    },

    /**
     * I'm being careful not to hold to references, only simple flat object
     * made of primitives will be stored
     *
     * @param newState
     */
    _saveNewState: function _saveNewState(newState) {
      var s = _.object(_.filter(_.pairs(newState), function (p) {
        return !_.isObject(p[1]) && !_.isArray(p[1]);
      }));

      this._states.push(s);
    }
  };
  return Mixin;
});

define('js/mixins/widget_state_manager',['underscore', 'js/components/api_feedback'], function (_, ApiFeedback) {
  /**
   * Abstract error pubsub-like manager.  Allows for hooks to be applied that
   * match API feedback codes
   *
   * @constructor
   */
  var ErrorHandlerManager = function ErrorHandlerManager() {
    this.handlers = {};
    /**
     * Attach a new handler to an API feedback code
     *
     * @param {Number} code - feedback code
     * @param {function} cb - callback function
     */

    this.on = function (code, cb) {
      this.handlers[code].push(cb);
    };
    /**
     * Remove handler by passing in the callback function
     *
     * @param {function} cb - callback function
     */


    this.off = function (cb) {
      _.forEach(this.handlers, function (v, k) {
        var idx = v.indexOf(cb);

        if (idx > -1) {
          v.splice(idx, 1);
        }
      });
    };
    /**
     * Fire off the callbacks for a particular code
     *
     * @param {Number} code - feedback code
     * @param {Array} args - arguments to pass to the callback
     * @param {object} ctx - callback's `this` property
     */


    this.fire = function (code, args, ctx) {
      _.forEach(this.handlers[code], function (cb) {
        cb.apply(ctx, args);
      });
    };

    _.reduce(ApiFeedback.CODES, function (res, code) {
      res[code] = [];
      return res;
    }, this.handlers);
  };
  /*
    Widget state manager mixin
     This mixin will allow widgets to call lifecycle updates which can then have
    handlers attached.  The mixin can also serve as a way for page managers to
    react to widget status updates, since certain widgets should be
    handled differently depending on their type and importance.
     The typical way this is used is to call `activateWidget` during the activate
    call on the widget itself.  Then call the various state updates when the widget
    is performing actions.
     The default states are: ready, loading, idle, errored
     Widgets can attach handlers to the various status updates (i.e. onReady, onLoading, etc.)
     note: during the activation, the widget's pubsubkey is captured and is used
    to identify the appropriate feedback.  This way the handlers aren't called for
    events the widget doesn't care about.
   */


  var WidgetStateManagerMixin = {
    STATES: {
      LOADING: 'loading',
      ERRORED: 'errored',
      IDLE: 'idle',
      READY: 'ready'
    },

    /**
     * Creates a new instance of the handlerManager and subscribes to the
     * api feedback calls.  It also sets the first state update.
     */
    activateWidget: function activateWidget() {
      this.__widgetHandlerManager = new ErrorHandlerManager();
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.FEEDBACK, _.bind(this.__handleFeedback, this));
      this.updateState('ready');
    },

    /**
     * Upon new feedback from the API, this function will grab the current
     * pubSubKey Id for this widget and compare it to the one listed on the
     * feedback object.  If they match, then the handlers are fired off for that
     * code.
     *
     * @param {ApiFeedback} feedback
     * @param {PubSubKey} pubSubKey
     * @private
     */
    __handleFeedback: function __handleFeedback(feedback, pubSubKey) {
      var id = this.getPubSub().getCurrentPubSubKey().getId();

      if (id === pubSubKey.getId()) {
        this.__widgetHandlerManager.fire(feedback.code, arguments, this);
      }
    },

    /**
     * Attaches a new handler onto an API code
     *
     * @param {Number} code - feedback code
     * @param {function} handler - handler function
     */
    attachHandler: function attachHandler(code, handler) {
      try {
        this.__widgetHandlerManager.on(code, handler);
      } catch (e) {
        console.error(e);
      }
    },

    /**
     * Attaches a general handler to all api feedback codes
     *
     * Includes the positive error codes and api request failures
     *
     * @param {function} handler - handler function
     */
    attachGeneralHandler: function attachGeneralHandler(handler) {
      _.forEach(ApiFeedback.CODES, _.bind(function (code) {
        if (code > 0 || code === ApiFeedback.CODES.API_REQUEST_ERROR) {
          this.attachHandler(code, handler);
        }
      }, this));
    },

    /**
     * Detaches a particular handler from all codes
     *
     * @param cb
     */
    detachHandler: function detachHandler(cb) {
      this.__widgetHandlerManager.off(cb);
    },

    /**
     * Called when the state changes to 'ready'
     */
    onReady: _.noop,

    /**
     * Called when the state changes to 'loading'
     */
    onLoading: _.noop,

    /**
     * Called when the state changes to 'idle'
     */
    onIdle: _.noop,

    /**
     * Called when the state changes to 'errored'
     */
    onErrored: _.noop,

    /**
     * Called on all state changes
     */
    onStateChange: _.noop,

    /**
     * Called by widgets to update their own state.  This will update the current
     * state and also call any handlers.
     *
     * @param {string} state - the state to update to
     */
    updateState: function updateState(state) {
      if (!state || !_.isString(state) || state === this.__state) {
        // do nothing
        return;
      }

      var prev = this.__state;
      this.__state = state;

      this.__fireStateHandler();

      this.onStateChange.call(this, state, prev);
    },

    /**
     * Get the current state value
     */
    getState: function getState() {
      return this.__state;
    },

    /**
     * This method looks at the current state and if a matching handler is
     * provided, it will call it accordingly.
     *
     * @private
     */
    __fireStateHandler: function __fireStateHandler() {
      var handlers = {};
      handlers.ready = this.onReady;
      handlers.loading = this.onLoading;
      handlers.idle = this.onIdle;
      handlers.errored = this.onErrored;
      handlers[this.__state] && handlers[this.__state].call(this, this);
    }
  };
  return WidgetStateManagerMixin;
});

/*
Example module that simply prints 'hello x'
as a main page
*/
define('js/modules/hello',['underscore', 'jquery'], function (_, $) {
  var showName = function showName(selector, n) {
    console.log(selector);
    console.log(n);

    var temp = _.template('Hello <%= name %>');

    $(selector).html(temp({
      name: n
    }));
  };

  return {
    showName: showName
  };
});

define('js/modules/orcid/work',['underscore', 'jsonpath'], function (_, jp) {
  var ADSPATHS = {
    status: '$.status',
    title: '$.title',
    publicationDateMonth: '$.pubmonth',
    publicationDateYear: '$.pubyear',
    lastModifiedDate: '$.updated',
    sourceName: '$.source',
    putCode: '$.putcode',
    identifier: '$.identifier'
  };
  var ORCIDPATHS = {
    createdDate: '$["created-date"].value',
    lastModifiedDate: '$["last-modified-date"].value',
    sourceOrcidIdUri: '$.source["source-orcid"].uri',
    sourceOrcidIdPath: '$.source["source-orcid"].path',
    sourceOrcidIdHost: '$.source["source-orcid"].host',
    sourceClientIdUri: '$.source["source-client-id"].uri',
    sourceClientIdPath: '$.source["source-client-id"].path',
    sourceClientIdHost: '$.source["source-client-id"].host',
    sourceName: '$.source["source-name"].value',
    putCode: '$["put-code"]',
    path: '$.path',
    title: '$["title"].title.value',
    subtitle: '$["title"].subtitle.value',
    translatedTitle: '$["title"]["translated-title"].value',
    translatedTitleLang: '$["title"]["translated-title"]["language-code"]',
    journalTitle: '$["journal-title"].value',
    shortDescription: '$["short-description"]',
    citationType: '$.citation["citation-type"]',
    citationValue: '$.citation["citation-value"]',
    type: '$.type',
    publicationDateYear: '$["publication-date"].year.value',
    publicationDateMonth: '$["publication-date"].month.value',
    publicationDateDay: '$["publication-date"].day.value',
    publicationDateMedia: '$["publication-date"]["media-type"]',
    url: '$.url.value',
    contributorOrcidUri: '$["contributors"].contributor..["contributor-orcid"].uri',
    contributorOrcidPath: '$["contributors"].contributor..["contributor-orcid"].path',
    contributorOrcidHost: '$["contributors"].contributor..["contributor-orcid"].host',
    contributorName: '$["contributors"].contributor..["credit-name"].value',
    contributorEmail: '$["contributors"].contributor..["contributor-email"].value',
    contributorAttributes: '$["contributors"].contributor..["contributor-attributes"]',
    contributorSequence: '$["contributors"].contributor..["contributor-attributes"]["contributor-sequence"]',
    contributorRole: '$["contributors"].contributor..["contributor-attributes"]["contributor-role"]',
    externalIdValue: '$["external-ids"]["external-id"]..["external-id-value"]',
    externalIdType: '$["external-ids"]["external-id"]..["external-id-type"]',
    externalIdUrl: '$["external-ids"]["external-id"]..["external-id-url"]',
    externalIdRelationship: '$["external-ids"]["external-id"]..["external-id-relationship"]',
    country: '$.country.value',
    visibility: '$.visibility.value',
    identifier: '$.identifier'
  };
  /**
   * Convenience class that allows easy conversion between ADS and ORCiD works.
   * @module Work
   * @param work
   * @param useOrcidPaths
   * @constructor
   */

  var Work = function Work(work, useOrcidPaths) {
    work = work || {};
    this.useOrcidPaths = useOrcidPaths; // find the inner summary as the root

    this._root = work;
    this.sources = [];
    /**
     * get the sources array
     * if the array is empty, it returns an array containing the single source name
     *
     * @returns {Array} - the sources
     */

    this.getSources = function () {
      if (_.isEmpty(this.sources)) {
        return [this.getSourceName()];
      }

      return this.sources;
    };
    /**
     * Set the sources array
     *
     * @param {Array} sources
     * @returns {Array} - the sources
     */


    this.setSources = function (sources) {
      if (_.isArray(sources)) {
        this.sources = sources;
      }

      return this.sources;
    };
    /**
     * Get the value at path
     *
     * @param {string} path - path on _root element to find
     * @returns {*} - value found at path
     */


    this.get = function (path) {
      var val = jp.query(this._root, path);

      if (_.isEmpty(val)) {
        return null;
      }

      if (_.isArray(val) && val.length <= 1) {
        return val[0];
      }

      return val;
    };
    /**
     * Returns the generated ORCiD work from the current _root object.
     * The object will be based on the paths in ADSPATHS
     *
     * @returns {*} - ORCiD formatted object
     */


    this.getAsOrcid = function () {
      return _.reduce(ORCIDPATHS, _.bind(function (res, p) {
        var val = this.get(p);

        if (val) {
          if (_.isArray(val)) {
            _.forEach(val, function (v, i) {
              jp.value(res, p.replace('..', '[' + i + ']'), v);
            });
          } else {
            jp.value(res, p, val);
          }
        }

        return res;
      }, this), {});
    };
    /**
     * Creates an ADS formatted object
     *
     * @returns {*} - ADS formatted object
     */


    this.toADSFormat = function () {
      var ids;

      if (this.useOrcidPaths) {
        ids = this.getExternalIds();

        if (ids.doi) {
          ids.doi = [ids.doi];
        }

        ids.identifier = _.values(ids)[0];
      }

      return _.extend({}, {
        title: [this.getTitle()],
        formattedDate: this.getFormattedPubDate(),
        source_name: this.getSources().join('; '),
        identifier: this.getIdentifier(),
        _work: this
      }, ids);
    };
    /**
     * Creates an object containing all external ids
     * @example
     * { bibcode: ["2018CNSNS..56..270Q"], doi: [...] }
     *
     * @returns {Object} - object containing external ids
     */


    this.getExternalIds = function () {
      var types = this.getExternalIdType();
      var values = this.getExternalIdValue();
      types = _.isArray(types) ? types : [types];
      values = _.isArray(values) ? values : [values];

      if (types.length !== values.length) {
        return {};
      }

      return _.reduce(types, function (res, t, i) {
        res[t] = values[i];
        return res;
      }, {});
    };
    /**
     * Format publication date
     *
     * @returns {string} - formatted pub date
     */


    this.getFormattedPubDate = function () {
      var year = this.getPublicationDateYear() || '????';
      var month = this.getPublicationDateMonth() || '??';
      return year + '/' + month;
    }; // get correct set of paths based on options


    var paths = this.useOrcidPaths ? ORCIDPATHS : ADSPATHS; // create getters for each of the PATHS

    _.reduce(paths, function (obj, p, k) {
      if (_.isString(k) && k.slice) {
        var prop = k[0].toUpperCase() + k.slice(1);
        obj['get' + prop] = _.partial(obj.get, p);
      }

      return obj;
    }, this);
  };
  /**
   * Creates an ORCiD Work from an ADS record.
   *
   * @static
   * @param {Object} adsWork - the ads record
   * @param {Number} [putCode] putCode - putcode to apply to work
   * @returns {Object} - the ORCiD work
   */


  Work.adsToOrcid = function (adsWork, putCode) {
    var ads = {
      pubdate: '$.pubdate',
      abstract: '$.abstract',
      bibcode: '$.bibcode',
      pub: '$.pub',
      doi: '$.doi[0]',
      author: '$.author[*]',
      title: '$.title[0]',
      type: '$.doctype',
      all_ids: '$.all_ids'
    };

    var put = function put(obj, p, val) {
      if (val) {
        if (_.isArray(val)) {
          _.forEach(val, function (v, i) {
            jp.value(obj, p.replace('..', '[' + i + ']'), v);
          });
        } else {
          jp.value(obj, p, val);
        }
      }

      return obj;
    };

    var get = function get(path) {
      var val = jp.query(adsWork, path);

      if (_.isEmpty(val)) {
        return null;
      }

      if (_.isArray(val) && val.length <= 1) {
        return val[0] || '';
      }

      return val || '';
    };

    var work = {};

    var worktype = function worktype(adsType) {
      var oType = {
        article: 'JOURNAL_ARTICLE',
        inproceedings: 'CONFERENCE_PAPER',
        abstract: 'CONFERENCE_ABSTRACT',
        eprint: 'WORKING_PAPER',
        phdthesis: 'DISSERTATION',
        techreport: 'RESEARCH_TECHNIQUE',
        inbook: 'BOOK_CHAPTER',
        circular: 'RESEARCH_TOOL',
        misc: 'OTHER',
        book: 'BOOK',
        proceedings: 'BOOK',
        bookreview: 'BOOK_REVIEW',
        erratum: 'JOURNAL_ARTICLE',
        proposal: 'OTHER',
        newsletter: 'NEWSLETTER_ARTICLE',
        catalog: 'DATA_SET',
        intechreport: 'RESEARCH_TECHNIQUE',
        mastersthesis: 'DISSERTATION',
        obituary: 'OTHER',
        pressrelease: 'OTHER',
        software: 'RESEARCH_TECHNIQUE',
        talk: 'LECTURE_SPEECH'
      };
      return oType[adsType] || 'JOURNAL_ARTICLE';
    };

    try {
      var exIds = {
        types: [],
        values: [],
        relationships: []
      }; // handle doi or bibcode not existing

      var bib = get(ads.bibcode);
      var doi = get(ads.doi);

      if (bib) {
        exIds.types.push('bibcode');
        exIds.values.push(bib);
        exIds.relationships.push('SELF');
      }

      if (doi) {
        exIds.types.push('doi');
        exIds.values.push(doi);
        exIds.relationships.push('SELF');
      }

      var all_ids = get(ads.all_ids);
      var arxiv = false;

      if (_.isArray(all_ids)) {
        arxiv = all_ids.find(function (element) {
          return element.toLowerCase().startsWith('arxiv');
        });
      }

      if (arxiv) {
        arxiv = arxiv.substr(6);
        exIds.types.push('arxiv');
        exIds.values.push(arxiv);
        exIds.relationships.push('SELF');
      }

      put(work, ORCIDPATHS.publicationDateYear, get(ads.pubdate).split('-')[0]);

      if (get(ads.pubdate).split('-')[1] === '00') {
        put(work, ORCIDPATHS.publicationDateMonth, null);
      } else {
        put(work, ORCIDPATHS.publicationDateMonth, get(ads.pubdate).split('-')[1]);
      }

      put(work, ORCIDPATHS.shortDescription, get(ads.abstract).slice(0, 4997) + '...');
      put(work, ORCIDPATHS.externalIdType, exIds.types);
      put(work, ORCIDPATHS.externalIdValue, exIds.values);
      put(work, ORCIDPATHS.externalIdRelationship, exIds.relationships);
      put(work, ORCIDPATHS.journalTitle, get(ads.pub));
      put(work, ORCIDPATHS.type, worktype(get(ads.type)));
      var author = get(ads.author);
      author = _.isArray(author) ? author : [author];
      put(work, ORCIDPATHS.contributorName, author);

      var roles = _.map(author, function () {
        return 'AUTHOR';
      });

      put(work, ORCIDPATHS.contributorRole, roles);
      put(work, ORCIDPATHS.title, get(ads.title));

      if (putCode) {
        put(work, ORCIDPATHS.putCode, putCode);
      }
    } catch (e) {
      return null;
    }

    return work;
  };

  return Work;
});

define('js/modules/orcid/bio',['underscore', 'jsonpath', 'js/modules/orcid/work'], function (_, jp, Work) {
  var PATHS = {
    firstName: '$.name["given-names"].value',
    lastName: '$.name["family-name"].value',
    orcid: '$.name.path'
  };

  var Bio = function Bio(bio) {
    this._root = bio || {};

    this.get = function (path) {
      var val = jp.query(this._root, path);
      return val[0];
    };

    this.toADSFormat = function () {
      return {
        responseHeader: {
          params: {
            orcid: this.getOrcid(),
            firstName: this.getFirstName(),
            lastName: this.getLastName()
          }
        }
      };
    }; // generate getters for each path on PATHS


    _.reduce(PATHS, function (obj, p, k) {
      if (_.isString(k) && k.slice) {
        var prop = k[0].toUpperCase() + k.slice(1);
        obj['get' + prop] = _.partial(obj.get, p);
      }

      return obj;
    }, this);
  };

  return Bio;
});

/**
 * Extension for a controller; it adds a functionality that allows a widget
 * to handle ORCID actions.
 *
 * It is installed as return OrcidExtension(WidgetClass)
 */
define('js/modules/orcid/extension',['underscore', 'js/components/api_query', 'js/components/api_request', 'js/components/api_query_updater', 'js/components/api_targets', 'js/modules/orcid/work', 'js/components/api_feedback', 'js/mixins/dependon'], function (_, ApiQuery, ApiRequest, ApiQueryUpdater, ApiTargets, Work, ApiFeedback) {
  return function (WidgetClass) {
    var queryUpdater = new ApiQueryUpdater('OrcidExtension');
    var processDocs = WidgetClass.prototype.processDocs;
    var activate = WidgetClass.prototype.activate;
    var onAllInternalEvents = WidgetClass.prototype.onAllInternalEvents;

    WidgetClass.prototype.activate = function (beehive) {
      this.setBeeHive(beehive);
      activate.apply(this, arguments);
      var pubsub = beehive.hasService('PubSub') && beehive.getService('PubSub');
      pubsub.subscribe(pubsub.CUSTOM_EVENT, _.bind(this.onCustomEvent));
    };

    WidgetClass.prototype.onCustomEvent = function (event, bibcodes) {
      /**
       * Find the models for each of the bibcodes
       * Filter out ones that can't perform the action
       * Trigger the action on each of the views
       */
      var orcidAction = _.bind(function (action, bibcodes) {
        var models = _.filter(this.collection.models, function (m) {
          return _.contains(bibcodes, m.get('bibcode'));
        }); // go through each model and grab the view for triggering


        _.forEach(models, _.bind(function (m) {
          // only continue if the model has the action available
          var actions = _.map(m.get('orcid').actions, 'action');

          if (_.contains(actions, action)) {
            var view = this.view.children.findByModel(m);

            if (view) {
              view.trigger('OrcidAction', {
                action: action,
                view: view,
                model: m
              });
            }
          }
        }, this));
      }, this);

      switch (event) {
        case 'orcid-bulk-claim':
          orcidAction('orcid-add', bibcodes);
          break;

        case 'orcid-bulk-update':
          orcidAction('orcid-update', bibcodes);
          break;

        case 'orcid-bulk-delete':
          orcidAction('orcid-delete', bibcodes);
          break;

        default:
      }
    };
    /**
     * Apply messages or other information to the orcid control under
     * each record.  This will return a set of actions based on the
     * metadata passed in.
     *
     * @example
     * { isSourcedByADS: true, isCreatedByOthers: false, isCreatedByADS: true }
     *
     * //returns:
     * { actions: { update: {...}, delete: {...}, view: {...} }, provenance: 'ads' }
     *
     * @returns {object} - orcid action options
     */


    WidgetClass.prototype._getOrcidInfo = _.memoize(function (recInfo) {
      var msg = {
        actions: {},
        provenance: null
      };

      if (recInfo.isCreatedByOthers && recInfo.isCreatedByADS) {
        msg.actions.update = {
          title: 'update in ORCID',
          caption: 'Update ADS version with latest data',
          action: 'orcid-update'
        };
        msg.actions.delete = {
          title: 'delete from ORCID',
          caption: 'Delete ADS version from ORCID',
          action: 'orcid-delete'
        };
        msg.actions.view = {
          title: 'view in ORCID',
          caption: "Another version exists (we don't have rights to update it)",
          action: 'orcid-view'
        };
      } else if (recInfo.isCreatedByOthers && !recInfo.isCreatedByADS) {
        if (recInfo.isKnownToADS) {
          msg.actions.add = {
            title: 'add ADS version ORCID',
            caption: "ORCID already has a record for this article (we don't have rights to update it).",
            action: 'orcid-add'
          };
        }

        msg.actions.view = {
          title: 'view in ORCID',
          caption: "Another version exists (we don't have rights to update it)",
          action: 'orcid-view'
        };
      } else if (!recInfo.isCreatedByOthers && recInfo.isCreatedByADS) {
        msg.actions.update = {
          title: 'update in ORCID',
          caption: 'Update ADS version with latest data',
          action: 'orcid-update'
        };
        msg.actions.delete = {
          title: 'delete from ORCID',
          caption: 'Delete ADS version from ORCID',
          action: 'orcid-delete'
        };
      } else {
        msg.actions.add = {
          title: 'add to ORCID',
          caption: 'Add ADS version to ORCID',
          action: 'orcid-add'
        };
      }

      if (recInfo.isCreatedByADS && recInfo.isCreatedByOthers) {
        msg.provenance = 'ads'; // duplicate, but just to be explicit
      } else if (recInfo.isCreatedByADS) {
        msg.provenance = 'ads';
      } else if (recInfo.isCreatedByOthers) {
        msg.provenance = 'others';
      } else {
        msg.provenance = null;
      }

      return msg;
    }, function (ret) {
      return [ret.isCreatedByADS, ret.isCreatedByOthers, ret.isKnownToADS, ret.provenance];
    });
    /**
     * Set the pending state on a set of docs
     * @param {array} docs the docs the update
     * @param {boolean} pending the new pending state
     */

    WidgetClass.prototype._setDocsToPending = function (docs, pending) {
      _.forEach(docs, function (d) {
        var p = _.isBoolean(pending) ? pending : true;
        d.orcid = _.extend({}, d.orcid, {
          pending: p
        });
      });
    };
    /**
     * Takes in a set of documents, should be a result of a search or orcid
     * record page.  In either case, it will match the models by bibcode and
     * update their orcid metadata
     *
     * @param {object[]} docs - the docs to update
     * @returns {object[]} - the updated docs
     */


    WidgetClass.prototype.addOrcidInfo = function (docs) {
      var self = this;
      var failRetry = false;
      var getDocInfo = _.noop; // add orcid info to the documents

      var orcidApi = this.getBeeHive().getService('OrcidApi');

      if (!orcidApi || !orcidApi.hasAccess()) {
        return docs;
      } // find all pending models, and update them with an error state


      var setPendingToError = _.debounce(function () {
        // go through the current models, and if something is pending
        // make it show an error
        _.forEach(self.hiddenCollection.models, function (m) {
          var orcid = m.get('orcid');

          if (orcid.pending) {
            orcid = _.extend({}, orcid, {
              pending: false,
              error: 'Error while applying Orcid Data'
            });
            m.set('orcid', orcid);
          }
        });
      }, 100); // find all pending models, and update them to a default state


      var setPendingToDefaultActions = _.debounce(function () {
        var defaultActions = self._getOrcidInfo({}); // go through the current models, and if something is pending
        // make it show an error


        _.forEach(self.hiddenCollection.models, function (m) {
          if (m.get('orcid') && m.get('orcid').pending) {
            m.set('orcid', defaultActions);
          }
        });
      }, 100); // attempt to find the model to update and update it's orcid actions


      var onSuccess = function onSuccess(documents, count) {
        _.forEach(_.rest(arguments), function (info, i) {
          // since the order is maintain from the promises we can grab by index
          var work = documents[i]; // get the new set of actions

          var actions = self._getOrcidInfo(info); // if the record was created by ADS, we can update it now


          if (info.sourcedByADS && _.isUndefined(work.source_name)) {
            work.source_name = 'NASA Astrophysics Data System';
          }

          work.orcid = _.extend({}, work.orcid, actions, {
            pending: false
          }); // make sure the doc has any information we gained

          if (_.isUndefined(work.identifier)) {
            work.identifier = work._work.getIdentifier();
          }

          var model = _.find(self.hiddenCollection.models, function (m) {
            // do our best to find the match
            return _.isPlainObject(work._work) && work._work === m.get('_work') || !_.isUndefined(work.identifier) && work.identifier === m.get('identifier');
          }); // found the model, update it


          if (model) {
            var sources; // grab the array of sources, if it exists

            if (_.isPlainObject(work._work)) {
              sources = work._work.getSources();
            }

            if (_.isUndefined(model.get('identifier')) && self.orcidWidget) {
              model.set('identifier', work.identifier);
            }

            model.set({
              orcid: actions,
              source_name: _.isArray(sources) ? sources.join('; ') : model.get('source_name')
            });
          } else if (count < 60) {
            _.delay(_.bind(onSuccess, self, [work], count + 1), 500);
          } // if entry has children, remove them


          if (_.isArray(info.children)) {
            _.forEach(info.children, function (putcode) {
              var model = _.find(self.hiddenCollection.models, function (m) {
                return _.isString(putcode) && putcode === m.get('_work').getPutCode();
              });

              if (model) {
                self.removeModel(model);
              } else {// do nothing
              }
            });
          }
        });
      }; // retry once, then just set everything still pending to errored


      var onFail = function onFail(documents) {
        if (!failRetry) {
          failRetry = true;
          return getDocInfo(documents);
        } // set everything pending to be an error


        return _.defer(setPendingToError);
      }; // set all docs to pending and start the async doc info requests


      getDocInfo = function getDocInfo(documents) {
        var promises = _.map(documents, function (d) {
          return orcidApi.getRecordInfo(d).done(function (info) {
            // if the record was created by ADS, we can update it now
            if (info.sourcedByADS && _.isUndefined(d.source_name)) {
              d.source_name = 'NASA Astrophysics Data System';
            } // no matter what, update the docs asap


            d.orcid = _.extend({}, d.orcid, self._getOrcidInfo(info), {
              pending: false
            });
          });
        }); // start the docs to pending


        self._setDocsToPending(documents); // wait for all the promises to resolve


        $.when.apply($, promises).then(_.partial(onSuccess, documents), _.partial(onFail, documents));
      };

      getDocInfo(docs);
      return docs;
    };
    /**
     * Sync up the collection with orid information currently on the
     * hidden collection
     */


    WidgetClass.prototype._paginationUpdate = function () {
      var self = this;

      _.forEach(this.hiddenCollection.models, function (hiddenModel) {
        var match = _.find(self.collection.models, function (model) {
          return model.get('_work') === hiddenModel.get('_work');
        });

        if (match && match.get('orcid').pending) {
          match.set('orcid', hiddenModel.get('orcid'));
        }
      });
    };
    /**
     * update the models with orcid information
     * @param {number=} tries - number of current retries
     */


    WidgetClass.prototype._updateModelsWithOrcid = function (models, tries) {
      var modelsToUpdate = _.filter(models || this.hiddenCollection.models, function (m) {
        return !m.has('_work') && m.has('identifier');
      });

      if (_.isEmpty(modelsToUpdate)) {
        if (tries < 60) {
          _.delay(_.bind(self._updateModelsWithOrcid, self, null, tries + 1), 500);
        }

        return;
      } // this creates a connection between model->orcid, and updates source name


      var oApi = this.getBeeHive().getService('OrcidApi');
      oApi.getUserProfile().done(function (profile) {
        var works = profile.getWorks();

        _.forEach(modelsToUpdate, function (m) {
          var exIds = _.flatten(_.values(_.pick(m.attributes, ['identifier'])));

          _.forEach(works, function (w) {
            var wIds = _.flatten(_.values(w.getIdentifier()));

            var idMatch = _.intersection(exIds, wIds).length > 0;

            if (idMatch) {
              m.set({
                source_name: w.getSources().join('; '),
                _work: w
              });
            } else if (tries < 60) {
              _.delay(_.bind(self._updateModelsWithOrcid, self, [m], tries + 1), 500);
            }
          });
        });
      });
    };
    /**
     * if orcidMode is on, update the set of new docs with orcid information
     * @param {ApiResponse} apiResponse - the response from the api
     * @param {array} docs - set of docs to be processed
     * @param {object} pagination - pagination data (i.e. start, page, etc)
     */


    WidgetClass.prototype.processDocs = function (apiResponse, docs, pagination) {
      docs = processDocs.apply(this, arguments);
      var user = this.getBeeHive().getObject('User'); // for results list only show if orcidModeOn, for orcid big widget show always

      if (user && user.isOrcidModeOn() || this.orcidWidget) {
        var params = apiResponse.get('responseHeader.params');
        var docsSoFar = parseInt(params.start) + parseInt(params.rows);
        var result = this.addOrcidInfo(docs, docsSoFar);

        if (pagination.numFound !== result.length) {
          _.extend(pagination, this.getPaginationInfo(apiResponse, docs));
        }

        _.delay(_.bind(this._updateModelsWithOrcid, this, 0), 1000);

        return result;
      }

      return docs;
    };
    /**
     * Enhances the model with ADS metadata (iff we are coming from orcid)
     * or with Orcid metadata, iff we are coming from ADS. So, it works
     * both ways and can be used in both the search results views and in
     * the pure orcid listings
     *
     * @param model
     * @returns {*}
     */


    WidgetClass.prototype.mergeADSAndOrcidData = function (model) {
      var self = this;
      var final = $.Deferred();
      var oApi = self.getBeeHive().getService('OrcidApi');
      /**
       * Take the full orcid work (not summary) and extend the current matched
       * model with the data from each source
       *
       * @param {Work} fullOrcidWork
       * @param {object} adsResponse
       */

      var onRecieveFullADSWork = function onRecieveFullADSWork(fullOrcidWork, adsResponse) {
        var adsWork = adsResponse.response && adsResponse.response.docs && adsResponse.response.docs[0]; // work around to make sure updates work properly

        fullOrcidWork = new Work(fullOrcidWork._root, true);
        var parsedOrcidWork = fullOrcidWork.toADSFormat();
        parsedOrcidWork = _.isPlainObject(parsedOrcidWork) ? parsedOrcidWork : {};
        adsWork = _.isPlainObject(adsWork) ? adsWork : {}; // extend the current model with our new information

        model.set(_.extend({}, model.attributes, parsedOrcidWork, adsWork));
        final.resolve(model);
      };
      /**
       * reject on failure
       */


      var onADSFailure = function onADSFailure() {
        final.reject.apply(final, arguments);
      };
      /**
       * reject on failure
       */


      var onOrcidFailure = function onOrcidFailure() {
        final.reject.apply(final, arguments);
      };
      /**
       * After getting back the full orcid work, we
       * create a new query to find an ADS match
       *
       * @param {Work} fullOrcidWork - the full orcid work record
       */


      var onRecieveFullOrcidWork = function onRecieveFullOrcidWork(fullOrcidWork) {
        var identifier = model.get('identifier');
        var q = new ApiQuery({
          q: 'identifier:' + queryUpdater.quoteIfNecessary(identifier),
          fl: 'title,abstract,bibcode,author,pub,pubdate,doi,doctype'
        });
        var req = new ApiRequest({
          query: q,
          target: ApiTargets.SEARCH,
          options: {
            done: _.partial(onRecieveFullADSWork, fullOrcidWork),
            fail: onADSFailure
          }
        });
        var pubSub = self.getPubSub();
        pubSub.publish(pubSub.EXECUTE_REQUEST, req);
      };

      var work = model.get('_work');

      if (work) {
        oApi.getWork(work.getPutCode()).done(onRecieveFullOrcidWork).fail(onOrcidFailure);
      } else {
        this._findWorkByModel(model).done(function (work) {
          oApi.getWork(work.getPutCode()).done(onRecieveFullOrcidWork).fail(onOrcidFailure);
        }).fail(onOrcidFailure);
      }

      return final.promise();
    };
    /**
     * Finds a work by comparing a model to what we retrieve from ORCID,
     * It can also take a profile param that bypasses the call to orcid, if
     * it isn't necessary to get the most up-to-date data.
     *
     * @param {object} [model] model
     * @param {Profile} _profile
     * @private
     */


    WidgetClass.prototype._findWorkByModel = function (model, _profile) {
      var $dd = $.Deferred();
      var oApi = this.getBeeHive().getService('OrcidApi');

      var exId = _.pick(model.attributes, ['identifier']);

      var exIds = _.pick(model.attributes, ['all_ids']);

      var oldOrcid = _.clone(model.get('orcid') || {});

      var profile = null;

      if (_.isUndefined(_profile)) {
        profile = oApi.getUserProfile();
      }

      var success = function success(profile) {
        var works = profile.getWorks();
        var noUpdate = true;
        var putCode = null;

        var matchedWork = _.find(works, function (w) {
          var wIds = w.getIdentifier();
          noUpdate = exId.identifier === wIds;
          putCode = w.getPutCode();
          return _.contains(exIds.all_ids, wIds);
        });

        if (matchedWork) {
          if (!noUpdate) {
            var work = Work.adsToOrcid(model.attributes, putCode);
            oApi.updateWork(work);
          }

          $dd.resolve(matchedWork);
        } else {
          $dd.reject();
          var msg = 'Could not find a matching ORCiD Record';
          console.error.apply(console, [msg].concat(arguments));
          model.set('orcid', _.extend(oldOrcid, {
            pending: false,
            error: msg
          }));
        }
      };

      var fail = function fail() {
        $dd.reject.apply($dd, arguments);
        var msg = 'Error retrieving ORCiD profile';
        console.error.apply(console, [msg].concat(arguments));
        model.set('orcid', _.extend(oldOrcid, {
          pending: false,
          error: msg
        }));
      };

      if (_.isUndefined(_profile)) {
        profile.done(success);
        profile.fail(fail);
      } else {
        success(_profile);
      }

      return $dd.promise();
    };
    /**
     * Remove a particular model from the collection and do some
     * clean up on the view to make sure things show up okay
     *
     * @param {Backbone.Model} model - the model to be removed
     */


    WidgetClass.prototype.removeModel = function (model) {
      var idx = model.resultsIndex;
      this.hiddenCollection.remove(model);
      var models = this.hiddenCollection.models;

      _.forEach(_.rest(models, idx), function (m) {
        m.set('resultsIndex', m.get('resultsIndex') - 1);
        m.set('indexToShow', m.get('indexToShow') - 1);
      });

      var showRange = this.model.get('showRange');

      var range = _.range(showRange[0], showRange[1] + 1);

      var visible = [];

      _.forEach(range, function (i) {
        if (models[i] && models[i].set) {
          models[i].set('visible', true);
          models[i].resultsIndex = i;
          models[i].set('resultsIndex', i);
          models[i].set('indexToShow', i + 1);
          visible.push(models[i]);
        }
      });

      this.hiddenCollection.reset(models);
      this.collection.reset(visible); // reset the total number of papers

      this.model.set('totalPapers', models.length);
    };
    /**
     * Called when any internal event is triggered
     *
     * @param {string} ev - the event
     * @param {object} arg1 - extra event information
     * @param {object} data - event action data
     */


    WidgetClass.prototype.onAllInternalEvents = function (ev, arg1, data) {
      if (ev === 'childview:OrcidAction') {
        var self = this;
        var action = data.action;
        var orcidApi = this.getBeeHive().getService('OrcidApi');

        var oldOrcid = _.clone(data.model.get('orcid') || {});

        var pubsub = this.getPubSub();
        pubsub.publish(pubsub.CUSTOM_EVENT, 'orcid-action', action);
        var handlers = {
          'orcid-add': function orcidAdd(model) {
            model.set('orcid', {
              pending: true
            });

            var onAddComplete = function onAddComplete() {
              self._findWorkByModel(model).done(function (work) {
                // we should be able to assume some record info
                var recInfo = {
                  isCreatedByADS: true,
                  isCreatedByOthers: false,
                  isKnownToADS: true,
                  provenance: 'ads'
                };
                model.set({
                  orcid: self._getOrcidInfo(recInfo),
                  source_name: work.getSources().join('; ')
                });
                self.trigger('orcidAction:' + action, model);
              });
            };

            var doAdd = function doAdd(adsWork) {
              orcidApi.addWork(adsWork).done(onAddComplete).fail(function addFailed(xhr, error, state) {
                // there is a conflicting record, update record
                if (state === 'CONFLICT') {
                  return onAddComplete();
                }

                var msg = 'Failed to add entry, please try again';
                console.error.apply(console, [msg].concat(arguments));
                model.set('orcid', _.extend(oldOrcid, {
                  pending: false,
                  error: msg
                }));
              });
            };

            var newWork = Work.adsToOrcid(model.attributes);

            if (newWork) {
              doAdd(newWork);
            } else {
              var msg = 'There was a problem adding the record, try again';
              console.error.apply(console, [msg].concat(arguments));
              model.set('orcid', _.extend(oldOrcid, {
                pending: false,
                error: msg
              }));
            }
          },
          'orcid-delete': function orcidDelete(model) {
            model.set('orcid', {
              pending: true
            });

            var deleteSuccess = function deleteSuccess() {
              // Remove entry from collection after delete
              if (self.orcidWidget) {
                self.removeModel(model);
              } else {
                // reset orcid actions
                model.set('orcid', self._getOrcidInfo({}));
              }

              self.trigger('orcidAction:' + action, model);
            };

            var performDelete = function performDelete(work) {
              orcidApi.deleteWork(work.getPutCode()).done(deleteSuccess).fail(function deleteFail(xhr, error, state) {
                /*
                record not found, treat like the delete worked
                Subsequent deletes on an already deleted entity can cause
                404s
                */
                if (state === 'NOT FOUND') {
                  return deleteSuccess();
                }

                var msg = 'Error deleting record, please try again';
                console.error.apply(console, [msg].concat(arguments));
                model.set('orcid', _.extend(oldOrcid, {
                  pending: false,
                  error: msg
                }));
              });
            };

            var work = model.get('_work');

            if (work) {
              performDelete(work);
            } else {
              self._findWorkByModel(model).done(performDelete);
            }
          },
          'orcid-update': function orcidUpdate(model) {
            model.set('orcid', {
              pending: true
            });

            var failedUpdating = function failedUpdating() {
              var msg = 'Error updating record, please try again';
              console.error.apply(console, [msg].concat(arguments));
              model.set('orcid', _.extend(oldOrcid, {
                pending: false,
                error: msg
              }));
            };

            self.mergeADSAndOrcidData(model) // done merging, begin update
            .done(function (model) {
              var putCode = model.get('_work').getPutCode();
              var work = Work.adsToOrcid(model.attributes, putCode);

              if (_.isNull(work)) {
                // if something went wrong parsing the work, fail it here
                return failedUpdating(work);
              }

              orcidApi.updateWork(work) // update successful
              .done(function doneUpdating(orcidWork) {
                var work = new Work(orcidWork, true);
                orcidApi.getRecordInfo(work.toADSFormat()) // done getting record info, update model
                .done(function doneGettingRecordInfo(recInfo) {
                  model.set('orcid', self._getOrcidInfo(recInfo));
                  self.trigger('orcidAction:' + action, model);
                });
              }) // update failed, update model accordingly
              .fail(failedUpdating); // update the model with the updated data

              model.set(model.attributes, {
                silent: true
              });
            }) // merging failed, update the model
            .fail(function failedMerging() {
              var msg = 'Failed to merge ORCiD and ADS data';
              console.error.apply(console, [msg].concat(arguments));
              model.set('orcid', _.extend(oldOrcid, {
                pending: false,
                error: msg
              }));
            });
          },
          'orcid-login': function orcidLogin() {
            orcidApi.signIn();
          },
          'orcid-logout': function orcidLogout() {
            orcidApi.signOut();
          },
          'orcid-view': function orcidView(model) {
            // send them to the work on their orcid profile
            var url = model.get('orcidWorkPath');

            if (_.isString(url)) {
              var win = window.open(url, '_blank');
              win.focus();
            }
          }
        };
        handlers[action] && handlers[action](data.model);
      }

      return onAllInternalEvents.apply(this, arguments);
    };

    return WidgetClass;
  };
});

/**
 * This is not currently used; it is essentially the same code (or maybe slightly different)
 * that lives inside item_view - that means that item_view has orcid events and functions
 * hardcoded; maybe in the future we'll want to extract them (in a similar way the
 * orcid/extension provides functionality for the widget controllers)
 *
 */
define('js/modules/orcid/item_view_extension',['backbone', 'underscore'], function (Backbone, _) {
  return {
    showOrcidActions: function showOrcidActions(isWorkInCollection) {
      var $icon = this.$('.mini-orcid-icon');
      $icon.removeClass('green');
      $icon.removeClass('gray');
      var $orcidActions = this.$('.orcid-actions');
      $orcidActions.removeClass('hidden');
      $orcidActions.removeClass('orcid-wait');
      var $update = $orcidActions.find('.orcid-action-update');
      var $insert = $orcidActions.find('.orcid-action-insert');
      var $delete = $orcidActions.find('.orcid-action-delete');
      $update.addClass('hidden');
      $insert.addClass('hidden');
      $delete.addClass('hidden');

      if (isWorkInCollection(this.model.attributes)) {
        if (!(this.model.attributes.isFromAds === true)) {
          $update.removeClass('hidden');
        }

        $delete.removeClass('hidden');
        $icon.addClass('green');
      } else if (this.model.attributes.isFromAds === false) {// the nonAds item from orcid
        // nothing to do
      } else {
        $insert.removeClass('hidden');
        $icon.addClass('gray');
      }
    },
    hideOrcidActions: function hideOrcidActions() {
      var $orcidActions = this.$('.orcid-actions');
      $orcidActions.addClass('hidden');
    },
    orcidAction: function orcidAction(e) {
      var $c = $(e.currentTarget);
      var $orcidActions = this.$('.orcid-actions');
      $orcidActions.addClass('orcid-wait');
      var actionType = '';

      if ($c.hasClass('orcid-action-insert')) {
        actionType = 'insert';
      } else if ($c.hasClass('orcid-action-update')) {
        actionType = 'update';
      } else if ($c.hasClass('orcid-action-delete')) {
        actionType = 'delete';
      }

      var msg = {
        actionType: actionType,
        model: this.model.attributes,
        modelType: 'adsData'
      };
      this.trigger('OrcidAction', msg);
      return false;
    }
  };
});

define('js/modules/orcid/profile',['underscore', 'jsonpath', 'js/modules/orcid/work'], function (_, jp, Work) {
  var PATHS = {
    workSummaries: '$'
  };
  /**
   *
   * @module Profile
   * @param profile
   * @constructor
   */

  var Profile = function Profile(profile) {
    this._root = profile || {};
    this.works = [];
    /**
     * search profile for value at specified path
     *
     * @param {String} path - path to search
     * @returns {*} value found at path
     */

    this.get = function (path) {
      var val = jp.query(this._root, path);

      if (_.isEmpty(val)) {
        return null;
      }

      if (_.isArray(val) && val.length <= 1) {
        return val[0];
      }

      return val;
    };
    /**
     * Gets all the work summaries from the profile
     * Shallow (only grabs the first entry)
     *
     * @returns {Work[]} - the array of Work summaries
     */


    this.getWorks = function () {
      return this.works;
    };
    /**
     * Set the profile works
     *
     * @param {*} works
     */


    this.setWorks = function (works) {
      this.works = works;
      return this;
    };
    /**
     * Convenience method for generating an ADS response object
     * this can then be used to update the pagination of lists of orcid works
     *
     * @returns {{
     *  responseHeader: {
     *    params: {
     *      orcid: String,
     *      firstName: String,
     *      lastName: String
     *    }
     *  },
     *  response: {
     *    numFound: Number,
     *    start: Number,
     *    docs: (Object[])
     *  }
     * }}
     */


    this.toADSFormat = function () {
      var docs = _.sortBy(this.getWorks(), function (w) {
        return w.getTitle();
      });

      docs = _.map(docs, function (d) {
        return d.toADSFormat();
      });
      return {
        responseHeader: {
          params: {}
        },
        response: {
          numFound: docs.length,
          start: 0,
          docs: docs
        }
      };
    }; // generate getters for each path on PATHS


    _.reduce(PATHS, function (obj, p, k) {
      if (_.isString(k) && k.slice) {
        var prop = k[0].toUpperCase() + k.slice(1);
        obj['get' + prop] = _.partial(obj.get, p);
      }

      return obj;
    }, this); // to maintain old behavior, make sure works is filled when the profile is created


    this.works = _.map(this.getWorkSummaries(), function (w) {
      return new Work(w);
    });
  };

  return Profile;
});

/**
 * This is the core of the ORCID implementation
 * Written by (rca) - totally re-implemented the
 * initial implementation.
 *
 * The important details are:
 *
 *  - all communication with ORCID happens in JSON
 *  - there are multiple access points
 *    addWork()
 *    updateWork()
 *    deleteWork()
 *
 *    But in reality, the ORCID API allows the following
 *    operations:
 *
 *      reading (GET)
 *      adding (POST)
 *      updating (PUT)
 *      deleting (DELETE)
 *
 * This module will be contacting a web-service, such
 * a service needs to allows CORS requests (since we
 * run inside a browser)
 *
 * Our implementation of the orcid-proxy can be found
 * at:  http://github.com/adsabs/orcid-service
 *
 * The important configuration details are configured
 * in the ./module.js (the module will actually create
 * OrcidApi and insert it into the beehive)
 *
 *
 * TODO:
 *  - error handling (discover more error situations and
 *    take care of them; such as duplicated put-codes)
 *
 */
define('js/modules/orcid/orcid_api',['underscore', 'bootstrap', 'jquery', 'backbone', 'js/components/generic_module', 'js/mixins/dependon', 'js/components/pubsub_events', 'js/mixins/link_generator_mixin', 'js/components/api_query', 'js/components/api_request', 'js/mixins/hardened', 'js/components/api_targets', 'js/components/api_query_updater', 'js/components/api_feedback', 'js/modules/orcid/work', 'js/modules/orcid/profile', 'js/modules/orcid/bio'], function (_, Bootstrap, $, Backbone, GenericModule, Mixins, PubSubEvents, LinkGeneratorMixin, ApiQuery, ApiRequest, HardenedMixin, ApiTargets, ApiQueryUpdater, ApiFeedback, Work, Profile, Bio) {
  var OrcidApi = GenericModule.extend({
    /**
     * Initialize the service
     */
    initialize: function initialize() {
      this.userData = {};
      this.addCache = [];
      this.deleteCache = [];
      this.getUserProfileCache = [];
      this.authData = null;
      this.addWait = 3000;
      this.deleteWait = 100;
      this.profileWait = 100;
      this.maxAddChunkSize = 100;
      this.maxDeleteChunkSize = 10;
      this.db = {};
      this.clearDBWait = 30000;
      this.dbUpdatePromise = null;
      this.maxQuerySize = 100;
      this.queryUpdater = new ApiQueryUpdater('orcid_api');
      this.orcidApiTimeout = 30000; // 30 seconds

      this.adsQueryTimeout = 10; // 10 seconds

      this.dirty = true; // initialize as dirty, so it updates
    },

    /**
     * Activate the service.  Setup the configuration and
     * save the current ORCID preferences.
     *
     * @param {BeeHive} beehive
     */
    activate: function activate(beehive) {
      var storage = beehive.getService('PersistentStorage');
      var config = beehive.getObject('DynamicConfig');
      this.setBeeHive(beehive);
      this.config = {};

      _.extend(this.config, config.Orcid);

      if (storage) {
        var orcid = storage.get('Orcid');

        if (orcid && orcid.authData) {
          this.saveAccessData(orcid.authData);
        }
      }

      this._addWork = _.debounce(this._addWork, this.addWait);
      this._getUserProfile = _.debounce(this._getUserProfile, this.profileWait);
      this._deleteWork = _.debounce(this._deleteWork, this.deleteWait);
    },

    /**
     * Checks access to ORCID api by making request for a user profile
     * returns a promise; done() means success, fail() no access
     *
     * @returns {jQuery.Promise}
     */
    checkAccessOrcidApiAccess: function checkAccessOrcidApiAccess() {
      if (this.hasAccess()) {
        return this.getUserProfile();
      }

      return $.Deferred().reject().promise();
    },

    /**
     * Checks to see if the api has been given authentication information
     * from ORCiD, and if that information has expired or not
     * @returns {boolean}
     */
    hasAccess: function hasAccess() {
      if (this.authData && this.authData.expires) {
        return this.authData.expires > new Date().getTime();
      }

      return false;
    },

    /**
     * Redirects to ORCID where the user logs in and ORCID will forward
     * user back to us
     *
     * @param {String} [targetRoute='#user/orcid'] targetRoute
     */
    signIn: function signIn(targetRoute) {
      this.getPubSub().publish(this.getPubSub().APP_EXIT, {
        type: 'orcid',
        url: this.config.loginUrl + '&redirect_uri=' + encodeURIComponent(this.config.redirectUrlBase + (targetRoute || '/user/orcid'))
      }); // make sure to redirect to the proper page after sign in

      this.getPubSub().publish(this.getPubSub().ORCID_ANNOUNCEMENT, 'login');
    },

    /**
     * Set the preferences for the user
     *
     * @param {Object} userData - user data to update
     * @returns {*|jQuery.Promise}
     */
    setADSUserData: function setADSUserData(userData) {
      var url = this.getBeeHive().getService('Api').url + ApiTargets.ORCID_PREFERENCES + '/' + this.authData.orcid;
      var request = this.createRequest(url, {
        method: 'POST'
      }, userData);
      request.fail(function () {
        var msg = 'ADS ORCiD preferences could not be set';
        console.error.apply(console, [msg].concat(arguments));
      });
      return request;
    },

    /**
     * Uses the ADS ORCID preferences endpoint to grab the preferences
     * for this user
     *
     * @returns {*|jQuery.Promise}
     */
    getADSUserData: function getADSUserData() {
      var self = this;
      var url = this.getBeeHive().getService('Api').url + ApiTargets.ORCID_PREFERENCES + '/' + this.authData.orcid;
      var request = this.createRequest(url);
      request.fail(function () {
        self.signOut();
        self.getBeeHive().getObject('User').setOrcidMode(0);
        var title = 'Expired ORCID login';
        var msg = ['Your ORCID login has expired.', 'Please reload the page and sign in again to access the page.', '', '<button onclick="location.reload()" class="btn btn-primary" role="button">Reload</button>'];
        var pubSub = self.getPubSub();
        pubSub.publish(pubSub.ALERT, new ApiFeedback({
          title: title,
          msg: msg.join('<br/>'),
          modal: true,
          type: 'warning'
        }));
      });
      return request;
    },
    getUserBio: function getUserBio() {
      var dd = new $.Deferred();
      var url = this.getBeeHive().getService('Api').url + ApiTargets.ORCID_NAME + '/' + this.authData.orcid;
      var request = this.createRequest(url);
      request.fail(function () {
        var msg = 'ADS name could not be retrieved';
        console.error.apply(console, [msg].concat(arguments));
        dd.reject();
      });
      request.done(function (bio) {
        var orcidBio = new Bio(bio);
        dd.resolve(orcidBio);
      });
      return dd.promise();
    },

    /**
     * Forgets the OAuth access_token
     */
    signOut: function signOut() {
      this.saveAccessData(null);
      this.getPubSub().publish(this.getPubSub().ORCID_ANNOUNCEMENT, 'logout');
    },

    /**
     * Checks if the exchange code is present on the string
     *
     * @param {String} searchString
     * @returns {boolean}
     */
    hasExchangeCode: function hasExchangeCode(searchString) {
      return !!this.getExchangeCode(searchString);
    },

    /**
     * Get the exchange token from the location string or one specified
     * @param {String} [searchString=window.location.search] searchString
     * @returns {*|String|Undefined}
     */
    getExchangeCode: function getExchangeCode(searchString) {
      return this.getUrlParameter('code', searchString || window.location.search);
    },

    /**
     * Extract values from the URL (used to get code from redirects)
     *
     * @param {String} sParam - parameter to find
     * @param {String} searchString - string to search
     * @returns {String|Undefined} - value of param, if found
     */
    getUrlParameter: function getUrlParameter(sParam, searchString) {
      var sPageURL = searchString.substring(1);
      var sURLVariables = sPageURL.split('&');

      for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
          return decodeURIComponent(sParameterName[1]);
        }
      }
    },

    /**
     * Using access code retrieve the access_token from ORCID
     *
     * Example response:
     *  {"access_token":"4274a0f1-36a1-4152-9a6b-4246f166bafe","token_type":"bearer","ex
     *  pires_in":3599,"scope":"/orcid-works/create /orcid-profile/read-limited /orcid-w
     *  orks/update","orcid":"0000-0001-8178-9506","name":"Roman Chyla"}
     *
     * @param {String} oAuthCode
     * @returns {jQuery.Promise}
     */
    getAccessData: function getAccessData(oAuthCode) {
      var api = this.getBeeHive().getService('Api');
      var promise = $.Deferred();
      var opts = {
        url: this.config.exchangeTokenUrl,
        done: _.bind(promise.resolve, promise),
        fail: _.bind(promise.reject, promise),
        always: _.bind(promise.always, promise),
        headers: {
          Accept: 'application/json',
          Authorization: api.access_token
        }
      };
      api.request(new ApiRequest({
        target: this.config.exchangeTokenUrl,
        query: new ApiQuery({
          code: oAuthCode
        })
      }), opts);
      return promise.promise();
    },

    /**
     * Save the passed in authentication data from orcid
     * into user persistent storage for safe keeping.
     *
     * @param {object} authData - the authentication data
     */
    saveAccessData: function saveAccessData(authData) {
      var beehive = this.getBeeHive();

      if (authData && !authData.expires && authData.expires_in) {
        authData.expires = new Date().getTime() + (authData.expires_in * 1000 - 1000);
      }

      this.authData = authData;
      var storage = beehive.getService('PersistentStorage');

      if (storage) {
        var orcid = storage.get('Orcid') || {};
        orcid.authData = authData;
        storage.set('Orcid', orcid);
      }
    },

    /**
     * ===============================================================================
     * API ORCID access points
     * ===============================================================================
     */

    /**
     * Convenience method for converting target short name into the full url
     * @param {String} name - short name for endpoint
     * @param {Array|Number} [putCodes] putCodes - putcodes to append to end of url
     * @returns {string} - the url
     */
    getUrl: function getUrl(name, putCodes) {
      var targets = {
        profile_bib: '/orcid-profile/simple',
        profile_full: '/orcid-profile/full?update=True',
        works: '/orcid-works',
        work: '/orcid-work'
      };
      var url = this.config.apiEndpoint + '/' + this.authData.orcid + targets[name];
      var end = _.isArray(putCodes) ? putCodes.join(',') : putCodes;

      if (end) {
        url += '/' + end;
      }

      return url;
    },

    /**
     * Create a new request and filter success/fail always to appropriate methods
     * @param {String} url - url to send request to
     * @param {Object} [options={}] options - options for request
     * @param {Object} [data] data - payload of message
     * @returns {jQuery.Promise} promise object for request
     */
    createRequest: function createRequest(url, options, data) {
      if (_.isUndefined(url)) {
        throw new Error('Url must be defined');
      }

      var $dd = $.Deferred();
      var prom = this.sendData(url, data, options || {});
      prom.done(_.bind($dd.resolve, $dd));
      prom.fail(_.bind($dd.reject, $dd));
      prom.always(_.bind($dd.always, $dd));
      return $dd.promise();
    },

    /**
     * Debounced method for keeping lots of request for the profile at bay.
     * This method will resolve all awaiting promises when there has been an
     * idle period following the initial request.
     *
     * Different from getWorks, because with profile we are only concerned
     * with the most up-to-date response.  So a single response to resolve them
     * all is good enough.
     */
    _getUserProfile: function _getUserProfile() {
      var self = this;
      var request = this.createRequest(this.getUrl('profile_full')); // get everything so far in the cache

      var cache = self.getUserProfileCache.splice(0);
      request.done(function (profile) {
        _.forEach(cache, function (promise) {
          orcidProfile = new Profile(profile);
          promise.resolve(orcidProfile.setWorks(_.map(profile, function (profile, idx) {
            return new Work(profile);
          })));
        });
      });
      request.fail(function () {
        var args = arguments;

        _.forEach(cache, function (promise) {
          promise.reject.apply(promise, args);
        });
      });
    },

    /**
     * Retrieves user profile
     * Must have scope: /orcid-profile/read-limited
     *
     * Adds to the internal profile cache, which
     *
     * @returns {jQuery.Promise<Profile>} - Promise that resolves with profile
     */
    getUserProfile: function getUserProfile() {
      var $dd = $.Deferred();
      this.getUserProfileCache.push($dd);

      this._getUserProfile.call(this);

      return $dd.promise();
    },

    /**
     * Retrieve an entire work entry from ORCiD
     * This is different than the summary, it includes all information they
     * have in their system for the entry.
     *
     * This is necessary to get the author information
     *
     * @param {Number} putCode - putcode to be retrieved
     * @returns {jQuery.Promise<Work>} - promise that resolves with the work
     */
    getWork: function getWork(putCode) {
      var $dd = $.Deferred();
      this.createRequest(this.getUrl('works', putCode)).done(function (work) {
        $dd.resolve(new Work(work));
      }).fail(_.bind($dd.reject, $dd));
      return $dd.promise();
    },

    /**
     * Retrieve the full works as an array,
     * this can take any number of putcodes, it will chunk the requests and
     * return a deferred that will resolve with an array of works
     *
     * @param {Array} putCodes - putcodes to be retrieved
     * @returns {jQuery.Promise<Work[]>}
     */
    getWorks: function getWorks(putCodes) {
      if (!_.isArray(putCodes)) {
        throw new TypeError('putcodes must be an Array');
      }

      var $dd = $.Deferred();
      var chunkSize = 50;
      var proms = [];

      for (var i = 0, j = putCodes.length; i < j; i += chunkSize) {
        var chunk = putCodes.slice(i, i + chunkSize);
        var url = this.getUrl('works') + '/' + chunk.join(',');
        proms.push(_.partial(this.createRequest, url));
      }

      var reqs = $.when.apply($, proms);
      reqs.done(_.bind($dd.resolve, $dd));
      reqs.fail(function () {
        // we are passed an array for EACH argument, so passing the whole thing
        $dd.reject(arguments);
      });
      return $dd.promise();
    },

    /**
     * Update an existing ORCiD work.  This method requires that the putcode
     * for the work be present in the update object.
     *
     * @param {Object} work - object containing updated orcid information
     * @param {Number} work["put-code"] - putcode to update
     * @returns {jQuery.Promise} - promise for the request
     */
    updateWork: function updateWork(work) {
      if (!_.isPlainObject(work)) {
        throw new TypeError('Work should be a simple object');
      }

      var putcode = work['put-code'];

      if (!putcode) {
        return $.Deferred().reject().promise();
      }

      var url = this.getUrl('works', putcode);
      return this.createRequest(url, {
        method: 'PUT'
      }, work);
    },

    /**
     * Delete a single work from ORCiD
     *
     * @param {Number} putCode - putcode of work to be deleted
     * @returns {jQuery.Promise} - promise for the request
     */
    deleteWork: function deleteWork(putCode) {
      if (!_.isNumber(putCode)) {
        throw new TypeError('putcode should be a number');
      }

      var $dd = $.Deferred();
      this.deleteCache.push({
        // create unique request id to ride along with request
        id: _.uniqueId(),
        putCode: putCode,
        promise: $dd
      });

      this._deleteWork.call(this);

      return $dd.promise();
    },

    /**
     * Debounced method that takes chunks of deletes and fires them off
     * in batches, this way we don't send 100 at once.
     */
    _deleteWork: function _deleteWork() {
      var self = this;
      var cachedDeletes = this.deleteCache.slice(0);
      var chunk;
      var promises = [];
      var chunks = []; // chunk up the deletes

      for (var i = 0; i < cachedDeletes.length; i += this.maxDeleteChunkSize) {
        chunk = cachedDeletes.slice(i, i + this.maxDeleteChunkSize);
        chunks.push(chunk);
      } // take each chunk, loop through them creating a request for each


      _.forEach(chunks, function (c, i) {
        _.forEach(c, function (del) {
          // add the promise object to array for checking later
          promises.push(del.promise.promise()); // staggered delays, for example:
          // 1st request -> wait 3 seconds
          // 2nd request -> wait 6 seconds
          // 3rd request -> wait 9 seconds
          // ...

          _.delay(function () {
            // create the request for each delete
            var request = self.createRequest(self.getUrl('works', del.putCode), {
              beforeSend: function beforeSend(xhr) {
                xhr._id = del.id;
              },
              method: 'DELETE'
            }); // apply the promise handlers

            request.done(_.bind(del.promise.resolve, del.promise)).fail(_.bind(del.promise.reject, del.promise)).always(_.bind(del.promise.always, del.promise)); // remove the entry from the cache

            var idx = self.deleteCache.indexOf(del);
            self.deleteCache.splice(idx, idx + 1);
          }, self.deleteWait * i);
        });
      }); // resolve remaining promises


      var finalizeCacheEntries = function finalizeCacheEntries() {
        self.deleteCache = _.reduce(self.deleteCache, function (res, entry) {
          entry.promise.state() === 'pending' ? entry.promise.reject() : res.push(entry);
          return res;
        }, []);
      };

      $.when.apply($, promises).always(finalizeCacheEntries);
    },

    /**
     * Add new ORCiD work
     * This will add an entry to an internal cache which will be used when
     * the requests finally run.  Here we provide the old work, id and promise
     * to the cache.
     *
     * @param {Object} orcidWork
     */
    addWork: function addWork(orcidWork) {
      if (!_.isPlainObject(orcidWork)) {
        throw new TypeError('Should be plain object');
      }

      var $dd = $.Deferred();
      this.addCache.push({
        // create unique request id to ride along with request
        id: _.uniqueId(),
        work: orcidWork,
        promise: $dd
      });

      this._addWork.call(this);

      return $dd.promise();
    },

    /**
     * Debounced method for adding works
     * This method will run iif it has been called once and then an
     * idle period has passed without another call.  At that point it will
     * get the current cache and make a request.
     *
     * Cached entries are checked against ids that ride along the request on
     * the xhr object.
     *
     * @private
     * @returns {*}
     */
    _addWork: function _addWork() {
      var self = this;

      var cachedWorks = _.map(self.addCache, 'work');

      var cachedIds = _.map(self.addCache, 'id');

      var prom = self._addWorks(cachedWorks, cachedIds); // On success, create a new work and remove the entry from the cache


      prom.done(function (workResponse) {
        // workResponse will be in ID:WORK format
        _.forEach(workResponse, function (work, id) {
          var cacheEntry = _.find(self.addCache, function (e) {
            return e.id === id;
          });

          if (!cacheEntry) {
            console.error('No Cache entry found');
            return true;
          }

          var promise = cacheEntry.promise;
          var oldWork = cacheEntry.work; // check to see if the work is an error message, { error: {...} }

          if (!work) {
            // something weird going on with work, just reject
            promise.reject();
          } else if (work.error) {
            // check to see if it's just a conflict
            if (work.error['response-code'] === 409) {
              promise.resolve(oldWork);
            } else {
              promise.reject();
            }
          } else {
            // no errors, resolve with the new work, { work: {...} }
            promise.resolve(new Work(work.work));
          } // remove from the cache


          var idx = self.addCache.indexOf(cacheEntry);
          self.addCache.splice(idx, idx + 1);
        });
      }); // on fail, reject the promises
      // this should receive a list of ids which we can finish up with

      prom.fail(function (ids) {
        var args = arguments;

        _.forEach(ids, function (id) {
          // find the cache entry
          var idx = _.findIndex(self.addCache, {
            id: id
          });

          if (idx >= 0) {
            // grab reference to promise
            var promise = self.addCache[idx].promise; // remove entry from cache

            self.addCache.splice(idx, idx + 1); // if it is still pending, reject it now

            if (promise.state() === 'pending') {
              promise.reject.apply(promise, args);
            }
          }
        });
      });
    },

    /**
     * Add multiple works to ORCiD
     * This method will chunk the incoming works by a maximum chunk size
     * and send a separate request for each.  When all requests complete, it
     * will aggregate and index them using unique request ids
     *
     * @private
     * @param {Object[]} orcidWorks
     * @param {Number[]} ids
     */
    _addWorks: function _addWorks(orcidWorks, ids) {
      var self = this;

      if (!_.isArray(orcidWorks) || !_.isArray(ids)) {
        throw new TypeError('works and ids must be arrays');
      }

      var $dd = $.Deferred();
      var promises = [];
      var chunk;
      var chunkIds;

      for (var i = 0; i < orcidWorks.length; i += this.maxAddChunkSize) {
        chunk = orcidWorks.slice(i, i + this.maxAddChunkSize);
        chunkIds = ids.slice(i, i + this.maxAddChunkSize); // create bulk object

        var bulkWorks = {
          bulk: []
        };

        _.each(chunk, function (w) {
          bulkWorks.bulk.push({
            work: w
          });
        });

        var url = this.getUrl('works');
        promises.push(this.createRequest(url, {
          beforeSend: function beforeSend(xhr) {
            xhr.cacheIds = chunkIds;
          },
          method: 'POST'
        }, bulkWorks));
      } // when all the promises finish, aggregate the result and index by id


      $.when.apply($, promises).then(function () {
        // make sure arguments is an 2d array
        var doneArgs = _.isArray(arguments[0]) ? arguments : [arguments];

        var obj = _.reduce(doneArgs, function (res, args) {
          var works = args && args[0] && args[0].bulk;
          var ids = args && args[2] && args[2].cacheIds; // build response object, indexed by ids

          _.forEach(ids, function (id, idx) {
            res[id] = works[idx];
          });

          return res;
        }, {});

        $dd.resolve(obj);
      }, function (xhr) {
        self.setDirty();
        $dd.reject.apply($dd, [xhr.cacheIds].concat(arguments));
      });
      return $dd.promise();
    },
    // #############################################################################

    /**
     * Use Api service to make a request to the ORCID api
     *
     * @param {string} url - request url
     * @param {Object} [data={}] data - request payload
     * @param {Object} [opts={}] opts - request options
     * @returns {*}
     */
    sendData: function sendData(url, data, opts) {
      var result = $.Deferred();
      opts = opts || {};
      var options = {
        type: 'GET',
        url: url,
        contentType: 'application/json',
        cache: !!this.dbUpdatePromise,
        // true = do not generate _ parameters (let browser cache responses)
        timeout: this.orcidApiTimeout,
        done: _.bind(result.resolve, result),
        fail: _.bind(result.reject, result),
        always: _.bind(result.always, result)
      };

      if (data) {
        options.dataType = 'json';
        options.data = JSON.stringify(data); // because ORCID sends empty response for POST requests
        // we must be able to handle it properly (but it is not
        // nice of them)

        options.converters = {
          '* text': window.String,
          'text html': true,
          'text json': function textJson(input) {
            input = input || '{}';
            return $.parseJSON(input);
          },
          'text xml': $.parseXML
        };
      } else {
        options.data = null; // to prevent api.request() from adding {} to the url params
      }

      _.extend(options, opts);

      var api = this.getBeeHive().getService('Api');

      if (!options.headers) {
        options.headers = {};
      }

      options.headers.Authorization = api.access_token;

      if (!options.headers['Orcid-Authorization'] && this.authData) {
        options.headers['Orcid-Authorization'] = 'Bearer ' + this.authData.access_token;
      }

      if (!options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
      }

      if (!options.headers.Accept) {
        options.headers.Accept = 'application/json';
      }

      api.request(new ApiRequest({
        target: url,
        query: new ApiQuery(),
        options: options
      }));
      return result.promise();
    },

    /**
     * Takes in a query containing all identifiers to check against what is in
     * ADS.  Query will return all known (to ADS) records, but in the following
     * format:
     *
     * "IDENTIFIER_TYPE:IDENTIFIER_VALUE": "BIBCODE"
     *
     * @example
     * q = ['bibcode:2018CNSNS..56..270Q OR alternate_bibcode:2018CNSNS..56..270Q']
     * // returns:
     * {
     *  "bibcode:2018CNSNS..56..270Q": "2018CNSNS..56..270Q"
     *  "doi:10.1016/j.cnsns.2017.08.014": "2018CNSNS..56..270Q"
     * }
     *
     * @param {ApiQuery} apiQuery - query to check
     * @returns {jQuery.Promise<Object>} - request promise
     * @private
     */
    _checkIdsInADS: function _checkIdsInADS(apiQuery) {
      var api = this.getBeeHive().getService('Api');
      var dd = $.Deferred();
      apiQuery.set('fl', 'bibcode, doi, alternate_bibcode');
      apiQuery.set('rows', '5000');

      var onDone = function onDone(data) {
        if (!data || !data.response || !data.response.docs) {
          return dd.resolve({});
        } // we have to create an identifier string for each


        var ret = _.reduce(data.response.docs, function (res, doc) {
          var bibcode = doc.bibcode.toLowerCase();
          var key = 'identifier:' + bibcode;
          res[key] = bibcode;

          _.each(doc.doi, function (doi) {
            var key = 'identifier:' + doi.toLowerCase().replace('doi:', '');
            res[key] = bibcode;
          });

          _.each(doc.alternate_bibcode, function (ab) {
            var key = 'identifier:' + ab.toLowerCase();
            res[key] = bibcode;
          });

          return res;
        }, {});

        dd.resolve(ret);
      };

      var onFail = function onFail() {
        dd.resolve({});
      };

      api.request(new ApiRequest({
        target: ApiTargets.SEARCH,
        query: apiQuery,
        options: {
          done: onDone,
          fail: onFail
        }
      })).fail(onFail); // reject after timeout, if necessary

      (function check(count) {
        if (dd.state() === 'pending' && count <= 0) {
          return dd.reject('Request Timeout');
        }

        if (dd.state() === 'resolved') {
          return;
        }

        _.delay(check, 1000, --count);
      })(this.adsQueryTimeout);

      return dd.promise();
    },

    /**
     * Check if the work was sourced by ADS
     * @param {Work} work
     */
    isSourcedByADS: function isSourcedByADS(work) {
      return work.getSourceName().indexOf('NASA Astrophysics Data System') > -1;
    },

    /**
     * Generate a query string by doing custom joins on the array.  Each entry
     * in the passed in query gets checked and added to the generated string
     * by "OR"-ing them together.
     *
     * @example
     * _buildQuery({
     *  identifier: ['2018CNSNS..56..270Q', '2017CNSNS..56..270Q']
     * });
     * // returns:
     * { "q": [
     *  "identifier:2018CNSNS..56..270Q OR identifier:2017CNSNS..56..270Q"
     * ]}
     *
     * @param {Object} query - query object used to build new ApiQuery
     * @param {string[]} [query.identifier] query.identifier
     * @returns {ApiQuery} - a new api query to use in a request
     * @private
     */
    _buildQuery: function _buildQuery(query) {
      if (_.isEmpty(query) || !query.identifier) {
        return null;
      } // reformat array as 'identifier:xxx OR identifier:xxx'


      var q = _.filter(query.identifier, function (i) {
        // grab only non-empty entries
        return !_.isEmpty(i.trim()) || i === 'NONE';
      }).join(' OR '); // don't let an empty query string through


      if (_.isEmpty(q)) {
        return null;
      }

      return new ApiQuery({
        q: 'identifier:(' + q + ')'
      });
    },

    /**
     * Updates our current knowledge of ORCID Data
     * This will typically be only summaries of works
     *
     * @param {Profile} [profile] profile
     */
    updateDatabase: function updateDatabase(profile) {
      var self = this;

      if (this.dbUpdatePromise && this.dbUpdatePromise.state() === 'pending') {
        return this.dbUpdatePromise.promise();
      }

      this.dbUpdatePromise = $.Deferred(); // set the database object and resolve the promise

      var finishUpdate = function finishUpdate(db) {
        var dbPromise = self.dbUpdatePromise;
        self.setClean();
        self.db = db;

        if (dbPromise) {
          dbPromise.resolve();
        }

        setTimeout(function () {
          if (dbPromise && dbPromise.state() !== 'pending') {
            dbPromise = null;
            self.setDirty();
          }
        }, self.clearDBWait);
      }; // apply the update to the database


      var update = function update(profile) {
        // get the works and all external IDs for them
        var works = profile.getWorks();
        var query = [];
        var db = {};

        _.forEach(works, function addIdsToDatabase(w, i) {
          var key = 'identifier:';
          var ids = w.getIdentifier();
          key += ids;

          if (key) {
            query.push(key);
            db[key.toLowerCase()] = {
              sourcedByADS: self.isSourcedByADS(w),
              putcode: w.getPutCode(),
              idx: i
            };
          }
        });

        if (query.length && self.maxQuerySize > 0) {
          var whereClauses = [];
          query = query.sort();

          var steps = _.range(0, query.length, self.maxQuerySize);

          for (var i = 0; i < steps.length; i++) {
            var q = {};

            for (var j = steps[i]; j < steps[i] + self.maxQuerySize; j++) {
              if (j >= query.length) break;
              var ps = query[j].split(':');
              if (!q[ps[0]]) q[ps[0]] = [];
              q[ps[0]].push(self.queryUpdater.quoteIfNecessary(ps[1]));
            }

            var newQuery = self._buildQuery(q);

            if (newQuery) {
              whereClauses.push(self._checkIdsInADS(newQuery));
            }
          }
        } else {
          finishUpdate(db);
        }
        /**
         * This will receive a set of of identifier strings that are in the
         * following format:
         *
         * @example
         * [
         *  identifier:2017geoji.tmp...42f:"2017geoji.209..597f",
         *  identifier:2017gml...tmp...20d:"2017gml...tmp...20d"
         * ]
         *
         * It will then update the database, by setting a bibcode property on
         * each record.  Also, if the record is not found here, it will be
         * unset (-1) so that it won't be counted as an orcid record.
         *
         */


        var querySuccess = function querySuccess(ids) {
          // Update each orcid record with identifier info gained from ADS
          _.each(db, function (v, key) {
            var bibcode = ids[key]; // ADS did not find a record for this identifier

            if (!bibcode) {
              db[key].idx = -1;
            } else {
              db[key].bibcode = bibcode;
            }
          });

          finishUpdate(db);
        }; // on fail, alert the console and finish the update


        var queryFailure = function queryFailure() {
          console.error.apply(console, ['Error processing response from ADS'].concat(arguments));
          finishUpdate(db);
        };

        $.when.apply($, whereClauses).then(querySuccess, queryFailure);
      };

      if (profile) {
        update(profile);
      } else {
        // if we aren't passed a profile, get the current one
        this.getUserProfile().done(update).fail(function () {
          self.dbUpdatePromise.reject.apply(self.dbUpdatePromise, arguments);
        });
      }

      return self.dbUpdatePromise.promise();
    },

    /**
     * Creates a metadata object based on the work that is passed in that
     * helps with understanding the record's relationship with ADS.  Figures
     * out if the record is sourced by ADS, whether it is known, and whether
     * ADS has the rights to update/delete it.
     *
     * @param {object} adsWork
     */
    getRecordInfo: function getRecordInfo(adsWork) {
      var self = this;
      var dd = $.Deferred();
      /**
       * Creates a metadata object based on the record data passed in.
       *
       * @returns {{
       *  isCreatedByADS: boolean,
       *  isCreatedByOthers: boolean,
       *  isKnownToADS: boolean,
       *  provenance: null
       * }}
       *
       * @param {object} adsWork
       */

      var getRecordMetaData = function getInfo(adsWork) {
        var out = {
          isCreatedByADS: false,
          isCreatedByOthers: false,
          isKnownToADS: false,
          provenance: null
        };
        /*
        Looking to match the work record passed in to the entry in the db
        Then we can add some metadata like whether it was an ADS sourced
        record or not
          */

        var updateRecord = function updateRecord(v, k) {
          // db is always 'identifier:xxx'
          var key = ('identifier:' + v).toLowerCase();
          var rec = self.db[key];

          if (rec) {
            if (rec.sourcedByADS) {
              out.isCreatedByADS = true;
            } else {
              out.isCreatedByOthers = true;
            }

            if (rec.idx > -1) {
              out.isKnownToADS = true;
            }

            out = _.extend({}, out, rec);
          }
        };

        var ids = _.pick(adsWork, 'identifier', 'bibcode', 'doi', 'alternate_bibcode');

        _.each(ids, function (value, key) {
          if (_.isArray(value)) {
            _.each(value, updateRecord);
          } else {
            updateRecord(value, key, out);
          }
        });

        return out;
      };

      if (this.needsUpdate()) {
        this.updateDatabase().done(function () {
          dd.resolve(getRecordMetaData(adsWork));
        }).fail(_.bind(dd.reject, dd));
      } else {
        dd.resolve(getRecordMetaData(adsWork));
      }

      return dd.promise();
    },

    /**
     * Determines if the database needs to be updated.  It may, if there have
     * been updates/deletes or if the internal timeout fired.
     *
     * @returns {boolean}
     */
    needsUpdate: function needsUpdate() {
      return this.dirty;
    },
    setDirty: function setDirty() {
      this.dirty = true;
    },
    setClean: function setClean() {
      this.dirty = false;
    },
    hardenedInterface: {
      hasAccess: 'boolean indicating access to ORCID Api',
      getUserProfile: 'get user profile',
      getUserBio: 'get user bio',
      signIn: 'login',
      signOut: 'logout',
      getADSUserData: '',
      setADSUserData: '',
      getRecordInfo: 'provides info about a document',
      addWork: 'add a new orcid work',
      deleteWork: 'remove an entry from orcid',
      updateWork: 'update an orcid work',
      getWork: 'get an orcid work',
      getWorks: 'get an array of orcid works'
    }
  });

  _.extend(OrcidApi.prototype, Mixins.BeeHive);

  _.extend(OrcidApi.prototype, HardenedMixin);

  return OrcidApi;
});

/**
 * ORCID module is the main component for enabling communication with ORCID Api
 *
 * It should be installed through discovery.config.js, it needs to go into
 * the controllers section (because it will create an instance of the OrcidApi
 * and insert that into services)
 *
 * You config should look like:
 *
 *   'js/apps/discovery/main': {
 *
 *      core: {
 *       controllers: {
 *         Orcid: 'js/modules/orcid/module'
 *         ....
 *         }
 *   }
 *
 */
define('js/modules/orcid/module',['backbone', 'underscore', 'js/components/generic_module', './orcid_api'], function (Backbone, _, GenericModule, OrcidApi) {
  var OrcidModule = GenericModule.extend({
    activate: function activate(beehive) {
      var config = beehive.getObject('DynamicConfig');

      if (!config) {
        throw new Error('DynamicConfig is not available to Orcid module');
      }

      var redirectUrlBase = config.orcidRedirectUrlBase || location.protocol + '//' + location.host;
      var orcidClientId = config.orcidClientId;
      var orcidApiEndpoint = config.orcidApiEndpoint;
      var orcidLoginEndpoint = config.orcidLoginEndpoint;

      if (!orcidClientId || !orcidApiEndpoint) {
        throw new Error('Missing configuration for ORCID module: orcidApiEndpoint, orcidClientId');
      } // TODO:rca - clean up this


      var opts = {
        redirectUrlBase: redirectUrlBase,
        apiEndpoint: orcidApiEndpoint,
        clientId: orcidClientId,
        worksUrl: orcidApiEndpoint + '/{0}/orcid-works',
        loginUrl: orcidLoginEndpoint + '?scope=/orcid-profile/read-limited%20/orcid-works/create%20/orcid-works/update&response_type=code&access_type=offline' + '&show_login=true' + '&client_id=' + orcidClientId,
        exchangeTokenUrl: orcidApiEndpoint + '/exchangeOAuthCode'
      };

      _.extend(config, {
        Orcid: opts
      });

      this.activateDependencies(beehive);
    },
    activateDependencies: function activateDependencies(beehive) {
      var orcidApi = beehive.getService('OrcidApi');

      if (orcidApi) {
        // already activated
        return;
      }

      orcidApi = new OrcidApi();
      orcidApi.activate(beehive);
      beehive.addService('OrcidApi', orcidApi);
    }
  });
  return function () {
    return {
      activate: function activate(beehive) {
        var om = new OrcidModule();
        om.activate(beehive);
      }
    };
  };
});

define('js/widgets/base/base_widget',['backbone', 'marionette', 'js/components/api_query', 'js/components/api_request', 'js/mixins/widget_mixin_method', 'js/components/api_targets', 'js/mixins/dependon', 'js/mixins/widget_state_manager'], function (Backbone, Marionette, ApiQuery, ApiRequest, WidgetMixin, ApiTargets, Dependon, WidgetStateManagerMixin) {
  /**
   * Default PubSub based widget; the main functionality is inside
   *
   *  dispa tchRequest()
   *    - publishes ApiRequest object into PubSub (to initiate search)
   *
   *  processResponse()
   *    - receives ApiResponse object as a direct reply for the previous
   *      request
   *
   * You will want to override 'processResponse' method and possibly
   * some of the other methods like this;
   *
   * var newWidgetClass = BaseWidget.extend({
   *   composeRequest : function(){},
   *   processRequest : function(){}
   * });
   *
   * var newInstance = new newWidgetClass();
   *
   *
   * If you need to provide your own views, do initalization etc., override
   * initialize
   *
   * * var newWidgetClass = BaseWidget.extend({
   *   initialize: function() {
   *      // do something
   *      BaseWidget.prototype.initialize.apply(this, arguments);
   *   }
   * });
   *
   *
   * Some other options include:
   *
   *  defaultQueryArguments: this is a list of parameters added to each query
   *
   */
  var BaseWidget = Marionette.Controller.extend({
    initialize: function initialize(options) {
      options = options || {}; // these methods are called by PubSub as handlers so we bind them to 'this' object
      // and they will carry their own context 'this'

      _.bindAll(this, 'dispatchRequest', 'processResponse');

      this._currentQuery = new ApiQuery();
      this.defaultQueryArguments = this.defaultQueryArguments || {};

      if (options.defaultQueryArguments) {
        this.defaultQueryArguments = _.extend(this.defaultQueryArguments, options.defaultQueryArguments);
      }

      if (options.view) {
        this.view = options.view;
        this.collection = options.view.collection;
      } // our way of listening to views/models


      if (this.view) Marionette.bindEntityEvents(this, this.view, Marionette.getOption(this, 'viewEvents'));
      if (this.model) Marionette.bindEntityEvents(this, this.model, Marionette.getOption(this, 'modelEvents'));
    },

    /**
     * Called by Bumblebee application when a widget is about to be registered
     * it receives a BeeHive object, that contais methods/attributes that a
     * widget needs to communicate with the app
     *
     * This is the place where you want to subscribe to events
     *
     * @param beehive
     */
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      var pubsub = beehive.getService('PubSub'); // custom dispatchRequest function goes here

      pubsub.subscribe(pubsub.INVITING_REQUEST, _.bind(this.dispatchRequest, this)); // custom handleResponse function goes here

      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, _.bind(this.processResponse, this));
    },

    /**
     * You should use this method when you want to initiaze global search action
     * (ie. send a query to the pubsub)
     *
     * @param apiQuery
     */
    dispatchNewQuery: function dispatchNewQuery(apiQuery) {
      // remove the arguments that are useful only to this widget
      _.each(this.defaultQueryArguments, function (v, k) {
        apiQuery.unset(k);
      });

      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.NAVIGATE, 'search-page', {
        q: apiQuery
      });
    },

    /**
     * Default callback to be called by PubSub on 'INVITING_REQUEST'
     */
    dispatchRequest: function dispatchRequest(apiQuery) {
      this._dispatchRequest(apiQuery);
    },
    _dispatchRequest: function _dispatchRequest(apiQuery) {
      var q = this.customizeQuery(apiQuery);

      if (q) {
        var req = this.composeRequest(q);

        if (req) {
          var pubsub = this.getPubSub();
          pubsub.publish(pubsub.DELIVERING_REQUEST, req);
        }
      }
    },

    /**
     * Default action to modify ApiQuery (called from inside dispatchRequest)
     *
     * @param apiQuery
     */
    customizeQuery: function customizeQuery(apiQuery) {
      var q = apiQuery.clone();
      q.unlock();

      if (this.defaultQueryArguments) {
        q = this.composeQuery(this.defaultQueryArguments, q);
      }

      return q;
    },

    /**
     * Default callback to be called by PubSub on 'DELIVERING_RESPONSE'
     * @param apiResponse
     */
    processResponse: function processResponse(apiResponse) {
      // in your widget, you should always set the current query like this
      var q = apiResponse.getApiQuery();
      this.setCurrentQuery(q);
      throw new Error('you need to customize this function');
    },

    /**
     * This function should return a request IFF we want to get some
     * data - it is called from inside 'dispatchRequest' event handler
     *
     * @param object with params to add
     * @returns {ApiRequest}
     */
    composeRequest: function composeRequest(apiQuery) {
      return new ApiRequest({
        target: ApiTargets.SEARCH,
        query: apiQuery
      });
    },

    /**
     * Will save a clone of the apiQuery into the widget (for future use and
     * reference)
     *
     * @param apiQuery
     */
    setCurrentQuery: function setCurrentQuery(apiQuery) {
      this._currentQuery = apiQuery;
    },

    /**
     * Returns the current ApiQuery
     * if a query hasn't been set, it will check if there is one in storage,
     * if not, it will return an empty query
     *
     * @returns {ApiQuery|*}
     */
    getCurrentQuery: function getCurrentQuery() {
      var currQuery = new ApiQuery({});
      var beehive;

      try {
        if (this._currentQuery instanceof ApiQuery) {
          currQuery = this._currentQuery;
        } else if (_.isFunction(this.getBeeHive)) {
          beehive = this.getBeeHive();

          if (beehive.hasObject('AppStorage')) {
            var q = beehive.getObject('AppStorage').getCurrentQuery();

            if (q instanceof ApiQuery) {
              currQuery = q;
            }
          }
        }
      } catch (e) {
        console.error(e.message);
      } finally {
        return currQuery;
      }
    },

    /**
     * All purpose function for making a new query. It returns an apiQuery ready for
     * newQuery event or for insertion into  apiRequest.
     *
     * @param queryParams
     * @param apiQuery
     * @returns {*}
     */
    composeQuery: function composeQuery(queryParams, apiQuery) {
      var query;

      if (!apiQuery) {
        query = this.getCurrentQuery();
        query = query.clone();
      } else {
        query = apiQuery;
      }

      if (queryParams) {
        _.each(queryParams, function (v, k) {
          if (!query.has(k)) query.set(k, v);
        });
      }

      return query;
    },
    onDestroy: function onDestroy() {
      this.view.destroy();
    },

    /**
     * Convention inside Backbone and Marionette is to return 'this'
     * - since 'this' usually refers to a 'View', we'll return the
     * view's el here
     * doesn't render unless it has to
     *
     * @returns {view.el}
     */
    getEl: function getEl() {
      if (this.view.el && this.view.$el.children().length) {
        return this.view.el;
      }

      return this.view.render().el;
    },

    /*
     *
     * convenience function for tests, always re-renders
     *
     * */
    render: function render() {
      return this.view.render();
    },

    /**
     * Extracts identifier from a query object
     *
     * @param {ApiQuery} apiQuery
     */
    parseIdentifierFromQuery: function parseIdentifierFromQuery(apiQuery) {
      if (!apiQuery.hasVal('q')) {
        throw 'no query';
      }

      var q = apiQuery.get('q')[0];

      try {
        if (/^(?:identifier|bibcode):(.*)$/.test(q)) {
          return q.split(':')[1];
        }
      } catch (e) {
        throw 'unable to parse bibcode';
      }

      throw 'query must be in the format of identifer:foo or bibcode:foo';
    }
  }, {
    mixin: WidgetMixin
  });

  _.extend(BaseWidget.prototype, Dependon.BeeHive, WidgetStateManagerMixin);

  return BaseWidget;
});


/* START_TEMPLATE */
define('hbs!js/widgets/list_of_things/templates/item-template',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return " chosen ";
},"3":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "            <input type=\"checkbox\" value="
    + this.escapeExpression(((helper = (helper = helpers.identifier || (depth0 != null ? depth0.identifier : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"identifier","hash":{},"data":data}) : helper)))
    + " name=\"identifier\" "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.chosen : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " aria-label=\"select item "
    + this.escapeExpression(((helper = (helper = helpers.indexToShow || (depth0 != null ? depth0.indexToShow : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"indexToShow","hash":{},"data":data}) : helper)))
    + "\">\n";
},"4":function(depth0,helpers,partials,data) {
    return " checked ";
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.normCiteSort : depth0),{"name":"if","hash":{},"fn":this.program(7, data, 0),"inverse":this.program(9, data, 0),"data":data})) != null ? stack1 : "");
},"7":function(depth0,helpers,partials,data) {
    var helper;

  return "              <a href=\"#abs/"
    + this.escapeExpression(((helper = (helper = helpers.encodedIdentifier || (depth0 != null ? depth0.encodedIdentifier : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"encodedIdentifier","hash":{},"data":data}) : helper)))
    + "/citations\" title=\"citation count\" class=\"citations-redirect-link\" aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.citationCountNorm || (depth0 != null ? depth0.citationCountNorm : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"citationCountNorm","hash":{},"data":data}) : helper)))
    + " normalized citations\"><span class=\"hidden-xs\">cited (n):</span> "
    + this.escapeExpression(((helper = (helper = helpers.citationCountNorm || (depth0 != null ? depth0.citationCountNorm : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"citationCountNorm","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"9":function(depth0,helpers,partials,data) {
    var helper;

  return "              <a href=\"#abs/"
    + this.escapeExpression(((helper = (helper = helpers.encodedIdentifier || (depth0 != null ? depth0.encodedIdentifier : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"encodedIdentifier","hash":{},"data":data}) : helper)))
    + "/citations\" title=\"citation count\" class=\"citations-redirect-link\" aria-label=\""
    + this.escapeExpression(((helper = (helper = helpers.citation_count || (depth0 != null ? depth0.citation_count : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"citation_count","hash":{},"data":data}) : helper)))
    + " citations\"><span class=\"hidden-xs\">cited:</span> "
    + this.escapeExpression(((helper = (helper = helpers.citation_count || (depth0 != null ? depth0.citation_count : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"citation_count","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"11":function(depth0,helpers,partials,data) {
    var stack1;

  return "\n                <div class=\"letter-icon s-letter-icon\">\n\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.links : depth0)) != null ? stack1.text : stack1),{"name":"if","hash":{},"fn":this.program(12, data, 0),"inverse":this.program(16, data, 0),"data":data})) != null ? stack1 : "")
    + "\n            </div>\n\n            <div class=\"letter-icon s-letter-icon\">\n\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.links : depth0)) != null ? stack1.list : stack1),{"name":"if","hash":{},"fn":this.program(18, data, 0),"inverse":this.program(21, data, 0),"data":data})) != null ? stack1 : "")
    + "\n            </div>\n            <div class=\"letter-icon s-letter-icon\">\n\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.links : depth0)) != null ? stack1.data : stack1),{"name":"if","hash":{},"fn":this.program(23, data, 0),"inverse":this.program(26, data, 0),"data":data})) != null ? stack1 : "")
    + "\n            </div>\n";
},"12":function(depth0,helpers,partials,data) {
    var stack1;

  return "\n                        <a href=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.links : depth0)) != null ? stack1.text : stack1)) != null ? stack1['0'] : stack1)) != null ? stack1.url : stack1), depth0))
    + "\" target=\"_blank\" rel=\"noreferrer noopener\" class=\"btn-link active-link s-active-link\" aria-disabled=\"false\">\n                            <i class=\"s-text-icon\" aria-hidden=\"true\"></i>\n                            <span class=\"sr-only\">quick access to full text links</span>\n                        </a>\n                        <ul class=\"hidden list-unstyled link-details s-link-details\" role=\"menu\">\n\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.links : depth0)) != null ? stack1.text : stack1),{"name":"each","hash":{},"fn":this.program(13, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                        </ul>\n\n";
},"13":function(depth0,helpers,partials,data) {
    var stack1;

  return "                            <li><a "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.openAccess : depth0),{"name":"if","hash":{},"fn":this.program(14, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " href=\""
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.url : depth0), depth0))
    + "\"\n                                target=\"_blank\" rel=\"noreferrer noopener\" aria-label=\"open access link\">"
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.name : depth0), depth0))
    + "</a></li>\n";
},"14":function(depth0,helpers,partials,data) {
    return " class=\"s-open-access\"";
},"16":function(depth0,helpers,partials,data) {
    return "\n                    <div title=\"full text links (none)\">\n                        <a href=\"javascript:void(0)\" class=\"btn-link disabled\" aria-disabled=\"true\" aria-label=\"full text links\">\n                            <i class=\"s-text-icon\" aria-hidden=\"true\"></i>\n                        </a>\n                    </div>\n\n";
},"18":function(depth0,helpers,partials,data) {
    var stack1;

  return "\n                <a href=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.links : depth0)) != null ? stack1.list : stack1)) != null ? stack1['0'] : stack1)) != null ? stack1.url : stack1), depth0))
    + "\" class=\"btn-link active-link s-active-link\" aria-disabled=\"false\">\n                    <i class=\"s-list-icon\" aria-hidden=\"true\"></i>\n                    <span class=\"sr-only\">quick links to lists of references, citations and more</span>\n                </a>\n\n                <ul class=\"hidden list-unstyled list-unstyled link-details s-link-details\" role=\"menu\">\n\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.links : depth0)) != null ? stack1.list : stack1),{"name":"each","hash":{},"fn":this.program(19, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                </ul>\n\n";
},"19":function(depth0,helpers,partials,data) {
    return "                    <li><a href=\""
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.url : depth0), depth0))
    + "\">"
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.name : depth0), depth0))
    + "</a></li>\n";
},"21":function(depth0,helpers,partials,data) {
    return "                <div title=\"references, citations (none)\">\n                    <a href=\"javascript:void(0)\" class=\"btn-link disabled\" aria-disabled=\"true\">\n                        <i class=\"s-list-icon\" aria-hidden=\"true\"></i>\n                        <span class=\"sr-only\">quick links to lists of references, citations etc</span>\n                    </a>\n                </div>\n\n\n";
},"23":function(depth0,helpers,partials,data) {
    var stack1;

  return "\n                <a href=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.links : depth0)) != null ? stack1.data : stack1)) != null ? stack1['0'] : stack1)) != null ? stack1.url : stack1), depth0))
    + "\" target=\"_blank\" rel=\"noreferrer noopener\" class=\"btn-link active-link s-active-link\" aria-disabled=\"false\">\n                    <i class=\"s-data-icon\" aria-hidden=\"true\"></i>\n                    <span class=\"sr-only\">quick links to data associated with this article</span>\n                </a>\n\n                <ul class=\"hidden list-unstyled link-details s-link-details\" role=\"menu\">\n\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.links : depth0)) != null ? stack1.data : stack1),{"name":"each","hash":{},"fn":this.program(24, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                </ul>\n\n";
},"24":function(depth0,helpers,partials,data) {
    var stack1;

  return "                    <li><a "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.openAccess : depth0),{"name":"if","hash":{},"fn":this.program(14, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " href=\""
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.url : depth0), depth0))
    + "\" target=\"_blank\" rel=\"noreferrer noopener\"\n                        >"
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.name : depth0), depth0))
    + "</a></li>\n";
},"26":function(depth0,helpers,partials,data) {
    return "                    <div title=\"data products (none)\">\n                        <a href=\"javascript:void(0)\" class=\"btn-link disabled\" aria-disabled=\"true\">\n                            <i class=\"s-data-icon\" aria-hidden=\"true\"></i>\n                            <span class=\"sr-only\">quick links to data associated with this article</span>\n                        </a>\n                    </div>\n\n";
},"28":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.encodedIdentifier : depth0),{"name":"if","hash":{},"fn":this.program(29, data, 0),"inverse":this.program(31, data, 0),"data":data})) != null ? stack1 : "");
},"29":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "                <a href=\"#abs/"
    + this.escapeExpression(((helper = (helper = helpers.encodedIdentifier || (depth0 != null ? depth0.encodedIdentifier : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"encodedIdentifier","hash":{},"data":data}) : helper)))
    + "/abstract\" class=\"abs-redirect-link\">\n                    <h3 class=\"s-results-title\">"
    + ((stack1 = ((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</h3>\n                </a>\n";
},"31":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "                <h3 class=\"s-results-title\">"
    + ((stack1 = ((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</h3>\n";
},"33":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "            <a href=\"#abs/"
    + this.escapeExpression(((helper = (helper = helpers.encodedIdentifier || (depth0 != null ? depth0.encodedIdentifier : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"encodedIdentifier","hash":{},"data":data}) : helper)))
    + "/abstract\" class=\"abs-redirect-link\">\n                <h3 class=\"s-results-title\">"
    + ((stack1 = ((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</h3>\n            </a>\n";
},"35":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.authorFormatted : depth0),{"name":"if","hash":{},"fn":this.program(36, data, 0),"inverse":this.program(41, data, 0),"data":data})) != null ? stack1 : "");
},"36":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <ul class=\"list-inline just-authors s-results-authors less-authors\" aria-label=\"authors\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.authorFormatted : depth0),{"name":"each","hash":{},"fn":this.program(37, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.extraAuthors : depth0),{"name":"if","hash":{},"fn":this.program(39, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            </ul>\n\n            <ul class=\"list-inline just-authors s-results-authors all-authors hidden\" aria-label=\"authors\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.allAuthorFormatted : depth0),{"name":"each","hash":{},"fn":this.program(37, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                <li>\n                    <a href=\"javascript:void(0)\" class=\"show-less-authors\">\n                        <em>show less</em>\n                    </a>\n                </li>\n            </ul>\n";
},"37":function(depth0,helpers,partials,data) {
    return "                    <li class=\"article-author\">"
    + this.escapeExpression(this.lambda(depth0, depth0))
    + "</li>\n";
},"39":function(depth0,helpers,partials,data) {
    var helper;

  return "                <li>\n                    <a href=\"javascript:void(0)\" class=\"show-all-authors\">\n                        <em>and "
    + this.escapeExpression(((helper = (helper = helpers.extraAuthors || (depth0 != null ? depth0.extraAuthors : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"extraAuthors","hash":{},"data":data}) : helper)))
    + " more</em>\n                    </a>\n                </li>\n";
},"41":function(depth0,helpers,partials,data) {
    return "                <span class=\"text-faded\">no author information available</span>\n";
},"43":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"row\">\n    <div class=\"col-sm-10 col-sm-offset-1\">\n        <div class=\"s-results-orcid-container\">\n\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.pending : stack1),{"name":"if","hash":{},"fn":this.program(44, data, 0),"inverse":this.program(46, data, 0),"data":data})) != null ? stack1 : "")
    + " <!--orcid.pending-->\n    </div>\n\n</div>\n";
},"44":function(depth0,helpers,partials,data) {
    return "            <button class=\"btn btn-default btn-sm s-orcid-loading\" aria-disabled=\"true\">\n                <i class=\"fa fa-lg fa-spinner fa-pulse\" aria-hidden=\"true\"></i> Working...\n            </button>\n";
},"46":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <!-- if provenance, it has been added by us or someone else-->\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.provenance : stack1),{"name":"if","hash":{},"fn":this.program(47, data, 0),"inverse":this.program(61, data, 0),"data":data})) != null ? stack1 : "")
    + "<!--orcid.provenance -->\n            ";
},"47":function(depth0,helpers,partials,data) {
    var stack1;

  return "\n            <div class=\""
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.error : stack1),{"name":"if","hash":{},"fn":this.program(48, data, 0),"inverse":this.program(50, data, 0),"data":data})) != null ? stack1 : "")
    + " s-orcid-alert s-orcid-provenance-"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.provenance : stack1), depth0))
    + "\" role=\"alert\">\n                <div class=\"btn-group\">\n                    <button type=\"button\" class=\"btn btn-default btn-sm dropdown-toggle\" data-toggle=\"dropdown\"\n                            aria-expanded=\"false\" "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.error : stack1),{"name":"if","hash":{},"fn":this.program(52, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n                        <img src=\"../../styles/img/orcid-active.svg\" alt=\"orcid logo active\" class=\"s-orcid-img\"/> Actions <span class=\"caret\"></span>\n                    </button>\n                    <ul class=\"dropdown-menu\" role=\"menu\">\n"
    + ((stack1 = helpers.each.call(depth0,((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.actions : stack1),{"name":"each","hash":{},"fn":this.program(54, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                        </li>\n                    </ul>\n                </div>\n\n                "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.source_name : depth0),{"name":"if","hash":{},"fn":this.program(59, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n                <span class=\"text-success s-orcid-success pull-right\"> <i class=\"icon-success\" aria-hidden=\"true\"></i>&nbsp;In ORCID&nbsp;</span>\n\n            </div>\n\n\n\n            ";
},"48":function(depth0,helpers,partials,data) {
    return "alert-danger";
},"50":function(depth0,helpers,partials,data) {
    return "alert-success";
},"52":function(depth0,helpers,partials,data) {
    var stack1;

  return "title=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.error : stack1), depth0))
    + "\"";
},"54":function(depth0,helpers,partials,data) {
    var stack1;

  return "                        <li>\n\n                            <a class=\"orcid-action "
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.action : depth0), depth0))
    + "\" data-action=\""
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.action : depth0), depth0))
    + "\"\n                               title=\""
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.caption : depth0), depth0))
    + "\">\n                                <i class=\"\n"
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.action : depth0),"orcid-update",{"name":"compare","hash":{},"fn":this.program(55, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.action : depth0),"orcid-delete",{"name":"compare","hash":{},"fn":this.program(57, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                            \" aria-hidden=\"true\"></i>\n                                "
    + this.escapeExpression(this.lambda((depth0 != null ? depth0.title : depth0), depth0))
    + "</a>\n";
},"55":function(depth0,helpers,partials,data) {
    return "                            icon-reload-c\n";
},"57":function(depth0,helpers,partials,data) {
    return "                            icon-clear-c\n";
},"59":function(depth0,helpers,partials,data) {
    var helper;

  return "<span class=\"s-orcid-source\">("
    + this.escapeExpression(((helper = (helper = helpers.source_name || (depth0 != null ? depth0.source_name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"source_name","hash":{},"data":data}) : helper)))
    + ")</span>";
},"61":function(depth0,helpers,partials,data) {
    var stack1;

  return "<!-- add this paper to ORCID-->\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.bibcode : depth0),{"name":"if","hash":{},"fn":this.program(62, data, 0),"inverse":this.program(67, data, 0),"data":data})) != null ? stack1 : "")
    + "\n\n            ";
},"62":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <button class=\"btn "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.error : stack1),{"name":"if","hash":{},"fn":this.program(63, data, 0),"inverse":this.program(65, data, 0),"data":data})) != null ? stack1 : "")
    + " btn-sm orcid-action "
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.actions : stack1)) != null ? stack1.add : stack1)) != null ? stack1.action : stack1), depth0))
    + "\"  data-action=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.actions : stack1)) != null ? stack1.add : stack1)) != null ? stack1.action : stack1), depth0))
    + "\" "
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.error : stack1),{"name":"if","hash":{},"fn":this.program(52, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">\n               <img src=\"../../styles/img/orcid-inactive.svg\" alt=\"orcid logo inactive\" class=\"s-orcid-img\" title=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.orcid : depth0)) != null ? stack1.actions : stack1)) != null ? stack1.add : stack1)) != null ? stack1.caption : stack1), depth0))
    + "\"/>\n                Claim in ORCID\n            </button>\n";
},"63":function(depth0,helpers,partials,data) {
    return "btn-danger";
},"65":function(depth0,helpers,partials,data) {
    return "btn-default";
},"67":function(depth0,helpers,partials,data) {
    return "            <div class=\"panel panel-default\" style=\"box-shadow: none\">\n                <div class=\"panel-body\">\n                    <img src=\"../../styles/img/orcid-inactive.svg\" alt=\"orcid logo inactive\" class=\"s-orcid-img\" title=\"\"/>\n                    Record not known to ADS\n                </div>\n            </div>\n";
},"69":function(depth0,helpers,partials,data) {
    var stack1;

  return "\n        <div class=\"col-xs-10 col-xs-offset-1 s-more-info\">\n"
    + ((stack1 = helpers['if'].call(depth0,(helpers.isdefined || (depth0 && depth0.isdefined) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.highlights : depth0),{"name":"isdefined","hash":{},"data":data}),{"name":"if","hash":{},"fn":this.program(70, data, 0),"inverse":this.program(76, data, 0),"data":data})) != null ? stack1 : "")
    + "        </div>\n";
},"70":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.highlights : depth0)) != null ? stack1.length : stack1),{"name":"if","hash":{},"fn":this.program(71, data, 0),"inverse":this.program(74, data, 0),"data":data})) != null ? stack1 : "");
},"71":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <h4 class=\"sr-only\">Search Highlights</h4>\n            <ul aria-label=\"search snippets\" class=\"s-search-snippets\">\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.highlights : depth0),{"name":"each","hash":{},"fn":this.program(72, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            </ul>\n\n";
},"72":function(depth0,helpers,partials,data) {
    var stack1;

  return "                <li>"
    + ((stack1 = this.lambda(depth0, depth0)) != null ? stack1 : "")
    + "</li>\n";
},"74":function(depth0,helpers,partials,data) {
    return "                <span class=\"text-muted\">No highlights</span>\n";
},"76":function(depth0,helpers,partials,data) {
    return "            <span class=\"text-muted\"><i class=\"fa fa-spinner fa-pulse\" aria-hidden=\"true\"></i> Loading Highlights...</span>\n";
},"78":function(depth0,helpers,partials,data) {
    var stack1;

  return "        <div class=\"col-xs-9 col-xs-offset-1 s-more-info\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0['abstract'] : depth0),{"name":"if","hash":{},"fn":this.program(79, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n";
},"79":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "                    <h4 aria-label=\"read full abstract below\"><a href=\"#abs/"
    + this.escapeExpression(((helper = (helper = helpers.identifier || (depth0 != null ? depth0.identifier : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"identifier","hash":{},"data":data}) : helper)))
    + "\">Abstract</a></h4>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.shortAbstract : depth0),{"name":"if","hash":{},"fn":this.program(80, data, 0),"inverse":this.program(82, data, 0),"data":data})) != null ? stack1 : "");
},"80":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "\n                    <div class=\"short-abstract\" aria-label=\"a truncated version of the abstract\">\n                        "
    + ((stack1 = ((helper = (helper = helpers.shortAbstract || (depth0 != null ? depth0.shortAbstract : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"shortAbstract","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n                        &nbsp; <button class=\"btn btn-xs btn-default show-full-abstract\">more</button>\n                    </div>\n                    <div class=\"full-abstract hidden\">\n                        "
    + ((stack1 = ((helper = (helper = helpers['abstract'] || (depth0 != null ? depth0['abstract'] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"abstract","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n                        &nbsp; <button class=\"btn btn-xs btn-default hide-full-abstract\">less</button>\n                    </div>\n";
},"82":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "                        <!--the abstract is short enough to be shown all at once-->\n                        "
    + ((stack1 = ((helper = (helper = helpers['abstract'] || (depth0 != null ? depth0['abstract'] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"abstract","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div tabindex=\"-1\" class=\"col-sm-12 "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.chosen : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\">\n<div class=\"row s-top-row\">\n    <div class=\"col-xs-1 s-checkbox-col s-top-row-col\">\n        <label>\n            <span class=\"hidden-xs\">"
    + this.escapeExpression(((helper = (helper = helpers.indexToShow || (depth0 != null ? depth0.indexToShow : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"indexToShow","hash":{},"data":data}) : helper)))
    + "</span>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.showCheckbox : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </label>\n    </div>\n\n    <div class=\"col-xs-4 col-sm-3 s-top-row-col identifier s-identifier\">\n        <a href=\"#abs/"
    + this.escapeExpression(((helper = (helper = helpers.encodedIdentifier || (depth0 != null ? depth0.encodedIdentifier : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"encodedIdentifier","hash":{},"data":data}) : helper)))
    + "/abstract\" aria-label=\"bibcode\" class=\"abs-redirect-link\">\n            "
    + this.escapeExpression(((helper = (helper = helpers.identifier || (depth0 != null ? depth0.identifier : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"identifier","hash":{},"data":data}) : helper)))
    + "\n        </a>\n    </div>\n    <div class=\"hidden-xs col-xs-1 col-md-1 col-md-offset-0 s-top-row-col\" aria-label=\"date published\">\n        "
    + this.escapeExpression(((helper = (helper = helpers.formattedDate || (depth0 != null ? depth0.formattedDate : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"formattedDate","hash":{},"data":data}) : helper)))
    + "\n    </div>\n\n    <div class=\"hidden-xs\">\n      <div class=\"col-xs-3 col-sm-5 col-md-3 s-top-row-col\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.citation_count : depth0),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\n    </div>\n\n    <div class=\"hidden-sm hidden-md hidden-lg\">\n      <div class=\"col-xs-3 col-sm-5 col-md-3 s-top-row-col text-right\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.citation_count : depth0),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\n    </div>\n\n\n\n    <div class=\"col-xs-4 col-sm-4 pull-right\">\n        <div class=\"s-results-links\">\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.links : depth0),{"name":"if","hash":{},"fn":this.program(11, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\n    </div>\n\n</div>\n<div class=\"row\">\n\n    <div class=\"col-xs-10 col-xs-offset-1\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isOrcidWidget : depth0),{"name":"if","hash":{},"fn":this.program(28, data, 0),"inverse":this.program(33, data, 0),"data":data})) != null ? stack1 : "")
    + "    </div>\n</div>\n\n<div class=\"row\">\n    <div class=\"col-xs-10 col-xs-offset-1\">\n\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.isOrcidWidget : depth0),{"name":"unless","hash":{},"fn":this.program(35, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n\n    </div>\n\n</div>\n\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.orcid : depth0),{"name":"if","hash":{},"fn":this.program(43, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n    <div class=\"row highlight-row\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.showHighlights : depth0),{"name":"if","hash":{},"fn":this.program(69, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n\n    <div class=\"row abstract-row\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.showAbstract : depth0),{"name":"if","hash":{},"fn":this.program(78, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n</div>\n";
},"useData":true});
Handlebars.registerPartial('js/widgets/list_of_things/templates/item-template', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
define('hbs!js/widgets/list_of_things/templates/pagination-partial',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "            <i class=\"icon-loading\" aria-hidden=\"true\"></i>&nbsp;Loading more papers...\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.error : depth0),{"name":"unless","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"row\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.pageData : depth0),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    <button class=\"btn btn-link\" id=\"backToTopBtn\">Top <i class=\"fa fa-caret-up\" aria-hidden=\"true\"></i></button>\n</div>\n";
},"5":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <div class=\"col-sm-12 pagination-controls s-pagination-controls\">\n        <div class=\"col-xs-5 per-page-container\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.pageData : depth0),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\n        <div class=\"col-xs-6\">\n            <nav aria-label=\"pagination controls\">\n                <ul class=\"pager\">\n                    <li class=\""
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.pageData : depth0)) != null ? stack1.previousPossible : stack1),{"name":"unless","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\"><a href=\"javascript:void(0)\" class=\"page-control previous-page\"><i class=\"fa fa-chevron-circle-left\" aria-hidden=\"true\"></i> prev</a></li>\n                    <li><input type=\"text\" value=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.pageData : depth0)) != null ? stack1.currentPage : stack1), depth0))
    + "\" class=\"form-control page-control\" style=\"display:inline-block;width:60px\" aria-label=\"set the current page\" aria-hidden=\"true\"> of "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.pageData : depth0)) != null ? stack1.totalPages : stack1), depth0))
    + "</li>\n                    <li class=\""
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.pageData : depth0)) != null ? stack1.nextPossible : stack1),{"name":"unless","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\"><a href=\"javascript:void(0)\" class=\"page-control next-page\">next <i class=\"fa fa-chevron-circle-right\" aria-hidden=\"true\"></i></a></li>\n                </ul>\n            </nav>\n\n        </div>\n    </div>\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <div class=\"form-group\">\n              <label for=\"per-page-select\" class=\"col-xs-4 control-label\" style=\"line-height: 32px;\">Per Page</label>\n              <div class=\"col-xs-8 col-sm-5\">\n                <select name=\"per-page-select\" id=\"per-page-select\" class=\"form-control\">\n                  <option value=\"25\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,((stack1 = (depth0 != null ? depth0.pageData : depth0)) != null ? stack1.perPage : stack1),25,{"name":"compare","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">25</option>\n                  <option value=\"50\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,((stack1 = (depth0 != null ? depth0.pageData : depth0)) != null ? stack1.perPage : stack1),50,{"name":"compare","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">50</option>\n                  <option value=\"100\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,((stack1 = (depth0 != null ? depth0.pageData : depth0)) != null ? stack1.perPage : stack1),100,{"name":"compare","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">100</option>\n                  <option value=\"200\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,((stack1 = (depth0 != null ? depth0.pageData : depth0)) != null ? stack1.perPage : stack1),200,{"name":"compare","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">200</option>\n                  <option value=\"500\" "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,((stack1 = (depth0 != null ? depth0.pageData : depth0)) != null ? stack1.perPage : stack1),500,{"name":"compare","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ">500</option>\n                </select>\n              </div>\n            </div>\n";
},"7":function(depth0,helpers,partials,data) {
    return "selected";
},"9":function(depth0,helpers,partials,data) {
    return " disabled ";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"row\">\n    <div class=\"col-sm-12 page-loading\" style=\"text-align:center\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.loading : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n</div>\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.query : depth0),{"name":"unless","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"useData":true});
Handlebars.registerPartial('js/widgets/list_of_things/templates/pagination-partial', t);
Handlebars.registerPartial('js/widgets/list_of_things/templates/pagination-partial', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
define('hbs!js/widgets/list_of_things/templates/results-container-template',['hbs','hbs/handlebars', 'hbs!js/widgets/list_of_things/templates/pagination-partial'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "    <div>\n      <h4 class=\"s-list-description\">"
    + this.escapeExpression(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"description","hash":{},"data":data}) : helper)))
    + "</h4>\n    </div>\n    ";
},"3":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "\n    <div>\n      <h2 class=\"s-article-title\">"
    + ((stack1 = ((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"title","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</h2>\n    </div>\n";
},"5":function(depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.citation_discrepancy : depth0),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " ";
},"6":function(depth0,helpers,partials,data) {
    var helper;

  return "\n    <div>\n      <i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>\n      This list is missing <b>"
    + this.escapeExpression(((helper = (helper = helpers.citation_discrepancy || (depth0 != null ? depth0.citation_discrepancy : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"citation_discrepancy","hash":{},"data":data}) : helper)))
    + "</b> records, which could\n      not be matched to papers in ADS.\n    </div>\n    <br />\n    ";
},"8":function(depth0,helpers,partials,data) {
    var helper;

  return "\n    <div class=\"s-operator\">\n      <a href=\""
    + this.escapeExpression(((helper = (helper = helpers.queryURL || (depth0 != null ? depth0.queryURL : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"queryURL","hash":{},"data":data}) : helper)))
    + "\" class=\"btn btn-sm btn-inverse btn-primary-faded\"\n        ><i class=\"fa fa-search\" aria-hidden=\"true\"></i> view this list in a\n        search results page</a\n      >\n    </div>\n";
},"10":function(depth0,helpers,partials,data) {
    var stack1;

  return " "
    + ((stack1 = this.invokePartial(partials['js/widgets/list_of_things/templates/pagination-partial'],depth0,{"name":"js/widgets/list_of_things/templates/pagination-partial","data":data,"helpers":helpers,"partials":partials})) != null ? stack1 : "")
    + " ";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"s-list-controls\">\n  <div class=\"s-results-border-bottom\">\n    <div class=\"col-sm-1\"></div>\n\n    <div class=\"col-sm-6\"></div>\n\n    <div class=\"col-sm-4 sort-container\"></div>\n\n    <div class=\"col-sm-1\"></div>\n  </div>\n\n  <div class=\"s-list-title\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.description : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.title : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n    <!--citation widget should show info if [citations] and citation_count don't match-->\n    "
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.queryOperator : depth0),"citations",{"name":"compare","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + " "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.queryOperator : depth0),{"name":"if","hash":{},"fn":this.program(8, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  </div>\n\n  <ul\n    class=\"results-list  s-results-list list-unstyled s-display-block\"\n    aria-label=\"list of results\"\n  ></ul>\n\n  "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.pagination : depth0),{"name":"if","hash":{},"fn":this.program(10, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n</div>\n";
},"usePartial":true,"useData":true});
Handlebars.registerPartial('js/widgets/list_of_things/templates/results-container-template', t);
return t;
});
/* END_TEMPLATE */
;
define('js/widgets/list_of_things/model',['backbone', 'underscore', 'js/mixins/add_stable_index_to_collection'], function (Backbone, _, WidgetPaginationMixin) {
  var ItemModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        abstract: undefined,
        title: undefined,
        authorAff: undefined,
        pub: undefined,
        pubdate: undefined,
        keywords: undefined,
        bibcode: undefined,
        pub_raw: undefined,
        doi: undefined,
        details: undefined,
        links_data: undefined,
        resultsIndex: undefined,
        visible: false,
        actionsVisible: true,
        showCheckbox: true
      };
    },
    idAttribute: 'resultsIndex'
  });
  var ListOfThingsCollection = Backbone.Collection.extend({
    initialize: function initialize(models, options) {
      this.numVisible = 0;
      this.currentStartIndex = 0;
      this.currentEndIndex = 0;
      this.lastIndex = -1;
      this.lastMissingTrigger = null;

      if (options && options.paginationModel) {
        this.paginationModel = options.paginationModel;
        this.listenTo(this.paginationModel, 'change:page', this._onPaginationChange);
        this.listenTo(this.paginationModel, 'change:perPage', this._onPaginationChange);
      }
    },
    model: ItemModel,
    numFound: undefined,
    comparator: 'resultsIndex',
    _updateStartAndEndIndex: function _updateStartAndEndIndex() {
      var pageNum = this.paginationModel.get('page');
      var perPage = this.paginationModel.get('perPage');
      var numFound = this.paginationModel.get('numFound'); // used as a metric to see if we need to fetch new data or if data at these indexes
      // already exist

      this.currentStartIndex = this.getPageStart(pageNum, perPage);
      this.currentEndIndex = this.getPageEnd(pageNum, perPage, numFound);
    },
    _onPaginationChange: function _onPaginationChange() {
      this._updateStartAndEndIndex(); // propagate the signal to the controller


      this.trigger('pagination:change');
    },

    /*
     * need to reset lastMissingTrigger
     * or else subsequent pagination attempts
     * will never fetch beyond 25 records
     * */
    reset: function reset() {
      this.lastMissingTrigger = null;
      this.lastIndex = -1;
      Backbone.Collection.prototype.reset.apply(this, arguments);
    },
    getStartIndex: function getStartIndex() {
      return this.currentStartIndex;
    },
    getEndIndex: function getEndIndex() {
      return this.paginationModel.get('perPage');
    },
    _incrementLastIndex: function _incrementLastIndex() {
      this.lastIndex += 1;
      return this.lastIndex;
    },
    _prepareModel: function _prepareModel(attrs, options) {
      if (attrs.resultsIndex === undefined) {
        attrs.resultsIndex = this._incrementLastIndex();
      }

      if (attrs.title || attrs.bibcode || attrs.identifier) {
        attrs.emptyPlaceholder = false;
      }

      return Backbone.Collection.prototype._prepareModel.call(this, attrs, options);
    },
    getVisibleModels: function getVisibleModels() {
      return _.filter(this.models, function (x) {
        return x.attributes.visible;
      });
    },

    /**
     * Zero-based method; goes through models in the collection; discovers those
     * that are missing (in the given range) and marks the range as 'visible'
     * It returns number of visible documents (and internally triggers 'show:missing'
     * event)
     *
     * @param start
     * @param end
     * @param options
     * @returns {number}
     */
    updateIndexes: function updateIndexes(start, end, options) {
      options = options || {};
      var start = _.isNumber(start) ? start : this.currentStartIndex;
      var end = _.isNumber(end) ? end : this.currentEndIndex + 1;
      var visible = 0;
      var currStart = null;
      var currEnd = 0;
      var gaps = [];
      var lastIdx = null;
      var rIdx;
      this.each(function (model) {
        rIdx = model.attributes.resultsIndex;

        if (lastIdx !== null && rIdx != lastIdx + 1) {
          _.each(_.range(lastIdx + 1, rIdx), function (c) {
            gaps.push(c);
          });
        }

        lastIdx = rIdx;

        if (rIdx >= start && rIdx <= end) {
          model.set('visible', true);
          if (currStart === null) currStart = rIdx;
          visible += 1;
          currEnd = rIdx;
        } else {
          model.set('visible', false);
        }
      });

      if (visible !== end - start + 1) {
        _.each(_.range((lastIdx || start + gaps.length) + 1, end + 1), function (c) {
          if (!this.get(c)) gaps.push(c);
        }, this);
      }

      if (gaps.length) {
        // we have discoverd all gaps, but we want to report only those that span the start..end range
        var startIdx = 0;
        var endIdx = gaps.length;

        for (var i = 0; i < gaps.length; i++) {
          if (gaps[i] > end) {
            endIdx = i;
            break;
          }

          if (gaps[i] < start) {
            startIdx = i + 1;
          }
        }

        gaps = gaps.slice(startIdx, endIdx);
        gaps = this._compressGaps(gaps); // to prevent multiple recursive requests

        if (JSON.stringify(gaps) != this.lastMissingTrigger) {
          this.lastMissingTrigger = JSON.stringify(gaps);

          if (!options.silent) {
            this.trigger('show:missing', gaps);
          }
        }
      }

      this.numVisible = visible;
      this.currentStartIndex = currStart || 0;
      this.currentEndIndex = currEnd;
      return visible;
    },
    _compressGaps: function _compressGaps(gaps) {
      var leftBound = gaps[0];
      var rightBound = leftBound;
      var s = gaps.length;
      var toSend = [];

      for (var i = 0; i < s; i++) {
        var j = i + 1;

        while (j < s && gaps[j] == leftBound + (j - i)) {
          rightBound = gaps[j];
          j += 1;
        }

        toSend.push({
          start: leftBound,
          end: rightBound
        });
        i = j - 1;
        if (j < s) leftBound = rightBound = gaps[j];
      }

      return toSend;
    },

    /**
     * zero-based method to mark range of documents in the colleaction 'visible'
     *
     * @param start
     * @param end
     * @returns {*}
     */
    showRange: function showRange(start, end, options) {
      options = options || {};
      if (start < 0) throw new Error('Start cannot be negative');
      if (end < start) throw new Error('End cannot be smaller than start');
      return this.updateIndexes(start, end, options);
    },
    getNumVisible: function getNumVisible() {
      return this.numVisible;
    },
    showMore: function showMore(howMany) {
      if (howMany === null) {
        // set all of them visible
        return this.updateIndexes(0, this.model.length);
      }

      var visible = this.getNumVisible();
      return this.updateIndexes(this.currentStartIndex, this.currentEndIndex == 0 ? howMany - 1 : this.currentEndIndex + howMany) - visible;
    }
  });

  _.extend(ListOfThingsCollection.prototype, WidgetPaginationMixin);

  return ListOfThingsCollection;
});


/* START_TEMPLATE */
define('hbs!js/widgets/list_of_things/templates/empty-view-template',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "  <div>\n    Using the ADS classic query translator? view the\n    <a\n      href=\"/help/faq/#classic-search-translator\"\n      rel=\"noreferrer noopener\"\n      target=\"_blank\"\n      >docs</a\n    >.\n  </div>\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return "  <ul>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.suggestedQuery : depth0),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    <li>Try broadening your search</li>\n    <li>Disable any filters that may be applied</li>\n    <li><a href=\"#\">Check out some examples</a></li>\n    <li>\n      <a\n        href=\"/help/search/search-syntax\"\n        target=\"_blank\"\n        rel=\"noreferrer noopener\"\n        >Read our help pages</a\n      >\n    </li>\n  </ul>\n  <span>\n    Not seeing something that should be here? Let us know!\n    <button\n      class=\"btn btn-primary-faded results-feedback-button\"\n      data-toggle=\"modal\"\n      data-target=\"#feedback-modal\"\n      data-feedback-view=\"general\"\n    >\n      <i class=\"fa fa-comment\" aria-hidden=\"true\"></i>\n      Leave Feedback\n    </button>\n  </span>\n";
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <li>\n      Try an alternate query:\n      <a href=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.suggestedQuery : depth0)) != null ? stack1.url : stack1), depth0))
    + "\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.suggestedQuery : depth0)) != null ? stack1.query : stack1), depth0))
    + "</a>\n    </li>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"s-empty-view-msg\">\n  <div class=\"h4\">Sorry no results were found for <code>"
    + this.escapeExpression(((helper = (helper = helpers.query || (depth0 != null ? depth0.query : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"query","hash":{},"data":data}) : helper)))
    + "</code></div>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.showTugboatMessage : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "</div>\n";
},"useData":true});
Handlebars.registerPartial('js/widgets/list_of_things/templates/empty-view-template', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
define('hbs!js/widgets/list_of_things/templates/error-view-template',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"container-fluid\">\n  <div class=\"row text-center\">\n    <span class=\"fa-stack fa-lg text-danger\">\n      <i class=\"fa fa-stack-2x fa-circle-o\" aria-hidden=\"true\"></i>\n      <i class=\"fa fa-stack-1x fa-exclamation\" aria-hidden=\"true\"></i>\n    </span>\n  </div>\n  <div class=\"row text-center\">\n    <div class=\"h4\">\n      Something Went Wrong\n    </div>\n    <div class=\"h4\">\n      Please Retry Your Search\n    </div>\n  </div>\n</div>\n";
},"useData":true});
Handlebars.registerPartial('js/widgets/list_of_things/templates/error-view-template', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
define('hbs!js/widgets/list_of_things/templates/initial-view-template',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "Requesting data...";
},"useData":true});
Handlebars.registerPartial('js/widgets/list_of_things/templates/initial-view-template', t);
return t;
});
/* END_TEMPLATE */
;
define('js/widgets/list_of_things/item_view',['marionette', 'backbone', 'js/components/api_request', 'js/components/api_query', 'js/widgets/base/base_widget', 'hbs!js/widgets/list_of_things/templates/item-template', 'analytics', 'mathjax'], function (Marionette, Backbone, ApiRequest, ApiQuery, BaseWidget, ItemTemplate, analytics, MathJax) {
  var ItemView = Marionette.ItemView.extend({
    tagName: 'li',
    template: ItemTemplate,
    constructor: function constructor(options) {
      var self = this;

      if (options) {
        _.defaults(options, _.pick(this, ['model', 'collectionEvents', 'modelEvents']));
      }

      _.bindAll(this, 'resetToggle');

      return Marionette.ItemView.prototype.constructor.apply(this, arguments);
    },
    render: function render() {
      if (this.model.get('visible')) {
        return Marionette.ItemView.prototype.render.apply(this, arguments);
      }

      if (this.$el) {
        // it was already rendered, so remove it
        this.$el.empty();
      }

      return this;
    },
    onRender: function onRender() {
      var _this = this;

      // this is necessary on every render after the initial one, since the
      // containe rview also calls mathjax initially
      if (MathJax) MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.el]);
      $('>', this.$el).on('keyup', function (e) {
        if (e.which === 13) {
          $('a.abs-redirect-link', _this.$el).mousedown().mouseup().click();
        }
      });
    },
    events: {
      'change input[name=identifier]': 'toggleSelect',
      'focus .letter-icon': 'showLinks',
      'mouseenter .letter-icon': 'showLinks',
      'mouseleave .letter-icon': 'hideLinks',
      'focusout .letter-icon': 'hideLinks',
      'click .letter-icon a': 'emitAnalyticsEvent',
      'click .show-all-authors': 'showAllAuthors',
      'click .show-less-authors': 'showLessAuthors',
      // only relevant to results view for the moment
      'click .show-full-abstract': 'showFullAbstract',
      'click .hide-full-abstract': 'hideFullAbstract',
      'click .orcid-action': 'orcidAction',
      'click .abs-redirect-link': 'onAbsLinkClick',
      'click .citations-redirect-link': 'onCitationsLinkClick'
    },
    modelEvents: {
      'change:visible': 'render',
      'change:showAbstract': 'render',
      'change:showHighlights': 'render',
      'change:orcid': 'render',
      'change:chosen': 'render'
    },
    collectionEvents: {
      add: 'render',
      'change:visible': 'render'
    },
    emitAnalyticsEvent: function emitAnalyticsEvent(e) {
      analytics('send', 'event', 'interaction', 'letter-link-followed', $(e.target).text());
    },
    onAbsLinkClick: function onAbsLinkClick(e) {
      var bibcode = this.model.get('bibcode');
      analytics('send', 'event', 'interaction', 'abstract-link-followed', {
        target: 'abstract',
        bibcode: bibcode
      });
    },
    onCitationsLinkClick: function onCitationsLinkClick(e) {
      var bibcode = this.model.get('bibcode');
      analytics('send', 'event', 'interaction', 'citations-link-followed', {
        target: 'citations',
        bibcode: bibcode
      });
    },
    showAllAuthors: function showAllAuthors(e) {
      this.$('.s-results-authors.less-authors').addClass('hidden');
      this.$('.s-results-authors.all-authors').removeClass('hidden');
      return false;
    },
    showLessAuthors: function showLessAuthors(e) {
      this.$('.s-results-authors.less-authors').removeClass('hidden');
      this.$('.s-results-authors.all-authors').addClass('hidden');
      return false;
    },
    showFullAbstract: function showFullAbstract() {
      this.$('.short-abstract').addClass('hidden');
      this.$('.full-abstract').removeClass('hidden');
      return false;
    },
    hideFullAbstract: function hideFullAbstract() {
      this.$('.short-abstract').removeClass('hidden');
      this.$('.full-abstract').addClass('hidden');
      return false;
    },
    toggleSelect: function toggleSelect() {
      var isChosen = !this.model.get('chosen');
      this.trigger('toggleSelect', {
        selected: isChosen,
        data: this.model.attributes
      });
      this.model.set('chosen', isChosen);
    },
    resetToggle: function resetToggle() {
      this.setToggleTo(false);
    },
    setToggleTo: function setToggleTo(to) {
      var $checkbox = $('input[name=identifier]');

      if (to) {
        this.$el.addClass('chosen');
        this.model.set('chosen', true);
        $checkbox.prop('checked', true);
      } else {
        this.$el.removeClass('chosen');
        this.model.set('chosen', false);
        $checkbox.prop('checked', false);
      }
    },

    /*
     * adding this to make the dropdown
     * accessible, and so people can click to sticky
     * open the quick links
     * */
    removeActiveQuickLinkState: function removeActiveQuickLinkState($node) {
      $node.find('i').removeClass('s-icon-draw-attention');
      $node.find('.link-details').addClass('hidden');
      $node.find('ul').attr('aria-expanded', false);
    },
    addActiveQuickLinkState: function addActiveQuickLinkState($node) {
      $node.find('i').addClass('s-icon-draw-attention');
      $node.find('.link-details').removeClass('hidden');
      $node.find('ul').attr('aria-expanded', true);
    },
    deactivateOtherQuickLinks: function deactivateOtherQuickLinks($c) {
      var $hasList = this.$('.letter-icon').filter(function () {
        if ($(this).find('i').hasClass('s-icon-draw-attention')) {
          return true;
        }
      }).eq(0); // there should be max 1 other icon that is active

      if ($hasList.length && $hasList[0] !== $c[0]) {
        this.removeActiveQuickLinkState($hasList);
      }
    },
    showLinks: function showLinks(e) {
      var $c = $(e.currentTarget);

      if (!$c.find('.active-link').length) {
        return;
      }

      this.deactivateOtherQuickLinks($c);
      this.addActiveQuickLinkState($c);
    },
    hideLinks: function hideLinks(e) {
      var $c = $(e.currentTarget);
      this.removeActiveQuickLinkState($c);
    },
    orcidAction: function orcidAction(e) {
      if (!e) return false;
      var $target = $(e.currentTarget);
      var msg = {
        action: $target.data('action') ? $target.data('action') : $target.text().trim(),
        model: this.model,
        view: this,
        target: $target
      };
      this.trigger('OrcidAction', msg);
      return false;
    }
  });
  return ItemView;
});


/* START_TEMPLATE */
define('hbs!js/wraps/widget/loading/template',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "  <div class=\"close-widget close-circle\">\n    <a href=\"javascript:void(0)\"\n      ><i class=\"fa fa-times fa-lg\" aria-hidden=\"true\"></i\n    ></a>\n  </div>\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"loading-container\">\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.hideCloseButton : depth0),{"name":"unless","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  <div class=\"loading\">\n    <div\n      class=\"loading-icon-"
    + this.escapeExpression(((helper = (helper = helpers.widgetLoadingSize || (depth0 != null ? depth0.widgetLoadingSize : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"widgetLoadingSize","hash":{},"data":data}) : helper)))
    + " fa fa-spinner fa-spin\"\n      aria-hidden=\"true\"\n    ></div>\n    <div class=\"loading-text loading-text-"
    + this.escapeExpression(((helper = (helper = helpers.widgetLoadingSize || (depth0 != null ? depth0.widgetLoadingSize : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"widgetLoadingSize","hash":{},"data":data}) : helper)))
    + "\">\n      Loading...\n    </div>\n  </div>\n</div>\n";
},"useData":true});
Handlebars.registerPartial('js/wraps/widget/loading/template', t);
return t;
});
/* END_TEMPLATE */
;
/**
 * Paginated view - it displays controls under the list of items.
 *
 */
define('js/widgets/list_of_things/paginated_view',['underscore', 'marionette', 'backbone', 'js/components/api_request', 'js/components/api_query', 'js/widgets/base/base_widget', 'hbs!js/widgets/list_of_things/templates/item-template', 'hbs!js/widgets/list_of_things/templates/results-container-template', 'js/mixins/link_generator_mixin', 'js/mixins/add_stable_index_to_collection', 'hbs!js/widgets/list_of_things/templates/empty-view-template', 'hbs!js/widgets/list_of_things/templates/error-view-template', 'hbs!js/widgets/list_of_things/templates/initial-view-template', './item_view', 'analytics', 'mathjax', 'hbs!js/wraps/widget/loading/template'], function (_, Marionette, Backbone, ApiRequest, ApiQuery, BaseWidget, ItemTemplate, ResultsContainerTemplate, LinkGenerator, WidgetPaginationMixin, EmptyViewTemplate, ErrorViewTemplate, InitialViewTemplate, ItemView, analytics, MathJax, loadingTemplate) {
  /**
   * A simple model that holds attributes of the
   * paginated view. Changes in this model are
   * propagated to the view
   */
  var MainViewModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        mainResults: false,
        title: undefined,
        // assuming there will always be abstracts
        showAbstract: 'closed',
        // often they won't exist
        showHighlights: false,
        showSidebars: true,
        pagination: true,
        start: 0,
        highlightsLoaded: false
      };
    }
  });

  var getSuggestedQuery = function getSuggestedQuery(_query) {
    var query = _query.clone();

    var q = query.get('q'); // if the whole query is uppercase, lower it

    if (q[0] === q[0].toUpperCase()) {
      query.set('q', q[0].toLowerCase());
      query.unset('fl');
      return {
        url: '#search/' + query.url(),
        query: query.get('q')
      };
    }
  };

  var EmptyView = Marionette.ItemView.extend({
    template: function template(data) {
      if (data.query) {
        return EmptyViewTemplate(data);
      }

      if (data.error) {
        return ErrorViewTemplate(data);
      }

      return loadingTemplate(_.extend(data, {
        widgetLoadingSize: 'big',
        hideCloseButton: true
      }));
    }
  });
  /**
   * This is the main view of the list of things. A composite
   * view that holds collection of items.
   */

  var ListOfThingsView = Marionette.CompositeView.extend({
    childView: ItemView,
    emptyView: EmptyView,
    initialize: function initialize(options) {
      this.model = new MainViewModel();
    },
    serializeData: function serializeData() {
      var data = this.model.toJSON(); // if it's an abstract page list with an 'export to results page'
      // option, provide the properly escaped url

      if (data.queryOperator) {
        data.queryURL = '#search/q=' + data.queryOperator + '(';
        data.queryURL += encodeURIComponent('bibcode:' + data.bibcode) + ')';
        if (data.removeSelf) data.queryURL += encodeURIComponent(' -bibcode:' + data.bibcode);
        if (data.sortOrder) data.queryURL += '&sort=' + encodeURIComponent(data.sortOrder);
      }

      return data;
    },
    onRender: function onRender() {
      if (MathJax) {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.el]);
      }
    },
    className: 'list-of-things',
    alreadyRendered: false,
    emptyViewOptions: function emptyViewOptions(model) {
      var query = this.model.get('query');
      var isTugboat = this.model.get('isTugboat');
      var error = this.model.get('error');
      this.model.unset('error', {
        silent: true
      });

      if (_.isArray(query)) {
        model.set({
          query: query[0],
          showTugboatMessage: isTugboat,
          suggestedQuery: getSuggestedQuery(this.model.get('currentQuery'))
        });
      } else if (_.has('query', query)) {
        model.set({
          query: query.query[0],
          showTugboatMessage: isTugboat,
          suggestedQuery: getSuggestedQuery(this.model.get('currentQuery'))
        });
      } else if (error) {
        model.set('error', error);
      }

      return {
        model: model
      };
    },
    childViewContainer: '.results-list',
    events: {
      'click .show-highlights': 'toggleHighlights',
      'click .show-abstract': 'toggleAbstract',
      'click .toggle-sidebars': 'toggleShowSidebars',
      'click #go-to-bottom': 'goToBottom',
      'click #backToTopBtn': 'goToTop',
      'click a.page-control': 'changePageWithButton',
      'keyup input.page-control': 'tabOrEnterChangePageWithInput',
      'change #per-page-select': 'changePerPage'
    },
    toggleHighlights: function toggleHighlights(e) {
      var state = this.model.get('showHighlights');
      state = _.isBoolean(state) && state ? 'closed' : state === 'open' ? 'closed' : 'open';
      this.model.set('showHighlights', state);

      if (!this.model.get('highlightsLoaded')) {
        this.model.set('highlightsLoaded', true);
        this.trigger('toggle-highlights', state === 'open');
      }
    },
    toggleAbstract: function toggleAbstract() {
      if (this.model.get('showAbstract') == 'open') {
        this.model.set('showAbstract', 'closed');
      } else if (this.model.get('showAbstract') == 'closed') {
        this.model.set('showAbstract', 'open');
        analytics('send', 'event', 'interaction', 'abstracts-toggled-on');
      }
    },
    toggleShowSidebars: function toggleShowSidebars() {
      var val = !this.model.get('showSidebars');
      this.model.set('showSidebars', val);
      analytics('send', 'event', 'interaction', 'sidebars-toggled-' + val ? 'on' : 'off');
    },
    goToBottom: function goToBottom() {
      $(document.documentElement).animate({
        scrollTop: this.$el.outerHeight()
      }, 'fast');
    },
    goToTop: function goToTop() {
      $(document.documentElement).animate({
        scrollTop: 0
      }, 'fast');
    },
    modelEvents: {
      change: 'render',
      'change:showHighlights': 'toggleChildrenHighlights',
      'change:showAbstract': 'toggleChildrenAbstracts'
    },
    collectionEvents: {
      reset: 'onResetCollection'
    },
    template: ResultsContainerTemplate,
    onResetCollection: function onResetCollection() {
      this.model.set('highlightsLoaded', false);
      this.model.trigger('change:showAbstract');
    },

    /**
     * Displays the are inside of every item-view
     * with details (this place is normally hidden
     * by default)
     */
    toggleChildrenHighlights: function toggleChildrenHighlights() {
      var show = this.model.get('showHighlights');
      this.collection.invoke('set', 'showHighlights', show === 'open');
    },
    toggleChildrenAbstracts: function toggleChildrenAbstracts() {
      var show = this.model.get('showAbstract');
      this.collection.invoke('set', 'showAbstract', show === 'open');
    },
    changePageWithButton: function changePageWithButton(e) {
      var $target = $(e.currentTarget);
      if ($target.parent().hasClass('disabled')) return;
      var transform = $target.hasClass('next-page') ? 1 : -1;
      var pageVal = this.model.get('page') + transform;
      this.trigger('pagination:select', pageVal);

      if (this.resultsWidget) {
        analytics('send', 'event', 'interaction', 'results-list-pagination', pageVal);
      }

      return false;
    },
    tabOrEnterChangePageWithInput: function tabOrEnterChangePageWithInput(e) {
      // subtract one since pages are 0 indexed
      var pageVal = parseInt($(e.target).val() - 1); // enter or tab

      if (e.keyCode == 13 || e.keyCode == 9) {
        this.trigger('pagination:select', pageVal);
      }

      if (this.resultsWidget) {
        analytics('send', 'event', 'interaction', 'results-list-pagination', pageVal);
      }
    },
    changePerPage: function changePerPage(e) {
      var val = parseInt(e.currentTarget ? e.currentTarget.value : 25);
      val !== this.model.get('perPage') && this.trigger('pagination:changePerPage', val);
      return false;
    }
  });
  return ListOfThingsView;
});

/**
 * This widget can paginate through a list of results. It can easily be inherited
 * by results widget ,table of contents widget, etc. It either listens to INVITING_REQUEST
 * in the case of the results widget, or the loadBibcode method (currently all other widgets).
 *
 * This widget consists of the following components:
 *
 * 1. a pagination view (you can choose from expanding view or paginated view [default])
 * 2. an associated pagination model (all pagination info is kept here and only here)
 * 3. a list view that listens to the visible records and renders them
 * 4. an item view for each record rendered repeatedly by the list view
 * 5. a controller that handles requesting and recieving data from pubsub and initializing everything
 *
 */
define('js/widgets/list_of_things/widget',['marionette', 'backbone', 'utils', 'js/components/api_request', 'js/components/api_query', 'js/components/api_feedback', 'js/widgets/base/base_widget', 'hbs!js/widgets/list_of_things/templates/item-template', 'hbs!js/widgets/list_of_things/templates/results-container-template', 'js/mixins/add_stable_index_to_collection', './model', './paginated_view'], function (Marionette, Backbone, utils, ApiRequest, ApiQuery, ApiFeedback, BaseWidget, ItemTemplate, ResultsContainerTemplate, PaginationMixin, PaginatedCollection, PaginatedView) {
  var ListOfThingsWidget = BaseWidget.extend({
    initialize: function initialize(options) {
      var _this = this;

      options = options || {};

      _.defaults(options, _.pick(this, ['view', 'collection', 'pagination', 'model', 'description', 'childView'])); // widget.reset will restore these default pagination settings
      // for now, it doesn't make sense to pass them as options
      // since localStorage perPage will override it anyway
      // this functions as model.defaults while allowing the inheriting
      // widgets to provide their own models with their own defaults


      this.pagination = {
        pagination: true,
        // default per page : 25
        perPage: 25,
        numFound: undefined,
        currentQuery: undefined,
        start: 0,
        pageData: undefined,
        focusedIndex: -1
      };
      options.collection = options.collection || new PaginatedCollection();

      if (!options.view) {
        // operator instructs view to show a link that has citations:(bibcode) or something similar
        options.view = new PaginatedView({
          collection: options.collection,
          model: options.model,
          childView: options.childView
        });
      }

      options.view.model.set(this.pagination, {
        silent: true
      });
      options.view.model.set({
        // for the template button that opens search in search results page
        sortOrder: options.sortOrder,
        removeSelf: options.removeSelf,
        queryOperator: options.queryOperator,
        description: options.description
      }, {
        silent: true
      });

      _.extend(this, {
        model: options.view.model,
        view: options.view
      }); // this is the hidden collection (just to hold data)


      this.hiddenCollection = new PaginatedCollection(); // XXX:rca - start using modelEvents, instead of all....

      this.listenTo(this.hiddenCollection, 'all', this.onAllInternalEvents);
      this.listenTo(this.view, 'all', this.onAllInternalEvents);
      this.on('all', this.onAllInternalEvents);
      this.model.on('change:page', function () {
        _this.model.set('focusedIndex', -1, {
          silent: true
        });
      });
      this.changePage = _.debounce(this.changePage.bind(this), 500);
      BaseWidget.prototype.initialize.call(this, options);
    },
    // this must be extended by inheriting widgets to listen to display events
    activate: function activate(beehive) {
      var _this2 = this;

      this.setBeeHive(beehive);

      _.bindAll(this, ['updatePaginationPreferences']);

      var ps = this.getPubSub();

      if (this.getBeeHive().getObject('User') && this.getBeeHive().getObject('User').getLocalStorage) {
        var perPage = this.getBeeHive().getObject('User').getLocalStorage().perPage;

        if (perPage) {
          // set the pagination perPage value to whatever is in local storage,
          // otherwise it will be the default val from the initialize function
          this.pagination.perPage = perPage;
          this.model.set(this.pagination);
        }
      }

      ps.subscribe(ps.INVITING_REQUEST, function () {
        _this2.updateState(_this2.STATES.LOADING);
      });
      this.activateWidget();
      this.attachGeneralHandler(this.onApiFeedback);
      ps.subscribe(ps.USER_ANNOUNCEMENT, this.updatePaginationPreferences);
      ps.subscribe(ps.CUSTOM_EVENT, function (event) {
        if (event === 'hotkey/next') {
          _this2.changePage(1);
        } else if (event === 'hotkey/prev') {
          _this2.changePage(-1);
        } else if (event === 'hotkey/item-next') {
          _this2.changeItemFocus(1);
        } else if (event === 'hotkey/item-prev') {
          _this2.changeItemFocus(-1);
        } else if (event === 'hotkey/item-select') {
          _this2.selectItem();
        }
      });
    },
    selectItem: function selectItem() {
      var idx = this.model.get('focusedIndex');

      if (idx >= 0) {
        var view = this.view.children.findByIndex(idx);

        if (view && view.toggleSelect) {
          view.toggleSelect();
        }
      }
    },
    changeItemFocus: function changeItemFocus(change) {
      var len = this.view.children.length;
      var focusedIndex = this.model.get('focusedIndex');

      if (focusedIndex <= 0 && change === -1) {
        focusedIndex = len - 1;
      } else if (focusedIndex === len - 1 && change === 1) {
        focusedIndex = 0;
      } else {
        focusedIndex += change;
      }

      this.model.set('focusedIndex', focusedIndex, {
        silent: true
      });
      var view = this.view.children.findByIndex(focusedIndex);

      if (view && view.el) {
        $('>', view.el).focus();
      }
    },
    changePage: function changePage(change) {
      this.updatePagination({
        page: (this.model.get('page') || 0) + change
      });
    },
    onApiFeedback: function onApiFeedback(feedback) {
      if (feedback.error) {
        this.view.model.set('error', feedback.error);
        this.updateState(this.STATES.ERRORED);
      }
    },
    updatePaginationPreferences: function updatePaginationPreferences(event, data) {
      if (event == 'user_info_change' && data.perPage && data.perPage !== this.pagination.perPage) {
        // update per-page value
        this.updatePagination({
          perPage: data.perPage
        });
      }
    },

    /**
     * Get the current query from either our own apiResponse or from
     * the application local storage
     *
     * @param {ApiResponse} apiResponse - the response from the api
     * @returns {string} - the query string
     * @private
     */
    _getCurrentQueryString: function _getCurrentQueryString(apiResponse) {
      var q = '';
      var res = apiResponse || this.getBeeHive().getObject('AppStorage').getCurrentQuery(); // check for simbids

      if (!_.isUndefined(res)) {
        q = res.getApiQuery().get('q'); // if there is a simbid, look to see if there is a translated string

        if (_.isEmpty(q) || q[0].indexOf('simbid') > -1) {
          try {
            q = [res.get('responseHeader.params.__original_query')];
          } catch (err) {
            // No original query present in responseHeader, this may be a biblib and not a solr request
            q = '';
          }
        }
      }

      return q;
    },
    processResponse: function processResponse(apiResponse) {
      var docs = this.extractDocs(apiResponse);
      var numFound = apiResponse.has('response.numFound') ? apiResponse.get('response.numFound') : this.hiddenCollection.length;
      var start = apiResponse.has('response.start') ? apiResponse.get('response.start') : this.model.get('start');
      var pagination = this.getPaginationInfo(apiResponse, docs);
      docs = this.processDocs(apiResponse, docs, pagination);
      var self = this;

      if (docs && docs.length) {
        // make sure the new docs close highlights if they aren't there
        var newDocs = _.map(docs, function (d) {
          return _.extend(d, {
            showHighlights: typeof d.highlights !== 'undefined',
            showCheckbox: !!self.model.get('showCheckboxes')
          });
        });

        this.hiddenCollection.add(newDocs, {
          merge: true
        }); // finally, if there aren't any highlights, close the button

        var hasHighlights = this.hiddenCollection.filter(function (m) {
          return m.get('highlights');
        });

        if (hasHighlights.length === 0) {
          this.view.model.set('showHighlights', 'closed');
        }

        if (pagination.showRange) {
          // we must update the model before updating collection because the showRange
          // can automatically start fetching documents
          this.model.set(pagination);
          this.hiddenCollection.showRange(pagination.showRange[0], pagination.showRange[1]);
        }

        this.view.collection.reset(this.hiddenCollection.getVisibleModels());
        this.view.model.set('query', false);
      } else {
        var params = apiResponse.get('responseHeader.params');
        this.view.model.set({
          isTugboat: !!params.__tb,
          query: this._getCurrentQueryString(apiResponse),
          currentQuery: apiResponse.getApiQuery()
        });
      } // XXX:rca - hack, to be solved later


      this.trigger('page-manager-event', 'widget-ready', {
        numFound: numFound
      });
      var allLoaded = this.model.has('perPage') && this.model.get('perPage') === this.collection.length;
      var isLastPage = this.model.has('pageData') && this.model.get('pageData').nextPossible === false;
      var noItems = this.view.collection.length === 0; // finally, loading view (from pagination template) can be removed or added

      if (noItems || allLoaded || isLastPage && numFound <= start + docs.length) {
        this.model.set('loading', false);
        this.updateState(this.STATES.IDLE);
      } else {
        this.model.set('loading', true);
      }
    },
    extractDocs: function extractDocs(apiResponse) {
      var docs = apiResponse.get('response.docs');
      docs = _.map(docs, function (d) {
        d.all_ids = d.identifier;

        if (d.bibcode) {
          d.original_identifier = d.identifier;
          d.identifier = d.bibcode ? d.bibcode : d.identifier;
        }

        return d;
      });
      return docs;
    },
    getPaginationInfo: function getPaginationInfo(apiResponse, docs) {
      var q = apiResponse.getApiQuery(); // this information is important for calculation of pages

      var numFound = apiResponse.get('response.numFound') || 0;
      var perPage = this.model.get('perPage') || (q.has('rows') ? q.get('rows')[0] : 10);
      var start = this.model.get('start') || 0; // compute the page number of this request

      var page = PaginationMixin.getPageVal(start, perPage); // compute which documents should be made visible

      var showRange = [page * perPage, (page + 1) * perPage - 1]; // means that we were fetching the missing documents (to fill gaps in the collection)

      var fillingGaps = q.has('__fetch_missing');

      if (fillingGaps) {
        return {
          start: start,
          showRange: showRange
        };
      }

      var pageData = this._getPaginationData(page, perPage, numFound);

      return {
        numFound: numFound,
        perPage: perPage,
        start: start,
        page: page,
        showRange: showRange,
        pageData: pageData,
        currentQuery: q
      };
    },

    /*
     * data for the page numbers template at the bottom
     * */
    _getPaginationData: function _getPaginationData(page, perPage, numFound) {
      // page is zero indexed
      return {
        // copying this here for convenience
        perPage: perPage,
        totalPages: Math.ceil(numFound / perPage),
        currentPage: page + 1,
        previousPossible: page > 0,
        nextPossible: (page + 1) * perPage < numFound
      };
    },
    processDocs: function processDocs(apiResponse, docs, paginationInfo) {
      if (!apiResponse.has('response')) return [];
      var params = apiResponse.get('response');
      var start = params.start || paginationInfo.start || 0;
      docs = PaginationMixin.addPaginationToDocs(docs, start);
      return docs;
    },
    defaultQueryArguments: {
      fl: 'id',
      start: 0
    },

    /*
     * right now only perPage value can be updated by list of things
     * */
    updateLocalStorage: function updateLocalStorage(options) {
      // if someone has selected perPage, save it in to localStorage
      if (options.hasOwnProperty('perPage') && _.contains([25, 50, 100, 200, 500], options.perPage)) {
        this.getBeeHive().getObject('User').setLocalStorage({
          perPage: options.perPage
        });
        console.log("set user's page preferences in localStorage: " + options.perPage);
      } // updatePagination will be called after localStorage triggers an event

    },
    updatePagination: function updatePagination(options) {
      // update the current model based on the data passed in
      var opts = _.defaults({}, options, {
        silentIndexUpdate: false,
        updateHash: true
      });

      var currentPageData = this.model.get('pageData');
      var start = this.model.get('start');
      var update = {};
      var currentQuery = this.model.get('currentQuery') || new ApiQuery();
      var pageParam = currentQuery.get('p_'); // add numFound

      if (_.isNumber(opts.numFound)) {
        update.numFound = opts.numFound;
      } // add perPage


      if (_.isNumber(opts.perPage)) {
        update.perPage = opts.perPage; // update the pagination object

        this.pagination.perPage = opts.perPage;
      } // if page isn't specified, check the location hash


      if (_.isArray(pageParam) && _.isUndefined(opts.page)) {
        try {
          opts.page = parseInt(pageParam[0]);
        } catch (e) {// do nothing
        }
      } // check to make sure this page update is valid, and add to update


      if (_.isNumber(opts.page)) {
        var max = currentPageData && currentPageData.totalPages - 1 || 1;
        var min = 0; // check if page is within our set boundaries

        if (opts.page > max) {
          update.page = max;
        } else if (opts.page < min) {
          update.page = min;
        } else {
          update.page = opts.page;
        }
      } else {
        // otherwise compute the page using the start and perPage value
        if (_.isEmpty(this.collection.models) && _.isNumber(start) && _.isNumber(opts.perPage)) {
          update.page = PaginationMixin.getPageVal(start, opts.perPage);
        } else if (_.isNumber(start) && _.isNumber(opts.perPage)) {
          var resIdx = this.collection.models[0].get('resultsIndex');
          update.page = PaginationMixin.getPageVal(resIdx, opts.perPage);
        }
      }

      var page = _.isNumber(update.page) ? update.page : this.model.get('page');
      var perPage = _.isNumber(update.perPage) ? update.perPage : this.model.get('perPage');
      var numFound = _.isNumber(update.numFound) ? update.numFound : this.model.get('numFound'); // once the hash is updated, this is called again, return here so we don't recompute, and only on results page

      var frag = Backbone.history && Backbone.history.getFragment && Backbone.history.getFragment();

      if ('' + page !== (_.isArray(pageParam) && pageParam[0]) && opts.updateHash && /search/.test(frag) && utils.qs('p_', frag) !== '' + page) {
        Backbone.history && Backbone.history.navigate && Backbone.history.navigate(utils.updateHash('p_', page, frag));
      } // compute the new start and pageData values


      update.start = this.getPageStart(page, perPage, numFound);
      update.pageData = this._getPaginationData(page, perPage, numFound);
      update.showRange = [page * perPage, page * perPage + perPage - 1]; // start updating

      this.model.set(update);
      this.view.render();
      this.hiddenCollection.showRange(update.showRange[0], update.showRange[1], {
        silent: !!opts.silentIndexUpdate
      });
      this.collection.reset(this.hiddenCollection.getVisibleModels()); // finally, scroll back to the top

      $(document.documentElement).scrollTop(0);
    },
    onAllInternalEvents: function onAllInternalEvents(ev, arg1, arg2) {
      // for testing, allow widget to not have been activated
      try {
        var pubsub = this.getPubSub();
      } catch (e) {}

      if (ev === 'pagination:changePerPage') {
        this.updateLocalStorage({
          perPage: arg1
        });
        this.updatePagination({
          page: 0,
          perPage: arg1
        });
        this.view.model.set('showHighlights', 'closed');
      } else if (ev === 'pagination:select') {
        this.view.model.set('showHighlights', 'closed');
        return this.updatePagination({
          page: arg1
        });
      } else if (ev === 'show:missing') {
        _.each(arg1, function (gap) {
          var numFound = this.model.get('numFound');
          var start = gap.start;
          var perPage = this.model.get('perPage');
          var currStart = this.model.get('start');
          if (!numFound || start >= numFound || start !== currStart && currStart > 0) return; // ignore this

          var q = this.model.get('currentQuery').clone();
          q.unset('hl');
          q.unset('hl.fl');
          q.unset('hl.maxAnalyzedChars');
          q.unset('hl.requireFieldMatch');
          q.unset('hl.usePhraseHighlighter');
          q.set('__fetch_missing', 'true');
          q.set('start', start);
          q.set('rows', perPage - start <= 0 ? perPage : perPage - start);
          var req = this.composeRequest(q); // allows widgets to override if necessary

          this.executeRequest(req);
        }, this);
      } else if (ev == 'childview:toggleSelect') {
        pubsub.publish(pubsub.PAPER_SELECTION, arg2.data.identifier);
      } else if (ev === 'toggle-highlights') {
        var perPage = this.model.get('perPage');

        if (this.hiddenCollection.length < perPage) {
          perPage = this.hiddenCollection.length;
        }

        var pageStart = this.model.get('start'); // how many requests to make, based on size of set

        var divisor = perPage > 300 ? 5 : perPage <= 50 ? 1 : 2; // request runner

        var runRequest = _.bind(function (start, rows) {
          var q = this.model.get('currentQuery').clone();
          q.set({
            hl: 'true',
            'hl.fl': 'title,abstract,body,ack,*',
            'hl.maxAnalyzedChars': '150000',
            'hl.requireFieldMatch': 'true',
            'hl.usePhraseHighlighter': 'true',
            start: pageStart + start,
            rows: rows
          });
          var req = this.composeRequest(q); // allows widgets to override if necessary

          this.executeRequest(req);
        }, this);

        var chunkRequests = _.debounce(_.bind(function () {
          // batch requests, spacing them out by 300ms
          var withHighlights = this.hiddenCollection.filter(function (m) {
            return m.get('highlights');
          });
          var start = withHighlights.length;
          var batchSize = Math.ceil((perPage - start) / divisor);

          for (var i = start, j = 1; i < perPage; i += batchSize, j++) {
            if (i === start) {
              runRequest(i, batchSize);
            } else {
              setTimeout(runRequest, 500 * j, i, batchSize);
            }
          }
        }, this), 3000);

        chunkRequests();
      }
    },
    executeRequest: function executeRequest(req) {
      this.getPubSub().publish(this.getPubSub().EXECUTE_REQUEST, req);
    },
    reset: function reset() {
      this.collection.reset();
      this.hiddenCollection.reset(); // reset the model, favoring values in this.pagination

      this.model.set(_.defaults({
        currentQuery: this.getCurrentQuery(),
        query: false
      }, this.pagination, this.model.defaults()));
    }
  });

  _.extend(ListOfThingsWidget.prototype, PaginationMixin);

  return ListOfThingsWidget;
});


/* START_TEMPLATE */
define('hbs!js/modules/orcid/widget/templates/container-template',['hbs','hbs/handlebars', 'hbs!js/widgets/list_of_things/templates/pagination-partial'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return " (<b>"
    + this.escapeExpression(((helper = (helper = helpers.totalPapers || (depth0 != null ? depth0.totalPapers : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"totalPapers","hash":{},"data":data}) : helper)))
    + "</b>) ";
},"3":function(depth0,helpers,partials,data) {
    return "            <p><i class=\"icon-loading\" aria-hidden=\"true\"></i> Loading ORCID data...</p>\n";
},"5":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "        <div style=\"margin-bottom: 10px;\">\n            <span style=\"width: 40%;\">ORCID Username:&nbsp;<b>"
    + this.escapeExpression(((helper = (helper = helpers.orcidUserName || (depth0 != null ? depth0.orcidUserName : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"orcidUserName","hash":{},"data":data}) : helper)))
    + "</b></span>\n            &nbsp;&nbsp;&nbsp;\n            <span>ORCID ID:&nbsp;<b>"
    + this.escapeExpression(((helper = (helper = helpers.orcidID || (depth0 != null ? depth0.orcidID : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"orcidID","hash":{},"data":data}) : helper)))
    + "</b></span>\n        </div>\n\n         <p><i class=\"fa fa-info-circle\" aria-hidden=\"true\"></i> To share this list of your ORCID papers:\n                    <ul>\n                      <li>\n                          Search for your ORCID ID in ADS (orcid:"
    + this.escapeExpression(((helper = (helper = helpers.orcidID || (depth0 != null ? depth0.orcidID : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"orcidID","hash":{},"data":data}) : helper)))
    + ")\n                      </li>\n                    <li>\n                        You can then share the url of your results:<br>  <a href=\"https://ui.adsabs.harvard.edu/search/q=orcid%3A"
    + this.escapeExpression(((helper = (helper = helpers.orcidID || (depth0 != null ? depth0.orcidID : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"orcidID","hash":{},"data":data}) : helper)))
    + "&sort=date+desc\">https://ui.adsabs.harvard.edu/search/q=orcid%3A"
    + this.escapeExpression(((helper = (helper = helpers.orcidID || (depth0 != null ? depth0.orcidID : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"orcidID","hash":{},"data":data}) : helper)))
    + "&sort=date+desc</a>\n                    </li>\n                    <li>\n                        Please note that claims take up to 24 hours to be indexed in ADS.\n                    </li>\n\n                    </ul>\n          </p>\n          <p> <i class=\"fa fa-info-circle\" aria-hidden=\"true\"></i>\n               To claim papers in ORCID and add to this list <br>\n              <div style=\"padding-left:5%;\">\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.orcidUserName : depth0),{"name":"if","hash":{},"fn":this.program(6, data, 0),"inverse":this.program(8, data, 0),"data":data})) != null ? stack1 : "")
    + "            </div>\n\n           </p>\n        <br>\n        <p> <a href=\"#orcid-instructions\"> <i class=\"fa fa-arrow-circle-o-right\" aria-hidden=\"true\"></i> Learn more about using ORCID with ADS</a></p>\n        <br>\n\n";
},"6":function(depth0,helpers,partials,data) {
    return "                <button class=\"btn btn-sm btn-default search-author-name\"><i class=\"fa fa-search\" aria-hidden=\"true\"></i> click here to search your name in ADS</button>\n";
},"8":function(depth0,helpers,partials,data) {
    return "                search your name in ADS</button>\n";
},"10":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = this.invokePartial(partials['js/widgets/list_of_things/templates/pagination-partial'],depth0,{"name":"js/widgets/list_of_things/templates/pagination-partial","data":data,"indent":"            ","helpers":helpers,"partials":partials})) != null ? stack1 : "");
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "\n<div class=\"s-results-control-row-container\">\n\n\n    <div class=\"col-sm-10 col-sm-offset-1\" style=\"padding:0 9%\" >\n        <h2>\n            My ORCID Papers "
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.totalPapers : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n        </h2>\n        <!--loading user data-->\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.loading : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.program(5, data, 0),"data":data})) != null ? stack1 : "")
    + "\n    </div>\n</div>\n<div class=\"row s-darker-background\" style=\"margin-right:0;\">\n    <div class=\"col-sm-10 s-main-content-container\" style=\"margin-top:20px;padding-top: 20px; float:none\">\n        <div class=\"row\">\n            <ul class=\"col-sm-12 results-list  s-results-list list-unstyled s-display-block\" aria-label=\"list of results\">\n            </ul>\n        </div>\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.pagination : depth0),{"name":"if","hash":{},"fn":this.program(10, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n\n    </div>\n</div>\n";
},"usePartial":true,"useData":true});
Handlebars.registerPartial('js/modules/orcid/widget/templates/container-template', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
define('hbs!js/modules/orcid/widget/templates/empty-template',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"col-sm-10 col-sm-offset-1\">\n    No papers retrieved from ORCID\n</div>";
},"useData":true});
Handlebars.registerPartial('js/modules/orcid/widget/templates/empty-template', t);
return t;
});
/* END_TEMPLATE */
;
/**
 * Widget to display list of result hits - it allows to paginate through them
 * and display details
 *
 */
define('js/modules/orcid/widget/widget',['underscore', 'js/widgets/list_of_things/widget', 'js/widgets/base/base_widget', 'js/mixins/add_stable_index_to_collection', 'js/mixins/link_generator_mixin', 'js/mixins/formatter', 'hbs!js/modules/orcid/widget/templates/container-template', 'js/mixins/papers_utils', 'js/components/api_query', 'js/components/api_feedback', 'js/components/json_response', 'hbs!js/modules/orcid/widget/templates/empty-template', 'js/modules/orcid/extension', 'js/modules/orcid/bio'], function (_, ListOfThingsWidget, BaseWidget, PaginationMixin, LinkGenerator, Formatter, ContainerTemplate, PapersUtilsMixin, ApiQuery, ApiFeedback, JsonResponse, EmptyViewTemplate, OrcidExtension, OrcidBio) {
  var ResultsWidget = ListOfThingsWidget.extend({
    initialize: function initialize(options) {
      ListOfThingsWidget.prototype.initialize.apply(this, arguments);
      var that = this; // now adjusting the List Model

      this.view.getEmptyView = function () {
        return Marionette.ItemView.extend({
          template: EmptyViewTemplate
        });
      };

      _.extend(this.view.events, {
        'click .search-author-name': function clickSearchAuthorName() {
          var searchTerm;
          var viewThis = this;
          var orcidName = this.model.get('orcidLastName') + ', ' + this.model.get('orcidFirstName');
          var oApi = that.getBeeHive().getService('OrcidApi');
          var searchTerm = 'author:"' + orcidName + '"';
          oApi.getADSUserData().done(function (data) {
            if (data && data.nameVariations) {
              data.nameVariations.push(orcidName);
              searchTerm = 'author:("' + data.nameVariations.join('" OR "') + '")';
            }
          }).always(function () {
            viewThis.trigger('search-author-name', searchTerm);
          }); // end done function
        } // end click handler

      });

      this.view.delegateEvents();
      this.view.template = ContainerTemplate;
      this.view.model.set({
        mainResults: true
      }, {
        silent: true
      });
      this.listenTo(this.collection, 'reset', this.checkDetails);
      this.listenTo(this.view, 'search-author-name', function (searchTerm) {
        var pubsub = this.getPubSub();
        var query = new ApiQuery({
          q: searchTerm,
          sort: 'date desc'
        });
        pubsub.publish(pubsub.NAVIGATE, 'search-page', {
          q: query
        });
      });
    },
    orcidWidget: true,
    activate: function activate(beehive) {
      ListOfThingsWidget.prototype.activate.apply(this, [].slice.apply(arguments));

      _.bindAll(this, 'processResponse');

      this.on('orcidAction:delete', function (model) {
        this.collection.remove(model);
      });
    },

    /**
     * Go through all the recs and remove the ones that are duplicates
     * (we'll keep the ADS version, and indicate the provenance of the
     * removed record)
     *
     * This func is called after the resolution of the bibcodes, so you
     * can expect to have a canonical bibcode in the 'identifier' field
     */
    mergeDuplicateRecords: function mergeDuplicateRecords(docs) {
      var dmap = {};
      var id;
      var dupsFound;
      var c = 0;

      if (docs) {
        _.each(docs, function (doc) {
          doc._dupIdx = c++;
          id = doc.identifier;

          if (id) {
            id = id.toLowerCase();

            if (dmap[id]) {
              dmap[id].push(doc);
              dupsFound = true;
            } else {
              dmap[id] = [doc];
            }
          }
        });
      } else {
        this.hiddenCollection.each(function (model) {
          id = model.get('identifier');
          model.attributes._dupIdx = c++;

          if (id) {
            id = id.toLowerCase();

            if (dmap[id]) {
              dmap[id].push(model.attributes);
              dupsFound = true;
            } else {
              dmap[id] = [model.attributes];
            }
          }
        });
      }

      if (dupsFound) {
        var toRemove = {};
        var toUpdate = [];

        _.each(dmap, function (value, key) {
          if (value.length > 1) {
            // decide which record is ours (or pick the first one)
            var toPick = 0;

            _.each(value, function (doc, idx) {
              if (doc.source_name && doc.source_name.toLowerCase() == 'nasa ads') {
                toPick = idx;
              }
            }); // update 'provenance' field in the picked record


            var authoritativeRecord = value[toPick];
            value.splice(toPick, 1);
            toUpdate.push(authoritativeRecord._dupIdx);
            authoritativeRecord.source_name = authoritativeRecord.source_name || '';

            _.each(value, function (doc) {
              if (doc.source_name) authoritativeRecord.source_name += '; ' + doc.source_name;
              toRemove[doc._dupIdx] = true;
            });
          }
        });

        var recomputeIndexes = function recomputeIndexes(models) {
          var i = 0;

          _.each(models, function (m) {
            m.resultsIndex = i++;
            m.indexToShow = i;
          });
        };

        if (docs) {
          // we are updating the data before they get displayed
          toRemove = _.keys(toRemove);
          toRemove.sort(function (a, b) {
            return b - a;
          }); // reverse order

          _.each(toRemove, function (idx) {
            docs.splice(idx, 1); // will be wasty for large collections
          });

          recomputeIndexes(docs);
        } else {
          // we are updating the collection (it was already displayed
          _.each(toUpdate, function (idx) {
            var model = this.hiddenCollection.models[idx]; // force re-paint

            model.set('source_name', model.attributes.source_name, {
              silent: true
            });
          });

          var newModels = [];
          this.hiddenCollection.each(function (model) {
            if (!toRemove[model.attributes._dupIdx]) newModels.push(model.attributes);
          });
          recomputeIndexes(newModels);
          this.hiddenCollection.reset(newModels);
          this.updatePagination({
            numFound: newModels.length
          });
        }
      }
    },
    processDocs: function processDocs(jsonResponse, docs) {
      var start = 0;
      var docs = PaginationMixin.addPaginationToDocs(docs, start);

      _.each(docs, function (d, i) {
        // let each doc know if it's on the orcid widget page
        d.isOrcidWidget = true;
        docs[i] = PapersUtilsMixin.prepareDocForViewing(d);
      });

      return docs;
    },
    getPaginationInfo: function getPaginationInfo(jsonResponse, docs) {
      // this information is important for calculation of pages
      var numFound = docs.length;
      var perPage = this.model.get('perPage') || 10;
      var start = 0;
      var apiQuery = jsonResponse.getApiQuery() || new ApiQuery({
        orcid: 'author X'
      }); // compute the page number of this request

      var page = PaginationMixin.getPageVal(start, perPage); // compute which documents should be made visible

      var showRange = [page * perPage, (page + 1) * perPage - 1];

      var pageData = this._getPaginationData(page, perPage, numFound);

      return {
        numFound: numFound,
        perPage: perPage,
        start: start,
        page: page,
        showRange: showRange,
        pageData: pageData,
        currentQuery: apiQuery
      };
    },
    onShow: function onShow() {
      var oApi = this.getBeeHive().getService('OrcidApi');
      var self = this;

      if (oApi) {
        if (!oApi.hasAccess()) {
          return;
        }

        self.model.set('loading', true);
        var orcidBio = oApi.getUserBio();
        var orcidProfile = oApi.getUserProfile();
        $.when(orcidBio, orcidProfile).done(function (bio, profile) {
          var response = new JsonResponse(profile.toADSFormat());
          var bioResponse = new JsonResponse(bio.toADSFormat());
          var params = bioResponse.get('responseHeader.params');
          var firstName = bio.getFirstName();
          var lastName = bio.getLastName();
          self.model.set({
            orcidID: bio.getOrcid(),
            orcidUserName: firstName + ' ' + lastName,
            orcidFirstName: firstName,
            orcidLastName: lastName,
            totalPapers: response.get('response.numFound') || 0,
            loading: false
          });
          response.setApiQuery(new ApiQuery(params));
          self.processResponse(response);
        });
        orcidProfile.fail(function () {
          self.model.set({
            loading: false
          });
          var title = 'Something Went Wrong';
          var msg = ['We were unable to retrieve your profile from ORCiD', 'Please reload the page to try again', '', '<button onclick="location.reload()" class="btn btn-primary" role="button">Reload</button>'];
          var pubSub = self.getPubSub();
          pubSub.publish(pubSub.ALERT, new ApiFeedback({
            title: title,
            msg: msg.join('<br/>'),
            modal: true,
            type: 'warning'
          }));
        });
      }
    },

    /**
     * function to update what we are displaying; it always works with the existing
     * models - does not fetch new data
     *
     * @param sortBy
     * @param filterBy
     *  - allowed values are: 'ads', 'both', 'others', null
     *
     *    'ads' means the record was created by ADS Orcid client
     *    'others' that it was created by some other app AND we have
     *          a bibcode
     *    'both' - we have a bibcode and it was created by ADS or by
     *          others
     *    null - the record was created by an external client and we
     *           dont have a bibcode for it
     */
    update: function update(options) {
      options = options || {};

      if (this.hiddenCollection && this.view.collection) {
        if (!this._originalCollection) {
          this._originalCollection = new this.hiddenCollection.constructor(this.hiddenCollection.models);
        }

        var coll = this._originalCollection;
        var allowedVals = ['ads', 'both', 'others', null];

        if (_.has(options, 'filterBy')) {
          var cond = options.filterBy;

          if (!_.isArray(cond)) {
            cond = [cond];
          }

          for (var c in cond) {
            if (!_.contains(allowedVals, cond[c])) throw Error('Unknown value for the filter: ' + cond[c]);
          }

          var predicate = function predicate(model) {
            if (model.attributes.orcid && _.contains(cond, model.attributes.orcid.provenance)) return true;
          };

          coll = new this.hiddenCollection.constructor(coll.filter(predicate));
        }

        if (_.has(options, 'sortBy') && options.sortBy) {
          var idx = 0;
          coll = new this.hiddenCollection.constructor(_.map(coll.sortBy(options.sortBy), function (x) {
            x.attributes.resultsIndex = idx++;
            return x;
          }));
        }

        this.hiddenCollection.reset(coll.models);
        this.updatePagination({});
      }
    }
  });
  return OrcidExtension(ResultsWidget);
});


/* START_TEMPLATE */
define('hbs!js/page_managers/templates/results-page-layout',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"results-page-layout\" class=\"s-results-page-layout\">\n  <div class=\"row s-stable-search-bar-height\">\n    <div class=\"s-search-bar-full-width-container\" role=\"search\">\n      <div class=\"col-xs-0 col-sm-12 col-md-2 s-back-button-container\">\n        <a href=\"/\" class=\"back-button btn btn-sm btn-default\">\n          <i class=\"fa fa-arrow-left\" aria-hidden=\"true\"></i> Start New\n          Search</a\n        >\n      </div>\n      <div\n        class=\"col-xs-12 col-sm-9 col-md-7 s-search-bar-row\"\n        id=\"search-bar-row\"\n        data-widget=\"SearchWidget\"\n      ></div>\n    </div>\n  </div>\n  <div class=\"row s-message-control-row\" id=\"message-control-row\">\n    <span data-widget=\"AlertsWidgetx\"></span>\n  </div>\n  <div class=\"row s-results-control-row\" id=\"results-control-row\"></div>\n  <div class=\"row\">\n    <div class=\"col-xs-12 s-dynamic-page-body\" id=\"dynamic-page-body\">\n      <div class=\"max-width-wrapper\">\n        <div>\n          <div\n            class=\"hidden-xs col-sm-3 col-md-2 s-left-column s-results-column\"\n            id=\"results-left-column\"\n          >\n            <h2 class=\"sr-only\">Filters for the Current Search</h2>\n            <div class=\"left-col-container s-left-col-container\">\n              <div data-widget=\"AuthorFacet\" />\n              <div data-widget=\"DatabaseFacet\" />\n              <div data-widget=\"RefereedFacet\" />\n              <div data-widget=\"AffiliationFacet\" />\n              <div data-widget=\"KeywordFacet\" />\n              <div data-widget=\"BibstemFacet\" />\n              <div data-widget=\"BibgroupFacet\" />\n              <div data-widget=\"ObjectFacet\" />\n              <div data-widget=\"NedObjectFacet\" />\n              <div data-widget=\"DataFacet\" />\n              <div data-widget=\"VizierFacet\" />\n              <div data-widget=\"PubtypeFacet\" />\n            </div>\n          </div>\n\n          <div\n            class=\"col-sm-9 col-md-7  s-results-middle-column s-results-column\"\n            id=\"results-middle-column\"\n          >\n            <div\n              class=\"main-content-container s-main-content-container\"\n              id=\"main-content\"\n              tabindex=\"-1\"\n              role=\"main\"\n              aria-label=\"container for search results and other main content\"\n            >\n              <div data-widget=\"Results\" />\n              <div data-widget=\"AuthorAffiliationTool\" />\n              <div data-widget=\"ExportWidget\" data-origin=\"results-page\" />\n              <div data-widget=\"AuthorNetwork\" />\n              <div data-widget=\"PaperNetwork\" />\n              <div data-widget=\"Metrics\" data-allow-redirect=\"true\" />\n              <div data-widget=\"BubbleChart\" />\n              <div data-widget=\"ConceptCloud\" />\n              <div data-widget=\"CitationHelper\" />\n            </div>\n          </div>\n\n          <div\n            class=\"hidden-xs col-sm-3 col-md-3 results-right-column s-right-column s-results-column\"\n            id=\"results-right-column\"\n          >\n            <h2 class=\"sr-only\">\n              Additional Functionality (Information about your query, and more\n              search filters)\n            </h2>\n\n            <div data-widget=\"QueryInfo\" />\n            <div data-widget=\"MyAdsFreeform\" />\n            <div data-widget=\"OrcidSelector\" />\n            <div data-widget=\"GraphTabs\" />\n            <div data-widget=\"QueryDebugInfo\" data-debug=\"true\" />\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n";
},"useData":true});
Handlebars.registerPartial('js/page_managers/templates/results-page-layout', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
define('hbs!js/page_managers/templates/results-control-row',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div class=\"s-results-control-row-container\">\n    <div class=\"col-sm-6\">\n        <div data-widget=\"BreadcrumbsWidget\" class=\"s-display-inline-block\"/>\n    </div>\n\n\n    <div class=\"col-sm-6\" style=\"padding-right:0\">\n        <div class=\"s-results-action-buttons\">\n            <div class=\"col-md-6 clearfix\" style=\"margin-bottom:10px;\">\n                <div data-widget=\"Sort\" class=\"s-display-inline-block pull-right\"/>\n            </div>\n            <div class=\"col-md-6\">\n                <div data-widget=\"VisualizationDropdown\" class=\"s-display-inline-block pull-right\"/>\n                <div data-widget=\"ExportDropdown\" class=\"s-display-inline-block pull-right\"/>\n            </div>\n        </div>\n    </div>\n\n</div>\n";
},"useData":true});
Handlebars.registerPartial('js/page_managers/templates/results-control-row', t);
return t;
});
/* END_TEMPLATE */
;
define('js/page_managers/three_column_view',['underscore', 'marionette', 'hbs!js/page_managers/templates/results-page-layout', 'hbs!js/page_managers/templates/results-control-row', 'js/widgets/base/base_widget'], function (_, Marionette, pageTemplate, controlRowTemplate) {
  /*
   * keeps track of the open/closed state of the three columns
   * */
  var ResultsStateModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        left: 'open',
        right: 'open',
        user_left: null,
        user_right: null
      };
    }
  });
  var ThreeColumnView = Marionette.ItemView.extend({
    initialize: function initialize(options) {
      var options = options || {};
      this.widgets = options.widgets;
      this.model = new ResultsStateModel();
    },
    destroy: function destroy() {
      Marionette.ItemView.prototype.destroy.call(this, arguments);
    },
    template: pageTemplate,
    modelEvents: {
      'change:left': '_updateColumnView',
      'change:right': '_updateColumnView'
    },
    events: {
      'click .btn-expand': 'onClickToggleColumns'
    },
    onRender: function onRender() {
      this.$('#results-control-row').append(controlRowTemplate());
      this.displaySearchBar(this.options.displaySearchBar);
      this.displayControlRow(this.options.displayControlRow);
      this.displayLeftColumn(this.options.displayLeftColumn);
      this.displayRightColumn(this.options.displayRightColumn);
      this.displayMiddleColumn(this.options.displayMiddleColumn);
    },
    onShow: function onShow() {
      // these functions must be called every time the template is inserted
      this.displaySearchBar(true);
    },
    displaySearchBar: function displaySearchBar(show) {
      $('#search-bar-row').toggle(show === undefined ? true : show);
    },
    displayLeftColumn: function displayLeftColumn(show) {
      this.$('.s-left-col-container').toggle(show === undefined ? true : show);
    },
    displayControlRow: function displayControlRow(show) {
      this.$('#results-control-row').toggle(show === undefined ? true : show);
    },
    displayRightColumn: function displayRightColumn(show) {
      this.$('.s-left-col-container').toggle(show === undefined ? true : show);
    },
    displayMiddleColumn: function displayMiddleColumn(show) {
      this.$('.s-left-col-container').toggle(show === undefined ? true : show);
    },
    _returnBootstrapClasses: function _returnBootstrapClasses() {
      var classes = this.classList;
      var toRemove = [];

      _.each(classes, function (c) {
        if (c.indexOf('col-') !== -1) {
          toRemove.push(c);
        }
      });

      return toRemove.join(' ');
    },

    /**
     * Method to display/hide columns, accepts object with keys:
     *  left: true/false
     *  right: true|false
     *  force: true if you want to override user action (i.e. open
     *         column, even if they changed it manually)
     * @param options
     */
    showCols: function showCols(options) {
      options = options || {
        left: true,
        right: true,
        force: false
      };
      var keys = ['left', 'right'];

      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];

        if (k in options) {
          var ul = this.model.get('user_' + k);

          if (ul === null) {
            this.model.set(k, options[k] ? 'open' : 'closed');
          } else if (options.force) {
            this.model.set(k, options[k] ? 'open' : 'closed');
            this.model.set('user_' + k, null);
          }
        }
      }
    },
    _updateColumnView: function _updateColumnView() {
      var leftState;
      var rightState;
      var $leftCol;
      var $rightCol;
      var $middleCol;
      leftState = this.model.get('left');
      rightState = this.model.get('right');
      $leftCol = this.$('#results-left-column');
      $rightCol = this.$('#results-right-column');
      $middleCol = this.$('#results-middle-column');

      _.each([['left', leftState, $leftCol], ['right', rightState, $rightCol]], function (x) {
        if (x[1] == 'open') {
          x[2].removeClass('hidden');
          var $col = x[2];
          setTimeout(function () {
            $col.children().show(0);
          }, 200);
        } else {
          x[2].addClass('hidden');
        }
      });

      if (leftState === 'open' && rightState === 'open') {
        $middleCol.removeClass(this._returnBootstrapClasses).addClass('col-sm-9 col-md-7');
      } // else if (leftState === "closed" && rightState === "open") {
      //  $middleCol.removeClass(this._returnBootstrapClasses)
      //      .addClass("col-md-9 col-sm-12")
      // }
      // else if (leftState === "open" && rightState === "closed") {
      //  $middleCol.removeClass(this._returnBootstrapClasses)
      //      .addClass("col-md-10 col-sm-8")
      // }
      else if (leftState === 'closed' && rightState === 'closed') {
          $middleCol.removeClass(this._returnBootstrapClasses).addClass('col-md-12 col-sm-12');
        }
    }
  });
  return ThreeColumnView;
});

define('js/page_managers/view_mixin',['underscore', 'jquery'], function (_, $) {
  var PageManagerMixin = {
    getWidgetsFromTemplate: function getWidgetsFromTemplate(template, isDebug) {
      var widgets = {};
      var widgetTargets = $(template).find('[data-widget]');

      if (widgetTargets.length > 0) {
        _.each(widgetTargets, function (widgetTarget) {
          var widgetName = widgetTarget.getAttribute('data-widget');
          var isDebug = widgetTarget.getAttribute('data-debug');

          if (isDebug && isDebug == 'true' && !isDebug) {
            return;
          }

          widgets[widgetName] = widgetTarget;
        });
      }

      return widgets;
    }
  };
  return PageManagerMixin;
});

define('js/page_managers/controller',['jquery', 'underscore', 'marionette', 'hbs!js/page_managers/templates/results-page-layout', 'hbs!js/page_managers/templates/results-control-row', 'js/widgets/base/base_widget', './three_column_view', './view_mixin', 'js/mixins/dependon'], function ($, _, Marionette, pageTemplate, controlRowTemplate, BaseWidget, ThreeColumnView, PageManagerViewMixin, Dependon) {
  var PRIORITY_WIDGETS = ['ShowAbstract'];
  var PageManagerController = BaseWidget.extend({
    initialize: function initialize(options) {
      this.widgets = {};
      this.widgetDoms = {};
      this.initialized = false;
      this.widgetId = null;
      this.assembled = false;

      _.extend(this, _.pick(options, ['debug', 'widgetId']));
    },

    /**
     * Necessary step: during activation we'll collect list of widgets
     * that were referenced by the template (and store them for future
     * reference)
     *
     * @param beehive
     */
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      this.debug = beehive.getDebug(); // XXX:rca - think of st better

      this.view = this.createView({
        debug: this.debug,
        widgets: this.widgets
      });
    },
    setWidgetId: function setWidgetId(n) {
      this.widgetId = n;
    },

    /**
     * Creates the view: the pagemanger view (from the template
     * that references widgets)
     *
     * @param options
     * @returns {ThreeColumnView}
     */
    createView: function createView(options) {
      return new ThreeColumnView(options);
    },

    /**
     * Render the widgets and append them inside the appropriate places inside the
     * template. This happens only 1x during the lifetime of the page manager
     *
     * @param app
     */
    assemble: function assemble(app) {
      var defer = $.Deferred();

      if (this.assembled) {
        defer.resolve(this.view.el);
        return defer.promise();
      }

      this.assembled = true;
      this.view.render();
      var self = this;
      var el;

      _.extend(self.widgetDoms, self.getWidgetsFromTemplate(self.view.$el));

      var promises = [];
      var domsToRender = {};

      _.each(self.widgetDoms, function (widgetDom, widgetName) {
        if (!app.hasWidget(widgetName)) {
          delete self.widgetDoms[widgetName];
          delete self.widgets[widgetName];
          return;
        }

        var promise = app._getWidget(widgetName).done(function (widget) {
          if (self.persistentWidgets && self.persistentWidgets.indexOf(widgetName) > -1) {
            // this increments the counter so the widget won't be de-referenced when this
            // page manager is disassembled
            app.incrRefCount('widget', widgetName);
          }

          if (widget) {
            var doRender = function doRender() {
              // in case the user passed data params on the dom element,
              // create props on the widget
              _.assign(widget, {
                componentParams: $(widgetDom).data()
              });

              var $el = $('*[data-widget="' + widgetName + '"]');
              var content = $el.length > 0 ? $el.html().trim() : '';

              if (window.__PRERENDERED && widget.view && PRIORITY_WIDGETS.indexOf(widgetName) > -1 && $el.length > 0 && content.length > 0) {
                if (typeof widget.view.handlePrerenderedContent === 'function') {
                  widget.view.handlePrerenderedContent(content, $el);
                }

                window.__PRERENDERED = false;
              } else {
                el = widget.getEl ? widget.getEl() : widget.render().el;
                domsToRender[widgetName] = el;
              }
            }; // maybe it is a page-manager (this is a security hole though!)


            widget.assemble ? widget.assemble(app).done(doRender) : doRender();
            self.widgets[widgetName] = widget;
          }
        });

        promises.push(promise);
      }, this);

      $.when.apply($, promises).then(function () {
        // wait until everything has assembled before swapping out doms
        _.forEach(domsToRender, function (v, k) {
          $(self.widgetDoms[k]).html(v);
        });

        defer.resolve();
      }).fail(function () {
        console.error('Generic error - we were not successul in assembling page');
        if (arguments.length) console.error(arguments);
        defer.reject();
      });
      return defer.promise();
    },
    disAssemble: function disAssemble(app) {
      _.each(_.keys(this.widgets), function (widgetName) {
        var widget = this.widgets[widgetName];
        if (widget.disAssemble) widget.disAssemble();
        app.returnWidget(widgetName);

        if (!app._isBarbarianAlive('widget:' + widgetName)) {
          $(this.widgetDoms[widgetName]).empty();
        } else {
          $(this.widgetDoms[widgetName]).detach();
        }

        delete this.widgets[widgetName];
        delete this.widgetDoms[widgetName];
      }, this);

      this.assembled = false;
    },

    /**
     * Display the widgets that are under our control (and hide all the rest)
     *
     * @param pageName
     * @returns {exports.el|*|queryBuilder.el|p.el|AppView.el|view.el}
     */
    show: function show(pageName) {
      var self = this;

      if (!pageName) {
        this.showAll();
      } else {
        this.hideAll(); // show just those that are requested + always show alerts widget

        var args = [].slice.apply(arguments);

        _.each(args, function (widgetName) {
          if (self.widgets[widgetName]) {
            var widget = self.widgets[widgetName]; // don't call render each time or else we
            // would have to re-delegate widget events

            var $wcontainer = self.view.$el.find('[data-widget="' + widgetName + '"]');

            if ($wcontainer.length) {
              var d = $wcontainer.data('debug');

              if (d !== undefined && d && !self.debug) {
                return; // skip widgets that are there only for debugging
              }

              $wcontainer.append(widget.el ? widget.el : widget.view.el); // set data props from the container on the widget

              _.assign(widget, {
                componentParams: $wcontainer.data()
              });

              try {
                self.widgets[widgetName].triggerMethod('show');
              } catch (e) {
                console.error('Error when displaying widget: ' + widgetName, e.message, e.stack);
              }
            } else {
              console.warn('Cannot insert widget: ' + widgetName + ' (no selector [data-widget="' + widgetName + '"])');
            }
          } else if (self.debug) console.error('Cannot show widget: ' + widgetName + '(because, frankly... there is no such widget there!)');
        });
      }

      this.triggerMethod('show');
      return this.view;
    },
    hideAll: function hideAll() {
      // hide all widgets that are under our control
      _.each(this.widgets, function (w) {
        if (w.noDetach) return;

        if ('detach' in w && _.isFunction(w.detach)) {
          w.detach();
        } else if (w.view && w.view.$el) {
          w.view.$el.detach();
        } else if (w.$el) {
          w.$el.detach();
        }
      });

      return this.view;
    },
    showAll: function showAll() {
      var self = this; // show just those that are requested

      _.each(_.keys(self.widgets), function (widgetName) {
        var widget = self.widgets[widgetName]; // don't call render each time or else we
        // would have to re-delegate widget events

        var $wcontainer = self.view.$el.find('[data-widget="' + widgetName + '"]');
        $wcontainer.append(widget.el ? widget.el : widget.view.el); // set data props from the container on the widget

        _.assign(widget, {
          componentParams: $wcontainer.data()
        });

        self.widgets[widgetName].triggerMethod('show');
      });

      return this.view;
    },

    /**
     * broadcast the event to all other managed widgets
     * (call trigger on them)
     */
    broadcast: function broadcast() {
      var args = arguments;

      _.each(this.widgets, function (widget, widgetName) {
        widget.trigger.apply(widget, args);
      }, this);
    }
  });

  _.extend(PageManagerController.prototype, PageManagerViewMixin, Dependon.BeeHive, {
    // override the pubsub - we give every child the same (hardened)
    // instance of pubsub
    getPubSub: function getPubSub() {
      if (this._ps && this.hasPubSub()) return this._ps;
      this._ps = this.getBeeHive().getHardenedInstance().getService('PubSub');
      return this._ps;
    }
  });

  return PageManagerController;
});


/* START_TEMPLATE */
define('hbs!js/page_managers/templates/aria-announcement',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "<a href=\"#main-content\" id=\"skip-to-main-content\" class=\"sr-only sr-only-focusable\" data-dont-handle=\"true\">Skip to main content</a>\n";
},"3":function(depth0,helpers,partials,data) {
    return "<a href=\"#main-content\"  id=\"skip-to-main-content\" class=\"sr-only sr-only-focusable\" data-dont-handle=\"true\">Skip to main content</a>\n";
},"5":function(depth0,helpers,partials,data) {
    return "    home page\n";
},"7":function(depth0,helpers,partials,data) {
    return "    search results page\n";
},"9":function(depth0,helpers,partials,data) {
    return "    article abstract page\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.page : depth0),"SearchPage",{"name":"compare","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.page : depth0),"DetailsPage",{"name":"compare","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n<div id=\"aria-announcement-container\">\n    Now on\n"
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.page : depth0),"LandingPage",{"name":"compare","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.page : depth0),"SearchPage",{"name":"compare","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = (helpers.compare || (depth0 && depth0.compare) || helpers.helperMissing).call(depth0,(depth0 != null ? depth0.page : depth0),"DetailsPage",{"name":"compare","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\n</div>\n";
},"useData":true});
Handlebars.registerPartial('js/page_managers/templates/aria-announcement', t);
return t;
});
/* END_TEMPLATE */
;

/* START_TEMPLATE */
define('hbs!js/page_managers/templates/master-page-manager',['hbs','hbs/handlebars'], function( hbs, Handlebars ){ 
var t = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<div id=\"navbar-container\">\n  <div data-widget=\"NavbarWidget\"/>\n</div>\n\n<div id=\"alerts-container\">\n  <div data-widget=\"AlertsWidget\"/>\n</div>\n\n<div id=\"content-container\">\n  <div class=\"dynamic-container s-dynamic-container\"></div>\n</div>\n\n<div id=\"footer-container\">\n  <div data-widget=\"FooterWidget\"/>\n</div>\n";
},"useData":true});
Handlebars.registerPartial('js/page_managers/templates/master-page-manager', t);
return t;
});
/* END_TEMPLATE */
;
/*
 * Master manager is a simple widget which keeps track of what is
 * inside DOM - and on command swaps/adds/removes the subordinate
 * page managers (plus gives them commands on what to display).
 *
 * Page managers will be discovered automatically, from the
 * application object. But we need to know where in the page
 * should the managers be inserted.
 *
 * */
define('js/page_managers/master',['js/widgets/base/base_widget', 'js/components/generic_module', 'js/page_managers/controller', 'hbs!js/page_managers/templates/aria-announcement', 'hbs!js/page_managers/templates/master-page-manager', 'marionette', 'js/mixins/dependon'], function (BaseWidget, GenericModule, PageManagerController, AriaAnnouncementTemplate, MasterPageManagerTemplate, Marionette, Dependon) {
  var WidgetData = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        id: undefined,
        // widgetId
        isSelected: false,
        object: undefined,
        options: undefined // options used for the last show() call

      };
    }
  });
  var WidgetCollection = Backbone.Collection.extend({
    model: WidgetData,
    selectOne: function selectOne(widgetId) {
      var s = null;
      this.each(function (m) {
        if (m.id == widgetId) {
          s = m;
        } else {
          m.set('isSelected', false, {
            silent: true
          });
        }
      });
      s.set('isSelected', true);
    }
  });
  var WidgetModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        name: undefined,
        numCalled: 0,
        numAttached: 0,
        ariaAnnouncement: undefined
      };
    }
  });
  var MasterView = Marionette.ItemView.extend({
    className: 's-master-page-manager',
    constructor: function constructor(options) {
      options = options || {};
      if (!options.collection) options.collection = new WidgetCollection();
      if (!options.model) options.model = new WidgetModel();
      options.template = MasterPageManagerTemplate;
      Marionette.ItemView.prototype.constructor.call(this, options);
    },
    // transition between page managers
    changeManager: function changeManager() {
      var model = this.collection.findWhere({
        isSelected: true
      }); // call the subordinate page-manager

      var res = model.attributes.object.show.apply(model.attributes.object, model.attributes.options); // detach previous controller

      this.$('.dynamic-container').children().detach();
      this.$('.dynamic-container').append(res.$el);
      model.attributes.numAttach += 1; // scroll to top

      $(document.documentElement).scrollTop(0); // and fix the search bar back in its default spot

      $('.s-search-bar-full-width-container').removeClass('s-search-bar-motion');
      $('.s-quick-add').removeClass('hidden');
    },
    // transition widgets within a manager
    changeWithinManager: function changeWithinManager() {
      var model = this.collection.findWhere({
        isSelected: true
      });
      model.attributes.object.show.apply(model.attributes.object, model.attributes.options);
      model.attributes.numAttach += 1;
    }
  });
  var MasterPageManager = PageManagerController.extend({
    initialize: function initialize(options) {
      options = options || {};
      this.view = new MasterView(options);
      this.collection = this.view.collection;
      this.model = this.view.model;
      PageManagerController.prototype.initialize.apply(this, arguments);
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.ARIA_ANNOUNCEMENT, this.handleAriaAnnouncement);
    },
    assemble: function assemble(app) {
      this.setApp(app);
      return PageManagerController.prototype.assemble.call(this, app);
    },
    show: function show(pageManagerName, options, context) {
      var defer = $.Deferred();
      var app = this.getApp();

      if (!this.collection.find({
        id: pageManagerName
      })) {
        this.collection.add({
          id: pageManagerName
        });
      }

      var pageManagerModel = this.collection.find({
        id: pageManagerName
      });
      var self = this;

      var activatePage = function activatePage(pageManagerWidget) {
        // it's a new page
        if (!pageManagerModel.get('isSelected')) {
          pageManagerModel.set({
            options: options,
            object: pageManagerWidget
          });
          self.collection.selectOne(pageManagerName);
          self.view.changeManager();
        } else {
          // it's within a page
          pageManagerModel.set({
            options: options,
            object: pageManagerWidget
          }); // it's already selected, trigger a change within the manager

          self.view.changeWithinManager();
        }

        if (context && pageManagerWidget.provideContext) {
          pageManagerWidget.provideContext.call(pageManagerWidget, context);
        }

        var previousPMName = self.currentChild;
        self.currentChild = pageManagerName; // disassemble the old one (behind the scenes)

        if (previousPMName && previousPMName != pageManagerName) {
          var oldPM = self.collection.find({
            id: previousPMName
          });

          if (oldPM && oldPM.get('object')) {
            oldPM.set('numDetach', oldPM.get('numDetach') + 1); // XXX:rca - widgets are disappearing, probably must call incrCounter separately
            // oldPM.get('object').disAssemble(app);
          }
        }

        self.getPubSub().publish(self.getPubSub().ARIA_ANNOUNCEMENT, pageManagerName);
        defer.resolve();
      }; // if the model does not already reference the actual manager widget, add it now


      var promise;

      if (pageManagerModel.get('object')) {
        activatePage(pageManagerModel.get('object'));
        return defer.promise();
      }

      app._getWidget(pageManagerName).then(function (pageManagerWidget) {
        // will throw error if not there
        pageManagerModel.set('object', pageManagerWidget);

        if (!pageManagerWidget) {
          console.error('unable to find page manager: ' + pageManagerName);
        }

        if (pageManagerWidget.assemble) {
          // assemble the new page manager (while the old one is still in place)
          pageManagerWidget.assemble(app).then(function () {
            activatePage(pageManagerWidget);
          });
        } else {
          console.error('eeeek, ' + pageManagerName + ' has no assemble() method!');
          defer.reject();
        }
      });

      return defer.promise();
    },
    // used by discovery mediator
    getCurrentActiveChild: function getCurrentActiveChild() {
      return this.collection.get(this.currentChild).get('object'); // brittle?
    },

    /**
     * Return the instances that are under our control and are
     * not active any more
     */
    disAssemble: function disAssemble() {
      _.each(this.collection.models, function (model) {
        if (model.attributes.isSelected) {
          var pManager = model.get('object');

          if (pManager.disAssemble) {
            pManager.disAssemble(this.getApp());
          } else if (pManager.destroy) {
            pManager.destroy();
          } else {
            throw new Error('Contract breach, no way to get ridd of the widget/page manager');
          }
        }

        model.set({
          isSelected: false,
          object: null
        });
        this.assembled = false;
      }, this);
    },
    handleAriaAnnouncement: function handleAriaAnnouncement(msg) {
      // template will match the page name with the proper message
      // this doesn't work using voiceover when it's inside a div container for some infuriating reason,
      // the skip to link becomes unfocusable
      $('a#skip-to-main-content').remove();
      $('div#aria-announcement-container').remove();
      $('#app-container').before(AriaAnnouncementTemplate({
        page: msg
      }));
    }
  });

  _.extend(MasterPageManager.prototype, Dependon.App);

  return MasterPageManager;
});

define('js/page_managers/one_column_view',['marionette', 'js/widgets/base/base_widget'], function (Marionette) {
  var OneColumnView = Marionette.ItemView.extend({
    initialize: function initialize(options) {
      var options = options || {};
      this.widgets = options.widgets;
    },
    onRender: function onRender() {
      var self = this; // var widgets = this.getWidgetsFromTemplate(this.$el,
      //  !Marionette.getOption(this, "debug"));
      // _.extend(this.widgets, widgets);
    }
  });
  return OneColumnView;
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define('js/page_managers/toc_widget',['backbone', 'marionette'], function (Backbone, Marionette) {
  /*
   * widget to coordinate the showing of other widgets within the framework of a TOC page manager
   * You need to provide a template with a nav that looks like this: (with the data attributes
   * corresponding to NAV EVENTS in the navigator.js file, e.g.
   *
   * this.set('ClassicSearchForm', function() {
   * app.getObject('MasterPageManager').show('LandingPage', ["ClassicSearchForm"]);
   * });
   *
   * MUST have a navConfig object: e.g.
   *   navConfig : {
   *   UserPreferences : {"title": "User Preferences", "path":"user/settings/preferences","category":"preferences" },
   *    UserSettings__email : {"title": "Change Email", "path":"user/settings/email","category":"settings"},
   *    }
   *
   *
   toc widget listens to "new-widget" event and, if it can find teh corresponding data in the markup,
   adds an entry to its nav
   the toc controller will call a navigate event when the toc widget emits a "widget-selected" event
   * */
  var WidgetData = Backbone.Model.extend({
    defaults: function defaults() {
      var _ref;

      return _ref = {
        id: undefined,
        // widgetId
        path: undefined,
        title: undefined,
        showCount: false,
        category: undefined,
        isActive: false,
        isSelected: false,
        numFound: 0
      }, _defineProperty(_ref, "showCount", true), _defineProperty(_ref, "alwaysThere", false), _ref;
    }
  });
  var WidgetCollection = Backbone.Collection.extend({
    model: WidgetData,
    initialize: function initialize() {
      // trigger when one of the models is selected, this ensures that
      // we capture any initial load (like on page load, not directly clicked)
      this.on('change:isSelected', function (model) {
        // only trigger if going from false -> true
        if (model.get('isSelected')) {
          this.trigger('widget-selected', model);
        }
      });
    },
    selectOne: function selectOne(widgetId) {
      var s = null;
      this.each(function (m) {
        if (m.id == widgetId) {
          s = m;
        } else {
          m.set('isSelected', false, {
            silent: true
          });
        }
      }); // make sure that `s` exists, otherwise just set it to the first element

      s = s || this.first();
      s.set('isSelected', true);
    },
    comparator: function comparator(m) {
      return m.get('order');
    }
  });
  var WidgetModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        bibcode: undefined,
        query: undefined,
        path: undefined,
        idAttribute: undefined
      };
    }
  });
  var TocNavigationView = Marionette.ItemView.extend({
    initialize: function initialize(options) {
      options = options || {};
      this.collection = options.collection || new WidgetCollection();
      this.model = options.model || new WidgetModel();
      this.on('page-manager-message', this.onPageManagerMessage); // if any of the models in the collection are selected, trigger an event here

      this.listenTo(this.collection, 'widget-selected', function (model) {
        var val = model.get('id').split('__');
        this.model.set({
          path: model.get('path'),
          idAttribute: val[0],
          subView: val.length > 1 ? val[1] : undefined
        }); // trigger when collection selection is made

        this.triggerSelection();
      });

      if (!options.template) {
        // for testing
        this.template = function () {
          return '';
        };
      }
    },
    // or else controller will detach, and then never put it back
    noDetach: true,
    serializeData: function serializeData() {
      var data = this.model.toJSON();
      var col = this.collection.toJSON();
      var groupedCollectionJSON; // if any entries from the data has a "category" param, group by that, otherwise, just return it

      if (_.find(col, function (c) {
        return c.category !== undefined;
      })) {
        groupedCollectionJSON = _.groupBy(this.collection.toJSON(), function (object) {
          return object.category;
        });
        data = _.extend(data, groupedCollectionJSON);
      } else {
        data = _.extend(data, {
          tabs: col
        });
      }

      return data;
    },
    events: {
      'click a': 'navigateToPage'
    },
    navigateToPage: function navigateToPage(e) {
      var $t = $(e.currentTarget);
      var idAttribute = $t.attr('data-widget-id');
      var data = {
        idAttribute: idAttribute
      }; // it's inactive

      if ($t.find('div').hasClass('s-nav-inactive')) {
        return false;
      } // it's active


      if (idAttribute !== this.$('.s-nav-selected').attr('data-widget-id')) {
        data.href = $t.attr('href'); // make sure only a single element is selected

        this.collection.selectOne(idAttribute); // finally, close the mobile menu, which might be open

        this.$el.parent('.nav-container').removeClass('show');
        $('button.toggle-menu').html(' <i class="fa fa-bars" aria-hidden="true"></i> Show Menu');
      }

      return false;
    },
    modelEvents: {
      'change:bibcode': 'resetActiveStates',
      change: 'render'
    },
    collectionEvents: {
      add: 'render',
      'change:isActive': 'render',
      'change:isSelected': 'render',
      'change:numFound': 'render'
    },

    /*
     every time the bibcode changes (got by subscribing to pubsub.DISPLAY_DOCUMENTS)
     clear the collection of isactive and numfound in the models of the toc widget, so that the next view on
     the widget will show the appropriate defaults
     */
    resetActiveStates: function resetActiveStates() {
      var path = this.model.get('path');
      this.collection.each(function (model) {
        // if idAttr is set, then set that one as selected
        model.set({
          isSelected: path === model.get('path'),
          isActive: true,
          numFound: 0
        });
      }); // trigger on bibcode update

      this.triggerSelection();
    },
    triggerSelection: function triggerSelection() {
      // if nothing is selected, select the abstract element and return
      if (this.collection.where({
        isSelected: true
      }).length === 0) {
        return this.collection.selectOne('ShowAbstract');
      }

      var path = this.model.get('path') || 'abstract';
      var encodedId = encodeURIComponent(this.model.get('bibcode'));
      var data = {
        idAttribute: this.model.get('idAttribute') || 'showAbstract',
        subView: this.model.get('subView') || '',
        href: 'abs/' + (encodedId || '') + '/' + path,
        bibcode: this.model.get('bibcode')
      };
      this.trigger('page-manager-event', 'widget-selected', data);
    },
    selectDefaultNavItem: function selectDefaultNavItem() {
      var tocConfig = Marionette.getOption(this, 'navConfig');
      var found = tocConfig[0];

      _.each(tocConfig, function (v, k) {
        if (v.isSelected) {
          found = k;
          return false;
        }
      });

      this.collection.selectOne(found);
    },
    onPageManagerMessage: function onPageManagerMessage(event, data) {
      if (event == 'new-widget') {
        // building the toc collection
        var widgetId = arguments[1];
        var tocData = Marionette.getOption(this, 'navConfig');
        var widgetData = tocData[widgetId];

        if (widgetData) {
          var toAdd = _.extend(_.clone(widgetData), {
            id: widgetId
          });

          this.collection.add(toAdd);
        } else {
          // it might be a widget name + subview in the form ShowExport__bibtex
          // id consists of widgetId + arg param
          var widgetsWithSubViews = _.pick(tocData, function (v, k) {
            return k.split('__') && k.split('__')[0] == widgetId;
          });

          _.each(widgetsWithSubViews, function (v, k) {
            // arg is the identifying factor-- joining with double underscore so it can be split later
            var toAdd = _.extend(_.clone(v), {
              id: k
            });

            this.collection.add(toAdd);
          }, this);
        }
      } else if (event == 'widget-ready') {
        // if there are no docs then go to the default view and exit here
        if (data.noDocs) {
          return this.selectDefaultNavItem();
        }

        var model = this.collection.get(data.widgetId);

        _.defaults(data, {
          isActive: !!data.numFound
        });

        if (model) {
          model.set(_.pick(data, model.keys()));
        } // if the widget should reset, switch to the default view


        if (data.shouldReset) {
          if (model && model.get('isSelected')) {
            this.selectDefaultNavItem();
          }

          model && model.set('isActive', false);
        }
      } else if (event === 'broadcast-payload') {
        this.model.set('bibcode', data.bibcode);
      } else if (event == 'dynamic-nav') {// expects object like {links : [{title: x, id : y}]}
        // insert dynamic nav entries into the nav template
      }
    }
  });
  return TocNavigationView;
});

define('js/page_managers/toc_controller',['underscore', 'marionette', './controller', './toc_widget', 'analytics'], function (_, Marionette, BasicPageManagerController, TOCWidget, analytics) {
  /*
   * need to provide a toc template for the toc view when you inherit from this
   * */
  var PageManagerController = BasicPageManagerController.extend({
    initialize: function initialize() {
      BasicPageManagerController.prototype.initialize.apply(this, arguments); // debounce this method to keep from double navigating

      if (!window.__BUMBLEBEE_TESTING_MODE__) {
        this.onWidgetSelected = _.debounce(_.bind(this.onWidgetSelected, this), 100);
      }
    },
    createView: function createView(options) {
      if (this.pageConfig) {
        return new this.pageConfig.view(_.extend(options, {
          template: this.pageConfig.template
        }));
      }

      return BasicPageManagerController.prototype.createView.call(this, options);
    },
    assemble: function assemble(app) {
      var defer = $.Deferred();

      if (!this.navConfig) {
        defer.reject(new Error('TOC widget is being assembled without navigation configuration (navConfig)'));
        return defer.promise();
      }

      if (this.assembled) {
        defer.resolve();
        return defer.promise();
      }

      var self = this;
      BasicPageManagerController.prototype.assemble.apply(this, arguments).done(function () {
        var tocTemplate = Marionette.getOption(self, 'TOCTemplate');

        if (self.TOCEvents) {
          // initiate the TOC view
          self.widgets.tocWidget = new TOCWidget({
            template: tocTemplate,
            events: Marionette.getOption(self, 'TOCEvents'),
            navConfig: Marionette.getOption(self, 'navConfig')
          });
        } else {
          // initiate the TOC view
          self.widgets.tocWidget = new TOCWidget({
            template: tocTemplate,
            navConfig: Marionette.getOption(self, 'navConfig')
          });
        } // insert the TOC nav view into its slot


        self.view.$('.nav-container').append(self.widgets.tocWidget.render().el);

        _.each(_.keys(self.widgets), function (w) {
          self.listenTo(this.widgets[w], 'page-manager-event', _.bind(this.onPageManagerEvent, this, this.widgets[w]));
          self.broadcast('page-manager-message', 'new-widget', w);
        }, self);

        defer.resolve();
      });
      return defer.promise();
    },

    /**
     * Listens to and receives signals from managed widgets.
     * It will discover their 'widgetId' and broadcasts the
     * data via a page-manager-message to all widgets in the
     * collection.
     *
     * @param event
     * @param data
     */
    onPageManagerEvent: function onPageManagerEvent(widget, event, data) {
      data = data || {};
      var sender = null;
      var widgetId = null; // try to find/identify sender

      if (widget) {
        _.each(_.pairs(this.widgets), function (w) {
          if (w[1] === widget) {
            widgetId = w[0];
            sender = w[1];
          }
        });
      }

      if (event == 'widget-ready' && sender !== null) {
        data.widgetId = widgetId;
        this.broadcast('page-manager-message', event, data);
      } else if (event == 'widget-selected') {
        this.onWidgetSelected.apply(this, arguments);
      } else if (event == 'broadcast-payload') {
        this.broadcast('page-manager-message', event, data);
      } else if (event == 'navigate') {
        // XXX:rca - why to almost equal events?
        this.getPubSub().publish(this.getPubSub().NAVIGATE, data.navCommand, data.sub);
      } else if (event == 'apply-function') {
        // XXX:rca - to remove
        data.func.apply(this);
      }
    },
    onWidgetSelected: function onWidgetSelected(widget, event, data) {
      var bibcode = widget.model.get('bibcode');
      var target = data.idAttribute.toLowerCase().replace('show', '');
      analytics('send', 'event', 'interaction', 'toc-link-followed', {
        target: target,
        bibcode: bibcode
      });
      this.broadcast('page-manager-message', 'widget-selected', data);
      this.getPubSub().publish(this.getPubSub().NAVIGATE, data.idAttribute, data);
    },
    onPageManagerMessage: _.noop,
    setActive: function setActive(widgetName, subView) {
      // now inform the widget of the subView to show
      if (subView && this.widgets[widgetName].setSubView instanceof Function) {
        this.widgets[widgetName].setSubView(subView);
      }

      if (subView) {
        widgetName = widgetName + '__' + subView;
      }

      this.widgets.tocWidget.collection.selectOne(widgetName);
    },
    onDestroy: function onDestroy() {
      this.stopListening();
      this.widgets = {};
      this.view.destroy();
    }
  });
  return PageManagerController;
});

define('js/services/api',['underscore', 'jquery', 'js/components/generic_module', 'js/components/api_request', 'js/mixins/dependon', 'js/components/api_response', 'js/components/api_query', 'js/components/api_feedback', 'js/mixins/hardened', 'js/mixins/api_access', 'moment'], function (_, $, GenericModule, ApiRequest, Mixin, ApiResponse, ApiQuery, ApiFeedback, Hardened, ApiAccess, Moment) {
  var Api = GenericModule.extend({
    url: '/api/1/',
    // usually overriden during app bootstrap
    clientVersion: null,
    outstandingRequests: 0,
    access_token: null,
    refresh_token: null,
    expire_in: null,
    defaultTimeoutInMs: 60000,
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
    },
    done: function done(data, textStatus, jqXHR) {
      // TODO: check the status responses
      var response = new ApiResponse(data);
      response.setApiQuery(this.request.get('query'));
      this.api.trigger('api-response', response);
    },
    fail: function fail(jqXHR, textStatus, errorThrown) {
      console.error('API call failed:', JSON.stringify(this.request.url()), jqXHR.status, errorThrown);
      var pubsub = this.api.hasBeeHive() ? this.api.getPubSub() : null;

      if (pubsub) {
        var feedback = new ApiFeedback({
          code: ApiFeedback.CODES.API_REQUEST_ERROR,
          msg: textStatus,
          request: this.request,
          error: jqXHR,
          psk: this.key || this.api.getPubSub().getCurrentPubSubKey(),
          errorThrown: errorThrown,
          text: textStatus,
          beVerbose: true
        });
        pubsub.publish(pubsub.FEEDBACK, feedback);
      } else if (this.api) this.api.trigger('api-error', this, jqXHR, textStatus, errorThrown);
    },
    initialize: function initialize() {
      this.always = _.bind(function () {
        this.outstandingRequests--;
      }, this);
    },
    getNumOutstandingRequests: function getNumOutstandingRequests() {
      return this.outstandingRequests;
    },
    // used by api_access.js
    setVals: function setVals(obj) {
      _.each(obj, function (v, k) {
        this[k] = v;
      }, this);
    },

    /**
     * Before executing an ajax request, this will be passed
     * the options and can modify them. Typically, clients
     * make want to provide their own implementation.
     *
     * @param opts
     */
    modifyRequestOptions: function modifyRequestOptions(opts) {// do nothing
    },
    hardenedInterface: {
      request: 'make a request to the API',
      setVals: 'set a value on API (such as new access token)'
    }
  });

  Api.prototype._request = function (request, options) {
    options = _.extend({}, options, request.get('options'));
    var data;
    var self = this;
    var query = request.get('query');

    if (query && !(query instanceof ApiQuery)) {
      throw Error('Api.query must be instance of ApiQuery');
    }

    if (query) {
      data = options.contentType === 'application/json' ? JSON.stringify(query.toJSON()) : query.url();
    }

    var target = request.get('target') || '';
    var u;

    if (target.indexOf('http') > -1) {
      u = target;
    } else {
      u = this.url + (target.length > 0 && target.indexOf('/') == 0 ? target : target ? '/' + target : target);
    }

    u = u.substring(0, this.url.length - 2) + u.substring(this.url.length - 2, u.length).replace('//', '/');

    if (!u) {
      throw Error("Sorry, you can't use api without url");
    }

    var opts = {
      type: 'GET',
      url: u,
      dataType: 'json',
      data: data,
      contentType: 'application/x-www-form-urlencoded',
      context: {
        request: request,
        api: self
      },
      timeout: this.defaultTimeoutInMs,
      headers: {},
      cache: true // do not generate _ parameters (let browser cache responses),

    };

    if (options.timeout) {
      opts.timeout = options.timeout;
    }

    if (this.clientVersion) {
      opts.headers['X-BB-Api-Client-Version'] = this.clientVersion;
    }

    if (this.access_token) {
      opts.headers.Authorization = this.access_token;

      if (/accounts\/bootstrap/i.test(target)) {
        opts.headers.Authorization = '';
      }
    } // extend, rather than replace, the headers with user-supplied headers if any


    _.extend(opts.headers, options.headers); // one potential problem is that 'options' will override
    // whatever is set above (other than headers) (so if sb wants to shoot himself/herself,
    // we gave them the weapon... ;-))


    _.extend(opts, _.omit(options, 'headers'));

    this.outstandingRequests++;
    this.modifyRequestOptions(opts, request); // use the native fetch api for sending the request
    // this can help with downloading blob and other non-text responses

    if (options.useFetch && options.fetchOptions) {
      var fetchOpts = _.assign({
        credentials: 'include',
        mode: 'cors',
        timeout: this.defaultTimeoutInMs
      }, options.fetchOptions);

      fetchOpts.headers = _.assign({
        'Content-Type': opts.contentType
      }, opts.headers, options.fetchOptions.headers);
      var prom = window.fetch(opts.url, fetchOpts).then(function (response) {
        self.always.call(opts.context, response);

        if (_.isFunction(opts.always)) {
          opts.always.call(opts.context, response);
        } // handle any response errors (404, 500, etc.)


        if (!response.ok) {
          (opts.fail || self.fail).call(opts.context, response);
          throw Error(response.statusText);
        } // otherwise call done


        (opts.done || self.done).call(opts.context, response);
      }) // handle network errors
      .catch(function (error) {
        (opts.fail || self.fail).call(opts.context, error);
        throw Error(error);
      }); // add a done property to the promise so it plays well with
      // methods expecting jquery

      return _.extend(prom, {
        done: prom.then,
        fail: prom.catch
      });
    }

    var jqXhr = $.ajax(opts).always(opts.always ? [this.always, opts.always] : this.always).done(opts.done || this.done).fail(opts.fail || this.fail);
    jqXhr = jqXhr.promise(jqXhr);
    return jqXhr;
  }; // stubbable for testing


  Api.prototype.getCurrentUTCMoment = function () {
    return Moment().utc();
  };

  Api.prototype.request = function (request, options) {
    var that = this;
    var refreshRetries = 3;

    var refreshToken = function refreshToken() {
      var d = $.Deferred();
      var req = that.getApiAccess({
        tokenRefresh: true,
        reconnect: true
      });
      req.done(function () {
        d.resolve(that._request(request, options));
      });
      req.fail(function () {
        --refreshRetries > 0 ? _.delay(refreshToken, 1000) : d.reject.apply(d, arguments);
      });
      return d.promise();
    };

    if (!this.expire_in) {
      return refreshToken();
    } // expire_in is in UTC, not local time


    var expiration = Moment.utc(this.expire_in);
    var now = this.getCurrentUTCMoment();
    var difference = now.diff(expiration, 'minutes'); // fewer than 2 minutes before token expires

    return difference > -2 ? refreshToken() : that._request(request, options);
  };

  _.extend(Api.prototype, Mixin.BeeHive, Hardened, ApiAccess);

  return Api;
});

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Provides the nervous system of the application. There may exist
 * different breeds of this animal and application can choose
 * which ones to use.
 *
 * The intended usage is this:
 *
 *   1. Applicaiton creates a PubSub [any implementation]
 *   2. Application loads modules/views and gives them this PubSub
 *      - modules/views can subscribe to the PubSub (ie. view.listenTo(PubSub)
 *      - modules can trigger events through the PubSub (ie. pubSub.trigger('name', ....))
 *   3. Application activates the PubSub and calls 'self-check'
 *      - the pubsub will check whether it contains providers that can handle
 *        all signals
 *
 *
 * All topics subscribed to are broadcasted using Backbone.Event. The modules/view have
 * no access to the Application object. The PubSub serves as a 'middleman'
 *
 * For the moment, this object is not protected (you should implement) the facade
 * that hides it. But it provides all necessary functionality to make it robust and
 * secured. Ie. only modules with approprite keys can subscribe/publish/unscubscribe
 *
 * Also, errors are caught and counted. Actions can be fired to treat offending
 * callbacks.
 * */
define('js/services/default_pubsub',['backbone', 'underscore', 'js/components/generic_module', 'js/components/pubsub_key'], function (Backbone, _, GenericModule, PubSubKey) {
  // unfortunately, these methods are not part of the BB.Events class
  // so we have to duplicate them iff we want to provide a queue which
  // handles failed callbacks
  // ------------------------ copied from BB ------------------------------------------
  // Regular expression used to split event strings.
  var eventSplitter = /\s+/; // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.

  var eventsApi = function eventsApi(obj, action, name, rest) {
    if (!name) return true; // Handle event maps.

    if (_typeof(name) === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }

      return false;
    } // Handle space separated event names.


    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);

      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }

      return false;
    }

    return true;
  }; // ------------------------ /copied from BB ------------------------------------------


  var PubSub = GenericModule.extend({
    className: 'PubSub',
    initialize: function initialize(options) {
      this._issuedKeys = {};
      this.strict = true;
      this.handleErrors = true;
      this._errors = {};
      this.errWarningCount = 10; // this many errors trigger warning

      _.extend(this, _.pick(options, ['strict', 'handleErrors', 'errWarningCount']));

      this.pubSubKey = PubSubKey.newInstance({
        creator: {}
      }); // this.getPubSubKey(); // the key the pubsub uses for itself

      this._issuedKeys[this.pubSubKey.getId()] = this.pubSubKey.getCreator();
      this.running = true;
      this.debug = false;
    },

    /*
     * when pubsub is activated it will issue signal 'pubsub.starting'
     * and it will check whether there are events that cannot possibly
     * by handled by some listeners
     */
    start: function start() {
      this.publish(this.pubSubKey, this.OPENING_GATES);
      this.publish(this.pubSubKey, this.OPEN_FOR_BUSINESS);
      this.running = true;
    },

    /*
     * Sends a signal 'pubsub.closing' to all listeners and then
     * immediately shuts down the queue and removes any keys
     */
    destroy: function destroy() {
      this.publish(this.pubSubKey, this.CLOSING_GATES);
      this.off();
      this.publish(this.pubSubKey, this.CLOSED_FOR_BUSINESS);
      this.running = false;
      this._issuedKeys = {};
    },

    /*
     * subscribe() -> undefined or error
     *
     *  - key: instance of PubSubKey (it must be known
     *         to this PubSub - so typically it is a key
     *         issued by this PubSub)
     *  - name: string, name of the event (can be name
     *         accepted by Backbone)
     *  - callback: a function to call (you cannot supply
     *         context, so if the callback needs to be bound
     *         use: _.bind(callback, context)
     *
     */
    subscribe: function subscribe(key, name, callback) {
      if (!this.isRunning()) {
        throw new Error('PubSub has been closed, ignoring futher requests');
      }

      this._checkKey(key, name, callback);

      if (_.isUndefined(name)) {
        throw new Error('You tried to subscribe to undefined event. Error between chair and keyboard?');
      }

      this.on(name, callback, key); // the key becomes context

      if (name.indexOf(key.getId()) == -1) this.on(name + key.getId(), callback, key); // this is for individual responses
    },

    /*
     * subscribeOnce() -> undefined or error
     *
     *  Just like subscribe, but it will be removed by PubSub once
     *  it has been called
     *
     *  - key: instance of PubSubKey (it must be known
     *         to this PubSub - so typically it is a key
     *         issued by this PubSub)
     *  - name: string, name of the event (can be name
     *         accepted by Backbone)
     *  - callback: a function to call (you cannot supply
     *         context, so if the callback needs to be bound
     *         use: _.bind(callback, context)
     *
     */
    subscribeOnce: function subscribeOnce(key, name, callback) {
      this._checkKey(key, name, callback);

      if (_.isUndefined(name)) {
        throw new Error('You tried to subscribe to undefined event. Error between chair and keyboard?');
      }

      this.once(name, callback, key); // the key becomes context

      if (name.indexOf(key.getId()) == -1) this.once(name + key.getId(), callback, key); // this is for individual responses
    },

    /*
     * unsubscribe() -> undefined or error
     *
     *  - key: instance of PubSubKey (it must be known
     *         to this PubSub - so typically it is a key
     *         issued by this PubSub)
     *  - name: string, name of the event (can be name
     *         accepted by Backbone)
     *  - callback: a function to call (you cannot supply
     *         context, so if the callback needs to be bound
     *         use: _.bind(callback, context)
     *
     *  When you supply only:
     *   - key: all callbacks registered under this key will
     *          be removed
     *   - key+name: all callbacks for this key (module) and
     *         event will be removed
     *   - key+name+callback: the most specific call, it will
     *         remove only one callback (if it is there)
     *
     */
    unsubscribe: function unsubscribe(key, name, callback) {
      this._checkKey(key, name, callback);

      var context = key;

      if (name && callback) {
        this.off(name, callback, context);
        this.off(name + key.getId(), callback, context);
      } else if (name || callback) {
        this.off(name, callback, context);
        this.off(name + key.getId(), callback, context);
      } else {
        // remove all events of this subscriber
        var names = _.keys(this._events);

        var name;
        var events;
        var ev;
        var i;
        var l;
        var k;
        var j;
        var toRemove = [];

        for (i = 0, l = names.length; i < l; i++) {
          name = names[i];

          if (events = this._events[name]) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];

              if (ev.context === context) {
                toRemove.push({
                  name: name,
                  event: ev
                });
              }
            }
          }
        }

        _.each(toRemove, function (x) {
          this.off(x.name, x.event.callback, x.event.context);
        }, this);
      }
    },

    /*
     * publish(key, event-name, arguments...) -> undef
     *
     * Publish the message with any set of arguments
     * into the queue. No checking is done whether there
     * are callbacks that can handle the event
     */
    publish: function publish() {
      if (!this.isRunning()) {
        console.error('PubSub has been closed, ignoring futher requests');
        return;
      }

      this._checkKey(arguments[0]);

      var args = Array.prototype.slice.call(arguments, 1);

      if (args.length == 0 || _.isUndefined(args[0])) {
        throw new Error('You tried to trigger undefined event. Error between chair and keyboard?');
      } // push the key back into the arguments (it identifies the sender)


      args.push(arguments[0]); // console.log('publishing', arguments, args);
      // this is faster, default BB implementation

      if (!this.handleErrors) {
        return this.trigger.apply(this, args);
      } // safer, default


      return this.triggerHandleErrors.apply(this, args);
    },
    getCurrentPubSubKey: function getCurrentPubSubKey() {
      return this.pubSubKey;
    },

    /*
     * getPubSubKey() -> PubSubKey
     *
     * Returns a new instance of PubSubKey - every
     * subscriber must obtain one instance of the key
     * and use it for all calls to publish/(un)subscribe
     *
     * If this queue is running in a strict mode, the
     * keys will be remembered and they will be checked
     * during the calls.
     */
    getPubSubKey: function getPubSubKey() {
      var k = PubSubKey.newInstance({
        creator: this.pubSubKey
      }); // creator identifies issuer of the key

      if (this.strict) {
        if (this._issuedKeys[k.getId()]) {
          throw Error('The key with id', k.getId(), 'has been already registered!');
        }

        this._issuedKeys[k.getId()] = k.getCreator();
      }

      return k;
    },

    /*
     * Says whether this PubSub is running in a strict mode
     */
    isStrict: function isStrict() {
      return this.strict;
    },

    /*
     * Checks the key - subscriber must supply it when calling
     */
    _checkKey: function _checkKey(key, name, callback) {
      if (this.strict) {
        if (_.isUndefined(key)) {
          throw new Error('Every request must be accompanied by PubSubKey');
        }

        if (!(key instanceof PubSubKey)) {
          throw new Error('Key must be instance of PubSubKey. ' + "(If you are trying to pass context, you can't do that. Instead, " + 'wrap your callback into: _.bind(callback, context))' + '\n' + 'Perhaps the PubSub you are using is the non-protected version?');
        }

        if (!this._issuedKeys.hasOwnProperty(key.getId())) {
          throw new Error("Your key is not known to us, sorry, you can't use this queue.");
        }

        if (this._issuedKeys[key.getId()] !== key.getCreator()) {
          throw new Error("Your key has wrong identity, sorry, you can't use this queue.");
        }
      }
    },
    // Copied and modified version of the BB trigger - we deal with errors
    // and optionally execute stuff asynchronously
    triggerHandleErrors: function triggerHandleErrors(name) {
      // almost the same as BB impl, but we call local triggerEvents
      // that do error handling
      if (!this._events) return this;
      var args = Array.prototype.slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) this.triggerEvents(events, args);
      if (allEvents) this.triggerEvents(allEvents, arguments);
      return this;
    },
    // A modified version of BB - errors will not disrupt the queue
    triggerEvents: function triggerEvents(events, args) {
      var ev;
      var i = -1;
      var l = events.length;
      var a1 = args[0];
      var a2 = args[1];
      var a3 = args[2];

      switch (args.length) {
        case 0:
          while (++i < l) {
            try {
              (ev = events[i]).callback.call(ev.ctx);
            } catch (e) {
              this.handleCallbackError(e, ev, args);
            }
          }

          return;

        case 1:
          while (++i < l) {
            try {
              (ev = events[i]).callback.call(ev.ctx, a1);
            } catch (e) {
              this.handleCallbackError(e, ev, args);
            }
          }

          return;

        case 2:
          while (++i < l) {
            try {
              (ev = events[i]).callback.call(ev.ctx, a1, a2);
            } catch (e) {
              this.handleCallbackError(e, ev, args);
            }
          }

          return;

        case 3:
          while (++i < l) {
            try {
              (ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
            } catch (e) {
              this.handleCallbackError(e, ev, args);
            }
          }

          return;

        default:
          while (++i < l) {
            try {
              (ev = events[i]).callback.apply(ev.ctx, args);
            } catch (e) {
              this.handleCallbackError(e, ev, args);
            }
          }

      }
    },
    // the default implementation just counts the number of errors per module (key) and
    // triggers pubsub.many_errors
    handleCallbackError: function handleCallbackError(e, event, args) {
      console.warn('[PubSub] Error: ', event, args, e.message, e.stack);

      if (this.debug) {
        throw e;
      } else {
        console.warn(e.stack);
      }

      var kid = event.ctx.getId();
      var nerr = this._errors[kid] = (this._errors[kid] || 0) + 1;

      if (nerr % this.errWarningCount == 0) {
        this.publish(this.pubSubKey, this.BIG_FIRE, nerr, e, event, args);
      }
    },
    isRunning: function isRunning() {
      return this.running;
    }
  });
  return PubSub;
});

/**
 * Created by rchyla on 3/16/14.
 */
define('js/services/pubsub',['backbone', 'underscore', 'js/mixins/hardened', 'pubsub_service_impl', 'js/components/pubsub_events'], function (Backbone, _, Hardened, PubSubImplementation, PubSubEvents) {
  var PubSub = PubSubImplementation.extend({
    /*
     * Wraps itself into a Facade that can be shared with other modules
     * (it is read-only); absolutely non-modifiable and provides the
     * following callbacks:
     *  - publish
     *  - subscribe
     *  - unsubscribe
     *  - getPubSubKey
     */
    hardenedInterface: {
      subscribe: 'register callback',
      unsubscribe: 'deregister callback',
      publish: 'send data to the queue',
      getPubSubKey: 'get secret key'
    }
  });

  _.extend(PubSub.prototype, Hardened, {
    /**
     * The PubSub hardened instance will expose different
     * api - it doesn't allow modules to pass the PubSubKey
     *
     * @param iface
     * @returns {*}
     */
    getHardenedInstance: function getHardenedInstance(iface) {
      iface = _.clone(iface || this.hardenedInterface); // build a unique key for this instance

      var ctx = {
        key: this.getPubSubKey()
      };
      var self = this; // purpose of these functions is to expose simplified
      // api (without need to pass pubsubkey explicitly)

      iface.publish = function () {
        self.publish.apply(self, [ctx.key].concat(_.toArray(arguments)));
      };

      iface.subscribe = function () {
        self.subscribe.apply(self, [ctx.key].concat(_.toArray(arguments)));
      };

      iface.unsubscribe = function () {
        self.unsubscribe.apply(self, [ctx.key].concat(_.toArray(arguments)));
      };

      iface.subscribeOnce = function () {
        self.subscribeOnce.apply(self, [ctx.key].concat(_.toArray(arguments)));
      };

      iface.getCurrentPubSubKey = function () {
        return ctx.key;
      };

      var hardened = this._getHardenedInstance(iface, this);

      _.extend(hardened, PubSubEvents);

      return hardened;
    }
  });

  _.extend(PubSub.prototype, PubSubEvents);

  return PubSub;
});

define('js/services/storage',['underscore', 'js/components/persistent_storage'], function (_, PersistentStorage) {
  // TODO:rca - make sure that the service is loaded at the bootstrap and persisted
  // before the app exits (and that nothing can change the data inbetween; we can
  // let them do that; but we'll not care for it
  var Storage = PersistentStorage.extend({
    activate: function activate(beehive) {// this.setBeeHive(beehive);
      // var pubsub = beehive.getService('PubSub');
      // pubsub.subscribeOnce(pubsub.getPubSubKey(), pubsub.APP_BOOTSTRAPPED, this.onAppBootstrapped);
    },
    onAppBootstrapped: function onAppBootstrapped() {
      var beehive = this.getBeeHive();
      var rconf = beehive.getObject('DynamicConfig');

      if (!rconf) {
        throw new Error('DynamicConfig is missing');
      }

      var name = rconf.namespace; // the unique id that identifies this application (it serves as a namespace)

      if (!name) {
        console.warn('Application namespace not set; persistent storage will be created without it');
        name = '';
      }

      this._store = this._createStore(name);
    }
  });
  return function () {
    return new Storage({
      name: 'storage-service'
    });
  };
});

define('router',['underscore', 'jquery', 'backbone', 'js/components/api_query', 'js/mixins/dependon', 'js/components/api_feedback', 'js/components/api_request', 'js/components/api_targets', 'js/mixins/api_access', 'js/components/api_query_updater'], function (_, $, Backbone, ApiQuery, Dependon, ApiFeedback, ApiRequest, ApiTargets, ApiAccessMixin, ApiQueryUpdater) {
  var Router = Backbone.Router.extend({
    initialize: function initialize(options) {
      options = options || {};
      this.queryUpdater = new ApiQueryUpdater('Router');
    },
    execute: function execute(callback, args) {
      // the routes assume the query params are the first arg, so make sure it isn't undefined
      var argsToPass = args.filter(function (a) {
        return a !== undefined;
      });

      if (_.isFunction(callback)) {
        callback.apply(this, argsToPass);
      }
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive);

      if (!this.hasPubSub()) {
        throw new Error('Ooops! Who configured this #@$%! There is no PubSub service!');
      }
    },

    /*
     * if you don't want the navigator to duplicate the route in history,
     * use this function instead of pubsub.publish(pubsub.NAVIGATE ...)
     * */
    routerNavigate: function routerNavigate(route, options) {
      var options = options || {};
      this.getPubSub().publish(this.getPubSub().NAVIGATE, route, options);
    },
    routes: {
      '/': 'index',
      '': 'index',
      'classic-form(/)': 'classicForm',
      'paper-form(/)': 'paperForm',
      'index/(:query)': 'index',
      'search/(:query)(/)(:widgetName)': 'search',
      'search(/)(?:query)': 'search',
      'execute-query/(:query)': 'executeQuery',
      'feedback/(:subview)': 'feedbackPage',
      'abs/*path': 'view',

      /*
       * user endpoints require user to be logged in, either
       * to orcid or to ads
       * */
      'user/orcid*(:subView)': 'orcidPage',
      'user/account(/)(:subView)': 'authenticationPage',
      'user/account/verify/(:subView)/(:token)': 'routeToVerifyPage',
      'user/settings(/)(:subView)(/)': 'settingsPage',
      'user/libraries(/)(:id)(/)(:subView)(/)(:subData)(/)': 'librariesPage',
      'user/home(/)': 'homePage',

      /* end user routes */
      'orcid-instructions(/)': 'orcidInstructions',
      'public-libraries/(:id)(/)': 'publicLibraryPage',
      '*invalidRoute': 'noPageFound'
    },
    index: function index(query) {
      this.routerNavigate('index-page');
    },
    classicForm: function classicForm() {
      var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      this.routerNavigate('ClassicSearchForm', {
        query: new ApiQuery().load(query)
      });
    },
    paperForm: function paperForm() {
      this.routerNavigate('PaperSearchForm');
    },
    feedbackPage: function feedbackPage(subview, query) {
      var q = new ApiQuery();

      if (query) {
        try {
          q.load(query);
        } catch (e) {// ignore query loading errors
        }
      }

      this.routerNavigate("ShowFeedback", {
        subview: subview,
        href: "#feedback/".concat(subview),
        bibcode: q.has('bibcode') ? q.get('bibcode')[0] : null
      });
    },
    search: function search(query, widgetName) {
      if (query) {
        try {
          var q = new ApiQuery().load(query);
          this.routerNavigate('search-page', {
            q: q,
            page: widgetName && 'show-' + widgetName,
            replace: true
          });
        } catch (e) {
          console.error('Error parsing query from a string: ', query, e);
          this.getPubSub().publish(this.getPubSub().NAVIGATE, 'index-page');
          this.getPubSub().publish(this.getPubSub().BIG_FIRE, new ApiFeedback({
            code: ApiFeedback.CODES.CANNOT_ROUTE,
            reason: 'Cannot parse query',
            query: query
          }));
          return this.getPubSub().publish(this.getPubSub().ALERT, new ApiFeedback({
            code: ApiFeedback.CODES.ALERT,
            msg: 'unable parse query',
            type: 'danger',
            modal: true
          }));
        }
      } else {
        this.getPubSub().publish(this.getPubSub().NAVIGATE, 'index-page', {
          replace: true
        });
      }
    },
    executeQuery: function executeQuery(queryId) {
      this.getPubSub().publish(this.getPubSub().NAVIGATE, 'execute-query', queryId);
    },
    view: function view(path) {
      if (!path) {
        return this.routerNavigate('404');
      } // break apart the path


      var parts = path.split('/'); // check for a subpage

      var subPage;
      var subPageRegex = /^(abstract|citations|references|coreads|similar|toc|graphics|metrics|exportcitation)$/;

      if (parts[parts.length - 1].match(subPageRegex)) {
        subPage = parts.pop();
      } // take the rest and combine into the identifier


      var id = parts.join('/');
      var navigateString, href;

      if (!subPage) {
        navigateString = 'ShowAbstract';
        href = '#abs/' + encodeURIComponent(id) + '/abstract';
      } else {
        navigateString = 'Show' + subPage[0].toUpperCase() + subPage.slice(1);
        href = '#abs/' + encodeURIComponent(id) + '/' + subPage;
      }

      this.routerNavigate(navigateString, {
        href: href,
        bibcode: id
      });
    },
    routeToVerifyPage: function routeToVerifyPage(subView, token) {
      this.getPubSub().publish(this.getPubSub().NAVIGATE, 'user-action', {
        subView: subView,
        token: token
      });
    },
    orcidPage: function orcidPage() {
      this.getPubSub().publish(this.getPubSub().NAVIGATE, 'orcid-page');
    },
    orcidInstructions: function orcidInstructions() {
      this.getPubSub().publish(this.getPubSub().NAVIGATE, 'orcid-instructions');
    },
    authenticationPage: function authenticationPage(subView) {
      // possible subViews: "login", "register", "reset-password"
      if (subView && !_.contains(['login', 'register', 'reset-password-1', 'reset-password-2'], subView)) {
        throw new Error("that isn't a subview that the authentication page knows about");
      }

      this.routerNavigate('authentication-page', {
        subView: subView
      });
    },
    settingsPage: function settingsPage(subView) {
      // possible subViews: "token", "password", "email", "preferences"
      if (_.contains(['token', 'password', 'email', 'delete'], subView)) {
        this.routerNavigate('UserSettings', {
          subView: subView
        });
      } else if (_.contains(['librarylink', 'orcid', 'application'], subView)) {
        // show preferences if no subview provided
        this.routerNavigate('UserPreferences', {
          subView: subView
        });
      } else if (_.contains(['libraryimport'], subView)) {
        this.routerNavigate('LibraryImport');
      } else if (_.contains(['myads'], subView)) {
        this.routerNavigate('MyAdsDashboard');
      } else {
        // just default to showing the library link page for now
        this.routerNavigate('UserPreferences', {
          subView: undefined
        });
      }
    },
    librariesPage: function librariesPage(id, subView, subData) {
      if (id) {
        if (id === 'actions') {
          return this.routerNavigate('LibraryActionsWidget', 'libraries');
        } // individual libraries view


        var subView = subView || 'library';

        if (_.contains(['library', 'admin'], subView)) {
          this.routerNavigate('IndividualLibraryWidget', {
            subView: subView,
            id: id
          });
        } else if (_.contains(['export', 'metrics', 'visualization'], subView)) {
          subView = 'library-' + subView;

          if (subView == 'library-export') {
            this.routerNavigate(subView, {
              subView: subData || 'bibtex',
              id: id
            });
          } else if (subView == 'library-metrics') {
            this.routerNavigate(subView, {
              id: id
            });
          }
        } else {
          throw new Error('did not recognize subview for library view');
        }
      } else {
        // main libraries view
        this.routerNavigate('AllLibrariesWidget', 'libraries');
      }
    },
    publicLibraryPage: function publicLibraryPage(id) {
      // main libraries view
      this.getPubSub().publish(this.getPubSub().NAVIGATE, 'IndividualLibraryWidget', {
        id: id,
        publicView: true,
        subView: 'library'
      });
    },
    homePage: function homePage(subView) {
      this.routerNavigate('home-page', {
        subView: subView
      });
    },
    noPageFound: function noPageFound() {
      this.routerNavigate('404');
    },
    _extractParameters: function _extractParameters(route, fragment) {
      return _.map(route.exec(fragment).slice(1), function (param) {
        // do not decode api queries
        if (/q\=/.test(param)) {
          return param;
        }

        return param ? decodeURIComponent(param) : param;
      });
    }
  });

  _.extend(Router.prototype, Dependon.BeeHive, ApiAccessMixin);

  return Router;
});

define('recaptcha',[], function () {
  var URLS = ['//google.com/recaptcha/api.js?&render=explicit&onload=onRecaptchaLoad', '//recaptcha.net/recaptcha/api.js?&render=explicit&onload=onRecaptchaLoad'];
  var recaptcha = {
    load: function load(name, req, onload) {
      // make a global deferred that will be used by the recaptcha_manager
      window.__grecaptcha__ = $.Deferred(); // add the global handler which will be called by the recaptcha script

      window.onRecaptchaLoad = function () {
        window.__grecaptcha__.resolve(window.grecaptcha);
      }; // load each url, we don't care if they take a while or fail


      URLS.forEach(function (url) {
        return req([url]);
      }); // load our resource right away, don't wait for recaptcha to be ready

      req([name], function (value) {
        return onload(value);
      });
    }
  };
  return recaptcha;
});

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define('reactify',[], function () {
  var reactify = {
    load: function load(name, req, onload) {
      var parts = name.split('?');
      var module = parts[0];
      var component = parts[1];
      req([module, "js/react/".concat(component, "/index")], function (loadedModule, Component) {
        // inject the react component as the view
        onload(loadedModule.extend({
          initialize: function initialize(args) {
            this.view = new Component();
            loadedModule.prototype.initialize.call(this, _objectSpread({
              componentId: component
            }, args));
          }
        }));
      });
    }
  };
  return reactify;
});

/**
 * Set of utilities for debugging BBB and Api in general
 *
 * To compare two Api endpoints (but you must have access to the solr instance):
 *
 *    d = bbb.getController('Diagnostics');u1='http://54.174.175.209:8983';u2='http://54.173.87.140:8983'
 *    d.compareTwoSearchInstances(u1,u2).done(d.printComparison)
 */
define('js/bugutils/diagnostics',['jquery', 'underscore', 'js/components/api_query', 'js/components/api_request', 'js/components/api_response', 'js/mixins/dependon', 'js/components/generic_module', 'sprintf', 'js/components/api_targets'], function ($, _, ApiQuery, ApiRequest, ApiResponse, Dependon, GenericModule, sprintf, ApiTargets) {
  var Diagnostics = GenericModule.extend({
    activate: function activate(beehive, app) {
      this.setApp(app);
      this.setBeeHive(beehive);
    },
    getFirstDoc: function getFirstDoc(queryString, options) {
      var opts = {
        query: {
          q: queryString,
          fl: 'title,abstract,bibcode,id,author'
        },
        target: ApiTargets.SEARCH
      };

      if (options) {
        _.extend(opts, options);
      }

      var promise = $.Deferred();
      this.apiRequest(opts).done(function (res) {
        promise.resolve(res.response.docs[0]);
      });
      return promise.promise();
    },

    /**
     * Helper methods, you can pass in json structure to make api request
     *
     * @param options
     *    {
     *      target: 'search/query',
     *      query: {'q': 'title:foo'}
     *    }
     * @returns Deferred
     */
    apiRequest: function apiRequest(options, reqOptions) {
      var app = this.getApp();
      var api = app.getService('Api');
      options = options || {};
      if (!options.query) throw Error('You must pass in "query"');
      if (!(options.query instanceof ApiQuery)) options.query = new ApiQuery(options.query);
      var r = new ApiRequest({
        target: options.target || ApiTargets.SEARCH,
        query: options.query
      });
      return api.request(r, reqOptions);
    },

    /**
     * Makes $.ajax() request adding Authorization header
     * usage:
     *  disc.ajax({'foo': 'bar'}).done(function(data) {.....})
     *
     * @param options
     * @returns {*}
     */
    ajax: function ajax(options) {
      var app = this.getApp();
      var api = app.getService('Api');
      options.headers = options.header || {};
      options.headers.Authorization = api.access_token;
      return $.ajax(options);
    },

    /**
     * Makes $.ajax() solr to SOLR, useful for cross-site
     * requests when you have access to the real solr
     *
     * @param options
     */
    jsonp: function jsonp(options, jsonpParameter) {
      options.dataType = 'jsonp';

      options.beforeSend = function (promise, xhr) {
        var parts = xhr.url.split('&');

        _.each(parts, function (p) {
          if (p.startsWith('callback=')) {
            xhr.url += '&' + (jsonpParameter || 'json.wrf') + '=' + p.replace('callback=', ''); // jQuery generates a random callback, we'll pass it to solr
          }
        });
      };

      return this.ajax(options);
    },
    printComparison: function printComparison(result) {
      var res = [];
      var format = '%40s %40s %40s %10s';
      res.push(sprintf.sprintf(format, 'field', result.first, result.second, 'diff'));
      res.push('------------------------------------------------------------------------------------------------------------------------------------');

      for (var f in result.fields) {
        var x = result.fields[f];
        res.push(sprintf.sprintf(format, f, x.first, x.second, x.diff));
      }

      console.log(res.join('\n'));
      return res;
    },
    compareTwoSearchInstances: function compareTwoSearchInstances(url1, url2, listOfFields, listOfFields2) {
      var self = this;
      var result = $.Deferred();

      if (!listOfFields || !listOfFields2) {
        var d1 = this.getListOfFields(url1);
        var d2 = this.getListOfFields(url2);
        $.when(d1, d2).done(function (v1, v2) {
          self.compareTwoSearchInstances(url1, url2, v1, v2).done(function (res) {
            result.resolve(res);
          });
        });
      } else {
        var c1 = this.countDocsInFields(url1, listOfFields);
        var c2 = this.countDocsInFields(url2, listOfFields2);
        $.when(c1, c2).done(function (v1, v2) {
          var fV1 = _.keys(v1.fields);

          var fV2 = _.keys(v2.fields);

          var fAll = _.unique(fV1.concat(fV2)).sort();

          var res = {};

          for (var k in fAll) {
            k = fAll[k];
            var o = v1.fields[k];
            var n = v2.fields[k];
            res[k] = {
              first: o ? o.numFound : '--',
              second: n ? n.numFound : '--',
              diff: o && n ? n.numFound - o.numFound : '--'
            };
          }

          result.resolve({
            first: url1,
            second: url2,
            fields: res
          });
        });
      }

      return result;
    },
    getListOfFields: function getListOfFields(url) {
      var defer = $.Deferred();
      this.jsonp({
        url: url + '/admin/luke?numTerms=0&wt=json&indent=true',
        timeout: 60000
      }).done(function (data) {
        var fields = [];

        for (var fname in data.fields) {
          if (fname.startsWith('_')) continue;
          fields.push(fname);
        }

        defer.resolve(fields);
      });
      return defer;
    },

    /**
     * Get the count of numDocs and numFound for every field in the index
     * this requires either a list of fields, or it can discovery fields
     * (if /solr/collection1/admin/luke is available
     *
     * @returns {
     *   index: {data about index},
     *   fields: {
     *     name: {'numDocs' : xxxxx, 'numFound': xxxxx}
     *     }
     *   }
     */
    countDocsInFields: function countDocsInFields(url, listOfFields) {
      var result = $.Deferred();
      var self = this;
      var cycle = [];
      var cycleR = {};
      var collectedData = {};
      var finalResult = {
        fields: collectedData
      };

      for (var ix in listOfFields) {
        var fname = listOfFields[ix];
        var de = $.Deferred();
        var q = '{!lucene}' + fname + ':*';
        console.log('Getting num docs for: ' + q);
        var c = self.jsonp({
          url: url + '/query?q=' + q + '&fl=id&wt=json&indent=true',
          context: {
            field: fname,
            finalResult: finalResult,
            cycleR: cycleR
          },
          timeout: 300000 // 5mins

        }).done(function (data) {
          this.finalResult.fields[this.field] = {
            numFound: data.response.numFound
          };
          var c = 0;
          var togo = [];

          for (var x in this.cycleR) {
            if (this.cycleR[x].state() == 'pending') {
              // resolved and rejected count as done
              c += 1;
              togo.push(x);
            }
          }

          console.log(url + ' Got response for: ' + this.field + ' numFound: ' + data.response.numFound + ' requests to go: ' + c + ' ' + (togo.length < 5 ? togo.join(', ') : ''));
          if (c == 0) result.resolve(this.finalResult);
        });
        cycleR[fname] = c;
        cycle.push(c);
      } // for some stupid reason this is not working, and i dont know why
      // var d = $.when.call($.when, cycle)
      //  .done(function(data) {
      //    result.resolve(collectedData);
      //  });


      return result;
    },
    request: function request(options) {
      return $.ajax(options);
    },

    /**
     * ==================================================================
     * TEST CASES; these are to be run manually from the console and only
     * by those who understand what they are doing ;-)
     * ==================================================================
     */
    testOrcidLogin: function testOrcidLogin() {
      var oa = this.getApp().getService('OrcidApi');
      oa.signOut();
      window.location = oa.config.loginUrl;
    },

    /**
     * Upload one document to orcid;
     * Prerequisite: testOrcidLogin()
     */
    testOrcidSendingData: function testOrcidSendingData() {
      var app = this.getApp();
      var self = this;
      this.getFirstDoc('bibcode:1978yCat.1072....0C').done(function (doc) {
        var oa = app.getService('OrcidApi');
        oa.addWorks([doc]).done(function (result) {
          console.log('result:', result, 'expected: {}');
        });
      });
    },
    printPubSubSubscribers: function printPubSubSubscribers(printAllKeys) {
      var pubsub = this.getApp().getService('PubSub');
      var app = this.getApp(); // collect names of all the objects

      var objNames = {};
      app.triggerMethodOnAll(function (name, opts) {
        if (this === pubsub) {
          // pubsub has its own (root) key
          objNames[pubsub.pubSubKey.getId()] = name;
        } else if (this.hasPubSub && this.hasPubSub()) {
          var ps = this.getPubSub();

          if (ps.getCurrentPubSubKey) {
            if (objNames[ps.getCurrentPubSubKey().getId()]) console.warn('Redefining key that already exists: ' + ps.getCurrentPubSubKey().getId() + ' ' + objNames[ps.getCurrentPubSubKey().getId()]);
            objNames[ps.getCurrentPubSubKey().getId()] = name;
          }
        } else {
          console.warn('Instance without active PubSub: ' + name, this);
        }
      });

      if (printAllKeys) {
        console.log('Printing list of all issued keys to PubSub');

        _.each(_.keys(pubsub._issuedKeys), function (k) {
          var p;
          if (pubsub._issuedKeys[k].getId && objNames[pubsub._issuedKeys[k].getId()]) p = objNames[pubsub._issuedKeys[k].getId()];
          if (p) console.log(k + '(parent:' + p + ') -> ' + objNames[k]);else console.log(k + ' -> ' + objNames[k]);
        });
      }

      var stats = {};
      console.log('Printing active subscribers to PubSub');

      _.each(pubsub._events, function (val, key, idx) {
        console.log(key + ' (' + val.length + ')');

        _.each(val, function (v) {
          var x = v.ctx.getId ? objNames[v.ctx.getId()] : 'unknown object';
          console.log('\t' + x);
          stats[x] = stats[x] ? stats[x] + 1 : 1;

          if (x == undefined) {
            if (!stats['undefined keys']) stats['undefined keys'] = [];
            stats['undefined keys'].push(key + (v.ctx.getId ? v.ctx.getId() : 'X'));
          }
        });
      });

      console.log(JSON.stringify(stats, null, ' '));
    }
  });

  _.extend(Diagnostics.prototype, Dependon.App, Dependon.BeeHive);

  return Diagnostics;
});

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

// this module is not loaded directly, it must be loaded using reactify!
// in order for the view to be dynamically injected
define('js/react/BumblebeeWidget',['underscore', 'js/widgets/base/base_widget', 'js/components/api_request', 'js/components/api_query', 'analytics'], function (_, BaseWidget, ApiRequest, ApiQuery, analytics) {
  var _getBeeHive = function getBeeHive() {
    return window.bbb.getBeeHive();
  };

  var getPubSub = function getPubSub() {
    var beehive = _getBeeHive();

    var ps = beehive.getService('PubSub');
    return ps;
  };

  var subscribe = function subscribe() {
    var ps = getPubSub();

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    ps.subscribe.apply(ps, [ps.pubSubKey].concat(args));
  };

  var publish = function publish() {
    var ps = getPubSub();

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    ps.publish.apply(ps, [ps.pubSubKey].concat(args));
  };

  var BumblebeeWidget = BaseWidget.extend({
    /**
     * @override
     */
    getBeeHive: function getBeeHive() {
      return _getBeeHive();
    },

    /**
     * @override
     */
    hasBeeHive: function hasBeeHive() {
      return true;
    },
    initialize: function initialize(_ref) {
      var _this = this;

      var componentId = _ref.componentId;
      this.view.on({
        sendRequest: _.bind(this.onSendRequest, this),
        subscribeToPubSub: _.bind(this.subscribeToPubSub, this),
        publishToPubSub: _.bind(this.publishToPubSub, this),
        doSearch: _.bind(this.doSearch, this),
        getCurrentQuery: _.bind(this.onGetCurrentQuery, this),
        isLoggedIn: _.bind(this.isLoggedIn, this),
        analyticsEvent: _.bind(this.analyticsEvent, this)
      });
      this.listenTo(this, 'page-manager-message', function (ev, data) {
        if (ev === 'widget-selected' && data.idAttribute === componentId) {
          _this.view.destroy().render();
        }
      });
      this.activate();
      this.onSendRequest = _.debounce(this.onSendRequest, 1000, {
        leading: true,
        trailing: false
      });

      if (this.view._store) {
        this._store = this.view._store;
      }
    },
    dispatch: function dispatch(_ref2) {
      var type = _ref2.type,
          args = _objectWithoutProperties(_ref2, ["type"]);

      if (this._store && typeof this._store.dispatch === 'function') {
        this._store.dispatch(_objectSpread({
          type: type
        }, args));
      }
    },
    getState: function getState() {
      return this._store.getState();
    },
    activate: function activate() {
      var ps = getPubSub();
      subscribe(ps.USER_ANNOUNCEMENT, this.handleUserAnnouncement.bind(this));
      subscribe(ps.NAVIGATE, this.handleNavigation.bind(this));
      var user = this.getBeeHive().getObject('User');

      if (user && typeof user.getUserName === 'function') {
        this.dispatch({
          type: 'USER_ANNOUNCEMENT/user_signed_in',
          payload: user.getUserName()
        });
      }
    },
    handleNavigation: function handleNavigation(event, payload) {
      var type = "NAVIGATE/".concat(event);
      this.dispatch({
        type: type,
        payload: payload
      });
    },
    handleUserAnnouncement: function handleUserAnnouncement(event, payload) {
      var type = "USER_ANNOUNCEMENT/".concat(event);
      this.dispatch({
        type: type,
        payload: payload
      });
    },
    isLoggedIn: function isLoggedIn(cb) {
      var user = this.getBeeHive().getObject('User');

      if (typeof cb === 'function') {
        cb(user.isLoggedIn());
      }
    },
    onGetCurrentQuery: function onGetCurrentQuery(callback) {
      callback(this.getCurrentQuery());
    },
    subscribeToPubSub: function subscribeToPubSub(event, callback) {
      var ps = getPubSub();
      subscribe(ps[event], callback);
    },
    publishToPubSub: function publishToPubSub(event) {
      var ps = getPubSub();

      for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      publish.apply(void 0, [ps[event]].concat(args));
    },
    doSearch: function doSearch(queryParams) {
      var query = new ApiQuery();

      if (_.isString(queryParams)) {
        query.load(queryParams);
      } else {
        query.set(_objectSpread({}, queryParams));
      }

      this.publishToPubSub('NAVIGATE', 'search-page', {
        q: query
      });
    },
    onSendRequest: function onSendRequest(_ref3) {
      var options = _ref3.options,
          target = _ref3.target,
          query = _ref3.query;
      var ps = getPubSub();
      var request = new ApiRequest({
        target: target,
        query: new ApiQuery(query)
      });
      request.set('options', _objectSpread(_objectSpread({}, options), {}, {
        contentType: target === 'search/query' ? 'application/x-www-form-urlencoded' : options.contentType,
        data: target === 'search/query' ? request.get('query').url() : options.data
      }));
      publish(ps.EXECUTE_REQUEST, request);
    },
    analyticsEvent: function analyticsEvent() {
      analytics.apply(void 0, arguments);
    }
  });
  return BumblebeeWidget;
});

/** @license
 * RequireJS plugin for async dependency load like JSONP and Google Maps
 * Author: Miller Medeiros
 * Version: 0.1.2 (2014/02/24)
 * Released under the MIT license
 */
define('async',[],function(){

    var DEFAULT_PARAM_NAME = 'callback',
        _uid = 0;

    function injectScript(src){
        var s, t;
        s = document.createElement('script'); s.type = 'text/javascript'; s.async = true; s.src = src;
        t = document.getElementsByTagName('script')[0]; t.parentNode.insertBefore(s,t);
    }

    function formatUrl(name, id){
        var paramRegex = /!(.+)/,
            url = name.replace(paramRegex, ''),
            param = (paramRegex.test(name))? name.replace(/.+!/, '') : DEFAULT_PARAM_NAME;
        url += (url.indexOf('?') < 0)? '?' : '&';
        return url + param +'='+ id;
    }

    function uid() {
        _uid += 1;
        return '__async_req_'+ _uid +'__';
    }

    return{
        load : function(name, req, onLoad, config){
            if(config.isBuild){
                onLoad(null); //avoid errors on the optimizer
            }else{
                var id = uid();
                //create a global variable that stores onLoad so callback
                //function can define new module after async load
                window[id] = onLoad;
                injectScript(formatUrl(req.toUrl(name), id));
            }
        }
    };
});

!function (r) {
  "function" == typeof define && define.amd ? define('array-flat-polyfill',r) : r();
}(function () {
  Array.prototype.flat || Object.defineProperty(Array.prototype, "flat", {
    configurable: !0,
    value: function r() {
      var t = isNaN(arguments[0]) ? 1 : Number(arguments[0]);
      return t ? Array.prototype.reduce.call(this, function (e, a) {
        return Array.isArray(a) ? e.push.apply(e, r.call(a, t - 1)) : e.push(a), e;
      }, []) : Array.prototype.slice.call(this);
    },
    writable: !0
  }), Array.prototype.flatMap || Object.defineProperty(Array.prototype, "flatMap", {
    configurable: !0,
    value: function value(r) {
      return Array.prototype.map.apply(this, arguments).flat();
    },
    writable: !0
  });
});

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var runtime = function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }

  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function define(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};

  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && _typeof(value) === "object" && hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };

  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function reset(skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },
    stop: function stop() {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function dispatchException(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function complete(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
(typeof module === "undefined" ? "undefined" : _typeof(module)) === "object" ? module.exports : {});

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
;
define("regenerator-runtime", function(){});


define("main.bundle", function(){});
