
/**
 * GENERATED FILE (edits will be overwritten):
 * This is the configuration for dist/main.config.js.
 */
requirejs.config({
  "deps": [
    "config/main.bundle"
  ],
  "waitSeconds": 30,
  "config": {
    "es6": {},
    "js/components/persistent_storage": {
      "namespace": "bumblebee"
    },
    "js/apps/discovery/main": {
      "core": {
        "controllers": {
          "FeedbackMediator": "js/wraps/discovery_mediator",
          "QueryMediator": "js/components/query_mediator",
          "Diagnostics": "js/bugutils/diagnostics",
          "AlertsController": "js/wraps/alerts_mediator",
          "Orcid": "js/modules/orcid/module",
          "SecondOrderController": "js/components/second_order_controller",
          "HotkeysController": "js/components/hotkeys_controller",
          "Experiments": "js/components/experiments"
        },
        "services": {
          "Api": "js/services/api",
          "PubSub": "js/services/pubsub",
          "Navigator": "js/apps/discovery/navigator",
          "PersistentStorage": "js/services/storage",
          "HistoryManager": "js/components/history_manager"
        },
        "objects": {
          "User": "js/components/user",
          "Session": "js/components/session",
          "DynamicConfig": "config/discovery.vars",
          "MasterPageManager": "js/page_managers/master",
          "AppStorage": "js/components/app_storage",
          "RecaptchaManager": "recaptcha!js/components/recaptcha_manager",
          "CSRFManager": "js/components/csrf_manager",
          "LibraryController": "js/components/library_controller",
          "DocStashController": "js/components/doc_stash_controller",
          "Utils": "utils"
        },
        "modules": {
          "FacetFactory": "js/widgets/facet/factory"
        }
      },
      "widgets": {
        "LandingPage": "js/wraps/landing_page_manager/landing_page_manager",
        "SearchPage": "js/wraps/results_page_manager",
        "DetailsPage": "js/wraps/abstract_page_manager/abstract_page_manager",
        "AuthenticationPage": "js/wraps/authentication_page_manager",
        "SettingsPage": "js/wraps/user_settings_page_manager/user_page_manager",
        "OrcidPage": "js/wraps/orcid_page_manager/orcid_page_manager",
        "OrcidInstructionsPage": "js/wraps/orcid-instructions-page-manager/manager",
        "ReactPageManager": "js/react/PageManager",
        "LibrariesPage": "js/wraps/libraries_page_manager/libraries_page_manager",
        "HomePage": "js/wraps/home_page_manager/home_page_manager",
        "PublicLibrariesPage": "js/wraps/public_libraries_page_manager/public_libraries_manager",
        "ErrorPage": "js/wraps/error_page_manager/error_page_manager",
        "Authentication": "js/widgets/authentication/widget",
        "UserSettings": "js/widgets/user_settings/widget",
        "UserPreferences": "js/widgets/preferences/widget",
        "LibraryImport": "js/widgets/library_import/widget",
        "BreadcrumbsWidget": "js/widgets/filter_visualizer/widget",
        "NavbarWidget": "js/widgets/navbar/widget",
        "UserNavbarWidget": "js/widgets/user_navbar/widget",
        "AlertsWidget": "js/widgets/alerts/widget",
        "ClassicSearchForm": "js/widgets/classic_form/widget",
        "SearchWidget": "js/widgets/search_bar/search_bar_widget",
        "PaperSearchForm": "js/widgets/paper_search_form/widget",
        "Results": "js/widgets/results/widget",
        "QueryInfo": "js/widgets/query_info/query_info_widget",
        "QueryDebugInfo": "js/widgets/api_query/widget",
        "ExportWidget": "js/widgets/export/widget.jsx",
        "Sort": "js/widgets/sort/widget.jsx",
        "ExportDropdown": "js/wraps/export_dropdown",
        "VisualizationDropdown": "js/wraps/visualization_dropdown",
        "AuthorNetwork": "js/wraps/author_network",
        "PaperNetwork": "js/wraps/paper_network",
        "ConceptCloud": "js/widgets/wordcloud/widget",
        "BubbleChart": "js/widgets/bubble_chart/widget",
        "AuthorAffiliationTool": "js/widgets/author_affiliation_tool/widget.jsx",
        "Metrics": "js/widgets/metrics/widget",
        "CitationHelper": "js/widgets/citation_helper/widget",
        "OrcidBigWidget": "js/modules/orcid/widget/widget",
        "OrcidSelector": "js/widgets/orcid-selector/widget.jsx",
        "AffiliationFacet": "js/wraps/affiliation_facet",
        "AuthorFacet": "js/wraps/author_facet",
        "BibgroupFacet": "js/wraps/bibgroup_facet",
        "BibstemFacet": "js/wraps/bibstem_facet",
        "DataFacet": "js/wraps/data_facet",
        "DatabaseFacet": "js/wraps/database_facet",
        "GrantsFacet": "js/wraps/grants_facet",
        "KeywordFacet": "js/wraps/keyword_facet",
        "ObjectFacet": "js/wraps/simbad_object_facet",
        "NedObjectFacet": "js/wraps/ned_object_facet",
        "RefereedFacet": "js/wraps/refereed_facet",
        "VizierFacet": "js/wraps/vizier_facet",
        "GraphTabs": "js/wraps/graph_tabs",
        "FooterWidget": "js/widgets/footer/widget",
        "PubtypeFacet": "js/wraps/pubtype_facet",
        "ShowAbstract": "js/widgets/abstract/widget",
        "ShowGraphics": "js/widgets/graphics/widget",
        "ShowGraphicsSidebar": "js/wraps/sidebar-graphics-widget",
        "ShowReferences": "js/wraps/references",
        "ShowCitations": "js/wraps/citations",
        "ShowCoreads": "js/wraps/coreads",
        "ShowSimilar": "js/wraps/similar",
        "MetaTagsWidget": "js/widgets/meta_tags/widget",
        "ShowToc": "js/wraps/table_of_contents",
        "ShowResources": "js/widgets/resources/widget.jsx",
        "ShowAssociated": "js/widgets/associated/widget.jsx",
        "ShowRecommender": "js/widgets/recommender/widget",
        "ShowMetrics": "js/wraps/paper_metrics",
        "ShowExportcitation": "js/wraps/paper_export",
        "ShowFeedback": "reactify!js/react/BumblebeeWidget?FeedbackForms",
        "ShowLibraryAdd": "js/wraps/abstract_page_library_add/widget",
        "IndividualLibraryWidget": "js/widgets/library_individual/widget",
        "LibraryActionsWidget": "js/widgets/library_actions/widget.jsx",
        "AllLibrariesWidget": "js/widgets/libraries_all/widget",
        "LibraryListWidget": "js/widgets/library_list/widget",
        "MyAdsFreeform": "reactify!js/react/BumblebeeWidget?MyAdsFreeform",
        "MyAdsDashboard": "reactify!js/react/BumblebeeWidget?MyAdsDashboard",
        "RecommenderWidget": "reactify!js/react/BumblebeeWidget?Recommender"
      },
      "plugins": {}
    }
  },
  "map": {
    "*": {
      "pubsub_service_impl": "js/services/default_pubsub"
    }
  },
  "paths": {
    "router": "config/main.bundle",
    "analytics": "config/main.bundle",
    "underscore": [
      "//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.2/lodash.min",
      "libs/lodash/lodash.compat"
    ],
    "async": "config/main.bundle",
    "babel": "libs/requirejs-babel-plugin/babel-5.8.34.min",
    "backbone": [
      "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/backbone-min",
      "libs/backbone/backbone"
    ],
    "backbone-validation": [
      "//cdnjs.cloudflare.com/ajax/libs/backbone.validation/0.11.3/backbone-validation-amd-min",
      "libs/backbone-validation/backbone-validation"
    ],
    "backbone.stickit": [
      "//cdnjs.cloudflare.com/ajax/libs/backbone.stickit/0.8.0/backbone.stickit.min",
      "libs/backbone.stickit/backbone.stickit"
    ],
    "backbone.wreqr": [
      "//cdnjs.cloudflare.com/ajax/libs/backbone.wreqr/1.0.0/backbone.wreqr.min",
      "libs/backbone.wreqr/lib/backbone.wreqr"
    ],
    "bootstrap": [
      "//ajax.aspnetcdn.com/ajax/bootstrap/3.3.5/bootstrap.min",
      "libs/bootstrap/bootstrap"
    ],
    "bowser": "//cdn.jsdelivr.net/npm/bowser@2.11.0/es5.min",
    "cache": "config/main.bundle",
    "classnames": [
      "//cdnjs.cloudflare.com/ajax/libs/classnames/2.2.5/index.min",
      "../bower_components/classnames/index"
    ],
    "clipboard": [
      "//cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.7.1/clipboard.min",
      "libs/clipboard/clipboard"
    ],
    "d3": [
      "//cdnjs.cloudflare.com/ajax/libs/d3/3.4.6/d3.min",
      "libs/d3/d3.min"
    ],
    "d3-cloud": [
      "//cdnjs.cloudflare.com/ajax/libs/d3-cloud/1.2.5/d3.layout.cloud.min",
      "libs/d3-cloud/d3.layout.cloud"
    ],
    "enzyme": "libs/enzyme/index",
    "es6": "libs/requirejs-babel-plugin/es6",
    "filesaver": [
      "//cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.8/FileSaver.min",
      "libs/file-saver/index"
    ],
    "google-analytics": [
      "libs/g",
      "data:application/javascript,"
    ],
    "hbs": "config/main.bundle",
    "hotkeys": "libs/hotkeys/index",
    "jquery": [
      "//cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min",
      "libs/jquery/jquery"
    ],
    "jquery-ui": [
      "//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min",
      "libs/jqueryui/jquery-ui"
    ],
    "jsonpath": [
      "//cdn.jsdelivr.net/npm/jsonpath@0.2.12/jsonpath.min",
      "libs/jsonpath/jsonpath"
    ],
    "marionette": [
      "//cdnjs.cloudflare.com/ajax/libs/backbone.marionette/2.4.5/backbone.marionette.min",
      "libs/marionette/backbone.marionette"
    ],
    "mathjax": [
      "//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.0/MathJax.js?config=TeX-AMS_HTML&amp;delayStartupUntil=configured",
      "libs/mathjax/index"
    ],
    "moment": [
      "//cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min",
      "libs/momentjs/moment"
    ],
    "persist-js": [
      "//cdn.jsdelivr.net/npm/persist-js@0.3.1/src/persist.min",
      "libs/persist-js/src/persist"
    ],
    "react": [
      "//unpkg.com/react@16/umd/react.production.min",
      "libs/react/index"
    ],
    "react-bootstrap": [
      "libs/react-bootstrap/index"
    ],
    "react-dom": [
      "libs/react-dom/index"
    ],
    "prop-types": [
      "libs/prop-types/index"
    ],
    "react-redux": [
      "libs/react-redux/index"
    ],
    "react-transition-group": "libs/react-transition-group/index",
    "recaptcha": "config/main.bundle",
    "reactify": "config/main.bundle",
    "redux": [
      "libs/redux/index"
    ],
    "redux-thunk": [
      "//cdnjs.cloudflare.com/ajax/libs/redux-thunk/2.1.0/redux-thunk.min",
      "libs/redux-thunk/index"
    ],
    "select2": [
      "//cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.min",
      "libs/select2/select2"
    ],
    "sprintf": [
      "//cdnjs.cloudflare.com/ajax/libs/sprintf/1.0.2/sprintf.min",
      "libs/sprintf/sprintf"
    ],
    "utils": "config/main.bundle",
    "mocha": "libs/mocha/mocha",
    "chai": "bower_components/chai/chai",
    "sinon": "https://cdnjs.cloudflare.com/ajax/libs/sinon.js/1.9.0/sinon.min",
    "suit": "shared/dist/index.umd.production.min",
    "yup": "libs/yup/index",
    "react-hook-form": [
      "libs/react-hook-form/index"
    ],
    "react-flexview": "libs/react-flexview/index",
    "styled-components": "libs/styled-components/index",
    "react-is": "libs/react-is/index",
    "react-data-table-component": "libs/react-data-table-component/index",
    "react-window": "libs/react-window/index",
    "react-async": "libs/react-async/index",
    "deep-object-diff": "libs/deep-object-diff/index",
    "diff": "https://cdnjs.cloudflare.com/ajax/libs/jsdiff/4.0.2/diff.min",
    "regenerator-runtime": "config/main.bundle",
    "@hookform/resolvers": "libs/@hookform/index",
    "recoil": "libs/recoil/index",
    "xstate": "libs/xstate/index",
    "@xstate/react": "libs/xstate-react/index",
    "array-flat-polyfill": "config/main.bundle",
    "config/common.config": "config/main.bundle",
    "config/discovery.config": "config/main.bundle",
    "js/apps/discovery/main": "config/main.bundle",
    "js/apps/discovery/navigator": "config/main.bundle",
    "js/components/alerts": "config/main.bundle",
    "js/components/alerts_mediator": "config/main.bundle",
    "js/components/api_feedback": "config/main.bundle",
    "js/components/api_query": "config/main.bundle",
    "js/components/api_query_updater": "config/main.bundle",
    "js/components/api_request": "config/main.bundle",
    "js/components/api_request_queue": "config/main.bundle",
    "js/components/api_response": "config/main.bundle",
    "js/components/api_targets": "config/main.bundle",
    "js/components/app_storage": "config/main.bundle",
    "js/components/application": "config/main.bundle",
    "js/components/beehive": "config/main.bundle",
    "js/components/csrf_manager": "config/main.bundle",
    "js/components/default_request": "config/main.bundle",
    "js/components/doc_stash_controller": "config/main.bundle",
    "js/components/experiments": "config/main.bundle",
    "js/components/facade": "config/main.bundle",
    "js/components/feedback_mediator": "config/main.bundle",
    "js/components/generic_module": "config/main.bundle",
    "js/components/history_manager": "config/main.bundle",
    "js/components/hotkeys_controller": "config/main.bundle",
    "js/components/json_response": "config/main.bundle",
    "js/components/library_controller": "config/main.bundle",
    "js/components/multi_params": "config/main.bundle",
    "js/components/navigator": "config/main.bundle",
    "js/components/paginator": "config/main.bundle",
    "js/components/persistent_storage": "config/main.bundle",
    "js/components/pubsub_events": "config/main.bundle",
    "js/components/pubsub_key": "config/main.bundle",
    "js/components/query_mediator": "config/main.bundle",
    "js/components/query_validator": "config/main.bundle",
    "js/components/recaptcha_manager": "config/main.bundle",
    "js/components/second_order_controller": "config/main.bundle",
    "js/components/services_container": "config/main.bundle",
    "js/components/session": "config/main.bundle",
    "js/components/solr_params": "config/main.bundle",
    "js/components/solr_response": "config/main.bundle",
    "js/components/transition": "config/main.bundle",
    "js/components/transition_catalog": "config/main.bundle",
    "js/components/user": "config/main.bundle",
    "js/mixins/add_secondary_sort": "config/main.bundle",
    "js/mixins/add_stable_index_to_collection": "config/main.bundle",
    "js/mixins/api_access": "config/main.bundle",
    "js/mixins/dependon": "config/main.bundle",
    "js/mixins/discovery_bootstrap": "config/main.bundle",
    "js/mixins/expose_metadata": "config/main.bundle",
    "js/mixins/form_view_functions": "config/main.bundle",
    "js/mixins/formatter": "config/main.bundle",
    "js/mixins/hardened": "config/main.bundle",
    "js/mixins/link_generator_mixin": "config/main.bundle",
    "js/mixins/openurl_generator": "config/main.bundle",
    "js/mixins/papers_utils": "config/main.bundle",
    "js/mixins/side_bar_manager": "config/main.bundle",
    "js/mixins/user_change_rows": "config/main.bundle",
    "js/mixins/widget_mixin_method": "config/main.bundle",
    "js/mixins/widget_pagination": "config/main.bundle",
    "js/mixins/widget_state_handling": "config/main.bundle",
    "js/mixins/widget_state_manager": "config/main.bundle",
    "js/mixins/widget_utility": "config/main.bundle",
    "js/modules/hello": "config/main.bundle",
    "js/modules/orcid/bio": "config/main.bundle",
    "js/modules/orcid/extension": "config/main.bundle",
    "js/modules/orcid/item_view_extension": "config/main.bundle",
    "js/modules/orcid/module": "config/main.bundle",
    "js/modules/orcid/orcid_api": "config/main.bundle",
    "js/modules/orcid/profile": "config/main.bundle",
    "js/modules/orcid/widget/widget": "config/main.bundle",
    "js/modules/orcid/work": "config/main.bundle",
    "js/page_managers/controller": "config/main.bundle",
    "js/page_managers/master": "config/main.bundle",
    "js/page_managers/one_column_view": "config/main.bundle",
    "js/page_managers/three_column_view": "config/main.bundle",
    "js/page_managers/toc_controller": "config/main.bundle",
    "js/page_managers/toc_widget": "config/main.bundle",
    "js/page_managers/view_mixin": "config/main.bundle",
    "js/services/api": "config/main.bundle",
    "js/services/default_pubsub": "config/main.bundle",
    "js/services/pubsub": "config/main.bundle",
    "js/services/storage": "config/main.bundle",
    "js/bugutils/diagnostics": "config/main.bundle",
    "js/react/BumblebeeWidget": "config/main.bundle",
    "hbs/handlebars": "config/main.bundle",
    "hbs/json2": "config/main.bundle",
    "hbs/underscore": "config/main.bundle",
    "discovery.config": "config/main.bundle"
  },
  "hbs": {
    "templateExtension": "html",
    "helpers": false
  },
  "shim": {
    "Backbone": {
      "deps": [
        "backbone"
      ],
      "exports": "Backbone"
    },
    "backbone.stickit": {
      "deps": [
        "backbone"
      ]
    },
    "backbone-validation": {
      "deps": [
        "backbone"
      ]
    },
    "bootstrap": {
      "deps": [
        "jquery",
        "jquery-ui"
      ]
    },
    "backbone": {
      "deps": [
        "jquery",
        "underscore"
      ]
    },
    "marionette": {
      "deps": [
        "jquery",
        "underscore",
        "backbone"
      ],
      "exports": "Marionette"
    },
    "cache": {
      "exports": "Cache"
    },
    "mocha": {
      "exports": "mocha"
    },
    "filesaver": {
      "exports": "saveAs"
    },
    "d3": {
      "exports": "d3"
    },
    "d3-cloud": {
      "deps": [
        "d3"
      ]
    },
    "google-analytics": {
      "exports": "__ga__"
    },
    "jquery-ui": {
      "deps": [
        "jquery"
      ]
    },
    "jquery-querybuilder": {
      "deps": [
        "jquery"
      ]
    },
    "sprintf": {
      "exports": "sprintf"
    },
    "persist-js": {
      "exports": "Persist"
    }
  }
});
