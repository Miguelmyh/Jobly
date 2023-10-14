const { sqlForPartialUpdate } = require("./sql");
const request = require("supertest");
const { BadRequestError } = require("../expressError");

describe("update json body", () => {
  test("should propely return usable values for sql", () => {
    let { setCols, values } = sqlForPartialUpdate(
      {
        firstName: "John",
      },
      { firstName: "first_name" }
    );
    expect(setCols).toEqual('"first_name"=$1');
  });

  test("should throw no data error/emptykey error", () => {
    expect(() => {
      sqlForPartialUpdate({}, { firstName: "first_name" });
    }).toThrow("No data");

    // this tests for the Object.keys which would throw an error if invalid/null object
    expect(sqlForPartialUpdate).toThrow(
      "Cannot convert undefined or null to object"
    );
  });
});
