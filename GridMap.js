/** @namespace */
var SL = SL || {};

/**
* @class For representing a 2d map as a grid of cells.
*/
SL.GridMap = function(width, height) {
  /** The horizontal count of cells of the map */
  this.width = width;
  /** The vertical count of cells of the map */
  this.height = height;
  /** The Maps internal array of gridCells */
  this.cells = [];

  /** whether diagonal movement is permitted on this map. */
  this.allowDiagonalMovement = false;

  /** How distance is calculating for AStar: "euclidean", "manhattan","specialmanhattan" */
  this.distanceMetricForPathFinding = "manhattan";

  /** The maximum step depth for AStar path finding; when this depth is exceeded, astar will quit and return an incomplete path. 0 = no limit */
  this.aStarDepthConstraint = 0;

  this.maxDistance = SL.GridMap.calculateDistance(new SL.Coordinates(0,0), new SL.Coordinates(width-1,height-1));
  this.manhattanMaxDistance = SL.GridMap.calculateManhattanDistance(new SL.Coordinates(0,0), new SL.Coordinates(width-1,height-1));
  this.specialManhattanMaxDistance = SL.GridMap.calculateSpecialManhattanDistance(new SL.Coordinates(0,0), new SL.Coordinates(width-1,height-1));

  this._gridMapNeighborProviderFactory = null;
};
SL.GridMap.prototype.initialize = function(gridCellFactory) {
  this._createAstarNeighborProviderFactory();
  this._initializeMapCells(gridCellFactory);
};

SL.GridMap.prototype._createAstarNeighborProviderFactory = function() {
  this._gridMapNeighborProviderFactory = new SL.GridMapNeighborProviderFactory(this);
};

SL.GridMap.prototype._initializeMapCells = function (gridCellFactory) {
  var row;
  for (var y = 0; y < this.height; y++) {
    row = [];
    this.cells.push(row);
    for (var x = 0; x < this.width; x++) {
      this.cells[y].push( gridCellFactory.getGridCell(x, y) );
    }
  }
};

SL.GridMap.prototype.normalizeDistance = function (distance) {return distance / this.maxDistance;};
SL.GridMap.prototype.normalizeManhattanDistance = function (distance) {return distance / this.manhattanMaxDistance;};
SL.GridMap.prototype.normalizeSpecialManhattanDistance = function (distance) {return distance / this.specialManhattanMaxDistance;};

/** Removes an entity from the map.  Does not destroy the entity.
* @param entity {Entity} the entity to be removed.
*/
SL.GridMap.prototype.removeEntity = function (entity) {
  // Break the link
  var gridCell = this.get(entity.getCoords());
  gridCell.setContents(null);
};

/** Checks if the cell at the provided coordinates is inbounds and freee free.
* @param coords {Coordinates} the coordinates to check.
* @return {boolean} True if the coordinates are in map bunds and not occupied; false otherwise.
*/
SL.GridMap.prototype.isFree = function (coords) {
  return this.isFreeXY(coords.x,coords.y);
};

/** Checks if the cell at the provided x and y values is inbounds and freee free.
* @param x {int} the x coordinate to check.
* @param y {int} the y coordinate to check.
* @return {boolean} True if the coordinates are in map bunds and not occupied; false otherwise.
*/
SL.GridMap.prototype.isFreeXY = function (x,y) {
  if (this.isInBoundsXY(x, y) && this.cells[y][x].isFree())
    return true;
  return false;
};

/** Checks if the specified coordinates are in the bounds of the map.
* @param coords {Coordinates} the coordinates to check
* @return {boolean} true if the coords are in bounds, false otherwise.
*/
SL.GridMap.prototype.isInBounds = function (coords) {
  if (coords.x >= 0 && coords.x < this.width && coords.y >=0 && coords.y < this.height) return true;
  return false;
};

/** Checks if the specified x y values are in the bounds of the map.
* @param x {int} the x coordinate to check
* @param y {int} the y coordinate to check
* @return {boolean} true if the coords are in bounds, false otherwise.
*/
SL.GridMap.prototype.isInBoundsXY = function (x, y) {
  if (x >= 0 && x < this.width && y >=0 && y < this.height) return true;
  return false;
};

/** Retrieve the gridCell at the specified coordinates.  Does not perform bounds checking.
* @param coords {Coordinates} the coordinates for the desired cell.
* @return {gridCell} the grid cell
*/
SL.GridMap.prototype.get = function (coords) {
  return this.cells[coords.y][coords.x];
};

