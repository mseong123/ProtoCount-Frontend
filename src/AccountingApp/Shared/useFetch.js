import {useState,useEffect} from 'react'

/*a generic fetch hook for fetching all types of data. All known ERRORS occuring in APP, ExpressJS server and DB is handled and stored in 
data and error state below.  Handle the data and error response in the originating component itself. */
function useFetch(fetchParam) {
    const [param,changeParam]=useState(fetchParam);
    const [data,changeData] = useState(null);
    const [error,changeError]=useState(null);

    
    useEffect(()=>{
        
        if(param && param.url) {
            
            fetch(param.url,param.init).then(
                (response)=>{
                    if (!response.ok) {
                        //http error will be caught below in catch()
                        throw new Error('HTTP Error, status code = '+response.status + ',status = '+response.statusText)
                    } else {
                        //make sure all ExpressJS response is in object(application/json) and not text or any other format
                        return response.json();
                    }
                }
            ).then(
                response=>{
                    changeData(response);//DB related errors will be included in the response as response.error
                    
                    changeError(null)/* ***data and error state is mutually exclusive, reset the error state to null when resolved because
                    useFetch can be used multiple times within a component for different url and usage*/
                }
            ).catch(
                
                /*catch for 1) network error (as per fetch API spec which will resolve as reject) such as unresolved URL and
                ExpressJS server instance failure(can be caused by Async error in ExpressJS not caught by default error handlers in ExpressJS)
                2) above HTTP status errors. This will include synchronous errors caught and handled by default error handler in ExpressJS 
                (response status set to 500) and 3)catch all for internal logic error within fetch promise chain.
                DOESN'T INCLUDE DB RETURNED ERRORS-this is included in data above. */
                error=>{
                    changeError(error);
                    changeData(null)//reset data state to null when error happen. See above for reason***. 
                }
            )
            }
    },[param])

return [{data,error},changeParam];
}

export default useFetch;