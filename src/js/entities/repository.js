define(['knockout', 'entities/entity'],
  function(ko, Entity) {
              
    function Repository() {
      Entity.call(this, Repository.GIT);

      this.uri = ko.observable();
      this.remote = ko.observable();
      this.branch = ko.observable();
      this.pipelineScanOn = ko.observableArray();
      this.hasPipeline = ko.observableArray();
      this.children = [];
    }

    Repository.prototype = Object.create(Entity.prototype);
    Repository.prototype.constructor = Repository;

    Repository.prototype.fromObject = function(repo) {
      Entity.prototype.fromObject.call(this, repo);

      if (repo) {
        this.uri(repo.uri);
        this.remote(repo.remote);
        this.branch(repo.branch);
        
        this.pipelineScanOn(repo.pipelineScanOn ? ['true'] : []);
        this.hasPipeline(repo.hasPipeline ? ['true'] : []);

        this.children = [];        
        if (repo.children && repo.children.length > 0) {
          for (var c=0; c<repo.children.length; c++) {
            var childRepo = new Repository();
            childRepo.fromObject(repo.children[c]);
            this.children.push(childRepo);
          }
        }

      } else {
        this.uri('');
        this.remote('origin');
        this.branch('master');
        this.pipelineScanOn(['true']);
        this.hasPipeline([]);
        this.children = [];
      }
    };

    Repository.prototype.toObject = function() {
      var obj = Entity.prototype.toObject.call(this);

      obj.uri = this.uri();

      obj.pipelineScanOn = this.pipelineScanOn().length == 1;
      obj.hasPipeline = this.hasPipeline().length == 1;

      if (obj.type === Repository.GIT) {
        obj.branch = this.branch();
        obj.remote = this.remote();
      }

      if (obj.type === Repository.MULTI_GIT) {
        obj.children = [];
        
        for (var c=0; c<this.children.length; c++) {
          obj.children.push(this.children[c].toObject());
        }
      }

      return obj;
    };

    Repository.list = function(andThen) {
      Entity.list('/repositories', andThen);
    };

    Repository.get = function(id, andThen) {
      Entity.get('/repositories/' + id, andThen);
    };

    Repository.save = function(data, andThen) {
      Entity.save(data, '/repositories/', andThen);
    };

    Repository.remove = function(id, andThen) {
      Entity.remove('/repositories/' + id, andThen);
    };

    Repository.GIT = 'GIT';
    Repository.MULTI_GIT = 'MULTI_GIT';

    return Repository;
  }
);
