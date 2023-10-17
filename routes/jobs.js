const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobsSearchSchema = require("../schemas/jobsSearch.json");
const jobsNewSchema = require("../schemas/jobsNew.json");
const jobsUpdateSchema = require("../schemas/jobsUpdate.json");

const router = express.Router();

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobsNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    let { ...queries } = req.query;
    if (queries.minSalary) {
      queries.minSalary = +queries.minSalary;
    }
    if (queries.hasEquity) {
      queries.hasEquity = JSON.parse(queries.hasEquity);
    }
    if (queries.minSalary !== undefined) {
      if (isNaN(queries.minSalary)) {
        throw new BadRequestError("minSalary must be a valid number");
      }
    }

    const validate = jsonschema.validate(queries, jobsSearchSchema);
    if (!validate) {
      const errors = validate.errors.map((err) => err.stack);
      throw new BadRequestError(errors);
    }

    const jobs = await Job.findAll(queries);
    return res.json({ jobs });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const job = await Job.find(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    if (req.body.id) {
      throw new BadRequestError("id can't be edited");
    }
    const validator = jsonschema.validate(req.body, jobsUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
