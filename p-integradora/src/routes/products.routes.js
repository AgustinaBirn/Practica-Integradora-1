import { Router } from "express";
// import { ProductManager } from "../../product-manager/product-manager.js";
import { uploader } from "../uploader.js";
import productsModel from "../dao/models/products.model.js";
import { ProductManager } from "../dao/manager.mdb.js";

const middlewer = (req, res, next) => {
  console.log("Se procesa middlware");
  next();
};
const router = Router();

const manager = new ProductManager("../dao/models/products.model.js");

router.get("/", middlewer, async (req, res) => {
  const limit = +req.query.limit || 10;
  const page = +req.query.page || 1;
  const query = req.query.query;
  const sort = +req.query.sort || 1;

  const products = await manager.getProducts(limit, page, query, sort);
  res.render("products", { 
    status: "success",
    payload: products.docs,
    totalDocs: products.totalDocs,
    limit: products.limit,
    page: products.page,
    totalPages: products.totalPages,
    hasNextPage: products.hasNextPage,
    hasPrevPage: products.hasPrevPage,
    nextPage: products.nextPage,
    prevPage: products.prevPage,
    prevLink: products.prevLink,
    nextLink: products.nextLink
  });
  console.log(products);
  
  res.status(200).send({ status: "1", payload: products });
});

router.get("/:pid", async (req, res) => {
  
  const pid = req.params.pid;
  const productId = await manager.getProductById(pid);

  res.status(200).send({ status: "1", payload: productId });
});

router.post("/", uploader.single("thumbnail"), async (req, res) => {
  const body = req.body;
  const socketServer = req.app.get("socketServer");
  const thumbnail = req.file;
  console.log(thumbnail);
  body.thumbnail = thumbnail.originalname;

  const newProduct = await manager.addProduct(body);

  res.status(200).send({
    status: "1",
    payload: body,
  });

  socketServer.emit("newProduct", body);
  
});

router.put("/:id", async (req, res) => {

  const filter = { _id : req.params.id};
  const body = req.body;
  const options = {new: true};

  const productsDb = await manager.updateProduct( filter, body, options );
  console.log(productsDb);

  res.status(200).send({
    status: "OK",
    payload: body,
  });
});

router.delete("/:id", async (req, res) => {
  const socketServer = req.app.get("socketServer");
  const id = { _id : req.params.id};

  res
      .status(200)
      .send({ origin: "server1", payload: `Desea elimininar el id: ${id}` });
    
    const process = await manager.deleteProduct(id);
    socketServer.emit("productDeleted", process);
});

export default router;
