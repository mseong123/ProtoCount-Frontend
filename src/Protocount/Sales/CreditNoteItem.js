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
import OffsetRender from '../Shared/OffsetRender';



function CreditNoteItem (props) {
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
            body:JSON.stringify({item:'credit_note'}),
            credentials:'include'
        }
    });//extension of Item component
    
    const [{data:dataSelectDebtorOutstanding,error:errorSelectDebtorOutstanding},changeParamDebtorOutstanding]=useFetch(null);//extension of Item component
    
    /*Position of inputState variable used in other components. */
    const debtorNumPosition=0;
    const creditTermPosition=6;
    const oldNumPosition=8;
    const linePosition=9;
    const offsetPositionSalesInvoice=10;
    const offsetPositionDebitNote=11;

    /*inputState offset inner positions*/
    const offsetDocNumPosition=0;
    const offsetAmountPosition=1;

    const offsetDescriptionOne='INVOICE';
    const offsetDescriptionTwo='DEBIT NOTE';

    const [debtorList,changeDebtorList] = useState(null);
    const [stockList,changeStockList] = useState(null);
    const [GLCodeList,changeGLCodeList] = useState(null);
    const [errorUnappliedAmount,changeErrorUnappliedAmount] = useState(null);
    const [inputState,changeInputState]=useState(['','','','','','','COD','','',[],[],[]]) 

    
    const {path} = useRouteMatch();
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

    },[dataSelectDebtor,errorSelectDebtor,dataSelectStock,errorSelectStock,dataSelectGLCode,errorSelectGLCode])

    /*have a separate useeffect for debtor outstanding fetch because fetch happens many time during lifecycle of component*/

    useEffect(()=>{
        if (dataSelectDebtorOutstanding && dataSelectDebtorOutstanding.auth===false) {
            alert('Cookies Expired or Authorisation invalid. Please Login again!');
            changeAuth(false);
        }
    },[dataSelectDebtorOutstanding,errorSelectDebtorOutstanding])

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
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1)])
    }
    
    function calculateSubtotal(i) {
        if (inputState[linePosition][i][3]!=='' && inputState[linePosition][i][4]!=='' && 
        inputState[linePosition][i][5]!=='')
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
    
    
    if ((dataSelectDebtor && dataSelectDebtor.error) || errorSelectDebtor ||(dataSelectStock && dataSelectStock.error) || errorSelectStock ||
    (dataSelectGLCode && dataSelectGLCode.error) || errorSelectGLCode || (dataSelectDebtorOutstanding && dataSelectDebtorOutstanding.error) ||
    errorSelectDebtorOutstanding) 
    errorDisplayExtension=(
        <div className="alert alert-warning">
            {dataSelectDebtor && dataSelectDebtor.error? 'Debtor List RETRIEVAL for item failed errno: '+dataSelectDebtor.error.errno
            +' code: '+dataSelectDebtor.error.code+' message: '+dataSelectDebtor.error.sqlMessage:null}
            {errorSelectDebtor? 'Debtor List RETRIEVAL for item failed '+errorSelectDebtor : null}
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
            {dataSelectDebtorOutstanding && dataSelectDebtorOutstanding.error? 'Debtor Outstanding List RETRIEVAL for item failed errno: '
            + dataSelectDebtorOutstanding.error.errno +' code: '+dataSelectDebtorOutstanding.error.code+' message: '+ 
            dataSelectDebtorOutstanding.error.sqlMessage:null}
            {errorSelectDebtorOutstanding? 'Debtor Outstanding List RETRIEVAL for item failed '+errorSelectDebtorOutstanding : null}
        </div>)

    
    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='credit_note' successPath='/CreditNote'
        paramOutstanding={paramDebtorOutstanding} changeParamOutstanding={changeParamDebtorOutstanding} 
        debtorCreditorNumPosition={debtorNumPosition} oldNumPosition={oldNumPosition}>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> 
            (<Switch>
                <Route exact path={`${path}/Preview`}>
                    <DocumentOne description={CreditNoteItem.description} 
                        backPath={CreditNoteItem.path} 
                        topLeftInput={[inputState[1],inputState[2]]}
                        topRightField={[CreditNoteItem.description+' No','Date','Credit Term','Other Description']}
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

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ CreditNoteItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}
                    {errorDisplayExtension}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}
                    <form onSubmit={(e)=>{
                        e.preventDefault();
                            if(usage==='INSERT') onInsert(); 
                            else onUpdate()
                        
                        }}>
                        <div className='row'>
                            <fieldset className='form-group form-row col-md-5 mx-3 border border-secondary pb-4 rounded' disabled={disabled}>
                                <legend className='col-form-label col-4 offset-4 text-center' ><h6>Debtor <span className='text-warning'>*</span></h6></legend>
                                <label className='mt-3' htmlFor='debtorID' >Debtor ID</label>
                                <div className='input-group'>
                                    {/*if input is disabled, browser does not validate entry (and hence problem if option from dropdown 
                                    not chosen).Hence to prevent user altering input content(other than using those in dropdown) AND 
                                    to ensure a value is chosen set required attribute and a onChange event handler that does nothing*/}
                                    <input type='text' id='debtorID' value={inputState[0]} onChange={(e)=>e} required className='form-control' />
                                    <select className='form-control' style={{flex:'0 1 0'}} onChange={(e)=>{
                                        let debtorName='';
                                        let debtorAddress='';
                                        let debtorDefaultCreditTerm='';

                                        dataSelectDebtor.data.forEach(data=>{
                                            
                                            if(data[dataSelectDebtor.field[0].name]===e.target.value) {
                                                debtorName=data[dataSelectDebtor.field[1].name]?data[dataSelectDebtor.field[1].name]:'';
                                                debtorAddress=data[dataSelectDebtor.field[2].name]?data[dataSelectDebtor.field[2].name]:'';
                                                debtorDefaultCreditTerm=data[dataSelectDebtor.field[7].name]?data[dataSelectDebtor.field[7].name]:'';
                                            }
                                            
                                        })
                                    
                                    changeInputState([e.target.value,debtorName,debtorAddress,
                                        ...inputState.slice(3,creditTermPosition),debtorDefaultCreditTerm,
                                        ...inputState.slice(creditTermPosition+1)])
                                    changeParamDebtorOutstanding(
                                        paramDebtorOutstanding(e.target.value,inputState[oldNumPosition])
                                        )
                                    
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {debtorList}
                                    </select>
                                </div>
                                <label className='mt-3' htmlFor='debtorName'>Debtor Name</label>
                                <input id='debtorName' value={inputState[1]} onChange={(e)=>e} required className='form-control'/>
                                <label className='mt-3' htmlFor='debtorAddress'>Debtor Address</label>
                                <textarea id='debtorAddress' value={inputState[2]} onChange={(e)=>e} required className='form-control'/>
                                
                            </fieldset>

                            <div className='form-group col-md-5 mx-3'>
                                <label htmlFor='creditNoteNumber' className='mt-3'>Credit Note Number <span className='text-warning'>*</span></label>
                                {inputNumberRender({
                                    onChange:onChange,
                                    layout:'',
                                    position:3,
                                    labelID:'creditNoteNumber'
                                })
                                }
                                
                                <label htmlFor='date' className='mt-3'>Date <span className='text-warning'>*</span></label>
                                <input type='date' disabled={disabled} required value={inputState[4]} onChange={(e)=>onChange(e.target.value,4)} 
                                className='form-control'/>
                                
                                <label className='mt-3' htmlFor='glCode' >GL Code <span className='text-warning'>*</span></label>
                                <div className='input-group'>
                                    <input type='text' id='glCode' value={inputState[7]} onChange={(e)=>e} required className='form-control' 
                                    disabled={disabled}/>
                                    <select className='form-control' style={{flex:'0 1 0'}} disabled={disabled} onChange={(e)=>{
                                    onChange(e.target.value,7)
                                    }}>
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
                                    <button type='button' className='btn btn-primary' disabled={disabled}
                                    onClick={()=>{
                                    
                                        changeInputState(
                                            inputState.slice(0,linePosition)
                                            .concat([inputState[linePosition].slice(0)
                                                .concat(
                                                    [[inputState[linePosition].length+1,'','','',0,0]])])
                                            .concat(inputState.slice(linePosition+1))
                                        )
                                    }}>
                                        +</button>
                                    <h6 className='d-inline-block mx-2 mx-md-4'>Credit Note Line</h6>
                                    <button type='button' className='btn btn-secondary' disabled={disabled}
                                    onClick={()=>
                                        changeInputState(
                                            inputState.slice(0,linePosition)
                                            .concat([inputState[linePosition].slice(0,inputState[linePosition].length-1)])
                                            .concat(inputState.slice(linePosition+1))
                                        )}>
                                    -</button>
                                </legend>

                                <LineRender linePosition={linePosition} disabled={disabled} inputState={inputState}
                                changeInputState={changeInputState} dataSelectStock={dataSelectStock} stockList={stockList}
                                calculateSubtotal={calculateSubtotal} />
                                
                                
                            </fieldset>

                            <h5 className='text-right mt-3 mb-4 col-12'>
                                {'Total: '+numberFormatParser(calculateTotal())}
                            </h5>
                            <h6 className='text-right mb-4 col-12'>
                                <span className="alert alert-secondary">{'Unapplied Amount: '+numberFormatParser(calculateUnappliedAmount())}</span>
                            </h6>
                            {errorUnappliedAmount}

                            <fieldset className='form-group col-md-12 mx-3 border border-secondary pb-4 rounded'>
                                <legend className='col-form-label col-10 offset-1 col-md-4 offset-md-4 text-center' >
                                    <h6 className='d-inline-block mx-2 mx-md-4'>OFFSET <br/> Sales Invoice / Debit Note</h6>
                                </legend>
                                <OffsetRender dataSelectOutstanding={dataSelectDebtorOutstanding} inputState={inputState} 
                                changeInputState={changeInputState} disabled={disabled}
                                calculateUnappliedAmount={calculateUnappliedAmount} calculateTotal={calculateTotal}
                                offsetPositionOne={offsetPositionSalesInvoice} offsetPositionTwo={offsetPositionDebitNote}
                                offsetDescriptionOne={offsetDescriptionOne} offsetDescriptionTwo={offsetDescriptionTwo}
                                changeErrorUnappliedAmount={changeErrorUnappliedAmount}/>
                            </fieldset>

                        </div>
                        <ItemButton usage={usage} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} 
                        changeDisabled={changeDisabled} path={`${path}/Preview`}/>
                        
                        
                        
                    </form>
                </div>
                </AppLayout>
            </Route>
            <Redirect to={CreditNoteItem.path}/>
        </Switch>)}
        </Item>
    )
}
CreditNoteItem.description='Credit Note';
CreditNoteItem.path='/CreditNoteItem';

export default CreditNoteItem;

