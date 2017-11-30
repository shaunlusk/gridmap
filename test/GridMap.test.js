var SL = SL || {};
var Direction = SL.Direction;
var GridMap = SL.GridMap;
var GridMapNeighborProvider = SL.GridMapNeighborProvider;
var GridMapNeighborProviderFactory = SL.GridMapNeighborProviderFactory;
var AStar = SL.AStar;
var AStarNode = SL.AStarNode;
var AStarPathProvider = SL.AStarPathProvider;

describe("Direction", function() {
  describe("#ordinal()", function(){
    it("should return the index value of the provided direction code.", function(done){
      assert(Direction.ordinal("N") === 0, "North ordinal should be 0. Actual value:" + Direction.ordinal("N"));
      assert(Direction.ordinal("SE") === 3, "SouthEast ordinal should be 3. Actual value:" + Direction.ordinal("SE"));
      assert(Direction.ordinal("W") === 6, "West ordinal should be 6. Actual value:" + Direction.ordinal("W"));
      assert(Direction.ordinal("WERT") === -1, "Bogus ordinal should be -1. Actual value:" + Direction.ordinal("WERT"));
      done();
    });
  });
  describe("#isDiagonal()", function() {
    it("should return true when a diagonal direciton is provided", function(done){
      assert(Direction.isDiagonal("NE") === true, "NE should have returned true");
      assert(Direction.isDiagonal("SE") === true, "SE should have returned true");
      assert(Direction.isDiagonal("SW") === true, "SW should have returned true");
      assert(Direction.isDiagonal("NW") === true, "NW should have returned true");
      done();
    });
    it("should return false when a non-diagonal direciton is provided", function(done){
      assert(Direction.isDiagonal("N") === false, "N should have returned false");
      assert(Direction.isDiagonal("E") === false, "E should have returned false");
      assert(Direction.isDiagonal("S") === false, "S should have returned false");
      assert(Direction.isDiagonal("W") === false, "W should have returned false");
      done();
    });
  });
});
describe("GridMap",function() {
  describe("#constructor()", function() {
    it("sanity", function(done){
      var gridCellFactory = new SL.DefaultGridCellFactory();
      var map = new GridMap(10,10,gridCellFactory);
      done();
    });
  });
  describe("#initializeMapCells()", function() {
    it("cells array should match dimensions", function(done){
      var map = getMap();
      assert( map.cells.length === map.height, "cells length does not match map height.");
      assert( map.cells[0].length === map.width, "cells[0] length does not match map width.");
      done();
    });
    it("cells should contain some sort of grid cell", function(done){
      var map = getMap();
      var cell = map.cells[0][0];

      assert( cell._contents !== undefined, "cell contents should not be undefined.");
      assert( SL.isFunction(cell.getContents), "cell should have getContents function.");
      assert( SL.isFunction(cell.setContents), "cell should have setContents function.");
      assert( SL.isFunction(cell.isFree), "cell should have isFree function.");
      done();
    });
  });
  describe("#normalizeDistance()", function(){
    it("normalized distance should calculate correctly", function(done){
      var map = getMap();
      var maxDistance = 12.728;
      var rawDistance = 4;
      var expected = (4 / maxDistance).toFixed(3);
      var actual = (map.normalizeDistance(rawDistance)).toFixed(3);
      assert(expected === actual, "normalized distance produced bad value: " + actual + " (expected:" + expected +")");
      done();
    });
  });
  describe("#normalizeManhattanDistance()", function(){
    it("normalized manhattan distance should calculate correctly", function(done){
      var map = getMap();
      var maxDistance = 18;
      var rawDistance = 3;
      var expected = (3 / maxDistance).toFixed(3);
      var actual = (map.normalizeManhattanDistance(rawDistance)).toFixed(3);
      assert(expected === actual, "normalized special manhattan distance produced bad value: " + actual + " (expected:" + expected +")");
      done();
    });
  });
  describe("#normalizeSpecialManhattanDistance()", function(){
    it("normalized special manhattan distance should calculate correctly", function(done){
      var map = getMap();
      var maxDistance = 9;
      var rawDistance = 6;
      var expected = (6 / maxDistance).toFixed(3);
      var actual = (map.normalizeSpecialManhattanDistance(rawDistance)).toFixed(3);
      assert(expected === actual, "normalized special manhattan distance produced bad value: " + actual + " (expected:" + expected +")");
      done();
    });
  });
  describe("#removeEntity()", function(){
    it("should remove the entity from its current SL.GridCell", function(done){
      var map = getMap();
      var entity = getMockEntity();
      var cell = map.cells[1][1];
      cell.setContents(entity);
      map.removeEntity(entity);
      assert(cell.getContents() === null, "cell contents should be null after remove");
      done();
    });
  });
  describe("#isFree()", function(){
    it("should return true when grid cell does not have contents", function(done){
      var map = getMap();
      var coords = new SL.Coordinates(1,1);
      assert(map.isFree(coords) === true, "isFree should return true");
      done();
    });
    it("should return false when grid cell has contents", function(done){
      var map = getMap();
      var entity = getMockEntity();
      var cell = map.cells[1][1];
      cell.setContents(entity);
      var coords = new SL.Coordinates(1,1);
      assert(map.isFree(coords) === false, "isFree should return false");
      done();
    });
    it("should return false when coords are out of bounds", function(done){
      var map = getMap();
      var coords = new SL.Coordinates(-1,-1);
      assert(map.isFree(coords) === false, "isFree should return false");
      done();
    });
  });
  describe("#isFreeXY()", function(){
    it("should return true when grid cell does not have contents", function(done){
      var map = getMap();
      assert(map.isFreeXY(1,1) === true, "isFree should return true");
      done();
    });
    it("should return false when grid cell has contents", function(done){
      var map = getMap();
      var entity = getMockEntity();
      var cell = map.cells[1][1];
      cell.setContents(entity);
      assert(map.isFreeXY(1,1) === false, "isFree should return false");
      done();
    });
    it("should return false when coords are out of bounds", function(done){
      var map = getMap();
      assert(map.isFree(-1,-1) === false, "isFree should return false");
      done();
    });
  });
  describe("#isInBounds()", function(){
    it("should return true if coords are inside map boundary", function(done){
      var map = getMap();
      var coords1 = new SL.Coordinates(0,0);
      var coords2 = new SL.Coordinates(9,9);
      assert(map.isInBounds(coords1) === true && map.isInBounds(coords2) === true, "should have returned true");
      done();
    });
    it("should return false if coords are outside map boundary", function(done){
      var map = getMap();
      var coords1 = new SL.Coordinates(-1,-1);
      var coords2 = new SL.Coordinates(10,10);
      assert(map.isInBounds(coords1) === false && map.isInBounds(coords2) === false, "should have returned false");
      done();
    });
  });
  describe("#isInBoundsXY()", function(){
    it("should return true if coords are inside map boundary", function(done){
      var map = getMap();
      assert(map.isInBoundsXY(0,0) === true && map.isInBoundsXY(9,9) === true, "should have return true");
      done();
    });
    it("should return false if coords are outside map boundary", function(done){
      var map = getMap();
      assert(map.isInBoundsXY(-1,-1) === false && map.isInBoundsXY(10,10) === false, "should have return false");
      done();
    });
  });
  describe("#get()", function() {
    it("should return the proper SL.GridCell", function (done){
      var map = getMap();
      var cell = map.cells[1][1];
      var entity = getMockEntity();
      cell.setContents(entity);
      var coords = new SL.Coordinates(1,1);
      var newCell = map.get(coords);
      assert(newCell.getContents() !== null, "the cell should have been the one the entity was placed in");
      done();
    });
  });
  describe("#getXY()", function() {
    it("should return the proper SL.GridCell", function (done){
      var map = getMap();
      var cell = map.cells[1][1];
      var entity = getMockEntity();
      cell.setContents(entity);
      var newCell = map.getXY(1,1);
      assert(newCell.getContents() !== null, "the cell should have been the one the entity was placed in");
      done();
    });
  });
  describe("#moveEntityTo()", function() {
    it("should move the entity to the specified coords", function (done){
      var map = getMap();
      var cell = map.cells[1][1];
      var entity = getMockEntity();
      cell.setContents(entity);
      var coords = new SL.Coordinates(5,8);
      map.moveEntityTo(entity,coords);
      var newCell = map.get(coords);
      assert(newCell.getContents() !== null, "the entity should have been moved to the new cell");
      assert( cell.getContents() === null, "the entity was not removed from the original cell");
      done();
    });
    it("should throw exception if coords are not free", function (done){
      var map = getMap();
      var cell = map.cells[1][1];
      var entity = getMockEntity();
      var entity2 = getMockEntity();
      entity2.coords = new SL.Coordinates(5,8);
      cell.setContents(entity);
      var coords = new SL.Coordinates(5,8);
      var newCell = map.get(coords);
      newCell.setContents(entity2);
      var success = false;
      try {
        map.moveEntityTo(entity,coords);
      } catch(e) {
        success = true;
      }
      assert(success === true, "an exception should have been thrown");
      done();
    });
  });
  describe("#findAvailableDirectionsForCoordinates()", function() {
    it("should produce a list containing directions for free spaces, and not containing unavailable/out of bounds spaces.", function(done){
      // Use space in top left corner
      // x: target
      // e: some entity
      // .: free space
      // ______
      // |x....
      // |e....
      var map = getMap();
      var cell = map.cells[1][0];
      var entity = getMockEntity();
      cell.setContents(entity);
      var coords = new SL.Coordinates(0,0);
      var list = map.findAvailableDirectionsForCoordinates(coords);
      assert(list.indexOf(Direction.NORTH) === -1, "North should not have been included: out of bounds.");
      assert(list.indexOf(Direction.NORTHEAST) === -1, "NorthEast should not have been included: out of bounds.");
      assert(list.indexOf(Direction.EAST) !== -1, "East should have been included.");
      assert(list.indexOf(Direction.SOUTHEAST) !== -1, "SouthEast not have been included.");
      assert(list.indexOf(Direction.SOUTH) === -1, "South should not have been included: occupied!");
      assert(list.indexOf(Direction.SOUTHWEST) === -1, "SouthWest should not have been included: out of bounds.");
      assert(list.indexOf(Direction.WEST) === -1, "West should not have been included: out of bounds.");
      assert(list.indexOf(Direction.NORTHWEST) === -1, "NorthWest should not have been included: out of bounds.");
      done();
    });
  });
  describe("#buildListOfAdjacentEntities()", function() {
    it("should produce a list entities that are adjacent to the specified coordinates.", function(done){
      // Use space 1,0
      // x: target
      // e: some entity
      // .: free space
      // ______
      // |.xe..
      // |e....
      var map = getMap();
      var cell;
      // var entity1 = getMockEntity();
      // entity1.name = "huey";
      // entity1.coords = new SL.Coordinates(1,0);
      // cell = map.get(entity1.coords);
      // cell.setContents(entity1);
      var entity2 = getMockEntity();
      entity2.name = "dewie";
      entity2.coords = new SL.Coordinates(2,0);
      cell = map.get(entity2.coords);
      cell.setContents(entity2);
      var entity3 = getMockEntity();
      entity3.name = "louie";
      entity3.coords = new SL.Coordinates(0,1);
      cell = map.get(entity3.coords);
      cell.setContents(entity3);

      var coords = new SL.Coordinates(1,0);
      var list = map.buildListOfAdjacentEntities(coords);
      assert( list.length === 2, "should have found 2 entities");
      assert( list[0].name === entity2.name || list[0].name === entity3.name, "foreign entity retrieved!");
      assert( list[1].name === entity2.name || list[1].name === entity3.name, "foreign entity retrieved!");
      done();
    });
  });
  describe("#buildListOfSpecificAdjacentEntities()", function() {
    it("should produce a list entities of a given type that are adjacent to the specified coordinates.", function(done){
      // Use space 1,0
      // x: target
      // e: some entity
      // .: free space
      // ______
      // |.xe..
      // |ee...
      var map = getMap();
      var cell;
      var entity1 = getMockEntity();
      entity1.type = "enemy";
      entity1.coords = new SL.Coordinates(2,0);
      cell = map.get(entity1.coords);
      cell.setContents(entity1);
      var entity2 = getMockEntity();
      entity2.type = "ally";
      entity2.coords = new SL.Coordinates(0,1);
      cell = map.get(entity2.coords);
      cell.setContents(entity2);
      var entity3 = getMockEntity();
      entity3.type = "enemy";
      entity3.coords = new SL.Coordinates(1,1);
      cell = map.get(entity3.coords);
      cell.setContents(entity3);

      var coords = new SL.Coordinates(1,0);
      var list = map.buildListOfSpecificAdjacentEntities(coords, "enemy");
      assert( list.length === 2, "should have found 2 entities");
      assert( list[0].type === "enemy", "foreign entity retrieved!");
      assert( list[1].type === "enemy", "foreign entity retrieved!");
      done();
    });
  });
  describe("#getListOfEntitiesInRange()", function() {
    it("should produce a list entities of type in the given range.", function(done){
      var map = getMap();
      var cell;
      var entity1 = getMockEntity();
      entity1.type = "enemy";
      entity1.coords = new SL.Coordinates(2,2);
      cell = map.get(entity1.coords);
      cell.setContents(entity1);
      var entity2 = getMockEntity();
      entity2.type = "ally";
      entity2.coords = new SL.Coordinates(3,3);
      cell = map.get(entity2.coords);
      cell.setContents(entity2);
      var entity3 = getMockEntity();
      entity3.type = "enemy";
      entity3.coords = new SL.Coordinates(8,8);
      cell = map.get(entity3.coords);
      cell.setContents(entity3);
      var entity4 = getMockEntity();
      entity4.type = "enemy";
      entity4.coords = new SL.Coordinates(8,9);
      cell = map.get(entity4.coords);
      cell.setContents(entity4);

      var topLeft = new SL.Coordinates(1,1);
      var bottomRight = new SL.Coordinates(8,8);
      var list = map.getListOfEntitiesInRange(topLeft, bottomRight, "enemy");
      assert( list.length === 2, "should have found 2 entities");
      done();
    });
    it("should produce a list of all entities in the given range when type is undefined.", function(done){
      var map = getMap();
      var cell;
      var entity1 = getMockEntity();
      entity1.type = "enemy";
      entity1.coords = new SL.Coordinates(2,2);
      cell = map.get(entity1.coords);
      cell.setContents(entity1);
      var entity2 = getMockEntity();
      entity2.type = "ally";
      entity2.coords = new SL.Coordinates(3,3);
      cell = map.get(entity2.coords);
      cell.setContents(entity2);
      var entity3 = getMockEntity();
      entity3.type = "enemy";
      entity3.coords = new SL.Coordinates(8,8);
      cell = map.get(entity3.coords);
      cell.setContents(entity3);
      var entity4 = getMockEntity();
      entity4.type = "enemy";
      entity4.coords = new SL.Coordinates(8,9);
      cell = map.get(entity4.coords);
      cell.setContents(entity4);

      var topLeft = new SL.Coordinates(1,1);
      var bottomRight = new SL.Coordinates(8,8);
      var list = map.getListOfEntitiesInRange(topLeft, bottomRight);
      assert( list.length === 3, "should have found 3 entities");
      done();
    });
    it("should produce a list of all entities in the given range when type is null.", function(done){
      var map = getMap();
      var cell;
      var entity1 = getMockEntity();
      entity1.type = "enemy";
      entity1.coords = new SL.Coordinates(2,2);
      cell = map.get(entity1.coords);
      cell.setContents(entity1);
      var entity2 = getMockEntity();
      entity2.type = "ally";
      entity2.coords = new SL.Coordinates(3,3);
      cell = map.get(entity2.coords);
      cell.setContents(entity2);
      var entity3 = getMockEntity();
      entity3.type = "enemy";
      entity3.coords = new SL.Coordinates(8,8);
      cell = map.get(entity3.coords);
      cell.setContents(entity3);
      var entity4 = getMockEntity();
      entity4.type = "enemy";
      entity4.coords = new SL.Coordinates(8,9);
      cell = map.get(entity4.coords);
      cell.setContents(entity4);

      var topLeft = new SL.Coordinates(1,1);
      var bottomRight = new SL.Coordinates(8,8);
      var list = map.getListOfEntitiesInRange(topLeft, bottomRight, null);
      assert( list.length === 3, "should have found 3 entities");
      done();
    });
  });
  describe("#generateRandomCoordinates()", function(){
    it("should generate some coordinates", function(done) {
      var map = getMap();
      var coords = map.generateRandomCoordinates();
      assert(coords.x >= 0 && coords.y >= 0 && coords.x < map.width && coords.y < map.height, "coordinates generated were out of bounds: " + coords.x + "," + coords.y);
      done();
    });
  });
  describe("#generateRandomFreeCoordinates()", function(){
    it("should generate some coordinates that point to a free cell", function(done) {
      var map = getMap(2,2);
      var cell;
      var entity1 = getMockEntity();
      entity1.coords = new SL.Coordinates(0,0);
      cell = map.get(entity1.coords);
      cell.setContents(entity1);
      var entity2 = getMockEntity();
      entity2.coords = new SL.Coordinates(1,0);
      cell = map.get(entity2.coords);
      cell.setContents(entity2);
      var entity3 = getMockEntity();
      entity3.coords = new SL.Coordinates(0,1);
      cell = map.get(entity3.coords);
      cell.setContents(entity3);

      var coords = map.generateRandomFreeCoordinates();
      assert(coords.x === 1 && coords.y === 1, "coordinates generated were not valid: " + coords.x + "," + coords.y);
      done();
    });
  });
  describe("#getRandomFreeCoordinatesFromList()", function() {
    it("should produce coordinates that exist in the list.", function(done){
      var map = getMap();
      var coordsArray = [];
      coordsArray.push(new SL.Coordinates(0,0));
      coordsArray.push(new SL.Coordinates(1,1));
      coordsArray.push(new SL.Coordinates(2,2));

      var coords = map.getRandomFreeCoordinatesFromList(coordsArray);

      assert(coords.x !== undefined && coords.x !== null && coords.y !== undefined && coords.y !== null, "did not produce valid coordinates");
      assert( (coords.x === 0 && coords.y ===0) ||
        (coords.x === 1 && coords.y ===1) ||
        (coords.x === 2 && coords.y ===2),
        "produced coords, but they weren't in the list provided.");

      done();
    });
  });
  describe("#generateRandomCoordinatesInRange()", function() {
    it("should generate random coordinates in the given range", function(done) {
      var map = getMap();
      var topLeft = new SL.Coordinates(3,3);
      var bottomRight = new SL.Coordinates(7,7);
      var coords = map.generateRandomCoordinatesInRange(topLeft, bottomRight);
      assert(coords.x >= topLeft.x && coords.y >= topLeft.y && coords.x <= bottomRight.x && coords.y <= bottomRight.y, "produced invalid coords:" + coords.x + "," + coords.y);
      done();
    });
  });
  describe("#generateRandomFreeCoordinatesInRange()", function() {
    it("should produce coordinates inside a range that are free.", function(done) {
      var map = getMap(4,4);
      var cell;
      var entity1 = getMockEntity();
      entity1.coords = new SL.Coordinates(1,1);
      cell = map.get(entity1.coords);
      cell.setContents(entity1);
      var entity2 = getMockEntity();
      entity2.coords = new SL.Coordinates(1,2);
      cell = map.get(entity2.coords);
      cell.setContents(entity2);
      var entity3 = getMockEntity();
      entity3.coords = new SL.Coordinates(2,1);
      cell = map.get(entity3.coords);
      cell.setContents(entity3);
      var topLeft = new SL.Coordinates(1,1);
      var bottomRight = new SL.Coordinates(2,2);
      var coords = map.generateRandomFreeCoordinatesInRange(topLeft, bottomRight);

      assert(coords.x === 2 && coords.y === 2, "coordinates generated were not valid: " + coords.x + "," + coords.y);
      done();
    });
  });
  describe("#directionToCoordinates()", function() {
    it("should convert a direction to a set of coordinates, based on starting coordinates", function(done){
      var map = getMap();
      var coords = new SL.Coordinates(1,1);
      var tgtCoords;

      tgtCoords = GridMap.directionToCoordinates(Direction.NORTH, coords);
      assert( tgtCoords.x === 1 && tgtCoords.y === 0 , "produced bad coords: " + tgtCoords.x + "," + tgtCoords.y + " (expected:1,0)");
      tgtCoords = GridMap.directionToCoordinates(Direction.NORTHEAST, coords);
      assert( tgtCoords.x === 2 && tgtCoords.y === 0 , "produced bad coords: " + tgtCoords.x + "," + tgtCoords.y + " (expected:2,0)");
      tgtCoords = GridMap.directionToCoordinates(Direction.EAST, coords);
      assert( tgtCoords.x === 2 && tgtCoords.y === 1 , "produced bad coords: " + tgtCoords.x + "," + tgtCoords.y + " (expected:2,1)");
      tgtCoords = GridMap.directionToCoordinates(Direction.SOUTHEAST, coords);
      assert( tgtCoords.x === 2 && tgtCoords.y === 2 , "produced bad coords: " + tgtCoords.x + "," + tgtCoords.y + " (expected:2,2)");
      tgtCoords = GridMap.directionToCoordinates(Direction.SOUTH, coords);
      assert( tgtCoords.x === 1 && tgtCoords.y === 2 , "produced bad coords: " + tgtCoords.x + "," + tgtCoords.y + " (expected:1,2)");
      tgtCoords = GridMap.directionToCoordinates(Direction.SOUTHWEST, coords);
      assert( tgtCoords.x === 0 && tgtCoords.y === 2 , "produced bad coords: " + tgtCoords.x + "," + tgtCoords.y + " (expected:0,2)");
      tgtCoords = GridMap.directionToCoordinates(Direction.WEST, coords);
      assert( tgtCoords.x === 0 && tgtCoords.y === 1 , "produced bad coords: " + tgtCoords.x + "," + tgtCoords.y + " (expected:0,1)");
      tgtCoords = GridMap.directionToCoordinates(Direction.NORTHWEST, coords);
      assert( tgtCoords.x === 0 && tgtCoords.y === 0 , "produced bad coords: " + tgtCoords.x + "," + tgtCoords.y + " (expected:0,0)");

      done();
    });
  });
  describe("#calculateDistance()", function() {
    it("should calculate euclidean distance between two points", function(done){
      var map = getMap();
      var coords1 = new SL.Coordinates(1,0);
      var coords2 = new SL.Coordinates(3,9);
      var expected = ( Math.sqrt( Math.pow(coords2.x - coords1.x, 2) + Math.pow(coords2.y - coords1.y, 2))).toFixed(3);
      var actual = (GridMap.calculateDistance(coords1, coords2)).toFixed(3);
      console.log("actual="+actual+",expected="+expected);
      assert( expected === actual , "distance was different than expected. actual=" + actual + ", expected=" + expected);
      done();
    });
  });
  describe("#calculateManhattanDistance()", function() {
    it("should calculate manhattan distance between two points", function(done){
      var map = getMap();
      var coords1 = new SL.Coordinates(1,0);
      var coords2 = new SL.Coordinates(3,9);
      var expected = ( Math.abs(coords2.x - coords1.x) + Math.abs(coords2.y - coords1.y)).toFixed(3);
      var actual = (GridMap.calculateManhattanDistance(coords1, coords2)).toFixed(3);
      console.log("actual="+actual+",expected="+expected);
      assert( expected === actual , "distance was different than expected. actual=" + actual + ", expected=" + expected);
      done();
    });
  });
  describe("#calculateSpecialManhattanDistance()", function() {
    it("should calculate special manhattan distance between two points", function(done){
      var map = getMap();
      var coords1 = new SL.Coordinates(1,0);
      var coords2 = new SL.Coordinates(3,9);
      var xdiff = Math.abs(coords2.x - coords1.x);
      var ydiff = Math.abs(coords2.y - coords1.y);
      var expected = (xdiff > ydiff ? xdiff : ydiff ).toFixed(3);
      var actual = (GridMap.calculateSpecialManhattanDistance(coords1, coords2)).toFixed(3);
      console.log("actual="+actual+",expected="+expected);
      assert( expected === actual , "distance was different than expected. actual=" + actual + ", expected=" + expected);
      done();
    });
  });
  describe("#getSimilarDirections()", function() {
    it("should return directions in the same quadrant as the one provided.", function(done){
      var map = getMap();
      var list;
      list = GridMap.getSimilarDirections(Direction.NORTH);
      assert( list.length === 3 ,"List was wrong size: " + list.length);
      assert(list.indexOf(Direction.NORTHWEST) > -1 && list.indexOf(Direction.NORTH) > -1 && list.indexOf(Direction.NORTHEAST) > -1, "produced a bad list: " + list[0] + "," +list[1] + "," +list[2]);
      list = GridMap.getSimilarDirections(Direction.NORTHEAST);
      assert( list.length === 3 ,"List was wrong size: " + list.length);
      assert(list.indexOf(Direction.NORTH) > -1 && list.indexOf(Direction.NORTHEAST) > -1 && list.indexOf(Direction.EAST) > -1, "produced a bad list: " + list[0] + "," +list[1] + "," +list[2]);
      list = GridMap.getSimilarDirections(Direction.EAST);
      assert( list.length === 3 ,"List was wrong size: " + list.length);
      assert(list.indexOf(Direction.NORTHEAST) > -1 && list.indexOf(Direction.EAST) > -1 && list.indexOf(Direction.SOUTHEAST) > -1, "produced a bad list: " + list[0] + "," +list[1] + "," +list[2]);
      list = GridMap.getSimilarDirections(Direction.SOUTHEAST);
      assert( list.length === 3 ,"List was wrong size: " + list.length);
      assert(list.indexOf(Direction.EAST) > -1 && list.indexOf(Direction.SOUTHEAST) > -1 && list.indexOf(Direction.SOUTH) > -1, "produced a bad list: " + list[0] + "," +list[1] + "," +list[2]);
      list = GridMap.getSimilarDirections(Direction.SOUTH);
      assert( list.length === 3 ,"List was wrong size: " + list.length);
      assert(list.indexOf(Direction.SOUTHEAST) > -1 && list.indexOf(Direction.SOUTH) > -1 && list.indexOf(Direction.SOUTHWEST) > -1, "produced a bad list: " + list[0] + "," +list[1] + "," +list[2]);
      list = GridMap.getSimilarDirections(Direction.SOUTHWEST);
      assert( list.length === 3 ,"List was wrong size: " + list.length);
      assert(list.indexOf(Direction.SOUTH) > -1 && list.indexOf(Direction.SOUTHWEST) > -1 && list.indexOf(Direction.WEST) > -1, "produced a bad list: " + list[0] + "," +list[1] + "," +list[2]);
      list = GridMap.getSimilarDirections(Direction.WEST);
      assert( list.length === 3 ,"List was wrong size: " + list.length);
      assert(list.indexOf(Direction.SOUTHWEST) > -1 && list.indexOf(Direction.WEST) > -1 && list.indexOf(Direction.NORTHWEST) > -1, "produced a bad list: " + list[0] + "," +list[1] + "," +list[2]);
      list = GridMap.getSimilarDirections(Direction.NORTHWEST);
      assert( list.length === 3 ,"List was wrong size: " + list.length);
      assert(list.indexOf(Direction.WEST) > -1 && list.indexOf(Direction.NORTHWEST) > -1 && list.indexOf(Direction.NORTH) > -1, "produced a bad list: " + list[0] + "," +list[1] + "," +list[2]);
      done();
    });
  });
  describe("#getSimilarAvailableDirections()", function() {
    it("should return directions in the same quadrant as the one provided, if they are free.", function(done){
      var map = getMap();
      var list;
      var entity = getMockEntity();
      entity.coords = new SL.Coordinates(1,0);
      map.get(entity.coords).setContents(entity);
      var coords = new SL.Coordinates(1,1);
      list = map.getSimilarAvailableDirections(coords, Direction.NORTH);
      assert( list.length === 2 ,"List was wrong size: " + list.length );
      assert(list.indexOf(Direction.NORTHWEST) > -1 && list.indexOf(Direction.NORTH) === -1 && list.indexOf(Direction.NORTHEAST) > -1, "produced a bad list: " + list[0] + "," +list[1]);

      done();
    });
  });
  describe("#getAvailableDirections()", function() {
    it("should return directions around the target coordinates that are free.", function(done){
      var map = getMap();
      var list;
      var entity = getMockEntity();
      entity.coords = new SL.Coordinates(9,8);
      map.get(entity.coords).setContents(entity);
      var coords = new SL.Coordinates(9,9);
      list = map.getAvailableDirections(coords);
      assert( list.length === 2 ,"List was wrong size: " + list.length );
      assert(list.indexOf(Direction.NORTHWEST) > -1 && list.indexOf(Direction.NORTH) === -1 && list.indexOf(Direction.WEST) > -1, "produced a bad list: " + list[0] + "," +list[1]);

      done();
    });
  });
  describe("#findAdjacentFreeCoordinates()", function() {
    it("should return coordinates around the target coordinates that are free.", function(done){
      var map = getMap();
      var list;
      var entity = getMockEntity();
      entity.coords = new SL.Coordinates(9,8);
      map.get(entity.coords).setContents(entity);
      var coords = new SL.Coordinates(9,9);
      list = map.findAdjacentFreeCoordinates(coords);
      assert( list.length === 2 ,"List was wrong size: " + list.length );
      assert((list[0].x === 8 && list[0].y === 8) ||
        (list[0].x === 8 && list[0].y === 9),
        "produced a bad list: " + list[0].x + "," + list[0].y + "; " + list[1].x + ", " +list[1].y);
      assert((list[1].x === 8 && list[1].y === 8) ||
        (list[1].x === 8 && list[1].y === 9),
        "produced a bad list: " + list[0].x + "," + list[0].y + "; " + list[1].x + ", " +list[1].y);
      assert(list[0].y !== list[1].y , "produced a bad list: " + list[0].x + "," + list[0].y + "; " + list[1].x + ", " +list[1].y);
      done();
    });
  });
  describe("#coordinatesToDirection()", function() {
    it("should find the direction to move from srcCoords to tgtCoords in a straightish line.", function(done){
      var map = getMap();
      var srcCoords, tgtCoords, dir;

      srcCoords = new SL.Coordinates(1,1);
      tgtCoords = new SL.Coordinates(3,3);
      dir = GridMap.coordinatesToDirection(srcCoords, tgtCoords);
      expected = Direction.SOUTHEAST;
      assert( dir === expected , "direction didn't match expected. " + dir + ", expected:" + expected );

      srcCoords = new SL.Coordinates(1,1);
      tgtCoords = new SL.Coordinates(5,1);
      dir = GridMap.coordinatesToDirection(srcCoords, tgtCoords);
      expected = Direction.EAST;
      assert( dir === expected , "direction didn't match expected. " + dir + ", expected:" + expected );

      srcCoords = new SL.Coordinates(1,1);
      tgtCoords = new SL.Coordinates(1,8);
      dir = GridMap.coordinatesToDirection(srcCoords, tgtCoords);
      expected = Direction.SOUTH;
      assert( dir === expected , "direction didn't match expected. " + dir + ", expected:" + expected );

      srcCoords = new SL.Coordinates(1,1);
      tgtCoords = new SL.Coordinates(0,0);
      dir = GridMap.coordinatesToDirection(srcCoords, tgtCoords);
      expected = Direction.NORTHWEST;
      assert( dir === expected , "direction didn't match expected. " + dir + ", expected:" + expected );
      done();
    });
  });
  describe("#coordinatesToDirectionInRadians()", function() {
    it("should return the angle between two coordinates in radians.", function(done){
      var coords1 = new SL.Coordinates(1,1);
      var coords2 = new SL.Coordinates(2,7);
      var result = GridMap.coordinatesToDirectionInRadians(coords1, coords2);
      var expected = (1.4056476493802699).toFixed(3);
      var actual = (result).toFixed(3);
      assert(actual === expected, "bad calc.  expected:" + expected + "; actual:" + actual);
      done();
    });
  });
  describe("#entitiesHaveLineOfSight()", function() {
    it("when no obstacles, entities should have line of sight", function(done){
      var map = getMap();
      var entity1 = getMockEntity();
      entity1.coords = new SL.Coordinates(1,1);
      map.get(entity1.coords).setContents(entity1);

      var entity2 = getMockEntity();
      entity2.coords = new SL.Coordinates(9,9);
      map.get(entity2.coords).setContents(entity2);

      var entity3 = getMockEntity();
      entity3.coords = new SL.Coordinates(1,9);
      map.get(entity3.coords).setContents(entity3);

      var entity4 = getMockEntity();
      entity4.coords = new SL.Coordinates(9,1);
      map.get(entity4.coords).setContents(entity4);

      assert( map.entitiesHaveLineOfSight(entity1, entity4) === true , "entity 1 & 4 should have line of sight" );
      assert( map.entitiesHaveLineOfSight(entity2, entity1) === true , "entity 2 & 1 should have line of sight" );
      assert( map.entitiesHaveLineOfSight(entity1, entity3) === true , "entity 1 & 3 should have line of sight" );
      assert( map.entitiesHaveLineOfSight(entity3, entity4) === true , "entity 3 & 4 should have line of sight" );
      done();
    });
    it("when obstacles in the way, entities should not have line of sight", function(done){
      var map = getMap();
      var entity1 = getMockEntity();
      entity1.coords = new SL.Coordinates(1,1);
      map.get(entity1.coords).setContents(entity1);

      var obstacle1 = getMockEntity();
      obstacle1.coords = new SL.Coordinates(1,3);
      map.get(obstacle1.coords).setContents(obstacle1);

      var entity3 = getMockEntity();
      entity3.coords = new SL.Coordinates(1,9);
      map.get(entity3.coords).setContents(entity3);

      var entity4 = getMockEntity();
      entity4.coords = new SL.Coordinates(9,1);
      map.get(entity4.coords).setContents(entity4);

      var obstacle2 = getMockEntity();
      obstacle2.coords = new SL.Coordinates(5,1);
      map.get(obstacle2.coords).setContents(obstacle2);

      assert( map.entitiesHaveLineOfSight(entity1, entity4) === false , "entity 1 & 4 should not have line of sight" );
      assert( map.entitiesHaveLineOfSight(entity1, entity3) === false , "entity 1 & 3 should not have line of sight" );
      assert( map.entitiesHaveLineOfSight(entity3, entity4) === true , "entity 3 & 4 should have line of sight" );
      done();
    });
  });
  describe("#getHeuristicProvider()", function(){
    it("should return a euclidean distance provider when distanceMetricForPathFinding is set to euclidean", function(done) {
      var map = getMap();
      map.distanceMetricForPathFinding = "euclidean";
      var hProvider = map._getHeuristicProvider();
      var node = new AStarNode( new SL.Coordinates(1,1), null, 0);
      var goal = new AStarNode( new SL.Coordinates(9,9), null, 0);
      var expected = ( Math.sqrt( Math.pow(node.element.x - goal.element.x, 2) + Math.pow(node.element.y - goal.element.y, 2))).toFixed(3);
      var hValue = hProvider.h(node, goal).toFixed(3);
      assert( expected === hValue , "Bad heuristic calculation. Expected: " + expected + "; actual: " + hValue );
      done();
    });
    it("should return a manhattan distance provider when distanceMetricForPathFinding is set to manhattan", function(done) {
      var map = getMap();
      map.distanceMetricForPathFinding = "manhattan";
      var hProvider = map._getHeuristicProvider();
      var node = new AStarNode( new SL.Coordinates(1,1), null, 0);
      var goal = new AStarNode( new SL.Coordinates(9,9), null, 0);
      var expected = ( Math.abs(node.element.x - goal.element.x) + Math.abs(node.element.y - goal.element.y)).toFixed(3);
      var hValue = hProvider.h(node, goal).toFixed(3);
      assert( expected === hValue , "Bad heuristic calculation. Expected: " + expected + "; actual: " + hValue );
      done();
    });
    it("should return a special manhattan distance provider when distanceMetricForPathFinding is set to specialmanhattan", function(done) {
      var map = getMap();
      map.distanceMetricForPathFinding = "specialmanhattan";
      var hProvider = map._getHeuristicProvider();
      var node = new AStarNode( new SL.Coordinates(1,1), null, 0);
      var goal = new AStarNode( new SL.Coordinates(9,9), null, 0);
      var xdiff = Math.abs(node.element.x - goal.element.x);
      var ydiff = Math.abs(node.element.y - goal.element.y);
      var expected = (xdiff > ydiff ? xdiff : ydiff ).toFixed(3);
      var hValue = hProvider.h(node, goal).toFixed(3);
      assert( expected === hValue , "Bad heuristic calculation. Expected: " + expected + "; actual: " + hValue );
      done();
    });
    it("should throw an exception when an Unrecognized distanceMetricForPathFinding is provided.", function(done) {
      var map = getMap();
      map.distanceMetricForPathFinding = "garbage";
      var hProvider;

      var threwIt = throwsException(function() {
        hProvider = map._getHeuristicProvider();
      });
      assert(threwIt === true, "did not throw exception when distanceMetricForPathFinding was garbage.");
      done();
    });
  });
  describe("#nodeListToCoordsList()", function() {
    it("should return a list of coordinates", function(done) {
      var map = getMap();
      var nodeList = [];
      var coords1 = new SL.Coordinates(1,1);
      nodeList.push(new AStarNode(coords1, null,0));
      var coords2 = new SL.Coordinates(2,1);
      nodeList.push(new AStarNode(coords2, null,0));
      var coords3 = new SL.Coordinates(2,2);
      nodeList.push(new AStarNode(coords3, null,0));
      var coordsList = map._nodeListToCoordsList(nodeList);
      assert(coordsList.length === 3, "wrong number of coords retrieved.");
      assert(coordsList[0] === coords1, "first coords were wrong (expected: " + coords1 + ", actual: " + coordsList[0] + ").");
      assert(coordsList[1] === coords2, "first coords were wrong (expected: " + coords2 + ", actual: " + coordsList[1] + ").");
      assert(coordsList[2] === coords3, "first coords were wrong (expected: " + coords3 + ", actual: " + coordsList[2] + ").");
      done();
    });
  });
  describe("#findPath()", function() {
    it("should return a simple path when allowDiagonalMovement is false", function(done){
      var map = getMap();
      var start = new SL.Coordinates(1,1);
      var end = new SL.Coordinates(3,3);
      var list = map.findPath(start, end);

      assert( list.length === 5 , "return the wrong number of coordinates" );
      assert( list[0].equals( start ), "start should have been the first coords in the list (expected:" + start +", actual: " + list[0] +")");
      assert( list[4].equals( end ), "end should have been the last coords in the list (expected:" + end +", actual: " + list[4] +")");
      done();
    });
    it("should return a simple path when allowDiagonalMovement is true", function(done){
      var map = getMap();
      map.allowDiagonalMovement = true;
      var start = new SL.Coordinates(1,1);
      var end = new SL.Coordinates(3,3);
      var list = map.findPath(start, end);

      assert( list.length === 3 , "return the wrong number of coordinates" );
      assert( list[0].equals( start ), "start should have been the first coords in the list (expected:" + start +", actual: " + list[0] +")");
      assert( list[2].equals( end ), "end should have been the last coords in the list (expected:" + end +", actual: " + list[3] +")");
      done();
    });
    it("should return a path when allowDiagonalMovement is false and some cells are not free", function(done){
      var map = getMap();
      var start = new SL.Coordinates(1,1);
      var end = new SL.Coordinates(3,3);
      var badCoords1 = new SL.Coordinates(1,2);
      var badCoords2 = new SL.Coordinates(2,1);

      var entity = getMockEntity();
      entity.coords = badCoords1;
      map.get(entity.coords).setContents(entity);

      entity = getMockEntity();
      entity.coords = badCoords2;
      map.get(entity.coords).setContents(entity);

      var list = map.findPath(start, end);

      assert( list.length === 7 , "returned the wrong number of coordinates" );
      assert( list[0].equals( start ), "start should have been the first coords in the list (expected:" + start +", actual: " + list[0] +")");
      assert( list[6].equals( end ), "end should have been the last coords in the list (expected:" + end +", actual: " + list[4] +")");
      for (var i = 1; i < 5; i++) {
        assert( !list[i].equals(badCoords1) && !list[1].equals(badCoords2), "bad path at list idx " + i + " (" + list[i] + ")");
      }

      done();
    });
    it("should return a path when allowDiagonalMovement is true and some cells are not free", function(done){
      var map = getMap();
      map.allowDiagonalMovement = true;
      var start = new SL.Coordinates(1,1);
      var end = new SL.Coordinates(3,3);
      var badCoords1 = new SL.Coordinates(1,2);
      var badCoords2 = new SL.Coordinates(2,1);
      var badCoords3 = new SL.Coordinates(2,2);

      var entity = getMockEntity();
      entity.coords = badCoords1;
      map.get(entity.coords).setContents(entity);

      entity = getMockEntity();
      entity.coords = badCoords2;
      map.get(entity.coords).setContents(entity);

      entity = getMockEntity();
      entity.coords = badCoords3;
      map.get(entity.coords).setContents(entity);

      var list = map.findPath(start, end);

      assert( list.length === 5 , "returned the wrong number of coordinates" );
      assert( list[0].equals( start ), "start should have been the first coords in the list (expected:" + start +", actual: " + list[0] +")");
      assert( list[4].equals( end ), "end should have been the last coords in the list (expected:" + end +", actual: " + list[4] +")");
      for (var i = 1; i < 4; i++) {
        assert( !list[i].equals(badCoords1) && !list[i].equals(badCoords2) && !list[i].equals(badCoords3), "bad path at list idx " + i + " (" + list[i] + ")");
      }

      done();
    });
    it("should return an incomplete path when no complete path is available", function(done){
      var map = getMap();
      var start = new SL.Coordinates(0,0);
      var end = new SL.Coordinates(3,3);
      var badCoords1 = new SL.Coordinates(1,0);
      var badCoords2 = new SL.Coordinates(0,1);

      var entity = getMockEntity();
      entity.coords = badCoords1;
      map.get(entity.coords).setContents(entity);

      entity = getMockEntity();
      entity.coords = badCoords2;
      map.get(entity.coords).setContents(entity);

      var list = map.findPath(start, end);

      assert( list.length === 1 , "should have a single set of coordinates" );
      assert( list[0].equals(start) , "the returned coordinates should have been the start coodrdinates" );
      done();
    });
    it("should return an incomplete path when the depthConstraint is hit before finding a complete path", function(done){
      var map = getMap();
      map.aStarDepthConstraint = 5;
      var start = new SL.Coordinates(0,0);
      var end = new SL.Coordinates(9,9);

      var list = map.findPath(start, end);
      var expectedMaxDepth = map.aStarDepthConstraint + 1;
      assert( list.length === expectedMaxDepth , "list should have length " + expectedMaxDepth );
      assert( list[0].equals(start) , "the first returned coordinates should have been the start coodrdinates" );
      done();
    });
    it("should return a complete path when the depthConstraint is set, but not reached", function(done){
      var map = getMap();
      map.aStarDepthConstraint = 6;
      var start = new SL.Coordinates(0,0);
      var end = new SL.Coordinates(2,2);

      var list = map.findPath(start, end);

      assert( list.length === 5 , "list should have length 5" );
      assert( list[0].equals(start) , "the first returned coordinates should have been the start coodrdinates" );
      assert( list[4].equals(end) , "the last returned coordinates should have been the end coodrdinates" );
      done();
    });
  });
  describe("#getCoordinatesInRange()", function(){
    it("should return coordinates in range 1 with diagonals", function(done){
      var map = getMap();
      map.allowDiagonalMovement = true;
      var coords = map.getCoordinatesInRange(new SL.Coordinates(4,4), 1, false);
      assert(coords.length === 8, "should have returned 8 sets of coordinates (returned " + coords.length +")");
      assert(coords[0].x === 4 && coords[0].y === 3, "0 coord should have been north of origin");
      assert(coords[1].x === 5 && coords[1].y === 3, "1 coord should have been northeast of origin");
      assert(coords[2].x === 5 && coords[2].y === 4, "2 coord should have been east of origin");
      assert(coords[3].x === 5 && coords[3].y === 5, "3 coord should have been southeast of origin");
      assert(coords[4].x === 4 && coords[4].y === 5, "4 coord should have been south of origin");
      assert(coords[5].x === 3 && coords[5].y === 5, "5 coord should have been southwest of origin");
      assert(coords[6].x === 3 && coords[6].y === 4, "6 coord should have been west of origin");
      assert(coords[7].x === 3 && coords[7].y === 3, "7 coord should have been northwest of origin");
      done();
    });
    it("should return coordinates in range 1 with no diagonals", function(done){
      var map = getMap();
      map.allowDiagonalMovement = false;
      var coords = map.getCoordinatesInRange(new SL.Coordinates(4,4), 1, false);
      assert(coords.length === 4, "should have returned 4 sets of coordinates (returned " + coords.length +")");
      assert(coords[0].x === 4 && coords[0].y === 3, "0 coord should have been north of origin");
      assert(coords[1].x === 5 && coords[1].y === 4, "1 coord should have been north of origin");
      assert(coords[2].x === 4 && coords[2].y === 5, "2 coord should have been north of origin");
      assert(coords[3].x === 3 && coords[3].y === 4, "3 coord should have been north of origin");
      done();
    });
    it("should return coordinates in range 2 with diagonals", function(done){
      var map = getMap();
      map.allowDiagonalMovement = true;
      var coords = map.getCoordinatesInRange(new SL.Coordinates(4,4), 2, false);
      assert(coords.length === 24, "should have returned 24 sets of coordinates (returned " + coords.length +")");
      done();
    });
    it("should return coordinates in range 3 with no diagonals", function(done){
      var map = getMap();
      map.allowDiagonalMovement = false;
      var coords = map.getCoordinatesInRange(new SL.Coordinates(4,4), 3, false);
      assert(coords.length === 24, "should have returned 24 sets of coordinates (returned " + coords.length +")");
      done();
    });
    it("should return coordinates in range excluding coordinates out of bounds", function(done){
      var map = getMap();
      map.allowDiagonalMovement = false;
      var coords = map.getCoordinatesInRange(new SL.Coordinates(0,0), 1, false);
      assert(coords.length === 2, "should have returned 2 sets of coordinates (returned " + coords.length +")");
      done();
    });
    it("should return origin if includeOrigin is true", function(done){
      var map = getMap();
      var origin = new SL.Coordinates(4,4);
      var coords = map.getCoordinatesInRange(origin, 0, true);
      assert(coords.length === 1, "should have returned origin");
      assert(coords[0].equals(origin), "should have returned the origin");
      done();
    });
    it("should not return origin if includeOrigin is false", function(done){
      var map = getMap();
      var coords = map.getCoordinatesInRange(new SL.Coordinates(4,4), 0, false);
      assert(coords.length === 0, "should not have returned any coordinates");
      done();
    });
    it("should return no coordinates when range is 0", function(done){
      var map = getMap();
      var coords = map.getCoordinatesInRange(new SL.Coordinates(4,4), 0, false);
      assert(coords.length === 0, "should not have returned any coordinates");
      done();
    });
  });
});
describe("GridMapNeighborProvider", function() {
  describe("#next()", function() {
    it("should produce 4 neighbors when allowDiagonalMovement is false and there are no neighboring entities", function(done){
      var map = getMap();
      map.allowDiagonalMovement = false;
      var coords = new SL.Coordinates(1,1);
      var node = new AStarNode(coords, null, 0);
      var np = new GridMapNeighborProvider(node, map);
      var neighbor, expected;
      neighbor = np.next();
      expected = new SL.Coordinates(1,0);
      assert( neighbor.element.equals(expected) , "first neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(2,1);
      assert( neighbor.element.equals(expected) , "second neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(1,2);
      assert( neighbor.element.equals(expected) , "third neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(0,1);
      assert( neighbor.element.equals(expected) , "fourth neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      assert( neighbor === null , "should have returned null ");
      done();
    });
    it("should produce 8 neighbors when allowDiagonalMovement is true and there are no neighboring entities", function(done){
      var map = getMap();
      map.allowDiagonalMovement = true;
      var coords = new SL.Coordinates(1,1);
      var node = new AStarNode(coords, null, 0);
      var np = new GridMapNeighborProvider(node, map);
      var neighbor, expected;
      neighbor = np.next();
      expected = new SL.Coordinates(1,0);
      assert( neighbor.element.equals(expected) , "first neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(2,0);
      assert( neighbor.element.equals(expected) , "2 neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(2,1);
      assert( neighbor.element.equals(expected) , "3 neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(2,2);
      assert( neighbor.element.equals(expected) , "4 neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(1,2);
      assert( neighbor.element.equals(expected) , "5 neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(0,2);
      assert( neighbor.element.equals(expected) , "6 neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(0,1);
      assert( neighbor.element.equals(expected) , "7 neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(0,0);
      assert( neighbor.element.equals(expected) , "8 neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      assert( neighbor === null , "should have returned null ");
      done();
    });
    it("should not return neighbors for cells that are not free.", function(done){
      var map = getMap();
      map.allowDiagonalMovement = true;
      var coords = new SL.Coordinates(0,0);
      var node = new AStarNode(coords, null, 0);
      var np = new GridMapNeighborProvider(node, map);
      var entity = getMockEntity();
      var cell = map.get(entity.coords);
      cell.setContents(entity);
      entity = getMockEntity();
      entity.coords = new SL.Coordinates(0,1);
      cell = map.get(entity.coords);
      cell.setContents(entity);

      var neighbor, expected;
      neighbor = np.next();
      expected = new SL.Coordinates(1,0);
      assert( neighbor.element.equals(expected) , "only neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      assert( neighbor === null , "should have been null." );
      done();
    });
  });

});
describe("GridMapNeighborProviderFactory", function() {
  describe("#getProvider()", function() {
    it("should return a GridMapNeighborProvider that stores the map", function(done){
      var map = getMap();
      map.allowDiagonalMovement = false;
      map.sanity = "sane";
      var factory  = new GridMapNeighborProviderFactory(map);
      assert(factory._map.sanity === "sane", "Factory had a different map");
      var coords = new SL.Coordinates(1,1);
      var node = new AStarNode(coords, null, 0);
      var np = factory.getProvider(node);
      var neighbor, expected;
      neighbor = np.next();
      expected = new SL.Coordinates(1,0);
      assert( neighbor.element.equals(expected) , "first neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(2,1);
      assert( neighbor.element.equals(expected) , "second neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(1,2);
      assert( neighbor.element.equals(expected) , "third neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      expected = new SL.Coordinates(0,1);
      assert( neighbor.element.equals(expected) , "fourth neighbor should be " + expected + " (was: " + neighbor.element + ")" );
      neighbor = np.next();
      assert( neighbor === null , "should have returned null ");
      done();
    });
  });
});

function getMap(width,height) {
  width = width || 10;
  height = height || 10;
  var gridCellFactory = new SL.DefaultGridCellFactory();
  var map = new SL.GridMap(width,height);
  map.initialize(gridCellFactory);
  return map;
}