/** Retrieve the gridCell at the specified coordinates.  Does not perform bounds checking.
* @param x {int} the x coordinate for the desired cell.
* @param y {int} the y coordinate for the desired cell.
* @return {gridCell} the grid cell
*/
SL.GridMap.prototype.getXY = function (x,y) {
  return this.cells[y][x];
};

/** Moves the entity from its current location to the specified loation.
* @param entity {Entity} the entity to move
* @param coords {Coordinates} the target coordinates.
*/
SL.GridMap.prototype.moveEntityTo = function (entity, coords) {
  if (!this.isFree(coords)) {
    throw new Error("SL.GridMap: entity sought Coordinates " + coords.x + ", " + coords.y + " but that gridCell is not available.");
  }
  var gridCell = this.get(entity.getCoords());
  gridCell.setContents(null);
  gridCell = this.get(coords);
  gridCell.setContents(entity);
  entity.setCoords(coords);
};

/**
* Returns an array of available SL.Directions for a given set of coords.
* (that is, the directions of free spaces around a point)
* @param coords {Coordinates} coordinates
* @returns {Array} list of directions
*/
SL.GridMap.prototype.findAvailableDirectionsForCoordinates = function (coords) {
  var list = [];
  for (var i = 0; i < SL.Direction.values.length; i++) {
    if (this.isFree(SL.GridMap.directionToCoordinates(Direction.values[i], coords))) list.push(Direction.values[i]);
  }
  return list;
};

/**
* Build a list of entities that occur around (but not including) a point.
* @param c {Coordinates} coordinates
* @returns {Array} list of entities
*/
SL.GridMap.prototype.buildListOfAdjacentEntities = function(c) {
  var list = [];
  var adjacent;
  var entity;
  for (var i = 0; i < SL.Direction.values.length; i++) {
    adjacent = SL.GridMap.directionToCoordinates(Direction.values[i], c);
    if (this.isInBounds(adjacent)) {
      entity = this.get(adjacent).getContents();
      if (null !== entity) list.push(entity);
    }
  }
  return list;
};

/**
* Build a list of entities of a given type that occur around (but not including) a point.
* @param c {Coordinates} coordinates
* @param type {String} String identifier for the entity.  Must match entity.getType() for the entity to be included.
* @returns {Array} list of directions
*/
SL.GridMap.prototype.buildListOfSpecificAdjacentEntities = function(c, type) {
  var list = [];
  var adjacent;
  var entity;
  for (var i = 0; i < SL.Direction.values.length; i++) {
    adjacent = SL.GridMap.directionToCoordinates(Direction.values[i], c);
    if (this.isInBounds(adjacent)) {
      entity = this.get(adjacent).getContents();
      if (null !== entity && entity.getType() === type) list.push(entity);
    }
  }
  return list;
};

/**
 * Retrieve a list of entities that appear on the map within a specified rectangle.
 * @param topLeft {Coordinates} The top left coordinates of the rectangle, inclusive.
 * @param bottomRight {Coordinates} The bottom right coordinate of the rectangle, inclusive.
 * @param type {String} String identifier for the entity.  Must match entity.getType() for the entity to be included. null/undefined= match all!
 * @return {Array} list of entities
 */
SL.GridMap.prototype.getListOfEntitiesInRange = function(topLeft, bottomRight, type) {
	var entity = null;
	var list = [];
	for (var y = topLeft.y; y <= bottomRight.y; y++) {
		for (var x = topLeft.x; x <= bottomRight.x; x++) {
			entity = this.getXY(x, y).getContents();
			if (null !== entity) {
        if (type === undefined || type === null || entity.getType() === type) {
           list.push(entity);
        }
			}
		}
	}

	return list;
};

/**
* Get a set of random coordinates from the map.
* @return {Coordinates} a set of coordinates
*/
SL.GridMap.prototype.generateRandomCoordinates = function() {
	var x = Math.floor(Math.random() * this.width);
	var y = Math.floor(Math.random() * this.height);
	return new SL.Coordinates(x, y);
};

/**
* Generate a random set of coordinates for a free space on the map.
* NOTE: if there are no free spaces on the map, this function will never return!
* @return {Coordinates} a Coordinates
*/
SL.GridMap.prototype.generateRandomFreeCoordinates = function() {
  var c;

  do {
    c = this.generateRandomCoordinates();
  } while (!this.isFree(c));
  return c;
};

