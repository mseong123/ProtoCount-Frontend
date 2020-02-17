import React,{useState} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';

function BankItem (props) {

    const url={
        item:new URLSearchParams(props.location.search).get('item'),
        id:new URLSearchParams(props.location.search).get('id'),
    }
    
    const [inputState,changeInputState]=useState(['','','','','',''])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1,inputState.length)])
    }

    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='BANK' successPath='/BankMaintenance'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> 
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ BankItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}

                    <form onSubmit={(e)=>{e.preventDefault(); if(usage==='INSERT') onInsert(); else onUpdate()}}>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='bankCode' >Bank Code <span className='text-warning'>*</span></label>
                            {inputNumberRender({
                                onChange:onChange,
                                layout:'col-md-4',
                                position:0,
                                labelID:'bankCode'
                            })
                            }
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='bankName'>Bank Name <span className='text-warning'>*</span></label>
                            <div className='col-md-10'>
                                <input type='text' id='bankName' onChange={(e)=>
                                onChange(e.target.value,1)} value={inputState[1]} disabled={disabled} required className='form-control'/>
                            </div>
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='bankAddress'>Bank Address <span className='text-warning'>*</span></label>
                            <div className='col-md-10'>
                                <textarea id='bankAddress' onChange={(e)=>
                                onChange(e.target.value,2)} 
                                value={inputState[2]} disabled={disabled} required className='form-control'/>
                            </div>
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='bankPostcode'>Bank Postcode <span className='text-warning'>*</span></label>
                            <div className='col-md-4'>
                                <input type='text' maxLength='5' id='bankPostcode' onChange={(e)=>
                                onChange(e.target.value,3)} value={inputState[3]} disabled={disabled} required className='form-control'/>
                            </div>
                        </div>

                        <ItemButton usage={usage} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} changeDisabled={changeDisabled}/>
                        
                        
                        
                    </form>
                </div>
            </AppLayout>)
            }
        
        </Item>
    )
}
BankItem.description='Bank Item';
BankItem.path='/BankItem';

export default BankItem;