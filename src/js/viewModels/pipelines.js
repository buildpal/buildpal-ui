define(['ojs/ojcore', 'knockout', 'jquery', 'appState', 'entities/pipeline',
        'moment',
        'ojs/ojinputtext', 'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojarraytabledatasource'],
function(oj, ko, $, appState, Pipeline, moment) {

  function DataItem(dataItem) {
    this.id = dataItem.id;
    this.name = dataItem.name;
    this.value = ko.observable();

    if (dataItem.defaultValue) {
      this.value(dataItem.defaultValue);
    }
  }
 
  function PipelinesViewModel() {
    var self = this;

    self.moment = moment;
    self.dsPipelines = new oj.ArrayTableDataSource([], { idAttribute: 'id' });
    self.currentPipeline = new Pipeline();
    self.pipelineAwaitingData = null;

    self.currentData = ko.observableArray();
    
    self.onAdd = function() {
      oj.Router.rootInstance.go('pipeline');
    };

    self.onStart = function(pipeline) {
      if (pipeline.dataList && pipeline.dataList.length > 0) {
        var currentData = [];

        for (var d=0; d<pipeline.dataList.length; d++) {
          var item = new DataItem(pipeline.dataList[d]);
          currentData.push(item);
        }

        self.currentData(currentData);
        $('#dlgPipeline_Data').ojDialog('open');

        self.pipelineAwaitingData = pipeline;

      } else {
        self.pipelineAwaitingData = null;
        self.start(pipeline, {});
      }
    };

    self.start = function(pipeline, data) {
      Pipeline.start(pipeline.id, data, function(item, errors) {
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
      $('#dlgPipeline_Delete').ojDialog('close');
      
      Pipeline.remove(self.currentPipeline.id(), function(item, errors) {
        if (item) {
          self.load();
          appState.growlSuccess('Pipeline deleted: ' + self.currentPipeline.name());

        } else {
          appState.growlFail('Unable to delete pipeline: ' + self.currentPipeline.name());
        }
      });
    };

    self.onDeleteCancel = function() {
      $('#dlgPipeline_Delete').ojDialog('close');
    };

    self.onDataConfirm = function() {
      var data = {};
      var currentData = self.currentData();

      for (var d=0; d<currentData.length; d++) {
        data[currentData[d].id] = currentData[d].value();
      }

      self.start(self.pipelineAwaitingData, data);

      $('#dlgPipeline_Data').ojDialog('close');
    };

    self.onDataCancel = function() {
      self.pipelineAwaitingData = null;
      $('#dlgPipeline_Data').ojDialog('close');
    };

    self.load = function() {
      Pipeline.list(true, function(items, errors) {
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
      
      self.dsPipelines.reset([]);
      self.load();
    };      
  }

  return new PipelinesViewModel();
});
