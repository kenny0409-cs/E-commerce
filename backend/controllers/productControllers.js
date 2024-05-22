import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Product from "../models/product.js";
import ErrorHandler from "../utils/errorhandler.js";
import APIFilters from "../utils/apifilter.js";

//Get new Product => /api/v1/products
export const getProducts = catchAsyncErrors(async(req,res,next) =>{
    
    const maxresPerPage =4;
    const apiFilters= new APIFilters(Product, req.query).search().filters();
    console.log(req.query);
    console.log(req.params._id);
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
    const product = await Product.findById(req?.params?.id);

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

//Delete the product details => /api/v1/products/:id
export const deleteProduct =catchAsyncErrors(async(req,res) => {
    const product = await Product.findById(req?.params?.id);

    if(!product){
        return next(new ErrorHandler("Product Not Found", 404));
    }

     await Product.deleteOne();

    res.status(200).json({
        message : "Product deleted"
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
    const product = await Product.findById(req.query.id);

    if(!product)
    {
        return next(new ErrorHandler("the product is not found", 400));
    }    

    res.status(200).json({
        reviews: product.reviews,
    });
});

//delete product review => /api/v1/admin/review
export const deleteProductReview = catchAsyncErrors(async (req, res, next) => {
    console.log(req.query.productId);
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
