var SL = SL || {};

/**
* @class For managing discrete points in 2d space.
* @param x {int} x coord
* @param y {int} y coord
*/
SL.Coordinates = function(x,y) {
  /** the x coordinate */
  this.x = x;
  /** the y coordinate */
  this.y = y;
};

/** check equality of these coordinates against another set
* @param other {Coordinates} the other set of coordinates for comparison.
* @return {boolean} true if coordinates match, false otherwise.
*/
SL.Coordinates.prototype.equals = function (other) {
  return this.x === other.x && this.y === other.y;
};
SL.Coordinates.prototype.toString = function() {
  return this.x + "," + this.y;
};
