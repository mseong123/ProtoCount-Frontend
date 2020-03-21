import React,{useState,useEffect,useContext} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';
import DocumentOne from '../Shared/preview/DocumentOne';
import numberFormatParser from '../Shared/numberFormatParser';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import LineRender from '../Shared/LineRender';



function PurchaseDebitNoteItem (props) {
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
            body:JSON.stringify({item:'purchase_debit_note'}),
            credentials:'include'
        }
    });//extension of Item component

    /*Position of inputState variable used in other components. */
    const creditTermPosition=7;
    const linePosition=10;

    const [creditorList,changeCreditorList] = useState(null);
    const [stockList,changeStockList] = useState(null);
    const [GLCodeList,changeGLCodeList] = useState(null);
    const [inputState,changeInputState]=useState(['','','','','','','','COD','','',[]]) 
    
    const [preview,changePreview]=useState(false);
    const {changeAuth} = useContext(authContext);

    useEffect(()=>{
        
        if (dataSelectCreditor && dataSelectCreditor.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
        else if (dataSelectCreditor && dataSelectCreditor.data && dataSelectCreditor.field) 
            changeCreditorList(dataSelectCreditor.data.map(data=>(
            <option key={data[dataSelectCreditor.field[0].name]} value={data[dataSelectCreditor.field[0].name]}>
                {data[dataSelectCreditor.field[0].name]+' | '+(data[dataSelectCreditor.field[1].name]?data[dataSelectCreditor.field[1].name]:'')}
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
                {data[dataSelectStock.field[0].name]+' | '
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

    },[dataSelectCreditor,errorSelectCreditor,dataSelectStock,errorSelectStock,dataSelectGLCode,errorSelectGLCode])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1)])
    }
    
    function calculateSubtotal(i) {
        if (inputState[linePosition][i][3]!=='' && inputState[linePosition][i][4]!=='' && inputState[linePosition][i][5]!=='')
            return ((parseFloat(inputState[linePosition][i][3])*parseFloat(inputState[linePosition][i][4]))
            -parseFloat(inputState[linePosition][i][5])).toFixed(2)
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
        return +(total.toFixed(2));
    }
    
    
    
    /*error display extension from error display already provided by Item Component*/
    let errorDisplayExtension=null;
    
    
    if ((dataSelectCreditor && dataSelectCreditor.error) || errorSelectCreditor ||(dataSelectStock && dataSelectStock.error) || errorSelectStock ||
    (dataSelectGLCode && dataSelectGLCode.error) || errorSelectGLCode) 
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
        </div>)

    
    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='purchase_debit_note' successPath='/PurchaseDebitNote'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay})=> preview? (
            <DocumentOne description={PurchaseDebitNoteItem.description} 
                changePreview={changePreview}
                preview={preview}
                topLeftInput={[inputState[1],inputState[2]]}
                topRightField={[PurchaseDebitNoteItem.description+' No','Date','Credit Term','Other Description']}
                topRightInput={[inputState[4],inputState[5],inputState[7]==='COD'?'C.O.D.':inputState[7]+' Days',inputState[6]]}
                bottomField={['','Item Code','Description','Price','Qty','Discount','Subtotal']}
                bottomInput={inputState[linePosition]}
                calculateSubtotal={calculateSubtotal}
                calculateTotal={calculateTotal}
                
            />)
            :
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ PurchaseDebitNoteItem.description}</h3>
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
                                    <input type='text' id='creditorID' value={inputState[0]} onChange={(e)=>e} required className='form-control' />
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
                                <label htmlFor='purchaseDebitNoteNumber' className='mt-3'>Purchase Debit Note Number <span className='text-warning'>*</span></label>
                                <input type='text' id='purchaseDebitNoteNumber' maxLength='50' value={inputState[4]} onChange={
                                    (e)=>onChange(e.target.value,4)} disabled={disabled} required className='form-control' />

                                <label htmlFor='date' className='mt-3'>Date <span className='text-warning'>*</span></label>
                                <input type='date' disabled={disabled} required value={inputState[5]} onChange={(e)=>onChange(e.target.value,5)} 
                                className='form-control'/>
                                
                                <label className='mt-3' htmlFor='glCode' >GL Code <span className='text-warning'>*</span></label>
                                <div className='input-group'>
                                    <input type='text' id='glCode' value={inputState[8]} onChange={(e)=>e} required className='form-control' 
                                    disabled={disabled}/>
                                    <select className='form-control' style={{flex:'0 1 0'}} disabled={disabled} onChange={(e)=>{
                                    onChange(e.target.value,8)
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {GLCodeList}
                                    </select>
                                </div>

                                <label htmlFor='creditTerm' className='mt-3'>Credit Term</label>
                                <select id='creditTerm' onChange={(e)=> onChange(e.target.value,7)} value={inputState[7]} disabled={disabled} 
                                className='form-control'>
                                    <option value='COD'>C.O.D.</option>
                                    <option value='30'>30 Days</option>
                                    <option value='45'>45 Days</option>
                                    <option value='60'>60 Days</option>
                                    <option value='90'>90 Days</option>
                                </select>

                                <label htmlFor='description' className='mt-3'>Description</label>
                                <textarea id='description' onChange={(e)=>onChange(e.target.value,6)} value={inputState[6]} 
                                disabled={disabled} className='form-control'/>
                                
                            </div>

                            <fieldset className='form-group col-md-12 mx-3 border border-secondary pb-4 rounded'>
                                <legend className='col-form-label col-8 offset-2 col-md-6 offset-md-3 text-center' >
                                    <button type='button' className='btn btn-primary' disabled={disabled}
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
                                    <h6 className='d-inline-block mx-2 mx-md-4'>Purchase Debit Note Line</h6>
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

                        </div>
                        <ItemButton usage={usage} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} 
                        changeDisabled={changeDisabled} preview={preview} changePreview={changePreview}/>
                        
                        
                        
                    </form>
                </div>
            </AppLayout>)
            }
        
        </Item>
    )
}
PurchaseDebitNoteItem.description='Purchase Debit Note';
PurchaseDebitNoteItem.path='/PurchaseDebitNoteItem';

export default PurchaseDebitNoteItem;

