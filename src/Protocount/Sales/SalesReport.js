import React,{useState,useContext,useEffect} from 'react';
import AppLayout from '../Shared/AppLayout'
import {
    Switch,
    Route,
    useRouteMatch,
    Redirect
} from 'react-router-dom';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import {useHistory} from 'react-router-dom';
import $ from 'jquery'
import numberFormatParser from '../Shared/numberFormatParser';
import sortData from '../Shared/sort';
import setPageSize from '../Shared/setPageSize';
import SalesReportOne from '../Shared/preview/SalesReportOne';

function SalesReport(props) {
    const [{data:dataSelectDebtor,error:errorSelectDebtor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'debtor'}),
            credentials:'include'
        }
    });//extension of Item component

    const [{data:dataSelectStock,error:errorSelectStock}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'stock'}),
            credentials:'include'
        }
    });
    const [{data:dataSelectSalesAnalysis,error:errorSelectSalesAnalysis},changeParamSalesAnalysis]=useFetch(null);
    const [groupOne,changeGroupOne] = useState('debtorCode')
    const [groupTwo,changeGroupTwo] = useState('')
    const [debtorList,changeDebtorList] = useState(null);
    const [stockList,changeStockList] = useState(null);
    const [groupOneID,changeGroupOneID] = useState([]);
    const [groupTwoID,changeGroupTwoID] = useState([]);
    const [dateStart,changeDateStart] = useState(new Date().getFullYear()+'-01-01');
    const [dateEnd,changeDateEnd] = useState(getFormattedDate(new Date()));
    const [resultInput,changeResultInput]=useState(null);
    const [collapsibleElementID,changeCollapsibleElementID]=useState([])

    /*Preview states*/
    const [withDetails,changeWithDetails]=useState(false);
    const [sortCriteriaList,changeSortCriteriaList]=useState(null);
    const [detailSortCriteriaList,changeDetailSortCriteriaList]=useState(null);
    const [sortCriteria,changeSortCriteria]=useState('');
    const [detailSortCriteria,changeDetailSortCriteria]=useState('');
    const [generateReportWarning,changeGenerateReportWarning]=useState(false);

    const {path} = useRouteMatch();
    const {changeAuth} = useContext(authContext);
    const history=useHistory();

    useEffect(()=>{
        
        if (dataSelectDebtor && dataSelectDebtor.auth===false) {
                    alert('Cookies Expired or Authorisation invalid. Please Login again!');
                    changeAuth(false);
                }
        else if (dataSelectDebtor && dataSelectDebtor.data && dataSelectDebtor.field) 
            changeDebtorList(dataSelectDebtor.data.map(data=>(
            <option key={data[dataSelectDebtor.field[0].name]} value={data[dataSelectDebtor.field[0].name]}>
                {data[dataSelectDebtor.field[0].name]+' | '+(data[dataSelectDebtor.field[1].name]?data[dataSelectDebtor.field[1].name]:'')}
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
            
            changeStockList(dataSelectStock.data.map(data=>(
                <option key={data[stockNum]} value={data[stockNum]}>
                    {data[stockNum]+' | '
                    + (data[stockDesc]?data[stockDesc]:'')}
                </option>)
                )
            )
        }

    },[dataSelectDebtor,errorSelectDebtor,dataSelectStock,errorSelectStock])

    useEffect(()=>{
        if (dataSelectSalesAnalysis && dataSelectSalesAnalysis.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectSalesAnalysis && dataSelectSalesAnalysis.data && dataSelectSalesAnalysis.field) {
            const data=dataSelectSalesAnalysis.data[0];
            const field=dataSelectSalesAnalysis.field[0];
            const num=field[0].name;
            const name=field[1].name;

            const itemAlreadyParsed=[];
            const subData=dataSelectSalesAnalysis.data[1];
            const subField=dataSelectSalesAnalysis.field[1];
            const subNum=subField[1].name;
            const subName=subField[2].name;
            
            changeResultInput(resultInput=>{})

            data.forEach(item=>{
                let newObject={}
               if(itemAlreadyParsed.indexOf(item[num])===-1) {
                    itemAlreadyParsed.push(item[num])
                    newObject[item[num]]=subData.filter(item2=>item2[num]===item[num])
                    changeResultInput(resultInput=>(Object.assign({},resultInput,newObject)))
               }
            })

            changeResultInput(resultInput=>({...resultInput,
                data:dataSelectSalesAnalysis.data,
                dataPreview:[...dataSelectSalesAnalysis.data],
                field:dataSelectSalesAnalysis.field,
                dateStart,
                dateEnd,
                groupOne,
                groupTwo
            }))
            changeSortCriteriaList(
                (<>
                    <option value={num}>{groupOne==='debtorCode'?'Debtor No.':'Stock No.'}</option>
                    <option value={name}>Name</option>
                </>)
            )
            if (groupTwo)
            changeDetailSortCriteriaList(
                (<>
                    <option value={subNum}>{groupTwo==='debtorCode'?'Debtor No.':'Stock No.'}</option>
                    <option value={subName}>Name</option>
                    
                </>)
            )
            else changeDetailSortCriteriaList(null)

            changeCollapsibleElementID(itemAlreadyParsed.map(item=>item.replace(/[ ._\-()]/g,'')))

        }
    },[dataSelectSalesAnalysis,errorSelectSalesAnalysis])
console.log(resultInput)

//attach bootstrap/jquery eventlisteners and callbacks
    useEffect(()=>{
        if (collapsibleElementID) {
            collapsibleElementID.forEach(ID=>{
                $('#'+ID).on('show.bs.collapse',e=>{
                    if(e.target===e.currentTarget)
                    $('#plusminus'+ID).removeClass('fa-plus-square').addClass('fa-minus-square');
                })
                $('#'+ID).on('hide.bs.collapse',e=>{
                    if(e.target===e.currentTarget)
                    $('#plusminus'+ID).removeClass('fa-minus-square').addClass('fa-plus-square');
                })
        })
    }
    },[resultInput])

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

    useEffect(()=>{
        function setPage() {
            setPageSize("a4 portrait");
        }
        window.addEventListener('popstate',setPage);

        return function unattach() {
                window.removeEventListener('popstate',setPage)
            }
    },[])

    function getFormattedDate(date) {
        let currDate=new Date(date)
        
        return (currDate.getFullYear()) + (currDate.getMonth() + 1 <10? '-0'+ (currDate.getMonth()+1):'-'+ (currDate.getMonth()+1)) + (currDate.getDate()<10?
        '-0'+currDate.getDate() : '-'+currDate.getDate());
    }

    function populateMonthsHeader() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const result=[]
        
        /*date string from input type date is slightly diff from string date and produce diff result when both string are 
        called with Date() object. Hence perform the following to ensure date objects produced from both string are the same.
        Same with all the calculate methods below*/
        const parsedDateStart=new Date(new Date(resultInput.dateStart).getFullYear(),new Date(resultInput.dateStart).getMonth(),new Date(resultInput.dateStart).getDate(),0)
        const parsedDateEnd=new Date(new Date(resultInput.dateEnd).getFullYear(),new Date(resultInput.dateEnd).getMonth(),new Date(resultInput.dateEnd).getDate(),0)
        
        if (parsedDateEnd<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0)) {
            if (resultInput['groupOne']==='itemCode')
            result.push(<h6 key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
            style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                {monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
            </h6>)

            result.push(<h6 key={resultInput['groupOne']==='itemCode'?
            monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
            :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
            style={resultInput['groupOne']==='itemCode'?
            {flex:'0 0 100px',paddingLeft:10,paddingRight:10}
            :{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                {resultInput['groupOne']==='itemCode'? 
                monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
                :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
            </h6>)
        }
        else {
            let date=new Date(parsedDateStart)
            if (resultInput['groupOne']==='itemCode')
            result.push(<h6 key={monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Qty'} 
            style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                {monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Qty'}
            </h6>)

            result.push(<h6 key={resultInput['groupOne']==='itemCode'?
            monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Total'
            :monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()} 
            style={resultInput['groupOne']==='itemCode'?
            {flex:'0 0 100px',paddingLeft:10,paddingRight:10}
            :{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                {resultInput['groupOne']==='itemCode'? 
                monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Total'
                :monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()}
            </h6>)
            
            while(parsedDateEnd>new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1+1,0)) {
                date.setMonth(date.getMonth()+1,1)
                if (resultInput['groupOne']==='itemCode')
                result.push(<h6 key={monthNames[date.getMonth()]+' '+date.getFullYear()+' Qty'} 
                style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                    {monthNames[date.getMonth()]+' '+date.getFullYear()+' Qty'}
                </h6>)

                result.push(<h6 key={resultInput['groupOne']==='itemCode'?
                monthNames[date.getMonth()]+' '+date.getFullYear()+' Total'
                :monthNames[date.getMonth()]+' '+date.getFullYear()} 
                style={resultInput['groupOne']==='itemCode'?
                {flex:'0 0 100px',paddingLeft:10,paddingRight:10}
                :{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                    {resultInput['groupOne']==='itemCode'? 
                    monthNames[date.getMonth()]+' '+date.getFullYear()+' Total'
                    :monthNames[date.getMonth()]+' '+date.getFullYear()}
                </h6>)
            }
            if (resultInput['groupOne']==='itemCode')
            result.push(<h6 key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'} 
            style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                {monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+ ' Qty'}
            </h6>)

            result.push(<h6 key={resultInput['groupOne']==='itemCode'?
            monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
            :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()} 
            style={resultInput['groupOne']==='itemCode'?
            {flex:'0 0 100px',paddingLeft:10,paddingRight:10}
            :{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                {resultInput['groupOne']==='itemCode'?
                monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
                :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
            </h6>)
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
        const qty=resultInput['groupOne']==='debtorCode'?null:field[3].name;
        const total=resultInput['groupOne']==='debtorCode'?field[3].name:field[4].name;
        
        /*date string from input type date is slightly diff from string date and produce diff result when both string are 
        called with Date() object. Hence perform the following to ensure date objects produced from both string are the same.
        Same with all the calculate methods below*/
        const parsedDateStart=new Date(new Date(resultInput.dateStart).getFullYear(),new Date(resultInput.dateStart).getMonth(),new Date(resultInput.dateStart).getDate(),0)
        const parsedDateEnd=new Date(new Date(resultInput.dateEnd).getFullYear(),new Date(resultInput.dateEnd).getMonth(),new Date(resultInput.dateEnd).getDate(),0)
        if (parsedDateEnd<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0)) {
            if (resultInput['groupOne']==='itemCode')
            result.push(
                <p key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
                className='mb-0' 
                style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                    {numberFormatParser(data.reduce((a,b)=>{
                        if (b[num]===item[num])
                            return a+b[qty]
                        else return a
                    },0))}
                </p>
            )
            
            result.push(
                <p key={resultInput['groupOne']==='itemCode'? 
                monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
                :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
                className='mb-0' 
                style={resultInput['groupOne']==='itemCode'?
                {flex:'0 0 100px',paddingLeft:10,paddingRight:10}
                :{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                    {numberFormatParser(data.reduce((a,b)=>{
                        if (b[num]===item[num])
                            return a+b[total]
                        else return a
                    },0))}
                </p>
            )
            
        }
        else {
            let date=new Date(parsedDateStart)
            
            if (resultInput['groupOne']==='itemCode')
            result.push(
                <p key={monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Qty'} 
                className='mb-0' style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        
                    if (b[num]===item[num] 
                        && innerParsedDate<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0))                            
                            return a+b[qty]
                    else return a
                    },0)
                    )}
                </p>)

            result.push(
                <p key={resultInput['groupOne']==='itemCode'?
                monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Total'
                :monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()} 
                className='mb-0' 
                style={resultInput['groupOne']==='itemCode'?
                    {flex:'0 0 100px',paddingLeft:10,paddingRight:10}
                    :{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        
                    if (b[num]===item[num] 
                        && innerParsedDate<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0))                            
                            return a+b[total]
                    else return a
                    },0)
                    )}
                </p>)
            
            while(parsedDateEnd>new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1+1,0)) {
                date.setMonth(date.getMonth()+1,1)
                if (resultInput['groupOne']==='itemCode')
                result.push(
                    <p key={monthNames[date.getMonth()]+' '+date.getFullYear()+' Qty'}
                    className='mb-0' style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                        {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        if (b[num]===item[num] 
                            && innerParsedDate>new Date(new Date(date).getFullYear(),(new Date(date).getMonth()),0)
                            && innerParsedDate<=new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1,0))
                                return a+b[qty]
                        else return a
                        },0)
                        )}
                    </p>
                )

                result.push(
                    <p key={resultInput['groupOne']==='itemCode'?
                    monthNames[date.getMonth()]+' '+date.getFullYear()+' Total'
                    :monthNames[date.getMonth()]+' '+date.getFullYear()}
                    className='mb-0' 
                    style={resultInput['groupOne']==='itemCode'?
                    {flex:'0 0 100px',paddingLeft:10,paddingRight:10}
                    :{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                        {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        if (b[num]===item[num] 
                            && innerParsedDate>new Date(new Date(date).getFullYear(),(new Date(date).getMonth()),0)
                            && innerParsedDate<=new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1,0))
                                return a+b[total]
                        else return a
                        },0)
                        )}
                    </p>
                )
            }
            if (resultInput['groupOne']==='itemCode')
            result.push(
                <p key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
                className='mb-0' style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        if (b[num]===item[num] 
                            && innerParsedDate>new Date(new Date(parsedDateEnd).getFullYear(),(new Date(parsedDateEnd).getMonth()),0)
                            && innerParsedDate<=parsedDateEnd)
                            return a+b[qty]
                        else return a
                    },0)
                    )}
                </p>
            )

            result.push(
                <p key={resultInput['groupOne']==='itemCode'?
                monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'
                :monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()}
                className='mb-0' 
                style={resultInput['groupOne']==='itemCode'?
                {flex:'0 0 100px',paddingLeft:10,paddingRight:10}
                :{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                    {numberFormatParser(data.reduce((a,b)=>{
                        const innerParsedDate=new Date(new Date(b[itemDate]).getFullYear(),new Date(b[itemDate]).getMonth(),new Date(b[itemDate]).getDate(),0)
                        if (b[num]===item[num] 
                            && innerParsedDate>new Date(new Date(parsedDateEnd).getFullYear(),(new Date(parsedDateEnd).getMonth()),0)
                            && innerParsedDate<=parsedDateEnd)
                            return a+b[total]
                        else return a
                    },0)
                    )}
                </p>
            )
        }
        return result;
    }

    function populateTableHeader() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const result=[]
        
        /*date string from input type date is slightly diff from string date and produce diff result when both string are 
        called with Date() object. Hence perform the following to ensure date objects produced from both string are the same.
        Same with all the calculate methods below*/
        const parsedDateStart=new Date(new Date(resultInput.dateStart).getFullYear(),new Date(resultInput.dateStart).getMonth(),new Date(resultInput.dateStart).getDate(),0)
        const parsedDateEnd=new Date(new Date(resultInput.dateEnd).getFullYear(),new Date(resultInput.dateEnd).getMonth(),new Date(resultInput.dateEnd).getDate(),0)
        
        if (parsedDateEnd<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0)) {
            result.push(
            <th key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
            className='align-top'>
                {monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
            </th>)

            result.push(
            <th key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'}
            className='align-top'>
                {monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'}
            </th>)
        }
        else {
            let date=new Date(parsedDateStart)
            result.push(
            <th key={monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Qty'}
            className='align-top'>
                {monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Qty'}
            </th>)
            result.push(
                <th key={monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Total'}
                className='align-top'>
                    {monthNames[parsedDateStart.getMonth()]+' '+parsedDateStart.getFullYear()+' Total'}
                </th>)
            
            while(parsedDateEnd>new Date(new Date(date).getFullYear(),(new Date(date).getMonth())+1+1,0)) {
                date.setMonth(date.getMonth()+1,1)

                result.push(
                <th key={monthNames[date.getMonth()]+' '+date.getFullYear()+' Qty'}
                className='align-top'>
                    {monthNames[date.getMonth()]+' '+date.getFullYear()+' Qty'}
                </th>)

                result.push(
                <th key={monthNames[date.getMonth()]+' '+date.getFullYear()+' Total'}
                className='align-top'>
                    {monthNames[date.getMonth()]+' '+date.getFullYear()+' Total'}
                </th>)
            }

            result.push(
            <th key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
            className='align-top'>
                {monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
            </th>)

            result.push(
            <th key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'}
            className='align-top'>
                {monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Total'}
            </th>)
        }
        
        return result;
        
    }

    function populateTableMonthsAmount(item,data,field) {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const result=[]
        
        const subNum=field[1].name;
        const subDate=field[3].name;
        const subQty=field[4].name;
        const subTotal=field[5].name;
        
        /*date string from input type date is slightly diff from string date and produce diff result when both string are 
        called with Date() object. Hence perform the following to ensure date objects produced from both string are the same.
        Same with all the calculate methods below*/
        const parsedDateStart=new Date(new Date(resultInput.dateStart).getFullYear(),new Date(resultInput.dateStart).getMonth(),new Date(resultInput.dateStart).getDate(),0)
        const parsedDateEnd=new Date(new Date(resultInput.dateEnd).getFullYear(),new Date(resultInput.dateEnd).getMonth(),new Date(resultInput.dateEnd).getDate(),0)
        if (parsedDateEnd<=new Date(new Date(parsedDateStart).getFullYear(),(new Date(parsedDateStart).getMonth())+1,0)) {
            result.push(
                <td key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear()+' Qty'}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        if (b[subNum]===item[subNum])
                            return a+b[subQty]
                        else return a
                    },0))}
                </td>
            )

            result.push(
                <td key={monthNames[parsedDateEnd.getMonth()]+' '+parsedDateEnd.getFullYear() +' Total'}
                className='align-top'>
                    {numberFormatParser(data.reduce((a,b)=>{
                        if (b[subNum]===item[subNum])
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
                        
                    if (b[subNum]===item[subNum] 
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
                        
                    if (b[subNum]===item[subNum] 
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
                        if (b[subNum]===item[subNum] 
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
                        if (b[subNum]===item[subNum] 
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
                        if (b[subNum]===item[subNum] 
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
                        if (b[subNum]===item[subNum] 
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
        const data=resultInput['data'][0];
        const field=resultInput['field'][0];
        const num=field[0].name;
        const name=field[1].name;
        const qty=resultInput['groupOne']==='debtorCode'?null:field[3].name;
        const total=resultInput['groupOne']==='debtorCode'?field[3].name:field[4].name;

        const subData=resultInput['data'][1];
        const subField=resultInput['field'][1];
        const subNum=subField[1].name;
        const subName=subField[2].name;
        const subQty=subField[4].name;
        const subTotal=subField[5].name;
        
        const header=populateMonthsHeader();
        const calculatedWidth=resultInput['groupOne']==='debtorCode'? 34+120+225+(header.length*150)+100:34+120+225+(header.length*100)+100+100;

        function populateItem() {
            const itemAlreadyParsed=[];
            const result=[];

            data.forEach(item=>{
                const subItemAlreadyParsed=[];
                if(itemAlreadyParsed.indexOf(item[num])===-1)  {
                    itemAlreadyParsed.push(item[num]);
                    result.push(
                        <div key={item[num]}>
                            <div className='d-flex' style={resultInput['groupTwo']?{cursor:'pointer'}:null} data-toggle='collapse' data-target={'#'+item[num].replace(/[ ._\-()]/g,'')}>
                                <i className={resultInput['groupTwo']?'fa fa-plus-square mt-1':''} 
                                style={resultInput['groupTwo']? {flex:'0 0 14px',paddingLeft:10,paddingRight:10}:{flex:'0 0 34px'}}
                                id={'plusminus'+item[num].replace(/[ ._\-()]/g,'')}></i>
                                <p className='mb-0' style={{flex:'0 0 120px',paddingLeft:10,paddingRight:10}}>{item[num]}</p>
                                <p className='mb-0' style={{flex:'0 0 225px',paddingLeft:10,paddingRight:10}}>{item[name]}</p>
                                {populateMonthsAmount(item,data,field)}
                                {resultInput['groupOne']==='itemCode'?
                                <p className='mb-0' style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                                    {numberFormatParser(data.reduce((a,b)=>{
                                        if(b[num]===item[num])
                                            return a+b[qty]
                                        else return a
                                    },0))}
                                </p>:null}
                                <p className='mb-0' style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>
                                    {numberFormatParser(data.reduce((a,b)=>{
                                        if(b[num]===item[num])
                                            return a+b[total]
                                        else return a
                                    },0))}
                                </p>
                            </div>
                            {resultInput['groupTwo']?
                            (<div className='collapse navbar-collapse my-2 pl-3 pl-md-5' 
                            id={item[num].replace(/[ ._\-()]/g,'')}>
                                <table className='table table-hover'>
                                    <thead>
                                        <tr>
                                            <th className='align-top' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                            if (resultInput[item[num]]) {
                                                const id='subNum'+item[num].replace(/[ ._\-()]/g,'');   
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                let sortedData={}
                                                sortedData[item[num]]=sortData(resultInput[item[num]],subNum,e.target.getAttribute('data-order'))
                                                changeResultInput(Object.assign({},resultInput,sortedData))
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                            }
                                            }}>
                                                {resultInput['groupTwo']==='itemCode'?'Stock No.':'Debtor No.'}
                                                <i id={'subNum'+item[num].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='align-top' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                            if (resultInput[item[num]]) {
                                                const id='subName'+item[num].replace(/[ ._\-()]/g,'');   
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                let sortedData={}
                                                sortedData[item[num]]=sortData(resultInput[item[num]],subName,e.target.getAttribute('data-order'))
                                                changeResultInput(Object.assign({},resultInput,sortedData))
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                            }
                                            }}>
                                                    Name
                                                    <i id={'subName'+item[num].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                                </th>
                                            {populateTableHeader()}
                                            <th className='align-top'>Total Qty</th>
                                            <th className='align-top'>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resultInput[item[num]]? resultInput[item[num]].map(item2=>{
                                            if (subItemAlreadyParsed.indexOf(item2[subNum])===-1) {
                                                subItemAlreadyParsed.push(item2[subNum])
                                                return (
                                                    <tr key={item2[subNum]}>
                                                        <td className='align-top'>{item2[subNum]}</td>
                                                        <td className='align-top'>{item2[subName]}</td>
                                                        {populateTableMonthsAmount(item2,resultInput[item[num]],subField)}
                                                        <td className='align-top'>
                                                            {resultInput[item[num]].reduce((a,b)=>{
                                                                if (b[subNum]===item2[subNum]) 
                                                                    return a+b[subQty]
                                                                else return a
                                                            },0)}
                                                        </td>
                                                        <td className='align-top'>
                                                            {numberFormatParser(resultInput[item[num]].reduce((a,b)=>{
                                                                if (b[subNum]===item2[subNum]) 
                                                                    return a+b[subTotal]
                                                                else return a
                                                            },0)
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                            
                                        })
                                        :null}
                                    </tbody>
                                </table>
                            </div>):null}
                        </div>
                    )}
            })
            return result;
        }

        return (
            <div className="overflow-auto mb-5 pt-3" style={{transform:'rotateX(180deg)'}}>
                <div style={{width:calculatedWidth,transform:'rotateX(180deg)'}}>
                    <div className='row flex-nowrap text-white bg-secondary pt-2 pb-1' 
                    style={{marginLeft:0,marginRight:0,}}>
                        <h6 style={{flex:'0 0 34px',paddingLeft:10,paddingRight:10}}></h6>
                        <h6 style={{flex:'0 0 120px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                            data-order='asc' onClick={(e)=>{
                            e.target.setAttribute('data-order',
                            e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                            resultInput['data'][0]=sortData(resultInput['data'][0],num,e.target.getAttribute('data-order'))
                            changeResultInput({...resultInput})
                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('num').classList.remove('fa-caret-up');
                                    document.getElementById('num').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('num').classList.remove('fa-caret-down');
                                    document.getElementById('num').classList.add('fa-caret-up')
                                }
                            }
                                    
                            }>
                            {resultInput['groupOne']==='debtorCode'?'Debtor No.':'Stock No.'}
                            <i id='num' className='fa fa-caret-down ml-2'></i>
                        </h6>
                        <h6 style={{flex:'0 0 225px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                        data-order='asc' onClick={(e)=>{
                            e.target.setAttribute('data-order',
                            e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                            resultInput['data'][0]=sortData(resultInput['data'][0],name,e.target.getAttribute('data-order'))
                            changeResultInput({...resultInput})
                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('name').classList.remove('fa-caret-up');
                                    document.getElementById('name').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('name').classList.remove('fa-caret-down');
                                    document.getElementById('name').classList.add('fa-caret-up')
                                }
                            }
                            }>
                            Name
                            <i id='name' className='fa fa-caret-down ml-2'></i>
                        </h6>
                        {header}
                        {resultInput['groupOne']==='debtorCode'?null:
                        <h6 style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>Qty</h6>}
                        <h6 style={{flex:'0 0 100px',paddingLeft:10,paddingRight:10}}>Total</h6>
                    </div>
                    <div style={{overflowY:'auto',overflowX:'hidden',maxHeight:'60vh'}}>
                        {populateItem()}
                    </div>
                </div>
            </div>)
    }
    
    return (
        <Switch>
            <Route exact path={`${path}/Preview`}>
                {resultInput? 
                (<SalesReportOne
                    backPath={SalesReport.path}
                    description={SalesReport.description}
                    resultInput={resultInput}
                    withDetails={withDetails}
                    data={sortData(resultInput['dataPreview'][0],sortCriteria,'asc')}
                    dataDetail={sortData(resultInput['dataPreview'][1],detailSortCriteria,'asc')}
                    field={resultInput['field']}
                    getFormattedDate={getFormattedDate}
                   
                    
                />):<Redirect to={SalesReport.path}/>}
            </Route>

            <Route exact path={path}>
                <AppLayout>
                    <div className='container pt-3' style={{paddingLeft:20,paddingRight:20}}>
                        <h3>{SalesReport.description}</h3>
                        <form className='mt-3' onSubmit={e=>{
                        e.preventDefault();
                        changeGenerateReportWarning(false);
                        if (groupOne==='debtorCode')
                        changeParamSalesAnalysis({
                            url:'./ReportItem',
                            init:{
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({
                                    item:'sales_analysis_debtor_stock',
                                    param:[dateStart,dateEnd,groupOneID,groupTwoID]
                                }),
                                credentials:'include'
                            }
                        })
                        else 
                        changeParamSalesAnalysis({
                            url:'./ReportItem',
                            init:{
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({
                                    item:'sales_analysis_stock_debtor',
                                    param:[dateStart,dateEnd,groupOneID,groupTwoID]
                                }),
                                credentials:'include'
                            }
                        })
                        
                        
                        }}>
                        <div className='form-row'>
                            <div className='form-group form-row mx-0 col-12'>
                                <label className='col-md-2 col-form-label' style={{paddingLeft:0}} htmlFor='dateStart'>Date Start</label>
                                <input type='date' id='dateStart' required onChange={(e)=>{
                                    if (new Date(e.target.value)>new Date(dateEnd)) {
                                        alert('Invalid Date Start Entry')
                                        changeDateStart(new Date().getFullYear()+'-01-01')
                                    }
                                    else changeDateStart(e.target.value)
                                }} 
                                    value={dateStart} required className='form-control col-md-3 mb-3 mb-md-0'/>
                                <label className='offset-md-1 col-md-2 col-form-label' style={{paddingLeft:0}} htmlFor='dateEnd'>Date End</label>
                                <input type='date' id='dateEnd' required onChange={(e)=>{
                                    if (new Date(e.target.value)<new Date(dateStart)) {
                                        alert('Invalid Date End Entry')
                                        changeDateEnd(getFormattedDate(new Date()))
                                    }
                                    else changeDateEnd(e.target.value)
                                }} value={dateEnd} required className='form-control col-md-3 mb-3 mb-md-0'/>
                            </div>
                            
                            <fieldset className='form-group border py-3 px-4 border-secondary rounded col-md-7'>
                                <legend className='col-form-label col-4 offset-4 text-center'>
                                    <h6>Options</h6>
                                </legend>

                                <div className='form-group form-row'>
                                    <label className='col-md-2 col-form-label' htmlFor='groupOne'>Group One</label>
                                    <select className='form-control col-md-2' required id='groupOne' 
                                    value={groupOne} onChange={e=>{
                                        changeGroupOne(e.target.value)
                                        changeGroupTwo('')
                                        changeGroupOneID([])
                                        changeGroupTwoID([])
                                    }}>
                                        <option value='debtorCode'>Debtor Code</option>
                                        <option value='itemCode'>Item Code</option>
                                    </select>
                                    <label className='col-md-2 col-form-label pl-3' htmlFor='groupOneID'>
                                        {groupOne==='debtorCode'?'Debtor ID':'Stock ID'}
                                    </label>
                                    <select className='form-control col-md-6' required size='3' id='groupOneID' 
                                    value={groupOneID} multiple={true} onChange={e=>{
                                        let result=[];
                                        Array.from(e.target.options).map(option=>{
                                            if (option.selected===true) 
                                                result.push(option.value) 
                                        })
                                        changeGroupOneID(result)
                                    }}>
                                        {groupOne==='debtorCode'?debtorList:stockList}
                                    </select>
                                </div>

                                <div className='form-group form-row'>
                                    <div className='form-check offset-md-6'>
                                        <input type='checkbox' className=' form-check-input' id='groupOneAllID' 
                                        checked={groupOne==='debtorCode'? (dataSelectDebtor && dataSelectDebtor.data.length===groupOneID.length?
                                            true:false):(dataSelectStock && dataSelectStock.data.length===groupOneID.length?
                                                true:false)}
                                        onChange={e=>{
                                            if (e.target.checked) 
                                                changeGroupOneID(groupOne==='debtorCode'?
                                                dataSelectDebtor.data.map(data=>
                                                    data[dataSelectDebtor.field[0].name])
                                                :dataSelectStock.data.map(data=>
                                                    data[dataSelectStock.field[0].name])
                                                )
                                            else changeGroupOneID([])
                                        }}/>
                                        <label htmlFor='groupOneAllID' style={{paddingLeft:0}} className='form-check-label'>
                                            {groupOne==='debtorCode'?'All Debtor ID':'All Stock ID'}
                                        </label>
                                    </div>
                                </div>

                                <div className='form-group form-row'>
                                    <label className='col-md-2 col-form-label' htmlFor='groupTwo'>Group Two</label>
                                    <select className='form-control col-md-2' id='groupTwo' 
                                    value={groupTwo} onChange={e=>{
                                        changeGroupTwo(e.target.value)
                                        changeGroupTwoID([])
                                    }}>
                                        <option value=''> -select an option- </option>
                                        <option value={groupOne==='debtorCode'?'itemCode':'debtorCode'}>{groupOne==='debtorCode'?'Item Code':'Debtor Code'}</option>
                                    </select>
                                    {groupTwo? (<label className='col-md-2 col-form-label pl-3' htmlFor='groupTwoID'>
                                        {groupTwo==='debtorCode'?'Debtor ID':'Stock ID'}
                                    </label>):null}
                                    {groupTwo? (<select className='form-control col-md-6' required size='3' id='groupTwoID'
                                    disabled={groupTwo?false:true}
                                    value={groupTwoID} multiple={true} onChange={e=>{
                                        let result=[];
                                        Array.from(e.target.options).map(option=>{
                                            if (option.selected===true) 
                                                result.push(option.value) 
                                        })
                                        changeGroupTwoID(result);
                                    }}>
                                        {groupTwo==='debtorCode'?debtorList:stockList}
                                    </select>):null}
                                </div>

                                {groupTwo? (<div className='form-group form-row'>
                                    <div className='form-check offset-md-6'>
                                        <input type='checkbox' className=' form-check-input' id='groupTwoAllID' 
                                        checked={groupTwo==='debtorCode'? (dataSelectDebtor && dataSelectDebtor.data.length===groupTwoID.length?
                                        true:false):(dataSelectStock && dataSelectStock.data.length===groupTwoID.length?
                                            true:false)}
                                        onChange={e=>{
                                            if (e.target.checked) 
                                                changeGroupTwoID(groupTwo==='debtorCode'?
                                                dataSelectDebtor.data.map(data=>
                                                    data[dataSelectDebtor.field[0].name])
                                                :dataSelectStock.data.map(data=>
                                                    data[dataSelectStock.field[0].name])
                                                )
                                            else changeGroupTwoID([])
                                        }}/>
                                        <label htmlFor='groupTwoAllID' style={{paddingLeft:0}} className='form-check-label'>
                                            {groupTwo==='debtorCode'?'All Debtor ID':'All Stock ID'}
                                        </label>
                                    </div>
                                </div>):null}

                            </fieldset>

                            <fieldset className='form-group py-2 px-4 border border-secondary rounded col-md-3 offset-md-1'>
                                <legend className='col-form-label col-md-6 offset-md-3 col-8 offset-2 text-center'>
                                    <h6>Preview Options</h6>
                                </legend>
                                <div className='form-row'>
                                <div className='form-check col-md-12 form-group col-form-label' style={{paddingLeft:20}}>
                                    <input type='checkbox' className='form-check-input' id='withDetails' onChange={e=>{
                                        if (e.target.checked) 
                                            changeWithDetails(true)
                                        else changeWithDetails(false)
                                        }} checked={withDetails}/>
                                    <label htmlFor='withDetails' className='form-check-label'>With Details</label>
                                </div>

                                <div className='form-group form-row col-md-12'>
                                    <label className='col-md-4 col-form-label' style={{paddingLeft:0}} htmlFor='sort'>
                                        Sort
                                    </label>
                                    <select id='sort' className='form-control col-md-8' value={sortCriteria} onChange={e=>
                                        changeSortCriteria(e.target.value)
                                    }>
                                        <option value=''> -select an option- </option>
                                        {sortCriteriaList}
                                    </select>
                                </div>

                                <div className='form-group col-md-12 form-row'>
                                    <label className='col-md-6 col-form-label ' style={{paddingLeft:0}} htmlFor='sort'>
                                        Detail Sort
                                    </label>
                                    <select id='sort' className='form-control col-md-6' value={detailSortCriteria} onChange={e=>
                                        changeDetailSortCriteria(e.target.value)
                                    }>
                                        <option value=''> -select an option- </option> 
                                        {detailSortCriteriaList}
                                    </select>
                                </div>
                                </div>
                            </fieldset>
                            <div className='col-md-12'>
                                <button type='submit' className='btn btn-primary mx-2'>Generate</button>
                                <button type='button' className='btn btn-warning' onClick={e=>
                                    changeResultInput(null)}>Clear</button>
                                <button type='button' onClick={(e)=>{
                                    if (!resultInput) {
                                        changeGenerateReportWarning(true)
                                    }
                                    else {
                                        document.querySelector("meta[name=viewport]").setAttribute(
                                        'content','width=device-width, initial-scale=0.4');
                                        setPageSize('a4 landscape')
                                        history.push('./SalesReport/Preview')
                                    }}
                                } 
                                className='btn btn-info mx-1 my-1'>Preview</button>
                                {generateReportWarning? 
                                (<div className="alert alert-warning">
                                    Please generate report first!
                                </div>):null}
                            </div>
                        </div>
                        </form>
                        <hr/>

                        {resultInput? 
                        (<div className='mb-5'>
                            <h5 className='py-2'>
                                Result
                                <button className='btn btn-dark mx-2' 
                                    onClick={(e)=>collapsibleElementID.forEach(ID=>
                                        $('#'+ID).collapse('show')
                                )}><i className='fa fa-plus-square'></i> Expand</button>
                                <button className='btn btn-light'  
                                    onClick={(e)=>collapsibleElementID.forEach(ID=>
                                        $('#'+ID).collapse('hide')
                                )}> <i className='fa fa-minus-square'></i> Collapse</button>
                            </h5>
                            {populateResult()}
                            
                        </div>):null
                        }
                        <hr className='pb-3'/>
                    </div>
                </AppLayout>
            </Route>
            <Redirect to={SalesReport.path}/>
        </Switch>
    )
}
SalesReport.description='Sales Report';
SalesReport.path='/SalesReport';

export default SalesReport;