/**
* Get a set of random coordinates from a list of coordinates.
* If coordssArray is empty this will blow up.
* If none of the coords are empty, this will never return!
* @param coordsArray {Array} The list of coords you want to choose from.
* @return {Coordinates} The selected coords
*/
SL.GridMap.prototype.getRandomFreeCoordinatesFromList = function (coordsArray) {
  var p;

  do {
    p = coordsArray[Math.floor(Math.random() * coordsArray.length)];
  } while (!this.isFree(p));

  return p;
};

/**
* Generate random coordinates in a specified rectangular range (inclusive) on the map.
* @param topLeft {Coordinates} the top left corner of the range
* @param bottomRight {Coordinates} the bottom right corner of the range
* @return {Coordinates} a set of coordinates
*/
SL.GridMap.prototype.generateRandomCoordinatesInRange = function(topLeft, bottomRight) {
	var x = Math.floor(Math.random() * (bottomRight.x - topLeft.x + 1)) + topLeft.x;
	var y = Math.floor(Math.random() * (bottomRight.y - topLeft.y + 1)) + topLeft.y;
	return new SL.Coordinates(x, y);
};

/**
* Generate random coordinates for a free cell in a specified rectangular range (inclusive) on the map.
* If no free spaces exist, this method will never return!
* @param topLeft {Coordinates} the top left corner of the range
* @param bottomRight {Coordinates} the bottom right corner of the range
* @return {Coordinates} a set of coordinates
*/
SL.GridMap.prototype.generateRandomFreeCoordinatesInRange = function(topLeft, bottomRight) {
  var c;

  do {
    c = this.generateRandomCoordinatesInRange(topLeft, bottomRight);
  } while (!this.isFree(c));
  return c;
};

SL.GridMap.prototype.getCoordinatesInRange = function(origin, range, includeOrigin) {
  var list = [];
  var hash = {};
  if (includeOrigin) hash[origin.toString()] = origin;
  this._getCoordinatesInRange(origin,range,hash);
  var keys = Object.keys(hash);
  for (var i = 0; i < keys.length; i++) {
    if (hash[keys[i]].equals(origin) && !includeOrigin) continue;
    list.push( hash[keys[i]] );
  }

  return list;
};
SL.GridMap.prototype._getCoordinatesInRange = function(origin,range,hash) {
  var c = null;
  if (range === 0) return;
  for (var d = 0; d < SL.Direction.values.length; d++) {
    if (!this.allowDiagonalMovement && SL.Direction.isDiagonal(Direction.values[d])) continue;
    c = new SL.Coordinates( origin.x + SL.Direction.offsets[d].x, origin.y + SL.Direction.offsets[d].y );
    if (!this.isInBounds(c)) continue;
    hash[c.toString()] = c;
    this._getCoordinatesInRange(c,range - 1,hash);
  }
};


/**
* Given a set of coordinates, finds the adjacent coords for the given direction.
* @static
* @param direction {String} a direction, based on values in SL.Direction.
* @param currentCoords {Coordinates} the target coordinates
* @return {Coordinates} the coords
*/
SL.GridMap.directionToCoordinates = function(direction,currentCoords) {
  var x = currentCoords.x;
  var y = currentCoords.y;
  switch (direction) {
  case SL.Direction.NORTH:
    y -= 1;
    break;
  case SL.Direction.NORTHEAST:
    y -= 1;
    x += 1;
    break;
  case SL.Direction.EAST:
    x += 1;
    break;
  case SL.Direction.SOUTHEAST:
    y += 1;
    x += 1;
    break;
  case SL.Direction.SOUTH:
    y += 1;
    break;
  case SL.Direction.SOUTHWEST:
    y += 1;
    x -= 1;
    break;
  case SL.Direction.WEST:
    x -= 1;
    break;
  case SL.Direction.NORTHWEST:
    y -= 1;
    x -= 1;
    break;
  }
  return new SL.Coordinates(x, y);
};

/** Calculate the euclidean distance between two sets of coordinates.
* @param c1 {Coordinates} coords 1
* @param c2 {Coordinates} coords 2
* @return {float} the distance
*/
SL.GridMap.calculateDistance = function(c1, c2) {
	return Math.sqrt( Math.pow(c1.x-c2.x, 2) + Math.pow(c1.y-c2.y, 2));
};

