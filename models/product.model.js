const mongoose = require("mongoose");

const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
  },

  quantity: {
    type: Number,
    default: 0,
  },

  price: {
    type: Number,
    required: [true, "Product price is required"],
  },

  image: {
    type: String,
    required: false,
  },
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
