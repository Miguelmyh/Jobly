const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.
/** receive and update structure of json data.
 * ex. data = {
 * 'firstName': 'John',
 * 'lastName': 'M'
 * 'isAdmin': "true"
 * },  The structure passed would throw an error as values on the table are defined differently.
 *
 * jsToSql set possible cases {'firstName': 'first_name'}
 * return updated value columns and values
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
