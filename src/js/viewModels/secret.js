define(['ojs/ojcore', 'knockout', 'jquery', 'appState',
        'entities/secret',
        'ojs/ojinputtext', 'ojs/ojknockout-validation'],
  function(oj, ko, $, appState, Secret) {
    
    function EditSecretViewModel() {
      var self = this;

      self.tracker = ko.observable();
      self.title = ko.observable();
      
      self.currentSecret = null;

      self.validate = function() {        
        return $('#txtName').ojInputText('validate');        
      };

      self.onCancel = function() {
        oj.Router.rootInstance.go('settings');
      };

      self.onSave = function() {
        if (self.tracker().invalidHidden || self.tracker().invalidShown || !self.validate()) {
          self.tracker().showMessages();
          self.tracker().focusOnFirstInvalid();            
          return false;
        }

        var data = self.currentSecret.toObject();
    
        Secret.save(data, function(item, errors) {
          if (item) {
            oj.Router.rootInstance.go('settings'); 
            appState.growlSuccess('Secret saved: ' + item.name);

          } else {
            appState.growlFail('Unable to save secret: ' + data.name);
          }
        });
      };

      self.load = function(id) {
        Secret.get(id, true, function(item, errors) {
          if (item) {
            self.title('Edit secret');
            self.currentSecret.fromObject(item);

          } else {
            appState.growlFail('Unable to load secret: ' + id);
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
                self.load(id);
                return true;
              }
            });
          }

          return state;
        });

        self.currentSecret = new Secret();

        return oj.Router.sync();                         
      }; 

      self.handleBindingsApplied = function(info) {        
        if (!self.currentSecret.id()) {
          self.title('Add secret');
          self.currentSecret.fromObject();        
        }
      };
    }

    return new EditSecretViewModel();
  }
);
