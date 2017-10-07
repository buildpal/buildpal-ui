define(['ojs/ojcore', 'knockout', 'jquery', 'appState',
        'moment', 'entities/build', 'entities/pipeline',
        'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojarraytabledatasource'],
  function(oj, ko, $, appState, moment, Build, Pipeline) {
  
    function DashboardViewModel() {
      var self = this;

      self.moment = moment;
      self.showBuilds = ko.observable(false);
      self.dsBuilds = new oj.ArrayTableDataSource([], { idAttribute: 'id' });
      self.currentBuild = new Build();

      self.onView = function(build) {
        oj.Router.rootInstance.go('build/' + build.id);
      };

      self.onReplayOrAbort = function(build) {
        self.currentBuild.fromObject(build);
        var status = self.currentBuild.status;

        if (status == 'DONE' || status == 'FAILED' || status == 'CANCELED') {
          self.successMessage = 'Build restarted: ';
          self.errorMessage = 'Unable to restart the build: ';
          Pipeline.start(self.currentBuild.pipelineID, self.andThen);

        } else {
          self.successMessage = 'Build aborted: ';
          self.errorMessage = 'Unable to abort the build: ';
          Build.abort(self.currentBuild.id(), self.andThen);
        }
      };

      self.andThen = function(item, errors) {
        if (item) {
          self.load();
          appState.growlSuccess(self.successMessage + self.currentBuild.name());

        } else {
          appState.growlFail(self.errorMessage + self.currentBuild.name());
        }
      };

      self.onDelete = function(build) {
        self.currentBuild.fromObject(build);
        $('#dlgBuild_Delete').ojDialog('open');
      };

      self.onDeleteConfirm = function() {
        Build.remove(self.currentBuild.id(), function(item, errors) {
          if (item) {
            self.load();
            $('#dlgBuild_Delete').ojDialog('close');
            appState.growlSuccess('Build deleted: ' + self.currentBuild.name());
  
          } else {
            appState.growlFail('Unable to delete build: ' + self.currentBuild.name());
          }
        });
      };
  
      self.onDeleteCancel = function() {
        $('#dlgBuild_Delete').ojDialog('close');
      };

      self.load = function() {
        Build.list(function(items, errors) {
          if (errors && errors.length > 0) {
            appState.growlFail('Unable to load builds.');                            
          } else {
            self.dsBuilds.reset(items);
          }
        });
      };
            
      self.handleActivated = function(info) {
        if (!appState.user.isLoggedIn()) {
          oj.Router.rootInstance.go('login');
          return;
        }

        self.showBuilds(true);
        self.load();        
      };            
    }

    return new DashboardViewModel();
  }
);
