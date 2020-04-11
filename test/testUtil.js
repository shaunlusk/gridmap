export function assert(statement, desc) {
  if (statement) return true;
  throw "Fail: " + desc;
}

export function throwsException(callback) {
  var threwit = false;
  try {
    callback();
  } catch(e) {
    threwit = true;
  }
  return threwit;
}
