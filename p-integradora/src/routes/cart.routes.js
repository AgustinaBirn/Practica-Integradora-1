import { Router } from "express";
import { CartManager } from "../dao/cart.manager.mdb.js"; 

const router = Router();

const manager = new CartManager("../dao/cart.manager.mdb.js");

router.get("/", async (req, res) => {
  const limit = +req.query.limit || 0;
  const carts = await manager.getCarts(limit);
  res.status(200).send({ status: "1", payload: carts });
});

router.get("/:cid", async (req, res) => {
  const cid = req.params.cid;
  const cartId = await manager.getCartById(cid);
  res.status(200).send({ status: "1", payload: cartId });
});

router.post("/", async (req, res) => {
  req.body = { products: {}};
  const newCart = await manager.addCart(req.body);

  try {
    res.status(200).send({
      status: "1",
      payload: `Se agregó el carrito`,
    });
  } catch (err) {
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "No se agregó el carito",
      err,
    });
  }
});

router.post("/:cid/products/:pid", async (req, res) => {

  const cid = req.params.cid;
  const pid = req.params.pid;
  
  try {
    const newProduct = await manager.addProductsToCart(cid, pid);
    res.status(200).send({
      status: "1",
      payload: `Se agrego el producto número: ${pid}`,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "Error al agregar el producto"
    });
  }
});

router.put("/:cid/products/:pid/:quantity", async (req, res) => {

  const cid = req.params.cid;
  const pid = req.params.pid;
  const quantity = +req.params.quantity;
  
  try {
    const newProduct = await manager.updateProducts(cid, pid, quantity);
    res.status(200).send({
      status: "1",
      payload: `Se modificó el producto número: ${pid}`,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "Error al modificar el producto"
    });
  }
});

router.delete("/:cid/products/:pid", async (req, res) => {
  try {const cid = req.params.cid;
  const pid = req.params.pid;

  const cartId = await manager.removeProductToCart(cid, pid);
  res.status(200).send({ status: "1", payload: cartId })
} catch(err){
  console.log(err);
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "Error al eliminar el producto"
    });
}
});

router.delete("/:cid", async (req, res) => {
  try {const cid = req.params.cid;
  const pid = req.params.pid;

  const cartId = await manager.removeAllProductsFromCart(cid, pid);
  res.status(200).send({ status: "1", payload: cartId })
} catch(err){
  console.log(err);
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "Error al eliminar el producto"
    });
}
});

export default router;
