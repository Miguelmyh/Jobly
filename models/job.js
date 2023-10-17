const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class Job {
  /** Job model
   *
   * should receive title, salary, equity and company_handle
   * should return new job data => [id,title, salary, equity,company_handle]
   *
   *   */
  static async create({ title, salary, equity, company_handle }) {
    const existing = await db.query(`SELECT id FROM jobs WHERE title =$1`, [
      title,
    ]);
    if (existing.rows[0]) {
      throw new BadRequestError(`Duplicate company: ${title}`);
    }

    const resp = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES 
    ($1, $2, $3, $4) RETURNING *`,
      [title, salary, equity, company_handle]
    );
    return resp.rows[0];
  }

  //will find all jobs that follow filters(if any)
  // return object data

  static async findAll(arr = {}) {
    let companiesQuery = `SELECT title, salary, equity, company_handle
FROM jobs`;

    const { title, minSalary, hasEquity } = arr;
    let addOn = [];
    let values = [];
    //check if not null for every arg
    if (minSalary) {
      values.push(minSalary);
      addOn.push(`num_employees >= $${values.length}`);
    }
    if (hasEquity) {
      values.push(hasEquity);
      addOn.push(`num_employees <= $${values.length}`);
    }
    if (title) {
      values.push(`%${title}%`);
      addOn.push(`title ILIKE $${values.length}`);
    }

    if (addOn.length > 0) {
      companiesQuery += " WHERE " + addOn.join(" AND ");
    }
    companiesQuery += " ORDER BY title";

    console.log(companiesQuery);
    const companiesRes = await db.query(companiesQuery, values);
    return companiesRes.rows;
  }

  static async find(id) {
    const resp = await db.query(`SELECT * FROM jobs WHERE id =$1`, [id]);
    if (!resp.rows[0]) {
      throw new NotFoundError(`no job with the id:${id}`);
    }
    return resp.rows[0];
  }
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      companyHandle: "company_handle",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs SET ${setCols}
    WHERE id = ${idVarIdx} RETURNING *`;

    const result = await db.query(querySql, [...values, id]);
    if (!result.rows[0]) {
      throw new NotFoundError(`No Job ${id}`);
    }
    return result.rows[0];
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);
  }
}

module.exports = Job;
