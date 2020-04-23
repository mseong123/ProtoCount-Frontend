import React from 'react';
import numberFormatParser from '../numberFormatParser';
import dateFormatParser from '../dateFormatParser';
import {useHistory} from 'react-router-dom';
import setPageSize from '../setPageSize';

/*Layout for Stock Card Report*/

function StockCardOne(props) {
    const history=useHistory();

    function populateResult() {
        const broughtForwardData=props.broughtForwardData;
        const broughtForwardField=props.broughtForwardField;
        const data=props.data;
        const dataDetail=props.dataDetail;
        const field=props.field;
        const stockNum=field[0].name;
        const description=field[1].name;
        const docNum=field[2].name;
        const docDate=field[3].name;
        const type=field[4].name;
        const IN=field[5].name;
        const OUT=field[6].name;
        const bfQty=broughtForwardField[1].name

        const stockAlreadyParsed=[];
        const result=[];
        let balQty=0;

        data.forEach(item=>{
            if(stockAlreadyParsed.indexOf(item[stockNum])===-1)  {
                stockAlreadyParsed.push(item[stockNum]);
                balQty=broughtForwardData.find(item2=>
                    item2[stockNum]===item[stockNum]
                )[bfQty];
                result.push(
                (<tbody key={item[stockNum]} className='border-bottom border-secondary'>
                    <tr className='border-top border-secondary'>
                        <th className='align-top'>{item[stockNum]}</th>
                        <th className='align-top'>{item[description]}</th>
                        <th></th>
                        <th></th>
                        <th className='align-top'>
                            {numberFormatParser(broughtForwardData.find(item2=>
                                item2[stockNum]===item[stockNum]
                                )[bfQty]
                            )}
                        </th>
                        <th className='align-top'>
                            {numberFormatParser(
                                broughtForwardData.find(item2=>
                                    item2[stockNum]===item[stockNum]
                                )[bfQty]+data.reduce((a,b)=>{
                                    if(b[stockNum]===item[stockNum])
                                        return a+b[IN]+b[OUT]
                                    else return a
                                },0)
                            )}
                        </th>
                    </tr>
                    {props.withDetails? props.dataDetail.map(item2=>{
                        if (item2[stockNum]===item[stockNum]) 
                            return (
                            <tr key={item2[docNum]}>
                                <td className='align-top'>{item2[docNum]}</td>
                                <td className='align-top'>{dateFormatParser(item2[docDate])}</td>
                                <td className='align-top'>{item2[type]}</td>
                                <td className='align-top'>{item2[IN]}</td>
                                <td className='align-top'>{item2[OUT]}</td>
                                <td className='align-top'>{balQty+=item2[IN]+item2[OUT]}</td>
                            </tr>
                            )
                    }):null}
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
                        <th className='align-top'>Item Code</th>
                        <th className='align-top' colSpan={3}>Description</th>
                        <th className='align-top'>B/F Qty</th>
                        <th className='align-top'>Balance Qty</th>
                    </tr>
                    {props.withDetails?
                    (<tr>
                        <th className='align-top'>Doc No.</th>
                        <th className='align-top'>Date</th>
                        <th className='align-top'>Type</th>
                        <th className='align-top'>In</th>
                        <th className='align-top'>Out</th>
                        <th className='align-top'>Bal Qty</th>
                    </tr>):null}
                    <tr>
                        <th className='border-bottom border-secondary' colSpan={6}></th>
                    </tr>
                </thead>
                {populateResult()}
            </table>
            <hr className='border border-dark'/>
            <small className='d-block text-center'>End of Report</small>
        </div>
    )
}

export default StockCardOne;