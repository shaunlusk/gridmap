import Direction from './Direction';
import GridMapNeighborProvider from './GridMapNeighborProvider';
import GridMapNeighborProviderFactory from './GridMapNeighborProviderFactory';

/**
* @class For representing a 2d map as a grid of cells.
*/
export default class GridMap {
  constructor(width, height) {
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

    this.maxDistance = GridMap.calculateDistance(new Coordinates(0,0), new Coordinates(width-1,height-1));
    this.manhattanMaxDistance = GridMap.calculateManhattanDistance(new Coordinates(0,0), new Coordinates(width-1,height-1));
    this.specialManhattanMaxDistance = GridMap.calculateSpecialManhattanDistance(new Coordinates(0,0), new Coordinates(width-1,height-1));

    this._gridMapNeighborProviderFactory = null;
  };

  initialize(gridCellFactory) {
    this._createAstarNeighborProviderFactory();
    this._initializeMapCells(gridCellFactory);
  }

  _createAstarNeighborProviderFactory() {
    this._gridMapNeighborProviderFactory = new GridMapNeighborProviderFactory(this);
  }

  _initializeMapCells (gridCellFactory) {
    var row;
    for (var y = 0; y < this.height; y++) {
      row = [];
      this.cells.push(row);
      for (var x = 0; x < this.width; x++) {
        this.cells[y].push( gridCellFactory.getGridCell(x, y) );
      }
    }
  }

  normalizeDistance (distance) {return distance / this.maxDistance;}
  normalizeManhattanDistance (distance) {return distance / this.manhattanMaxDistance;}
  normalizeSpecialManhattanDistance (distance) {return distance / this.specialManhattanMaxDistance;}

  /** Checks if the cell at the provided coordinates is inbounds and freee free.
  * @param coords {Coordinates} the coordinates to check.
  * @return {boolean} True if the coordinates are in map bounds and not occupied; false otherwise.
  */
  isFree (coords) {
    if (this.isInBounds(coords) && this.cells[coords.y][coords.x].isFree())
      return true;
    return false;
  }

  /** Checks if the specified coordinates are in the bounds of the map.
  * @param coords {Coordinates} the coordinates to check
  * @return {boolean} true if the coords are in bounds, false otherwise.
  */
  isInBounds (coords) {
    if (coords.x >= 0 && coords.x < this.width && coords.y >=0 && coords.y < this.height) return true;
    return false;
  }

  /** Retrieve the gridCell at the specified coordinates.  Does not perform bounds checking.
  * @param coords {Coordinates} the coordinates.
  * @return {gridCell} the grid cell
  */
  getGridCell (coords) {
    return this.cells[coords.y][coords.x];
  }

  /** Retrieve the contents of the gridcell at the specified coordinates.
  * Does not perform bounds checking.
  * @param coords {Coordinates} the coordinates.
  * @return {gridCell} the grid cell
  */
  getContents (coords) {
    return this.getGridCell(coords).getContents();
  }

  /** Set the contents of the gridcell at the specified coordinates.
  * Does not perform bounds checking.
  * @param contents {Object} the contents.
  * @param coords {Coordinates} the coordinates.
  * @return {gridCell} the grid cell
  */
  setContents (contents, coords) {
    return this.getGridCell(coords).setContents(contents);
  }

  /**
  * Returns an array of available Directions for a given set of coords.
  * (that is, the directions of free spaces around a point)
  * @param coords {Coordinates} coordinates
  * @returns {Array} list of directions
  */
  findAvailableDirectionsForCoordinates (coords) {
    var list = [];
    for (var i = 0; i < Direction.values.length; i++) {
      if (this.isFree(GridMap.directionToCoordinates(Direction.values[i], coords))) list.push(Direction.values[i]);
    }
    return list;
  }

  /**
  * Build a list of entities that occur around (but not including) a point.
  * @param c {Coordinates} coordinates
  * @returns {Array} list of entities
  */
  getListOfAdjacentEntities(c) {
    var list = [];
    var adjacent;
    var entity;
    for (var i = 0; i < Direction.values.length; i++) {
      adjacent = GridMap.directionToCoordinates(Direction.values[i], c);
      if (this.isInBounds(adjacent)) {
        entity = this.getContents(adjacent);
        if (null !== entity) list.push(entity);
      }
    }
    return list;
  }

  /**
   * Retrieve a list of entities that appear on the map within a specified rectangle.
   * @param topLeft {Coordinates} The top left coordinates of the rectangle, inclusive.
   * @param bottomRight {Coordinates} The bottom right coordinate of the rectangle, inclusive.
   * @param type {String} String identifier for the entity.  Must match entity.getType() for the entity to be included. null/undefined= match all!
   * @return {Array} list of entities
   */
  getListOfEntitiesInRange(topLeft, bottomRight, type) {
    var entity = null;
    var list = [];
    for (var y = topLeft.y; y <= bottomRight.y; y++) {
      for (var x = topLeft.x; x <= bottomRight.x; x++) {
        entity = this.getContents(new Coordinates(x, y));
        if (null !== entity) {
          if (type === undefined || type === null || entity.getType() === type) {
            list.push(entity);
          }
        }
      }
    }
    return list;
  }

