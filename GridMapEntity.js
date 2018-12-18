var SL = SL || {};

SL.IGridMapEntity = function() {};
SL.IGridMapEntity.prototype.setCoords = function(coords) {throw new Error("Not Implemented.");};
SL.IGridMapEntity.prototype.getCoords = function() {throw new Error("Not Implemented.");};
SL.IGridMapEntity.prototype.getType = function() {throw new Error("Not Implemented.");};
SL.IGridMapEntity.prototype.setType = function(type) {throw new Error("Not Implemented.");};

SL.GridMapEntity = function(props) {
  props = props || {};
  this._coords = props.coords;
  this._type = props.type;
};

SL.GridMapEntity.prototype.setCoords = function(coords) {this._coords = coords;};
SL.GridMapEntity.prototype.getCoords = function() {return this._coords;};
SL.GridMapEntity.prototype.getType = function() {return this._type;};
SL.GridMapEntity.prototype.setType = function(type) {this._type = type;};
