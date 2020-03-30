import React,{useState,useEffect,useContext} from 'react';
import {useHistory} from 'react-router-dom';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';


function Item(props) {
    /*this is a reusable component for all item components (i.e. StockItem.js,DeliveryOrderItem.js) and contains state logic for performing
    (SELECT,UPDATE,INSERT,DELETE) SQL DB operations on form data using useFetch hook.

    /*If item component accessed from previous page using fetched and filtered items, URL will have parameters starting with ?item=... 
    If accessed using 'Create New Item' button from previous page, will have no URL parameters. Existence of URL parameters (have to be 
    passed in from parent component in props.URL due to props.location.search only accessible in the component immediately after <Route> in 
    react-router) will be used to set initial state to 'INSERT' or 'UPDATE/DELETE' and component will render appropriately */
    
    
    const [usage] = useState(props.url.item && props.url.id?'UPDATE/DELETE':'INSERT');/*if there are URL parameters, state is 'UPDATE/DELETE' 
    and vice versa*/
    const [disabled,changeDisabled] = useState(usage==='UPDATE/DELETE'?true:false);/*If state is 'UPDATE/DELETE', all input fields will be 
    pre-populated with existing item form data using useFetch hook below and disabled until 'Edit' button is clicked which will re-enable 
    editing (certain input fields remain disabled even after 'Edit' is clicked for DB operation purpose). Delete button will also render
    in 'UPDATE/DELETE' state. For 'INSERT' state, none of input fields are disabled and no Edit and Delete button will render*/
    
    /*5 instances of useFetch hook to fetch 5 types of data:1) dataSelect (for initial fetch to pre-populate input field for 'UPDATE/DELETE' 
    state) 2) dataInsert (for results of submission of new form data for 'INSERT' state) 3) dataIDList (for list of ID) 4) dataDelete (for results of deletion of existing form data for 'UPDATE/DELETE' state) 5) dataUpdate (for results of update of 
    existing form data for 'UPDATE/DELETE' state)*/

    const [{data:dataSelect,error:errorSelect}]=useFetch(usage==='UPDATE/DELETE'?{
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:props.url.item,id:props.url.id}),
            credentials:'include'
        }
    }:null)
    const [{data:dataIDList,error:errorIDList}]=useFetch({
        url:'./getIDList',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:props.item}),
            credentials:'include'
        }
    })
    const [{data:dataInsert,error:errorInsert},changeParamInsert]=useFetch(null);
    const [{data:dataDelete,error:errorDelete},changeParamDelete]=useFetch(null);
    const [{data:dataUpdate,error:errorUpdate},changeParamUpdate]=useFetch(null);

    const [IDInfo,changeIDInfo]=useState({
        IDPrefix:[],
        IDPrefixLatestNumber:[],
        currentIDPrefix:'',
        minIDNumber:1,
    })
    
    const {changeAuth} = useContext(authContext)
    const history=useHistory();
    
    /*The below useEffect logic conditions to handle each type of data fetched using the useFetch hooks*/

    useEffect(()=>{        

        /* 1) For 'UPDATE/DELETE' state, pre-populate input state with fetched data. Input state are set at parent component (ie. StockItem.js,
        DeliveryOrderItem.js) and changeState functions for each input state are passed as prop (props.changeInputState) 
        to this component for initial pre-population once dataSelect is resolved*/ 

        if (dataSelect && dataSelect.auth===false) {
            /*if server sends object.auth===false due to failed cookie validation, will auto-redirect to /Login page after alert.
            Same for all types of data fetch*/
                alert('Cookies Expired or Authorisation invalid. Please Login again!')
                changeAuth(false)
            }
            
        else if (dataSelect && dataSelect.field && dataSelect.data[0]) {
                /*In order for correct pre-population of input state, make sure that in the parent component, order of inputState
                array elements correspond to field order in DB (ie if STOCK_NUM is first field column in DB, inputState[0] will be 
                populated with fetched data from DB for field STOCK_NUM) */
                let inputStateToBePrePopulated=[];
                dataSelect.field.forEach((field,i)=>{
                    inputStateToBePrePopulated=
                    [...inputStateToBePrePopulated.slice(0,i),(dataSelect.data[0][field.name]?dataSelect.data[0][field.name]:''),
                    ...inputStateToBePrePopulated.slice(i+1,inputStateToBePrePopulated.length)];
                })
                
                
                changeIDInfo(state=>({
                    ...state,
                    currentIDPrefix:dataSelect.data[0][props.item.toUpperCase()+'_NUM'].substring(0,dataSelect.data[0][props.item.toUpperCase()+'_NUM'].indexOf("-")),
                }))
                props.changeInputState(inputStateToBePrePopulated)
                
                if(props.changeParamOutstanding)
                    props.changeParamOutstanding(
                        props.paramOutstanding(
                            inputStateToBePrePopulated[props.debtorCreditorNumPosition],
                            inputStateToBePrePopulated[props.oldNumPosition]
                            )
                        )
            }
                
        },[dataSelect,errorSelect])

    useEffect(()=>{
            /*2) obtain latest primary list key from DB for this item*/
            if (dataIDList && dataIDList.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
            else if (dataIDList && dataIDList.data && dataIDList.field) {
                let prefixList=[];
                let prefixLatestNumberList=[];

                dataIDList.data.forEach(ID=>{
                    let parsedPrefix=ID[dataIDList.field[0].name].match(/[^-]+/)[0];
                    let parsedPrefixNumber=parseInt(ID[dataIDList.field[0].name].substring(ID[dataIDList.field[0].name].indexOf("-")+1));
                    if(prefixList.indexOf(parsedPrefix)===-1) {
                        prefixList.push(parsedPrefix)
                        prefixLatestNumberList.push(parsedPrefixNumber)
                    }
                    else if (parsedPrefixNumber && parsedPrefixNumber>prefixLatestNumberList[prefixList.indexOf(parsedPrefix)]) {
                        prefixLatestNumberList[prefixList.indexOf(parsedPrefix)]=parsedPrefixNumber
                    }
                    })
                changeIDInfo(state=>({
                    ...state,
                    IDPrefix:prefixList,
                    IDPrefixLatestNumber:prefixLatestNumberList
                })) 
            }
           
            
            /*3) For dataInsert,if successful direct to the associated Process component. Otherwise display error 
            and retain current component state*/
            if (dataInsert && dataInsert.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
            else if (dataInsert && !dataInsert.error) {
                alert('Insert Successful!')
                history.push(props.successPath)
            }
            /*4) For dataUpdate,if successful direct to the associated Process component. Otherwise display error 
            and retain current component state*/
            if (dataUpdate && dataUpdate.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
            else if (dataUpdate && !dataUpdate.error) {
                alert('Update Successful!')
                history.push(props.successPath)
            }
            /*5) For dataDelete,if successful direct to the associated Process component. Otherwise display error 
            and retain current component state*/
            if (dataDelete && dataDelete.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
            else if (dataDelete && !dataDelete.error) {
                alert('Delete Successful!')
                history.push(props.successPath)
            }

            
    },[dataIDList,errorIDList,dataInsert,errorInsert,dataUpdate,errorUpdate,dataDelete,errorDelete])

    

    function onInsert() {
        changeParamInsert({
            url:'./InsertItem',
            init:{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    item:props.item,
                    param:props.inputState
                }),
                credentials:'include'
            }
        })
    }

    function onUpdate() {
        changeParamUpdate({
            url:'./UpdateItem',
            init:{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    item:props.item,
                    param:props.inputState
                }),
                credentials:'include'
            }
        })
    }

    function onDelete() {
        if(window.confirm('Confirm Delete?'))
        changeParamDelete({
            url:'./DeleteItem',
            init:{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    item:props.item,
                    id:[props.url.id]
                }),
                credentials:'include'
            }
        })
    }

    function inputNumberRender(inputNumberProps) {
        return (
            <div className={inputNumberProps.layout+ ' input-group'}>
                <input type='text' maxLength={10} value={IDInfo.currentIDPrefix} required className='form-control 
                col-5 col-md-4' pattern='[A-Za-z]+' title='Use Alphabets only (Max 4)' disabled={disabled} 
                onChange={(e)=>{
                    let matchedIndex=IDInfo.IDPrefix.indexOf(e.target.value);
                    if (matchedIndex!==-1) {
                        changeIDInfo({
                            ...IDInfo,
                            currentIDPrefix:e.target.value,
                            minIDNumber:IDInfo.IDPrefixLatestNumber[matchedIndex]+1
                        });
                        inputNumberProps.onChange('',inputNumberProps.position);
                    }
                    else {
                        changeIDInfo ({
                            ...IDInfo,
                            currentIDPrefix:e.target.value,
                            minIDNumber:1
                        });
                        inputNumberProps.onChange('',inputNumberProps.position);
                    }
                }
                }/>
                <select className='form-control' style={{flex:'0 1 0'}} disabled={disabled} onChange={(e)=>{
                    let matchedIndex=IDInfo.IDPrefix.indexOf(e.target.value);
                    if (matchedIndex!==-1) {
                        changeIDInfo({
                            ...IDInfo,
                            currentIDPrefix:e.target.value,
                            minIDNumber:IDInfo.IDPrefixLatestNumber[matchedIndex]+1
                        })
                        inputNumberProps.onChange('',inputNumberProps.position);
                    }
                    else {
                        changeIDInfo ({
                            ...IDInfo,
                            currentIDPrefix:e.target.value,
                            minIDNumber:1
                        })
                        inputNumberProps.onChange('',inputNumberProps.position);
                    }
                }
                }>
                    <option value=''>-select an option- </option>
                    {IDInfo.IDPrefix.map((ID,i)=>(
                        <option key={ID} value={ID}>
                            {ID +' | Latest Number: '+ IDInfo.IDPrefixLatestNumber[i]}
                        </option>)
                    )}
                </select>
                <input type='number' id={inputNumberProps.labelID} max='999999999'
                value={props.inputState[inputNumberProps.position].substring(props.inputState[inputNumberProps.position].indexOf("-")+1)} 
                onChange={(e)=>inputNumberProps.onChange(IDInfo.currentIDPrefix+'-'+e.target.value,inputNumberProps.position)} 
                disabled={disabled} required className='form-control' placeholder={'Next Number : '+(IDInfo.minIDNumber)} 
                min={IDInfo.minIDNumber}/>
                                
            </div>
        )
    }
    
    //error summary component
    let errorDisplay=null;
    if ((dataSelect && dataSelect.error) || errorSelect || (dataIDList && dataIDList.error) || errorIDList || (dataInsert && dataInsert.error) || errorInsert
        || (dataDelete && dataDelete.error) || errorDelete || (dataUpdate && dataUpdate.error) || errorUpdate)
        errorDisplay=(
        <div className="alert alert-warning">
            {dataSelect && dataSelect.error? 'Data RETRIEVAL for item failed errno: '+dataSelect.error.errno+' code: '+dataSelect.error.code+' message: '+dataSelect.error.sqlMessage:null}
            {errorSelect? 'Data RETRIEVAL for item failed '+errorSelect : null}
            
            {dataInsert && dataInsert.error? 'Data INSERT for item failed errno: '+dataInsert.error.errno+' code: '+dataInsert.error.code+' message: '+dataInsert.error.sqlMessage:null}
            {errorInsert? 'Data INSERT for item failed '+errorInsert : null}
            
            {dataUpdate && dataUpdate.error? 'Data UPDATE for item failed errno: '+dataUpdate.error.errno+' code: '+dataUpdate.error.code+' message: '+dataUpdate.error.sqlMessage:null}
            {errorUpdate? 'Data UPDATE for item failed '+errorUpdate : null}
            
            {dataDelete && dataDelete.error? 'Data DELETE for item failed errno: '+dataDelete.error.errno+' code: '+dataDelete.error.code+' message: '+dataDelete.error.sqlMessage:null}
            {errorDelete? 'Data DELETE for item failed '+errorDelete : null}
            <br/>
            <br/>
            {dataIDList && dataIDList.error? 'ID RETRIEVAL for item failed errno: '+dataIDList.error.errno+' code: '+dataIDList.error.code+' message: '+dataIDList.error.sqlMessage:null}
            {errorIDList? 'ID RETRIEVAL for item failed '+errorIDList:null}
        </div>
    )
    

    
    return props.children({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})
}


export default Item;
