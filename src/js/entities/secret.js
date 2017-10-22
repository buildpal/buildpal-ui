define(['knockout', 'appState', 'entities/entity'],
function(ko, appState, Entity) {
  var SECRETS_PATH = '/secrets/';
            
  function Secret() {
    Entity.call(this, null);
    
    this.username = ko.observable();
    this.password = ko.observable();
  }

  Secret.prototype = Object.create(Entity.prototype);
  Secret.prototype.constructor = Secret;

  Secret.prototype.fromObject = function(secret) {
    Entity.prototype.fromObject.call(this, secret);

    this.username('');
    this.password('');
  };
    
  Secret.prototype.toObject = function() {
    var obj = Entity.prototype.toObject.call(this);
    
    if (this.username()) {
      obj.username = this.username();
    }

    if (this.password()) {
      obj.password = this.password();  
    }
    
    return obj;
  };
  
  Secret.list = function(andThen) {
    Entity.list(SECRETS_PATH, andThen);
  };

  Secret.get = function(id, andThen) {
    Entity.get(SECRETS_PATH + id, andThen);
  };

  Secret.save = function(data, andThen) {
    Entity.save(data, SECRETS_PATH, andThen);
  };

  Secret.remove = function(id, andThen) {
    Entity.remove(SECRETS_PATH + id, andThen);
  };

  return Secret;
});
