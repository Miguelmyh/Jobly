const request = require("supertest");

const db = require("../db");
const app = require("../app");
const { BadRequestError } = require("../expressError");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");
const Job = require("../models/job");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /jobs", function () {
  const newJob = {
    title: "anotha2",
    salary: 53,
    equity: 0.8,
    company_handle: "c1",
  };
  test("ok for admin users", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(201);
    expect(resp.body.job).toEqual({
      id: expect.any(Number),
      title: newJob.title,
      salary: newJob.salary,
      equity: `${newJob.equity}`,
      company_handle: newJob.company_handle,
    });
  });
  test("should fail for non admin auth", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body.error.message).toEqual("must be admin");
  });
  test("bad request with missing data", async () => {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "bad request",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

describe("GET /jobs", function () {
  const newJob = {
    title: "anotha2",
    salary: 53,
    equity: 0.8,
    company_handle: "c1",
  };
  test("should return all jobs", async () => {
    const resp = await request(app).get("/jobs");
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.jobs).toHaveLength(1);
  });
  test("should return filtered jobs", async function () {
    const job = await Job.create(newJob);
    const resp = await request(app).get("/jobs?title=anotha2");
    expect(resp.statusCode).toBe(200);
    expect(resp.body.jobs).toHaveLength(1);
    expect(resp.body.jobs[0]).toHaveProperty("title", "anotha2");
    expect(resp.body.jobs[0]).toHaveProperty("salary", 53);
  });

  test("should throw error", async () => {
    const resp = await request(app).get("/jobs?minSalary=hello");
    expect(resp.statusCode).toBe(400);
    expect(resp.body.error.message).toEqual("minSalary must be a valid number");
  });
});

describe("GET /jobs/:id", function () {
  const newJob = {
    title: "anotha2",
    salary: 53,
    equity: 0.8,
    company_handle: "c1",
  };
  test("should get job", async () => {
    const job = await Job.create(newJob);
    const resp = await request(app).get(`/jobs/${job.id}`);
    expect(resp.statusCode).toBe(200);
  });

  test("should return not found", async () => {
    const resp = await request(app).get(`/jobs/1234`);
    expect(resp.statusCode).toBe(404);
  });
});

describe("PATCH /jobs/:id", function () {
  const newJob = {
    title: "anotha2",
    salary: 53,
    equity: 0.8,
    company_handle: "c1",
  };
  test("should update job", async () => {
    const job = await Job.create(newJob);
    const resp = await request(app)
      .patch(`/jobs/${job.id}`)
      .send({
        title: "updated",
      })
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.statusCode).toBe(200);
    expect(resp.body.job).toHaveProperty("title", "updated");
  });
  test(" should throw an error(invalid non admin auth)", async () => {
    const job = await Job.create(newJob);
    const resp = await request(app).patch(`/jobs/${job.id}`).send({
      title: "updated",
    });
    expect(resp.body.error.message).toEqual("must be admin");
    expect(resp.statusCode).toBe(401);
  });

  test("should not find job", async () => {
    const resp = await request(app)
      .patch(`/jobs/1234`)
      .send({
        title: "updated",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(404);
  });

  test("should throw error invalid data", async function () {
    const job = await Job.create(newJob);
    const resp = await request(app)
      .patch(`/jobs/${job.id}`)
      .send({
        title: 123,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(400);
  });
  test("should throw error(id in req.body)", async function () {
    const job = await Job.create(newJob);
    const resp = await request(app)
      .patch(`/jobs/${job.id}`)
      .send({
        id: 123,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(400);
  });
});

describe("DELETE /jobs/:id", function () {
  const newJob = {
    title: "anotha2",
    salary: 53,
    equity: 0.8,
    company_handle: "c1",
  };
  test("should delete job", async () => {
    const job = await Job.create(newJob);
    const resp = await request(app)
      .delete(`/jobs/${job.id}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: `${job.id}` });
  });

  test("should return error (not valid admin)", async () => {
    const job = await Job.create(newJob);
    const resp = await request(app).delete(`/jobs/${job.id}`);
    expect(resp.statusCode).toBe(401);
  });
  test("should return error (not found job)", async () => {
    const job = await Job.create(newJob);
    const resp = await request(app)
      .delete(`/jobs/123`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toBe(404);
  });
});
