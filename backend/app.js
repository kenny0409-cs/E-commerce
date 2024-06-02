
import express from "express";
const app = express();
import dotenv from "dotenv";
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/errors.js";
import cookieParser from "cookie-parser";

//Handled Uncaught Exception
process.on('uncaughtException', (err) => {
    console.log(`Error: ${err}`);
    console.log("Shutting down due to uncaught exception");
    process.exit(1);
});

dotenv.config({ path: "backend/config/config.env"});

//connecting to MongoDB
connectDatabase()

app.use(express.json({limit: "10mb"}));
app.use(cookieParser());
//import all routes
import productRoutes from "./routes/products.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import paymentRoutes from "./routes/payment.js";
app.use("/api/v1", productRoutes);
app.use("/api/v1",authRoutes);
app.use("/api/v1",orderRoutes );
app.use("/api/v1",paymentRoutes)

//Using error middleware
app.use(errorMiddleware);


const server =app.listen(process.env.PORT, ()=> {
    console.log(`Server started on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
});


process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err}`);
    console.log("Shutting down server due to Unhandled Promise Rejection");

});