define(['knockout', 'entities/entity'],
  function(ko, Entity) {
              
    function Repository() {
      Entity.call(this, Repository.GIT);

      this.uri = ko.observable();
      this.remote = ko.observable();
      this.branch = ko.observable();
    }

    Repository.prototype = Object.create(Entity.prototype);
    Repository.prototype.constructor = Repository;

    Repository.prototype.fromObject = function(repo) {
      Entity.prototype.fromObject.call(this, repo);

      if (repo) {
        this.uri(repo.uri);
        this.remote(repo.remote);
        this.branch(repo.branch);          

      } else {
        this.uri('');
        this.remote('origin');
        this.branch('master');
      }
    };

    Repository.prototype.toObject = function() {
      var obj = Entity.prototype.toObject.call(this);

      obj.uri = this.uri();

      if (obj.type === Repository.GIT) {
        obj.branch = this.branch();
        obj.remote = this.remote();
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

    return Repository;
  }
);
