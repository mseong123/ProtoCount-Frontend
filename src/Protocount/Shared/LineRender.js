import React from 'react';
import numberFormatParser from './numberFormatParser';

function LineRender(props) {

    function onChangeLineInput(e,order,lineNumber,innerOrder) {
        props.changeInputState(props.inputState.slice(0,order)
        .concat([props.inputState[order].slice(0,lineNumber)
        .concat([props.inputState[order][lineNumber].slice(0,innerOrder)
        .concat(e)
        .concat(props.inputState[order][lineNumber].slice(innerOrder+1))])
        .concat(props.inputState[order].slice(lineNumber+1))])
        .concat(props.inputState.slice(order+1)))
    }

    return (
        <div className="overflow-auto">
            {/*flex nowrap and overflow auto for mobile view*/}
            <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}}>
                <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Line No.</h6>
                <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>Item Code</h6>
                <h6 className='col' style={{flex:'1 0 225px',paddingLeft:10,paddingRight:10}}>Description</h6>
                <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Price</h6>
                <h6 className='col' style={{flex:'1 0 75px',paddingLeft:10,paddingRight:10}}>Qty</h6>
                <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Discount</h6>
                <h6 className='col' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Subtotal</h6>
            </div>

            {props.inputState[props.linePosition].map((lineSet,i)=>
            <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}} key={i}>
                {/*set fixed flex basis so layout is consistent with h6 header as well*/}
                <label htmlFor='lineNumber' className='sr-only'/>
                <input type='number' id='lineNumber' className='col form-control rounded-0' 
                value={props.inputState[props.linePosition][i][0]} 
                onChange={(e)=>e} style={{flex:'1 0 90px',paddingLeft:10,paddingRight:0}} disabled={props.disabled}/>

                <div className='col input-group' style={{flex:'1 0 120px',paddingLeft:0,paddingRight:0}}>
                    <label htmlFor='itemCode' className='sr-only'/>
                    <input type='text' id ='itemCode' className='form-control rounded-0' disabled={props.disabled}
                    style={{paddingLeft:10}}
                    value={props.inputState[props.linePosition][i][1]?props.inputState[props.linePosition][i][1]:''} 
                    onChange={(e)=>onChangeLineInput(e.target.value,props.linePosition,i,1)}/>
                    <select className='form-control rounded-0' style={{flex:'0 1 0'}} disabled={props.disabled} onChange={(e)=>{
                        let description='';
                        let price='';
                        props.dataSelectStock.data.forEach(data=>{
                            
                            if(data[props.dataSelectStock.field[0].name]===e.target.value) {
                                description=data[props.dataSelectStock.field[1].name]?data[props.dataSelectStock.field[1].name]:'';
                                price=data[props.dataSelectStock.field[2].name]?data[props.dataSelectStock.field[2].name]:'';
                            }
                        })
                        
                        props.changeInputState(props.inputState.slice(0,props.linePosition)
                        .concat([props.inputState[props.linePosition].slice(0,i)
                        .concat([props.inputState[props.linePosition][i].slice(0,1)
                        .concat(e.target.value).concat(description).concat(price)
                        .concat(props.inputState[props.linePosition][i].slice(4))])
                        .concat(props.inputState[props.linePosition].slice(i+1))])
                        .concat(props.inputState.slice(props.linePosition+1)))

                        }}>
                    <option value=''>-select an option- </option>
                    {props.stockList}
                </select>
            </div>
            <label htmlFor='description' className='sr-only'/>
            <input type='text' id='description' required className='col form-control rounded-0' 
            value={props.inputState[props.linePosition][i][2]} 
            onChange={(e)=>onChangeLineInput(e.target.value,props.linePosition,i,2)} disabled={props.disabled}
            style={{flex:'1 0 225px',paddingLeft:10,paddingRight:0}}/>

            <label htmlFor='price' className='sr-only'/>
            <input type='number' required min='0' step='.01' id='price' className='col form-control rounded-0' 
            value={props.inputState[props.linePosition][i][3]} 
            onChange={(e)=>onChangeLineInput(e.target.value,props.linePosition,i,3)} disabled={props.disabled}
            style={{flex:'1 0 90px',paddingLeft:10,paddingRight:0}}/>

            <label htmlFor='qty' className='sr-only'/>
            <input type='number' required min='0' step='1' id='qty' className='col form-control rounded-0' 
            value={props.inputState[props.linePosition][i][4]} 
            onChange={(e)=>onChangeLineInput(e.target.value,props.linePosition,i,4)} disabled={props.disabled}
            style={{flex:'1 0 75px',paddingLeft:10,paddingRight:0}}/>

            <label htmlFor='discount' className='sr-only'/>
            <input type='number' required min='0' step='.01' id='discount' className='col form-control rounded-0' 
            value={props.inputState[props.linePosition][i][5]} 
            onChange={(e)=>onChangeLineInput(e.target.value,props.linePosition,i,5)} disabled={props.disabled}
            style={{flex:'1 0 90px',paddingLeft:10,paddingRight:0}}/>

            <label htmlFor='subtotal' className='sr-only'/>
            <input type='text' step='.01' disabled id='subtotal' className='col form-control rounded-0' 
            value={numberFormatParser(props.calculateSubtotal(i))} 
            style={{flex:'1 0 90px',paddingLeft:10,paddingRight:0}}/>
        </div>)}
                                    
        </div>
    )
}


export default LineRender;