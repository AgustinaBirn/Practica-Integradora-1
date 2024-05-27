import { Router } from "express";
import { ProductManager } from "../../product-manager/product-manager.js";
import { uploader } from "../uploader.js";
import productsModel from "../dao/models/products.model.js";

const middlewer = (req, res, next) => {
  console.log("Se procesa middlware");
  next();
};
const router = Router();

const manager = new ProductManager("../../product-manager/product-manager.js");

router.get("/", middlewer, async (req, res) => {
  const limit = +req.query.limit || 0;
  // const products = await manager.getProducts(limit);
  const productsDb = await productsModel.find().lean();
  res.status(200).send({ status: "1", payload: productsDb });
});

router.get("/:pid", async (req, res) => {
  // const productId = await manager.getProductById(pid);
  //   const productId = await manager.getProductById(+req.params.pid);

  const pid = req.params.pid;
  const productsDb = await productsModel.findOne({ _id: pid });

  res.status(200).send({ status: "1", payload: productsDb });
});

router.post("/", uploader.single("thumbnail"), async (req, res) => {
  const body = req.body;
  const socketServer = req.app.get("socketServer");
  const thumbnail = req.file.originalname;
  body.thumbnail = thumbnail;

  const productsDb = await productsModel.create(body);

  // const newProduct = await manager.addProduct(body);
  console.log(thumbnail);
  res.status(200).send({
    status: "1",
    payload: body,
  });
  socketServer.emit("newProduct", body);
});

router.put("/:id", async (req, res) => {
  // const { id } = req.params.id;
  // const nid = id;

  const filter = { _id : req.params.id};
  const body = req.body;
  const options = {new: true};

  const productsDb = await productsModel.findOneAndUpdate(
    filter,
    body, options
  );
  console.log(productsDb);

  res.status(200).send({
    status: "OK",
    payload: body,
  });
  

  // if (nid <= 0 || isNaN(nid)) {
  //   res.status(400).send({
  //     status: "ERROR",
  //     payload: {},
  //     error: "El id debe ser mayor a 0",
  //   });
  // }
  // ________________________________________

  // else if (!title || !price || !stock) {
  //   res.status(400).send({
  //     status: "ERROR",
  //     payload: {},
  //     error: "Debe completar los 3 campos: title, price, stock",
  //   });
  // }
// ___________________________________________

  // else {
  //   res.status(200).send({
  //     status: "1",
  //     payload: body,
  //   });

  //   const productsDb = await productsModel.findOneAndUpdate(
  //     { _id: nid },
  //     body, options
  //   );
  //   // manager.getProducts();
  //   // manager.updateProduct(nid, req.body);
  // }
});

router.delete("/:id", async (req, res) => {
  const nid = req.params.id;
  const socketServer = req.app.get("socketServer");

  res
      .status(200)
      .send({ origin: "server1", payload: `Desea elimininar el id: ${nid}` });
    // await manager.deleteProduct(nid);
    // const productDeleted = await manager.deleteProduct(nid);
    // const getProducts = await manager.getProducts();

    const process = await productsModel.findOneAndDelete({ _id: nid });
    socketServer.emit("productDeleted", process);

  // if (nid <= 0 || isNaN(nid)) {
  //   res.status(400).send({
  //     origin: "server1",
  //     payload: {},
  //     error: "El id debe ser mayor a 0",
  //   });
  // } else {
  //   res
  //     .status(200)
  //     .send({ origin: "server1", payload: `Desea elimininar el id: ${id}` });
  //   // await manager.deleteProduct(nid);
  //   // const productDeleted = await manager.deleteProduct(nid);
  //   // const getProducts = await manager.getProducts();

  //   const process = await productsModel.findOneAndDelete({ _id: nid });
  //   socketServer.emit("productDeleted", getProducts);
  // }
});

export default router;
