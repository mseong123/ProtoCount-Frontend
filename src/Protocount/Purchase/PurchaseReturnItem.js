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
import LineRenderQtyOnly from '../Shared/LineRenderQtyOnly';


function PurchaseReturnItem (props) {
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
            body:JSON.stringify({
                item:'stock',
                param:url.id?[url.id]:null
            }),
            credentials:'include'
        }
    });//extension of Item component


    const linePosition=7;
    const stockControlPosition=8;

    const [creditorList,changeCreditorList] = useState(null);
    const [stockList,changeStockList] = useState(null);
    const [inputState,changeInputState]=useState(['','','','','','','',[],[]]) 
    
    const {path} = useRouteMatch();
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
        else if (dataSelectStock && dataSelectStock.data && dataSelectStock.field) {
            const stockNum=dataSelectStock.field[0].name;
            const stockDesc=dataSelectStock.field[1].name;
            const stockPrice=dataSelectStock.field[2].name;
            const stockBalQty=dataSelectStock.field[8].name;

            changeStockList(dataSelectStock.data.map(data=>(
                <option key={data[stockNum]} value={data[stockNum]}>
                    {data[stockNum]+' | '
                    + (data[stockDesc]?data[stockDesc]:'')+' | Price = '
                    + (data[stockPrice]?data[stockPrice]:'')+' | Bal Qty = '
                    + (data[stockBalQty]?data[stockBalQty]:'0')}
                </option>)
                )
            )
        }
            


    },[dataSelectCreditor,errorSelectCreditor,dataSelectStock,errorSelectStock])

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

    function onChange(value,order) {
        changeInputState([...inputState.slice(0,order),value,...inputState.slice(order+1)])
    }

    function calculateTotal() {
        let total=0
        inputState[linePosition].forEach((purchasereturnlineSet,i)=>{

            if(inputState[linePosition][i][3]!=='')
             total=total+(parseInt(inputState[linePosition][i][3]))
        })
        return total;
    }
    
    /*error display extension from error display already provided by Item Component*/
    let errorDisplayExtension=null;
    
    
    if ((dataSelectCreditor && dataSelectCreditor.error) || errorSelectCreditor ||(dataSelectStock && dataSelectStock.error) || errorSelectStock ) 
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

        </div>)

    
    return (
        <Item inputState={inputState} changeInputState={changeInputState} url={url} item='purchase_return' successPath='/PurchaseReturn'>
            {
            ({usage,disabled,changeDisabled,onInsert,onUpdate,onDelete,errorDisplay,inputNumberRender})=> 
            (<Switch>
                <Route exact path={`${path}/Preview`}>
                    <DocumentOne description={PurchaseReturnItem.description} 
                        backPath={PurchaseReturnItem.path} 
                        topLeftInput={[inputState[1],inputState[2]]}
                        topRightField={[PurchaseReturnItem.description+' No','Date','Other Description']}
                        topRightInput={[inputState[3],dateFormatParser(inputState[4])]}
                        bottomField={['','Item Code','Description','Qty']}
                        bottomInput={inputState[linePosition]}
                        calculateTotal={calculateTotal}
                        footer=''
                    />
            </Route>
            <Route exact path={path}>
            <AppLayout >
                <div className='container pb-5 px-md-5'>

                    {/*Heading renders depending on INSERT or UPDATE/DELETE state*/}

                    <h3 className='my-3'>{(usage==='INSERT'? 'Create':'Update') + ' '+ PurchaseReturnItem.description}</h3>
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
                                    
                                        dataSelectCreditor.data.forEach(data=>{
                                            
                                            if(data[dataSelectCreditor.field[0].name]===e.target.value) {
                                                creditorName=data[dataSelectCreditor.field[1].name]?data[dataSelectCreditor.field[1].name]:'';
                                                creditorAddress=data[dataSelectCreditor.field[2].name]?data[dataSelectCreditor.field[2].name]:'';
                                            }
                                            
                                        })
                                    
                                    changeInputState([e.target.value,creditorName,creditorAddress,...inputState.slice(3,inputState.length)])
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
                                <label htmlFor='purchaseReturnNumber' className='mt-3'>Purchase Return Number <span className='text-warning'>*</span></label>
                                {inputNumberRender({
                                    onChange:onChange,
                                    layout:'',
                                    position:3,
                                    labelID:'purchaseReturnNumber'
                                })
                                }
                                
                                <label htmlFor='date' className='mt-3'>Date <span className='text-warning'>*</span></label>
                                <input type='date' disabled={disabled} required value={inputState[4]} onChange={(e)=>onChange(e.target.value,4)} 
                                className='form-control'/>
                                
                                <label htmlFor='description' className='mt-3'>Description</label>
                                <textarea id='description' onChange={(e)=>onChange(e.target.value,5)} value={inputState[5]} 
                                disabled={disabled} className='form-control'/>
                                
                            </div>

                            <LineRenderQtyOnly linePosition={linePosition} stockControlPosition={stockControlPosition} 
                            disabled={disabled} inputState={inputState} changeInputState={changeInputState} 
                            dataSelectStock={dataSelectStock} stockList={stockList} stockDirection='out'
                            lineDescription={'Purchase Return Line'}
                            />

                            <h5 className='text-right my-3 col-12'>
                                {'Total: '+numberFormatParser(calculateTotal())}
                            </h5>

                        </div>
                        <ItemButton usage={usage} onInsert={onInsert} onUpdate={onUpdate} onDelete={onDelete} 
                        changeDisabled={changeDisabled} path={`${path}/Preview`}/>
                        
                        
                        
                    </form>
                </div>
            </AppLayout>
            </Route>
            <Redirect to={PurchaseReturnItem.path}/>
        </Switch>)}
        
        </Item>
    )
}
PurchaseReturnItem.description='Purchase Return';
PurchaseReturnItem.path='/PurchaseReturnItem';

export default PurchaseReturnItem;

