// File system
const fs = require("fs");

// Init express
const express = require("express");

// Validation
const { check, validationResult } = require("express-validator")

// Init router
const router = express.Router();

// Uniqueid module
const uniqid = require("uniqid");

// Monthes
const MONTHS = ["January", "February", "March", "Aptril", "May", "June", "July", "August", "September", "October", "Novemeber", "December"];

// Format date
function formatDate(data) {
  let result = data
                  .split(/[\s,]+/)
                  .map(item => {
                    if (MONTHS.indexOf(item) !== -1) {
                      return MONTHS.indexOf(item) + 1
                    } else {
                      return item
                    }
                  })
                  .join("/")

  return result;
}

function formatCreatingDate(data) {
  let dateValue = data.split("/");
  dateValue = dateValue.map((dateItem, index) => {
    if (index === 0) return dateItem + " ";
    else if (index === 1) return MONTHS[dateItem - 1] + ", ";
    else return dateItem;
  })
  dateValue = dateValue.join("");

  return dateValue;
}

function formatCreatingVendorName(data) {
  let vendorNameValue = data[0].toUpperCase() + data.slice(1).toLowerCase();

  return vendorNameValue
}

function formatCreatingVendorTags(data) {
  return data
    .split(",")
    .filter(tag => {
      tag = tag.trim()
      if (tag.length) return tag
    })
    .map(tag => {
      return tag[0].toUpperCase() + tag.slice(1).toLowerCase()
    })
    .join(" | ");
}

function formatCreatingPrice(data) {
  return parseInt(data)
}

// Init
router.get("/", (req, res) => {
  res.render("expenses", { expenses: getAll(), "title": "Nizomov | Expenses", "page": "expenses" })
})

// Create
router.route("/create")
  // Get method
  .get((req, res) => {
    res.render("create-expense", { "expenses": getAll(), "expense": {}, "updating": false, "title": "Nizomov | Create expense", "page": "create-expense" });
  })
  // Post method
  .post([
    check("date", "Does not exist")
      .exists(),
    check("date", "Wrong format")
      .matches(/^[0-3][0-9]\/[0-1][0-9]\/[0-9]{4}/),
    check("vendor-name", "Does not exist")
      .exists(),
    check("vendor-name", "Too short")
      .isLength({ min: 3, max: 16 }),
    check("vendor-tags", "Does not exist")
      .exists(),
    check("price", "Does not exist")
      .exists(),
    check("price", "Wrong format")
      .isInt()
  ], (req, res) => {
    // Check the validates inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get data
    let expenses = getAll();

    // Format data
    let dateValue = formatCreatingDate(req.body.date);
    let vendorName = formatCreatingVendorName(req.body["vendor-name"]);
    let vendorTags = formatCreatingVendorTags(req.body["vendor-tags"]);
    let price = formatCreatingPrice(req.body.price);

    // Add data to array
    expenses.push({
      id: uniqid(),
      date: dateValue,
      vendor: {
        name: vendorName,
        tags: vendorTags
      },
      price: price
    });

    // Sort data
    expenses.sort((a, b) => {
      let aPriority = b.date.split(/[\s,]+/);
      let bPriority = a.date.split(/[\s,]+/);

      if (aPriority[2] > bPriority[2]){
        return 1;
      } else if (aPriority[2] === bPriority[2]) {
        if (MONTHS.indexOf(aPriority[1]) > MONTHS.indexOf(bPriority[1])) {
          return 1;
        } else if (MONTHS.indexOf(aPriority[1]) === MONTHS.indexOf(bPriority[1])) {
          if (aPriority[0] > bPriority[0]) {
            return 1;
          } else if (aPriority[0] === bPriority[0]) {
            return 0;
          } else {
            return -1;
          }
        } else {
          return -1;
        }
      } else {
        return -1;
      }
    })

    // Save data
    saveAll(expenses);

    // Redirect to main page
    res.redirect("/expenses");
  })

// Delete expense via id
router.delete("/delete", (req, res) => {
  // Take and filter all expenses
  let expenses = getAll()
  let filteredExpenses = expenses.filter(expense => req.body.id !== expense.id)

  // Save everything to local json
  saveAll(filteredExpenses)

  // Send result back
  res.json({ deleted: true })
})

// Update the expense data
router.route("/update/:id")
  .get((req, res) => {
      let id = req.params.id
      let expense = getAll().find(expense => expense.id == id)
      expense.date = formatDate(expense.date);
      expense.vendor.tags = expense.vendor.tags.split(" | ").join(", ")
      res.render("create-expense", { "expense": expense, "updating": true, "title": "Nizomov | Update expense", "page": "create-expense" })
  })
  .put((req, res) => {
      // Expense
      let id = req.params.id
      let expenses = getAll()
      let expense = expenses.find(expense => expense.id == id)
      let idx = expenses.indexOf(expense)
      
      // Fill form value
      expenses[idx].date = formatCreatingDate(req.body.data.date);
      expenses[idx].vendor.name = formatCreatingVendorName(req.body.data["vendor-name"]);
      expenses[idx].vendor.tags = formatCreatingVendorTags(req.body.data["vendor-tags"]);
      expenses[idx].price = formatCreatingPrice(req.body.data.price);

      // Save all
      saveAll(expenses)

      // Send respond
      res.json({ updated: true })
  })

// Export router
module.exports = router;

// Get all expenses
function getAll() {
  return JSON.parse(fs.readFileSync("./expenses.json"))
}

// Save all expenses
function saveAll(data) {
  fs.writeFileSync("./expenses.json", JSON.stringify(data));
}