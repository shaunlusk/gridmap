import GridCell from './GridCell';

/**
* @class
* Default implementation of a {@link IGridCellFactory IGridCellFactory}.
* Creates empty {@link GridCell GridCells} for each point on the map.
* @see {@link IGridCellFactory IGridCellFactory}
*/
export default class DefaultGridCellFactory {
  /** Generate the {@link GridCell GridCell} for the provided coordinates.
  * @param x {int} The x coordinate.
  *	@param y {int} The y coordinate.
  * @returns {GridCell}
  */
  getGridCell = function (x,y) {
    return new GridCell();
  }
};


