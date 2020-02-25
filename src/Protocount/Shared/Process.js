import React,{useState,useEffect,useContext} from 'react';
import {useHistory} from 'react-router-dom';
import useFetch from './useFetch'
import authContext from './authContext';



function Process(props) {
    /*this is a reusable component for all process components (i.e. StockItemMaintenance.js,DeliveryOrder.js). Contains state logic 
    for fetching DB select data usinguseFetch hook) and filtering the fetched data*/
        const [{data:dataSelect,error:errorSelect},changeParam]=useFetch({
            url:'./SelectItem',
            init:{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({item:props.item}),
                credentials:'include'
                }
            });
        const [filteredData,changeFilteredData] = useState(null)
        const {changeAuth} = useContext(authContext);
        const [search,changeSearch] = useState('');
        const [searchCriteria,changeSearchCriteria] = useState('');
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
        changeParam({
            url:'./SelectItem',
            init:{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({item:props.item}),
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
                <th key={field} className='text-nowrap'>{field.replace(/_/g,' ')}</th>
            ))
        }
        
        
        if (filteredData && filteredData.data) {
        dataList=filteredData.data.map((data,i)=>{
            if(data.selected) {
                return (
                    <tr key={i} onClick={()=>/*closure in effect here*/onItemClick(data)} style={{cursor:'pointer'}}>
                        {filteredData && filteredData.field? filteredData.field.map(field=>{
                            {/*use Math.random cos filteredData.data[field] might have repeated null values or same cell value in same tr 
                            and hence duplicate keys*/}
                            return (<td key={Math.random()}>{data[field]}</td>)
                        }):null}
                    </tr>)
                    }
                    
                return null;
            });
        }
        
        
        if (filteredData && !filteredData.error && !errorSelect) 
            result=<table id='table' className='table table-bordered table-hover table-responsive'>
                        <thead>
                            <tr>
                                {fieldList}
                            </tr>
                        </thead>
                        <tbody>
                            {dataList}
                        </tbody>
                    </table>
        
        else if ((filteredData && filteredData.error) || errorSelect) 
                result= (<div className="alert alert-warning">
                            {filteredData && filteredData.error? '<DATABASE ERROR> '+filteredData.error.errno+' '
                            +filteredData.error.code+' '+filteredData.error.sqlMessage:null}
                            {errorSelect? 'OTHER ERROR '+errorSelect.name+' '+errorSelect.message:null}
                        </div>)
        
        else result=null;
            

        return props.render({searchCriteriaList,result,onItemClick,refresh,search,searchChange,searchCriteria,searchCriteriaChange})
}

export default Process;