  /**
  * Get a set of random coordinates from the map.
  * @return {Coordinates} a set of coordinates
  */
  generateRandomCoordinates() {
    var x = Math.floor(Math.random() * this.width);
    var y = Math.floor(Math.random() * this.height);
    return new Coordinates(x, y);
  }

  /**
  * Generate a random set of coordinates for a free space on the map.
  * NOTE: if there are no free spaces on the map, this function will never return!
  * @return {Coordinates} a Coordinates
  */
  generateRandomFreeCoordinates() {
    var c;

    do {
      c = this.generateRandomCoordinates();
    } while (!this.isFree(c));
    return c;
  }

  /**
  * Get a set of random coordinates from a list of coordinates.
  * If coordssArray is empty this will blow up.
  * If none of the coords are empty, this will never return!
  * @param coordsArray {Array} The list of coords you want to choose from.
  * @return {Coordinates} The selected coords
  */
  getRandomFreeCoordinatesFromList (coordsArray) {
    var p;

    do {
      p = coordsArray[Math.floor(Math.random() * coordsArray.length)];
    } while (!this.isFree(p));

    return p;
  }

  /**
  * Generate random coordinates in a specified rectangular range (inclusive) on the map.
  * @param topLeft {Coordinates} the top left corner of the range
  * @param bottomRight {Coordinates} the bottom right corner of the range
  * @return {Coordinates} a set of coordinates
  */
  generateRandomCoordinatesInRange(topLeft, bottomRight) {
    var x = Math.floor(Math.random() * (bottomRight.x - topLeft.x + 1)) + topLeft.x;
    var y = Math.floor(Math.random() * (bottomRight.y - topLeft.y + 1)) + topLeft.y;
    return new Coordinates(x, y);
  }

  /**
  * Generate random coordinates for a free cell in a specified rectangular range (inclusive) on the map.
  * If no free spaces exist, this method will never return!
  * @param topLeft {Coordinates} the top left corner of the range
  * @param bottomRight {Coordinates} the bottom right corner of the range
  * @return {Coordinates} a set of coordinates
  */
  generateRandomFreeCoordinatesInRange(topLeft, bottomRight) {
    var c;

    do {
      c = this.generateRandomCoordinatesInRange(topLeft, bottomRight);
    } while (!this.isFree(c));
    return c;
  }

  getCoordinatesInRange(origin, range, includeOrigin) {
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
  }

  _getCoordinatesInRange(origin,range,hash) {
    var c = null;
    if (range === 0) return;
    for (var d = 0; d < Direction.values.length; d++) {
      if (!this.allowDiagonalMovement && Direction.isDiagonal(Direction.values[d])) continue;
      c = new Coordinates( origin.x + Direction.offsets[d].x, origin.y + Direction.offsets[d].y );
      if (!this.isInBounds(c)) continue;
      hash[c.toString()] = c;
      this._getCoordinatesInRange(c,range - 1,hash);
    }
  }


  



/**
 * Returns directions adjacent to and including the direction argument that are free.
 * I.e., if you supply north, you get NW, N, NE.
 * @param coords {Coordinates} target coords
 * @param direction {String} The direction code.
 * @return {Array} A list of adjacent directions including the direction provided.
 */
getSimilarAvailableDirections(coords, direction) {
	var list = GridMap.getSimilarDirections(direction);
	var ilist = [];
	var c;

  for (var i = 0; i < list.length; i++) {
    c = GridMap.directionToCoordinates(list[i], coords);
    if (this.isFree(c)) ilist.push(list[i]);
  }
	return ilist;
};

/** Get the directions around a set of coordinates that are free.
* @param coords {Coordinates} the coordinates
* @return {Array} array of coordinates
*/
getAvailableDirections(coords) {
	var list = [];
	for (var i = 0; i < Direction.values.length; i++) {
		if (this.isFree(GridMap.directionToCoordinates(Direction.values[i], coords))) list.push(Direction.values[i]);
	}

	return list;
};

/** Get coordinates adjacent to the specified coordinates that are free.
* @param coords {Coordinates} target coords
* @return {Array} array of Coordinates
*/
findAdjacentFreeCoordinates(coords) {
	var list = [];
  for (var i = 0; i < Direction.values.length; i++) {
		if (this.isFree(GridMap.directionToCoordinates(Direction.values[i], coords))) list.push(GridMap.directionToCoordinates(Direction.values[i], coords));
	}
	return list;
};

/**
 * Checks if a straight line exists between this entity and the target.  Ensure target is not null.
 * @param one {Entity} first entity
 * @param other {Entity} other entity
 * @return {boolean} if entities have line of sight
 */
entitiesHaveLineOfSight(one, other) {
	var current = one.getCoords();
	var end = other.getCoords();

	var d = GridMap.coordinatesToDirection(current, end);
	current = GridMap.directionToCoordinates(d, current);

	while (current !== other.getCoords() && this.isFree(current)) {
		d = GridMap.coordinatesToDirection(current, end);
		current = GridMap.directionToCoordinates(d, current);
	}

	if (current.equals(other.getCoords())) return true;
	return false;
}

