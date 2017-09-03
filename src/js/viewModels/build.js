define(['ojs/ojcore', 'knockout', 'jquery', 'appState',
        'entities/build',
        'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojprogressbar', 'ojs/ojarraytabledatasource'],
  function(oj, ko, $, appState, Build) {
    
    function BuildViewModel() {
      var self = this;

      self.currentBuild = ko.observable();
      self.dsPhases = new oj.ArrayTableDataSource([], { idAttribute: 'id' });
      self.logs = ko.observable();
      
      self.onBack = function() {
        oj.Router.rootInstance.go('dashboard');
      };
      
      self.showLogs = function(phase) {
        self.logs('Loading...');

        var tail = (phase.status == 'DONE' || phase.status == 'FAILED') ? 'all' : '50';

        Build.logs(self.currentBuild().id(), phase.containerID, tail, function(logs, errors) {
          self.logs(errors ? errors : logs);
        });

        $('#dlgLogs').ojDialog('open');
      }

      self.onClose = function() {
        $('#dlgLogs').ojDialog('close');
      }
      
      self.load = function(id) {
        return new Promise(function (resolve, reject) {
            Build.get(id, function(item, errors) {
            if (item) {
              var build = new Build();
              build.fromObject(item);
              self.currentBuild(build);              
              self.dsPhases.reset(item.phases ? item.phases : []);
              resolve(true);

              // Refresh every 15 seconds if the build is in progress.
              if (item.status == 'PARKED' || item.status == 'IN_FLIGHT' || item.status == 'PRE_FLIGHT') {
                window.setTimeout(self.load, 10000, id);
              }

            } else {
              appState.growlFail('Unable to load build: ' + id);
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

        self.currentBuild(new Build());

        return oj.Router.sync();                         
      }; 

      self.handleBindingsApplied = function(info) {
        
        if (!self.currentBuild().id()) { 
          oj.Router.rootInstance.go('dashboard');         
        }
      };
    }

    return new BuildViewModel();
  }
);
