/**
* @class For managing discrete points in 2d space.
* @param x {int} x coord
* @param y {int} y coord
*/
export default class Coordinates {
  constructor(x,y) {
    /** the x coordinate */
    this.x = x;
    /** the y coordinate */
    this.y = y;
  }

  /** check equality of these coordinates against another set
  * @param other {Coordinates} the other set of coordinates for comparison.
  * @return {boolean} true if coordinates match, false otherwise.
  */
  equals(other) {
    return this.x === other.x && this.y === other.y;
  }
  
  toString() {
    return this.x + "," + this.y;
  }

}