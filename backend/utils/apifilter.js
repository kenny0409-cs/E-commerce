class APIFilters{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword ? {
    // if there is a match with the keyword , find through the name
            name: {
                //search in the name of product not exactly match the product name
                $regex: this.queryStr.keyword,
                //case insensitive(ignoring alphabet or not)
                $options : 'i',
            },
        } : {}; //if not return back empty string
        this.query = this.query.find({...keyword});
        return this;
    }
    
    // creating a filter to handle keyword and find something else other than the keyword
    filters() {
        //get a copy of the querystring to be used later
        const queryCopy = {...this.queryStr};


        //Fields to remove
        const fieldsToRemove = ["keyword","page"];
        //remove the previous keyword field in the querycopy array
        fieldsToRemove.forEach((el) => delete queryCopy[el])
        
        
        //converting queryCopy into JSON string
        let queryStr = JSON.stringify(queryCopy);

        //parsing the string to replace the operate to correspond with MongoDB operator
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
        
        //filter the result(the new keyword)
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }


    pagination(resPerPage) {
        //the user select the page or it starts at default
        const currentPage = Number(this.queryStr.page) || 1; 
        //Calculate the index of the first result to retrieve
        const skip = resPerPage * (currentPage -1);

        //retrieve the result, skip => get the number of result
        this.query = this.query.limit(resPerPage).skip(skip);
        
        //return back to the pointer
        return this;
    }
}

    
export default APIFilters;