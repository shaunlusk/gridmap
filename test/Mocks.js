import Coordinates from '../src/Coordinates';

export function getMockGridCell() {
  var cell = {
    availableToEntityRetVal : true,
    isFree : function(){return true;},
    setContents : function(contents) {this.contents = contents;},
    getContents : function() {return this.contents;},
    availableToEntity : function(entity) {
      return this.availableToEntityRetVal;
    },
    getLandEffect : function() {
      return 0;
    }
  };
  return cell;
}

export function getMockEntity() {
  var coords = new Coordinates(1,1);
  var entity = {
    coords:coords,
    type:"test",
    getCoords:function() {return this.coords;},
    getType:function() {return this.type;},
    setCoords:function(coords) {this.coords = coords;}
  };
  return entity;
}

