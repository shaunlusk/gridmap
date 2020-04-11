import GridMapNeighborProvider from './GridMapNeighborProvider';
/** @class Factory to instantiate GridMapNeighborProvider
* @param map {GridMap} the grid map to use to create the neighbor provider
*
*/
export default class GridMapNeighborProviderFactory{
  constructor(map) {
    this._map = map;
  }

  /** Get a neighbor provider for the specified node
  * @param node {AStarNode} the node to get the neighbor provider for
  * @return {INeighborProvider} a grid map neighbor provider.
  */
  getProvider(node) {
    return new GridMapNeighborProvider(node,this._map);
  }

}
