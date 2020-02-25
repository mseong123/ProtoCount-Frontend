import React,{useState} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';

function StockItem (props) {

    const url={
        item:new URLSearchParams(props.location.search).get('item'),
        id:new URLSearchParams(props.location.search).get('id'),
    }
    
    const [inputState,changeInputState]=useState(['','','','','','','','','',''])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1,inputState.length)])
    }

    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='stock' successPath='/StockItemMaintenance'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> 
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ StockItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}

                    <form onSubmit={(e)=>{e.preventDefault(); if(usage==='INSERT') onInsert(); else onUpdate()}}>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='itemNumber' >Item Number <span className='text-warning'>*</span></label>
                            {inputNumberRender({
                                onChange:onChange,
                                layout:'col-md-4',
                                position:0,
                                labelID:'itemNumber'
                            })
                            }
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='description'>Description <span className='text-warning'>*</span></label>
                            <div className='col-md-10'>
                                <textarea id='description' onChange={(e)=>
                                onChange(e.target.value,1)} 
                                value={inputState[1]} disabled={disabled} required className='form-control'/>
                            </div>
                        </div>
                        <div className='row'>
                            <fieldset className='form-group col-md-5 mx-3 border border-secondary pb-4 rounded'>
                                <legend className='col-form-label col-4 offset-4 text-center'><h6>Price</h6></legend>
                            
                                <label htmlFor='sellingPrice' className='col-12'>Selling Price:</label>
                                <div className='col-12'>
                                    <input type='number' min='0' step='.01' id='sellingPrice' onChange={(e)=>
                                onChange(e.target.value,2)} 
                                value={inputState[2]} disabled={disabled} className='form-control'/>
                                </div>
                                <label  htmlFor='minPrice' className='col-12'>Min Price:</label>
                                <div className='col-12'>
                                    <input type='number' min='0' step='.01' id='minPrice' onChange={(e)=>
                                onChange(e.target.value,3)} 
                                value={inputState[3]} disabled={disabled} className='form-control'/>
                                </div>
                                <label  htmlFor='maxPrice' className='col-12'>Max Price:</label>
                                <div className='col-12'>
                                    <input type='number' min='0' step='.01' id='maxPrice' onChange={(e)=>onChange(e.target.value,4)} 
                                value={inputState[4]} disabled={disabled} className='form-control'/>
                                </div>
                                <small className='text-warning'>2 decimal places only</small>
                            </fieldset>
                            <fieldset className='form-group col-md-5 mx-3 border border-secondary pb-4 rounded'>
                                <legend className='col-form-label col-4 offset-4 text-center'><h6>Cost</h6></legend>

                                <label htmlFor='standardCost' className='col-12'>Standard Cost:</label>
                                <div className='col-12'>
                                    <input type='number' min='0' step='.01' id='standardCost' onChange={(e)=>onChange(e.target.value,5)} 
                                value={inputState[5]} disabled={disabled} className='form-control'/>
                                </div>
                                <small className='text-warning'>2 decimal places only</small>
                            </fieldset>
                            <fieldset className='form-group col-md-5 mx-3 border border-secondary pb-4 rounded'>
                                <legend className='col-form-label col-4 offset-4 text-center'><h6>Stock Level</h6></legend>

                                <label htmlFor='minQTY' className='col-12'>Min Quantity(Re-order Level):</label>
                                <div className='col-12'>
                                    <input type='number' min='0' step='1' id='minQTY' onChange={(e)=>onChange(e.target.value,6)} 
                                value={inputState[6]} disabled={disabled} className='form-control'/>
                                </div>
                                <label htmlFor='maxQTY' className='col-12'>Max Quantity:</label>
                                <div className='col-12'>
                                    <input type='number' min='0' step='1' id='maxQTY' onChange={(e)=>onChange(e.target.value,7)} 
                                value={inputState[7]} disabled={disabled} className='form-control'/>
                                </div>
                                <label htmlFor='balanceQTY' className='col-12'>Balance Quantity: <span className='text-warning'>*</span></label>
                                <div className='col-12'>
                                    <input type='number' min='0' step='1' id='balanceQTY' onChange={(e)=>onChange(e.target.value,8)} 
                                value={inputState[8]} disabled={disabled} 
                                required className='form-control'/>
                                </div>
                                <small className='text-warning'>round numbers only</small>
                            </fieldset>
                        </div>
                        
                        <ItemButton usage={usage} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} changeDisabled={changeDisabled}/>
                        
                        
                        
                    </form>
                </div>
            </AppLayout>)
            }
        
        </Item>
    )
}
StockItem.description='Stock Item';
StockItem.path='/StockItem';

export default StockItem;