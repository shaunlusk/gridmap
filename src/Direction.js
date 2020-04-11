import Coordinates from './Coordinates';

/** Stores Direction constants.
<ul>
<li>Direction.NORTH</li>
<li>Direction.NORTHEAST</li>
<li>Direction.EAST</li>
<li>Direction.SOUTHEAST</li>
<li>Direction.SOUTH</li>
<li>Direction.SOUTHWEST</li>
<li>Direction.WEST</li>
<li>Direction.NORTHWEST</li>
</ul>
* The Direction.ordinal(Direction) function returns the index number of the specified Direction. <br />
* You may iterate over all Direction values using the Direction.values array.<br />
* internally, Direction values are stored as short string codes, e.g. "N" for NORTH, etc.<br />
 */
const Direction = {
  "values" : ["N","NE","E","SE","S","SW","W","NW"],
  "NORTH" : "N",
  "NORTHEAST" : "NE",
  "EAST" : "E",
  "SOUTHEAST" : "SE",
  "SOUTH" : "S",
  "SOUTHWEST" : "SW",
  "WEST" : "W",
  "NORTHWEST" : "NW",

  ordinal : function(dir) {
    for (var i = 0; i < this.values.length; i++) {
      if (dir === this.values[i]) return i;
    }
    return -1;
  },

  isDiagonal : function(dir) {
    if (dir === "NE" ||
      dir === "SE" ||
      dir === "SW" ||
      dir === "NW"
    ) return true;
    return false;
  },

  offsets : [
    new Coordinates(0,-1),
    new Coordinates(1,-1),
    new Coordinates(1,0),
    new Coordinates(1,1),
    new Coordinates(0,1),
    new Coordinates(-1,1),
    new Coordinates(-1,0),
    new Coordinates(-1,-1)
  ]
};

export default Direction;
