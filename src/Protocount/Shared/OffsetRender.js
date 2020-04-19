import React from 'react';
import numberFormatParser from './numberFormatParser';
import dateFormatParser from '../Shared/dateFormatParser';

function OffsetRender(props) {
    const docNum=props.dataSelectOutstanding?props.dataSelectOutstanding.field[0].name:null;
    const name=props.dataSelectOutstanding?props.dataSelectOutstanding.field[1].name:null;
    const type=props.dataSelectOutstanding? props.dataSelectOutstanding.field[2].name:null;
    const date=props.dataSelectOutstanding?props.dataSelectOutstanding.field[3].name:null;
    const original=props.dataSelectOutstanding? props.dataSelectOutstanding.field[4].name:null;
    const outstanding=props.dataSelectOutstanding?props.dataSelectOutstanding.field[5].name:null;

    /*inputState offset inner positions*/
    const offsetDocNumPosition=0;
    const offsetAmountPosition=1;

    
    function onChangeOffsetInput(e,order,lineNumber,innerOrder) {
        props.changeInputState(props.inputState.slice(0,order)
        .concat([props.inputState[order].slice(0,lineNumber)
        .concat([props.inputState[order][lineNumber].slice(0,innerOrder)
        .concat(e)
        .concat(props.inputState[order][lineNumber].slice(innerOrder+1))])
        .concat(props.inputState[order].slice(lineNumber+1))])
        .concat(props.inputState.slice(order+1)))
    }
    /*add offsetinput array at end of offsetposition array*/
    function onAddOffsetInput(e,order) {
        props.changeInputState(props.inputState.slice(0,order)
        .concat([props.inputState[order].slice(0,props.inputState[order].length)
        .concat([e])])
        .concat(props.inputState.slice(order+1)))
    }
    /*slice off specific offsetinput array from overall offsetposition array*/
    function onRemoveOffsetInput(order,innerIndexOfArrayToBeRemoved) {
        
        props.changeInputState(props.inputState.slice(0,order)
        .concat([props.inputState[order].slice(0,innerIndexOfArrayToBeRemoved)
        .concat(props.inputState[order].slice(innerIndexOfArrayToBeRemoved+1))])
        .concat(props.inputState.slice(order+1)))
    }

    /*event handler for checkbox*/
    function onChangeCheck(item,offsetPosition) {

        /*1) check if there's existing offsetinputstate arrays*/
        if (props.inputState[offsetPosition].length>1)
            /*2)if yes, then iterate for each offsetinputstatearray items and check offsetinputstate arrays 
            vs dataSelectOutstanding*/
            props.inputState[offsetPosition].forEach((item2,i)=>{
                if(item2[offsetDocNumPosition]===item[docNum]) {
                    /*3) If match then if dataSelectOutstanding outstanding amount>unappliedamount then 
                    changeoffsetinput using whole unappliedamount  */
                    if(item[outstanding]>props.calculateUnappliedAmount())
                        onChangeOffsetInput(
                            props.calculateUnappliedAmount(),offsetPosition,i,offsetAmountPosition
                            )
                    else /*otherwise changeoffsetinput using whole dataSelectOutstanding outstanding amount */
                        onChangeOffsetInput(item[outstanding],offsetPosition,i,offsetAmountPosition)
                } else /*4) if no existing offsetinputstate arrays do the same thing as 3) above but instead of
                changeoffsetinput, add offsetinput array at end of array */ 
                    {if (item[outstanding]>props.calculateUnappliedAmount())
                        onAddOffsetInput([item[docNum],props.calculateUnappliedAmount()],offsetPosition)
                    else onAddOffsetInput([item[docNum],item[outstanding]],offsetPosition)
                    } 
            })
            else {
                /*5) from (1)if no existing offsetinputstate arrays, then skip to (4) by adding offsetinput array*/
                if (item[outstanding]>props.calculateUnappliedAmount())
                    onAddOffsetInput([item[docNum],props.calculateUnappliedAmount()],offsetPosition)
                else onAddOffsetInput([item[docNum],item[outstanding]],offsetPosition)
            }
    }

    function checkPayAmountDisabled(item,offsetPosition){
        let result=true;
        props.inputState[offsetPosition].forEach(item2=>{
            if(item2[offsetDocNumPosition]===item[docNum] && !props.disabled)
            result=false; 
        })

        
        return result;
    }
    function getOffsetInputStateArrayPosition(item,offsetPosition) {
        let result=null;
        props.inputState[offsetPosition].forEach((item2,i)=>{
            if(item2[offsetDocNumPosition]===item[docNum])
            result=i; 
        })
        return result;
    }

    function checked(item,offsetPosition) {
        let result=false;

        if (props.inputState[offsetPosition]) 
            
            props.inputState[offsetPosition].forEach(item2=>{
                if(item2[offsetDocNumPosition]===item[docNum]) 
                    result=true;
                
            })
        
        return result
    }

    return (
    <fieldset className='form-group col-md-12 mx-3 border border-secondary pb-4 rounded'>
        <legend className='col-form-label col-12 col-md-6 offset-md-3 text-center' >
            <h6 className='d-inline-block mx-2 mx-md-4'>OFFSET <br/> {props.offsetDescription}</h6>
        </legend>
        <div className="overflow-auto">
            {/*flex nowrap and overflow auto for mobile view*/}
            <div className='row flex-nowrap ' style={{marginLeft:0,marginRight:0}}>
                <h6 className='col' style={{flex:'1 0 200px',paddingLeft:10,paddingRight:10}}>Doc No.</h6>
                <h6 className='col' style={{flex:'1 0 150px',paddingLeft:10,paddingRight:10}}>Name</h6>
                <h6 className='col' style={{flex:'1 0 200px',paddingLeft:10,paddingRight:10}}>Type</h6>
                <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>Date</h6>
                <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>Original</h6>
                <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>Outstanding</h6>
                <h6 className='col mx-2' style={{flex:'0 0 15px',paddingLeft:0,paddingRight:0}}></h6>
                <h6 className='col' style={{flex:'1 0 100px',paddingLeft:10,paddingRight:10}}>Pay</h6>
            </div>
            {props.dataSelectOutstanding? props.dataSelectOutstanding.data.map((item,i)=>
            (<div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}} key={item[docNum]}>
                <p className='col border my-0' style={{flex:'1 0 200px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>{item[docNum]}</p>
                <p className='col border my-0 text-truncate' style={{flex:'1 0 150px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>{item[name]}</p>
                <p className='col border my-0' style={{flex:'1 0 200px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>{item[type]}</p>
                <p className='col border my-0' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>{dateFormatParser(item[date])}</p>
                <p className='col border my-0' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>{numberFormatParser(item[original])}</p>
                <p className='col border my-0' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>{numberFormatParser(item[outstanding])}</p>
                <label htmlFor='pay' className='sr-only'/>
                <input type='checkbox' id='pay' style={{flex:'0 0 15px'}} 
                checked={item[type]===props.offsetDescriptionOne?checked(item,props.offsetPositionOne):checked(item,props.offsetPositionTwo)} 
                disabled={props.disabled}
                className='col form-control mx-2' onChange={
                    (e)=>{
                        props.changeErrorUnappliedAmount(null);
                        /*if button checked*/
                        if(e.target.checked) {
                            /*First check if overall condition-unapplied amount is >0. If unapplied amount is zero, no operations 
                            will be executed (although still can uncheck)*/
                            if (props.calculateUnappliedAmount()>0)
                                /*check if item belongs in offsetPositionOne or offsetPositionTwo array and repeat steps in both array */
                                if (item[type]===props.offsetDescriptionOne) 
                                    onChangeCheck(item,props.offsetPositionOne)
                                else onChangeCheck(item,props.offsetPositionTwo)

                        } /*if button unchecked*/ else {
                            /*remove existing offsetinputstate arrays*/
                            if(item[type]===props.offsetDescriptionOne) {
                                props.inputState[props.offsetPositionOne].forEach((item2,i)=>{
                                    if(item2[offsetDocNumPosition]===item[docNum]) 
                                        onRemoveOffsetInput(props.offsetPositionOne,i)
                                })
                            } else props.inputState[props.offsetPositionTwo].forEach((item2,i)=>{
                                if(item2[offsetDocNumPosition]===item[docNum]) 
                                    onRemoveOffsetInput(props.offsetPositionTwo,i)
                                })
                        }
                        

                        }}/>
                <label htmlFor='payAmount' className='sr-only'/>
                <input type='number' id='payAmount' style={{flex:'1 0 90px',height:'auto',paddingLeft:10,paddingRight:10}} 
                className='col form-control' min='0' step='.01'
                value={item[type]===props.offsetDescriptionOne? 
                    (props.inputState[props.offsetPositionOne][getOffsetInputStateArrayPosition(item,props.offsetPositionOne)]? 
                    ''+props.inputState[props.offsetPositionOne][getOffsetInputStateArrayPosition(item,props.offsetPositionOne)][offsetAmountPosition]:'')
                    :
                    (props.inputState[props.offsetPositionTwo][getOffsetInputStateArrayPosition(item,props.offsetPositionTwo)]? 
                    ''+props.inputState[props.offsetPositionTwo][getOffsetInputStateArrayPosition(item,props.offsetPositionTwo)][offsetAmountPosition]:'')}

                disabled={item[type]===props.offsetDescriptionOne? 
                    checkPayAmountDisabled(item,props.offsetPositionOne):checkPayAmountDisabled(item,props.offsetPositionTwo)
                } 
                onChange={(e)=>{
                    props.changeErrorUnappliedAmount(null);

                    if(parseFloat(e.target.value) > props.calculateUnappliedAmount(item[docNum])) {
                        if (item[type]===props.offsetDescriptionOne)  
                            onChangeOffsetInput(props.calculateUnappliedAmount(item[docNum]),
                            props.offsetPositionOne,getOffsetInputStateArrayPosition(item,props.offsetPositionOne),offsetAmountPosition)
                        else onChangeOffsetInput(props.calculateUnappliedAmount(item[docNum]),
                        props.offsetPositionTwo,getOffsetInputStateArrayPosition(item,props.offsetPositionTwo),offsetAmountPosition)
                    }
                    else {
                        if (item[type]===props.offsetDescriptionOne) 
                        onChangeOffsetInput(parseFloat(e.target.value),props.offsetPositionOne,
                        getOffsetInputStateArrayPosition(item,props.offsetPositionOne),offsetAmountPosition)

                        else onChangeOffsetInput(parseFloat(e.target.value),props.offsetPositionTwo,
                        getOffsetInputStateArrayPosition(item,props.offsetPositionTwo),offsetAmountPosition)
                    }
                   
                }}
                />
            </div>)
            ):null}
        </div>
    </fieldset>
    )
}


export default OffsetRender;