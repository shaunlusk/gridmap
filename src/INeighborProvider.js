/** INeighborProvider
* Provides neighbors for a given node.
* (Must iterate over all neighbors, returning null when none are left).
* @interface
*/
INeighborProvider = function() {};
/**
* Retrieves the next available neighbor.
* @function
* @name INeighborProvider#next
* @returns {Node<T>} returns the next neighbor for the current node, or null if none remain.
*/
INeighborProvider.prototype.next = function() { throw new Error('not implemented'); };
