import productsModel from "../dao/models/products.model.js";

export class ProductManager {
  constructor() {
    this.products = [productsModel];
  }

  async getProducts(limit, page, query, sort) {

    try {
     
      let filter = {};
      if (query) {
        filter.category = query;
      }
      
      const options = {
        page: page,
        limit: limit,
        sort: { price: sort }
      };
      
      const products = await productsModel.paginate({}, {filter, options, lean: true});
      console.log(products);
      
      return products
      
     
     
      // if (limit === 0) {
      //     return await productsModel.find().lean();
      // } else {
      //     return await productsModel.paginate({}, { page: page, limit: limit, lean: true });
      // }
  } catch (err) {
      return err.message;
  };
    
    // try {

      // let filter = {};
      // if (query) {
      //   filter.category = query;
      // }
      
      // const options = {
      //   page: page,
      //   limit: limit,
      //   sort: { price: sort }
      // };
      
      // const products = await productsModel.paginate({}, filter, options, lean: true);
      // console.log(products);
      
      // return products
      
    // let data = await productsModel.find().lean();

    // // const prevLink = {prevLink : products.prevLink};

    // // const data = query ?
    // //  await productsModel.paginate({category: query}, {page: page, limit: limit, sort: {price : sort}}) 
    // //  : productsModel.find().lean();
    // //   await productsModel.aggregate([
    // //   {$match: {category: filter}},
    // //   {$group: {_id: "$title", totalPrice: {$sum: "$price" }}},
    // //   {$sort: {totalPrice: sort}}
    // //   ])

    // //   console.log(sort);
    //   return data;
    // } 
    
    // catch (err) {
    //   console.log("No se pudo leer el archivo", err);
    // }
  }

  async getProductById(id) {
    try {
    
    const productId = { _id : id};

    const productsDb = await productsModel.findOne(productId);

    return productsDb;

    } catch (err) {
      console.log("No se encontró el producto", err);
      return [];
    }
  }
  
  async addProduct(product) {
    if (
      !product.title ||
      !product.description ||
      !product.price ||
      !product.status ||
      !product.code ||
      !product.category ||
      !product.stock ) {
      console.log("Todos los campos son obligatorios.");
      }

      product.thumbnail ;
        
      try {
          const newProduct = await productsModel.findOne({code: product.code}) ? console.log("El código de producto ya existe.") : await productsModel.create(product);
          console.log(newProduct);
      } catch (err) {
        console.log("no se pudo agregar el producto", err);
      }
    }

  async updateProduct(filter, body, options) {
            
    try {
        const productsDb = await productsModel.findOneAndUpdate( filter, body, options );
        console.log(productsDb);
        console.log("Se actualizo el producto correctamente");
      } catch (err) {
        console.error("Error al actualizar el producto", err);
      }
  }

  async deleteProduct(id) {

      try {
        const process = await productsModel.findOneAndDelete(id);
        console.log("Se elimino correctamente el producto");
      } catch (err) {
        console.error("Error al eliminar el producto", err);
      }
  }
}