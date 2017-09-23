define(['ojs/ojcore', 'knockout', 'jquery', 'appState', 'entities/repository',
        'ojs/ojinputtext', 'ojs/ojselectcombobox', 'ojs/ojcheckboxset', 'ojs/ojlistview', 'ojs/ojdialog',
        'ojs/ojarraytabledatasource', 'ojs/ojknockout-validation'],
  function(oj, ko, $, appState, Repository) {
      
    function EditRepositoryViewModel() {
      var self = this;

      self.tracker = ko.observable();
      self.childTracker = ko.observable();
      self.title = ko.observable();

      self.dsChildRepos = new oj.ArrayTableDataSource([], { idAttribute: 'name' });
      
      self.showChildSave = ko.observable(false);
      self.currentRepo = new Repository();
      self.currentChildRepo = ko.observable(new Repository());

      self.showForGit = ko.pureComputed(function() {
        var showGit = this.currentRepo.type().length && this.currentRepo.type()[0] === Repository.GIT;
        // Sneak in focus logic here.
        $('#txtName').focus();
        return showGit;

      }, self);

      self.showForMulitGit = ko.pureComputed(function() {
        var showMultiGit = this.currentRepo.type().length && this.currentRepo.type()[0] === Repository.MULTI_GIT;

        if (showMultiGit) {
          self.dsChildRepos.reset(self.currentRepo.children);
          self.showChildSave(self.currentRepo.children.length > 0);
        }

        return showMultiGit;

      }, self);

      self.onAddChild = function() {
        var childRepo = new Repository();
        childRepo.fromObject();
        childRepo.type([Repository.GIT]);

        self.onChildEdit(childRepo);        
      };

      self.onChildEdit = function(childRepo) {
        self.currentChildRepo(childRepo);
        $('#dlgChildRepo').ojDialog('open');
      };

      self.onChildSave = function() {
        if (self.childTracker().invalidHidden || self.childTracker().invalidShown || !self.childValidate()) {
          self.childTracker().showMessages();
          self.childTracker().focusOnFirstInvalid();            
          return false;
        }

        self.currentRepo.children.push(self.currentChildRepo());
        self.dsChildRepos.reset(self.currentRepo.children);

        self.showChildSave(true);

        $('#dlgChildRepo').ojDialog('close');
      };

      self.onChildClose = function() {
        $('#dlgChildRepo').ojDialog('close');
      };

      self.onChildDelete = function(childRepo) {
        var children = [];
        for (var c=0; c<self.currentRepo.children.length; c++) {
          if (childRepo.name() !== self.currentRepo.children[c].name()) {
            children.push(self.currentRepo.children[c]);
          }
        }
        
        self.currentRepo.children = children;
        self.dsChildRepos.reset(self.currentRepo.children);
      };
      
      self.childValidate = function() {        
        return $('#txtChildName').ojInputText('validate') 
                 & $('#txtChildUri').ojInputText('validate')
                 & $('#txtChildRemote').ojInputText('validate')
                 & $('#txtChildBranch').ojInputText('validate');        
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
