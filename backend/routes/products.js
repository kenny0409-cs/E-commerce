import express from "express";

import {canUserReview, createProductReview, deleteProduct, deleteProductImages, deleteProductReview, getAdminProducts, getProductById, getProductReview, getProducts, newProduct, updateProduct, updateProductImages} from "../controllers/productControllers.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
const router = express.Router();

router.route("/products").get(getProducts);
router.route("/admin/products")
      .post( isAuthenticatedUser,authorizeRoles('admin'),newProduct)
      .get(isAuthenticatedUser,authorizeRoles('admin'), getAdminProducts);

router.route("/products/:id").get(getProductById);

router.route("/admin/products/:id/upload_images").put(isAuthenticatedUser,authorizeRoles('admin'), updateProductImages);

router.route("/admin/products/:id/delete_images").put(isAuthenticatedUser,authorizeRoles('admin'), deleteProductImages);

router.route("/admin/products/:id")
      .put( isAuthenticatedUser,authorizeRoles('admin'), updateProduct);

router.route("/admin/products/:id")
      .delete( isAuthenticatedUser,authorizeRoles('admin'),deleteProduct);

router
      .route("/reviews")
      .get(isAuthenticatedUser, getProductReview)
      .put(isAuthenticatedUser,createProductReview);

router.route("/admin/reviews").delete(isAuthenticatedUser,authorizeRoles("admin"), deleteProductReview);

router.route("/can_review").get(isAuthenticatedUser, canUserReview);

export default router;