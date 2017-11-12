define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojmodel'],
 function(oj, ko, $) {
    var USER_DATA = 'userData';  

    var User = function() {
      var self = this;
      self.oauth = new oj.OAuth();
      self.id = ko.observable();
                  
      self.save = function(userData) {
        self.oauth.setAccessTokenResponse(userData);

        if (typeof(Storage) !== 'undefined') {
          localStorage.setItem(USER_DATA, JSON.stringify(userData));
        }        
      };

      self.remove = function() {
        self.oauth.setAccessTokenResponse(null);

        if (typeof(Storage) !== 'undefined') {
          localStorage.removeItem(USER_DATA);
        }        
      };

      self.login = function(userData) {
        self.save(userData);        
        self.isLoggedIn(true);
        self.id(userData.id);

        oj.Router.rootInstance.go('dashboard');
      };

      self.logout = function() {
        self.remove();
        self.isLoggedIn(false);
        self.id('');

        oj.Router.rootInstance.go('login');        
      };

      self.isLoggedIn = ko.observable(false);

      if (typeof(Storage) !== 'undefined') {
        var userData = localStorage.getItem(USER_DATA);

        if (userData) {
          var data = JSON.parse(userData);
          self.oauth.setAccessTokenResponse(data);
          self.id(data.id);
          self.isLoggedIn(true);
        }
      }
    };
  
    function AppState() {

      function closeGrowlSuccess() {
        $('#growlSuccess').ojPopup('close');
      }

      function closeGrowlFail() {
        $('#growlFail').ojPopup('close');
      }

      var self = this;

      self.baseUrl = 'http://localhost:8080';
      self.apiUrl = self.baseUrl + '/api/v1';

      self.user = new User();

      self.growl = {
        linkData: null,
        linkClick: null,
        linkText: ko.observable()
      };

      self.loading = function(show) {
        if (show) {
          $('#buildpalLoading').show();
        } else {
          $('#buildpalLoading').hide();
        }
      };

      self.successMessage = ko.observable();
      self.failureMessage = ko.observable();
      
      self.onLinkClick = function() {
        if (self.growl.linkClick) {
          self.growl.linkClick.call(null, self.growl.linkData);
          self.growl.linkClick = null;
        }

        closeGrowlSuccess();
      };

      self.growlSuccess = function(message, linkText, linkData, linkClick) {
        self.successMessage(message);
        self.growl.linkText(linkText ? linkText : '');
        self.growl.linkClick = linkClick;
        self.growl.linkData = linkData;

        $('#growlSuccess').ojPopup('open', '#growlContainer1');
        window.setTimeout(closeGrowlSuccess, 3000);        
      };

      self.growlFail = function(message) {
        self.failureMessage(message);
        
        $('#growlFail').ojPopup('open', '#growlContainer2');        
        window.setTimeout(closeGrowlFail, 3000);
      };      
    }

    return new AppState();
  }
);
