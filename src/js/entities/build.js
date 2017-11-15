define(['knockout', 'appState', 'entities/entity', 'moment'],
  function(ko, appState, Entity, moment) {
    var BUILDS_PATH = '/builds/';
    var TIME_FORMAT = 'MM/DD/YY hh:mm A';
              
    function Build() {
      Entity.call(this);

      this.data = null;
      this.pipelineID = null;
      this.status = null;
      this.startTime = null;
      this.endTime = null;
      this.duration = null;
      this.repoName = null;
      this.repoBranch = null;      
    }

    Build.prototype = Object.create(Entity.prototype);
    Build.prototype.constructor = Build;

    Build.prototype.fromObject = function(build) {
      Entity.prototype.fromObject.call(this, build);  
      
      if (build) {
        this.status = build.status;
        this.pipelineID = build.pipelineID;

        this.data = {};
        for (var key in build.data) {
          this.data[key] = build.data[key].value;
        }

        var utcCreatedDate = moment(build.utcCreatedDate);
        var utcEndDate = build.utcEndDate ? moment(build.utcEndDate) : null;

        this.startTime = utcCreatedDate.format(TIME_FORMAT);
        this.endTime = null;
        this.duration = null;

        if (utcEndDate) {
          this.endTime = utcEndDate.format(TIME_FORMAT);
          var duration = utcEndDate.diff(utcCreatedDate, 'minutes');

          if (duration == 0) {
            duration = utcEndDate.diff(utcCreatedDate, 'seconds') + ' second(s)';
          } else {
            duration = duration + (duration < 2 ? ' minute' : ' minutes');
          }

          this.duration = duration;
        }

        this.repoName = build.repository.type;
        this.repoBranch = build.repository.branch || 'N/A';

      } else {
        this.status = null;
        this.pipelineID = null;
        this.data = null;
        this.startTime = null;
        this.endTime = null;
        this.duration = null;
        this.repoName = null;
        this.repoBranch = null;
      }
    };

    Build.prototype.toObject = function() {
      var obj = Entity.prototype.toObject.call(this);
      
      return obj;
    };

    Build.list = function(showLoading, andThen) {
      Entity.list('/builds?sort=utcLastModifiedDate|DESC|instant', showLoading, andThen);
    };

    Build.get = function(id, showLoading, andThen) {
      Entity.get(BUILDS_PATH + id, showLoading, andThen);
    };

    Build.remove = function(id, andThen) {
      Entity.remove(BUILDS_PATH + id, andThen);
    };

    Build.abort = function(id, andThen) {
      var url = appState.apiUrl + BUILDS_PATH + id + '/abort';
      appState.loading(true);

      $.ajax({
        url: url,
        type: 'POST',
        headers: appState.user.oauth.getHeader(),
        dataType: 'json',
        contentType: 'application/json',
        success: function(result) {
          appState.loading(false);          
          andThen.call(null, result.item, null);
        }
      }).fail(function(jqXhr) {
        appState.loading(false);
        Entity.error(jqXhr, andThen);
      });
    };

    Build.logsUrl = function(id, containerID, tail) {
      return appState.apiUrl + '/logs/' + id + '?containerID=' + containerID + '&tail=' + tail;
    };

    Build.logs = function(id, containerID, tail, andThen) {
      var url = Build.logsUrl(id, containerID, tail);

      $.ajax({
        url: url,
        type: 'GET',
        headers: appState.user.oauth.getHeader(),

        success: function(logs) {          
          andThen.call(null, logs, null);
        }
      }).fail(function(jqXhr) {
        Entity.error(jqXhr, andThen);
      });
    };
    
    return Build;
  }
);
