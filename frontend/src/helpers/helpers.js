

export const getPriceQueryParams = (searchParams, key, value)=> {
  
    const hasValueInParam = searchParams.has(key);
    //if the value is presented and is in the params
    // update the key with the value
    if(value && hasValueInParam) {
        searchParams.set(key,value);
    }
    else if(value)
    {
        searchParams.append(key, value);
    }
    else if(hasValueInParam)
    {
            searchParams.delete(key);
    }

    return searchParams;
};

export const calculateOrderCost = (cartItem) => {
    const itemsPrice = cartItem?.reduce(
        (acc, item) => acc + item.price* item.quantity,
        0
    );
    //determine whether the shipping price is more than 200 or not
    //if less than 200, provide 25 shipping fee
    const shippingPrice = itemsPrice > 200 ? 0 : 25;

    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));

    const totalPrice = (itemsPrice + shippingPrice + taxPrice).toFixed(2);

    return {
        itemsPrice: Number(itemsPrice).toFixed(2),
        shippingPrice,
        taxPrice,
        totalPrice,
    };

};