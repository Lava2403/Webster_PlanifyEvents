const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const hbs = require("hbs");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

// Import your Todo model
const Todo = require("./models/Todo");

// Import your login/signup model (assumed as "User")
const User = require("./models/User"); // Adjust to match your actual User model file

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "your-secret-key", // A random string for signing the session ID cookie
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to `true` if using HTTPS
  })
);

// Set up handlebars as the view engine
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/todoApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

/* --------- Login & Signup Routes --------- */

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "HomePage.html"));
});

// Render login and signup pages
app.get("/", (req, res) => {
  res.render("home", { userName: "Your Name", lists: [] });
});

app.get("/login", (req, res) => {
  const signupSuccess = req.query.signup === "success";
  res.render("login", { signupSuccess });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// Signup route
app.post("/signup", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    name: req.body.name,
    password: hashedPassword,
  });
  await user.save();
  res.redirect("/login?signup=success");
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (user) {
      const passwordMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (passwordMatch) {
        req.session.userId = user._id; // Store user ID in session
        req.session.name = user.name; // Store username in session
        res.redirect("/todo.html"); // Redirect to the To-Do page after login
      } else {
        res.render("login", { errorMessage: "Incorrect password" });
      }
    } else {
      res.render("login", { errorMessage: "No such user found" });
    }
  } catch (error) {
    res.render("login", {
      errorMessage: "An error occurred, please try again",
    });
  }
});

/* --------- To-Do List CRUD Routes --------- */

// Serve the to-do list page
app.get("/todo.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "todo.html"));
});

app.get("/api/check-auth", (req, res) => {
  if (req.session.userId) {
    res.status(200).send({ authenticated: true });
  } else {
    res.status(401).send({ authenticated: false });
  }
});

// Example backend (Node.js with Express)
app.get('/api/get-username', (req, res) => {
    if (req.session && req.session.name) {
      res.json({ name: req.session.name }); // Ensure it returns 'name'
    } else {
      res.status(401).send('Unauthorized');
    }
  });

// Create a new to-do
app.post("/api/todos", async (req, res) => {
  console.log(req.body);
  try {
    const newTodo = new Todo({
      title: req.body.title,
      description: req.body.description,
      deadline: req.body.deadline,
      completed: req.body.completed || false,
      tags: req.body.tags || [],
      priority: req.body.priority || "Medium", // Set default to "Medium" if not provided
    });
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all to-dos
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a to-do
app.put("/api/todos/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedTodo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a to-do
app.delete("/api/todos/:id", async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: "Todo deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* --------- Start the Server --------- */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
