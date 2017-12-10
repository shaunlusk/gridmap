var SL = SL || {};

SL.GridMapEntity = function(props) {
  props = props || {};
  this._coords = props.coords;
  this._type = props.type;
};

SL.GridMapEntity.prototype.setCoords = function(coords) {this._coords = coords;};
SL.GridMapEntity.prototype.getCoords = function() {return this._coords;};
SL.GridMapEntity.prototype.getType = function() {return this._type;};
SL.GridMapEntity.prototype.setType = function(type) {this._type = type;};
