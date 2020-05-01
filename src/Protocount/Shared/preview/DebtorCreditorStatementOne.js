import React from 'react';
import numberFormatParser from '../numberFormatParser';
import {useHistory} from 'react-router-dom';

/*Layout for Debtor Statement Report and Creditor Statement Report*/

function DebtorCreditorStatementOne(props) {

    const history=useHistory();

    const topLeftInput=props.topLeftInput? props.topLeftInput.map((input,i)=>
        <p className='my-2' key={i}>{input}</p>
        ):null;

    const topRightArea=props.topRightField && props.topRightInput? props.topRightField.map((field,i)=>
        (<div className='row' key={i}>
            <div className='col-5 h6'>
                {field}
            </div>
            <div className='col-1'>
                :
            </div>
            <div className='col-5 h6'>
                {props.topRightInput[i]}
            </div>
        </div>)):null;

    
    function monthDiff(dateFrom, dateTo) {
        return dateTo.getMonth() - dateFrom.getMonth() + 
          (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
    }

    /*functions below ensure one row of aging table only fits 5 months of aging maximum, remaining months will be 
    fitted next table up to maximum of 12 months*/
    function populateTableMonthsHeader(months,monthsAlreadyPopulated) {
        let result=[];
        
        for(let i=monthsAlreadyPopulated+1;i<+(months)+1;i++) {
            result.push(
                (<th key={i} className='text-nowrap text-center'>{i+' Month'}</th>)
            )
        }
        
        return result;
    }

    function populateTableMonthsAmount(months,monthsAlreadyPopulated) {
        let result=[];
        for(let i=monthsAlreadyPopulated+1;i<+(months)+1;i++) {
            result.push(
                (<td key={i} className='text-nowrap text-center'>{numberFormatParser(calculateAgingMonthAmount(i))}</td>)
            )
        }
        return result;
    }

    function populateAgingTable(months) {
        
        return (
            <table className='table table-bordered'>
                <thead>
                    <tr>
                        <th className='text-nowrap text-center'>Current</th>
                        {months<=6?populateTableMonthsHeader(months,0):populateTableMonthsHeader(6,0)}
                        {months<=6? (<th className='text-nowrap text-center'>{'> '+months+' Month'}</th>):null}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='text-nowrap text-center'>{numberFormatParser(calculateAgingMonthAmount(0))}</td>
                        {months<=6?populateTableMonthsAmount(months,0):populateTableMonthsAmount(6,0)}
                        {months<=6?
                        (<td className='text-nowrap text-center'>
                            {numberFormatParser(calculateAgingMonthRemainderAmount(months))}
                        </td>)
                        :null}
                    </tr>
                </tbody>
                <thead>
                    <tr>
                        {months<=6?null:populateTableMonthsHeader(months,6)}
                        {months<=6?null:(<th className='text-nowrap text-center'>{'> '+months+' Month'}</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {months<=6?null:populateTableMonthsAmount(months,6)}
                        {months<=6?null:
                            (<td className='text-nowrap text-center'>
                                {numberFormatParser(calculateAgingMonthRemainderAmount(months))}
                            </td>)}
                    </tr>
                </tbody>
            </table>
        )
    }

    function calculateAgingMonthAmount(month){
        const data=props.data;
        const field=props.field;
        const date=field[0].name;
        const dr=field[4].name;
        const cr=field[5].name;
    
        return data.reduce((a,b)=>{
            /*dateEnd string from input type date is slightly diff from doc string date  and produce diff result 
            when both string are called with Date() object. Hence perform the following to ensure date objects 
            produced from both string are the same.
            */

            const dateEnd=new Date(new Date(props.dateEnd).getFullYear(),new Date(props.dateEnd).getMonth(),
            new Date(props.dateEnd).getDate(),0)
            const docDate=new Date(new Date(b[date]).getFullYear(),new Date(b[date]).getMonth(),
            new Date(b[date]).getDate(),0)    
            
            if(docDate<=new Date(dateEnd.getFullYear(),Number(dateEnd.getMonth())+1-month,0) 
            && docDate>new Date(dateEnd.getFullYear(),Number(dateEnd.getMonth())-month,0)) {
                
                if (b[dr]) return a+b[dr]
                else return a-b[cr]
            }
            else return a
        },0)
    }

    function calculateAgingMonthRemainderAmount(months) {
        let result=0;
        
        for(let i=+(months)+1;i<monthDiff(new Date(props.dateStartForAging),new Date(props.dateEnd))+1;i++) {
            
            result+=calculateAgingMonthAmount(i)
        }
        return result+props.dbBroughtForwardAmount
    }

    
    
    return (
        <div className='container py-5' style={{maxWidth:800}}>
            <button type='click' className='btn btn-secondary d-print-none mb-2' 
                onClick={()=>{
                    document.querySelector("meta[name=viewport]").setAttribute(
                    'content','width=device-width, initial-scale=1.0');
                    history.push(props.backPath)
            }}>Back</button>
            <div className='jumbotron' style={{padding:0}}>
                <h3 className='text-center'>{props.description}</h3>
            </div>
            <div className='row' style={{margin:0}}>
                <div className='col-6 jumbotron h6 py-4' style={{marginBottom:0}}>
                    {topLeftInput}
                </div>
                <div className='col-6 py-4'>
                    {topRightArea}
                </div>
            </div>
            <hr/>
            {props.populateDebtorCreditor(true)}
            
            <h6 className='text-center'>Aged Analysis</h6>
            {populateAgingTable(props.agingMonths)}
        </div>
    )
}

export default DebtorCreditorStatementOne;