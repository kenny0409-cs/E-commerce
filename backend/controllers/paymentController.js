import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Stripe from "stripe";
import Order from "../models/order.js";
import dotenv from "dotenv";



const stripe =Stripe(process.env.STRIPE_SECRET_KEY);
dotenv.config({path : "config.env"});
//Create stripe checkout session => /api/v1/payment/checkout_session
export const stripeCheckoutSession = catchAsyncErrors(async (req, res,next) => {
    
    const body =req?.body;
    const shipping_rate = body?.itemsPrice >=200 ? "shr_1PN67wL3yWPExgZB4jvfUcrA" : "shr_1PN68FL3yWPExgZBW1l7SlUS"
    const line_items= body?.orderItems?.map((item) => {
        return {
            price_data: {
                currency: "myr",
                product_data: {
                    name: item?.name,
                    images: [item?.image],
                    metadata: { productId: item?.product}, //setting metadata to set additional data to this product
                },
                unit_amount: item?.price * 100
            },
            tax_rates: ["txr_1PN7CAL3yWPExgZBwWzkubaA"],
            quantity: item?.quantity,
        };
    });
    console.log(line_items);
    
    const shippingInfo =body?.shippingInfo;

    const session =await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${process.env.FRONTEND_URL}/me/orders`,
        cancel_url: `${process.env.FRONTEND_URL}`,
        customer_email: req?.user?.email,
        client_reference_id: req?.user?._id?.toString(),
        mode: 'payment',
        metadata: {...shippingInfo, itemsPrice: body?.itemsPrice},//(...shippingInfo) meaning inside contains all the details that is store in shippingInfo array  
        shipping_options: [{
            shipping_rate,
        },],
        line_items,
    });

    console.log("=======================");
    console.log(session);
    res.status(200).json({
        url: session.url,
    });
});