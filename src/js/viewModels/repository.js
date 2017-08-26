define(['ojs/ojcore', 'knockout', 'jquery', 'appState', 'entities/repository',
        'ojs/ojinputtext', 'ojs/ojselectcombobox', 'ojs/ojknockout-validation'],
  function(oj, ko, $, appState, Repository) {
      
    function EditRepositoryViewModel() {
      var self = this;

      self.tracker = ko.observable();
      self.title = ko.observable();
      
      self.currentRepo = new Repository();

      self.showForGit = ko.pureComputed(function() {
        var showGit = this.currentRepo.type().length && this.currentRepo.type()[0] === Repository.GIT;
        // Sneak in focus logic here.
        $('#txtName').focus();
        return showGit;
      }, self);
      
      self.validate = function() {        
        return $('#txtName').ojInputText('validate') 
                 & $('#txtUri').ojInputText('validate');        
      };
      
      self.onCancel = function() {
        oj.Router.rootInstance.go('repositories');
      };

      self.onSave = function() {
        if (self.tracker().invalidHidden || self.tracker().invalidShown || !self.validate()) {
          self.tracker().showMessages();
          self.tracker().focusOnFirstInvalid();            
          return false;
        }

        var data = self.currentRepo.toObject();

        Repository.save(data, function(item, errors) {
          if (item) {
            oj.Router.rootInstance.go('repositories');   
            appState.growlSuccess('Repository saved: ' + item.name);         

          } else {
            appState.growlFail('Unable to save repository: ' + data.name);
          }
        });        
      };
      
      self.load = function(id) {
        return new Promise(function (resolve, reject) {
          Repository.get(id, function(item, errors) {
            if (item) {
              self.title('Edit repository');
              self.currentRepo.fromObject(item);
              resolve(true);

            } else {
              appState.growlFail('Unable to load repository: ' + id);
              resolve(false);
            }          
          });
        });
      };

      self.handleActivated = function(info) {
        if (!appState.user.isLoggedIn()) {
          oj.Router.rootInstance.go('login');
          return;
        }
        
        var parentRouter = info.valueAccessor().params.ojRouter.parentRouter;

        self.router = parentRouter.currentState().value;
        self.router.configure(function (id) {
          var state;

          if (id) {            
            state = new oj.RouterState(id, {
              value: id,
              canEnter: function () {
                return self.load(id);
              }
            });
          }

          return state;
        });

        self.currentRepo.fromObject();

        return oj.Router.sync();                         
      };
      
      self.handleBindingsApplied = function(info) {
        if (!self.currentRepo.id()) {
          self.title('Add repository');
          self.currentRepo.fromObject();          
        }                
      };
    }

    return new EditRepositoryViewModel();
  }
);
