var SL = SL || {};

/**
* @class Used by the grid map.  Represents a cell on the map.
* @param contents {Entity} An entity to occupy the cell.  Null is an acceptable value.
*/
SL.GridCell = function(contents) {
	this._contents = contents === undefined ? null : contents;
};
/** Get the Entity in this cell (may be null) */
SL.GridCell.prototype.getContents = function () { return this._contents; };
SL.GridCell.prototype.setContents = function (entity) {this._contents = entity;};
SL.GridCell.prototype.isFree = function () {	return this._contents === null;	};


/**
* @class
* Default implementation of an interface.
* Must implement getSL.GridCell(x,y) function.
* Provide one of these so GridMap can layout your map.
*/
SL.DefaultGridCellFactory = function() {};
/** Generate the Grid Cell for the provided coordinates */
SL.DefaultGridCellFactory.prototype.getGridCell = function (x,y) {
  return new SL.GridCell();
};
