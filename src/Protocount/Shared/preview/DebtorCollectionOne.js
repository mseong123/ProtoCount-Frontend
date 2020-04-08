import React from 'react';
import numberFormatParser from '../numberFormatParser';
import dateFormatParser from '../dateFormatParser';
import {useHistory} from 'react-router-dom';
import setPageSize from '../setPageSize';

/*Layout for Debtor Collection Report*/

function DebtorCollectionOne(props) {
    const history=useHistory();

    function populateResult() {
        const data=props.data;
        const field=props.field;
        const debtorNum=field[0].name;
        const name=field[1].name;
        const docNum=field[2].name;
        const docDate=field[3].name;
        const type=field[4].name;
        const method=field[5].name;
        const transactionID=field[6].name;
        const amount=field[7].name;

        const receiptData=props.receiptData;
        const receiptField=props.receiptField;
        const receiptDocNum=receiptField[0].name;
        const receiptDataDocNum=receiptField[1].name;
        const receiptDataType=receiptField[2].name;
        const receiptDataDate=receiptField[3].name;
        const receiptDataCreditTerm=receiptField[4].name;
        const receiptDataAmount=receiptField[5].name;
        const receiptAmount=receiptField[6].name;

        const debtorAlreadyParsed=[];
        const result=[];

        data.forEach(item=>{
            if(debtorAlreadyParsed.indexOf(item[debtorNum])===-1)  {
                debtorAlreadyParsed.push(item[debtorNum]);
                result.push(
                (<tbody key={item[debtorNum]} className='border-bottom border-secondary'>
                    <tr className='border-top border-secondary'>
                        <th className='align-top'>{item[debtorNum]}</th>
                        <th className='align-top' colSpan={props.withReceiptDetails?5:4}>{item[name]}</th>
                        <th className='align-top'>
                            {numberFormatParser(data.reduce((a,b)=>{
                                    if (b[debtorNum]===item[debtorNum]) 
                                        return a+b[amount]
                                    else return a 
                                },0)
                            )}
                        </th>
                    </tr>
                    {props.dataDetail.map(item2=>{
                        if (item2[debtorNum]===item[debtorNum]) 
                            return (
                            <React.Fragment>
                                <tr key={item2[docNum]}>
                                    <td className='align-top'>{item2[docNum]}</td>
                                    <td className='align-top'>{dateFormatParser(item2[docDate])}</td>
                                    <td className='align-top'>{item2[type]}</td>
                                    <td className='align-top'>{item2[method]}</td>
                                    <td className='align-top' colSpan={props.withReceiptDetails?2:null}>{item2[transactionID]}</td>
                                    <td className='align-top'>
                                        {numberFormatParser(item2[amount])}
                                    </td>
                                </tr>
                                {props.withReceiptDetails? receiptData.map(item3=>{
                                    if(item3[receiptDocNum]===item2[docNum]) 
                                        return (
                                            <tr key={item3[receiptDataDocNum]} className='text-secondary'>
                                                <td className='align-top pl-5 pr-0'><i>{item3[receiptDataDocNum]}</i></td>
                                                <td className='align-top pl-5 pr-0'><i>{item3[receiptDataType]}</i></td>
                                                <td className='align-top pl-5 pr-0'><i>{dateFormatParser(item3[receiptDataDate])}</i></td>
                                                <td className='align-top pl-5 pr-0'><i>{
                                                    item3[receiptDataCreditTerm] && item3[receiptDataCreditTerm]!=='COD'? 
                                                    dateFormatParser(props.getFormattedDate(
                                                            new Date(new Date(item3[receiptDataDate])
                                                            .setDate(new Date(item3[receiptDataDate]).getDate()
                                                            +Number(item3[receiptDataCreditTerm]))))
                                                        ):dateFormatParser(item3[receiptDataDate])
                                                    }
                                                    </i>
                                                </td>
                                                <td className='align-top pl-5 pr-0'><i>{
                                                item3[receiptDataCreditTerm]==='COD'?'C.O.D.':item3[receiptDataCreditTerm]+' days'}</i>
                                                </td>
                                                <td className='align-top pl-5 pr-0'><i>{numberFormatParser(item3[receiptDataAmount])}</i></td>
                                                <td className='align-top pl-5 pr-0'><i>{numberFormatParser(item3[receiptAmount])}</i></td>
                                            </tr>
                                        )
                                }):null}
                            </React.Fragment>
                            )
                                
                    

                    })}
                    
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
                    setPageSize('a4 portrait');
                    history.push(props.backPath)
            }}>Back</button>
            <h2 className='text-center mb-3'>
                {props.description+' from '+ dateFormatParser(props.resultInput['dateStart'])
                +' to '+ dateFormatParser(props.resultInput['dateEnd'])}
            </h2>
            <hr className='border border-dark'/>
            <table className='table table-borderless'>
                <thead>
                    <tr className='border-top border-secondary'>
                        <th className='align-top'>Debtor No.</th>
                        <th className='align-top' colSpan={props.withReceiptDetails?5:4}>Name</th>
                        <th className='align-top'>Receipt Amount</th>
                    </tr>
                    <tr>
                        <th className='align-top'>Receipt No.</th>
                        <th className='align-top'>Date</th>
                        <th className='align-top'>Type</th>
                        <th className='align-top'>Method</th>
                        <th className='align-top' colSpan={props.withReceiptDetails?2:null}>Transaction ID</th>
                        <th className='align-top'>Amount</th>
                    </tr>
                    {props.withReceiptDetails?
                    (<tr className='border-bottom border-secondary text-secondary'>
                        <th className='align-top pl-5 pr-0'><i>Doc No.</i></th>
                        <th className='align-top pl-5 pr-0'><i>Type</i></th>
                        <th className='align-top pl-5 pr-0'><i>Doc Date</i></th>
                        <th className='align-top pl-5 pr-0'><i>Due Date</i></th>
                        <th className='align-top pl-5 pr-0'><i>Credit Term</i></th>
                        <th className='align-top pl-5 pr-0'><i>Doc Amount</i></th>
                        <th className='align-top pl-5 pr-0'><i>Receipt Amount</i></th>
                    </tr>):null}
                    {props.withReceiptDetails?
                    (<tr>
                        <th className='border-bottom border-secondary' colSpan={7}></th>
                    </tr>):
                    (<tr>
                        <th className='border-bottom border-top border-secondary' colSpan={6}></th>
                    </tr>)}
                </thead>
                {populateResult()}
            </table>
            <hr className='border border-dark'/>
            <small className='d-block text-center'>End of Report</small>
        </div>
    )
}

export default DebtorCollectionOne;