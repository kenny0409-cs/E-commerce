import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import CheckoutSteps from "./CheckoutSteps";
import { useSelector } from "react-redux";
import { calculateOrderCost } from "../../helpers/helpers";
import toast from "react-hot-toast";
import { useCreateNewOrderMutation, useStripeCheckoutSessionMutation} from "../../redux/api/orderApi";
import { useNavigate } from "react-router-dom";
const PaymentMethod = () => {

    const [method, setMethod] =useState("");
    const {shippingInfo, cartItem} = useSelector((state) => state.cart);
    const navigate = useNavigate();
    const [createNewOrder, { error, isSuccess}] = useCreateNewOrderMutation()
    const [stripeCheckoutSession , {data:checkoutData, error: checkoutError, isLoading}] =useStripeCheckoutSessionMutation();


    useEffect(() => {
        if(checkoutData){
           
            window.location.href =checkoutData?.url;
        }

        if(checkoutError)
        {
            toast.error(checkoutError?.data?.message);

        }
    }, [checkoutData, checkoutError]);


    useEffect(() => {
        if(error)
        {
            toast.error(error?.data?.message);
        }

        if (isSuccess) {
            navigate("/me/orders?order_success=true");
        }   
    }, [error, isSuccess]);


    const submitHandler = (e) => {
        e.preventDefault();


        const {itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice} = calculateOrderCost(cartItem);
        
        
            if(method === "Cash") {
            //Create Cash order
            const orderData = {
                shippingInfo,
                orderItems: cartItem,
                itemsPrice,
                shippingAmount: shippingPrice,
                taxAmount: taxPrice,
                totalAmount: totalPrice,
                paymentInfo: {
                    status: "Not Paid",
                },
                paymentMethod: "Cash",
            };
            createNewOrder(orderData);
        }

        if (method ==="Card"){
            //Stripe checkout
            const orderData = {
                shippingInfo,
                orderItems: cartItem,
                itemsPrice,
                shippingAmount: shippingPrice,
                taxAmount: taxPrice,
                totalAmount: totalPrice,
            };

            stripeCheckoutSession(orderData);
        }

    };

    return (
        <>
        <MetaData title={"Payment Method"} />
        <CheckoutSteps shipping confirmOrder payment />
        <div className="row wrapper">
            <div className="col-10 col-lg-5">
                <form
                className="shadow rounded bg-body"
                onSubmit={submitHandler}
                >
                <h2 className="mb-4">Select Payment Method</h2>

                <div className="form-check">
                    <input
                    className="form-check-input"
                    type="radio"
                    name="payment_mode"
                    id="codradio"
                    value="Cash"
                    onChange={(e) => setMethod("Cash")}
                    />
                    <label className="form-check-label" for="codradio">
                    Cash on Delivery
                    </label>
                </div>
                <div className="form-check">
                    <input
                    className="form-check-input"
                    type="radio"
                    name="payment_mode"
                    id="cardradio"
                    value="Card"
                    onChange={(e) => setMethod("Card")}
                    />
                    <label className="form-check-label" for="cardradio">
                    Card - VISA, MasterCard
                    </label>
                </div>

                <button id="shipping_btn" type="submit" className="btn py-2 w-100" disabled={isLoading}>
                    CONTINUE
                </button>
                </form>
            </div>
        </div>
        </>
    );
};

export default PaymentMethod;