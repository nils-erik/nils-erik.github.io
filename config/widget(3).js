define(['underscore', 'marionette', 'js/widgets/base/base_widget', 'hbs!js/widgets/navbar/template/navbar', 'hbs!js/widgets/navbar/template/feedback', 'js/components/api_query_updater', 'js/components/api_query', 'js/components/api_request', 'js/components/api_targets', 'utils', 'bootstrap'], function (_, Marionette, BaseWidget, NavBarTemplate, FeedbackTemplate, ApiQueryUpdater, ApiQuery, ApiRequest, ApiTargets, utils) {
  var NavView;
  var NavModel;
  var NavWidget;
  NavModel = Backbone.Model.extend({
    defaults: function defaults() {
      return {
        orcidModeOn: false,
        orcidLoggedIn: false,
        currentUser: undefined,
        orcidFirstName: undefined,
        orcidLastName: undefined,
        // should it show hourly banner?
        hourly: false,
        timeout: 600000 // 10 minutes

      };
    }
  });
  NavView = Marionette.ItemView.extend({
    initialize: function initialize() {
      if (!window.__BUMBLEBEE_TESTING_MODE__) {
        this.onRender = _.debounce(this.onRender, 500);
      }
    },
    template: NavBarTemplate,
    modelEvents: {
      change: 'render'
    },
    events: {
      'click .orcid-dropdown ul': 'stopPropagation',
      'click a.orcid-sign-in': 'orcidSignIn',
      'change .orcid-mode': 'changeOrcidMode',
      // to avoid stopPropagation as in triggers hash
      'click .orcid-link': function clickOrcidLink() {
        this.trigger('navigate-to-orcid-link');
      },
      'click .orcid-logout': function clickOrcidLogout(e) {
        this.trigger('logout-only-orcid');
        return false;
      },
      'click .logout': function clickLogout(e) {
        this.trigger('logout');
        return false;
      },
      'click .login': function clickLogin() {
        this.trigger('navigate-login');
      },
      'click .register': function clickRegister() {
        this.trigger('navigate-register');
      },
      'click button.search-author-name': function clickButtonSearchAuthorName(e) {
        this.trigger('search-author');
      }
    },
    stopPropagation: function stopPropagation(e) {
      if (e.target.tagName.toLowerCase() == 'button' || e.target.tagName.toLowerCase() == 'a' || e.target.tagName.toLowerCase() == 'code') {
        return true;
      }

      e && e.stopPropagation && e.stopPropagation();
    },
    orcidSignIn: function orcidSignIn() {
      this.model.set('orcidModeOn', true); // need to explicitly trigger to widget that this has changed
      // otherwise it will be ignored, since it can also be changed
      // from outside

      this.trigger('user-change-orcid-mode');
    },
    changeOrcidMode: function changeOrcidMode(ev) {
      var checked = _.isBoolean(ev) ? ev : ev && ev.currentTarget && ev.currentTarget.checked;
      this.model.set('orcidModeOn', checked);
      this.trigger('user-change-orcid-mode');
      this.render();
    },
    _hiddenTmpl: _.template('<input type="hidden" name="<%= name %>" value="<%= value %>" />'),
    // appends a hidden input to the general form
    appendToForm: function appendToForm(name, value) {
      if (_.isUndefined(value)) {
        return;
      }

      var $form = $('#feedback-general-form', '#feedback-modal');
      var $el = $("input[type=hidden][name=\"".concat(name, "\"]"), $form); // check if the element exists

      if ($el.length > 0) {
        // update the value
        $el.attr('value', value);
      } else {
        // no element exists, create a new one
        $form.append(this._hiddenTmpl({
          name: name,
          value: value
        }));
      }
    },
    onRender: function onRender() {
      var _this = this;

      // only append a single time
      if ($('#feedback-modal').length === 0) {
        $('body').append(FeedbackTemplate());
      }

      var $modal = $('#feedback-modal');
      var $modalTitle = $('#feedback-modal-title', $modal);
      var $optionList = $('#feedback-select-group', $modal);
      var $generalForm = $('#feedback-general-form', $modal);
      var $feedbackBackBtn = $('#feedback-back-btn', $modal);
      var $submitAbstractLink = $('a#feedback_submit_abstract_link', $optionList);

      var showListView = function showListView() {
        $optionList.show();
        $generalForm.hide();
        $feedbackBackBtn.hide();
        $modalTitle.text('How may we help you today?');
      };

      var hideListView = function hideListView() {
        $optionList.hide();
        $generalForm.show();
        $modalTitle.text('General Feedback');
        $feedbackBackBtn.show();
        $feedbackBackBtn.off().click(function () {
          return showListView();
        });
        $modal.one('shown.bs.modal', function () {
          $('input[name=name]', $generalForm).focus();
        });
      };

      $modal.on('hidden.bs.modal', function () {
        $('input, textarea', $modal).val('');
        var $fg = $('button[type=submit]', $modal).closest('.form-group');
        $fg.html('<button class="btn btn-success" type="submit" value="Send">Submit</button>');
        showListView();
      }); // run just before showing the modal

      $modal.on('show.bs.modal', function (e) {
        // grab view if available
        var view = $(e.relatedTarget).data('feedbackView');

        if (view === 'general') {
          hideListView();
        }
      }); // just after it has been shown

      $modal.on('shown.bs.modal', function () {
        _this.trigger('activate-recaptcha');

        $generalForm.off().submit(function (e) {
          e.preventDefault();

          _this.trigger('feedback-form-submit', $(e.target), $modal);

          return false;
        });
        $('#open-general-feedback').off().click(function () {
          hideListView();
          $('input[name=name]', $generalForm).focus();
          return false;
        });

        if (_this.model.has('currentUser')) {
          var user = _this.model.get('currentUser');

          $('input[name=_replyto]', $generalForm).val(user);

          _this.appendToForm('currentuser', user);
        } else {
          _this.appendToForm('currentuser', 'anonymous');
        }

        if (_this.model.has('browser')) {
          var _this$model$get = _this.model.get('browser'),
              browser = _this$model$get.browser,
              platform = _this$model$get.platform,
              engine = _this$model$get.engine,
              os = _this$model$get.os;

          _this.appendToForm('browser.name', browser.name);

          _this.appendToForm('browser.version', browser.version);

          _this.appendToForm('engine', engine.name);

          _this.appendToForm('platform', platform.type);

          _this.appendToForm('os', os.name);
        }

        if (_this.model.has('page')) {
          _this.appendToForm('current_page', _this.model.get('page'));
        }

        _this.appendToForm('url', window.location.href);

        if (_this.model.has('currentQuery')) {
          _this.appendToForm('current_query', _this.model.get('currentQuery'));
        }

        if (_this.model.get('page') === 'ShowAbstract' && _this.model.has('bibcode')) {
          // update the submit abstract url with the current bibcode, only if we are on an abstract page
          $submitAbstractLink.attr('href', function (i, url) {
            if (url.indexOf('?') > -1) {
              return url;
            }

            return url += '?bibcode=' + _this.model.get('bibcode');
          });
        } else {
          // otherwise, clear the query string off the url
          $submitAbstractLink.attr('href', function (i, url) {
            return url.replace(/\?.*$/, '');
          });
        }
      });
      setTimeout(function () {
        $('a', '.account-dropdown').click(function () {
          $('.dropdown-toggle', '.account-dropdown').dropdown('toggle');
        });
      }, 300);
    }
  });
  NavWidget = BaseWidget.extend({
    initialize: function initialize(options) {
      var _this2 = this;

      options = options || {};
      this.model = new NavModel();
      this.view = new NavView({
        model: this.model
      });
      BaseWidget.prototype.initialize.apply(this, arguments);
      this.qUpdater = new ApiQueryUpdater('NavBar'); // get the current browser information

      utils.getBrowserInfo().then(function (data) {
        _this2.model.set('browser', data);
      }).fail(function () {
        _this2.model.set('browser', null);
      });
    },
    activate: function activate(beehive) {
      this.setBeeHive(beehive);

      _.bindAll(this, ['handleUserAnnouncement', 'getOrcidUserInfo', 'storeLatestPage', 'onCustomEvent', 'onStartSearch']);

      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.USER_ANNOUNCEMENT, this.handleUserAnnouncement);
      pubsub.subscribe(pubsub.APP_STARTED, this.getOrcidUserInfo);
      pubsub.subscribe(pubsub.NAVIGATE, this.storeLatestPage);
      pubsub.subscribe(pubsub.CUSTOM_EVENT, this.onCustomEvent);
      pubsub.subscribe(pubsub.START_SEARCH, this.onStartSearch);
      this.setInitialVals();

      if (!this.model.get('timer')) {
        this.resetOrcidTimer();
      }
    },
    onStartSearch: function onStartSearch(apiQuery) {
      this.model.set('currentQuery', apiQuery.url());
    },
    onCustomEvent: function onCustomEvent(ev, data) {
      if (ev === 'orcid-action') {
        this.resetOrcidTimer();
      } else if (ev === 'latest-abstract-data') {
        this.onNewAbstractData(data);
      }
    },
    storeLatestPage: function storeLatestPage(page) {
      // to know whether to orcid redirect
      this._latestPage = page;
      this.model.set('page', page);
    },
    onNewAbstractData: _.debounce(function (data) {
      this.model.set('bibcode', data.bibcode);
    }, 500),
    resetOrcidTimer: function resetOrcidTimer() {
      var timer = this.model.get('timer');
      var timeout = this.model.get('timeout');

      if (timer) {
        clearTimeout(timer);
      } // only start the timer if orcid mode is actually on


      if (this.model.get('orcidModeOn')) {
        timer = setTimeout(_.bind(this.toggleOrcidMode, this, false), timeout);
        this.model.set('timer', timer);
      }
    },
    viewEvents: {
      // dealing with authentication/user
      'navigate-login': function navigateLogin() {
        this._navigate('authentication-page', {
          subView: 'login'
        });
      },
      'navigate-register': function navigateRegister() {
        this._navigate('authentication-page', {
          subView: 'register'
        });
      },
      'navigate-settings': function navigateSettings() {
        this._navigate('UserPreferences');
      },
      logout: function logout() {
        // log the user out of both the session and orcid
        this.getBeeHive().getObject('Session').logout(); // log out of ORCID too

        this.orcidLogout();
      },
      'feedback-form-submit': 'submitForm',
      // dealing with orcid
      'navigate-to-orcid-link': 'navigateToOrcidLink',
      'user-change-orcid-mode': 'toggleOrcidMode',
      'logout-only-orcid': 'orcidLogout',
      'search-author': 'searchAuthor',
      'activate-recaptcha': 'activateRecaptcha'
    },
    submitForm: function submitForm($form, $modal) {
      var _this3 = this;

      var submit = function submit() {
        var data = $form.serialize(); // record the user agent string

        data += '&user-agent-string=' + encodeURIComponent(navigator.userAgent);

        function beforeSend() {
          $form.find('button[type=submit]').html('<i class="icon-loading" aria-hidden="true"></i> Sending form...');
        }

        function done(data) {
          $form.find('button[type=submit]').html('<i class="icon-success" aria-hidden="true"></i> Message sent!');
          setTimeout(function () {
            $modal.modal('hide');
          }, 500);
        }

        function fail(err) {
          $form.find('button[type=submit]').addClass('btn-danger').html('<i class="icon-danger" aria-hidden="true"></i> There was an error!');
        }

        var request = new ApiRequest({
          target: ApiTargets.FEEDBACK,
          options: {
            method: 'POST',
            data: data,
            dataType: 'json',
            done: done,
            fail: fail,
            beforeSend: beforeSend
          }
        });

        _this3.getBeeHive().getService('Api').request(request);
      };

      var has = function has(el) {
        var res = false;
        $form.serializeArray().forEach(function (i) {
          if (i.name === el && !_.isEmpty(i.value)) {
            return res = true;
          }
        });
        return res;
      };

      has('g-recaptcha-response') ? submit() : this.getBeeHive().getObject('RecaptchaManager').execute().then(submit);
    },
    navigateToOrcidLink: function navigateToOrcidLink() {
      this._navigate('orcid-page');
    },
    _navigate: function _navigate(page, opts) {
      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.NAVIGATE, page, opts);
    },
    // to set the correct initial values for signed in statuses
    setInitialVals: function setInitialVals() {
      var user = this.getBeeHive().getObject('User');
      var orcidApi = this.getBeeHive().getService('OrcidApi');
      var hasAccess = orcidApi.hasAccess();
      this.model.set({
        orcidModeOn: user.isOrcidModeOn() && hasAccess,
        orcidLoggedIn: hasAccess
      });
      this.model.set('currentUser', user.getUserName());
    },
    getOrcidUserInfo: function getOrcidUserInfo() {
      var orcidApi = this.getBeeHive().getService('OrcidApi'); // get the orcid username if applicable

      if (this.model.get('orcidLoggedIn')) {
        // set the orcid username into the model
        var that = this;
        orcidApi.getUserBio().done(function (bio) {
          var firstName = bio.getFirstName();
          var lastName = bio.getLastName();
          that.model.set('orcidFirstName', firstName);
          that.model.set('orcidLastName', lastName);
          that.model.set('orcidQueryName', lastName + ', ' + firstName); // this will always be available

          that.model.set('orcidURI', bio.getOrcid());
        });
      } // also set in the "hourly" flag


      var hourly = this.getBeeHive().getObject('AppStorage').getConfigCopy().hourly;
      this.model.set('hourly', hourly);
    },
    handleUserAnnouncement: function handleUserAnnouncement(msg, data) {
      var orcidApi = this.getBeeHive().getService('OrcidApi');
      var user = this.getBeeHive().getObject('User');

      if (msg == user.USER_SIGNED_IN) {
        this.model.set('currentUser', data);
      } else if (msg == user.USER_SIGNED_OUT) {
        this.model.set('currentUser', undefined);
      } else if (msg == user.USER_INFO_CHANGE && _.has(data, 'isOrcidModeOn')) {
        // every time this changes, we check for api access status
        this.model.set({
          orcidModeOn: data.isOrcidModeOn,
          orcidLoggedIn: orcidApi.hasAccess()
        });

        if (this.model.get('orcidLoggedIn')) {
          this.getOrcidUserInfo();
        }
      }
    },
    // we don't want to respond to changes from pubsub or user object with this,
    // only changes that the user has initiated using the navbar widget,
    // otherwise things will be toggled incorrectly
    toggleOrcidMode: function toggleOrcidMode(val) {
      var user = this.getBeeHive().getObject('User');
      var orcidApi = this.getBeeHive().getService('OrcidApi');
      var newVal = _.isBoolean(val) ? val : this.model.get('orcidModeOn');
      this.resetOrcidTimer();

      if (newVal) {
        // sign into orcid api if not signed in already
        if (!orcidApi.hasAccess()) {
          return orcidApi.signIn();
        }
      }

      user.setOrcidMode(newVal);
      this.model.set('orcidModeOn', newVal);
    },
    searchAuthor: function searchAuthor() {
      var pubsub = this.getPubSub();
      pubsub.publish(pubsub.START_SEARCH, new ApiQuery({
        q: 'author:' + this.qUpdater.quote(this.model.get('orcidQueryName'))
      }));
    },
    signOut: function signOut() {
      var user = this.getBeeHive().getObject('User');
      var orcidApi = this.getBeeHive().getService('OrcidApi');
      if (orcidApi) orcidApi.signOut();
      user.setOrcidMode(false);
    },
    orcidLogout: function orcidLogout() {
      var pubsub = this.getPubSub();
      this.getBeeHive().getService('OrcidApi').signOut(); // ned to set this explicitly since there is no event from the beehive

      this.model.set('orcidLoggedIn', false);
      this.getBeeHive().getObject('User').setOrcidMode(false); // finally, redirect if currently on orcid page

      if (this._latestPage === 'orcid-page') {
        pubsub.publish(pubsub.NAVIGATE, 'index-page');
      }
    },
    activateRecaptcha: function activateRecaptcha() {
      if (this._activated) {
        return;
      }

      this._activated = true; // right now, modal is not part of main view.$el because it has to be inserted at the bottom of the page

      var view = new Marionette.ItemView({
        el: '#feedback-modal'
      });
      this.getBeeHive().getObject('RecaptchaManager').activateRecaptcha(view);
    }
  });
  return NavWidget;
});
