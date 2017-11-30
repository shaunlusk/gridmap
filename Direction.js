var SL = SL || {};

/** Stores SL.Direction constants.
<ul>
<li>SL.Direction.NORTH</li>
<li>SL.Direction.NORTHEAST</li>
<li>SL.Direction.EAST</li>
<li>SL.Direction.SOUTHEAST</li>
<li>SL.Direction.SOUTH</li>
<li>SL.Direction.SOUTHWEST</li>
<li>SL.Direction.WEST</li>
<li>SL.Direction.NORTHWEST</li>
</ul>
* The SL.Direction.ordinal(SL.Direction) function returns the index number of the specified SL.Direction. <br />
* You may iterate over all SL.Direction values using the SL.Direction.values array.<br />
* internally, SL.Direction values are stored as short string codes, e.g. "N" for NORTH, etc.<br />
 */
SL.Direction = {
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
    new SL.Coordinates(0,-1),
    new SL.Coordinates(1,-1),
    new SL.Coordinates(1,0),
    new SL.Coordinates(1,1),
    new SL.Coordinates(0,1),
    new SL.Coordinates(-1,1),
    new SL.Coordinates(-1,0),
    new SL.Coordinates(-1,-1)
  ]
};
