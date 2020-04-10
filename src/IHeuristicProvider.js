
/** IHeuristicProvider
* Provides an estimate of the past cost from node to goal.
* @interface
*/
IHeuristicProvider = function() {};
/** h()
* @function
* @name IHeuristicProvider#h
* @param node {AStarNode} source node
*	@param goal {AStarNode} goal node
* @returns {int} Estimate of path cost from goal to node.
*/
IHeuristicProvider.prototype.h = function(node, goal) { throw new Error('not implemented'); };
