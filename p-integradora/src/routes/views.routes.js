import { Router } from "express";
import messagesModel from "../dao/models/messages.model.js";
import productsModel from "../dao/models/products.model.js";

import fs from "fs";

const router = Router();

// const route = "./products.json";
// const data = await fs.promises.readFile(route, "utf-8");
// const dataJson = JSON.parse(data);

// const dbMessages = await messagesModel.find().lean();
// const productsDb = await productsModel.find().lean();

router.get("/welcome", async (req, res) => {
  const user = { name: "Agustina" };

  res.render("index", user);
});

router.get("/realtimeproducts", async (req, res) => {
  const productsDb = await productsModel.find().lean();
  res.render("realTimeProducts", { data: productsDb });
});

router.get("/", async (req, res) => {
  const productsDb = await productsModel.find().lean();
  res.render("home", { data: productsDb });
});

router.get("/chat", async (req, res) => {
  const messagesDb = await messagesModel.find().lean();
  res.render("chat", {data : messagesDb});
});

export default router;
