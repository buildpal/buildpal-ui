define(['ojs/ojcore', 'knockout', 'jquery', 'appState', 'ojs/ojinputtext', 'ojs/ojknockout-validation'],
 function(oj, ko, $, appState) {
  
    function LoginViewModel() {
      var self = this;
      
      self.appState = appState;

      self.userID = ko.observable();
      self.password = ko.observable();
      self.tracker = ko.observable();

      self.loginFailed = ko.observable(false);

      self.validate = function() {
        self.loginFailed(false);

        return $('#txtUserID').ojInputText('validate') 
                 & $('#txtPassword').ojInputPassword('validate');        
      };

      self.onLoginClick = function(data, event) {
        if (self.tracker().invalidHidden || self.tracker().invalidShown || !self.validate()) {
          self.tracker().showMessages();
          self.tracker().focusOnFirstInvalid();            
          return false;
        }

        $.ajax({
          url: appState.baseUrl + '/login',
          data: JSON.stringify({ username: self.userID(), password: self.password() }),
          type: 'POST',
          dataType: 'json',
          contentType: 'application/json',
          success: function (data) {
            appState.user.login(data);
            self.userID('');
            self.password('');            
          }
        }).fail(function() {
          self.loginFailed(true);
          appState.user.logout();
        });

        return true;
      }
            
      self.handleActivated = function(info) {        
        if (appState.user.isLoggedIn()) {
          oj.Router.rootInstance.go('dashboard');
        }
      };
      
      self.handleAttached = function(info) {
        $('input').keypress(function (e) {
          if ((e.which && e.which == $.ui.keyCode.ENTER) || (e.keyCode && e.keyCode == $.ui.keyCode.ENTER)) {                                    
            return self.validate() ? self.onLoginClick() : false;
          }

          return true;
        });        
      };

      self.handleBindingsApplied = function(info) {
        $('#txtUserID').focus();
      };
    }

    return new LoginViewModel();
  }
);
