import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Order from "../models/order.js";
import ErrorHandler from "../utils/errorhandler.js";
import Product from "../models/product.js";
//create New Order => /api/v1/orders/new
export const newOrder = catchAsyncErrors(async (req,res,next) => {
    
    const {
        orderItems,
        shippingInfo,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentMethod,
        paymentInfo,
    } = req.body;

    //creating new order and save to databse
    const order = await Order.create({
        orderItems,
        shippingInfo,
        itemsPrice,
        taxAmount,
        shippingAmount,
        totalAmount,
        paymentMethod,
        paymentInfo,
        user: req.user._id,
    });

    res.status(200).json({
        message : "successfully created",
        order,
    });
});

//Get current user order => /api/v1/me/orders
export const getCurrentOrder = catchAsyncErrors(async(req,res,next) => {

    const order = await Order.find({user: req.user._id});

    if(!order)
    {
        return next(new ErrorHandler("Id not found", 404));
    }

    res.status(200).json({
        order,
    });
});


//Get order details => /api/v1/orders/:id
export const getOrderDetails = catchAsyncErrors(async (req,res,next) => {
    
    const order = await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler('No order found with this ID', 404));
    }

    res.status(200).json({
        order,
    });
});


//get all orders => /api/v1/admin/orders
export const allOrders = catchAsyncErrors(async(req,res,next) => {

    const order = await Order.find();

    res.status(200).json({
        order,
    });
});


// update order -ADMIN => /api/v1/admin/orders/:id
export const updateOrders = catchAsyncErrors(async(req,res,next)=> {

    const order = await Order.findById(req.params.id);

    if(!order)
    {
        return next(new ErrorHandler("Order ID not found",404));
    }
    
    if(order?.orderStatus === "Delivered"){
        return next(new ErrorHandler("You have already delivered this order", 400));
    }

    //update the store after the order is shipped or delivered
    order?.orderItems?.forEach(async(item) => {
        const product = await Product.findById(item?.product?.toString());
        product.stock -= item.quantity;
        await product.save({validateBeforeSave: false});
        item.adjusted = true;
    });
    order.orderStatus = req.body.status;
    order.deliveredAt = Date.now();

    await order.save();
    res.status(200).json({
        success : true,
    });
});

//Delete order => /api/v1/admin/orders/:id
export const deleteOrders = catchAsyncErrors(async(req,res,next) => {

    const order = await Order.findById(req.params.id);

    if(!order)
        {
            return next(new ErrorHandler("No Order found with this ID", 404));
        }

    await order.deleteOne();
    res.status(200).json({
        success : true,
        message : "Order Deleted",
    });
});
