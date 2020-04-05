function sortData(data,property,order) {
    let sort_order = 1;
    if(order === "desc") 
        sort_order = -1;
    
    return [...data].sort((a,b)=>
        sort_order*(a[property]+'').localeCompare((b[property]+''),'en',{numeric:true})
   )
}

/*
function sortDate(data,property,order) {
    let sort_order = 1;
    if(order === "desc") 
        sort_order = -1;

    return [...data].sort((a, b)=>{
        if(Date(a[property]) < Date(b[property]))
                return -1 * sort_order;
        
        else if( Date(a[property]) > Date(b[property]))
                return 1 * sort_order;
        
        else
                return 0 * sort_order;
        
    })
}
*/



export default sortData;


