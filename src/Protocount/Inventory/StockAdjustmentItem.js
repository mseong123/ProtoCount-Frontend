import React,{useState,useEffect,useContext} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';
import numberFormatParser from '../Shared/numberFormatParser';
import dateFormatParser from '../Shared/dateFormatParser';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import LineRenderQtyOnly from '../Shared/LineRenderQtyOnly';



function StockAdjustmentItem (props) {
    const url={
        item:new URLSearchParams(props.location.search).get('item'),
        id:new URLSearchParams(props.location.search).get('id'),
    }

    const [{data:dataSelectStock,error:errorSelectStock}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
                item:'stock',
                param:url.id?[url.id]:null
            }),
            credentials:'include'
        }
    });//extension of Item component


    const linePosition=4;

    const [stockList,changeStockList] = useState(null);
    const [inputState,changeInputState]=useState(['','','','',[]]) 
    
    const {changeAuth} = useContext(authContext);

    useEffect(()=>{

        if (dataSelectStock && dataSelectStock.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
        else if (dataSelectStock && dataSelectStock.data && dataSelectStock.field) {
            const stockNum=dataSelectStock.field[0].name;
            const stockDesc=dataSelectStock.field[1].name;
            const stockBalQty=dataSelectStock.field[8].name;
            
            changeStockList(dataSelectStock.data.map(data=>(
                <option key={data[stockNum]} value={data[stockNum]}>
                    {data[stockNum]+' | '
                    + (data[stockDesc]?data[stockDesc]:'')+' | Bal Qty = '
                    + (data[stockBalQty]?data[stockBalQty]:'0')}
                </option>)
                )
            )
        }
    },[dataSelectStock,errorSelectStock])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1)])
    }

    function onChangeStockAdjustmentlineInput(e,order,lineNumber,innerOrder) {
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
        inputState[linePosition].forEach((stockadjustmentlineSet,i)=>{

            if(inputState[linePosition][i][3]!=='')
             total=total+(parseInt(inputState[linePosition][i][3]))
        })
        return total;
    }

    function stockAdjustmentlineListRender(disabled) {
        return(
            inputState[linePosition].map((stockAdjustmentlineSet,i)=>
            <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}} key={i}>
                {/*set fixed flex basis so layout is consistent with h6 header as well*/}
                <label htmlFor='lineNo' className='sr-only'/>
                <input type='number' id='lineNo' className='col form-control rounded-0 text-center' value={inputState[linePosition][i][0]?
                inputState[linePosition][i][0]:''} 
                onChange={(e)=>e} style={{flex:'1 0 80px',paddingLeft:10,paddingRight:0}} disabled={disabled}/>
    
                <div className='col input-group' style={{flex:'1 0 120px',paddingLeft:0,paddingRight:0}}>
                    <label htmlFor='itemCode' className='sr-only'/>
                    <input type='text' id ='itemCode' required className='form-control rounded-0' disabled={disabled}
                    style={{paddingLeft:10}}
                    value={inputState[linePosition][i][1]?inputState[linePosition][i][1]:''} onChange={(e)=>e}/>
                    <select className='form-control rounded-0' style={{flex:'0 1 0'}} disabled={disabled} onChange={(e)=>{
                            let stockDescription='';
                            let itemCode=e.target.value

                            dataSelectStock.data.forEach(data=>{        
                                if(data[dataSelectStock.field[0].name]===e.target.value) {
                                    stockDescription=data[dataSelectStock.field[1].name]?
                                        data[dataSelectStock.field[1].name]:'';
                                }
                            })
    
                            changeInputState(inputState=>inputState.slice(0,linePosition)
                            .concat([inputState[linePosition].slice(0,i)
                            .concat([inputState[linePosition][i].slice(0,1)
                            .concat(itemCode).concat(stockDescription)
                            .concat(inputState[linePosition][i].slice(3))])
                            .concat(inputState[linePosition].slice(i+1))])
                            .concat(inputState.slice(linePosition+1))
                            )
            
                            }}>
                        <option value=''>-select an option- </option>
                        {stockList}
                    </select>
                </div>
                <label htmlFor='description' className='sr-only'/>
                <input type='text' id='description' required className='col form-control rounded-0' value={inputState[linePosition][i][2]?
                inputState[linePosition][i][2]:''} 
                onChange={(e)=>e} disabled={disabled}
                style={{flex:'1 0 225px',paddingLeft:10,paddingRight:0}}/>
    
                <label htmlFor='qty' className='sr-only'/>
                <input type='number' required  step='1' min='-1000000' max='1000000' id='qty' required className='col form-control rounded-0' 
                value={inputState[linePosition][i][3]} disabled={disabled}
                style={{flex:'1 0 75px',paddingLeft:10,paddingRight:0}}
                onChange={(e)=>onChangeStockAdjustmentlineInput(e.target.value,linePosition,i,3)}/>
    
            </div>)
            )
        }

    /*error display extension from error display already provided by Item Component*/
    let errorDisplayExtension=null;
    
    
    if ((dataSelectStock && dataSelectStock.error) || errorSelectStock ) 
    errorDisplayExtension=(
        <div className="alert alert-warning">
            {dataSelectStock && dataSelectStock.error? 'Stock List RETRIEVAL for item failed errno: '+dataSelectStock.error.errno
            +' code: '+dataSelectStock.error.code+' message: '+dataSelectStock.error.sqlMessage:null}
            {errorSelectStock? 'Stock List RETRIEVAL for item failed '+errorSelectStock : null}
        </div>)

    
    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='stock_adjustment' successPath='/StockAdjustment'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> 
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ StockAdjustmentItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}
                    {errorDisplayExtension}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}
                    <form onSubmit={(e)=>{e.preventDefault(); if(usage==='INSERT') onInsert(); else onUpdate()}}>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='stockAdjustmentNumber' >Stock Adjustment Number <span className='text-warning'>*</span></label>
                            {inputNumberRender({
                                onChange:onChange,
                                layout:'col-md-4',
                                position:0,
                                labelID:'stockAdjustmentNumber'
                            })
                            }
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='data'>Date <span className='text-warning'>*</span></label>
                            <div className='col-md-4'>
                                <input type='date' id='date' onChange={(e)=>
                                onChange(e.target.value,1)} value={inputState[1]} disabled={disabled} required className='form-control'/>
                            </div>
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='description'>Description</label>
                            <div className='col-md-10'>
                                <textarea id='description' onChange={(e)=>
                                onChange(e.target.value,2)} 
                                value={inputState[2]} disabled={disabled} className='form-control'/>
                            </div>
                        </div>
                        
                        <fieldset className='form-group border border-secondary pb-4 rounded px-3'>
                            <legend className='col-form-label col-12 col-md-6 offset-md-3 text-center' >
                                <button type='button' className='btn btn-primary' disabled={disabled}
                                onClick={()=>
                                    changeInputState(
                                        inputState.slice(0,linePosition)
                                        .concat([inputState[linePosition].slice(0)
                                            .concat(
                                                [[inputState[linePosition].length+1,'','','']])])
                                        .concat(inputState.slice(linePosition+1))
                                    )
                                }>+</button>
                                <h6 className='d-inline-block mx-2 mx-md-4'>Stock Adjustment Line</h6>
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
                                    <h6 className='col' style={{flex:'1 0 80px',paddingLeft:10,paddingRight:10}}>Line No.</h6>
                                    <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>Item Code</h6>
                                    <h6 className='col' style={{flex:'1 0 225px',paddingLeft:10,paddingRight:10}}>Description</h6>
                                    <h6 className='col' style={{flex:'1 0 75px',paddingLeft:10,paddingRight:10}}>Qty</h6>
                                </div>
                                {stockAdjustmentlineListRender(disabled)}
                            </div>
                        </fieldset>
                        
                                
                        <h5 className='text-right my-3 col-12'>
                            {'Total: '+numberFormatParser(calculateTotal())}
                        </h5>

                        
                        <ItemButton usage={usage} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} 
                        changeDisabled={changeDisabled}/>
                    </form>
                </div>
            </AppLayout>)}
        
        </Item>
    )
}
StockAdjustmentItem.description='Stock Adjustment';
StockAdjustmentItem.path='/StockAdjustmentItem';

export default StockAdjustmentItem;

