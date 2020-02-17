import React,{useState,useEffect,useContext} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';



function BankReceiptItem (props) {
    const url={
        item:new URLSearchParams(props.location.search).get('item'),
        id:new URLSearchParams(props.location.search).get('id'),
    }
    const [{data:dataSelectDebtor,error:errorSelectDebtor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'DEBTOR'}),
            credentials:'include'
            }
    });//extension of Item component

    const [{data:dataSelectGLCode,error:errorSelectGLCode}]=useFetch({
        url:'./getEligibleGLAccount',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'BANK_RECEIPT'}),
            credentials:'include'
        }
    });//extension of Item component

    const [{data:dataSelectBank,error:errorSelectBank}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'BANK'}),
            credentials:'include'
        }
    });//extension of Item component
    const [debtorList,changeDebtorList] = useState(null);
    const [GLCodeList,changeGLCodeList] = useState(null);
    const [bankList,changeBankList] = useState(null);
    const [isDebtorPayment,changeIsDebtorPayment] = useState(true);
    const [inputState,changeInputState]=useState(['','','','','','','','','','']) 
    const {changeAuth} = useContext(authContext);

    useEffect(()=>{
        
        
        if (dataSelectDebtor && dataSelectDebtor.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
        else if (dataSelectDebtor && dataSelectDebtor.data && dataSelectDebtor.field) 
            changeDebtorList(dataSelectDebtor.data.map(data=>(
            <option key={data[dataSelectDebtor.field[0].name]} value={data[dataSelectDebtor.field[0].name]}>
                {data[dataSelectDebtor.field[0].name]+' | '+(data[dataSelectDebtor.field[1].name]?data[dataSelectDebtor.field[1].name]:'')}
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

        if (dataSelectBank && dataSelectBank.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectBank && dataSelectBank.data && dataSelectBank.field) 
            changeBankList(dataSelectBank.data.map(data=>(
            <option key={data[dataSelectBank.field[0].name]} value={data[dataSelectBank.field[0].name]}>
                {(data[dataSelectBank.field[0].name]?data[dataSelectBank.field[0].name]:'')
                +' | '+(data[dataSelectBank.field[1].name]?data[dataSelectBank.field[1].name]:'')}
            </option>)
            )
        )
        
        if (inputState[8]!=='') {
            changeIsDebtorPayment(false)
        }

    },[dataSelectDebtor,errorSelectDebtor,dataSelectGLCode,errorSelectGLCode,dataSelectBank,errorSelectBank,inputState[8]])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1,inputState.length)])
    }
    
    /*error display extension from error display already provided by Item Component*/
    let errorDisplayExtension=null;
    
    if ((dataSelectDebtor && dataSelectDebtor.error) || errorSelectDebtor || (dataSelectGLCode && dataSelectGLCode.error) || errorSelectGLCode 
    || (dataSelectBank && dataSelectBank.error) || errorSelectBank ) 
    errorDisplayExtension=(
        <div className="alert alert-warning">
            {dataSelectDebtor && dataSelectDebtor.error? 'Debtor List RETRIEVAL for item failed errno: '+dataSelectDebtor.error.errno
            +' code: '+dataSelectDebtor.error.code+' message: '+dataSelectDebtor.error.sqlMessage:null}
            {errorSelectDebtor? 'Debtor List RETRIEVAL for item failed '+errorSelectDebtor : null}
            
            {dataSelectGLCode && dataSelectGLCode.error? 'GL Code List RETRIEVAL for item failed errno: '+dataSelectGLCode.error.errno
            +' code: '+dataSelectGLCode.error.code+' message: '+dataSelectGLCode.error.sqlMessage:null}
            {errorSelectGLCode? 'GL Code List RETRIEVAL for item failed '+errorSelectGLCode : null}

            {dataSelectBank && dataSelectBank.error? 'Bank List RETRIEVAL for item failed errno: '+dataSelectBank.error.errno
            +' code: '+dataSelectBank.error.code+' message: '+dataSelectBank.error.sqlMessage:null}
            {errorSelectBank? 'Bank List RETRIEVAL for item failed '+errorSelectBank : null}
        </div>)

    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='BANK_RECEIPT' successPath='/BankReceipt'
         >
            {
            ({usage,disabled,latestID,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> 
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ BankReceiptItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}
                    {errorDisplayExtension}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}
                    <form onSubmit={(e)=>{e.preventDefault(); if(usage==='INSERT') onInsert(); else onUpdate()}}>
                        <div className='form-check'>
                            <input className="form-check-input" type="checkbox" checked={isDebtorPayment} disabled={disabled} id="isDebtorPayment" 
                            onChange={(e)=>{
                                changeIsDebtorPayment(!isDebtorPayment);
                                changeInputState([...inputState.slice(0,2),'',...inputState.slice(3,8),'',...inputState.slice(9)])
                                }
                            }/>
                            <label className="form-check-label" htmlFor="isDebtorPayment">
                                Debtor Payment?
                            </label>
                        </div>
                        <div className='row'>
                            <fieldset className='form-group form-row col-md-5 mx-3 border border-secondary pb-4 rounded' 
                            disabled={disabled? true:!isDebtorPayment}>
                                <legend className='col-form-label col-4 offset-4 text-center' ><h6>Debtor</h6></legend>
                                <label className='mt-3' htmlFor='debtorID' >Debtor ID</label>
                                <div className='input-group'>
                                    <input type='text' id='debtorID' value={inputState[2]} onChange={(e)=>e} required className='form-control' />
                                    <select className='form-control' style={{flex:'0 1 0'}} onChange={(e)=>{
                                    onChange(e.target.value,2)
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {debtorList}
                                    </select>
                                </div>
                            </fieldset>
                            <fieldset className='form-group form-row col-md-5 mx-3 border border-secondary pb-4 rounded' disabled={disabled? true:isDebtorPayment}>
                                <legend className='col-form-label col-4 offset-4 text-center' ><h6>GL Code</h6></legend>
                                <label className='mt-3' htmlFor='glCode' >GL Code</label>
                                <div className='input-group'>
                                    <input type='text' id='glCode' value={inputState[8]} onChange={(e)=>e} required className='form-control' />
                                    <select className='form-control' style={{flex:'0 1 0'}} onChange={(e)=>{
                                    onChange(e.target.value,8)
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {GLCodeList}
                                    </select>
                                </div>
                            </fieldset>
                        
                            <div className='form-group col-md-5 mx-3'>
                                <label htmlFor='documentNumber'>Document Number <span className='text-warning'>*</span></label>
                                {inputNumberRender({
                                    onChange:onChange,
                                    layout:'',
                                    position:0,
                                    labelID:'documentNumber'
                                })
                                }
                            </div>
                    
                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='bankCode'>Bank Code <span className='text-warning'>*</span></label>
                                <div className='input-group'>
                                    <input type='text' id='bankCode' value={inputState[1]} onChange={(e)=>e} required className='form-control' 
                                    disabled={disabled}/>
                                    <select className='form-control' style={{flex:'0 1 0'}} onChange={(e)=>{
                                    onChange(e.target.value,1)
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {bankList}
                                    </select>
                                </div>
                            </div>
                        
                            
                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='date'>Date <span className='text-warning'>*</span></label>
                                <input type='date' disabled={disabled} required value={inputState[3]} onChange={(e)=>onChange(e.target.value,3)} 
                                className='form-control'/>
                            </div>

                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='paymentMethod'>Payment Method</label>
                                <input type='text' id='paymentMethod' onChange={(e)=>onChange(e.target.value,4)} value={inputState[4]} 
                                disabled={disabled} className='form-control'/>
                            </div>
                        
                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='transactionID'>Transaction ID</label>
                                <input type='text' id='transactionID' onChange={(e)=>onChange(e.target.value,5)} value={inputState[5]} 
                                disabled={disabled} className='form-control'/>
                            </div>

                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='description' >Description</label>
                                <textarea type='text' id='description' onChange={(e)=>onChange(e.target.value,6)} value={inputState[6]} 
                                disabled={disabled} className='form-control'/>
                            </div>
                            
                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='amount'>Amount <span className='text-warning'>*</span></label>
                                <input type='number' id='amount' onChange={(e)=>onChange(e.target.value,7)} value={inputState[7]} 
                                disabled={disabled} required min={isDebtorPayment?'default':'0'} className='form-control'/>
                                <small className="text-warning">If transaction is REFUND to Debtor, use negative amount</small>
                            </div>

                        </div>
                        <ItemButton usage={usage} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} 
                        changeDisabled={changeDisabled}/>
                        
                        
                        
                    </form>
                </div>
            </AppLayout>)
            }
        
        </Item>
    )
}
BankReceiptItem.description='Bank Receipt';
BankReceiptItem.path='/BankReceiptItem';

export default BankReceiptItem;