/** Calculate the Manhattan distance between two sets of coordinates.
* @param c1 {Coordinates} coords 1
* @param c2 {Coordinates} coords 2
* @return {int} the distance
*/
SL.GridMap.calculateManhattanDistance = function(c1,c2) {
	return Math.abs(c2.x-c1.x) + Math.abs(c2.y-c1.y);
};

/**
 * Special Manhattan distance: the manhattan distance if you are
 * allowed to move diagonally.
 * @static
 * @param c1 {Coordinates} First set of Coordinates.
 * @param c2 {Coordinates} Second set of Coordinates.
 * @return {int} The Special Manhattan distance between the two sets of Coordinates.
 */
SL.GridMap.calculateSpecialManhattanDistance = function(c1, c2) {
	var xdist = Math.abs(c1.x-c2.x);
	var ydist = Math.abs(c1.y-c2.y);
	return xdist > ydist ? xdist : ydist;
};

/**
 * Returns directions adjacent to and including the direction argument.
 * I.e., if you supply north, you get NW, N, NE.
 * @param direction {String} The direction.
 * @return {Array} A list of adjacent directions including the direction provided.
 */
SL.GridMap.getSimilarDirections = function(direction) {
	var list = [];
	list.push(direction);
	list.push(Direction.values[(Direction.ordinal(direction)+1)%8]);
	list.push(Direction.values[(Direction.ordinal(direction)+7)%8]);
	return list;
};

/**
 * Returns directions adjacent to and including the direction argument that are free.
 * I.e., if you supply north, you get NW, N, NE.
 * @param coords {Coordinates} target coords
 * @param direction {String} The direction code.
 * @return {Array} A list of adjacent directions including the direction provided.
 */
SL.GridMap.prototype.getSimilarAvailableDirections = function(coords, direction) {
	var list = SL.GridMap.getSimilarDirections(direction);
	var ilist = [];
	var c;

  for (var i = 0; i < list.length; i++) {
    c = SL.GridMap.directionToCoordinates(list[i], coords);
    if (this.isFree(c)) ilist.push(list[i]);
  }
	return ilist;
};

/** Get the directions around a set of coordinates that are free.
* @param coords {Coordinates} the coordinates
* @return {Array} array of coordinates
*/
SL.GridMap.prototype.getAvailableDirections = function(coords) {
	var list = [];
	for (var i = 0; i < SL.Direction.values.length; i++) {
		if (this.isFree(SL.GridMap.directionToCoordinates(Direction.values[i], coords))) list.push(Direction.values[i]);
	}

	return list;
};

/** Get coordinates adjacent to the specified coordinates that are free.
* @param coords {Coordinates} target coords
* @return {Array} array of Coordinates
*/
SL.GridMap.prototype.findAdjacentFreeCoordinates = function(coords) {
	var list = [];
  for (var i = 0; i < SL.Direction.values.length; i++) {
		if (this.isFree(SL.GridMap.directionToCoordinates(Direction.values[i], coords))) list.push(SL.GridMap.directionToCoordinates(Direction.values[i], coords));
	}
	return list;
};

/** Calculate the direction between source and target coordinates
* @param srcCoords {Coordinates} source coords
* @param tgtCoords {Coordinates} target coords
* @return {String} string representing the direction code
*/
SL.GridMap.coordinatesToDirection = function(srcCoords, tgtCoords) {
	var d = null;

	var dx = tgtCoords.x - srcCoords.x;
	var dy = tgtCoords.y - srcCoords.y;
  var degrees = Math.atan2(dy, dx) * 180 / Math.PI;
	var bearing = degrees + 360;
	var boc = bearing / 360 * 8;
	var dir = (Math.floor(boc) + 2) % 8;

	return SL.Direction.values[dir];
};

/** Calculate the direction between source and target coordinates
* @param srcCoords {Coordinates} source coords
* @param tgtCoords {Coordinates} target coords
* @return {float} radians representing the angle from source to target
*/
SL.GridMap.coordinatesToDirectionInRadians = function(srcCoords, tgtCoords) {
	var dx = tgtCoords.x - srcCoords.x;
	var dy = tgtCoords.y - srcCoords.y;
  var rads = Math.atan2(dy, dx);

	return rads;
};

/**
 * Checks if a straight line exists between this entity and the target.  Ensure target is not null.
 * @param one {Entity} first entity
 * @param other {Entity} other entity
 * @return {boolean} if entities have line of sight
 */
