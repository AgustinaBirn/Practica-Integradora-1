import userModel from "./models/user.model.js";
// import { ProductManager } from "./manager.mdb.js";


// const manager = new ProductManager();

export class UserManager {
  constructor() {
    this.users = [userModel];
  }

  async getUsers() {

    try {

        let data = await userModel.find().lean();
        this.users = data;
        // return limit === 0 ? this.carts : this.carts.slice(0, limit);
        } 
        
        catch (err) {
          console.log("Error al obtener los usuarios", err);
          return [];
        }
  }

  async getUserById(id) {

    try {
        const userId = { _id : id};
        // const cartsDb = await cartsModel.findOne(cartId).lean();
        const userDb = await userModel.findOne(userId).populate({path: "user._id", model: userModel}).lean();

          return userDb;

        } catch (err) {
          console.log("No se encontró el usuario", err);
          return [];
        }
  }


  async findUserByEmail(email) {
    try {
      const user = await userModel.findOne({ email }).lean();
      return user;
    } catch (err) {
      console.log('No se encontró el usuario', err);
      return null;
    }
  }


//   async findUser(email) {

//     try {
//         // const userEmail = { email : email};
//         // const cartsDb = await cartsModel.findOne(cartId).lean();
//         const userDb = await userModel.findOne({email}).lean();
//         console.log(userDb);
//           return userDb;

//         } catch (err) {
//           console.log("No se encontró el usuario", err);
//           return [];
//         }
//   }

  async addUser(user) {

    try {
        const newUser = await userModel.create(user);
        console.log(newUser);
    } catch (err) {
        console.log("no se pudo agregar el usuario", err);
    }
  }

// async updateUser(uid, property) {
//   const userId = { _id : uid};
  
//   const user = await this.getUserById(userId);

//   try {

//     const body = { $set: { "products.$.quantity": cart.products[0].quantity + quantity } };
//     const options = {new: true};;
//     const filter = { _id: uid, "user._id": uid };

//     console.log(quantity);
    
//     const productInCart = cart.products.find(p => p._id.toString() === pid) ? await cartsModel.findOneAndUpdate(filter, body, options) 
//     : console.log("No se encontró el producto");

//     console.log(cart.products[0].quantity);
//   } catch (err) {
//     console.log("no se pudo modificar el producto del carrito", err);
//   }
// }
}