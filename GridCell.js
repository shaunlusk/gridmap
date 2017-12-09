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
* @param entity {SL.GridMapEntity} The entity to put in this cell.
*/
SL.GridCell.prototype.setContents = function (entity) {this._contents = entity;};

/** Return whether there is an entity in this cell.
* @return {boolean} True if contents is null, false otherwise.
*/
SL.GridCell.prototype.isFree = function () {	return this._contents === null;	};


/**
* Interface for a factory that produces {@link SL.GridCell GridCells}.
* Provide your own {@link SL.IGridCellFactory IGridCellFactory} so {@link SL.GridMap GridMap} can layout your map.
* @interface
* @see {@link SL.DefaultGridCellFactory DefaultGridCellFactory}
*/
SL.IGridCellFactory = function() {};
/**
* Creates a {@link SL.GridCell GridCell} for the specified x, y location on the map.
* @param x {int} The x coordinate.
*	@param y {int} The y coordinate.
* @returns {SL.GridCell}
*/
SL.IGridCellFactory.prototype.getGridCell = function(x, y) { throw new Error('not implemented'); };

/**
* @class
* Default implementation of a {@link SL.IGridCellFactory IGridCellFactory}.
* Creates empty {@link SL.GridCell GridCells} for each point on the map.
* @see {@link SL.IGridCellFactory IGridCellFactory}
*/
SL.DefaultGridCellFactory = function() {};

/** Generate the {@link SL.GridCell GridCell} for the provided coordinates.
* @param x {int} The x coordinate.
*	@param y {int} The y coordinate.
* @returns {SL.GridCell}
*/
SL.DefaultGridCellFactory.prototype.getGridCell = function (x,y) {
  return new SL.GridCell();
};
