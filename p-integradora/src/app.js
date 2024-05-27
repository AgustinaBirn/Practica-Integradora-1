import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from "socket.io";

import config from "./config.js";
import productsRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import viewsRoutes from "./routes/views.routes.js";
import messagesModel from "./dao/models/messages.model.js"

const app = express();
// const messages = [];

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", handlebars.engine());

app.set("views", `${config.DIRNAME}/views`);

app.set("view engine", "handlebars");

app.use("/", viewsRoutes);

app.use("/api/products", productsRoutes);

app.use("/api/carts", cartRoutes);

app.use("/static", express.static(`${config.DIRNAME}/public`));

const httpServer = app.listen(config.PORT, async () => {
  await mongoose.connect(config.MONGODB_URI);
  console.log(`Servidor activo en puerto ${config.PORT} enlazada a bbdd`);
});

const socketServer = new Server(httpServer);
app.set("socketServer", socketServer);
// console.log(socketServer);


socketServer.on("connection", async (socket) => {
  let messages = await messagesModel.find().lean();
  socket.emit("chatLog", messages);
  console.log(
    `Cliente conectado, id ${socket.id} desde ${socket.handshake.address}`
  );
  socket.on("newMessage", async (data) => {
    // messages.push(data);

    const newMessage = await messagesModel.insertMany( data);
    console.log(
      `Mensaje recibido desde ${socket.id}: ${data.user}, ${data.message}`
    );
    socketServer.emit("messageArrived", data);
  });
});
