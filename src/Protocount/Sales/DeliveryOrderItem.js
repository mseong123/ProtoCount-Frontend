import React,{useState,useEffect,useContext} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';
import DocumentOne from '../Shared/preview/DocumentOne';
import numberFormatParser from '../Shared/numberFormatParser';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';



function DeliveryOrderItem (props) {
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


    const linePosition=7;

    const [debtorList,changeDebtorList] = useState(null);
    const [stockList,changeStockList] = useState(null);
    const [inputState,changeInputState]=useState(['','','','','','','',[]]) 
    
    const [preview,changePreview]=useState(false);
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


    },[dataSelectDebtor,errorSelectDebtor,dataSelectStock,errorSelectStock])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1)])
    }
    function onChangeDeliveryOrderlineInput(e,order,lineNumber,innerOrder) {
        changeInputState(inputState.slice(0,order)
        .concat([inputState[order].slice(0,lineNumber)
        .concat([inputState[order][lineNumber].slice(0,innerOrder)
        .concat(e)
        .concat(inputState[order][lineNumber].slice(innerOrder+1))])
        .concat(inputState[order].slice(lineNumber+1))])
        .concat(inputState.slice(order+1)))
    }
    

    function calculateTotal() {
        let total=0
        inputState[linePosition].forEach((deliveryorderlineSet,i)=>{

            if(inputState[linePosition][i][3]!=='')
             total=total+(parseInt(inputState[linePosition][i][3]))
        })
        return total;
    }
    
    function deliveryorderlineListRender(disabled) {
    return(
        inputState[linePosition].map((deliveryorderlineSet,i)=>
        <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}} key={i}>
            {/*set fixed flex basis so layout is consistent with h6 header as well*/}
            <label htmlFor='lineNumber' className='sr-only'/>
            <input type='number' id='lineNumber' className='col form-control rounded-0 text-center' 
            value={inputState[linePosition][i][0]?inputState[linePosition][i][0]:''} 
            onChange={(e)=>e} style={{flex:'1 0 50px',paddingLeft:10,paddingRight:0}} disabled={disabled}/>

            <div className='col input-group' style={{flex:'1 0 50px',paddingLeft:0,paddingRight:0}}>
                <label htmlFor='itemCode' className='sr-only'/>
                <input type='text' id ='itemCode' className='form-control rounded-0' disabled={disabled}
                style={{paddingLeft:10}}
                value={inputState[linePosition][i][1]?inputState[linePosition][i][1]:''} 
                onChange={(e)=>onChangeDeliveryOrderlineInput(e.target.value,linePosition,i,1)}/>
                <select className='form-control rounded-0' style={{flex:'0 1 0'}} disabled={disabled} onChange={(e)=>{
                        let stockDescription='';
                        
                        dataSelectStock.data.forEach(data=>{
                            
                            if(data[dataSelectStock.field[0].name]===e.target.value) {
                                stockDescription=data[dataSelectStock.field[1].name]?data[dataSelectStock.field[1].name]:'';
                            }
                        })
                        
                        changeInputState(inputState.slice(0,linePosition)
                        .concat([inputState[linePosition].slice(0,i)
                        .concat([inputState[linePosition][i].slice(0,1)
                        .concat(e.target.value).concat(stockDescription)
                        .concat(inputState[linePosition][i].slice(3))])
                        .concat(inputState[linePosition].slice(i+1))])
                        .concat(inputState.slice(linePosition+1)))

                        }}>
                    <option value=''>-select an option- </option>
                    {stockList}
                </select>
            </div>
            <label htmlFor='description' className='sr-only'/>
            <input type='text' id='description' required className='col form-control rounded-0' value={inputState[linePosition][i][2]} 
            onChange={(e)=>onChangeDeliveryOrderlineInput(e.target.value,linePosition,i,2)} disabled={disabled}
            style={{flex:'1 0 225px',paddingLeft:10,paddingRight:0}}/>

            <label htmlFor='qty' className='sr-only'/>
            <input type='number' required min='0' step='1' id='qty' className='col form-control rounded-0 text-center' value={inputState[linePosition][i][3]} 
            onChange={(e)=>onChangeDeliveryOrderlineInput(e.target.value,linePosition,i,3)} disabled={disabled}
            style={{flex:'1 0 75px',paddingLeft:10,paddingRight:0}}/>

            
        </div>)
        )
    }
    
    
    /*error display extension from error display already provided by Item Component*/
    let errorDisplayExtension=null;
    
    
    if ((dataSelectDebtor && dataSelectDebtor.error) || errorSelectDebtor ||(dataSelectStock && dataSelectStock.error) || errorSelectStock ) 
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

        </div>)

    
    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='delivery_order' successPath='/DeliveryOrder'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> preview? (
            <DocumentOne description={DeliveryOrderItem.description} 
                changePreview={changePreview}
                preview={preview}
                topLeftInput={[inputState[1],inputState[2]]}
                topRightField={[DeliveryOrderItem.description+' No','Date','Other Description']}
                topRightInput={[inputState[3],inputState[4]]}
                bottomField={['','Item Code','Description','Qty']}
                bottomInput={inputState[linePosition]}
                
                calculateTotal={calculateTotal}
                footer='Goods sold are neither returnable or refundable. Otherwise a cancellation fee of 20% on purchase price will be imposed.'
            />)
            :
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ DeliveryOrderItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}
                    {errorDisplayExtension}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}
                    <form onSubmit={(e)=>{e.preventDefault(); if(usage==='INSERT') onInsert(); else onUpdate()}}>
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
                                    
                                        dataSelectDebtor.data.forEach(data=>{
                                            
                                            if(data[dataSelectDebtor.field[0].name]===e.target.value) {
                                                debtorName=data[dataSelectDebtor.field[1].name]?data[dataSelectDebtor.field[1].name]:'';
                                                debtorAddress=data[dataSelectDebtor.field[2].name]?data[dataSelectDebtor.field[2].name]:'';
                                            }
                                            
                                        })
                                    
                                    changeInputState([e.target.value,debtorName,debtorAddress,...inputState.slice(3,inputState.length)])
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
                                <label htmlFor='deliveryOrderNumber' className='mt-3'>Delivery Order Number <span className='text-warning'>*</span></label>
                                {inputNumberRender({
                                    onChange:onChange,
                                    layout:'',
                                    position:3,
                                    labelID:'deliveryOrderNumber'
                                })
                                }
                                
                                <label htmlFor='date' className='mt-3'>Date <span className='text-warning'>*</span></label>
                                <input type='date' disabled={disabled} required value={inputState[4]} onChange={(e)=>onChange(e.target.value,4)} 
                                className='form-control'/>
                                
                                <label htmlFor='description' className='mt-3'>Description</label>
                                <textarea id='description' onChange={(e)=>onChange(e.target.value,5)} value={inputState[5]} 
                                disabled={disabled} className='form-control'/>
                                
                            </div>

                            <fieldset className='form-group col-md-12 mx-3 border border-secondary pb-4 rounded'>
                                <legend className='col-form-label col-10 offset-1 col-md-4 offset-md-4 text-center' >
                                    <button type='button' className='btn btn-primary' disabled={disabled}
                                    onClick={()=>
                                        changeInputState(
                                            inputState.slice(0,linePosition)
                                            .concat([inputState[linePosition].slice(0)
                                                .concat(
                                                    [[inputState[linePosition].length+1,'','','']])])
                                            .concat(inputState.slice(linePosition+1))
                                        )
                                    
                                    }>
                                        +</button>
                                    <h6 className='d-inline-block mx-2 mx-md-4'>Delivery Order Line</h6>
                                    <button type='button' className='btn btn-secondary' disabled={disabled}
                                    onClick={()=>
                                        changeInputState(
                                            inputState.slice(0,linePosition)
                                            .concat([inputState[linePosition].slice(0,inputState[linePosition].length-1)])
                                            .concat(inputState.slice(linePosition+1))
                                        )
                                    }>-</button>
                                </legend>
                                <div className="overflow-auto">
                                    {/*flex nowrap and overflow auto for mobile view*/}
                                    <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}}>
                                        <h6 className='col' style={{flex:'1 0 50px',paddingLeft:10,paddingRight:10}}>Line Number</h6>
                                        <h6 className='col' style={{flex:'1 0 50px',paddingLeft:10,paddingRight:10}}>Item Code</h6>
                                        <h6 className='col' style={{flex:'1 0 225px',paddingLeft:10,paddingRight:10}}>Description</h6>
                                        <h6 className='col' style={{flex:'1 0 75px',paddingLeft:10,paddingRight:10}}>Qty</h6>
                                        
                                    </div>
                                    {deliveryorderlineListRender(disabled)}
                                    
                                </div>
                                <h5 className='text-right my-3'>
                                    
                                    {'Total: '+numberFormatParser(calculateTotal())}
                                    </h5>
                                
                            </fieldset>

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
DeliveryOrderItem.description='Delivery Order';
DeliveryOrderItem.path='/DeliveryOrderItem';

export default DeliveryOrderItem;

