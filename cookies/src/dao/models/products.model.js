import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

mongoose.pluralize(null);

// const mongoose = require(mongoose);

// const mongoosePaginate = require(mongoose-paginate-v2);

const collection = "products";

const schema = new mongoose.Schema({
  title: { type: String, required: true, index: true },

  description: { type: String, required: false },

  price: { type: Number, required: true, index: true },

  thumbnail: { type: String, required: false },

  stock: { type: Number, required: true },

  state: { type: Boolean, required: true },

  category: { type: String, required: true, index: true },

  code: { type: String, required: true },

  // role: { type: String, enum: ["admin", "premium", "user"], default: "user" },
});

schema.plugin(mongoosePaginate);

const model = mongoose.model(collection, schema);

export default model;
