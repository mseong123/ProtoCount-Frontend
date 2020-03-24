import React,{useState,useEffect,useContext} from 'react';
import {useHistory} from 'react-router-dom';
import useFetch from './useFetch'
import authContext from './authContext';
import {sort} from './sort';



function Process(props) {
    /*this is a reusable component for all process components (i.e. StockItemMaintenance.js,DeliveryOrder.js). Contains state logic 
    for fetching DB select data usinguseFetch hook) and filtering the fetched data*/
        const [{data:dataSelect,error:errorSelect},changeParamSelect]=useFetch({
            url:'./SelectItem',
            init:{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({item:props.item}),
                credentials:'include'
                }
            });
        const [{data:dataDelete,error:errorDelete},changeParamDelete]=useFetch(null);
        const [filteredData,changeFilteredData] = useState(null)
        const {changeAuth} = useContext(authContext);
        const [search,changeSearch] = useState('');
        const [searchCriteria,changeSearchCriteria] = useState('');
        const [itemsToBeDeleted,changeItemsToBeDeleted] = useState([]);
        const [errorDeleteDisplay,changeErrorDeleteDisplay] = useState(null);
        
        const history=useHistory();
        
    //sanitize and filter initial DB dataSelect.data and dataSelect.field returned from fetch
    useEffect(()=>{
        if (dataSelect && dataSelect.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!')
                changeAuth(false)
            }
        else if (dataSelect)
            changeFilteredData({
                data:dataSelect.data? dataSelect.data.map(data=>Object.assign({},data,{selected:true})):null,
                field: dataSelect.field? dataSelect.field.map(field=>field.name):null,
                error:dataSelect.error
            })
        
        },[dataSelect,errorSelect])
    
    useEffect(()=>{
        if (dataDelete && dataDelete.auth===false) {
            alert('Cookies Expired or Authorisation invalid. Please Login again!');
            changeAuth(false);
        }
        else if (dataDelete && !dataDelete.error && !errorDelete) {
            alert('Delete Successful!');
            changeErrorDeleteDisplay(null)
            changeItemsToBeDeleted([]);
            filteredData.data.forEach(data=>{
                document.getElementById(data[props.item.toUpperCase()+'_NUM']).checked=false;
            });
            changeParamSelect({
                url:'./SelectItem',
                init:{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({item:props.item}),
                    credentials:'include'
                    }
                })
        }
        else if ((dataDelete && dataDelete.error) || errorDelete) {
            changeErrorDeleteDisplay(
                (<div className="alert alert-warning">
                    {dataDelete && dataDelete.error? 'DELETE failed errno: '+dataDelete.error.errno+' code: '
                     +dataDelete.error.code+' message: '+dataDelete.error.sqlMessage:null}
                    {errorDelete? 'DELETE failed: '+errorDelete : null} 
                </div>)
            )
            
        }
    },[dataDelete,errorDelete])

    function searchCriteriaChange(e) {
        changeSearchCriteria(e.target.value);
    }
    function searchChange(e) {
        if (filteredData && filteredData.data) {
        const newData=filteredData.data.map(data=>{
            if (e.target.value!=='') {
                if (new RegExp(e.target.value,'g').test(data[searchCriteria])) {
                    return Object.assign({},data,{selected:true})
                }
                else {
                    return Object.assign({},data,{selected:false})
                } 
            } else return Object.assign({},data,{selected:true})
        })
        changeFilteredData({
            data:newData,
            field:filteredData.field,
            error:filteredData.error
        });
        }
        changeSearch(e.target.value);
    }
    
    function refresh() {
        changeErrorDeleteDisplay(null);
        changeItemsToBeDeleted([]);
            filteredData.data.forEach(data=>{
                document.getElementById(data[props.item.toUpperCase()+'_NUM']).checked=false;
            });
        changeParamSelect({
            url:'./SelectItem',
            init:{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({item:props.item}),
                credentials:'include'
                }
            })
        }

    function deleteList() {
        if(window.confirm('Confirm Delete?'))  
        changeParamDelete({
            url:'./DeleteItem',
            init:{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    item:props.item,
                    id:itemsToBeDeleted
                }),
                credentials:'include'
            }
        })
    
    }
    
    function onItemClick(data){
        if(data)   
            history.push('./'+props.createItemPath+'?item='+props.item+'&id='+data[props.item.toUpperCase()+'_NUM'])
        else 
            history.push('./'+props.createItemPath)
    }

        let searchCriteriaList;
        let fieldList;
        let dataList;
        let result;
        if (filteredData && filteredData.field) {
            searchCriteriaList=filteredData.field.map(field=>(
                <option key={field} value={field}>{field.replace(/_/g,' ')}</option>
                )
            )
            fieldList=filteredData.field.map(field=>(
                <th key={field} style={{}} style={{cursor:'pointer'}} className='text-nowrap' data-order='asc'
                onClick={(e)=>{
                    e.target.setAttribute('data-order',e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                    changeFilteredData({...filteredData,
                        data:sort(filteredData.data,field,e.target.getAttribute('data-order'))
                    })

                    if (e.target.getAttribute('data-order')==='asc') {
                        document.getElementById(field.replace(/_/g,' ')).classList.remove('fa-caret-up');
                        document.getElementById(field.replace(/_/g,' ')).classList.add('fa-caret-down')
                    }
                    else {
                        document.getElementById(field.replace(/_/g,' ')).classList.remove('fa-caret-down');
                        document.getElementById(field.replace(/_/g,' ')).classList.add('fa-caret-up')
                    }
                        
                    }}>
                    {field.replace(/_/g,' ')}<i id={field.replace(/_/g,' ')} className='fa fa-caret-down ml-2'></i>
                </th>
            ))
        }
        

        if (filteredData && filteredData.data) {
        dataList=filteredData.data.map((data,i)=>{
            if(data.selected) {
                return (
                    <tr key={data[props.item.toUpperCase()+'_NUM']}>
                        <td className='align-baseline'>
                            <input type='checkbox' id={data[props.item.toUpperCase()+'_NUM']} onChange={(e)=>{
                                const targetPosition = itemsToBeDeleted.indexOf(data[props.item.toUpperCase()+'_NUM'])
                                if (e.target.checked) 
                                    changeItemsToBeDeleted(
                                        [...itemsToBeDeleted,data[props.item.toUpperCase()+'_NUM']]
                                    )
                                else {
                                    if(targetPosition!==-1) 
                                        changeItemsToBeDeleted(
                                            [...itemsToBeDeleted.slice(0,targetPosition),
                                                ...itemsToBeDeleted.slice(targetPosition+1)])
                                }
                            }}/>
                            
                        </td>
                        <td className='align-baseline'>
                            <button className='btn btn-dark ' 
                                onClick={()=>/*closure in effect here*/onItemClick(data)}>
                                View
                            </button>
                        </td>
                        {filteredData && filteredData.field? filteredData.field.map(field=>{
                            {/*use Math.random cos filteredData.data[field] might have repeated null values or same cell value in same tr 
                            and hence duplicate keys*/}
                            return (<td className='text-nowrap align-baseline' key={Math.random()}>{data[field]}</td>)
                        }):null}
                    </tr>)
                    }
                    
                return null;
            });
        }
        
        
        if (filteredData && !filteredData.error && !errorSelect) 
            result=
            (
            <div className='overflow-auto'style={{transform:'rotateX(180deg)'}}>
                <table id='table' className='table table-bordered table-hover' 
            style={{transform:'rotateX(180deg)'}}>
                        <thead>
                            <tr>
                                <th className='text-nowrap'><input type='checkbox' onChange={(e)=>{
                                    if (e.target.checked) {
                                        let array=[]
                                        filteredData.data.forEach(data=>{
                                            document.getElementById(data[props.item.toUpperCase()+'_NUM']).checked=true;
                                            array.push(data[props.item.toUpperCase()+'_NUM'])
                                        })
                                        changeItemsToBeDeleted(array)
                                    }
                                    else {
                                        filteredData.data.forEach(data=>{
                                            document.getElementById(data[props.item.toUpperCase()+'_NUM']).checked=false;
                                        })
                                        changeItemsToBeDeleted([]);
                                    }
                                    
                                }}/></th>
                                <th></th>
                                {fieldList}
                            </tr>
                        </thead>
                        <tbody>
                            {dataList}
                        </tbody>
                    </table>
                    </div>)
        
        else if ((filteredData && filteredData.error) || errorSelect) 
                result= (<div className="alert alert-warning">
                            {filteredData && filteredData.error? '<DATABASE ERROR> errno: '+filteredData.error.errno+' code: '
                            +filteredData.error.code+' message: '+filteredData.error.sqlMessage:null}
                            {errorSelect? 'OTHER ERROR '+errorSelect.name+' '+errorSelect.message:null}
                        </div>)
        
        else result=null;
        

        return props.render({searchCriteriaList,result,onItemClick,refresh,search,searchChange,
            searchCriteria,searchCriteriaChange,deleteList,errorDeleteDisplay,itemsToBeDeleted})
}

export default Process;