SL.GridMap.prototype.entitiesHaveLineOfSight = function(one, other) {
	var current = one.getCoords();
	var end = other.getCoords();

	var d = SL.GridMap.coordinatesToDirection(current, end);
	current = SL.GridMap.directionToCoordinates(d, current);

	while (current !== other.getCoords() && this.isFree(current)) {
		d = SL.GridMap.coordinatesToDirection(current, end);
		current = SL.GridMap.directionToCoordinates(d, current);
	}

	if (current.equals(other.getCoords())) return true;
	return false;
};

/** Finds the shortest path between the start coords and the goal coords, if one exists.
* @param start {Coordinates} the coordinates to start searching from.
* @param goal {Coordinates} the coordiantes to find a path to
* @return {Array<Coordinates>} A list of coordinates, from start to goal inclusive; null if no path was found.
*/
SL.GridMap.prototype.findPath = function(start, goal) {
	var aStar = new AStarPathFinder(
			new AStarNode(start, null, 0),
			new AStarNode(goal, null, 0),
			this.aStarDepthConstraint,
      this._gridMapNeighborProviderFactory,
			this._getHeuristicProvider());
	var list = aStar.execute();
	return this._nodeListToCoordsList(list);
};

/** Converts a list of AStarNodes to a list of Coordinates.
* @param list {Array<AStarNode>} the list of AStarNodes
* @return a list of Coordinates
*/
SL.GridMap.prototype._nodeListToCoordsList = function(list) {
	var retList = [];
	for (var i = 0; i < list.length; i++) {
		retList.push(list[i].element);
	}
	return retList;
};

/** Get a heuristic provider for this grid map
* @return {IHeuristicProvider} the heuristicProvider
*/
SL.GridMap.prototype._getHeuristicProvider = function() {
    var heuristicProvider = new SL.IHeuristicProvider();
    switch(this.distanceMetricForPathFinding) {
      case "euclidean":
        heuristicProvider.h = function(node, goal) {
          return SL.GridMap.calculateDistance(node.element, goal.element);
        }.bind(this);
        break;
      case "manhattan":
        heuristicProvider.h = function(node, goal) {
          return SL.GridMap.calculateManhattanDistance(node.element, goal.element);
        }.bind(this);
        break;
      case "specialmanhattan":
        heuristicProvider.h = function(node, goal) {
          return SL.GridMap.calculateSpecialManhattanDistance(node.element, goal.element);
        }.bind(this);
        break;
      default:
        throw new Error("Unrecognized distanceMetricForPathFinding. Please use euclidean,manhattan, or specialmanhattan.");
    }
    return heuristicProvider;
};


/** @class Provides neighbors for a given parent node for a given map.
* Returns AStarNodes for coordinates neighboring the parent node's coordinates.
* If allowDiagonalMovement on the provided map is false, then only coordinates primary
* cardinal directions are returned (N,E,S,W).
* Will not return neighbors for coordinates that are out of bounds or not free.
* @param parent {AStarNode} the node to get neighbors for.
* @param map {SL.GridMap} the map
*/
SL.GridMapNeighborProvider = function(parent, map) {
  this._parent = parent;
  this._coords = parent.element;
  this._i = 0;
  this._map = map;
};

/** Retrieve the next neighbor.
* @override .
* @return {AStarNode} a node containing the coordinates for a neighboring map cell; null if none remain.
*/
SL.GridMapNeighborProvider.prototype.next = function() {
  var neighborCoords;
  do {
    if (!this._map.allowDiagonalMovement && this._i%2 === 1) this._i++;
    if (this._i >= 8) return null;
    var dir = SL.Direction.values[this._i];
    neighborCoords = SL.GridMap.directionToCoordinates(dir, this._coords);
    this._i++;
  } while (!this._map.isFree(neighborCoords));
  return new AStarNode(neighborCoords, this._parent, 0);
};


/** @class Factory to instantiate SL.GridMapNeighborProvider
* @param map {SL.GridMap} the grid map to use to create the neighbor provider
*
*/
SL.GridMapNeighborProviderFactory = function(map) {
  this._map = map;
};
/** Get a neighbor provider for the specified node
* @param node {AStarNode} the node to get the neighbor provider for
* @return {INeighborProvider} a grid map neighbor provider.
*/
SL.GridMapNeighborProviderFactory.prototype.getProvider = function(node) {
  return new SL.GridMapNeighborProvider(node,this._map);
};
