define(['knockout', 'entities/entity', 'moment'],
  function(ko, Entity, moment) {
    var BUILDS_PATH = '/builds/';
    var TIME_FORMAT = 'MM/DD/YY hh:mm A';
              
    function Build() {
      Entity.call(this);

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

        var utcCreatedDate = moment(build.utcCreatedDate);
        var utcEndDate = build.utcEndDate ? moment(build.utcEndDate) : null;

        this.startTime = utcCreatedDate.format(TIME_FORMAT);

        if (utcEndDate) {
          this.endTime = utcEndDate.format(TIME_FORMAT);
          this.duration = utcEndDate.diff(utcCreatedDate, 'minutes');

          if (this.duration == 0) {
            this.duration = utcEndDate.diff(utcCreatedDate, 'seconds') + ' seconds';
          } else {
            this.duration = this.duration + ' minutes';
          }

        } else {
          this.endTime = null;
          this.duration = null;
        }

        this.repoName = build.repository.type;
        this.repoBranch = build.repository.branch || 'N/A';

      } else {
        this.status = null;
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

    Build.list = function(andThen) {
      Entity.list(BUILDS_PATH, andThen);
    };

    Build.get = function(id, andThen) {
      Entity.get(BUILDS_PATH + id, andThen);
    };
    
    return Build;
  }
);
