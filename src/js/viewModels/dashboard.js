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

      self.getRepoTypeDisplayName = function(repository) {
        switch(repository.type) {
          case 'GIT':
          case 'MULTI_GIT':
            return 'Git';

          case 'P4':
          case 'MULTI_P4':
            return 'Perforce';
            
          default:
            return 'File System';  
        }
      };

      self.onView = function(build) {
        oj.Router.rootInstance.go('build/' + build.id);
      };

      self.onReplayOrAbort = function(build) {
        self.currentBuild.fromObject(build);
        var status = self.currentBuild.status;

        if (status == 'DONE' || status == 'FAILED' || status == 'CANCELED') {
          self.successMessage = 'Build restarted: ';
          self.errorMessage = 'Unable to restart the build: ';
          Pipeline.start(self.currentBuild.pipelineID, self.currentBuild.data, self.andThen);

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
        $('#dlgBuild_Delete').ojDialog('close');
        
        Build.remove(self.currentBuild.id(), function(item, errors) {
          if (item) {
            self.load();
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
        Build.list(true, function(items, errors) {
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
        self.dsBuilds.reset([]);
        self.load();        
      };            
    }

    return new DashboardViewModel();
  }
);
