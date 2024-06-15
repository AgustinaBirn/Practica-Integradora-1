import express from "express";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import session from "express-session";
import FileStore from "session-file-store";
import MongoStore from "connect-mongo";
import passport from "passport";

import config from "./config.js";
import productsRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import viewsRoutes from "./routes/views.routes.js";
import messagesModel from "./dao/models/messages.model.js"
import cookieRouter from "./routes/cookies.routes.js"
import sessionRouter from "./routes/sessions.routes.js"

const app = express();
const fileStorage = FileStore(session);
// const messages = [];


const httpServer = app.listen(config.PORT, async () => {
  await mongoose.connect(config.MONGODB_URI);

  const socketServer = new Server(httpServer);
  app.set("socketServer", socketServer);

  socketServer.on("connection", async (socket) => {
    let messages = await messagesModel.find().lean();
    socket.emit("chatLog", messages);
    console.log(
      `Cliente conectado, id ${socket.id} desde ${socket.handshake.address}`
    );
    socket.on("newMessage", async (data) => {
  
      const newMessage = await messagesModel.insertMany( data);
      console.log(
        `Mensaje recibido desde ${socket.id}: ${data.user}, ${data.message}`
      );
      socketServer.emit("messageArrived", data);
    });
  });

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser(config.SECRET));

app.use(session({
  store: MongoStore.create({
    mongoUrl: config.MONGODB_URI,
    // mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    ttl: 15,
  }) ,
  store: new fileStorage(({ path: "./sessions", ttl: 100, retries: 0 })),
  secret: config.SECRET,
  resave: true,
  saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());

app.engine("handlebars", handlebars.engine());

app.set("views", `${config.DIRNAME}/views`);

app.set("view engine", "handlebars");

app.use("/", viewsRoutes);

app.use("/api/products", productsRoutes);

app.use("/api/carts", cartRoutes);

app.use("/api/cookies", cookieRouter);

app.use("/api/session", sessionRouter);

app.use("/static", express.static(`${config.DIRNAME}/public`));

  console.log(`Servidor activo en puerto ${config.PORT} enlazada a bbdd`);
});

// const socketServer = new Server(httpServer);
// app.set("socketServer", socketServer);
// // console.log(socketServer);


// socketServer.on("connection", async (socket) => {
//   let messages = await messagesModel.find().lean();
//   socket.emit("chatLog", messages);
//   console.log(
//     `Cliente conectado, id ${socket.id} desde ${socket.handshake.address}`
//   );
//   socket.on("newMessage", async (data) => {

//     const newMessage = await messagesModel.insertMany( data);
//     console.log(
//       `Mensaje recibido desde ${socket.id}: ${data.user}, ${data.message}`
//     );
//     socketServer.emit("messageArrived", data);
//   });
// });
