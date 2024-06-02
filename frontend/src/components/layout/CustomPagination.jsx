import React, { useEffect,useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import Pagination from "react-js-pagination";



const CustomPagination = ({maxresPerPage, filteredProductsCount}) => {
    
    const [currentPage, setCurrentPage] = useState();

    let [searchParams] = useSearchParams();
    
    //navigate the user to a specific URL
    const navigate = useNavigate();
    
    //get page number
    const page = Number(searchParams.get("page")) || 1;
    
    useEffect(() => {
        setCurrentPage(page);
    }, [page]);

    const setCurrentPageNo = (pageNumber) => {
        setCurrentPage(pageNumber)
        //if page is there, we will update the value
        if(searchParams.has("page")){
            searchParams.set("page",pageNumber);
        } 
        //else, we will add a new value
        else{
            searchParams.append("page",pageNumber);
        }
        //redicrect the user back to the path
        const path = window.location.pathname + "?" + searchParams.toString();
        navigate(path);
    };
    
    return (
    <div className="d-flex justify-content-center my-5">
        {filteredProductsCount > maxresPerPage && (
        <Pagination
          activePage={currentPage}
          itemsCountPerPage={maxresPerPage}
          totalItemsCount={filteredProductsCount}
          onChange={setCurrentPageNo}
          nextPageText={"Next"}
          prevPageText={"Prev"}
          firstPageText={"First"}
          lastPageText={"Last"}
          itemClass="page-item"
          linkClass="page-link"
        />
      )}
    </div>
  );
};


export default CustomPagination;