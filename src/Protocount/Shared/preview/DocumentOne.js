import React from 'react';
import numberFormatParser from '../numberFormatParser'

/*Layout for SALES INVOICE,PURCHASE INVOICE,DEBIT NOTE,CREDIT NOTE*/

function DocumentOne(props) {

    const topLeftInput=props.topLeftInput? props.topLeftInput.map((input,i)=>
        <p className='my-2' key={i}>{input}</p>
        ):null;

    const topRightArea=props.topRightField && props.topRightInput? props.topRightField.map((field,i)=>
        (<div className='row' key={i}>
            <div className='col-6 h6'>
                {field}
            </div>
            <div className='col-1'>
                :
            </div>
            <div className='col-4 h6'>
                {props.topRightInput[i]}
            </div>
        </div>)):null;

    const bottomField=props.bottomField? props.bottomField.map(field=>
        <th className='text-nowrap' key={field}>{field}</th>
        ):null;

    const bottomInput=props.bottomInput? props.bottomInput.map((itemline,i)=>
        
         <tr key={i}>
            {itemline.map((input,i)=>(
                <td key={i}>{input}</td>
                )
            )}
            {props.calculateSubtotal? <td>{numberFormatParser(props.calculateSubtotal(i))}</td>:null}
        </tr>
    
        ):null;
    
    return (
        <div className='container py-5' style={{maxWidth:'800px'}}>
            <button type='click' className='btn btn-secondary d-print-none mb-2' 
            onClick={()=>{
                props.changePreview(!props.preview);
                document.querySelector("meta[name=viewport]").setAttribute(
                    'content','width=device-width, initial-scale=1.0');
                }}>Back</button>
            <div className='jumbotron' style={{padding:0}}>
                <h1 className='text-center'>{props.description}</h1>
            </div>
            <div className='row' style={{margin:0}}>
                <div className='col-6 jumbotron h5' style={{marginBottom:0}}>
                    {topLeftInput}
                </div>
                <div className='col-6 py-5'>
                    {topRightArea}
                </div>
            </div>
            <hr className='border border-secondary my-3'/>
            <table className='table table-bordered'>
                <thead>
                    {bottomField}
                </thead>
                    
                <tbody>
                    {bottomInput}
                </tbody>
            </table>
            
            <h3 className='text-right px-3'>
                {'Total: '+numberFormatParser(props.calculateTotal())}
            </h3>
            <hr className='border border-secondary'/>
            <p className='text-center'>{props.footer}</p>
            
        </div>
    )
}


export default DocumentOne;