/**
* @class Used by the {@link GridMap GridMap}.  Represents a cell on the map.
* @param contents {GridMapEntity} An entity to occupy the cell.  Null is an acceptable value.
*/
export default class GridCell {
  constructor(contents) {
    this._contents = contents === undefined ? null : contents;
  }

  /** Get the Entity in this cell or null if none.
  * @return {GridMapEntity} The entity in this cell or null.
  */
  getContents() { return this._contents; }

  /** Set the Entity in this cell.  Will overwrite existing contents.
  * @param entity {GridMapEntity} The entity to put in this cell.
  */
  setContents(entity) {this._contents = entity;}

  /** Return whether there is an entity in this cell.
  * @return {boolean} True if contents is null, false otherwise.
  */
  isFree() {	return this._contents === null;	}

}
