import PriorityQueue from 'slcommon/src/PriorityQueue';

/** @class Implementation of A* path finding algorithm.
* <p>The algorithm will find an optimal path between a starting node and a goal
* node, if one exists.</p>
* <p>
* If a path is found, a sequence of {@link AStarNode AStarNodes} will be returned representing the path
* from the start node to the goal node.
* </p>
* <p>You must provide a {@link INeighborProviderFactory INeighborProviderFactory} that creates
* {@link INeighborProvider INeighborProviders} for each examined AStarNode.  You must also provide an
* {@link IHeuristicProvider IHeuristicProvider} that gives heuristic cost estimates of distance between {@link AStarNode AStarNodes}.</p>
* @param start {AStarNode} An AStarNode that contains the starting point
* @param goal {AStarNode} An AStarNode that contains the goal point
* @param depthConstraint {int} The maximum path depth to search before giving up. 0 = no limit!
* @param neighborProviderFactory {INeighborProviderFactory} INeighborProviderFactory creates an INeighborProvider;
* INeighborProvider provides the neighbors for a given point.
* @param hProvider {IHeuristicProvider} Exposes a method that provides a heuristic estimate of distance between a given node and the goal.
*/
export default class AStarPathFinder {
	constructor(start, goal, depthConstraint, /*INeighborProviderFactory<T>*/ neighborProviderFactory, /*IHeuristicProvider<T>*/ hProvider) {
		this.open = new PriorityQueue();
		this.closed = {};
		this.goal = goal;
		this.best = start;
		this.depthConstraint = depthConstraint;
		this.neighborProviderFactory = neighborProviderFactory;
		this.hProvider = hProvider;

		this.open.push(this.best);
	}

	/** Do the path finding.
	* If a complete path cannot be found, it will return only the starting node.  If the depth constraint is hit, the best partial path is returned.
	* @return {Array<AStarNode>} An array containing the best sequence of nodes from the start to the goal, if such a path could be found.
	*/
	execute = function() {
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
	}

	/** @private */
	/* Get list of the nodes from the origin to the specified node
	* @param node {AStarNode} The node
	* @return {Array<AStarNode>} The list
	*/
	_getPath = function(node) {
		var reversePath = [], path = [];
		var n = node;
		do {
			reversePath.push(n);
		} while ((n = n.parent) !== null);

		for(var i = reversePath.length - 1; i > -1; i-- ) {
			path.push( reversePath[i] );
		}
		return path;
	}
}
