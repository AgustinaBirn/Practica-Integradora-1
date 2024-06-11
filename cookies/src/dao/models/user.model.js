import mongoose from "mongoose";

mongoose.pluralize(null);

const collection = "users";

const schema = new mongoose.Schema({
    // _user_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "users_index"},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    age: { type: Number, required: true },
    role: { type: String, enum: ["admin", "premium", "user"], default: "user" },
});


const model = mongoose.model(collection, schema);

export default model;