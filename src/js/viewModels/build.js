define(['ojs/ojcore', 'knockout', 'jquery', 'appState',
        'entities/build',
        'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojprogressbar', 'ojs/ojarraytabledatasource'],
  function(oj, ko, $, appState, Build) {

    function PhaseViewModel() {
      var self = this;

      self.id = null;
      self.containerID = null;
      self.status = ko.observable();

      self.clear = function() {
        self.id = null;
        self.containerID = null;
        self.status('');
      };
    }
    
    function BuildViewModel() {
      var self = this;

      self.currentBuild = ko.observable();
      self.dsPhases = new oj.ArrayTableDataSource([], { idAttribute: 'id' });

      self.currentPhase = new PhaseViewModel();
      self.logs = ko.observable();
      self.logsRefreshIntervalID = null;

      self.viewAttached = false;

      self.onBack = function() {
        oj.Router.rootInstance.go('dashboard');
      };
      
      self.showLogs = function(phase) {
        self.logs('Loading...');
        
        self.currentPhase.id = phase.id;
        self.currentPhase.containerID = phase.containerID;
        self.currentPhase.status(phase.status);

        self.loadLogs();

        $('#dlgLogs').ojDialog('open');
      }

      self.loadLogs = function() {
        var status = self.currentPhase.status();
        var tail = (status == 'DONE' || status == 'FAILED') ? 500 : 100;

        if (status == 'IN_FLIGHT') {
          // See if we want to do traditional ajax polling.
          if (!self.logsRefreshIntervalID) {
            self.logsRefreshIntervalID = window.setInterval(self.loadLogs, 8000);
          }

        } else {
          self.stopLogsRefresh();
        }

        Build.logs(self.currentBuild().id(), self.currentPhase.containerID, tail, function(logs, errors) {
          self.logs(errors ? errors : logs);
        });
      };

      self.onClose = function() {
        self.stopLogsRefresh();
        $('#dlgLogs').ojDialog('close');
      }

      self.stopLogsRefresh = function() {
        if (self.logsRefreshIntervalID) {
          window.clearInterval(self.logsRefreshIntervalID);
          self.logsRefreshIntervalID = null;          
        }
      };
      
      self.load = function(id, showLoading) {
        Build.get(id, showLoading, function(item, errors) {
          if (item) {
            var build = new Build();
            build.fromObject(item);
            self.currentBuild(build);              
            self.dsPhases.reset(item.phases ? item.phases : []);

            if (item.phases && self.currentPhase.id) {
                for (var p=0; p<item.phases.length; p++) {
                  if (item.phases[p].id == self.currentPhase.id) {
                    self.currentPhase.status(item.phases[p].status);
                    break;
                  }
                }
            }
            
            // Refresh the build.
            if (self.viewAttached) self.reload(item);

          } else {
            appState.growlFail('Unable to load build: ' + id);
          }          
        });        
      };

      self.reload = function(item) {
        if (item.status == 'PARKED' || item.status == 'PRE_FLIGHT' || item.status == 'IN_FLIGHT') {
          var timeout = 2000;

          if (item.status == 'PRE_FLIGHT') {
            timeout = 4000;

          } else if (item.status == 'IN_FLIGHT') {
            timeout = 10000;
          }

          window.setTimeout(self.load, timeout, item.id, false);
        }
      };
                        
      self.handleActivated = function(info) {
        if (!appState.user.isLoggedIn()) {
          oj.Router.rootInstance.go('login');
          return;
        }

        self.viewAttached = true;

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

        self.currentBuild(new Build());

        return oj.Router.sync();                         
      }; 

      self.handleDetached = function() {
        self.viewAttached = false;
        self.stopLogsRefresh();
        self.currentPhase.clear();
      };

      self.handleBindingsApplied = function(info) {
        self.dsPhases.reset([]);
        
        if (self.router.currentValue()) {
          self.load(self.router.currentValue(), true);

        } else {
          oj.Router.rootInstance.go('dashboard');
        }
      };
    }

    return new BuildViewModel();
  }
);
