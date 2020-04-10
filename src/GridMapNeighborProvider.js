import AstarNode from './AStarNode';
import GridMap from './GridMap';
import Direction from './Direction';

/** @class Provides neighbors for a given parent node for a given map.
* Returns AStarNodes for coordinates neighboring the parent node's coordinates.
* If allowDiagonalMovement on the provided map is false, then only coordinates primary
* cardinal directions are returned (N,E,S,W).
* Will not return neighbors for coordinates that are out of bounds or not free.
* @param parent {AStarNode} the node to get neighbors for.
* @param map {GridMap} the map
*/
export default class GridMapNeighborProvider {
  constructor(parent, map) {
    this._parent = parent;
    this._coords = parent.element;
    this._i = 0;
    this._map = map;
  }

  /** Retrieve the next neighbor.
  * @override .
  * @return {AStarNode} a node containing the coordinates for a neighboring map cell; null if none remain.
  */
  next() {
    var neighborCoords;
    do {
      if (!this._map.allowDiagonalMovement && this._i%2 === 1) this._i++;
      if (this._i >= 8) return null;
      var dir = Direction.values[this._i];
      neighborCoords = GridMap.directionToCoordinates(dir, this._coords);
      this._i++;
    } while (!this._map.isFree(neighborCoords));
    return new AStarNode(neighborCoords, this._parent, 0);
  }
}