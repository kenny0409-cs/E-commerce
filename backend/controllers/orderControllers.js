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
    
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
      );

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

    let productNotFound = false;


    //update the stock after the order is shipped or delivered
    
    for(const item of order.orderItems)
    {
        const product = await Product.findById(item?.product?.toString());

        if(!product)
        {
            productNotFound = true;
            break;
        }
        product.stock -= item.quantity;
        await product.save({validateBeforeSave: false});

    }
    
    if(productNotFound)
        {
            return next(
                new ErrorHandler("No Product found with one or more ID's")
            );
        }
    
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


async function getSalesData(startDate, endDate) 
{
    //process multiple document and return computed results, basically meaning grouping it and send in a single result
    const salesData = await Order.aggregate([
        {
            //stage 1 - Filter results
            $match : { //find the order that is created between the startdate and the end date
                createdAt:{
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            },
        },
        {
            //Stage 2: Group Data by Date
            $group: {
                _id: {//get date by getting the formal of the date in string format
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },//get date from createdAt schema
                },
                totalSales: { $sum: "$totalAmount" }, //get the total amount of sales on that current date
                numOrders: { $sum: 1 }, // count the number of orders
              },
            },
        ]);

    //create a map to store sales data and num of order by data
    const salesMap = new Map();
    let totalSales = 0;
    let totalNumOrder = 0;
    salesData.forEach((entry) => {
        const date= entry?._id.date;
        const sales= entry?.totalSales;
        const numOrders = entry?.numOrders;
        //key is the date, and sales and numOrder are the value from the key 
        salesMap.set(date, { sales,numOrders});
        totalSales +=sales;
        totalNumOrder += numOrders;
    });
    //get all the dates that has order between the startDate and the endDate
    const datesBetween = getDatesBetween(startDate,endDate);

    //Create final sales data array and set 0 for dates without sales
    const finalSalesData = datesBetween.map((date) => ({
        date,
        //check if there is any sales or orders on that date, if dont have we put 0
        sales: (salesMap.get(date) || {sales: 0}).sales,
        numOrders: (salesMap.get(date) || {numOrders:0}).numOrders,
    }));
    
    return { salesData: finalSalesData, totalSales, totalNumOrder };
};

//get the dates between the two variable dates
function getDatesBetween(startDate,endDate)
{
    const data = []
    let currentDate = new Date(startDate);

    while(currentDate <=new Date(endDate))
        {
            const formattedDate = currentDate.toISOString().split("T")[0];
            data.push(formattedDate);
            currentDate.setDate(currentDate.getDate() +1);
        }

        return data;
}
//get Sales Data => /api/v1/admin/get_sales
export const getSales = catchAsyncErrors(async(req,res,next) => {

    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);

    startDate.setUTCHours(0,0,0,0);
    endDate.setUTCHours(23,59,59,999);

    const { salesData, totalSales, totalNumOrder } = await getSalesData(
        startDate,
        endDate
      );
    console.log(salesData);


      res.status(200).json({
        totalSales,
        totalNumOrder,
        sales: salesData,
      });
});


