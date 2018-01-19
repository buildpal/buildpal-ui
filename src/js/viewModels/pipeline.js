define(['ojs/ojcore', 'knockout', 'jquery', 'appState',
        'entities/pipeline', 'entities/repository', 'entities/data-item',
        'ace/ace', 'ojs/ojlistview', 'ojs/ojdialog', 'ojs/ojarraytabledatasource',
        'ojs/ojinputtext', 'ojs/ojselectcombobox', 'ojs/ojknockout-validation'],
  function(oj, ko, $, appState, Pipeline, Repository, DataItem) {
    var EMPTY = { id: '0', label: '-- None --' };
  
    function EditPipelineViewModel() {
      var self = this;

      self.tracker = ko.observable();
      self.childTracker = ko.observable();
      self.title = ko.observable();
      self.dsRepositories = ko.observableArray();
      self.dsData = new oj.ArrayTableDataSource([], { idAttribute: 'name' });

      self.currentData = ko.observable(new DataItem());

      self.showDataSave = ko.observable(false);
      self.isDataNew = false;
      
      self.editor = null;
      self.currentPipeline = null;

      self.scriptTemplateID = ko.observable('1');

      self.scriptTemplateID.subscribe(function(newValue) {        
        self.showScript();
      });

      self.dataItemIDChanging = function(vm, event) {
        var dataItem = self.currentData();
        var newID = event.currentTarget.value;
        
        if (newID && !dataItem.name()) {
          $('#txtDataName').val(newID);
        }
      };

      self.dataItemIDChanged = function(vm, event) {
        var dataItem = self.currentData();
        var newID = event.currentTarget.value;
        
        if (newID && !dataItem.name()) {
          dataItem.name(newID);
        }
      };

      self.validate = function() {        
        return $('#txtName').ojInputText('validate');
      };

      self.validateData = function() {
        return $('#txtDataName').ojInputText('validate') &
          $('#txtDataID').ojInputText('validate');
      }

      self.onAddData = function() {
        var data = new DataItem();
        data.fromObject();

        self.isDataNew = true;
        self.currentData(data);
        $('#dlgData').ojDialog('open'); 
      };

      self.onEditData = function(data) {
        self.isDataNew = false;
        self.currentData(data);
        $('#dlgData').ojDialog('open');
      };

      self.onDeleteData = function(data) {
        var dataList = [];
        for (var d=0; d<self.currentPipeline.dataList.length; d++) {
          if (data.name() !== self.currentPipeline.dataList[d].name()) {
            dataList.push(self.currentPipeline.dataList[d]);
          }
        }
        
        self.currentPipeline.dataList = dataList;
        self.dsData.reset(self.currentPipeline.dataList);

        self.showDataSave(dataList.length > 0);
      };

      self.onSaveData = function() {
        if (self.childTracker().invalidHidden || self.childTracker().invalidShown || !self.validateData()) {
          self.childTracker().showMessages();
          self.childTracker().focusOnFirstInvalid();            
          return false;
        }

        if (self.isDataNew) {
          self.currentPipeline.dataList.push(self.currentData());
        }
        
        self.dsData.reset(self.currentPipeline.dataList);
        self.showDataSave(true);

        $('#dlgData').ojDialog('close');
      };

      self.onCloseData = function() {
        $('#dlgData').ojDialog('close');
      };

      self.onCancel = function() {
        oj.Router.rootInstance.go('pipelines');
      };

      self.onSave = function() {
        if (self.tracker().invalidHidden || self.tracker().invalidShown || !self.validate()) {
          self.tracker().showMessages();
          self.tracker().focusOnFirstInvalid();            
          return false;
        }

        var data = self.currentPipeline.toObject();

        // Save pipeline's JS.
        if (self.editor.getValue()) {
          data.js = self.editor.getValue();
        }

        Pipeline.save(data, function(item, errors) {
          if (item) {
            oj.Router.rootInstance.go('pipelines'); 
            appState.growlSuccess('Pipeline saved: ' + item.name);

          } else {
            appState.growlFail('Unable to save pipeline: ' + data.name);
          }
        });
      };

      self.loadRepos = function() {
        Repository.list(false, function(items, errors) {
          if (items) {
            // FIX issue with select box trying to show children.
            for (var i=0; i<items.length; i++) {
              if (items[i].children) {
                delete items[i].children;
              }
            }

            items.unshift(EMPTY);
            self.dsRepositories(items);

          } else {
            appState.growlFail('Unable to load repositories');
          }

          // Sneak in focus logic here.
          $('#txtName').focus();
        });
      };

      self.load = function(id) {
        Pipeline.get(id, true, function(item, errors) {
          if (item) {
            self.title('Edit pipeline');
            self.currentPipeline.fromObject(item);
            self.dsData.reset(self.currentPipeline.dataList);
            self.showDataSave(self.currentPipeline.dataList.length > 0);

            self.loadRepos();

            Pipeline.downloadJS(self.currentPipeline.id(), function(item, errors) {
              if (item) {
                self.scriptTemplateID('2');
                self.editor.getSession().setValue(item.js);
              } else {
                self.scriptTemplateID('1');
              }
            });

          } else {
            appState.growlFail('Unable to load pipeline: ' + id);
          }          
        });        
      };

      self.showScript = function() {
        if (self.scriptTemplateID() == '0') {
          require(['text!views/pipelines/sample.txt'], function(js) {
            self.editor.getSession().setValue(js);            
          });
        } else if (self.scriptTemplateID() == '1') {
          self.editor.getSession().setValue('');
        }
      }
                        
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
                return true;
              }
            });
          }

          return state;
        });

        self.currentPipeline = new Pipeline();
        self.dsData.reset([]);

        return oj.Router.sync();                         
      }; 

      self.handleBindingsApplied = function(info) {
        self.editor = ace.edit('pipelineEditor');        
        self.editor.session.setMode('ace/mode/javascript');
        self.editor.$blockScrolling = Infinity;

        self.scriptTemplateID(null);

        if (self.router.currentValue()) {
          self.load(self.router.currentValue());

        } else {
          self.title('Add pipeline');
          self.currentPipeline.fromObject();
          self.loadRepos();
          self.scriptTemplateID('0');
        }       
      };
    }

    return new EditPipelineViewModel();
  }
);
