import { Router } from "express";
import { CartManager } from "../../cart-manager/cart-manager.js";

const router = Router();

const manager = new CartManager("../../product-manager/product-manager.js");

router.get("/", async (req, res) => {
  const limit = +req.query.limit || 0;
  const carts = await manager.getCarts(limit);
  res.status(200).send({ status: "1", payload: carts });
});

router.get("/:cid", async (req, res) => {
  const cid = +req.params.cid;
  const cartId = await manager.getCartById(cid);
  res.status(200).send({ status: "1", payload: cartId });
});

router.post("/", async (req, res) => {
  req.body = { products: [] };
  const newCart = await manager.addCart();

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

router.post("/:cid/product/:pid", async (req, res) => {
  const body = req.body;
  const cid = +req.params.cid;
  const pid = +req.params.pid;

  const newProduct = await manager.addProductsToCart(cid, pid);
  const { product = "", quantity = 1 } = req.body;

  try {
    res.status(200).send({
      status: "1",
      payload: `Se agrego el producto número: ${pid}`,
    });
  } catch (err) {
    res.status(400).send({
      status: "ERROR",
      payload: {},
      error: "Error al agregar el producto r",
    });
  }
});

export default router;
