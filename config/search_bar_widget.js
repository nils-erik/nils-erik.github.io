function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

define(['underscore', 'marionette', 'js/components/api_query', 'js/widgets/base/base_widget', 'hbs!js/widgets/search_bar/templates/search_bar_template', 'hbs!js/widgets/search_bar/templates/search_form_template', 'hbs!js/widgets/search_bar/templates/option-dropdown', 'js/components/api_request', 'js/components/api_targets', 'js/components/api_feedback', 'js/mixins/formatter', './autocomplete', 'bootstrap', // if bootstrap is missing, jQuery events get propagated
'jquery-ui', 'js/mixins/dependon', 'analytics', 'js/components/query_validator', 'select2', 'libs/select2/matcher'], function (_, Marionette, ApiQuery, BaseWidget, SearchBarTemplate, SearchFormTemplate, OptionDropdownTemplate, ApiRequest, ApiTargets, ApiFeedback, FormatMixin, _ref, bootstrap, jqueryUI, Dependon, analytics, QueryValidator, select2, oldMatcher) {
  var _events;

  var renderAutocomplete = _ref.render,
      autocompleteArray = _ref.autocompleteSource;
  var SearchBarModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        citationCount: undefined,
        numFound: undefined,
        bigquery: false,
        bigquerySource: undefined
      };
    }
  }); // get what is currently selected in the window

  function getSelectedText(el) {
    var text = '';

    if (window.getSelection) {
      // can't just get substring because of firefox bug
      text = el.value.substring(el.selectionStart, el.selectionEnd);
    } else if (document.selection && document.selection.type != 'Control') {
      text = document.selection.createRange().text;
    }

    return text;
  }

  var SearchBarView = Marionette.ItemView.extend({
    template: SearchBarTemplate,
    className: 's-search-bar-widget',
    initialize: function initialize(options) {
      _.bindAll(this, 'fieldInsert');

      this.queryValidator = new QueryValidator();
      this.defaultDatabases = [];
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      var that = this;
    },
    modelEvents: {
      change: 'render'
    },
    onRender: function onRender() {
      var that = this;
      /*
              select
             */

      this.$('#option-dropdown-container').append(OptionDropdownTemplate);

      function matchStart(term, text) {
        if (text.toUpperCase().indexOf(term.toUpperCase()) == 0) {
          return true;
        }

        return false;
      }

      var $select = this.$('.quick-add-dropdown');
      $select.select2({
        placeholder: 'All Search Terms',
        matcher: oldMatcher(matchStart)
      }).on('change', function (e) {
        var val = e.target.value; // prevent infinite loop!

        if (!val) return;
        var $option = $(this).find('option[value="' + e.target.value + '"]'); // Grab any default value that is present on the element

        var defaultValue = $option.data('defaultValue');
        var label = $option.closest('optgroup').attr('label');
        $select.val(null).trigger('change');
        setTimeout(function () {
          that.selectFieldInsert(val, label, defaultValue); // not entirely sure why this timeout is necessary...
          // without it, focus is moved from the main query bar
        }, 100);
      }) // this seems to be necessary to show the placeholder on initial render
      .val(null).trigger('change');
      /*
              end code for select
             */

      var $input = this.$('input.q');
      this.$input = $input;
      renderAutocomplete($input);
      $input.popover({
        placement: 'bottom',
        title: 'Empty Search!',
        content: 'Please enter a query to search.',
        animation: true,
        trigger: 'manual'
      });
      this.$('[data-toggle="tooltip"]').tooltip();
    },
    events: (_events = {
      'click #field-options button': 'fieldInsert',
      'keyup .q': 'toggleClear',
      'click .show-form': 'onShowForm',
      'submit form[name=main-query]': 'submitQuery',
      'click .icon-clear': 'clearInput'
    }, _defineProperty(_events, "keyup .q", 'storeCursorInfo'), _defineProperty(_events, 'select .q', 'storeCursorInfo'), _defineProperty(_events, 'click .q', 'storeCursorInfo'), _defineProperty(_events, 'click .bigquery-close', 'clearBigquery'), _events),
    toggleClear: function toggleClear() {
      this.$('.icon-clear').toggleClass('hidden', !this.$input.val());
    },
    clearInput: function clearInput() {
      this.$input.val('').focus();
      this.toggleClear();
    },
    getFormVal: function getFormVal() {
      return this.$input.val();
    },
    setFormVal: function setFormVal(v) {
      /*
              bigquery special case: don't show the confusing *:*, just empty bar
             */
      if (this.model.get('bigquery') && v === '*:*') {
        this.$('.q').val('');
      } else {
        this.$('.q').val(v);
      }

      this.toggleClear();
    },
    serializeData: function serializeData() {
      var j = this.model.toJSON();
      j.numFound = j.numFound ? this.formatNum(j.numFound) : 0;
      j.citationCount = j.citationCount ? this.formatNum(j.citationCount) : false;

      if (this.model.get('bigquerySource')) {
        if (this.model.get('bigquerySource').match(/library/i)) {
          this.model.set({
            libraryName: this.model.get('bigquerySource').match(/library:(.*)/i)[1]
          });
        }
      }

      return j;
    },
    onShowForm: function onShowForm() {
      // show the form
      this.specifyFormWidth();
    },
    toggleFormSection: function toggleFormSection(e) {
      var $p = $(e.target).parent();
      $p.next().toggleClass('hide');
      $p.toggleClass('search-form-header-active');
    },
    // used for the "field insert" function
    _cursorInfo: {
      selected: '',
      startIndex: 0
    },
    storeCursorInfo: function storeCursorInfo(e) {
      var selected = getSelectedText(e.currentTarget);
      var startIndex = this.$input.getCursorPosition();
      this._cursorInfo = {
        selected: selected,
        startIndex: startIndex
      };
      this.toggleClear();
    },
    selectFieldInsert: function selectFieldInsert(val, label, initialValue) {
      var newVal;
      var specialCharacter;
      var highlightedText = this._cursorInfo.selected;
      var startIndex = this._cursorInfo.startIndex;
      var currentVal = this.getFormVal(); // By default, selected will be the highlighted text surrounded by double qoutes

      var selected = '"' + highlightedText + '"'; // If there was no highlighted text and an initial value was passed, use the initial value

      if (highlightedText.length === 0 && initialValue) {
        selected = initialValue;
      } // selected will be "" if user didn't highlight any text
      // newVal = df + ":\"" + selected + "\"";
      //


      switch (label) {
        case 'fields':
          {
            if (val === 'first-author') {
              val = 'author';
              selected = selected.replace(/"/, '"^');
            } else if (val === 'year') {
              selected = selected.replace(/"/g, '');
            }

            newVal = val + ':' + selected;
          }
          break;

        case 'operators':
          newVal = val + '(' + (selected === '""' ? '' : selected) + ')';
          break;

        case 'special characters':
          if (val === '=') {
            newVal = val + selected;
          } else {
            newVal = selected + val;
          }

          specialCharacter = true;
          break;
      }

      if (highlightedText.length) {
        this.setFormVal(currentVal.substr(0, startIndex) + newVal + currentVal.substr(startIndex + selected.length));
      } else {
        // append to the end
        var newString = currentVal ? currentVal + ' ' + newVal : newVal;
        this.setFormVal(newString);

        if (specialCharacter) {
          this.$input.selectRange(newString.length);
        } else {
          this.$input.selectRange(newString.length - 1);
        }
      }

      analytics('send', 'event', 'interaction', 'field-insert-dropdown-selected', val);
    },
    fieldInsert: function fieldInsert(e) {
      var newVal;
      var operator;
      var currentVal = this.getFormVal();
      var $target = $(e.target);
      var df = $target.attr('data-field');
      var punc = $target.attr('data-punc');
      var startIndex = this._cursorInfo.startIndex;
      var selected = this._cursorInfo.selected; // selected will be "" if user didn't highlight any text

      if (df.indexOf('operator-') > -1) {
        operator = df.split('-').reverse()[0];
        punc = '(';

        if (selected) {
          newVal = operator + '(' + selected + ')';
        } else {
          // enclose the full query, set it in and return
          newVal = operator + '(' + currentVal + ')';
          currentVal = '';
          this.setFormVal(newVal);
          return;
        }
      } else if (df == 'first-author') {
        newVal = ' author:"^' + selected + '"';
      } else if (punc == '"') {
        newVal = df + ':"' + selected + '"';
      } else if (punc == '(') {
        newVal = df + ':(' + selected + ')';
      } else if (!punc) {
        // year
        newVal = df + ':' + selected;
      }

      if (selected) {
        this.setFormVal(currentVal.substr(0, startIndex) + newVal + currentVal.substr(startIndex + selected.length));
      } else {
        // append to the end
        var newString = currentVal + ' ' + newVal;
        this.setFormVal(newString);

        if (punc) {
          this.$input.selectRange(newString.length - 1);
        } else {
          this.$input.selectRange(newString.length);
        }
      }

      analytics('send', 'event', 'interaction', 'field-insert-button-pressed', df);
      return false;
    },
    submitQuery: function submitQuery(e) {
      var fields;
      var fielded;
      var query;
      query = this.getFormVal();
      var $input = $('input', e.currentTarget);

      if (_.isString(query) && _.isEmpty(query) && !this.model.get('bigquery')) {
        // show a popup to tell the user to type in a query
        $input.popover('show');
        $input.on('input change blur', function () {
          $(this).popover('hide');
        });
        return false;
      }

      $input.popover('hide'); // replace uppercased fields with lowercase

      query = query.replace(/([A-Z])\w+:/g, function (letter) {
        return letter.toLowerCase();
      }); // store the query in case it gets changed (which happens when there is an object query)

      this.original_query = query; // if we're within a bigquery, translate an empty query to "*:*"

      if (!query && this.model.get('bigquery')) {
        query = '*:*';
      }

      var newQuery = new ApiQuery({
        q: query
      }); // Perform a quick validation on the query

      var validated = this.queryValidator.validate(newQuery);

      if (!validated.result) {
        var tokens = _.pluck(validated.tests, 'token');

        tokens = tokens.length > 1 ? tokens.join(', ') : tokens[0];
        var pubsub = this.getPubSub();
        pubsub.publish(pubsub.ALERT, new ApiFeedback({
          code: 0,
          msg: '<p><i class="fa fa-exclamation-triangle fa-2x" aria-hidden="true"></i> ' + "Sorry! We aren't able to understand: <strong><i>" + tokens + '</i></strong></p>' + '<p><strong><a href="/">Try looking at the search examples on the home page</a></strong> or ' + '<strong><a href="/help/search/search-syntax">reading our help page.</a></strong></p>',
          type: 'info',
          fade: true
        }));
        return false;
      }

      this.trigger('start_search', newQuery); // let analytics know what type of query it was

      fields = _.chain(autocompleteArray).pluck('value').map(function (b) {
        var m = b.match(/\w+:|\w+\(/);
        if (m && m.length) return m[0];
      }).unique().value();
      fielded = false;

      _.each(fields, function (f) {
        if (query.indexOf(f) > -1) {
          fielded = true;
        }
      });

      var type = fielded ? 'fielded' : 'unfiielded';
      analytics('send', 'event', 'interaction', type + '-query-submitted-from-search-bar', query);
      return false;
    },
    clearBigquery: function clearBigquery() {
      this.trigger('clear_big_query');
    }
  });

  _.extend(SearchBarView.prototype, FormatMixin, Dependon.BeeHive);

  var SearchBarWidget = BaseWidget.extend({
    initialize: function initialize(options) {
      this.model = new SearchBarModel();
      this.view = new SearchBarView({
        model: this.model
      });
      this.listenTo(this.view, 'start_search', function (query) {
        this.changeDefaultSort(query);
        this.navigate(query);
        this.updateState('loading');
        this.view.setFormVal(query.get('q'));
      });
      this.listenTo(this.view, 'clear_big_query', function (query) {
        var query = this._currentQuery.clone(); // awkward but need to remove qid + provide __clearBigQuery
        // for querymediator to do the correct thing


        query.unset('__qid');
        query.unset('__bigquerySource');
        query.set('__clearBigQuery', 'true'); // unload the bigquery from the model

        this.clearBigQueryPill();
        this.navigate(query);
      });
      this.listenTo(this.view, 'render', function () {
        var newQueryString = '';
        var query = this.getCurrentQuery();
        var oldQueryString = query.get('q');

        if (oldQueryString) {
          // Grab the original (no simbid refs) query string for the view
          // This is re-run here in case the view is not updated and
          // simbid refs show up
          newQueryString = query.get('__original_query') ? query.get('__original_query')[0] : oldQueryString.join(' ');
        }

        if (newQueryString) {
          this.view.setFormVal(newQueryString);
        }

        this.view.toggleClear();
      });
      BaseWidget.prototype.initialize.call(this, options);
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive);
      this.activateWidget();
      var pubsub = this.getPubSub();

      _.bindAll(this, 'processResponse'); // search widget doesn't need to execute queries (but it needs to listen to them)


      pubsub.subscribe(pubsub.FEEDBACK, _.bind(this.handleFeedback, this));
      pubsub.subscribe(pubsub.NAVIGATE, _.bind(this.onNavigate, this));
      this.view.activate(beehive.getHardenedInstance());
      pubsub.subscribe(pubsub.INVITING_REQUEST, _.bind(this.dispatchRequest, this));
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, _.bind(this.updateFromUserData, this));
      pubsub.subscribe(pubsub.CUSTOM_EVENT, _.bind(this.onCustomEvent, this));
      pubsub.subscribe(pubsub.START_SEARCH, _.bind(this.onStartSearch, this));
      this.updateFromUserData();
    },
    getUserData: function getUserData() {
      try {
        var beehive = _.isFunction(this.getBeeHive) && this.getBeeHive();
        var user = _.isFunction(beehive.getObject) && beehive.getObject('User');

        if (_.isPlainObject(user)) {
          return _.isFunction(user.getUserData) && user.getUserData('USER_DATA');
        }

        return {};
      } catch (e) {
        return {};
      }
    },
    onStartSearch: function onStartSearch() {
      this.model.unset('timing');
    },
    onCustomEvent: function onCustomEvent(event, arg) {
      if (event === 'timing:results-loaded') {
        this.model.set('timing', arg / 1000);
      } else if (event === 'hotkey/search') {
        var $input = $('input[name=q]', this.getEl());

        if (!$input.is(':focus')) {
          arg.preventDefault();
          $input.select();
          $(document.documentElement).scrollTop(0);
        }
      } else if (event === 'recommender/update-search-text') {
        var value = arg.text;

        if (value) {
          this.view.setFormVal("".concat(this.view.getFormVal(), " ").concat(value));
          this.view.$input.focus();
        }
      }
    },
    updateFromUserData: function updateFromUserData() {
      var userData = this.getUserData();
      this.defaultDatabases = _.has(userData, 'defaultDatabase') ? _.map(_.filter(userData.defaultDatabase, {
        value: true
      }), 'name') : this.defaultDatabases;
    },
    applyDefaultFilters: function applyDefaultFilters(apiQuery) {
      var dbfilters = this.defaultDatabases || [];

      if (dbfilters.length > 0) {
        var fqString = '{!type=aqp v=$fq_database}'; // check for presence of database fq

        var fq = apiQuery.get('fq');
        fq = _.isArray(fq) ? fq : [fq];

        var match = _.indexOf(fqString);

        if (match < 0) {
          fq.push(fqString);
          apiQuery.set('fq', fq);
        } // check for presence of fq_database


        if (!apiQuery.has('fq_database')) {
          var fq_database_string = _.reduce(dbfilters, function (res, db, i) {
            var d = db.toLowerCase();
            return res.replace(/(\(.*)(\))/, i === 0 ? '$1database:' + d + '$2' : '$1 OR database:' + d + '$2');
          }, '()');

          apiQuery.set('fq_database', fq_database_string);
        } // finally add the filters


        if (!apiQuery.has('__filter_database_fq_database')) {
          var fq_database_filters = _.map(dbfilters, function (db) {
            return 'database:' + db.toLowerCase();
          });

          apiQuery.set('__filter_database_fq_database', ['OR'].concat(fq_database_filters));
        }
      }

      return apiQuery;
    },
    processResponse: function processResponse(apiResponse) {
      var res = apiResponse.toJSON();
      var sort = res.responseHeader.params.sort;

      if (res.stats && /citation.*/.test(sort)) {
        var type = _.keys(res.stats.stats_fields)[0];

        var sum = res.stats.stats_fields[type].sum;

        if (type === 'citation_count_norm') {
          this.model.set({
            citationCount: sum.toFixed(2),
            citationLabel: 'normalized citations'
          });
        } else if (type === 'citation_count') {
          this.model.set({
            citationCount: sum,
            citationLabel: 'citations'
          });
        }
      } else {
        this.model.unset('citationCount');
        this.model.unset('citationLabel');
      }
    },
    defaultQueryArguments: {
      fl: 'id'
    },
    dispatchRequest: function dispatchRequest(apiQuery) {
      var sort = apiQuery.get('sort');

      if (/citation_count_norm/i.test(sort)) {
        this.defaultQueryArguments = _.extend(this.defaultQueryArguments, {
          stats: 'true',
          'stats.field': 'citation_count_norm'
        });
      } else if (/citation_count/i.test(sort)) {
        this.defaultQueryArguments = _.extend(this.defaultQueryArguments, {
          stats: 'true',
          'stats.field': 'citation_count'
        });
      } else {
        this.model.unset('citationCount');
        this.model.unset('citationLabel'); // don't bother sending request

        return;
      }

      BaseWidget.prototype.dispatchRequest.call(this, apiQuery);
    },

    /*
     * when users return to index page, we should re-focus on the search bar
     * */
    focusInput: function focusInput() {
      if (this._onIndexPage()) {
        this.clearBigQueryPill();
        this.view.clearInput();
      }
    },
    clearBigQueryPill: function clearBigQueryPill() {
      this.model.unset('bigquerySource');
      this.model.unset('bigquery');
    },
    onNavigate: function onNavigate(page) {
      this.currentPage = page;
      this.focusInput(page);
    },
    handleFeedback: function handleFeedback(feedback) {
      if (feedback.code === ApiFeedback.CODES.SEARCH_CYCLE_STARTED || feedback.code === ApiFeedback.CODES.SEARCH_CYCLE_FAILED_TO_START) {
        var query = feedback.query ? feedback.query : feedback.request.get('query'); // Grab the original (no simbid refs) query string for the view

        var newq = query.get('__original_query') ? query.get('__original_query')[0] : query.get('q').join(' ');
        this.setCurrentQuery(query);
        this.model.set({
          bigquerySource: query.get('__bigquerySource') ? query.get('__bigquerySource')[0] : 'Bulk query',
          bigquery: !!query.get('__qid'),
          numFound: feedback.numFound
        });
        this.view.setFormVal(newq);
        this.updateState('idle');
      }
    },
    changeDefaultSort: function changeDefaultSort(query) {
      var currentQuery = this.getCurrentQuery(); // make sure not to override an explicit sort if there is one

      if (!query.has('sort')) {
        var queryVal = query.get('q')[0]; // citations operator should be sorted by pubdate, so it isn't added here

        var fields = ['trending', 'instructive', 'useful', 'references', 'reviews', 'similar'];
        var fieldReg = new RegExp("(".concat(fields.join('|'), ")(?=\\()"), 'gi');
        var matches = queryVal.match(fieldReg); // we're only concerned with the first match (outermost)

        var sort = 'date desc';

        if (matches) {
          sort = 'score desc';

          if (matches[0] === 'references') {
            sort = 'first_author asc';
          }
        }

        query.set('sort', sort);
      } else if (currentQuery && currentQuery.has('sort')) {
        query.set('sort', currentQuery.get('sort'));
      }
    },
    _onIndexPage: function _onIndexPage() {
      // look out for these names, or that the current page is undefined
      return /(index-page|SearchWidget)/.test(this.currentPage) || !this.currentPage;
    },
    navigate: function navigate(newQuery) {
      var newQ = newQuery.toJSON();

      var oldQ = _.omit(this.getCurrentQuery().toJSON(), function (val, key) {
        // omit certain fields (highlights, paging)
        return /^hl.*/.test(key) || /^p_$/.test(key) || /^__original_query$/.test(key);
      }); // apply any default filters only if this is a new search


      if (this._onIndexPage()) {
        newQuery = this.applyDefaultFilters(newQuery);
        newQuery.set('__clearBigQuery', 'true');
      } else {
        // if we aren't on the index page, only refine the current query, don't wipe it out
        newQuery = new ApiQuery(_.assign(oldQ, newQ));
      } // remove the bigquery from the query if the user cleared it


      if (newQuery.has('__clearBigQuery')) {
        newQuery.unset('__qid');
      } else if (newQuery.has('__qid') && !this._onIndexPage()) {
        newQuery.set('__saveBigQuery', 'true');
      }

      this.view.setFormVal(newQuery.get('q')[0]);
      this.setCurrentQuery(newQuery);
      this.getPubSub().publish(this.getPubSub().NAVIGATE, 'search-page', {
        q: newQuery
      });
    },
    openQueryAssistant: function openQueryAssistant(queryString) {
      if (queryString) {
        this.view.setFormVal(queryString);
      }

      this.view.$el.find('.show-form').click();
    },
    onShow: function onShow() {
      // only focus on the index-page
      if (this._onIndexPage()) {
        var $input = this.view.$('input[name=q]'); // attempt to focus a few times, firefox has some problems otherwise

        var id;

        (function retry(count) {
          $input.blur().focus();

          if ($input.is(':focus') || count > 9) {
            return clearTimeout(id);
          }

          setTimeout(retry, 500, count + 1);
        })(0);
      }
    },
    onDestroy: function onDestroy() {
      this.view.destroy();
    },
    onLoading: function onLoading() {
      this.model.set('loading', true);
    },
    onIdle: function onIdle() {
      this.model.set('loading', false);
    }
  });

  _.extend(SearchBarWidget.prototype, Dependon.BeeHive);

  return SearchBarWidget;
});