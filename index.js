// Modules
const express = require("express");
const productRoute = require("./routes/product.route");
const connectDBandServer = require("./connections/connection"); //import DB connection function

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/products", productRoute);

app.get("/", (req, res) => {
  res.send("Hello from Node API Server");
});

// Connect to Database and Start Server
connectDBandServer(app);
