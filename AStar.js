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
* @interface
*/
SL.INeighborProvider = function() {};
/**
* @function
* @name INeighborProvider#next
* @returns {Node<T>} returns the next neighbor for the current node (must iterate over all neighbors, returning null when none are left).
*/
SL.INeighborProvider.prototype.next = function() { throw new Error('not implemented'); };

/** INeighborProviderFactory
* gets a neighbor provider, given the current node
* @interface
*/
SL.INeighborProviderFactory = function() {};
/**
* @function
* @name INeighborProviderFactory#getProvider
* @param node {SL.AStarNode} the node to retrieve the neighbor provider for
* @returns {Node<T>} gets a neighbor provider
*/
SL.INeighborProviderFactory.prototype.getProvider = function(node) { throw new Error('not implemented'); };

/** @class Node class for SL.AStar
* @param element {Object} any object; must implement "equals()"
* @param parent {SL.AStarNode<T>} this node's parent node.
* @param g {int} this node's g() cost.
*/
SL.AStarNode = function (element, parent, g) {
	this.element = element;
	this.parent = parent;
	this.f = -1;
	this.g = g;
};
/** Compare this node's f() cost to another node
* @param other {Node<T>} the node to compare against
* @return {int} -1 if this node's f() is < the other's; 0 if they are the same; and 1 if this node's f() > the others.
*/
SL.AStarNode.prototype.compareTo = function(other) {
	if (this.f < other.f) return -1;
	if (this.f === other.f) return 0;
	return 1;
};

/** Check if another node has the same element as this one.
* @param other {Node<T>} the node to compare against
* @return {boolean} true if the two nodes are the same, or have equal elements, false otherwise
*/
SL.AStarNode.prototype.equals = function(other) {
	if (this === other) return true;
  if (!SL.isFunction(this.element.equals)) {
    throw new Error("Elements must implement the \"equals()\" function.");
  }
	if (this.element.equals(other.element)) return true;
	return false;
};

/** Return the toString of the Element; not reliable as a true hash function.
* @return {string}
*/
SL.AStarNode.prototype.hashCode = function() {
	return this.element.toString();
};

SL.AStarNode.prototype.toString = function() {
	return "Element: " + this.element.toString() + "\nf: " + this.f + "\ng: " + this.g + "\n";
};

SL.AStarNode.prototype.getCost = function() {
	return 1;
};


/** @class SL.AStar implementation
* @param start {Node<T>} The starting point
* @param goal {Node<T>} The desired ending point
* @param depthConstraint {int} The maximum path depth to search before giving up. 0 = no limit!
* @param neighborProviderFactory {INeighborProviderFactory<T>}
* @param hProvider {IHeuristicProvider<T>}
*/
SL.AStarPathProvider = function (start, goal, depthConstraint, /*INeighborProviderFactory<T>*/ neighborProviderFactory, /*IHeuristicProvider<T>*/ hProvider) {

	this.open = new SL.PriorityQueue();
	// private HashMap<Node<T>,Node<T>> closed;
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
* @return {Array<SL.AStarNode<T>>} An array containing the best sequence of nodes from the start to the goal, if such a path could be found.
*/
SL.AStarPathProvider.prototype.execute = function() {
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

/*  Get list of the nodes from the origin to the specified node
* @param node {SL.AStarNode} The node
* @return {Array<SL.AStarNode>} The list
*/
SL.AStarPathProvider.prototype._getPath = function(node) {
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
