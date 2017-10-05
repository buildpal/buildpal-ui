define(['ojs/ojcore', 'knockout', 'jquery', 'appState', 'entities/secret',
        'moment',
        'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojarraytabledatasource'],
function(oj, ko, $, appState, Secret, moment) {
 
  function SettingsViewModel() {
    var self = this;

    self.moment = moment;
    self.dsSecrets = new oj.ArrayTableDataSource([], { idAttribute: 'id' });
    self.currentSecret = new Secret();
    
    self.onAddSecret = function() {
      oj.Router.rootInstance.go('secret');
    };

    self.onEditSecret = function(secret) {
      oj.Router.rootInstance.go('secret/' + secret.id);
    };

    self.onDeleteSecret = function(secret) {
      self.currentSecret.fromObject(secret);
      $('#dlgSecret_Delete').ojDialog('open');
    };

    self.onDeleteSecretConfirm = function() {
      Secret.remove(self.currentSecret.id(), function(item, errors) {
        if (item) {
          self.load();
          $('#dlgSecret_Delete').ojDialog('close');
          appState.growlSuccess('Secret deleted: ' + self.currentSecret.name());

        } else {
          appState.growlFail('Unable to delete secret: ' + self.currentSecret.name());
        }
      });
    };

    self.onDeleteSecretCancel = function() {
      $('#dlgSecret_Delete').ojDialog('close');
    };

    self.load = function() {
      Secret.list(function(items, errors) {
        if (items) {
          self.dsSecrets.reset(items);

        } else {
          appState.growlFail('Unable to load secrets');
        }
      });
    };
                 
    self.handleActivated = function(info) {
      if (!appState.user.isLoggedIn()) {
        oj.Router.rootInstance.go('login');
        return;
      }
      
      self.load();
    };      
  }

  return new SettingsViewModel();
});
