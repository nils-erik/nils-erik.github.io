define(['underscore', 'jquery', 'js/widgets/base/base_widget', 'js/components/api_query', 'js/components/api_request', 'js/components/api_targets', 'hbs!js/widgets/paper_search_form/form', './topterms'], function (_, $, BaseWidget, ApiQuery, ApiRequest, ApiTargets, FormTemplate, AutocompleteData) {
  var renderAutoCompleteItem = function renderAutoCompleteItem(ul, item) {
    var re = new RegExp('(' + this.term + ')', 'i');
    var label = item.label.replace(re, '<span class="ui-state-highlight">$1</span>');
    var $li = $('<li/>').appendTo(ul);
    $('<a/>').html(label).appendTo($li);
    return $li;
  };

  var getAutoCompleteSource = function getAutoCompleteSource(request, response) {
    var matches = $.map(AutocompleteData, function (item) {
      if (_.isString(request.term)) {
        var term = request.term.toUpperCase();
        var bibstem = item.value.toUpperCase();
        var label = item.label.toUpperCase();

        if (bibstem.indexOf(term) === 0 || label.indexOf(term) === 0 || label.replace(/^THE\s/, '').indexOf(term) === 0) {
          return item;
        }
      }
    });
    return response(matches);
  };

  var createAutoComplete = function createAutoComplete(el) {
    var $input = $('input#bibstem', el); // don't rebind to the element

    if ($input.data('ui-autocomplete')) {
      return;
    }

    $input.on('keyup', function (e) {
      if (e.keyCode === 13) {
        $input.trigger('enter');
      }
    });
    $input.autocomplete({
      minLength: 1,
      autoFocus: true,
      source: getAutoCompleteSource
    });
    $input.data('ui-autocomplete')._renderItem = renderAutoCompleteItem;
  };

  var View = Marionette.ItemView.extend({
    template: FormTemplate,
    className: 'paper-search-form',
    onRender: function onRender() {
      var _this = this;

      createAutoComplete(this.el);
      setTimeout(function () {
        $('input', _this.el).get(0).focus();
      }, 100);
    },
    events: {
      'submit form': 'submit'
    },
    _submit: _.debounce(function (e) {
      var type = $(e.target).addClass('submitted').data('formType');
      var $inputs = $('input, textarea', e.target); // parse the inputs' values into an object

      var data = $inputs.toArray().reduce(function (acc, el) {
        acc[el.name] = el.value;
        return acc;
      }, {}); // disable to form, change the button to loading, and trigger submit

      this.setFormDisabled(true);
      $('button[type="submit"]', e.target).html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> Submitting...');
      this.trigger('submit', type, data);
    }, 1000, {
      leading: true,
      trailing: false
    }),
    submit: function submit(e) {
      e.preventDefault();

      this._submit(e);
    },
    setFormDisabled: function setFormDisabled(disable) {
      $('input, textarea, button', this.el).prop('disabled', disable).toggleClass('disabled', disable);
      $('button[type="submit"]', this.el).html("\n        <i class=\"fa fa-search\" aria-hidden=\"true\"></i> Search\n      ");
    },
    onDone: function onDone() {
      this.setFormDisabled(false);
    },
    onFail: function onFail() {
      var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Error';
      // show an error message, and then remove it next time the user focuses on an input
      var $el = $(this.el);
      var $submittedContainer = $('form.submitted', $el).closest('.row');
      $("\n        <div class=\"alert alert-danger\" id=\"error-message\">\n          <i class=\"fa fa-exclamation-triangle\" aria-hidden=\"true\"></i>  <strong>".concat(msg, "</strong>\n        </div>\n      ")).insertAfter($submittedContainer);
      this.setFormDisabled(false);
      $('input, textarea, button', $el).one('focus', function () {
        $('#error-message', $el).remove();
        $('form.submitted', $el).removeClass('submitted');
      });
    },
    onReset: function onReset() {
      this.render();
    },
    onShow: function onShow() {
      this.setFormDisabled(false);
      $('input', this.el).get(0).focus();
    }
  });

  var extractBibcodeFromReference = function extractBibcodeFromReference(data) {
    var score = data.score,
        bibcode = data.bibcode;

    if (score !== '0.0' && bibcode) {
      return bibcode;
    }

    return null;
  };

  var PaperForm = BaseWidget.extend({
    initialize: function initialize() {
      this.view = new View();
      this.view.on('submit', this.onSubmit.bind(this));
    },
    activate: function activate(beehive) {
      var _this2 = this;

      BaseWidget.prototype.activate.call(this, beehive);
      var ps = this.getPubSub();
      ps.subscribe(ps.CUSTOM_EVENT, function (ev, data) {
        if (ev === 'start-new-search') {
          _this2.onNewSearch();
        } else if (ev === 'second-order-search/error') {
          _this2.view.triggerMethod('fail', data.message);
        }
      });
    },
    onNewSearch: function onNewSearch() {
      this.view.triggerMethod('reset');
    },
    processResponse: function processResponse() {},
    onSubmit: function onSubmit(type, data) {
      var _this3 = this;

      switch (type) {
        case 'reference':
          {
            this.sendReferenceQuery(data).done(function (_ref) {
              var resolved = _ref.resolved;
              var bib = extractBibcodeFromReference(resolved);

              if (bib) {
                return _this3.doSearch("bibcode:".concat(bib));
              }

              _this3.view.triggerMethod('fail', 'No bibcodes matching reference string');
            }).fail(function (event) {
              if (event.responseJSON && event.responseJSON.error) {
                return _this3.view.triggerMethod('fail', event.responseJSON.error);
              }

              _this3.view.triggerMethod('fail', 'Error occurred sending reference request');
            });
          }
          break;

        case 'journal':
          {
            try {
              var queryStr = Object.keys(data).filter(function (k) {
                return data[k].trim();
              }).map(function (k) {
                return "".concat(k, ":").concat(data[k]);
              }).join(' ');
              this.doSearch(queryStr);
            } catch (e) {
              this.view.triggerMethod('fail', 'Error parsing journals');
            }
          }
          break;

        case 'bibcodes':
          {
            try {
              var bibcodes = data.bibcodes.split(/\s+/).filter(function (s) {
                return !!s;
              });

              if (bibcodes.length === 0) {
                return this.view.triggerMethod('done');
              }

              this.doBigSearch(bibcodes);
            } catch (e) {
              this.view.triggerMethod('fail', 'Error parsing bibcodes');
            }
          }
          break;
      }
    },
    doBigSearch: function doBigSearch() {
      var bibcodes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var ps = this.getPubSub();
      ps.publish(ps.CUSTOM_EVENT, 'second-order-search/limit', {
        ids: bibcodes
      });
    },
    doSearch: function doSearch() {
      var queryStr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var query = new ApiQuery({
        q: queryStr,
        sort: ['date desc']
      });
      var ps = this.getPubSub();
      ps.publish(ps.NAVIGATE, 'search-page', {
        q: query,
        context: {
          referrer: 'PaperSearchForm'
        }
      });
    },
    sendReferenceQuery: function sendReferenceQuery(data) {
      var $dd = $.Deferred();
      var ps = this.getPubSub();
      var request = new ApiRequest({
        target: ApiTargets.REFERENCE + '/' + encodeURIComponent(data.reference),
        query: new ApiQuery({}),
        options: {
          type: 'GET',
          headers: {
            Accept: 'application/json; charset=utf-8',
            'Content-Type': 'application/json; charset=utf-8'
          },
          done: function done(data) {
            return $dd.resolve(data);
          },
          fail: function fail() {
            return $dd.reject.apply($dd, arguments);
          },
          always: function always() {
            return $dd.always();
          }
        }
      });
      ps.publish(ps.EXECUTE_REQUEST, request);
      return $dd.promise();
    },
    onShow: function onShow() {
      this.view.triggerMethod('show');
    }
  });
  return PaperForm;
});
