define(['ojs/ojcore', 'knockout', 'jquery', 'appState', 'entities/repository',
        'moment',
        'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojarraytabledatasource'],
function(oj, ko, $, appState, Repository, moment) {
 
  function RepositoriesViewModel() {
    var self = this;

    self.moment = moment;    
    self.dsRepos = new oj.ArrayTableDataSource([], { idAttribute: 'id' });
    self.currentRepo = new Repository();
    
    self.onAdd = function() {
        oj.Router.rootInstance.go('repository');
    };

    self.onEdit = function(repository) {
        oj.Router.rootInstance.go('repository/' + repository.id);
    };

    self.onDelete = function(repo) {
      self.currentRepo.fromObject(repo);
      $('#dlgRepo_Delete').ojDialog('open');
    };

    self.onDeleteConfirm = function() {
      $('#dlgRepo_Delete').ojDialog('close');
      
      Repository.remove(self.currentRepo.id(), function(item, errors) {
        if (item) {
          self.load();
          appState.growlSuccess('Repository deleted: ' + self.currentRepo.name());

        } else {
          appState.growlFail('Unable to delete repository: ' + self.currentRepo.name());
        }
      });
    };

    self.onDeleteCancel = function() {
      $('#dlgRepo_Delete').ojDialog('close');
    };

    self.load = function() {
        Repository.list(true, function(items, errors) {
        if (items) {
          self.dsRepos.reset(items);

        } else {
          appState.growlFail('Unable to load repositories');
        }
      });
    };
                 
    self.handleActivated = function(info) {
      if (!appState.user.isLoggedIn()) {
        oj.Router.rootInstance.go('login');
        return;
      }
      
      self.dsRepos.reset([]);
      self.load();
    };      
  }

  return new RepositoriesViewModel();
});
