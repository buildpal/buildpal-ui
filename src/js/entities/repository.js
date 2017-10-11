define(['knockout', 'entities/entity'],
  function(ko, Entity) {
              
    function Repository() {
      Entity.call(this, Repository.GIT);

      this.secretID = ko.observable([]);

      this.uri = ko.observable();
      this.remote = ko.observable();
      this.branch = ko.observable();
      this.pipelineScanOn = ko.observableArray();
      this.hasPipeline = ko.observableArray();
      this.forceUpdate = ko.observableArray();
      this.quiet = ko.observableArray();
      this.viewMappings = ko.observable();
      this.shelvedList = ko.observable();
      this.children = [];
    }

    Repository.prototype = Object.create(Entity.prototype);
    Repository.prototype.constructor = Repository;

    Repository.prototype.fromObject = function(repo) {
      Entity.prototype.fromObject.call(this, repo);

      this.secretID([]);

      if (repo) {
        if (repo.secretID) {
          this.secretID([repo.secretID]);
        }

        this.uri(repo.uri);
        this.remote(repo.remote);
        this.branch(repo.branch);
        
        this.pipelineScanOn(repo.pipelineScanOn ? ['true'] : []);
        this.hasPipeline(repo.hasPipeline ? ['true'] : []);

        if (repo.type === Repository.P4) {
          this.forceUpdate(repo.forceUpdate ? ['true'] : []);
          this.quiet(repo.quiet ? ['true'] : []);
          this.viewMappings(repo.viewMappings.join(/\n/));

          if (repo.shelvedList) {
            this.shelvedList(repo.shelvedList);
          } else {
            this.shelvedList('');
          }
        }

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
        this.forceUpdate([]);
        this.quiet([]);
        this.viewMappings('');
        this.shelvedList('${data.SHELVED_LIST}');
        this.children = [];
      }
    };

    Repository.prototype.toObject = function() {
      var obj = Entity.prototype.toObject.call(this);

      if (this.secretID().length > 0 && this.secretID()[0] !== '0') {
        obj.secretID = this.secretID()[0];
      }

      obj.uri = this.uri();

      obj.pipelineScanOn = this.pipelineScanOn().length == 1;
      obj.hasPipeline = this.hasPipeline().length == 1;

      if (obj.type === Repository.P4) {
        obj.forceUpdate = this.forceUpdate().length == 1;
        obj.quiet = this.quiet().length == 1;
        obj.viewMappings = this.viewMappings().split(/\n/);

        if (this.shelvedList()) {
          obj.shelvedList = this.shelvedList();
        }
      }

      if (obj.type === Repository.GIT) {
        obj.branch = this.branch();
        obj.remote = this.remote();
      }

      if (obj.type === Repository.MULTI_GIT || obj.type === Repository.MULTI_P4) {
        obj.children = [];
        
        for (var c=0; c<this.children.length; c++) {
          obj.children.push(this.children[c].toObject());
        }
      }

      return obj;
    };

    Repository.list = function(andThen) {
      Entity.list('/repositories?sort=name|ASC', andThen);
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

    Repository.FS = 'FS';
    Repository.GIT = 'GIT';
    Repository.MULTI_GIT = 'MULTI_GIT';
    Repository.MULTI_P4 = 'MULTI_P4';
    Repository.P4 = 'P4';

    return Repository;
  }
);
