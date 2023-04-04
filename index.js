// Import express.js framework
const express = require("express");

// Init express application
const app = express();

// Import favicon support
const favicon = require("serve-favicon");

// Import json file
const expensesData = require("./expenses.json");

// Set the view engine to ejs
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Use static files (styles, images, fonts)
app.use(express.static(__dirname + "/public"));

// Set faviocn for web application
app.use(favicon(__dirname + "/public/favicon.ico"));

// Use routes
app.use('/expenses', require('./routes/expenses'))

// Render index page
app.get("/", (req, res) => {
  res.render("index", {"title": "Nizomov", "page": "index"});
});

// Run application on 3000 port
app.listen(3000, () => console.log("Server started!"))