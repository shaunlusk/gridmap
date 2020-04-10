
/**
* Interface for a factory that produces {@link GridCell GridCells}.
* Provide your own {@link IGridCellFactory IGridCellFactory} so {@link GridMap GridMap} can layout your map.
* @interface
* @see {@link DefaultGridCellFactory DefaultGridCellFactory}
*/
export default class IGridCellFactory {
  /**
  * Creates a {@link GridCell GridCell} for the specified x, y location on the map.
  * @param x {int} The x coordinate.
  *	@param y {int} The y coordinate.
  * @returns {GridCell}
  */
  getGridCell = function(x, y) { throw new Error('not implemented'); }
};
