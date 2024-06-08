import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorhandler.js";
import APIFilters from "../utils/apifilter.js";
import order from "../models/order.js";
import { delete_file,upload_file} from "../utils/cloudinary.js";

//Get new Product => /api/v1/products
export const getProducts = catchAsyncErrors(async(req,res,next) =>{
    
    const maxresPerPage =4;
    const apiFilters= new APIFilters(Product, req.query).search().filters();
    let products = await apiFilters.query;
    let filteredProductsCount = products.length;
    
    apiFilters.pagination(maxresPerPage);
    //using clone cause we have to run it for the second time 
    products = await apiFilters.query.clone();
    
    res.status(200).json({
        maxresPerPage,
        filteredProductsCount,
        products,
    });
});

//Create new Product => /api/v1/admin/products
export const newProduct = catchAsyncErrors(async (req, res) => {
    console.log(req.user._id);
    req.body.user =req.user._id;
    const product = await Product.create(req.body);
  
    res.status(200).json({
      product,
    });
  });


//getting the product based on id => /api/v1/products/:id
export const getProductById =catchAsyncErrors(async(req,res,next) => {
    const product = await Product.findById(req?.params?.id).populate("reviews.user");

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        product,
    });
});

//getting PRODUCTS - admin => /api/v1/admin/products
export const getAdminProducts =catchAsyncErrors(async(req,res,next) => {
    const product = await Product.find();

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        product,
    });
});


//update the product details => /api/v1/products/:id
export const updateProduct =catchAsyncErrors(async(req,res) => {
    let product = await Product.findById(req?.params?.id);

    if(!product){
       return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate(req?.params?.id, req.body, 
        {new: true});

    res.status(200).json({
        product,
    });
});

//Upload product image => /api/v1/products/:id/upload_images
export const updateProductImages =catchAsyncErrors(async(req,res) => {
    let product = await Product.findById(req?.params?.id);

    if(!product){
       return next(new ErrorHandler("Product not found", 404));
    }
    //Pass the image
    const uploader = async(image) => upload_file(image, "Shopit/products"); //upload picture to cloudinary folder
    
    //loop through all the images and pass the image one by one into the array function(uploader)
    const urls = await Promise.all((req?.body?.images).map(uploader));
    
    //update the product document by pushing image url to the image array in product model
    product?.images?.push(...urls);

    await product?.save();

    res.status(200).json({
        product,
    });
});

//Delete product image => /api/v1/products/:id/delete_images
export const deleteProductImages =catchAsyncErrors(async(req,res) => {
    let product = await Product.findById(req?.params?.id);
    if(!product){
       return next(new ErrorHandler("Product not found", 404));
    }

    const isDeleted = await delete_file(req.body.imgId);
    
    if(isDeleted)
        {
            product.images = product?.images?.filter(
                (img) => img.public_id !== req.body.imgId
            );
            await product?.save();
        }

    res.status(200).json({
        product,
    });
});


// Delete product   =>  /api/v1/products/:id
export const deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req?.params?.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  // Deleting image associated with product
  for (let i = 0; i < product?.images?.length; i++) {
    await delete_file(product?.images[i].public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    message: "Product Deleted",
  });
});


//create/update product review => /api/v1/review
export const createProductReview = catchAsyncErrors(async(req,res,next) => {
    
    const { rating, comment, productId} = req.body;

    const review = {
        user: req?.user?._id,
        rating: Number(rating),
        comment,
    };

    //find the productid
    const product = await Product.findById(productId);

    if(!product) {
        return next( new ErrorHandler("Product not found", 404));

    }

    // checks if the user has already left a review for the product
    const isReviewed = product?.reviews?.find(
        (r) => r.user.toString() === req?.user?._id.toString()
    );

    //if is reviewed, then we will update the comment and rating to the review
    if(isReviewed)
    {
        product.reviews.forEach((review) => {
            if(review?.user?.toString() === req?.user?._id.toString()) {
                review.comment =comment;
                review.rating = rating;
            }
        });
    }   
    else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    //calculate the rewiew in the product
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    //save the change in the product
    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success : true,
    });
});

//get product reviews => /api/v1/reviews
export const getProductReview = catchAsyncErrors(async(req,res,next)=> {
    
    //wait for the ID to be found in ProductSchema only return the value to the variable
    const product = await Product.findById(req.query.id).populate("reviews.user");

    if(!product)
    {
        return next(new ErrorHandler("the product is not found", 400));
    }    

    res.status(200).json({
        reviews: product.reviews,
    });
});

//delete product review => /api/v1/admin/reviews
export const deleteProductReview = catchAsyncErrors(async (req, res, next) => {
    
    let product = await Product.findById(req.query.productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    const reviews = product?.reviews?.filter(
      (review) => review._id.toString() !== req?.query?.id.toString()
    );
  
    const numOfReviews = reviews.length;
  
    const ratings =
      numOfReviews === 0
        ? 0
        : product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          numOfReviews;
  
    product = await Product.findByIdAndUpdate(
      req.query.productId,
      { reviews, numOfReviews, ratings },
      { new: true }
    );
  
    res.status(200).json({
      success: true,
      product,
    });
});

//Can user REVIEW => /api/v1/can_review
//set only for user that has purchased the item, only can write their review
export const canUserReview =catchAsyncErrors(async(req,res) => {
   
    const orders = await order.find({
        user: req.user,
        "orderItems.product": req.query.productId,
    });

    if(orders.length === 0)
    {
        return res.status(200).json({
            canReview: false,
        });
    }
    res.status(200).json({
        canReview: true,
    });
});
