import React, { useEffect, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { MDBDataTable } from "mdbreact";
import { useDeleteReviewMutation, useLazyGetProductReviewQuery } from "../../redux/api/productsApi";
import toast from "react-hot-toast";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
const ProductReview = () => {

    const [productId, setProductId] = useState("");

    const [getProductReview, {isLoading, error,data}] = useLazyGetProductReviewQuery();

    const [ deleteReview, {error: deleteError, isLoading: isDeleteLoading, isSuccess}] = useDeleteReviewMutation();
    useEffect(() =>{
        if(error)
        {
            toast.error(error?.data?.message);
        }
        if(deleteError)
        {
            toast.error(deleteError?.data?.message);
        }
        if(isSuccess)
        {
            toast.success("Review Deleted");
        }
    }, [error,isSuccess,deleteError]);


    const submitHandler = (e) => {
        e.preventDefault();
        getProductReview(productId);
    }

    const deleteReviewHandler = (id) => {
        deleteReview({productId, id});
    }
    const setReviews = () => {
        const review = {
          columns: [
            {
              label: "ReviewId",
              field: "id",
              sort: "asc",
            },
            {
              label: "Rating",
              field: "rating",
              sort: "asc",
            },
            {
              label: "Comment",
              field: "comment",
              sort: "asc",
            },
            {
              label: "User",
              field: "user",
              sort: "asc",
            },
            {
              label: "Actions",
              field: "actions",
              sort: "asc",
            },
          ],
          rows: [],
        };

        data?.reviews?.forEach((reviews) => {
            review.rows.push({
              id: reviews?._id,
              rating: reviews?.rating,
              comment: reviews?.comment,
              user: reviews?.user?.name,
              actions: (
                <>
                  <button
                    className="btn btn-outline-danger ms-2"
                    onClick={() => deleteReviewHandler(reviews?._id)}
                    disabled={isDeleteLoading}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </>
              ),
            });
          });
      
          return review;
        };
    if (isLoading) return <Loader/>
    return(
        <AdminLayout>
            <MetaData title={"Product Review"}/>
                <div className="row justify-content-center my-5">
                    <div className="col-6">
                        <form onSubmit={submitHandler}>
                        <div className="mb-3">
                            <label for="productId_field" className="form-label">
                            Enter Product ID
                            </label>
                            <input
                            type="text"
                            id="productId_field"
                            className="form-control"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            />
                        </div>

                        <button
                            id="search_button"
                            type="submit"
                            className="btn btn-primary w-100 py-2"
                        >
                            SEARCH
                        </button>
                        </form>
                    </div>
                    </div>

                    {data?.reviews?.length >0 ? (
                        <MDBDataTable data=
                        {setReviews()} 
                        className="px-3"
                        bordered 
                        striped 
                        hover />
                    ) : (
                        <p className="mt-5 text-center">No Reviews</p>
                    )}
                    

        </AdminLayout>
    )
}

export default ProductReview;