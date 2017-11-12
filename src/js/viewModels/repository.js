define(['ojs/ojcore', 'knockout', 'jquery', 'appState', 'entities/repository', 'entities/secret',
        'ojs/ojinputtext', 'ojs/ojselectcombobox', 'ojs/ojcheckboxset', 'ojs/ojlistview', 'ojs/ojdialog',
        'ojs/ojarraytabledatasource', 'ojs/ojknockout-validation'],
  function(oj, ko, $, appState, Repository, Secret) {
    var EMPTY = { id: '0', label: '-- None --' };
      
    function EditRepositoryViewModel() {
      var self = this;

      self.tracker = ko.observable();
      self.childTracker = ko.observable();
      self.title = ko.observable();

      self.dsSecrets = ko.observableArray();
      self.dsChildRepos = new oj.ArrayTableDataSource([], { idAttribute: 'name' });
      
      self.showChildSave = ko.observable(false);
      self.currentRepo = new Repository();
      self.currentChildRepo = ko.observable(new Repository());
      self.isChildNew = false;

      self.showUri = ko.pureComputed(function() {
        return this.currentRepo.type().length &&
          (this.currentRepo.type()[0] === Repository.GIT || 
           this.currentRepo.type()[0] === Repository.P4 ||
           this.currentRepo.type()[0] === Repository.FS);

      }, self);

      self.showForGit = ko.pureComputed(function() {
        var showGit = this.currentRepo.type().length && this.currentRepo.type()[0] === Repository.GIT;
        // Sneak in focus logic here.
        $('#txtName').focus();
        return showGit;

      }, self);

      self.showForP4 = ko.pureComputed(function() {
        return this.currentRepo.type().length && this.currentRepo.type()[0] === Repository.P4;

      }, self);

      self.showForMultiRepo = ko.pureComputed(function() {
        var type = this.currentRepo.type().length > 0 ? this.currentRepo.type()[0] : Repository.FS;
        var isMulti = type === Repository.MULTI_GIT || type === Repository.MULTI_P4;

        if (isMulti) {
          self.dsChildRepos.reset(self.currentRepo.children);
          self.showChildSave(self.currentRepo.children.length > 0);
        }

        return isMulti;

      }, self);

      self.showForMultiP4 = ko.pureComputed(function() {
        var type = this.currentRepo.type().length > 0 ? this.currentRepo.type()[0] : Repository.FS;
        return type === Repository.MULTI_P4;

      }, self);

      self.showForMultiGit = ko.pureComputed(function() {
        var type = this.currentRepo.type().length > 0 ? this.currentRepo.type()[0] : Repository.FS;
        return type === Repository.MULTI_GIT;

      }, self);
    
      self.onAddChild = function() {
        var childRepo = new Repository();
        childRepo.fromObject();

        var type = this.currentRepo.type().length > 0 ? this.currentRepo.type()[0] : Repository.FS;
        if (type === Repository.MULTI_GIT) {
          childRepo.type([Repository.GIT]);
        } else {
          childRepo.type([Repository.P4]);
        }
        
        self.isChildNew = true;
        self.currentChildRepo(childRepo);
        $('#dlgChildRepo').ojDialog('open');        
      };

      self.onEditChild = function(childRepo) {
        self.isChildNew = false;
        self.currentChildRepo(childRepo);
        $('#dlgChildRepo').ojDialog('open');
      };

      self.onChildSave = function() {
        if (self.childTracker().invalidHidden || self.childTracker().invalidShown || !self.childValidate()) {
          self.childTracker().showMessages();
          self.childTracker().focusOnFirstInvalid();            
          return false;
        }

        if (self.isChildNew) {
          self.currentRepo.children.push(self.currentChildRepo());
        }
        
        self.dsChildRepos.reset(self.currentRepo.children);
        self.showChildSave(true);

        $('#dlgChildRepo').ojDialog('close');
      };

      self.onChildClose = function() {
        $('#dlgChildRepo').ojDialog('close');
      };

      self.onDeleteChild = function(childRepo) {
        var children = [];
        for (var c=0; c<self.currentRepo.children.length; c++) {
          if (childRepo.name() !== self.currentRepo.children[c].name()) {
            children.push(self.currentRepo.children[c]);
          }
        }
        
        self.currentRepo.children = children;
        self.dsChildRepos.reset(self.currentRepo.children);
        self.showChildSave(children.length > 0);
      };
      
      self.childValidate = function() {        
        return $('#txtChildName').ojInputText('validate') 
                 & $('#txtChildUri').ojInputText('validate');        
      };

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
        Repository.get(id, true, function(item, errors) {
          if (item) {                            
            self.title('Edit repository');
            self.currentRepo.fromObject(item);

            self.loadSecrets();

          } else {
            appState.growlFail('Unable to load repository: ' + id);
          }          
        });
      };

      self.loadSecrets = function() {
        Secret.list(false, function(items, errors) {
          if (items) {            
            items.unshift(EMPTY);
            self.dsSecrets(items);

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
        
        var parentRouter = info.valueAccessor().params.ojRouter.parentRouter;

        self.router = parentRouter.currentState().value;
        self.router.configure(function (id) {
          var state;

          if (id) {            
            state = new oj.RouterState(id, {
              value: id,
              canEnter: function () {
                return true;
              }
            });
          }

          return state;
        });

        self.currentRepo.fromObject();

        return oj.Router.sync();                         
      };
      
      self.handleBindingsApplied = function(info) {
        if (self.router.currentValue()) {
          self.load(self.router.currentValue());

        } else {
          self.title('Add repository');
          self.currentRepo.fromObject();
          self.loadSecrets();
        }
      };
    }

    return new EditRepositoryViewModel();
  }
);
