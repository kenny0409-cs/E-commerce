import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Stripe from "stripe";
import Order from "../models/order.js";
import dotenv from "dotenv";

const stripe =Stripe(process.env.STRIPE_SECRET_KEY);
dotenv.config({path : "config.env"});

//Create stripe checkout session => /api/v1/payment/checkout_session
export const stripeCheckoutSession = catchAsyncErrors(async (req, res,next) => {
    
    const body =req?.body;
    const shipping_rate = body?.itemsPrice >=200 ? "shr_1PN59ML3yWPExgZBGUGxlzHK" : "shr_1PN59uL3yWPExgZBZvYt5m9w"
    const line_items= body?.orderItems?.map((item) => {
        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: item?.name,
                    images: [item?.image],
                    metadata: { productId: item?.product}, //setting metadata to set additional data to this product
                },
                unit_amount: item?.price * 100
            },
            tax_rates: ["txr_1PN5MfL3yWPExgZB9CR4MJf0"],
            quantity: item?.quantity,
        };
    });
    
    const shippingInfo =body?.shippingInfo;

    const session =await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${process.env.FRONTEND_URL}/me/orders?order_success=true`,
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

    res.status(200).json({
        url: session.url,
    });
});


const getOrderItems = async(line_items) => {
    return new Promise((resolve, reject) => {
        let cartItem = [];

        line_items?.data?.forEach(async (item) => {
            const product = await stripe.products.retrieve(item.price.product);
            const productId =product.metadata.productId;
            

            cartItem.push({
                product:productId,
                name: product.name,
                price: item.price.unit_amount_decimal /100,
                quantity: item.quantity,
                image: product.images[0],

            })

            if(cartItem.length === line_items?.data?.length){
                resolve(cartItem);
            }
        });
    });
};

//Create new order after payment => /api/v1/payment/webhook
export const StripeWebhook = catchAsyncErrors( async(req,res,next) => {
    try{
        
        const signature = req.headers["stripe-signature"];
        console.log(signature);
        const event= stripe.webhooks.constructEvent(req.rawBody,signature,process.env.STRIPE_WEBHOOK_SECRET);
        if(event.type === "checkout.session.completed")
        {

            const session = event.data.object;
            const line_items = await stripe.checkout.sessions.listLineItems(
                session.id
            );

            const orderItems = await getOrderItems(line_items);
            const user = session.client_reference_id; //getting the client who purchased the item 

            const totalAmount = session.amount_total /100; //getting the amount that the client has paid
            const taxAmount = session.total_details.amount_tax /100;
            const shippingAmount = session.total_details.amount_shipping/100;
            const itemsPrice = session.metadata.itemsPrice;

            const shippingInfo = {
                address: session.metadata.address,
                city: session.metadata.city,
                phoneNo: session.metadata.phoneNo,
                zipCode: session.metadata.zipCode,
                country: session.metadata.country,
            };

            const paymentInfo = {
                id: session.payment_intent,
                status: session.payment_status,
            }

            const orderData = {
                shippingInfo,
                orderItems,
                itemsPrice,
                taxAmount,
                shippingAmount,
                totalAmount,
                paymentInfo,
                paymentMethod: "Card",
                user,
            };

            await Order.create(orderData);

            res.status(200).json({success: true});
        }    
    }
    catch(error)
    {
        console.log(error);
    }
});
