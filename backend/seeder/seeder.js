import mongoose from "mongoose";
import products from "./data.js";
import Product from "../models/product.js";
const seedProducts  = async () => {
    try {
        await mongoose.connect("mongodb+srv://wolfteam22341:latios123@shopit.3l7w7dm.mongodb.net/shopit?retryWrites=true&w=majority&appName=shopit");

        await Product.deleteMany();
        console.log('Products are deleted');
    
        await Product.insertMany(products);
        console.log("Products are added");
    
        process.exit();
    } catch(error){
        console.log(error.message);
        process.exit();
    }
};

seedProducts();