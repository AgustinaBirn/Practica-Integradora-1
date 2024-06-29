import cartsModel from "./models/carts.model.js";
import usersModel from "./models/user.model.js";
import productsModel from "./models/products.model.js"
import { ProductManager } from "./manager.mdb.js";


const manager = new ProductManager();

export class CartManager {
  constructor() {
    this.carts = [cartsModel];
  }

  async getCarts(limit) {

    // try{
    //   return await cartsModel.find()
    //   .populate({path:"_user_id", model: usersModel})
    //   .populate({path: "products._id", model: productsModel})
    //   .lean();
    // }catch(err){
    //   return err.message;
    // }
    try {

        let data = await cartsModel.find().lean();
        return limit === 0 ? this.carts : this.carts.slice(0, limit);
        } 
        
        catch (err) {
          console.log("Error al obtener los carritos", err);
          return {error: err.message};
        }
  }

  async getCartById(id) {

    try {
        const cartId = { _id : id};
        // const cartsDb = await cartsModel.findOne(cartId).lean();
        const cartsDb = await cartsModel.findOne(cartId).populate({path: "products._id", model: productModel}).lean();

          return cartsDb;

        } catch (err) {
          console.log("No se encontró el carrito", err);
          return [];
        }
  }

  async addCart(cart) {

    try {
        const newCart = await cartsModel.create(cart);
        console.log(newCart);
    } catch (err) {
        console.log("no se pudo crear el carrito", err);
    }
  }

  async addProductsToCart(cid, pid) {
    const productId = { _id : pid};
    const cartId = { _id : cid};
    
    const cart = await this.getCartById(cartId);

    try {

      const productInCart = cart.products.find(p => p._id.toString() === pid);
      let body;
      const options = {new: true};;

      if (productInCart) {
          // Incrementar la cantidad del producto existente
          body = { $set: { "products.$.quantity": productInCart.quantity + 1 } };
          const filter = { _id: cid, "products._id": pid };
          
          const updatedCart = await cartsModel.findOneAndUpdate(filter, body, options);
          if (updatedCart) {
            console.log("Producto actualizado en el carrito");
          }
        } else {
          // Añadir un nuevo producto al carrito
          body = { $push: { products: { _id: pid, quantity: 1 } } };
          
          const updatedCart = await cartsModel.findOneAndUpdate(cartId, body, options);
          if (updatedCart) {
              console.log("Producto añadido al carrito");
          }
      }  
    } catch (err) {
      console.log("no se pudo agregar el producto al carrito", err);
    }
  }

  async removeProductToCart(cid, pid) {

      const cartId = { _id: cid };

        try {
            const body = { $pull: { products: { _id: pid } } };
            const options = { new: true };

            const updatedCart = await cartsModel.findOneAndUpdate(cartId, body, options);

            if (updatedCart) {
                console.log("Producto eliminado del carrito");
            } else {
                console.log("Carrito no encontrado o producto no presente");
            }
        } catch (err) {
            console.log("No se pudo eliminar el producto del carrito", err);
        }
  }

  async removeAllProductsFromCart(cid) {
    const cartId = { _id: cid };

    try {
        const updateBody = { $set: { products: [] } };
        const options = { new: true };

        const updatedCart = await cartsModel.findOneAndUpdate(cartId, updateBody, options) ? console.log("Todos los productos han sido eliminados del carrito") : console.log("Carrito no encontrado");

    } catch (err) {
        console.log("No se pudieron eliminar los productos del carrito", err);
    }
}

async updateProducts(cid, pid, quantity) {
  const cartId = { _id : cid};
  
  const cart = await this.getCartById(cartId);

  try {

    const body = { $set: { "products.$.quantity": cart.products[0].quantity + quantity } };
    const options = {new: true};;
    const filter = { _id: cid, "products._id": pid };

    console.log(quantity);
    
    const productInCart = cart.products.find(p => p._id.toString() === pid) ? await cartsModel.findOneAndUpdate(filter, body, options) 
    : console.log("No se encontró el producto");

    console.log(cart.products[0].quantity);
  } catch (err) {
    console.log("no se pudo modificar el producto del carrito", err);
  }
}
}