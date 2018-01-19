define(['ojs/ojcore', 'knockout', 'jquery', 'appState',
        'entities/secret', 'entities/user',
        'moment',
        'ojs/ojinputtext', 'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojnavigationlist', 'ojs/ojarraytabledatasource'],
function(oj, ko, $, appState, Secret, User, moment) {
 
  function SettingsViewModel() {
    var self = this;

    self.appState = appState;

    self.settingsType = ko.observable();

    self.moment = moment;
    self.dsSecrets = new oj.ArrayTableDataSource([], { idAttribute: 'id' });
    self.currentSecret = new Secret();

    self.dsNodeAffinity = new oj.ArrayTableDataSource([], { idAttribute: 'id' });
    self.currentUser = new User();

    self.settingsType.subscribe(function() {        
      self.load();
    });
    
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
      $('#dlgSecret_Delete').ojDialog('close');
      
      Secret.remove(self.currentSecret.id(), function(item, errors) {
        if (item) {
          self.load();
          appState.growlSuccess('Secret deleted: ' + self.currentSecret.name());

        } else {
          appState.growlFail('Unable to delete secret: ' + self.currentSecret.name());
        }
      });
    };

    self.onDeleteSecretCancel = function() {
      $('#dlgSecret_Delete').ojDialog('close');
    };

    self.onDeleteAffinity = function(user) {
      self.currentUser.fromObject(user);
      $('#dlgAffinity_Delete').ojDialog('open');
    };

    self.onDeleteAffinityConfirm = function() {
      $('#dlgAffinity_Delete').ojDialog('close');
      
      User.removeAffinity(self.currentUser.id(), function(item, errors) {
        if (errors) {
          appState.growlFail('Unable to clear affinity for user: ' + self.currentUser.id());          
        } else {
          self.load();
          appState.growlSuccess('User affinity cleared: ' + self.currentUser.id());
        }
      });
    };

    self.onDeleteAffinityCancel = function() {
      $('#dlgAffinity_Delete').ojDialog('close');
    };

    self.onDeleteUserWorkspaces = function() {
      $('#dlgUserWorkspaces_Delete').ojDialog('open');
    };

    self.onDeleteUserWorkspacesConfirm = function() {
      $('#dlgUserWorkspaces_Delete').ojDialog('close');

      User.deleteWorkspaces(appState.user.id(), function(item, errors) {
        appState.growlSuccess('Your workspaces were marked for deletion');
      });      
    };

    self.onDeleteUserWorkspacesCancel = function() {
      $('#dlgUserWorkspaces_Delete').ojDialog('close');
    };

    self.load = function() {
      switch(self.settingsType()) {
        case 'secrets':
          self.loadSecrets();
          break;
        
        case 'nodeAffinity':
          self.loadAffinities();
          break;
          
        case 'workspace':
          break;  
      }      
    };

    self.loadSecrets = function() {
      Secret.list(true, function(items, errors) {
        if (items) {
          self.dsSecrets.reset(items);

        } else {
          appState.growlFail('Unable to load secrets');
        }
      });
    };

    self.loadAffinities = function() {
      User.listAffinities(true, function(items, errors) {
        if (items) {
          self.dsNodeAffinity.reset(items);

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

      self.settingsType(null);
      
      self.dsSecrets.reset([]);
      self.dsNodeAffinity.reset([]);
      self.settingsType('secrets');
    };      
  }

  return new SettingsViewModel();
});
