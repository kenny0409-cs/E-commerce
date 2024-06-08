import React from "react";
import MetaData from "../layout/MetaData";
import { useDispatch,useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCartItem, removeCartItem } from "../../redux/features/cartSlice";


const Cart = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItem } = useSelector((state) => state.cart);

    const increaseQty = (item, quantity) => {
        const newQty = quantity +1;

        if(newQty > item?.stock )
        {
            return;
        }
        setItemToCart(item, newQty);
    }

    const decreaseQty = (item, quantity) => {
        const newQty = quantity -1;

        if(newQty <= 0)
        {
            return;
        }
        setItemToCart(item, newQty);
    }

    const setItemToCart = (item, newQty) => {

        const cartItem = {
            product: item?.product,
            name: item?.name,
            price: item?.price,
            image: item?.image,
            stock: item?.stock,
            quantity: newQty,
        };

        dispatch(setCartItem(cartItem));
    }

    const removeCartItemHandler = (id) => {
        dispatch(removeCartItem(id));
    };

    const CheckoutHandler = () => {
        navigate("/shipping");
    };

    return (
        <>
      <MetaData title={"Your Cart"} />
      {cartItem?.length === 0 ? (
        <h2 className="mt-5">Your Cart is Empty</h2>
      ) : (
        <>
          <h2 className="mt-5">
            Your Cart: <b>{cartItem?.length} items</b>
          </h2>

          <div className="row d-flex justify-content-between">
            <div className="col-12 col-lg-8">
              {cartItem?.map((item) => (
                <>
                  <hr />
                  <div className="cart-item" data-key="product1">
                    <div className="row">
                      <div className="col-4 col-lg-3">
                        <img
                          src={item?.image}
                          alt="Laptop"
                          height="90"
                          width="115"
                        />
                      </div>
                      <div className="col-5 col-lg-3">
                        {/*Navigate back to the detail of the item from the cart*/}
                        <Link to={`/product/${item?.product}`}>
                          {" "}
                          {item?.name}{" "}
                        </Link>
                      </div>
                      <div className="col-4 col-lg-2 mt-4 mt-lg-0">
                        <p id="card_item_price">${item?.price}</p>
                      </div>
                      <div className="col-4 col-lg-3 mt-4 mt-lg-0">
                        <div className="stockCounter d-inline">
                          <span
                            className="btn btn-danger minus"
                            onClick={() => decreaseQty(item, item.quantity)}
                          >
                            {" "}
                            -{" "}
                          </span>
                          <input
                            type="number"
                            className="form-control count d-inline"
                            value={item?.quantity}
                            readonly
                          />
                          <span
                            className="btn btn-primary plus"
                            onClick={() => increaseQty(item, item.quantity)}
                          >
                            {" "}
                            +{" "}
                          </span>
                        </div>
                      </div>
                      <div className="col-4 col-lg-1 mt-4 mt-lg-0">
                        <i
                          id="delete_cart_item"
                          className="fa fa-trash btn btn-danger"
                          onClick={() => removeCartItemHandler(item?.product)}
                        ></i>
                      </div>
                    </div>
                  </div>
                  <hr />
                </>
              ))}
            </div>

            <div className="col-12 col-lg-3 my-4">
              <div id="order_summary">
                <h4>Order Summary</h4>
                <hr />
                <p>
                  Units:{" "}
                  <span className="order-summary-values">
                    {cartItem?.reduce((acc, item) => acc + item?.quantity, 0)}{" "}
                    (Units)
                  </span>
                </p>
                <p>
                  Est. total:{" "}
                  <span className="order-summary-values">
                    $
                    {cartItem
                      ?.reduce(
                        (acc, item) => acc + item?.quantity * item.price,
                        0
                      )
                      .toFixed(2)} {/*set it to only 2decimal*/}
                  </span>
                </p>
                <hr />
                <button id="checkout_btn" className="btn btn-primary w-100" onClick={CheckoutHandler}>
                  Check out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
    );
};

export default Cart;