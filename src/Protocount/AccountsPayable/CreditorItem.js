import React,{useState} from 'react';
import Item from '../Shared/Item';
import ItemButton from '../Shared/ItemButton';
import AppLayout from '../Shared/AppLayout';

function CreditorItem (props) {

    const url={
        item:new URLSearchParams(props.location.search).get('item'),
        id:new URLSearchParams(props.location.search).get('id'),
    }
    
    const [inputState,changeInputState]=useState(['','','','','','','','COD','',''])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1,inputState.length)])
    }

    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='creditor' successPath='/CreditorMaintenance'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> 
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ CreditorItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}

                    <form onSubmit={(e)=>{e.preventDefault(); if(usage==='INSERT') onInsert(); else onUpdate()}}>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='creditorNumber' >Creditor Number <span className='text-warning'>*</span></label>
                            {inputNumberRender({
                                onChange:onChange,
                                layout:'col-md-4',
                                position:0,
                                labelID:'creditorNumber'
                            })
                            }
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='name'>Name <span className='text-warning'>*</span></label>
                            <div className='col-md-10'>
                                <input type='text' id='name' onChange={(e)=>
                                onChange(e.target.value,1)} value={inputState[1]} disabled={disabled} required className='form-control'/>
                            </div>
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='address'>Address <span className='text-warning'>*</span></label>
                            <div className='col-md-10'>
                                <textarea id='address' onChange={(e)=>
                                onChange(e.target.value,2)} 
                                value={inputState[2]} disabled={disabled} required className='form-control'/>
                            </div>
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='postcode'>Postcode <span className='text-warning'>*</span></label>
                            <div className='col-md-4'>
                                <input type='text' maxLength='5' id='postcode' onChange={(e)=>
                                onChange(e.target.value,3)} value={inputState[3]} disabled={disabled} required className='form-control'/>
                            </div>
                            <label className='col-md-2 col-form-label text-md-center' htmlFor='phone'>Phone <span className='text-warning'>*</span></label>
                            <div className='col-md-4'>
                                <input type='text' id='phone' maxLength='15' onChange={(e)=>onChange(e.target.value,4)} 
                                value={inputState[4]} disabled={disabled} required className='form-control'/>
                            </div>
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='fax'>Fax</label>
                            <div className='col-md-4'>
                                <input type='text' id='fax' maxLength='15' onChange={(e)=>
                                onChange(e.target.value,5)} value={inputState[5]} disabled={disabled} className='form-control'/>
                            </div>
                            <label className='col-md-2 col-form-label text-md-center' htmlFor='creditTerm'>Credit Term</label>
                            <div className='col-md-4'>
                                <select id='creditTerm' onChange={(e)=> onChange(e.target.value,7)} value={inputState[7]} disabled={disabled} 
                                className='form-control'>
                                    <option value='COD'>C.O.D.</option>
                                    <option value='30'>30 Days</option>
                                    <option value='45'>45 Days</option>
                                    <option value='60'>60 Days</option>
                                    <option value='90'>90 Days</option>
                                </select>
                            </div>
                        </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='otherDesc'>Other Description</label>
                            <div className='col-md-10'>
                                <textarea id='otherDesc' onChange={(e)=>
                                onChange(e.target.value,6)} 
                                value={inputState[6]} disabled={disabled} className='form-control'/>
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
CreditorItem.description='Creditor Item';
CreditorItem.path='/CreditorItem';

export default CreditorItem;