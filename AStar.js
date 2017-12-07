var SL = SL || {};

/** IHeuristicProvider
* Provides an estimate of the past cost from node to goal.
* @interface
*/
SL.IHeuristicProvider = function() {};
/** h()
* @function
* @name IHeuristicProvider#h
* @param node {SL.AStarNode} source node
*	@param goal {SL.AStarNode} goal node
* @returns {int} Estimate of path cost from goal to node.
*/
SL.IHeuristicProvider.prototype.h = function(node, goal) { throw new Error('not implemented'); };

/** INeighborProvider
* Provides neighbors for a given node.
* (Must iterate over all neighbors, returning null when none are left).
* @interface
*/
SL.INeighborProvider = function() {};
/**
* Retrieves the next available neighbor.
* @function
* @name INeighborProvider#next
* @returns {Node<T>} returns the next neighbor for the current node, or null if none remain.
*/
SL.INeighborProvider.prototype.next = function() { throw new Error('not implemented'); };

/** INeighborProviderFactory
* Responsible for creating a neighbor provider for a given AStarNode.
* @interface
*/
SL.INeighborProviderFactory = function() {};
/**
* @function
* @name INeighborProviderFactory#getProvider
* @param node {SL.AStarNode} The node to retrieve the neighbor provider for.
* @returns {Node<T>} gets a neighbor provider
*/
SL.INeighborProviderFactory.prototype.getProvider = function(node) { throw new Error('not implemented'); };

/** @class Implementation of A* path finding algorithm.
* <p>The algorithm will find an optimal path between a starting node and a goal
* node, if one exists.</p>
* <p>
* If a path is found, a sequence of {@link SL.AStarNode AStarNodes} will be returned representing the path
* from the start node to the goal node.
* </p>
* <p>You must provide a {@link SL.INeighborProviderFactory INeighborProviderFactory} that creates
* {@link SL.INeighborProvider INeighborProviders} for each examined AStarNode.  You must also provide an
* {@link SL.IHeuristicProvider IHeuristicProvider} that gives heuristic cost estimates of distance between {@link SL.AStarNode AStarNodes}.</p>
* @param start {SL.AStarNode} An AStarNode that contains the starting point
* @param goal {SL.AStarNode} An AStarNode that contains the goal point
* @param depthConstraint {int} The maximum path depth to search before giving up. 0 = no limit!
* @param neighborProviderFactory {SL.INeighborProviderFactory} INeighborProviderFactory creates an INeighborProvider;
* INeighborProvider provides the neighbors for a given point.
* @param hProvider {SL.IHeuristicProvider} Exposes a method that provides a heuristic estimate of distance between a given node and the goal.
*/
SL.AStarPathFinder = function (start, goal, depthConstraint, /*INeighborProviderFactory<T>*/ neighborProviderFactory, /*IHeuristicProvider<T>*/ hProvider) {
	this.open = new SL.PriorityQueue();
	this.closed = {};
	this.goal = goal;
	this.best = start;
	this.depthConstraint = depthConstraint;
	this.neighborProviderFactory = neighborProviderFactory;
	this.hProvider = hProvider;

	this.open.push(this.best);
};

/** Do the path finding.
* If a complete path cannot be found, it will return only the starting node.  If the depth constraint is hit, the best partial path is returned.
* @return {Array<SL.AStarNode>} An array containing the best sequence of nodes from the start to the goal, if such a path could be found.
*/
SL.AStarPathFinder.prototype.execute = function() {
	var current;
	this.best.f = this.hProvider.h(this.best, this.goal);

	while ((current = this.open.poll()) !== null) {
		if (current.equals(this.goal))
			return this._getPath(current);
		this.closed[current.hashCode()] = current;

		if (current.f-current.g < this.best.f-this.best.g) this.best = current;
		//Constrain search
		if (this.depthConstraint > 0 && current.g >= this.depthConstraint) {
			continue;
		}

		var np = this.neighborProviderFactory.getProvider(current); //INeighborProvider<T>
		var neighbor;
		while ((neighbor = np.next()) !== null){
			var cost = current.g + neighbor.getCost();
			neighbor.g = cost;
			var neighbor2;
			if (this.open.contains(neighbor)) {
				if (neighbor.g < (neighbor2 = this.open.getByEquality(neighbor)).g) {
					this.open.remove(neighbor2);
					neighbor.f = neighbor.g + this.hProvider.h(neighbor, this.goal);
					this.open.push(neighbor);
				}
				// it's in open, and this one is not better, do nothing.
			} else if (neighbor.hashCode() in this.closed) {
				if (neighbor.g < (neighbor2 = this.closed[neighbor.hashCode()]).g) {
					delete this.closed[neighbor2.hashCode()];
					neighbor.f = neighbor.g + this.hProvider.h(neighbor, this.goal);
					this.open.push(neighbor);
				}
				// it's in closed and this one is not better, do nothing.
			} else {
				// It was in neither, add it.
				neighbor.f = neighbor.g + this.hProvider.h(neighbor, this.goal);
				this.open.push(neighbor);
			}
		}
	}

	return this.best === null ? null : this._getPath(this.best);
};

/** @private */
/* Get list of the nodes from the origin to the specified node
* @param node {SL.AStarNode} The node
* @return {Array<SL.AStarNode>} The list
*/
SL.AStarPathFinder.prototype._getPath = function(node) {
	var reversePath = [], path = [];
	var n = node;
	do {
		reversePath.push(n);
	} while ((n = n.parent) !== null);

	for(var i = reversePath.length - 1; i > -1; i-- ) {
		path.push( reversePath[i] );
	}
	return path;
};
