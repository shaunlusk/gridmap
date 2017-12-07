var SL = SL || {};

/**
* @class Used by the {@link SL.GridMap GridMap}.  Represents a cell on the map.
* @param contents {SL.GridMapEntity} An entity to occupy the cell.  Null is an acceptable value.
*/
SL.GridCell = function(contents) {
	this._contents = contents === undefined ? null : contents;
};

/** Get the Entity in this cell or null if none.
* @return {SL.GridMapEntity} The entity in this cell or null.
*/
SL.GridCell.prototype.getContents = function () { return this._contents; };

/** Set the Entity in this cell.  Will overwrite existing contents.
* @param {SL.GridMapEntity} entity The entityto put in this cell.
*/
SL.GridCell.prototype.setContents = function (entity) {this._contents = entity;};

/** Return whether there is an entity in this cell.
* @return {boolean} True if contents is null, false otherwise.
*/
SL.GridCell.prototype.isFree = function () {	return this._contents === null;	};


/** @interface
*
*/
SL.IGridCellFactory = function() {};
/**
* @param x {int}
*	@param y {int}
* @returns {SL.GridCell}
*/
SL.IGridCellFactory.prototype.getGridCell = function(x, y) { throw new Error('not implemented'); };

/**
* @class
* Default implementation of an interface.
* Must implement getGridCell(x,y) function.
* Provide one of these so GridMap can layout your map.
*/
SL.DefaultGridCellFactory = function() {};

/** Generate the {@link SL.GridCell GridCell} for the provided coordinates
*
*/
SL.DefaultGridCellFactory.prototype.getGridCell = function (x,y) {
  return new SL.GridCell();
};
