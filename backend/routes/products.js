import express from "express";

import {createProductReview, deleteProduct, deleteProductReview, getProductById, getProductReview, getProducts, newProduct, updateProduct} from "../controllers/productControllers.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
const router = express.Router();

router.route("/products").get(getProducts);
router.route("/admin/products")
      .post( isAuthenticatedUser,authorizeRoles('admin'),newProduct);

router.route("/products/:id").get(getProductById);

router.route("/admin/products/:id")
      .put( isAuthenticatedUser,authorizeRoles('admin'), updateProduct);

router.route("/admin/products/:id")
      .delete( isAuthenticatedUser,authorizeRoles('admin'),deleteProduct);

router
      .route("/reviews")
      .get(isAuthenticatedUser, getProductReview)
      .put(isAuthenticatedUser,createProductReview);

router.route("/reviews").delete(isAuthenticatedUser,authorizeRoles("admin"), deleteProductReview);

export default router;