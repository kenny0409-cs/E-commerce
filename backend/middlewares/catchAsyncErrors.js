export default (controllerFunction) => (req,res,next) => 
    Promise.resolve(controllerFunction(req,res,next)).catch(next);
 
//if there is an error, Promise will catch the error and pass it to the next middleware