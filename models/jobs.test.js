const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const { request } = require("express");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const newJob = {
  title: "anotha1",
  salary: 50,
  equity: 0.8,
  company_handle: "c1",
};

describe("checks for CREATE()", function () {
  test("creates job returns data values", async () => {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "anotha1",
      salary: 50,
      equity: "0.8",
      company_handle: "c1",
    });
  });

  test("should have value on db", async () => {
    let job = await Job.create(newJob);
    let dbJob = await Job.find(job.id);
    expect(dbJob).toHaveProperty("title", "anotha1");
  });
});

describe("checks for findAll", () => {
  test("should return all jobs", async () => {
    const jobAdded = await Job.create(newJob);
    const resp = await Job.findAll();
    expect(resp).toHaveLength(2);
    expect(resp[0]).toHaveProperty("title", "anotha1");
  });
  test("should return filtered results", async () => {
    const jobAdded = await Job.create(newJob);
    const resp = await Job.findAll({ title: "anotha1" });
    expect(resp).toHaveLength(1);
    expect(resp[0]).toHaveProperty("salary", 50);
  });
});

describe("checks for update function", () => {
  test("should update job", async () => {
    const jobAdded = await Job.create(newJob);
    let data = { title: "updated" };
    const resp = await Job.update(jobAdded.id, data);
    expect(resp).toHaveProperty("title", "updated");
    const job = await Job.find(jobAdded.id);
    expect(job).toBeDefined();
    expect(job.title).toEqual("updated");
  });

  test("should throw an error", async () => {
    try {
      let data = { title: "updated" };
      await Job.update("some invalid id", data);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });
});

describe("checks for removal of job", () => {
  test("should remove job", async () => {
    const jobAdded = await Job.create(newJob);
    let jobs = await Job.findAll();
    expect(jobs).toHaveLength(2);
    await Job.remove(jobAdded.id);
    jobs = await Job.findAll();
    expect(jobs).toHaveLength(1);
  });
  test("should not remove a job", async () => {
    try {
      await Job.remove();
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
    }
  });
});
