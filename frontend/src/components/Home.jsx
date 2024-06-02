import React, {useEffect} from "react";
import MetaData from "./layout/MetaData";
import { useGetProductsQuery } from "../redux/api/productsApi";
import ProductItem from "./product/ProductItem";
import Loader from "./layout/Loader";
import toast from "react-hot-toast";
import CustomPagination from "./layout/CustomPagination";
import { useSearchParams } from "react-router-dom";
import Filters from "./layout/Filters";
const Home = () => {
  
  //sending the correspond page number to the backend
  let [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  //localhost::port/keyword?=""
  //getting the keyword insert by user
  const keyword = searchParams.get("keyword") || "";
  
  const min = searchParams.get("min");
  const max = searchParams.get("max");
  const category = searchParams.get("category");
  const ratings = searchParams.get("ratings");

  const params = {page, keyword};

  min !== null && (params.min = min);
  max !== null && (params.max = max);
  category !== null && (params.category =category);
  ratings !== null && (params.ratings = ratings);

  const columnSize = keyword ? 4 :3;
  const { data, isLoading, error, isError } = useGetProductsQuery(params);

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message);
    }
  }, [isError]);

  if (isLoading) return <Loader />;  
  return (
    <>
      <MetaData title={"Buy Best Products Online"} />
      <div className="row">
        {/* if keyword is being insert and the items are there,
          it will give 3 col to the filter 
          and 9 col to the product
        */}
      {keyword && (
          <div className="col-6 col-md-3 mt-5">
            <Filters />
          </div>
        )}
        <div className={keyword ? " col-6 col-md-9" : "col-6 col-md-12"}>
          <h1 id="products_heading" className="text-secondary">
           {keyword ?  `${data?.products?.length} Products found with keyword: ${keyword} ` : "Latest Products"}
          </h1>

          <section id="products" className="mt-5">
            <div className="row">
              {data?.products?.map((product) => (
                <ProductItem product={product} columnSize={columnSize} />
              ))}
            </div>
          </section>

          <CustomPagination
            maxresPerPage={data?.maxresPerPage}
            filteredProductsCount={data?.filteredProductsCount}
          />
  
        </div>
      </div>
    </>
  );
};

export default Home;