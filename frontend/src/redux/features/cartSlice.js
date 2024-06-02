import { createSlice } from "@reduxjs/toolkit";

const initialState = { //setting initial, so that it can be access in the redux console    
    // Initialize cartItem to an empty array or retrieve it from local storage
    cartItem: localStorage.getItem('cartItem') ? JSON.parse(localStorage.getItem("cartItem")) : [],

    shippingInfo: localStorage.getItem("shippingInfo")
        ? JSON.parse(localStorage.getItem("ShippingInfo")) : {},
};

// Create a slice for the cart using the createSlice function from @reduxjs/toolkit
export const cartSlice = createSlice({
    initialState,
    name: "cartSlice",
    reducers: {
        setCartItem: (state,action)=> {
            const item = action.payload;
            
            // Check if the item already exists in the cart
            const existItem = state.cartItem.find(
                (i) => i.product === item.product
            ); 
            
            if(existItem) //cannot add same product twice, we just have to update the value
            {
                state.cartItem = state.cartItem.map((i) => 
                    i.product === existItem.product ? item : i
                );
            }   
            else{
                state.cartItem = [...state.cartItem, item];
            }

            localStorage.setItem("cartItem", JSON.stringify(state.cartItem));
        },
        removeCartItem: (state, action) => {
            state.cartItem = state.cartItem?.filter(
                (i) => i.product !== action.payload // if the i.product(which is the id) is not equal to the payload
                //then it will not be added
            );

            localStorage.setItem("cartItem", JSON.stringify(state.cartItem));
        },
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
            
            localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
        },
    },
});

export default cartSlice.reducer;

export const {setCartItem, removeCartItem , saveShippingInfo} = cartSlice.actions;
//slice is the collection of reducer logic and then the actions