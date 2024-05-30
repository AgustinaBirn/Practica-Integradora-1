import mongoose from "mongoose";
import productsModel from "./products.model.js"

mongoose.pluralize(null);

const collection = "carts";

const schema = new mongoose.Schema({
    // _user_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "users_index"},
  products: { type: [{_id: mongoose.Schema.Types.ObjectId, quantity: Number}], required: true, index: true}
});

schema.pre("find", function () {
    this.populate({path: "products._id", model: productsModel})
})

schema.pre("findOne", function () {
  this.populate({path: "products._id", model: productsModel})
})

const model = mongoose.model(collection, schema);

export default model;