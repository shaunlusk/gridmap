/** INeighborProviderFactory
* Responsible for creating a neighbor provider for a given AStarNode.
* @interface
*/
const INeighborProviderFactory = function() {};
/**
* @function
* @name INeighborProviderFactory#getProvider
* @param node {AStarNode} The node to retrieve the neighbor provider for.
* @returns {Node<T>} gets a neighbor provider
*/
INeighborProviderFactory.prototype.getProvider = function(node) { throw new Error('not implemented'); };

export default INeighborProviderFactory;