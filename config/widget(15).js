function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Created by alex on 5/19/14.
 */
define(['marionette', 'js/components/api_request', 'js/components/api_targets', 'backbone', 'jquery', 'underscore', 'cache', 'js/widgets/base/base_widget', 'hbs!js/widgets/abstract/templates/abstract_template', 'js/components/api_query', 'js/mixins/link_generator_mixin', 'js/mixins/papers_utils', 'mathjax', 'bootstrap', 'utils', 'analytics'], function (Marionette, ApiRequest, ApiTargets, Backbone, $, _, Cache, BaseWidget, abstractTemplate, ApiQuery, LinkGeneratorMixin, PapersUtils, MathJax, Bootstrap, utils, analytics) {
  var MAX_AUTHORS = 20;
  var AbstractModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        abstract: undefined,
        title: undefined,
        authorAff: undefined,
        page: undefined,
        pub: undefined,
        pubdate: undefined,
        keywords: undefined,
        bibcode: undefined,
        pub_raw: undefined,
        doi: undefined,
        citation_count: undefined,
        titleLink: undefined,
        pubnote: undefined,
        loading: true,
        error: false
      };
    },
    parse: function parse(doc) {
      var maxAuthors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MAX_AUTHORS;

      // add doi link
      if (_.isArray(doc.doi) && _.isPlainObject(LinkGeneratorMixin)) {
        doc.doi = {
          doi: doc.doi,
          href: LinkGeneratorMixin.createUrlByType(doc.bibcode, 'doi', doc.doi)
        };
      } // "aff" is the name of the affiliations array that comes from solr


      doc.aff = doc.aff || []; // remove html-encoding from affiliations

      doc.aff = doc.aff.map(_.unescape);

      if (doc.aff.length) {
        doc.hasAffiliation = _.without(doc.aff, '-').length; // joining author and aff

        doc.authorAff = _.zip(doc.author, doc.aff);
      } else if (doc.author) {
        doc.hasAffiliation = false;
        doc.authorAff = _.zip(doc.author, _.range(doc.author.length));
      }

      if (doc.page && doc.page.length) {
        doc.page = doc.page[0];
      } // only true if there was an author array
      // now add urls


      if (doc.authorAff) {
        _.each(doc.authorAff, function (el, index) {
          doc.authorAff[index][2] = encodeURIComponent('"' + el[0] + '"').replace(/%20/g, '+');
        });

        if (doc.authorAff.length > maxAuthors) {
          doc.authorAffExtra = doc.authorAff.slice(maxAuthors, doc.authorAff.length);
          doc.authorAff = doc.authorAff.slice(0, maxAuthors);
        }

        doc.hasMoreAuthors = doc.authorAffExtra && doc.authorAffExtra.length;
      }

      if (doc.pubdate) {
        doc.formattedDate = PapersUtils.formatDate(doc.pubdate, {
          format: 'MM d yy',
          missing: {
            day: 'MM yy',
            month: 'yy'
          }
        });
      }

      if (doc.title && doc.title.length) {
        doc.title = doc.title[0];
        var docTitleLink = doc.title.match(/<a.*href="(.*?)".*?>(.*)<\/a>/i); // Find any links that are buried in the text of the title
        // Parse it out and convert to BBB hash links, if necessary

        if (docTitleLink) {
          doc.title = doc.title.replace(docTitleLink[0], '').trim();
          doc.titleLink = {
            href: docTitleLink[1],
            text: docTitleLink[2]
          };

          if (doc.titleLink.href.match(/^\/abs/)) {
            doc.titleLink.href = '#' + doc.titleLink.href.slice(1);
          }
        }
      }

      if (doc.comment) {
        doc.comment = _.unescape(doc.comment);
      }

      if (doc.pubnote) {
        doc.pubnote = _.unescape(doc.pubnote);
      }

      var ids = Array.isArray(doc.identifier) ? doc.identifier : doc.original_identifier;
      var id = (ids || []).find(function (v) {
        return v.match(/^arxiv/i);
      });

      if (id) {
        doc.arxiv = {
          id: id,
          href: LinkGeneratorMixin.createUrlByType(doc.bibcode, 'arxiv', id.split(':')[1])
        };
      }

      return doc;
    }
  });
  var AbstractView = Marionette.ItemView.extend({
    tagName: 'article',
    className: 's-abstract-metadata',
    modelEvents: {
      change: 'render'
    },
    template: abstractTemplate,
    events: {
      'click #toggle-aff': 'toggleAffiliation',
      'click #toggle-more-authors': 'toggleMoreAuthors',
      'click a[data-target="more-authors"]': 'toggleMoreAuthors',
      'click a[target="prev"]': 'onClick',
      'click a[target="next"]': 'onClick',
      'click a[data-target="DOI"]': 'emitAnalytics',
      'click a[data-target="arXiv"]': 'emitAnalytics'
    },
    toggleMoreAuthors: function toggleMoreAuthors() {
      this.$('.author.extra').toggleClass('hide');
      this.$('.author.extra-dots').toggleClass('hide');

      if (this.$('.author.extra').hasClass('hide')) {
        this.$('#toggle-more-authors').text('Show all authors');
      } else {
        this.$('#toggle-more-authors').text('Hide authors');
      }

      return false;
    },
    toggleAffiliation: function toggleAffiliation() {
      var _this = this;

      this.$('fail-aff').hide();
      this.$('#pending-aff').show();
      this.trigger('fetchAffiliations', function (err) {
        _this.$('#pending-aff').hide();

        if (err) {
          _this.$('#fail-aff').show();

          setTimeout(function () {
            _this.$('#fail-aff').hide();
          }, 3000);
          return;
        }

        _this.$('.affiliation').toggleClass('hide');

        if (_this.$('.affiliation').hasClass('hide')) {
          _this.$('#toggle-aff').text('Show affiliations');
        } else {
          _this.$('#toggle-aff').text('Hide affiliations');
        }
      });
      return false;
    },
    onClick: function onClick(ev) {
      this.trigger($(ev.target).attr('target'));
      return false;
    },
    emitAnalytics: function emitAnalytics(e) {
      analytics('send', 'event', 'interaction', 'abs-full-text-link-followed', e.target.dataset.target);
    },
    onRender: function onRender() {
      this.$('.icon-help').popover({
        trigger: 'hover',
        placement: 'right',
        html: true,
        container: 'body'
      });

      if (MathJax) {
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.$('.s-abstract-title', this.el).get(0)]);
        MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.$('.s-abstract-text', this.el).get(0)]);
      }
    }
  });
  var AbstractWidget = BaseWidget.extend({
    initialize: function initialize(options) {
      options = options || {};
      this.model = options.data ? new AbstractModel(options.data, {
        parse: true
      }) : new AbstractModel();
      this.view = utils.withPrerenderedContent(new AbstractView({
        model: this.model
      }));
      this.listenTo(this.view, 'all', this.onAllInternalEvents);
      BaseWidget.prototype.initialize.apply(this, arguments);
      this._docs = {};
      this.maxAuthors = MAX_AUTHORS;
      this.isFetchingAff = false;
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      this.activateWidget();
      this.attachGeneralHandler(this.onApiFeedback);
      var pubsub = beehive.getService('PubSub');

      _.bindAll(this, ['onNewQuery', 'dispatchRequest', 'processResponse', 'onDisplayDocuments']);

      pubsub.subscribe(pubsub.START_SEARCH, this.onNewQuery);
      pubsub.subscribe(pubsub.INVITING_REQUEST, this.dispatchRequest);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.onDisplayDocuments);
    },
    onApiFeedback: function onApiFeedback(feedback) {
      // there was an error
      if (feedback && feedback.error) {
        this.showError();
        this.updateState(this.STATES.ERRORED);
      }
    },
    defaultQueryArguments: {
      fl: 'identifier,[citations],abstract,author,bibcode,citation_count,comment,doi,id,keyword,page,property,pub,pub_raw,pubdate,pubnote,read_count,title,volume',
      rows: 1
    },
    mergeStashedDocs: function mergeStashedDocs(docs) {
      _.each(docs, function (d) {
        if (!this._docs[d.bibcode]) {
          this._docs[d.bibcode] = this.model.parse(d);
        }
      }, this);
    },
    onNewQuery: function onNewQuery(apiQuery) {
      // only empty docs array if it truly is a new query
      var newQueryJSON = apiQuery.toJSON();

      var currentStreamlined = _.pick(this.getCurrentQuery().toJSON(), _.keys(newQueryJSON));

      if (JSON.stringify(newQueryJSON) !== JSON.stringify(currentStreamlined)) {
        this._docs = {};
      }
    },
    dispatchRequest: function dispatchRequest(apiQuery) {
      this.setCurrentQuery(apiQuery);
      BaseWidget.prototype.dispatchRequest.apply(this, arguments);
    },
    // bibcode is already in _docs
    displayBibcode: function displayBibcode(bibcode) {
      // if _docs is empty, stop here
      if (_.isEmpty(this._docs)) {
        return;
      } // wipe out the former values, because this new set of data
      // might not have every key


      this.model.clear({
        silent: true
      });
      this.model.set(this._docs[bibcode]);
      this._current = bibcode; // let other widgets know details

      var c = this._docs[bibcode]['[citations]'] || {
        num_citations: 0,
        num_references: 0
      };
      var resolvedCitations = c ? c.num_citations : 0;
      this.trigger('page-manager-event', 'broadcast-payload', {
        title: this._docs[bibcode].title,
        abstract: this._docs[bibcode].abstract,
        // this should be superfluous, widgets already subscribe to display_documents
        bibcode: bibcode,
        // used by citation list widget
        citation_discrepancy: this._docs[bibcode].citation_count - resolvedCitations,
        citation_count: this._docs[bibcode].citation_count,
        references_count: c.num_references,
        read_count: this._docs[bibcode].read_count,
        property: this._docs[bibcode].property
      });

      if (this.hasPubSub()) {
        var ps = this.getPubSub();
        ps.publish(ps.CUSTOM_EVENT, 'update-document-title', this._docs[bibcode].title);
        ps.publish(ps.CUSTOM_EVENT, 'latest-abstract-data', this._docs[bibcode]);
      }

      this.updateState(this.STATES.IDLE);
    },
    onAbstractPage: function onAbstractPage() {
      // hacky way of confirming the page we're on
      return /\/abstract$/.test(Backbone.history.getFragment());
    },
    onDisplayDocuments: function onDisplayDocuments(apiQuery) {
      this.updateState(this.STATES.LOADING);
      var stashedDocs = []; // check to see if a query is already in progress (the way bbb is set up, it will be)
      // if so, auto fill with docs initially requested by results widget

      try {
        stashedDocs = this.getBeeHive().getObject('DocStashController').getDocs();
      } catch (e) {
        stashedDocs = [];
      } finally {
        this.mergeStashedDocs(stashedDocs);
      }

      var bibcode = this.parseIdentifierFromQuery(apiQuery);

      if (bibcode === 'null') {
        var msg = {
          numFound: 0,
          noDocs: true
        };
        this.showError({
          noDocs: true
        });
        this.trigger('page-manager-event', 'widget-ready', msg);
        return;
      }

      if (this._docs[bibcode]) {
        // we have already loaded it
        this.displayBibcode(bibcode);
      } else {
        if (apiQuery.has('__show')) return; // cycle protection

        var q = apiQuery.clone();
        q.set('__show', bibcode); // this will add required fields

        this.dispatchRequest(q);
      }
    },
    onAllInternalEvents: function onAllInternalEvents(ev, arg1) {
      if ((ev === 'next' || ev === 'prev') && this._current) {
        var keys = _.keys(this._docs);

        var pubsub = this.getPubSub();

        var curr = _.indexOf(keys, this._current);

        if (curr > -1) {
          if (ev === 'next' && curr + 1 < keys.length) {
            pubsub.publish(pubsub.DISPLAY_DOCUMENTS, keys[curr + 1]);
          } else if (curr - 1 > 0) {
            pubsub.publish(pubsub.DISPLAY_DOCUMENTS, keys[curr - 1]);
          }
        }
      }

      if (ev === 'fetchAffiliations') {
        this.fetchAffiliations(arg1);
      }
    },
    fetchAffiliations: function fetchAffiliations(cb) {
      var _this2 = this;

      if ((!this.model.has('aff') || this.model.get('aff').length === 0) && !this.isFetchingAff) {
        this.isFetchingAff = true;
        var ps = this.getPubSub();
        var query = this.getCurrentQuery().clone();
        query.unlock();

        var _this$model$toJSON = this.model.toJSON(),
            bibcode = _this$model$toJSON.bibcode,
            author = _this$model$toJSON.author;

        query.set('q', "identifier:".concat(bibcode));
        query.set('fl', ['aff']);
        query.set('rows', 1);
        ps.publish(ps.EXECUTE_REQUEST, new ApiRequest({
          target: ApiTargets.SEARCH,
          query: query,
          options: {
            always: function always() {
              _this2.isFetchingAff = false;
            },
            done: function done(resp) {
              if (resp && resp.response && resp.response.docs && resp.response.docs.length > 0) {
                var newEntries = _this2.model.parse({
                  author: author,
                  aff: resp.response.docs[0].aff
                });

                _this2._docs[bibcode] = _objectSpread(_objectSpread({}, _this2._docs[bibcode]), newEntries);

                _this2.model.set(newEntries);
              }

              cb();
            },
            fail: function fail(err) {
              cb(err);
            }
          }
        }));
      } else {
        cb();
      }
    },
    processResponse: function processResponse(apiResponse) {
      var r = apiResponse.toJSON();
      var self = this;

      if (r.response && r.response.docs) {
        var docs = r.response.docs;

        var __show = apiResponse.get('responseHeader.params.__show', false, '');

        _.each(docs, function (doc) {
          var d = self.model.parse(doc, self.maxAuthors);
          var ids = d.identifier; // if __show is defined and it is found in the list of identifiers or only a single document
          // was provided - then set the __show value to the bibcode of the document

          if (__show && (ids && ids.length > 0 && _.contains(ids, __show) || docs.length === 1)) {
            __show = d.bibcode;
          }

          self._docs[d.bibcode] = d;
        });

        if (__show) {
          this.displayBibcode(__show);
        }
      }

      var msg = {};
      msg.numFound = apiResponse.get('response.numFound', false, 0);

      if (msg.numFound === 0) {
        this.showError({
          noDocs: true
        });
        msg.noDocs = true;
      }

      this.trigger('page-manager-event', 'widget-ready', msg);
    },
    showError: function showError(opts) {
      var options = opts || {}; // if noDocs, do not set error

      this.model.set({
        error: !options.noDocs,
        loading: false
      });
    }
  });
  return AbstractWidget;
});
