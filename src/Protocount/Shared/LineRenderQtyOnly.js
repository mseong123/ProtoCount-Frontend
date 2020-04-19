import React,{useState} from 'react';


function LineRenderQtyOnly(props) {
    const minWidth=575;
    const stockNum=props.dataSelectStock?props.dataSelectStock.field[0].name:null;
    const stockDesc=props.dataSelectStock?props.dataSelectStock.field[1].name:null;
    const stockBalQty=props.dataSelectStock?props.dataSelectStock.field[8].name:null;

    function onChangeLineInput(e,order,lineNumber,innerOrder) {
        props.changeInputState(inputState=>inputState.slice(0,order)
        .concat([inputState[order].slice(0,lineNumber)
        .concat([inputState[order][lineNumber].slice(0,innerOrder)
        .concat(e)
        .concat(inputState[order][lineNumber].slice(innerOrder+1))])
        .concat(inputState[order].slice(lineNumber+1))])
        .concat(inputState.slice(order+1)))
    }

    function addStockControlItem(i,itemCode,Qty) {
        let targetPosition=props.inputState[props.stockControlPosition].findIndex(item=>item[0]-1===i)
        
        if (targetPosition>=0)
                props.changeInputState(inputState=>
                [...inputState.slice(0,props.stockControlPosition),
                [...inputState[props.stockControlPosition].slice(0,targetPosition),
                    [i+1,itemCode,Qty],
                ...inputState[props.stockControlPosition].slice(targetPosition+1)],
                ...inputState.slice(props.stockControlPosition+1)]
                )
            else
                props.changeInputState(inputState=>
                [...inputState.slice(0,props.stockControlPosition),
                [...inputState[props.stockControlPosition],
                    [i+1,itemCode,Qty]
                ],
                ...inputState.slice(props.stockControlPosition+1)]
                )
    }

    function removeStockControlItem(i) {
        let targetPosition=props.inputState[props.stockControlPosition].findIndex(item=>item[0]-1===i)
        
        if (targetPosition>=0)
            props.changeInputState(inputState=>
                [...inputState.slice(0,props.stockControlPosition),
                [...inputState[props.stockControlPosition].slice(0,targetPosition),
                ...inputState[props.stockControlPosition].slice(targetPosition+1)],
                ...inputState.slice(props.stockControlPosition+1)]
            )
    }

    function isNegativeStockBalance() {
        if (props.dataSelectStock) 
            return props.inputState[props.stockControlPosition].some(item=>
                calculateFinalQty(item) < 0
            )
        else return false;
    }

    function calculateFinalQty(item) {
        if (props.stockDirection==='out')
            return props.dataSelectStock.data.find(item2=>item2[stockNum]===item[1])[stockBalQty]-
                props.inputState[props.stockControlPosition].reduce((a,b)=>{
                    if(b[1]===item[1])
                        return a+Number(b[2])
                    else return a
                },0)
        else if (props.stockDirection==='in')
            return props.dataSelectStock.data.find(item2=>item2[stockNum]===item[1])[stockBalQty]+
                props.inputState[props.stockControlPosition].reduce((a,b)=>{
                    if(b[1]===item[1])
                        return a+Number(b[2])
                    else return a
                },0)
    }
    

    function populateNegativeStockBalanceTable () {
        const lineAlreadyFiltered=[]

        if (props.dataSelectStock) {
            props.inputState[props.stockControlPosition].forEach(item=>{
                if(calculateFinalQty(item)<0 && lineAlreadyFiltered.indexOf(item[1])===-1)
                    lineAlreadyFiltered.push(item[1])
            })
            
            return lineAlreadyFiltered.map(stockNum1=>
                (<tr key={stockNum1}>
                    <td>{stockNum1}</td>
                    <td>
                        {props.dataSelectStock.data.find(item2=>
                        item2[stockNum]===stockNum1)[stockDesc]}
                    </td>
                    <td>
                        {props.dataSelectStock.data.find(item2=>
                        item2[stockNum]===stockNum1)[stockBalQty]}
                    </td>
                    <td>
                        {props.inputState[props.stockControlPosition].reduce((a,b)=>{
                            if(b[1]===stockNum1)
                                return a+Number(b[2])
                            else return a
                        },0)}
                    </td>
                    <td>
                        {calculateFinalQty(props.inputState[props.stockControlPosition].find(item=>
                            item[1]===stockNum1))}
                    </td>
                </tr>)
            )
        }
        else return null
    }

    
console.log(props.inputState)
    return (
        <fieldset className='form-group col-md-12 mx-3 border border-secondary pb-4 rounded'>
            <legend className='col-form-label col-12 col-md-6 offset-md-3 text-center' >
                <button type='button' className='btn btn-primary' disabled={props.disabled}
                onClick={()=>
                    props.changeInputState(
                        props.inputState.slice(0,props.linePosition)
                        .concat([props.inputState[props.linePosition].slice(0)
                            .concat(
                                [[props.inputState[props.linePosition].length+1,'','','']])])
                        .concat(props.inputState.slice(props.linePosition+1))
                    )
                }>+</button>

                <h6 className='d-inline-block mx-2 mx-md-4'>{props.lineDescription}</h6>

                <button type='button' className='btn btn-secondary' disabled={props.disabled}
                onClick={()=>{
                    removeStockControlItem(props.inputState[props.linePosition].length-1)

                    props.changeInputState(inputState=>
                        inputState.slice(0,props.linePosition)
                        .concat([inputState[props.linePosition].slice(0,inputState[props.linePosition].length-1)])
                        .concat(inputState.slice(props.linePosition+1))
                    )
                }}>-</button>
            </legend>
            <div className="overflow-auto">
                {/*flex nowrap and overflow auto for mobile view*/}
                <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}}>
                    <h6 className='col text-nowrap' style={{flex:'1 0 80px',paddingLeft:10,paddingRight:10}}>Line No.</h6>
                    <h6 className='col text-nowrap' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>Item Code</h6>
                    <h6 className='col' style={{flex:'1 0 75px',paddingLeft:10,paddingRight:10}}>Stock Control</h6>
                    <h6 className='col text-nowrap' style={{flex:'1 0 225px',paddingLeft:10,paddingRight:10}}>Description</h6>
                    <h6 className='col text-nowrap' style={{flex:'1 0 75px',paddingLeft:10,paddingRight:10}}>Qty</h6>
                </div>

                {props.inputState[props.linePosition].map((lineSet,i)=>
                <div className='row flex-nowrap' style={{marginLeft:0,marginRight:0}} key={i}>
                    {/*set fixed flex basis so layout is consistent with h6 header as well*/}
                    <label htmlFor='lineNo' className='sr-only'/>
                    <input type='number' id='lineNo' className='col form-control rounded-0' 
                    value={props.inputState[props.linePosition][i][0]} 
                    onChange={(e)=>e} style={{flex:'1 0 80px',paddingLeft:10,paddingRight:0}} disabled={props.disabled}/>

                    <div className='col input-group' style={{flex:'1 0 120px',paddingLeft:0,paddingRight:0}}>
                        <label htmlFor='itemCode' className='sr-only'/>
                        <input type='text' id ='itemCode' className='form-control rounded-0' disabled={props.disabled}
                        style={{paddingLeft:10}}
                        value={props.inputState[props.linePosition][i][1]?props.inputState[props.linePosition][i][1]:''} 
                        onChange={(e)=>{
                            onChangeLineInput(e.target.value,props.linePosition,i,1)
                            if(props.dataSelectStock.data.some(item=>{
                                const stockNum=props.dataSelectStock.field[0].name;
                                return item[stockNum]===e.target.value
                            }))
                                addStockControlItem(i,e.target.value,props.inputState[props.linePosition][i][3])
                            else
                                removeStockControlItem(i)
                        }}/>
                        <select className='form-control rounded-0' style={{flex:'0 1 0'}} disabled={props.disabled} 
                        onChange={(e)=>{
                            let stockDescription='';
                            let itemCode=e.target.value
                        
                            props.dataSelectStock.data.forEach(data=>{        
                                if(data[props.dataSelectStock.field[0].name]===e.target.value) {
                                    stockDescription=data[props.dataSelectStock.field[1].name]?
                                        data[props.dataSelectStock.field[1].name]:'';
                                }
                            })
                        
                            props.changeInputState(inputState=>inputState.slice(0,props.linePosition)
                            .concat([inputState[props.linePosition].slice(0,i)
                            .concat([inputState[props.linePosition][i].slice(0,1)
                            .concat(itemCode).concat(stockDescription)
                            .concat(inputState[props.linePosition][i].slice(3))])
                            .concat(inputState[props.linePosition].slice(i+1))])
                            .concat(inputState.slice(props.linePosition+1))
                            )
                            if (e.target.value!=='')
                                addStockControlItem(i,e.target.value,props.inputState[props.linePosition][i][3])
                            else
                                removeStockControlItem(i)

                                }}>
                            <option value=''>-select an option- </option>
                            {props.stockList}
                        </select>
                    </div>
            
                    <div className='text-center' style={{flex:'1 0 75px',paddingLeft:10,paddingRight:10,paddingTop:7,
                        border:'1px solid #ced4da',
                        backgroundColor:props.disabled? '#e9ecef': 
                        (props.dataSelectStock && props.dataSelectStock.data.every(item=>{
                            const stockNum=props.dataSelectStock.field[0].name;
                            return item[stockNum]!==props.inputState[props.linePosition][i][1]
                        })? '#e9ecef': 'transparent')
                    }}>
                        <label htmlFor='stockControl' className='sr-only'/>
                        <input id='stockControl' type='checkbox' 
                        disabled={props.disabled? true: 
                            (props.dataSelectStock && props.dataSelectStock.data.every(item=>{
                            const stockNum=props.dataSelectStock.field[0].name;
                            return item[stockNum]!==props.inputState[props.linePosition][i][1]
                        })? true: false)} checked={props.inputState[props.stockControlPosition].some(item=>item[0]-1===i)} 
                
                        onChange={e=>{
                        if (e.target.checked) 
                            addStockControlItem(i,props.inputState[props.linePosition][i][1],props.inputState[props.linePosition][i][3]);
                        else 
                            removeStockControlItem(i);
                        }}/>
                    </div>
            
                    <label htmlFor='description' className='sr-only'/>
                    <input type='text' id='description' required className='col form-control rounded-0' 
                    value={props.inputState[props.linePosition][i][2]} 
                    onChange={(e)=>onChangeLineInput(e.target.value,props.linePosition,i,2)} disabled={props.disabled}
                    style={{flex:'1 0 225px',paddingLeft:10,paddingRight:0}}/>

                    <label htmlFor='qty' className='sr-only'/>
                    <input type='number' required min='0' step='1' id='qty' className='col form-control rounded-0' 
                    value={props.inputState[props.linePosition][i][3]} disabled={props.disabled}
                    style={{flex:'1 0 75px',paddingLeft:10,paddingRight:0}}
                    onChange={(e)=>{
                        onChangeLineInput(e.target.value,props.linePosition,i,3);
                        if(props.inputState[props.stockControlPosition].some(item=>item[0]-1===i))
                            addStockControlItem(i,props.inputState[props.linePosition][i][1],e.target.value)
                    }}/>
                </div>)}
                {isNegativeStockBalance() && !props.disabled?
                (<div style={{minWidth:minWidth}}> 
                    <div className='alert alert-warning mt-3' style={{cursor:'pointer'}} data-toggle='collapse'
                    data-target='#negativeStockBal'>
                        Negative Stock Balance
                    </div>
                    <div className='collapse navbar-collapse pl-3 pl-md-5' id='negativeStockBal'>
                        <table className='table table-responsive-md'>
                            <thead>
                                <tr>
                                    <th className='text-nowrap'>Item Code</th>
                                    <th className='text-nowrap'>Description</th>
                                    <th className='text-nowrap'>Bal Qty</th>
                                    <th className='text-nowrap'>{props.stockDirection==='out'?'Out':'In'}</th>
                                    <th className='text-nowrap'>Final Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {populateNegativeStockBalanceTable()}
                            </tbody>

                        </table>
                    </div>
                </div>):null}
            </div>
        </fieldset>
    )
}


export default LineRenderQtyOnly;