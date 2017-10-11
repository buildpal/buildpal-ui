define(['knockout', 'entities/entity'],
  function(ko, Entity) {
              
    function DataItem() {
      Entity.call(this, DataItem.STRING);

      this.defaultValue = ko.observable();      
    }

    DataItem.prototype = Object.create(Entity.prototype);
    DataItem.prototype.constructor = DataItem;

    DataItem.prototype.fromObject = function(dataItem) {
      Entity.prototype.fromObject.call(this, dataItem); 

      if (dataItem) {
        this.defaultValue(dataItem.defaultValue);        

      } else {
        this.defaultValue('');
      }
    };

    DataItem.prototype.toObject = function() {
      var obj = Entity.prototype.toObject.call(this);

      if (this.defaultValue()) {
        obj.defaultValue = this.defaultValue();
      }

      return obj;
    };

    DataItem.STRING = 'STRING';

    return DataItem;
  }
);
