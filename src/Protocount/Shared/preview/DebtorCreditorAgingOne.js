import React from 'react';
import numberFormatParser from '../numberFormatParser';
import dateFormatParser from '../dateFormatParser';
import {useHistory} from 'react-router-dom';

/*Layout for Debtor Aging Report and Creditor Aging Report*/

function DebtorCreditorAgingOne(props) {

const {currDate,debtorID,agingMonths}=props.resultInput;
const history=useHistory();

function populateDebtor(currDate,debtorID,agingMonths) {
        const data=props.dataSelectDebtorAging.data;
        const field=props.dataSelectDebtorAging.field;
        const debtorNum=field[0].name;
        const name=field[1].name;
        const docNum=field[2].name;
        const docDate=field[3].name;
        const type=field[4].name;
        const amount=field[5].name;
        const creditTerm=field[6].name;

    
        const debtorAlreadyParsed=[];
        const result=[];

        data.forEach(item=>{
            if(debtorID.indexOf(item[debtorNum])!==-1 && debtorAlreadyParsed.indexOf(item[debtorNum])===-1)  {
                debtorAlreadyParsed.push(item[debtorNum]);
                result.push(
                (<tbody key={item[debtorNum]} className='border-bottom border-secondary'>
                    <tr className='border-top border-secondary'>
                        <th className='align-top'>{item[debtorNum]}</th>
                        <th className='align-top'>{item[name]}</th>
                        {props.withDetails?(<th></th>):null}
                        {props.withDetails?(<th></th>):null}
                        <th className='align-top'>
                            {numberFormatParser(data.reduce((a,b)=>{
                            if(b[debtorNum]===item[debtorNum] && (new Date(b[docDate])<=new Date(currDate)) ) {
                                let value=props.calculateAgingCurrentAmount(
                                    currDate,
                                    b[creditTerm] && b[creditTerm]!=='COD'? 
                                        props.getFormattedDate(new Date(new Date(b[docDate])
                                        .setDate(new Date(b[docDate]).getDate()+Number(b[creditTerm])))
                                        ):b[docDate],
                                    b[amount]
                                    )

                                if (value) {
                                    return a+b[amount];
                                } else return a
                                    
                            }
                            else return a;
                        },0))
                        }</th>
                        {props.populateMonthsAmount(
                            currDate,
                            item[debtorNum],
                            Number(agingMonths),
                            'table'
                        )}
                        <th className='align-top'>
                            {numberFormatParser(data.reduce((a,b)=>{
                            if(b[debtorNum]===item[debtorNum]  ) {
                                let value=props.calculateAgingRemainderAmount(
                                    currDate,
                                    b[creditTerm] && b[creditTerm]!=='COD'? 
                                        props.getFormattedDate(new Date(new Date(b[docDate])
                                        .setDate(new Date(b[docDate]).getDate()+Number(b[creditTerm])))
                                        ):b[docDate],
                                    b[amount],
                                    Number(agingMonths)
                                    )

                                if (value) {
                                    return a+b[amount];
                                } else return a
                                    
                            }
                            
                            else return a;
                        },0))}</th>
                        <th className='align-top'>
                            {numberFormatParser(
                                data.reduce((a,b)=>{
                                if(b[debtorNum]===item[debtorNum] && (new Date(b[docDate])<=new Date(currDate)))
                                    return a+b[amount]
                                else return a
                                },0)-
                                data.reduce((a,b)=>{
                                if(b[debtorNum]===item[debtorNum] && (new Date(b[docDate])<=new Date(currDate)) ) {
                                    let value=props.calculateAgingCurrentAmount(
                                        currDate,
                                        b[creditTerm] && b[creditTerm]!=='COD'? 
                                            props.getFormattedDate(new Date(new Date(b[docDate])
                                            .setDate(new Date(b[docDate]).getDate()+Number(b[creditTerm])))
                                            ):b[docDate],
                                        b[amount]
                                        )
    
                                    if (value) {
                                        return a+b[amount];
                                    } else return a
                                        
                                }
                                else return a;
                            },0)
                            )}
                            </th>
                        <th className='align-top'>
                            {numberFormatParser(
                                data.reduce((a,b)=>{
                                if(b[debtorNum]===item[debtorNum] && (new Date(b[docDate])<=new Date(currDate)))
                                    return a+b[amount]
                                else return a
                                },0)
                            )}</th>
                    </tr>
                            
                    {props.withDetails? data.map((item2,i)=>{
                        if (item2[debtorNum]===item[debtorNum] && (new Date(item2[docDate])<=new Date(currDate))) 
                            return (
                                <tr key={item2[docNum]} >
                                    <td className='align-top'>{item2[docNum]}</td>
                                    <td className='align-top'>{dateFormatParser(item2[docDate])}</td>
                                    <td className='align-top'>{item2[type]}</td>
                                    <td className='align-top'>{
                                        item2[creditTerm] && item2[creditTerm]!=='COD'? 
                                        dateFormatParser(props.getFormattedDate(
                                            new Date(new Date(item2[docDate])
                                            .setDate(new Date(item2[docDate]).getDate()+Number(item2[creditTerm]))))
                                        ):dateFormatParser(item2[docDate])
                                    }</td>
                                    <td className='align-top'>{
                                        numberFormatParser(props.calculateAgingCurrentAmount(
                                            currDate,
                                            item2[creditTerm] && item2[creditTerm]!=='COD'? 
                                                props.getFormattedDate(new Date(new Date(item2[docDate])
                                                .setDate(new Date(item2[docDate]).getDate()+Number(item2[creditTerm])))
                                                ):item2[docDate],
                                            item2[amount]
                                            ))
                                    }</td>
                                    {props.populateTableMonthsAmount(
                                        currDate,
                                        item2[creditTerm] && item2[creditTerm]!=='COD'? 
                                            props.getFormattedDate(new Date(new Date(item2[docDate])
                                            .setDate(new Date(item2[docDate]).getDate()+Number(item2[creditTerm])))
                                            ):item2[docDate],
                                        item2[amount],
                                        Number(agingMonths)
                                    )}
                                    <td className='align-top'>{
                                    numberFormatParser(props.calculateAgingRemainderAmount(
                                        currDate,
                                        item2[creditTerm] && item2[creditTerm]!=='COD'? 
                                            props.getFormattedDate(new Date(new Date(item2[docDate])
                                            .setDate(new Date(item2[docDate]).getDate()+Number(item2[creditTerm])))
                                            ):item2[docDate],
                                        item2[amount],
                                        Number(agingMonths)
                                    ))
                                    }</td>
                                    <td className='align-top'/>
                                    <td className='align-top'/>
                                </tr>
                            )
                        else return null; 
                        }):null
                    }
                </tbody>)
                )
            } 
        })
        return result;
    }


    return (
        <div className='container-fluid py-1'>
            <button type='click' className='btn btn-secondary d-print-none mb-2' 
                onClick={()=>{
                    document.querySelector("meta[name=viewport]").setAttribute(
                    'content','width=device-width, initial-scale=1.0');
                    history.push(props.backPath)
            }}>Back</button>
            <h2 className='text-center mb-3'>
                {props.description+' as at '+ (dateFormatParser(props.resultInput['currDate']))}
            </h2>
            <hr className='border border-dark'/>
            <table className='table table-borderless'>
                <thead>
                    <tr className='border-top border-secondary'>
                        <th className='align-top'>Debtor No.</th>
                        <th className='align-top'>Name</th>
                        {props.withDetails?(<th></th>):null}
                        {props.withDetails?(<th></th>):null}
                        <th className='align-top'>Current</th>
                        {props.populateTableMonthsHeader(props.resultInput['agingMonths'])}
                        <th className='align-top'>{'> '+props.resultInput['agingMonths']+' Month'}</th>
                        <th className='align-top'>Total Overdue</th>
                        <th className='align-top'>Balance</th>
                    </tr>
                    
                    {props.withDetails?
                    (<tr className='border-bottom border-secondary text-secondary'>
                        <th className='align-top'>Doc No.</th>
                        <th className='align-top'>Doc Date</th>
                        <th className='align-top'>Type</th>
                        <th className='align-top'>Due Date</th>
                        <th colSpan={4+props.resultInput['agingMonths']}></th>
                    </tr>):null}
                    {props.withDetails?
                    (<tr>
                        <th className='border-bottom border-secondary' colSpan={8+props.resultInput['agingMonths']}></th>
                    </tr>):
                    (<tr>
                        <th className='border-bottom border-top border-secondary' colSpan={6+props.resultInput['agingMonths']}></th>
                    </tr>)}
                    

                </thead>
                    {populateDebtor(currDate,debtorID,agingMonths)}
            </table>
            <hr className='border border-dark'/>
            <small className='d-block text-center'>End of Report</small>
        </div>
    )
}

export default DebtorCreditorAgingOne;