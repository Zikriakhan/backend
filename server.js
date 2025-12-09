const express = require("express");
const cors = require("cors");
const categoriesData = require("./db/categories.json");
const coursesData = require("./db/courses.json");
const institutesData = require("./db/institutes.json");
const subsData = require("./db/subscriptions.json");
const dbCoursesData = require("./db/courses_db.json");
const productsData = require("./db/products.json");

const app = express();
app.use(cors());
app.use(express.json());

// Welcome Route
app.get("/", (req, res) => {
  res.send("API is working on Vercel!");
});

// Categories Route
app.get("/categories", (req, res) => {
  res.json(categoriesData);
});

// Courses Route
app.get("/courses", (req, res) => {
  res.json(coursesData);
});

// Single Course
app.get("/courses/:id", (req, res) => {
  const course = coursesData.find(c => c.id === parseInt(req.params.id));
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }
  res.json(course);
});

// Institutes Route
app.get("/institutes", (req, res) => {
  res.json(institutesData);
});

// Subscriptions Route
app.get("/subscriptions", (req, res) => {
  res.json(subsData);
});

// DB Courses Route
app.get("/dbcourses", (req, res) => {
  res.json(dbCoursesData);
});

// Products Route
app.get("/products", (req, res) => {
  res.json(productsData);
});

// ⭐ IMPORTANT: Export app for Vercel (NO app.listen)
module.exports = app;
