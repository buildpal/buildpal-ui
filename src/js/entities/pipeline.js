define(['knockout', 'appState', 'entities/entity'],
function(ko, appState, Entity) {
  var PIPELINES_PATH = '/pipelines/';
            
  function Pipeline() {
    Entity.call(this, null);
    
    this.repositoryID = ko.observable([]);
  }

  Pipeline.prototype = Object.create(Entity.prototype);
  Pipeline.prototype.constructor = Pipeline;

  Pipeline.prototype.fromObject = function(pipeline) {
    Entity.prototype.fromObject.call(this, pipeline);

    if (pipeline && pipeline.repositoryID) {
      this.repositoryID([pipeline.repositoryID]);
      
    } else {      
      this.repositoryID([]);
    }
  };
    
  Pipeline.prototype.toObject = function() {
    var obj = Entity.prototype.toObject.call(this);
    
    if (this.repositoryID().length > 0 && this.repositoryID()[0] !== '0') {
      obj.repositoryID = this.repositoryID()[0];
    }
    
    return obj;
  };
  
  Pipeline.list = function(andThen) {
    Entity.list('/pipelines?sort=name|ASC', andThen);
  };

  Pipeline.get = function(id, andThen) {
    Entity.get(PIPELINES_PATH + id, andThen);
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

  Pipeline.start = function(id, andThen) {
    var url = appState.apiUrl + PIPELINES_PATH + id + '/start';

    $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      headers: appState.user.oauth.getHeader(),

      success: function(result) {          
        andThen.call(null, result.item, null);
      }
    }).fail(function(jqXhr) {
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
