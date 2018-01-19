define(['knockout', 'appState', 'entities/entity'],
function(ko, appState, Entity) {
  var USERS_PATH = '/users/';
            
  function User() {
    Entity.call(this, null);
    

  }

  User.prototype = Object.create(Entity.prototype);
  User.prototype.constructor = User;

  User.prototype.fromObject = function(secret) {
    Entity.prototype.fromObject.call(this, secret);
  };
    
  User.prototype.toObject = function() {
    var obj = Entity.prototype.toObject.call(this);
    return obj;
  };
  
  User.listAffinities = function(showLoading, andThen) {
    Entity.list(USERS_PATH + 'affinity', showLoading, andThen);
  };

  User.removeAffinity = function(id, showLoading, andThen) {
    Entity.remove(USERS_PATH + id + '/affinity', showLoading, andThen);
  };

  User.deleteWorkspaces = function(id, showLoading, andThen) {
    Entity.remove('/workspaces/user/' + id, showLoading, andThen);
  };

  return User;
});
