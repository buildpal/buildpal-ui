define(['ojs/ojcore', 'knockout', 'jquery', 'appState',
        'moment', 'entities/build',
        'ojs/ojlistview', 'ojs/ojarraytabledatasource'],
  function(oj, ko, $, appState, moment, Build) {
  
    function DashboardViewModel() {
      var self = this;

      self.moment = moment;
      self.showBuilds = ko.observable(false);
      self.dsBuilds = new oj.ArrayTableDataSource([], { idAttribute: 'id' });

      self.onView = function(build) {
        oj.Router.rootInstance.go('build/' + build.id);
      };
            
      self.handleActivated = function(info) {
        if (!appState.user.isLoggedIn()) {
          oj.Router.rootInstance.go('login');
          return;
        }

        self.showBuilds(true);

        Build.list(function(items, errors) {
          if (errors && errors.length > 0) {
            appState.growlFail('Unable to load builds.');                            
          } else {
            self.dsBuilds.reset(items);
          }
        });
      };            
    }

    return new DashboardViewModel();
  }
);
