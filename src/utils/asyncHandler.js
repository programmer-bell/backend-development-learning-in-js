 const asyncHandler =  (requestHandler) => {
    (request,response,next) => {
        Promise.resolve( requestHandler(request,response,next) ).
        catch( (error) => next(error) )
    }
}


export default asyncHandler;



