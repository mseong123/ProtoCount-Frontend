import React from 'react';
import numberFormatParser from '../numberFormatParser';
import dateFormatParser from '../dateFormatParser';
import {useHistory} from 'react-router-dom';
import setPageSize from '../setPageSize';

/*Layout for Sales Report*/

function SalesReportOne(props) {
    const history=useHistory();

    function populateMonthsHeader() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const result=[]
        
        const parsedDateStart=new Date(new Date(props.resultInput.dateStart).getFullYear(),new Date(props.resultInput.dateStart).getMonth(),new Date(props.resultInput.dateStart).getDate(),0)
        const parsedDateEnd=new Date(new Date(props.resultInput.dateEnd).getFullYear(),new Date(props.resultInput.dateEnd).getMonth(),new Date(props.resultInput.dateEnd).getDate(),0)
        
        if (parsedDateEnd<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0)) {
            if (props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails))
            result.push(<th key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
            className='align-top'>
                {monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
            </th>)

            result.push(<th key={props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)?
            monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
            :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
            className='align-top'>
                {props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)? 
                monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
                :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
            </th>)
        }
        else {
            let date=new Date(parsedDateStart)
            if (props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails))
            result.push(<th key={monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Qty'}
            className='align-top'>
                {monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Qty'}
            </th>)

            result.push(<th key={props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)?
            monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Total'
            :monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()}
            className='align-top'>
                {props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)? 
                monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Total'
                :monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()}
            </th>)
            
            while(parsedDateEnd>new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1+1,0)) {
                date.setMonth(date.getMonth()+1,1)
                if (props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails))
                result.push(<th key={monthNames[date.getMonth()]+' '+date.getFullYear()+' Qty'}
                className='align-top'>
                    {monthNames[date.getMonth()]+' '+date.getFullYear()+' Qty'}
                </th>)

                result.push(<th key={props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)?
                monthNames[date.getMonth()]+' '+date.getFullYear()+' Total'
                :monthNames[date.getMonth()]+' '+date.getFullYear()}
                className='align-top'>
                    {props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)? 
                    monthNames[date.getMonth()]+' '+date.getFullYear()+' Total'
                    :monthNames[date.getMonth()]+' '+date.getFullYear()}
                </th>)
            }
            if (props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails))
            result.push(<th key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
            className='align-top'>
                {monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+ ' Qty'}
            </th>)

            result.push(<th key={props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)?
            monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
            :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
            className='align-top'>
                {props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)?
                monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
                :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
            </th>)
        }
        return result;
    }

    
    function populateMonthsAmount(item,data,field) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const result=[]

        const num=field[0].name;
        const itemDate=field[2].name;
        const qty=props.resultInput['groupOne']==='debtorCode'?null:field[3].name;
        const total=props.resultInput['groupOne']==='debtorCode'?field[3].name:field[4].name;
        
        const parsedDateStart=new Date(new Date(props.resultInput.dateStart).getFullYear(),new Date(props.resultInput.dateStart).getMonth(),new Date(props.resultInput.dateStart).getDate(),0)
        const parsedDateEnd=new Date(new Date(props.resultInput.dateEnd).getFullYear(),new Date(props.resultInput.dateEnd).getMonth(),new Date(props.resultInput.dateEnd).getDate(),0)
        if (parsedDateEnd<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0)) {
            if (props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails))
            result.push(
                <th key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        if (b[num]===item[num])
                            return a+b[qty]
                        else return a
                    },0))}
                </th>
            )
            
            result.push(
                <th key={props.resultInput['groupOne']==='itemCode'? 
                monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
                :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        if (b[num]===item[num])
                            return a+b[total]
                        else return a
                    },0))}
                </th>
            )
            
        }
        else {
            let date=new Date(parsedDateStart)
            
            if (props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails))
            result.push(
                <th key={monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Qty'}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        
                    if (b[num]===item[num] 
                        && innerParsedDate<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0))                            
                            return a+b[qty]
                    else return a
                    },0)
                    )}
                </th>)

            result.push(
                <th key={props.resultInput['groupOne']==='itemCode'?
                monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Total'
                :monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        
                    if (b[num]===item[num] 
                        && innerParsedDate<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0))                            
                            return a+b[total]
                    else return a
                    },0)
                    )}
                </th>)
            
            while(parsedDateEnd>new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1+1,0)) {
                date.setMonth(date.getMonth()+1,1)
                if (props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails))
                result.push(
                    <th key={monthNames[date.getMonth()]+' '+date.getFullYear()+' Qty'}
                    className='align-top'>
                        {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        if (b[num]===item[num] 
                            && innerParsedDate>new Date(new Date(date).getFullYear(),(new Date(date).getMonth()),0)
                            && innerParsedDate<=new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1,0))
                                return a+b[qty]
                        else return a
                        },0)
                        )}
                    </th>
                )

                result.push(
                    <th key={props.resultInput['groupOne']==='itemCode'?
                    monthNames[date.getMonth()]+' '+date.getFullYear()+' Total'
                    :monthNames[date.getMonth()]+' '+date.getFullYear()}
                    className='align-top'>
                        {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        if (b[num]===item[num] 
                            && innerParsedDate>new Date(new Date(date).getFullYear(),(new Date(date).getMonth()),0)
                            && innerParsedDate<=new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1,0))
                                return a+b[total]
                        else return a
                        },0)
                        )}
                    </th>
                )
            }
            if (props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails))
            result.push(
                <th key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        if (b[num]===item[num] 
                            && innerParsedDate>new Date(new Date(parsedDateEnd).getFullYear(),(new Date(parsedDateEnd).getMonth()),0)
                            && innerParsedDate<=parsedDateEnd)
                            return a+b[qty]
                        else return a
                    },0)
                    )}
                </th>
            )

            result.push(
                <th key={props.resultInput['groupOne']==='itemCode'?
                monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
                :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        if (b[num]===item[num] 
                            && innerParsedDate>new Date(new Date(parsedDateEnd).getFullYear(),(new Date(parsedDateEnd).getMonth()),0)
                            && innerParsedDate<=parsedDateEnd)
                            return a+b[total]
                        else return a
                    },0)
                    )}
                </th>
            )
        }
        return result;
    }

    function populateDetailMonthsAmount(item,item2,data,field) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const result=[]
        const num=field[0].name
        const subNum=field[1].name;
        const subDate=field[3].name;
        const subQty=field[4].name;
        const subTotal=field[5].name;
        
        const parsedDateStart=new Date(new Date(props.resultInput.dateStart).getFullYear(),new Date(props.resultInput.dateStart).getMonth(),new Date(props.resultInput.dateStart).getDate(),0)
        const parsedDateEnd=new Date(new Date(props.resultInput.dateEnd).getFullYear(),new Date(props.resultInput.dateEnd).getMonth(),new Date(props.resultInput.dateEnd).getDate(),0)
        if (parsedDateEnd<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0)) {
            result.push(
                <td key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        if (b[num]===item[num] && b[subNum]===item2[subNum])
                            return a+b[subQty]
                        else return a
                    },0))}
                </td>
            )

            result.push(
                <td key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear() +' Total'}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        if (b[num]===item[num] && b[subNum]===item2[subNum])
                            return a+b[subTotal]
                        else return a
                    },0))}
                </td>
            )
        }
        else {
            let date=new Date(parsedDateStart)
            
            result.push(
                <td key={monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Qty'} 
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[subDate]).getFullYear(),new Date(b[subDate]).getMonth(),new Date(b[subDate]).getDate(),0)
                        
                    if (b[num]===item[num] && b[subNum]===item2[subNum] 
                        && innerParsedDate<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0))                            
                            return a+b[subQty]
                    else return a
                    },0)
                    )}
                </td>)

                result.push(
                <td key={monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Total'} 
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[subDate]).getFullYear(),new Date(b[subDate]).getMonth(),new Date(b[subDate]).getDate(),0)
                        
                    if (b[num]===item[num] && b[subNum]===item2[subNum] 
                        && innerParsedDate<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0))                            
                            return a+b[subTotal]
                    else return a
                    },0)
                    )}
                </td>)
            
            while(parsedDateEnd>new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1+1,0)) {
                date.setMonth(date.getMonth()+1,1)

                result.push(
                    <td key={monthNames[date.getMonth()]+' '+date.getFullYear()+' Qty'}
                    className='align-top'>
                        {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[subDate]).getFullYear(),new Date(b[subDate]).getMonth(),new Date(b[subDate]).getDate(),0)
                        if (b[num]===item[num] && b[subNum]===item2[subNum] 
                            && innerParsedDate>new Date(new Date(date).getFullYear(),(new Date(date).getMonth()),0)
                            && innerParsedDate<=new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1,0))
                                return a+b[subQty]
                        else return a
                        },0)
                        )}
                    </td>
                )

                result.push(
                    <td key={monthNames[date.getMonth()]+' '+date.getFullYear()+' Total'}
                    className='align-top'>
                        {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[subDate]).getFullYear(),new Date(b[subDate]).getMonth(),new Date(b[subDate]).getDate(),0)
                        if (b[num]===item[num] && b[subNum]===item2[subNum] 
                            && innerParsedDate>new Date(new Date(date).getFullYear(),(new Date(date).getMonth()),0)
                            && innerParsedDate<=new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1,0))
                                return a+b[subTotal]
                        else return a
                        },0)
                        )}
                    </td>
                )
            }

            result.push(
                <td key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[subDate]).getFullYear(),new Date(b[subDate]).getMonth(),new Date(b[subDate]).getDate(),0)
                        if (b[num]===item[num] && b[subNum]===item2[subNum] 
                            && innerParsedDate>new Date(new Date(parsedDateEnd).getFullYear(),(new Date(parsedDateEnd).getMonth()),0)
                            && innerParsedDate<=parsedDateEnd)
                            return a+b[subQty]
                        else return a
                    },0)
                    )}
                </td>
            )

            result.push(
                <td key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[subDate]).getFullYear(),new Date(b[subDate]).getMonth(),new Date(b[subDate]).getDate(),0)
                        if (b[num]===item[num] && b[subNum]===item2[subNum] 
                            && innerParsedDate>new Date(new Date(parsedDateEnd).getFullYear(),(new Date(parsedDateEnd).getMonth()),0)
                            && innerParsedDate<=parsedDateEnd)
                            return a+b[subTotal]
                        else return a
                    },0)
                    )}
                </td>
            )
        }
        return result;

    }
    

    function populateResult() {
        const data=props.data;
        const field=props.field[0];
        const num=field[0].name;
        const name=field[1].name;
        const qty=props.resultInput['groupOne']==='debtorCode'?null:field[3].name;
        const total=props.resultInput['groupOne']==='debtorCode'?field[3].name:field[4].name;

        const dataDetail=props.dataDetail;
        const subField=props.field[1];
        const subNum=subField[1].name;
        const subName=subField[2].name;
        const subQty=subField[4].name;
        const subTotal=subField[5].name;

        const itemAlreadyParsed=[];
        const result=[];

        data.forEach(item=>{
            const subItemAlreadyParsed=[];
            if(itemAlreadyParsed.indexOf(item[num])===-1)  {
                itemAlreadyParsed.push(item[num]);
                result.push(
                <tbody key={item[num]} className='border-bottom border-secondary'>
                    <tr className='border-top border-secondary'>
                        <th className='align-top'>{item[num]}</th>
                        <th className='align-top'>{item[name]}</th>
                        {populateMonthsAmount(item,data,field)}
                        {props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)?
                        (<th className='align-top'>
                            {numberFormatParser(data.reduce((a,b)=>{
                                if(b[num]===item[num])
                                    return a+b[qty]
                                else return a
                            },0))}
                        </th>):null}
                        <th className='align-top'>
                            {numberFormatParser(data.reduce((a,b)=>{
                                if(b[num]===item[num])
                                    return a+b[total]
                                else return a
                            },0))}
                        </th>
                    </tr>
                    {props.resultInput['groupTwo'] && props.withDetails? dataDetail.map(item2=>{
                        if (subItemAlreadyParsed.indexOf(item2[subNum])===-1) {
                            subItemAlreadyParsed.push(item2[subNum])
                            return (
                                <tr key={item2[subNum]}>
                                    <td className='align-top'>{item2[subNum]}</td>
                                    <td className='align-top'>{item2[subName]}</td>
                                    {populateDetailMonthsAmount(item,item2,dataDetail,subField)}
                                    <td className='align-top'>
                                        {dataDetail.reduce((a,b)=>{
                                            if (b[subNum]===item2[subNum] && b[num]===item[num]) 
                                                return a+b[subQty]
                                            else return a
                                        },0)}
                                    </td>
                                    <td className='align-top'>
                                        {numberFormatParser(dataDetail.reduce((a,b)=>{
                                            if (b[subNum]===item2[subNum] && b[num]===item[num]) 
                                                return a+b[subTotal]
                                            else return a
                                        },0)
                                        )}
                                    </td>
                                </tr>
                            )
                    }}):null}
                </tbody>)
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
            
            <table className='table table-borderless'>
                <thead className='border-top border-bottom border-secondary'>
                    <tr>
                        <th className='align-top'>
                            {props.resultInput['groupOne']==='debtorCode'? 'Debtor No.':'Item Code'}
                        </th>
                        <th className='align-top'>Name</th>
                        {populateMonthsHeader()}
                        {props.resultInput['groupOne']==='itemCode' || (props.resultInput['groupOne']==='debtorCode' && props.resultInput['groupTwo']==='itemCode' && props.withDetails)?
                            (<th className='align-top'>Qty</th>):null}
                        <th className='align-top'>Total</th>
                    </tr>
                    {props.withDetails && props.resultInput['groupTwo']?
                    (<tr>
                        <th className='align-top'>
                            {props.resultInput['groupTwo']==='debtorCode'? 'Debtor No.':'Item Code'}
                        </th>
                        <th className='align-top'>Name</th>
                    </tr>):null}
                    
                </thead>
                {populateResult()}
            </table>
            
            <small className='d-block text-center'>End of Report</small>
        </div>
    )
}

export default SalesReportOne;