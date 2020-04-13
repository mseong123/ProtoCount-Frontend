import React,{useState,useEffect,useContext} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';
import {
    Switch,
    Route,
    useRouteMatch,
    Redirect
} from 'react-router-dom';
import DocumentOne from '../Shared/preview/DocumentOne';
import numberFormatParser from '../Shared/numberFormatParser';
import dateFormatParser from '../Shared/dateFormatParser';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import LineRender from '../Shared/LineRender';
import ReceiptPaymentHistoryRender from '../Shared/ReceiptPaymentHistoryRender';


function PurchaseInvoiceItem (props) {
    const url={
        item:new URLSearchParams(props.location.search).get('item'),
        id:new URLSearchParams(props.location.search).get('id'),
    }
    const [{data:dataSelectCreditor,error:errorSelectCreditor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'creditor'}),
            credentials:'include'
        }
    });//extension of Item component

    const [{data:dataSelectStock,error:errorSelectStock}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'stock'}),
            credentials:'include'
        }
    });//extension of Item component

    const [{data:dataSelectGLCode,error:errorSelectGLCode}]=useFetch({
        url:'./getEligibleGLAccount',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'purchase_invoice'}),
            credentials:'include'
        }
    });//extension of Item component

    const [{data:dataSelectPaymentHistory,error:errorSelectPaymentHistory}]=useFetch(url.item && url.id?{
        url:'./getPaymentHistory',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                item:'purchase_invoice',
                param:[url.id]
            }),
            credentials:'include'
        }
    }:null);//extension of Item component

    /*Position of inputState variable used in other components. */
    const creditTermPosition=6;
    const linePosition=9;

    const [creditorList,changeCreditorList] = useState(null);
    const [stockList,changeStockList] = useState(null);
    const [GLCodeList,changeGLCodeList] = useState(null);
    const [inputState,changeInputState]=useState(['','','','','','','COD','','',[]]) 
    
    const {path} = useRouteMatch();
    const {changeAuth} = useContext(authContext);

    useEffect(()=>{
        
        if (dataSelectCreditor && dataSelectCreditor.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
        else if (dataSelectCreditor && dataSelectCreditor.data && dataSelectCreditor.field) 
            changeCreditorList(dataSelectCreditor.data.map(data=>(
            <option key={data[dataSelectCreditor.field[0].name]} value={data[dataSelectCreditor.field[0].name]}>
                {(data[dataSelectCreditor.field[0].name]?data[dataSelectCreditor.field[0].name]:'')
                +' | '+(data[dataSelectCreditor.field[1].name]?data[dataSelectCreditor.field[1].name]:'')}
            </option>)
            )
        )
            
        if (dataSelectStock && dataSelectStock.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
        else if (dataSelectStock && dataSelectStock.data && dataSelectStock.field) 
            changeStockList(dataSelectStock.data.map(data=>(
            <option key={data[dataSelectStock.field[0].name]} value={data[dataSelectStock.field[0].name]}>
                {(data[dataSelectStock.field[0].name]?data[dataSelectStock.field[0].name]:'')+' | '
                + (data[dataSelectStock.field[1].name]?data[dataSelectStock.field[1].name]:'')+' | '
                + (data[dataSelectStock.field[2].name]?data[dataSelectStock.field[2].name]:'')}
            </option>)
            )
        )

        if (dataSelectGLCode && dataSelectGLCode.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
        else if (dataSelectGLCode && dataSelectGLCode.data && dataSelectGLCode.field) 
            
                changeGLCodeList(dataSelectGLCode.data.map(data=>(
                <option key={data[dataSelectGLCode.field[0].name]} value={data[dataSelectGLCode.field[0].name]}>
                    {(data[dataSelectGLCode.field[0].name]?data[dataSelectGLCode.field[0].name]:'')
                    +' | '+(data[dataSelectGLCode.field[1].name]?data[dataSelectGLCode.field[1].name]:'')}
                </option>)
                )
            )

        if (dataSelectPaymentHistory && dataSelectPaymentHistory.auth===false) {
            alert('Cookies Expired or Authorisation invalid. Please Login again!');
            changeAuth(false);
        }
                
    },[dataSelectCreditor,errorSelectCreditor,dataSelectStock,errorSelectStock,dataSelectGLCode,errorSelectGLCode,
    dataSelectPaymentHistory,errorSelectPaymentHistory])

    useEffect(()=>{
        function setScale() {
            document.querySelector("meta[name=viewport]").setAttribute(
                'content','width=device-width, initial-scale=1.0');
        }
        window.addEventListener('popstate',setScale)
            
        return function unattach() {
                window.removeEventListener('popstate',setScale)
            }
        },[])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1,inputState.length)])
    }
    function calculateSubtotal(i) {
        if (inputState[linePosition][i][3]!=='' && inputState[linePosition][i][4]!=='' && inputState[linePosition][i][5]!=='')
            return ((parseFloat(inputState[linePosition][i][3])*parseFloat(inputState[linePosition][i][4]))
            -parseFloat(inputState[linePosition][i][5]))
        else return '';
    }

    function calculateTotal() {
        let total=0
        inputState[linePosition].forEach((lineSet,i)=>{

            if(inputState[linePosition][i][3]!=='' && inputState[linePosition][i][4]!=='' && 
            inputState[linePosition][i][5]!=='')
             total=total+((parseFloat(inputState[linePosition][i][3])*parseFloat(inputState[linePosition][i][4]))
             -parseFloat(inputState[linePosition][i][5]))
        })
        return total;
    }

    function calculateOutstanding() {
        const amount=dataSelectPaymentHistory? dataSelectPaymentHistory.field[4].name:null;
        
        return calculateTotal()-(dataSelectPaymentHistory? dataSelectPaymentHistory.data.reduce((a,b)=>
            a+b[amount],0):0)
    }
    
    /*error display extension from error display already provided by Item Component*/
    let errorDisplayExtension=null;
    
    if ((dataSelectCreditor && dataSelectCreditor.error) || errorSelectCreditor ||(dataSelectStock && dataSelectStock.error) || errorSelectStock 
    || (dataSelectGLCode && dataSelectGLCode.error) || errorSelectGLCode || (dataSelectPaymentHistory && dataSelectPaymentHistory.error)
    || errorSelectPaymentHistory ) 
    errorDisplayExtension=(
        <div className="alert alert-warning">
            {dataSelectCreditor && dataSelectCreditor.error? 'Creditor List RETRIEVAL for item failed errno: '+dataSelectCreditor.error.errno
            +' code: '+dataSelectCreditor.error.code+' message: '+dataSelectCreditor.error.sqlMessage:null}
            {errorSelectCreditor? 'Creditor List RETRIEVAL for item failed '+errorSelectCreditor : null}
            <br/>
            <br/>
            {dataSelectStock && dataSelectStock.error? 'Stock List RETRIEVAL for item failed errno: '+dataSelectStock.error.errno
            +' code: '+dataSelectStock.error.code+' message: '+dataSelectStock.error.sqlMessage:null}
            {errorSelectStock? 'Stock List RETRIEVAL for item failed '+errorSelectStock : null}
            <br/>
            <br/>
            {dataSelectGLCode && dataSelectGLCode.error? 'GL Code List RETRIEVAL for item failed errno: '+dataSelectGLCode.error.errno
            +' code: '+dataSelectGLCode.error.code+' message: '+dataSelectGLCode.error.sqlMessage:null}
            {errorSelectGLCode? 'GL Code List RETRIEVAL for item failed '+errorSelectGLCode : null}
            <br/>
            <br/>
            {dataSelectPaymentHistory && dataSelectPaymentHistory.error? 'Payment History RETRIEVAL for item failed errno: '+dataSelectPaymentHistory.error.errno
            +' code: '+dataSelectPaymentHistory.error.code+' message: '+dataSelectPaymentHistory.error.sqlMessage:null}
            {errorSelectPaymentHistory? 'Payment History RETRIEVAL for item failed '+errorSelectPaymentHistory : null}
        </div>)

    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='purchase_invoice' successPath='/PurchaseInvoice'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay})=> 
            (<Switch>
                <Route exact path={`${path}/Preview`}>
                    <DocumentOne description={PurchaseInvoiceItem.description} 
                        backPath={PurchaseInvoiceItem.path} 
                        topLeftInput={[inputState[1],inputState[2]]}
                        topRightField={[PurchaseInvoiceItem.description+' No','Date','Credit Term','Other Description']}
                        topRightInput={[inputState[3],dateFormatParser(inputState[4]),inputState[6]==='COD'?'C.O.D.':inputState[6]+' Days',inputState[5]]}
                        bottomField={['','Item Code','Description','Price','Qty','Discount','Subtotal']}
                        bottomInput={inputState[linePosition]}
                        calculateSubtotal={calculateSubtotal}
                        calculateTotal={calculateTotal}
                    />
                </Route>
                <Route exact path={path}>
                <AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ PurchaseInvoiceItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}
                    {errorDisplayExtension}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}
                    <form onSubmit={(e)=>{e.preventDefault(); if(usage==='INSERT') onInsert(); else onUpdate()}}>
                        <div className='row'>
                            <fieldset className='form-group form-row col-md-5 mx-3 border border-secondary pb-4 rounded' disabled={disabled}>
                                <legend className='col-form-label col-4 offset-4 text-center' ><h6>Creditor <span className='text-warning'>*</span></h6></legend>
                                <label className='mt-3' htmlFor='creditorID' >Creditor ID</label>
                                <div className='input-group'>
                                    {/*if input is disabled, browser does not validate entry (and hence problem if option from dropdown 
                                    not chosen).Hence to prevent user altering input content(other than using those in dropdown) AND 
                                    to ensure a value is chosen set required attribute and a onChange event handler that does nothing*/}
                                    <input type='text' id='creditorID' value={inputState[0]} onChange={(e)=>e} required className='form-control'/>
                                    <select className='form-control' style={{flex:'0 1 0'}} onChange={(e)=>{
                                        let creditorName='';
                                        let creditorAddress='';
                                        let creditorDefaultCreditTerm='';

                                        dataSelectCreditor.data.forEach(data=>{
                                            
                                            if(data[dataSelectCreditor.field[0].name]===e.target.value) {
                                                creditorName=data[dataSelectCreditor.field[1].name]?data[dataSelectCreditor.field[1].name]:'';
                                                creditorAddress=data[dataSelectCreditor.field[2].name]?data[dataSelectCreditor.field[2].name]:'';
                                                creditorDefaultCreditTerm=data[dataSelectCreditor.field[7].name]?data[dataSelectCreditor.field[7].name]:'';
                                            }
                                            
                                        })
                                    
                                    changeInputState([e.target.value,creditorName,creditorAddress,
                                        ...inputState.slice(3,creditTermPosition),creditorDefaultCreditTerm,
                                        ...inputState.slice(creditTermPosition+1)])
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {creditorList}
                                    </select>
                                </div>
                                <label className='mt-3' htmlFor='creditorName'>Creditor Name</label>
                                <input id='creditorName' value={inputState[1]} onChange={(e)=>e} required className='form-control'/>
                                <label className='mt-3' htmlFor='creditorAddress'>Creditor Address</label>
                                <textarea id='creditorAddress' value={inputState[2]} onChange={(e)=>e} required className='form-control'/>
        
                            </fieldset>
                            <div className='form-group col-md-5 mx-3'>
                                <label htmlFor='purchaseInvoiceNumber' className='mt-3'>Purchase Invoice Number <span className='text-warning'>*</span></label>
                                <input type='text' id='purchaseInvoiceNumber' maxLength='50' value={inputState[3]} onChange={
                                    (e)=>onChange(e.target.value,3)} disabled={disabled} required className='form-control' />
                                
                                <label htmlFor='date' className='mt-3'>Date <span className='text-warning'>*</span></label>
                                <input type='date' disabled={disabled} required value={inputState[4]} onChange={(e)=>onChange(e.target.value,4)} 
                                className='form-control'/>

                                <label className='mt-3' htmlFor='GLCode' >GL Code <span className='text-warning'>*</span></label>
                                <div className='input-group'>
                                    <input type='text' id='GLCode' value={inputState[7]} onChange={(e)=>e} required className='form-control' 
                                    disabled={disabled}/>
                                    <select className='form-control' style={{flex:'0 1 0'}} disabled={disabled} onChange={(e)=>
                                        onChange(e.target.value,7)}>
                                        <option value=''> -select an option- </option>
                                        {GLCodeList}
                                    </select>
                                </div>

                                <label htmlFor='creditTerm' className='mt-3'>Credit Term</label>
                                <select id='creditTerm' onChange={(e)=> onChange(e.target.value,6)} value={inputState[6]} disabled={disabled} 
                                className='form-control'>
                                    <option value='COD'>C.O.D.</option>
                                    <option value='30'>30 Days</option>
                                    <option value='45'>45 Days</option>
                                    <option value='60'>60 Days</option>
                                    <option value='90'>90 Days</option>
                                </select>

                                <label htmlFor='description' className='mt-3'>Description</label>
                                <textarea id='description' onChange={(e)=>onChange(e.target.value,5)} value={inputState[5]} 
                                disabled={disabled} className='form-control'/>
                            </div>

                            <fieldset className='form-group col-md-12 mx-3 border border-secondary pb-4 rounded'>
                                <legend className='col-form-label col-10 offset-1 col-md-4 offset-md-4 text-center' >
                                    <button type='button' disabled={disabled} className='btn btn-primary' 
                                    onClick={()=>
                                        changeInputState(
                                            inputState.slice(0,linePosition)
                                            .concat([inputState[linePosition].slice(0)
                                                .concat(
                                                    [[inputState[linePosition].length+1,'','','',0,0]])])
                                            .concat(inputState.slice(linePosition+1))
                                        )
                                    }>
                                        +</button>
                                    <h6 className='d-inline-block mx-2 mx-md-4'>Invoice Line</h6>
                                    <button type='button' className='btn btn-secondary' disabled={disabled}
                                    onClick={()=>
                                        changeInputState(
                                            inputState.slice(0,linePosition)
                                            .concat([inputState[linePosition].slice(0,inputState[linePosition].length-1)])
                                            .concat(inputState.slice(linePosition+1))
                                        )
                                    }>-</button>
                                </legend>

                                <LineRender linePosition={linePosition} disabled={disabled} inputState={inputState}
                                changeInputState={changeInputState} dataSelectStock={dataSelectStock} stockList={stockList}
                                calculateSubtotal={calculateSubtotal}/>
                                
                            </fieldset>

                            <h5 className='text-right my-3 col-12'>
                                {'Total: '+numberFormatParser(calculateTotal())}
                            </h5>
                            {usage==='INSERT'?null:(<h6 className='text-right mb-4 col-12'>
                                <span className="alert alert-secondary">
                                    {'Outstanding Amount: '+numberFormatParser(calculateOutstanding())}
                                </span>
                            </h6>)}

                            {usage==='INSERT'?null: 
                            <fieldset className='form-group col-md-12 mx-3 border border-secondary pb-4 rounded'>
                                <legend className='col-form-label col-4 offset-4 text-center' >
                                    <h6 className='d-inline-block mx-2 mx-md-4'>Payment History</h6>
                                </legend>
                                <ReceiptPaymentHistoryRender dataSelectReceiptPaymentHistory={dataSelectPaymentHistory}
                                disabled={disabled}/>
                            </fieldset>}

                        </div>
                        <ItemButton usage={usage} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} 
                        changeDisabled={changeDisabled} path={`${path}/Preview`}/>
                        
                        
                        
                    </form>
                </div>
            </AppLayout>
            </Route>
            <Redirect to={PurchaseInvoiceItem.path}/>
        </Switch>)}
        
        </Item>
    )
}
PurchaseInvoiceItem.description='Purchase Invoice';
PurchaseInvoiceItem.path='/PurchaseInvoiceItem';

export default PurchaseInvoiceItem;

