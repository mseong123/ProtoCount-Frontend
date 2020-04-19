import React,{useState,useEffect,useContext} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import OffsetRender from '../Shared/OffsetRender';
import numberFormatParser from '../Shared/numberFormatParser';


function CashReceiptItem (props) {
    const url={
        item:new URLSearchParams(props.location.search).get('item'),
        id:new URLSearchParams(props.location.search).get('id'),
    }
    const [{data:dataSelectDebtor,error:errorSelectDebtor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'debtor'}),
            credentials:'include'
        }
    });//extension of Item component

    const [{data:dataSelectGLCode,error:errorSelectGLCode}]=useFetch({
        url:'./getEligibleGLAccount',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'cash_receipt'}),
            credentials:'include'
        }
    });//extension of Item component

    const [{data:dataSelectDebtorOutstanding,error:errorSelectDebtorOutstanding},changeParamDebtorOutstanding]=useFetch(null);//extension of Item component

    /*Position of inputState variable used in other components. */
    const debtorNumPosition=1;
    const amountPosition=6;
    const glPosition=7;
    const oldNumPosition=9;
    const offsetPositionSalesInvoice=10;
    const offsetPositionDebitNote=11;

    /*inputState offset inner positions*/
    const offsetDocNumPosition=0;
    const offsetAmountPosition=1;

    const offsetDescriptionOne='INVOICE';
    const offsetDescriptionTwo='DEBIT NOTE';

    const [debtorList,changeDebtorList] = useState(null);
    const [GLCodeList,changeGLCodeList] = useState(null);
    const [errorUnappliedAmount,changeErrorUnappliedAmount] = useState(null);
    const [isDebtorPayment,changeIsDebtorPayment] = useState(true);
    const [inputState,changeInputState]=useState(['','','','','','','','','','',[],[]]) 
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
        if (inputState[glPosition]!=='') {
            changeIsDebtorPayment(false)
        }

    },[dataSelectDebtor,errorSelectDebtor,dataSelectGLCode,errorSelectGLCode,inputState[glPosition]])

    /*have a separate useeffect for debtor outstanding fetch because fetch happens many time during lifecycle of component*/

    useEffect(()=>{
        if (dataSelectDebtorOutstanding && dataSelectDebtorOutstanding.auth===false) {
            alert('Cookies Expired or Authorisation invalid. Please Login again!');
            changeAuth(false);
        }
    },[dataSelectDebtorOutstanding,errorSelectDebtorOutstanding])

    function paramDebtorOutstanding(debtorNum,oldNum){
        return {
            url:'./getDebtorOutstanding',
            init:{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({
                    debtorNum:debtorNum,
                    oldNum:oldNum
                }),
                credentials:'include'
            }
        }
    }

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1,inputState.length)])
    }

    function calculateTotal() {
        return +(inputState[amountPosition]);
    }

    function calculateUnappliedAmount(exclude) {
        
        return inputState[offsetPositionDebitNote].reduce((a,b)=>{
            
            if(exclude===b[offsetDocNumPosition]) {
                return a
            }     
            else return a-b[offsetAmountPosition];
        },inputState[offsetPositionSalesInvoice].reduce((a,b)=>{
            
            if(exclude===b[offsetDocNumPosition]) {
                return a
            }     
            else return a-b[offsetAmountPosition];
        },calculateTotal())
        )
    }
    
    /*error display extension from error display already provided by Item Component*/
    let errorDisplayExtension=null;
    
    if ((dataSelectDebtor && dataSelectDebtor.error) || errorSelectDebtor || (dataSelectGLCode && dataSelectGLCode.error) || errorSelectGLCode 
    || (dataSelectDebtorOutstanding && dataSelectDebtorOutstanding.error) || errorSelectDebtorOutstanding) 
    errorDisplayExtension=(
        <div className="alert alert-warning">
            {dataSelectDebtor && dataSelectDebtor.error? 'Debtor List RETRIEVAL for item failed errno: '+dataSelectDebtor.error.errno
            +' code: '+dataSelectDebtor.error.code+' message: '+dataSelectDebtor.error.sqlMessage:null}
            {errorSelectDebtor? 'Debtor List RETRIEVAL for item failed '+errorSelectDebtor : null}
            <br/>
            <br/>
            {dataSelectGLCode && dataSelectGLCode.error? 'GL Code List RETRIEVAL for item failed errno: '+dataSelectGLCode.error.errno
            +' code: '+dataSelectGLCode.error.code+' message: '+dataSelectGLCode.error.sqlMessage:null}
            {errorSelectGLCode? 'GL Code List RETRIEVAL for item failed '+errorSelectGLCode : null}
            <br/>
            <br/>
            {dataSelectDebtorOutstanding && dataSelectDebtorOutstanding.error? 'Debtor Outstanding List RETRIEVAL for item failed errno: '
            + dataSelectDebtorOutstanding.error.errno +' code: '+dataSelectDebtorOutstanding.error.code+' message: '+ 
            dataSelectDebtorOutstanding.error.sqlMessage:null}
            {errorSelectDebtorOutstanding? 'Debtor Outstanding List RETRIEVAL for item failed '+errorSelectDebtorOutstanding : null}
        </div>)

    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='cash_receipt' successPath='/CashReceipt'
            paramOutstanding={paramDebtorOutstanding} changeParamOutstanding={changeParamDebtorOutstanding} 
            debtorCreditorNumPosition={debtorNumPosition} oldNumPosition={oldNumPosition}>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> 
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ CashReceiptItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}
                    {errorDisplayExtension}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}
                    <form onSubmit={(e)=>{
                        e.preventDefault(); 

                        if (calculateUnappliedAmount()!==0 && isDebtorPayment) {
                            changeErrorUnappliedAmount(
                                (<p className='col-md-12 text-right alert alert-warning mx-3'>
                                    Total not fully offset. Please amend. 
                                </p>)
                            )
                        } else {
                            if(usage==='INSERT') onInsert(); 
                            else onUpdate()
                        }
                        }}>
                        <div className='form-check'>
                            <input className="form-check-input" type="checkbox" checked={isDebtorPayment} disabled={disabled} id="isDebtorPayment" 
                            onChange={(e)=>{
                                changeIsDebtorPayment(!isDebtorPayment);
                                changeInputState([...inputState.slice(0,debtorNumPosition),'',
                                ...inputState.slice(debtorNumPosition+1,glPosition),'',
                                ...inputState.slice(glPosition+1,offsetPositionSalesInvoice),[],[]])
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
                                    <input type='text' id='debtorID' value={inputState[1]} onChange={(e)=>e} required className='form-control' />
                                    <select className='form-control' style={{flex:'0 1 0'}} value={inputState[1]} onChange={(e)=>{
                                    onChange(e.target.value,1)
                                    changeParamDebtorOutstanding(
                                        paramDebtorOutstanding(e.target.value,inputState[oldNumPosition])
                                        )
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
                                    <input type='text' id='glCode' value={inputState[7]} onChange={(e)=>e} required className='form-control' />
                                    <select className='form-control' style={{flex:'0 1 0'}} onChange={(e)=>{
                                    onChange(e.target.value,7)
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
                                <label htmlFor='date'>Date <span className='text-warning'>*</span></label>
                                <input type='date' disabled={disabled} required value={inputState[2]} onChange={(e)=>onChange(e.target.value,2)} 
                                className='form-control'/>
                            </div>

                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='paymentMethod'>Payment Method</label>
                                <input type='text' id='paymentMethod' onChange={(e)=>onChange(e.target.value,3)} value={inputState[3]} 
                                disabled={disabled} className='form-control'/>
                            </div>
                        
                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='transactionID'>Transaction ID</label>
                                <input type='text' id='transactionID' onChange={(e)=>onChange(e.target.value,4)} value={inputState[4]} 
                                disabled={disabled} className='form-control'/>
                            </div>

                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='description' >Description</label>
                                <textarea type='text' id='description' onChange={(e)=>onChange(e.target.value,5)} value={inputState[5]} 
                                disabled={disabled} className='form-control'/>
                            </div>
                            
                            <div className='form-group form-row col-md-5 mx-3'>
                                <label htmlFor='amount'>Amount <span className='text-warning'>*</span></label>
                                <input type='number' id='amount' onChange={(e)=>onChange(e.target.value,6)} value={inputState[6]} 
                                disabled={disabled} required min='0' step='.01' className='form-control'/>
                                
                            </div>

                            {isDebtorPayment?
                            (<h6 className='text-right my-4 col-12' style={{paddingRight:30}}>
                                <span className='alert alert-secondary'>{'Unapplied Amount: '+numberFormatParser(calculateUnappliedAmount())}</span>
                            </h6>):null}
                            {errorUnappliedAmount}

                            {isDebtorPayment?
                            <OffsetRender dataSelectOutstanding={dataSelectDebtorOutstanding} inputState={inputState} 
                                changeInputState={changeInputState} disabled={disabled}
                                calculateUnappliedAmount={calculateUnappliedAmount} calculateTotal={calculateTotal}
                                offsetPositionOne={offsetPositionSalesInvoice} offsetPositionTwo={offsetPositionDebitNote}
                                offsetDescriptionOne={offsetDescriptionOne} offsetDescriptionTwo={offsetDescriptionTwo}
                                changeErrorUnappliedAmount={changeErrorUnappliedAmount}
                                offsetDescription={'Sales Invoice / Debit Note'}/>
                            :null}

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
CashReceiptItem.description='Cash Receipt';
CashReceiptItem.path='/CashReceiptItem';

export default CashReceiptItem;

