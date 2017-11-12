define(['knockout', 'appState', 'entities/entity', 'entities/data-item'],
function(ko, appState, Entity, DataItem) {
  var PIPELINES_PATH = '/pipelines/';
            
  function Pipeline() {
    Entity.call(this, null);
    
    this.repositoryID = ko.observable([]);
    this.dataList = [];
  }

  Pipeline.prototype = Object.create(Entity.prototype);
  Pipeline.prototype.constructor = Pipeline;

  Pipeline.prototype.fromObject = function(pipeline) {
    Entity.prototype.fromObject.call(this, pipeline);

    this.repositoryID([]);
    this.dataList = [];

    if (pipeline) {
      if (pipeline.repositoryID) {
        this.repositoryID([pipeline.repositoryID]);
      }
      
      if (pipeline.dataList && pipeline.dataList.length > 0) {
        for (var d=0; d<pipeline.dataList.length; d++) {
          var dataItem = new DataItem();
          dataItem.fromObject(pipeline.dataList[d]);
          this.dataList.push(dataItem);
        }
      }
    }
  };
    
  Pipeline.prototype.toObject = function() {
    var obj = Entity.prototype.toObject.call(this);
    
    if (this.repositoryID().length > 0 && this.repositoryID()[0] !== '0') {
      obj.repositoryID = this.repositoryID()[0];
    }

    if (this.dataList.length > 0) {
      obj.dataList = [];

      for (var d=0; d<this.dataList.length; d++) {
        obj.dataList.push(this.dataList[d].toObject());
      }
    }
    
    return obj;
  };
  
  Pipeline.list = function(showLoading, andThen) {
    Entity.list('/pipelines?sort=name|ASC', showLoading, andThen);
  };

  Pipeline.get = function(id, showLoading, andThen) {
    Entity.get(PIPELINES_PATH + id, showLoading, andThen);
  };

  Pipeline.downloadJS = function(id, andThen) {
    var url = appState.apiUrl + PIPELINES_PATH + id + '/download';

    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      headers: appState.user.oauth.getHeader(),

      success: function(data) {          
        andThen.call(null, data.item, null);
      }
    }).fail(function(jqXhr) {
      Entity.error(jqXhr, andThen);
    });
  };

  Pipeline.start = function(id, data, andThen) {
    var url = appState.apiUrl + PIPELINES_PATH + id + '/start';
    appState.loading(true);

    $.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      headers: appState.user.oauth.getHeader(),

      success: function(result) {
        appState.loading(false);          
        andThen.call(null, result.item, null);
      }
    }).fail(function(jqXhr) {
      appState.loading(false);
      Entity.error(jqXhr, andThen);
    });
  };

  Pipeline.save = function(data, andThen) {
    Entity.save(data, PIPELINES_PATH, andThen);
  };

  Pipeline.remove = function(id, andThen) {
    Entity.remove(PIPELINES_PATH + id, andThen);
  };

  return Pipeline;
}
);
