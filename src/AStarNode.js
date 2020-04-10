import {Utils} from 'slcommon/src/Utils';

/** @class Node class for {@link AStarPathFinder AStarPathFinder}.
* Acts as a container for arbitrary map nodes or elements.
* Provides parent tracking and cost functionality.
* @param element {Object} Any object; must implement "equals()"
* @param parent {AStarNode} This node's parent node.
* @param g {int} This node's g() cost.
* @see AStarPathFinder
*/
export default class AStarNode {
	constructor(element, parent, g) {
		/** @property element {Object} Any object; must implement "equals()" */
		this.element = element;
		/** @property {AStarNode} This node's parent node. */
		this.parent = parent;
		/** @property f {int} This node's estimated cost. */
		this.f = -1;
		/** @property g {int} This node's g() cost. */
		this.g = g;
	}

	/** Compare this node's f() cost to another node
	* @param other {AStarNode} the node to compare against
	* @return {int} -1 if this node's f() is < the other's; 0 if they are the same; and 1 if this node's f() > the others.
	*/
	compareTo(other) {
		if (this.f < other.f) return -1;
		if (this.f === other.f) return 0;
		return 1;
	}

	/** Check if another node has the same element as this one.
	* @param other {AStarNode} the node to compare against
	* @return {boolean} true if the two nodes are the same, or have equal elements, false otherwise
	*/
	equals(other) {
		if (this === other) return true;
		if (!Utils.isFunction(this.element.equals)) {
			throw new Error("Elements must implement the \"equals()\" function.");
		}
		if (this.element.equals(other.element)) return true;
		return false;
	}

	/** Return the toString of the Element; not reliable as a true hash function.
	* @return {string}
	*/
	hashCode() {
		return this.element.toString();
	}

	/** Return the string representation of this Node, and its element.
	* @return {string}
	*/
	toString() {
		return "Element: " + this.element.toString() + "\nf: " + this.f + "\ng: " + this.g + "\n";
	}

	/** Return the path cost of this Node.
	* If you need path costs that vary by Node, override this method.
	* @return {number}
	*/
	getCost() {
		return 1;
	}
}