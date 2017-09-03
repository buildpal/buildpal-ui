define(['ojs/ojcore', 'knockout', 'jquery', 'appState', 'entities/pipeline',
        'moment',
        'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojarraytabledatasource'],
function(oj, ko, $, appState, Pipeline, moment) {
 
  function PipelinesViewModel() {
    var self = this;

    self.moment = moment;
    self.dsPipelines = new oj.ArrayTableDataSource([], { idAttribute: 'id' });
    self.currentPipeline = new Pipeline();
    
    self.onAdd = function() {
      oj.Router.rootInstance.go('pipeline');
    };

    self.onStart = function(pipeline) {
      Pipeline.start(pipeline.id, function(item, errors) {
        if (item) {
          appState.growlSuccess('Pipeline started: ', item.name, item.id, function(id) {
            oj.Router.rootInstance.go('build/' + id);
          });          
        } else {
          appState.growlFail('Pipeline failed to start: ' + pipeline.name);
        }
      });
    };

    self.onEdit = function(pipeline) {
      oj.Router.rootInstance.go('pipeline/' + pipeline.id);
    };

    self.onDelete = function(pipeline) {
      self.currentPipeline.fromObject(pipeline);
      $('#dlgPipeline_Delete').ojDialog('open');
    };

    self.onDeleteConfirm = function() {
      Pipeline.remove(self.currentPipeline.id(), function(item, errors) {
        if (item) {
          self.load();
          $('#dlgPipeline_Delete').ojDialog('close');
          appState.growlSuccess('Pipeline deleted: ' + self.currentPipeline.name());

        } else {
          appState.growlFail('Unable to delete pipeline: ' + self.currentPipeline.name());
        }
      });
    };

    self.onDeleteCancel = function() {
      $('#dlgPipeline_Delete').ojDialog('close');
    };

    self.load = function() {
      Pipeline.list(function(items, errors) {
        if (items) {
          self.dsPipelines.reset(items);

        } else {
          appState.growlFail('Unable to load pipelines');
        }
      });
    };
                 
    self.handleActivated = function(info) {
      if (!appState.user.isLoggedIn()) {
        oj.Router.rootInstance.go('login');
        return;
      }
      
      self.load();
    };      
  }

  return new PipelinesViewModel();
});
