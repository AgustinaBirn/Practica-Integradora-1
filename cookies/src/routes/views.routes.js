import { Router } from "express";
import messagesModel from "../dao/models/messages.model.js";
import productsModel from "../dao/models/products.model.js";
import { ProductManager } from "../dao/manager.mdb.js";
import { CartManager } from "../dao/cart.manager.mdb.js";
import cartsModel from "../dao/models/carts.model.js"


import fs from "fs";

const router = Router();
const productManager = new ProductManager("../dao/models/products.model.js");
const cartManager = new CartManager("../dao/cart.manager.mdb.js");

router.get("/products", async (req, res) => {
  const limit = +req.query.limit || 10;
  const page = +req.query.page || 1;
  const query = req.query.query;
  const sort = +req.query.sort || 1;

  let products;
  if(query){
    products = await productsModel.paginate({category: query}, {page: page, limit: limit, sort: {price : sort}});
  } else {
    products = await productsModel.paginate({}, {page: page, limit: limit, sort: {price : sort}});
  }

  products = products.docs

  if(req.session.user){
    const firstName = req.session.user.firstName;
    const lastName  = req.session.user.lastName;
  }

  // const products = await productManager.getProducts(limit, page, query, sort);
  console.log("PRODUCTS :", products.docs);
  res.render("home", {products});
});

router.get("/carts/:cid", async (req, res) => {
  const cid = req.params.cid;
  const cart = await cartManager.getCartById(cid);
  
  res.render("cartId", {data : cart});
});

router.get("/welcome", async (req, res) => {
  const user = { name: "Agustina" };

  res.render("index", user);
});

router.get("/realtimeproducts", async (req, res) => {
  const limit = +req.query.limit || 10;
  const page = +req.query.page || 1;
  const query = req.query.query;
  const sort = +req.query.sort || 1;

  const products = await productManager.getProducts(limit, page, query, sort);
  console.log(products);
  res.render("realTimeProducts", { data: products });
});

router.get("/", async (req, res) => {
  const productsDb = await productManager.getProducts();
  res.render("home", { data: productsDb });
});

router.get("/chat", async (req, res) => {
  const messagesDb = await messagesModel.find().lean();
  res.render("chat", {data : messagesDb});
});

router.get("/register", (req, res) => {
  res.render("register", {})
});

router.get("/login", (req, res) => {
  if(req.session.user) return res.redirect("/profile");
  res.render("login", {});
});

router.get("/profile", (req, res) => {
  console.log("pasa por profile", req.session.user);
  if(!req.session.user) return res.redirect("/pplogin");
  res.render("profile", {user: req.session.user});
});

// router.get("/logout", (req, res) => {
//   res.render("logout")
// })

export default router;
