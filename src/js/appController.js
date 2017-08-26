define(['ojs/ojcore', 'knockout', 'appState', 'ojs/ojrouter', 'ojs/ojknockout', 'ojs/ojarraytabledatasource',
  'ojs/ojoffcanvas'],
  function(oj, ko, appState) {
    function ControllerViewModel() {
      var self = this;

      // Media queries for repsonsive layouts
      var smQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      var mdQuery = oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      self.mdScreen = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

      self.appState = appState;
    
      // Router setup
      self.router = oj.Router.rootInstance;
      self.router.configure({
        'login': { label: 'Login' },
        'dashboard': { label: 'Dashboard', isDefault: true },
        'build': {
          label: 'Build',
          exit: function () {
            var childRouter = self.router.currentState().value;
            childRouter.dispose();
          },
          enter: function () {
            var childRouter = self.router.createChildRouter('id');
            childRouter.defaultStateId = '';
            self.router.currentState().value = childRouter;
          }
        },
        'pipelines': { label: 'Pipelines' },
        'pipeline': {
          label: 'Pipeline',
          exit: function () {
            var childRouter = self.router.currentState().value;
            childRouter.dispose();
          },
          enter: function () {
            var childRouter = self.router.createChildRouter('id');
            childRouter.defaultStateId = '';
            self.router.currentState().value = childRouter;
          }
        },
        'repositories': { label: 'Repositories' },
        'repository': {
          label: 'Repository',
          exit: function () {
            var childRouter = self.router.currentState().value;
            childRouter.dispose();
          },
          enter: function () {
            var childRouter = self.router.createChildRouter('id');
            childRouter.defaultStateId = '';
            self.router.currentState().value = childRouter;
          }
        },
        'user-management': { label: 'User Management' }
      });
      oj.Router.defaults['urlAdapter'] = new oj.Router.urlParamAdapter();

      // Navigation setup
      var navData = [
        { name: 'Dashboard', id: 'dashboard', iconClass: 'buildpal-dashboard-icon-24' },
        { name: 'Pipelines', id: 'pipelines', iconClass: 'buildpal-pipelines-icon-24' },
        { name: 'Repositories', id: 'repositories', iconClass: 'buildpal-repos-icon-24' },
        //{ name: 'User Management', id: 'user-management', iconClass: 'buildpal-users-icon-24' }
      ];
      self.navDataSource = new oj.ArrayTableDataSource(navData, { idAttribute: 'id' });

      // Drawer
      // Close offcanvas on medium and larger screens
      self.mdScreen.subscribe(function() {
        oj.OffcanvasUtils.close(self.drawerParams);
      });

      self.drawerParams = {
        displayMode: 'push',
        selector: '#navDrawer',
        content: '#pageContent'
      };

      self.goHome = function() {
        self.router.go('/');
      };

      // Called by navigation drawer toggle button and after selection of nav drawer item
      self.toggleDrawer = function() {
        return oj.OffcanvasUtils.toggle(self.drawerParams);
      }

      // Add a close listener so we can move focus back to the toggle button when the drawer closes
      $("#navDrawer").on("ojclose", function() { $('#drawerToggleButton').focus(); });
      
      self.userLogin = ko.observable("admin");    
     }

     return new ControllerViewModel();
  }
);
