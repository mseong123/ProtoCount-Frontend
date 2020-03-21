import React,{useState,useEffect,useContext} from 'react';
import Item from '../Shared/Item';
import AppLayout from '../Shared/AppLayout';
import useFetch from '../Shared/useFetch';
import numberFormatParser from '../Shared/numberFormatParser';
import authContext from '../Shared/authContext';



function JournalItem (props) {
    const url={
        item:new URLSearchParams(props.location.search).get('item'),
        id:new URLSearchParams(props.location.search).get('id'),
    }

    const [{data:dataSelectGLCode,error:errorSelectGLCode}]=useFetch({
        url:'./getEligibleGLAccount',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'journal'}),
            credentials:'include'
        }
    });//extension of Item component

    
    const linePosition=4;

    const [GLCodeList,changeGLCodeList] = useState(null);
    const [inputState,changeInputState]=useState(['','','','',[]])
    
    const [notBalanced,changeNotBalanced]=useState(false);
    const {changeAuth} = useContext(authContext);

    useEffect(()=>{

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
        
    },[dataSelectGLCode,errorSelectGLCode])

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1)])
    }
    function onChangeJournallineInput(e,order,lineNumber,innerOrder) {
        changeInputState(inputState.slice(0,order)
        .concat([inputState[order].slice(0,lineNumber)
        .concat([inputState[order][lineNumber].slice(0,innerOrder)
        .concat(e)
        .concat(inputState[order][lineNumber].slice(innerOrder+1))])
        .concat(inputState[order].slice(lineNumber+1))])
        .concat(inputState.slice(order+1)))
    }

    function calculateDebitTotal() {
        let total=0
        inputState[linePosition].forEach((journallineSet,i)=>{
            if(inputState[linePosition][i][4])
             total+=parseFloat(inputState[linePosition][i][4])
        })
        return +(total.toFixed(2));
    }

    function calculateCreditTotal() {
        let total=0
        inputState[linePosition].forEach((journallineSet,i)=>{
            if(inputState[linePosition][i][5]) {
             total+=parseFloat(inputState[linePosition][i][5])
            }
        })
        return +(total.toFixed(2));
    }
    
    function journallineListRender(disabled) {
    return(
        inputState[linePosition].map((journallineSet,i)=>
        <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}} key={i}>
            {/*set fixed flex basis so layout is consistent with h6 header as well*/}
            <label htmlFor='lineNumber' className='sr-only'/>
            <input type='number' id='lineNumber' className='col form-control rounded-0 text-center' value={inputState[linePosition][i][0]?
            inputState[linePosition][i][0]:''} 
            onChange={(e)=>e} style={{flex:'1 0 90px',paddingLeft:10,paddingRight:0}} disabled={disabled}/>

            <div className='col input-group' style={{flex:'1 0 120px',paddingLeft:0,paddingRight:0}}>
                <label htmlFor='glCode' className='sr-only'/>
                <input type='text' id ='glCode' required className='form-control rounded-0' disabled={disabled}
                style={{paddingLeft:10}}
                value={inputState[linePosition][i][1]?inputState[linePosition][i][1]:''} onChange={(e)=>e}/>
                <select className='form-control rounded-0' style={{flex:'0 1 0'}} disabled={disabled} onChange={(e)=>{
                        let glDescription='';
                        dataSelectGLCode.data.forEach(data=>{
                            /*don't use strict comparison because options initial integer value obtained from DB 
                            is converted by React to string when applied to e.target.value*/
                            if(data[dataSelectGLCode.field[0].name]==e.target.value) 
                                glDescription=data[dataSelectGLCode.field[1].name]?data[dataSelectGLCode.field[1].name]:'';
                        })

                        changeInputState(inputState.slice(0,linePosition)
                        .concat([inputState[linePosition].slice(0,i)
                        .concat([inputState[linePosition][i].slice(0,1)
                        .concat(e.target.value).concat(glDescription)
                        .concat(inputState[linePosition][i].slice(3))])
                        .concat(inputState[linePosition].slice(i+1))])
                        .concat(inputState.slice(linePosition+1)))
        
                        }}>
                    <option value=''>-select an option- </option>
                    {GLCodeList}
                </select>
            </div>
            <label htmlFor='glDescription' className='sr-only'/>
            <input type='text' id='glDescription' required className='col form-control rounded-0' value={inputState[linePosition][i][2]?
            inputState[linePosition][i][2]:''} 
            onChange={(e)=>e} disabled={disabled}
            style={{flex:'1 0 120px',paddingLeft:10,paddingRight:0}}/>

            <label htmlFor='otherDescription' className='sr-only'/>
            <input type='text' id='otherDescription' className='col form-control rounded-0' value={inputState[linePosition][i][3]?
            inputState[linePosition][i][3]:''} 
            onChange={(e)=>onChangeJournallineInput(e.target.value,linePosition,i,3)} disabled={disabled}
            style={{flex:'1 0 225px',paddingLeft:10,paddingRight:0}}/>

            <label htmlFor='debit' className='sr-only'/>
            <input type='number' min='0' step='.01' id='debit' className='col form-control rounded-0 text-center' value={inputState[linePosition][i][4]?
            inputState[linePosition][i][4]:''} 
            onChange={(e)=>onChangeJournallineInput(e.target.value,linePosition,i,4)} disabled={disabled}
            style={{flex:'1 0 90px',paddingLeft:10,paddingRight:0}}/>

            <label htmlFor='credit' className='sr-only'/>
            <input type='number' min='0' step='.01' id='credit' className='col form-control rounded-0 text-center' value={inputState[linePosition][i][5]?
            inputState[linePosition][i][5]:''} 
            onChange={(e)=>onChangeJournallineInput(e.target.value,linePosition,i,5)} disabled={disabled}
            style={{flex:'1 0 90px',paddingLeft:10,paddingRight:0}}/>

        </div>)
        )
    }
    
    
    /*error display extension from error display already provided by Item Component*/
    let errorDisplayExtension=null;
    
    
    if ((dataSelectGLCode && dataSelectGLCode.error) || errorSelectGLCode) 
    errorDisplayExtension=(
        <div className="alert alert-warning">
            {dataSelectGLCode && dataSelectGLCode.error? 'GL Code List RETRIEVAL for item failed errno: '+dataSelectGLCode.error.errno
            +' code: '+dataSelectGLCode.error.code+' message: '+dataSelectGLCode.error.sqlMessage:null}
            {errorSelectGLCode? 'GL Code List RETRIEVAL for item failed '+errorSelectGLCode : null}
        </div>)

    
    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='journal' successPath='/JournalEntry'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> 
            (<AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ JournalItem.description}</h3>
                    <small className='text-warning'>* required</small>
                    {errorDisplay}
                    {errorDisplayExtension}

                    {/*onInsert and onUpdate needs to be attached to HTML form onSubmit eventhandler since native HTML form 
                    validation only works if submit event is handled here*/}
                    <form onSubmit={(e)=>{e.preventDefault(); if(usage==='INSERT') onInsert(); else onUpdate()}}>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='journalNumber' >Journal Number <span className='text-warning'>*</span></label>
                            {inputNumberRender({
                                onChange:onChange,
                                layout:'col-md-4',
                                position:0,
                                labelID:'journalNumber'
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
                            <legend className='col-form-label col-8 offset-2 col-md-4 offset-md-4 text-center' >
                                <button type='button' className='btn btn-primary' disabled={disabled}
                                onClick={()=>
                                    changeInputState(
                                        inputState.slice(0,linePosition)
                                        .concat([inputState[linePosition].slice(0)
                                            .concat(
                                                [[inputState[linePosition].length+1,'','','','0','0']])])
                                        .concat(inputState.slice(linePosition+1))
                                    )
                                }>
                                    +</button>
                                <h6 className='d-inline-block mx-2 mx-md-4'>Journal Line</h6>
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
                                    <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Line Number</h6>
                                    <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>GL Code</h6>
                                    <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>GL Desc</h6>
                                    <h6 className='col' style={{flex:'1 0 225px',paddingLeft:10,paddingRight:10}}>Other Description</h6>
                                    <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Debit</h6>
                                    <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Credit</h6>
                                </div>
                                {journallineListRender(disabled)}
                                    
                            </div>
                            {notBalanced? (
                                <div className="alert alert-danger mt-3">
                                    Journal Debit and Credit Entries not balanced!
                                </div>
                            ):null}
                            <h5 className='text-right my-3'> 
                                {'Total Debit: '+numberFormatParser(calculateDebitTotal())}
                            </h5>
                            <h5 className='text-right my-3'>
                                {'Total Crebit: '+numberFormatParser(calculateCreditTotal())}
                            </h5>
                                
                        </fieldset>
                        <div>
                            <button type='submit' onClick={e=>{
                                if(calculateDebitTotal()!==calculateCreditTotal()){
                                    e.preventDefault();
                                    changeNotBalanced(true);
                                }
                            }} className='btn btn-primary mx-1 my-1'>Submit</button>
                            {/*If state is 'INSERT', no Edit button & Delete button*/}
                            {usage==='UPDATE/DELETE'?(
                                <button type='button' onClick={(e)=>{changeDisabled(false)}} className='btn btn-outline-primary mx-1 my-1'>Edit</button>
                                ):null}
                            {usage==='UPDATE/DELETE'?(
                                <button type='button' onClick={(e)=>{onDelete()}} className='btn btn-danger mx-1 my-1'>Delete</button>
                                ):null}
                        </div>
                    </form>
                </div>
            </AppLayout>)
            }
        
        </Item>
    )
}
JournalItem.description='Journal';
JournalItem.path='/JournalItem';

export default JournalItem;