  /** Finds the shortest path between the start coords and the goal coords, if one exists.
  * @param {Coordinates} start the coordinates to start searching from.
  * @param {Coordinates} goal the coordinates to find a path to
  * @return {Array<Coordinates>} A list of coordinates, from start to goal inclusive; null if no path was found.
  */
  findPath(start, goal) {
    var aStar = new AStarPathFinder(
        new AStarNode(start, null, 0),
        new AStarNode(goal, null, 0),
        this.aStarDepthConstraint,
        this._gridMapNeighborProviderFactory,
        this._getHeuristicProvider());
    var list = aStar.execute();
    return this._nodeListToCoordsList(list);
  }

  /** Converts a list of AStarNodes to a list of Coordinates.
  * @param list {Array<AStarNode>} the list of AStarNodes
  * @return a list of Coordinates
  */
  _nodeListToCoordsList(list) {
    var retList = [];
    for (var i = 0; i < list.length; i++) {
      retList.push(list[i].element);
    }
    return retList;
  }

  /** Get a heuristic provider for this grid map
  * @return {IHeuristicProvider} the heuristicProvider
  */
  _getHeuristicProvider() {
      var heuristicProvider = new IHeuristicProvider();
      switch(this.distanceMetricForPathFinding) {
        case "euclidean":
          heuristicProvider.h = (node, goal) => {
            return GridMap.calculateDistance(node.element, goal.element);
          }//.bind(this);
          break;
        case "manhattan":
          heuristicProvider.h = (node, goal) => {
            return GridMap.calculateManhattanDistance(node.element, goal.element);
          }//.bind(this);
          break;
        case "specialmanhattan":
          heuristicProvider.h = (node, goal) => {
            return GridMap.calculateSpecialManhattanDistance(node.element, goal.element);
          }//.bind(this);
          break;
        default:
          throw new Error("Unrecognized distanceMetricForPathFinding. Please use euclidean,manhattan, or specialmanhattan.");
      }
      return heuristicProvider;
  }
}

/** Calculate the direction between source and target coordinates
* @param srcCoords {Coordinates} source coords
* @param tgtCoords {Coordinates} target coords
* @return {float} radians representing the angle from source to target
*/
GridMap.coordinatesToDirectionInRadians = function(srcCoords, tgtCoords) {
	var dx = tgtCoords.x - srcCoords.x;
	var dy = tgtCoords.y - srcCoords.y;
  var rads = Math.atan2(dy, dx);

	return rads;
};

/** Calculate the direction between source and target coordinates
* @param srcCoords {Coordinates} source coords
* @param tgtCoords {Coordinates} target coords
* @return {String} string representing the direction code
*/
GridMap.coordinatesToDirection = function(srcCoords, tgtCoords) {
	var d = null;

	var dx = tgtCoords.x - srcCoords.x;
	var dy = tgtCoords.y - srcCoords.y;
  var degrees = Math.atan2(dy, dx) * 180 / Math.PI;
	var bearing = degrees + 360;
	var boc = bearing / 360 * 8;
	var dir = (Math.floor(boc) + 2) % 8;

	return Direction.values[dir];
};

/**
  * Given a set of coordinates, finds the adjacent coords for the given direction.
  * @static
  * @param direction {String} a direction, based on values in Direction.
  * @param currentCoords {Coordinates} the target coordinates
  * @return {Coordinates} the coords
  */
GridMap.directionToCoordinates = function(direction,currentCoords) {
  var x = currentCoords.x;
  var y = currentCoords.y;
  switch (direction) {
  case Direction.NORTH:
    y -= 1;
    break;
  case Direction.NORTHEAST:
    y -= 1;
    x += 1;
    break;
  case Direction.EAST:
    x += 1;
    break;
  case Direction.SOUTHEAST:
    y += 1;
    x += 1;
    break;
  case Direction.SOUTH:
    y += 1;
    break;
  case Direction.SOUTHWEST:
    y += 1;
    x -= 1;
    break;
  case Direction.WEST:
    x -= 1;
    break;
  case Direction.NORTHWEST:
    y -= 1;
    x -= 1;
    break;
  }
  return new Coordinates(x, y);
}

/** Calculate the euclidean distance between two sets of coordinates.
* @param c1 {Coordinates} coords 1
* @param c2 {Coordinates} coords 2
* @return {float} the distance
*/
GridMap.calculateDistance = function(c1, c2) {
return Math.sqrt( Math.pow(c1.x-c2.x, 2) + Math.pow(c1.y-c2.y, 2));
};

/** Calculate the Manhattan distance between two sets of coordinates.
* @param c1 {Coordinates} coords 1
* @param c2 {Coordinates} coords 2
* @return {int} the distance
*/
GridMap.calculateManhattanDistance = function(c1,c2) {
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
GridMap.calculateSpecialManhattanDistance = function(c1, c2) {
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
GridMap.getSimilarDirections = function(direction) {
	var list = [];
	list.push(direction);
	list.push(Direction.values[(Direction.ordinal(direction)+1)%8]);
	list.push(Direction.values[(Direction.ordinal(direction)+7)%8]);
	return list;
};