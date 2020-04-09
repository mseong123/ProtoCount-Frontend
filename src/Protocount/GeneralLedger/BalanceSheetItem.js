import React,{useState,useEffect,useContext} from 'react';
import AppLayout from '../Shared/AppLayout';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import numberFormatParser from '../Shared/numberFormatParser'
import dateFormatParser from '../Shared/dateFormatParser';
import sortData from '../Shared/sort';
import $ from 'jquery'
import {useHistory} from 'react-router-dom';

function BalanceSheetItem (props) {

    const url={
        date:new URLSearchParams(props.location.search).get('date'),
        companyTitle:new URLSearchParams(props.location.search).get('companyTitle'),
    }
    const [{data:dataSelectBalanceSheet,error:errorSelectBalanceSheet}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'balance_sheet'}),
            credentials:'include'
        }
    });
    const [sortedData,changeSortedData]=useState(null);
    const [netAssets,changeNetAssets]=useState(null);
    const [netAssetsTotal,changeNetAssetsTotal]=useState(0);
    const [netEquity,changeNetEquity]=useState(null);
    const [netEquityTotal,changeNetEquityTotal]=useState(0);
    const [currentProfitAndLoss,changeCurrentProfitAndLoss]=useState(0);
    const [retainedEarnings,changeRetainedEarnings]=useState(0);
    const [collapsibleElementID,changeCollapsibleElementID]=useState([])
    const [printFormat,changePrintFormat]=useState(false);

    const {changeAuth} = useContext(authContext)
    const history=useHistory();

    useEffect(()=>{
         if (dataSelectBalanceSheet && dataSelectBalanceSheet.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!')
                changeAuth(false)
            }
                
        else if (dataSelectBalanceSheet && dataSelectBalanceSheet.data && dataSelectBalanceSheet.field) {
            let glDescAlreadyParsed=[];
            let itemNameAlreadyParsed=[];
            const data=dataSelectBalanceSheet.data[1];
            const field=dataSelectBalanceSheet.field[1];
            const glDesc=field[2].name;
            const itemName=field[3].name;

            let ID=[]

            data.forEach(item=>{
                let newObject={}
                if(glDescAlreadyParsed.indexOf(item[glDesc])===-1) {
                    glDescAlreadyParsed.push(item[glDesc])
                    newObject[item[glDesc]]=data.filter(item2=>item2[glDesc]===item[glDesc])
                    changeSortedData(sortedData=>(Object.assign({},{...sortedData},newObject)))
                }
            })

            data.forEach(item=>{
                let newObject={}
                if(itemNameAlreadyParsed.indexOf(item[itemName])===-1 && item[itemName]!==null) {
                    itemNameAlreadyParsed.push(item[itemName])
                    newObject[item[itemName]]=data.filter(item2=>item2[itemName]===item[itemName])
                    changeSortedData(sortedData=>(Object.assign({},{...sortedData},newObject)))
                }
            })

            dataSelectBalanceSheet.data[1].forEach(item=>{
                if(ID.indexOf(item[glDesc].replace(/[ ._()]/g,''))===-1) 
                    ID.push(item[glDesc].replace(/[ ._()]/g,''))
                else if (item[itemName] && ID.indexOf(item[itemName].replace(/[ ._()]/g,''))===-1)
                    ID.push(item[itemName].replace(/[ ._()]/g,''))
                
            })
            changeCollapsibleElementID(ID)
        }
    },[dataSelectBalanceSheet,errorSelectBalanceSheet])

    useEffect(()=>{
        if(sortedData) {
            const category=dataSelectBalanceSheet.data[0].map(category=>category[dataSelectBalanceSheet.field[0][0].name])
            const currentProfitAndLoss=calculateCurrentProfitAndLoss(dataSelectBalanceSheet.data[2],dataSelectBalanceSheet.field[2]);
            const retainedEarnings=calculateRetainedEarnings(dataSelectBalanceSheet.data[2],dataSelectBalanceSheet.field[2]);

            changeNetAssets(populateCategory(category.slice(0,6),dataSelectBalanceSheet.data[1],sortedData,dataSelectBalanceSheet.field[1],false))
            changeNetAssetsTotal(numberFormatParser(calculateCategoryTotal(category.slice(0,6),dataSelectBalanceSheet.data[1],dataSelectBalanceSheet.field[1],false)));

            changeNetEquity(populateCategory(category.slice(6),dataSelectBalanceSheet.data[1],sortedData,dataSelectBalanceSheet.field[1],true))

            changeCurrentProfitAndLoss(numberFormatParser(currentProfitAndLoss))
            changeRetainedEarnings(numberFormatParser(retainedEarnings))

            changeNetEquityTotal(numberFormatParser(calculateCategoryTotal(category.slice(6),dataSelectBalanceSheet.data[1],dataSelectBalanceSheet.field[1],true)
            +currentProfitAndLoss+retainedEarnings));
        
            
        }
    },[sortedData,printFormat])
    
    //attach bootstrap/jquery eventlisteners and callbacks
    useEffect(()=>{

        if (collapsibleElementID && netAssets && netEquity) {
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
        
    },[netAssets,netEquity])
    
    /*single category or array of categories*/
    function calculateCategoryTotal(category=[],data,field,debitCreditOpposite) {
        
        const glCategory=field[0].name;
        const itemDate=field[4].name; 
        const itemDebit=field[7].name;
        const itemCredit=field[8].name;
        
        return data.reduce((a,b)=>{        
            if (new Date(b[itemDate])<=new Date(url.date) && category.indexOf(b[glCategory])!==-1) {
                if (debitCreditOpposite) 
                    return a+b[itemCredit]-b[itemDebit];
                else return a+b[itemDebit]-b[itemCredit];
            }
            else return a;
        },0)
    }

    function calculateCurrentProfitAndLoss(data,field) {
        const itemDate=field[3].name; 
        const itemDebit=field[6].name;
        const itemCredit=field[7].name;
        
        return data.reduce((a,b)=>{        
            if (new Date(b[itemDate])<=new Date(url.date) 
            && (new Date(b[itemDate])>=new Date(new Date(url.date).getFullYear()+'-01-01')) 
            ) 
                    
                return a+b[itemCredit]-b[itemDebit];
            else return a;
        },0)
    }

    function calculateRetainedEarnings(data,field) {
        const itemDate=field[3].name; 
        const itemDebit=field[6].name;
        const itemCredit=field[7].name;
        
        return data.reduce((a,b)=>{        
            if (new Date(b[itemDate])<new Date(new Date(url.date).getFullYear()+'-01-01')) 
                return a+b[itemCredit]-b[itemDebit];
            else return a;
        },0)
    }
    
    function createLink(string,id) {
        var WIPstring=string.split(' ');

        WIPstring=WIPstring.map(string=>{
            return string.toLowerCase()
        })
        WIPstring=WIPstring.map(string=>{
            return string[0].toUpperCase().concat(string.substr(1))
        })

        return WIPstring.join('')+'Item?item='+string.replace(/ /g,'_')+'&id='+encodeURIComponent(id)
    }

    function populateCategory(category=[],data,sortedData1,field,debitCreditOpposite) {
        return (
            category.map(category=>{
                let accounts=populateAccount(category,data,sortedData1,field,debitCreditOpposite);
                if (accounts.length>0)
                    return (
                    <section key={category}>
                        <h6><u>{category}</u></h6>
                            {accounts}
                        <p className='h6 text-right my-1'><u>{'TOTAL : '+numberFormatParser(calculateCategoryTotal([category],data,field,debitCreditOpposite))}</u></p>
                    </section>)
                }
            )
        )
    }
    
    function populateAccount(category,data,sortedData1,field,debitCreditOpposite) {
        const glCategory=field[0].name;
        const glAccount=field[1].name;
        const glDesc=field[2].name;
        const itemName=field[3].name;
        const itemDate=field[4].name;
        const itemType=field[5].name;
        const itemNumber=field[6].name;
        const itemDebit=field[7].name;
        const itemCredit=field[8].name;
        
        const glAccountAlreadyParsed=[];
        const result=[];
        
        function getBroughtForwardAmount(item) {
            return data.reduce((a,b)=>{
                if (item[itemName] && (b[itemName]===item[itemName]) && (new Date(b[itemDate])<new Date(new Date(url.date).getFullYear()+'-01-01'))) 
                    return a+b[itemDebit]-b[itemCredit]
                else if (!item[itemName] && b[glAccount]===item[glAccount] && 
                    (new Date(b[itemDate])<new Date(new Date(url.date).getFullYear()+'-01-01')))
                        return a+b[itemDebit]-b[itemCredit]
                else return a
            },0)
        }

        
        function populateItemName(targetItem) {
            let itemNameAlreadyParsed=[];
            return (
                data.map(item=>{
                    if (item[glAccount]===targetItem[glAccount] && itemNameAlreadyParsed.indexOf(item[itemName])===-1) {
                        itemNameAlreadyParsed.push(item[itemName]);
                        return (
                        <div key={item[itemName]}>
                            <div className='row my-1 py-1 rounded bg-secondary text-white' style={{cursor:'pointer'}} data-toggle='collapse' data-target={'#'+item[itemName].replace(/[ ._()]/g,'')}>
                                <p className='col-1'><i className='fa fa-plus-square mt-1 d-print-none' id={'plusminus'+item[itemName].replace(/[ ._()]/g,'')}></i></p>
                                <p className='h6 col-5 mb-0'>{item[itemName]}</p>
                                <p className='h6 col text-right mb-0'>{numberFormatParser(data.reduce(
                                    (a,b)=>{
                                        if(b[itemName]===item[itemName] && (new Date(b[itemDate])<=new Date(url.date))) {
                                            if (debitCreditOpposite) 
                                                return a+b[itemCredit]-b[itemDebit];
                                            else return a+b[itemDebit]-b[itemCredit];
                                        }

                                            
                                        else return a;
                                    },0)
                                )}
                                </p>
                            </div>
                            <div className='collapse navbar-collapse my-2 row pl-3 pl-md-5 pr-2' id={item[itemName].replace(/[ ._()]/g,'')}>
                                <div style={printFormat?
                                    {width:'100%'}:{width:'100%',overflowY:'auto',overflowX:'hidden',maxHeight:'60vh'}}>
                                <table id='table' className={printFormat?'table table-hover':'table table-hover table-responsive-md'}>
                                    <thead>
                                        <tr>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='date'+item[itemName].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[itemName]]=sortData(sortedData[item[itemName]],itemDate,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}
                                                >
                                                DATE
                                                <i id={'date'+item[itemName].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='type'+item[itemName].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[itemName]]=sortData(sortedData[item[itemName]],itemType,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}
                                                >
                                                ITEM TYPE
                                                <i id={'type'+item[itemName].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='number'+item[itemName].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[itemName]]=sortData(sortedData[item[itemName]],itemNumber,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}
                                                >
                                                ITEM NUMBER
                                                <i id={'number'+item[itemName].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='dr'+item[itemName].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[itemName]]=sortData(sortedData[item[itemName]],itemDebit,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}
                                            >
                                                DR
                                                <i id={'dr'+item[itemName].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='cr'+item[itemName].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[itemName]]=sortData(sortedData[item[itemName]],itemCredit,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}
                                            >
                                                CR
                                                <i id={'cr'+item[itemName].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getBroughtForwardAmount(item)>=0?
                                            (<tr>
                                                <td colSpan='3'>B/F</td>
                                                <td colSpan='2'>{numberFormatParser(getBroughtForwardAmount(item))}</td>
                                            </tr>):
                                            (<tr>
                                                <td colSpan='4'>B/F</td>
                                                <td colSpan='1'>{numberFormatParser(-getBroughtForwardAmount(item))}</td>
                                            </tr>)
                                            }
                                    {sortedData1[item[itemName]].map((item2,i)=>{
                                        if (item2[glAccount]===targetItem[glAccount] && item2[itemName]===item[itemName] 
                                            && (new Date(item2[itemDate])>=new Date(new Date(url.date).getFullYear()+'-01-01'))
                                            && (new Date(item2[itemDate])<=new Date(url.date))
                                            ) 
                                            return (
                                                <tr key={i} style={{cursor:'pointer'}} onClick={(e)=>
                                                    history.push('./'+createLink(item2[itemType].toLowerCase(),item2[itemNumber]))
                                                    }>
                                                    <td className='text-nowrap'>{dateFormatParser(item2[itemDate])}</td>
                                                    <td className='text-nowrap'>{item2[itemType]}</td>
                                                    <td className='text-nowrap'>{item2[itemNumber]}</td>
                                                    <td className='text-nowrap'>{numberFormatParser(item2[itemDebit])}</td>
                                                    <td className='text-nowrap'>{numberFormatParser(item2[itemCredit])}</td>
                                                </tr>
                                            )
                                        else return null; 
                                        })
                                    }
                                    </tbody>
                                </table>
                                </div>
                            </div>
                    </div>
                    )} else return null;
                })
            )
        }

        
        data.forEach(item=>{
            if (item[glCategory]===category && glAccountAlreadyParsed.indexOf(item[glAccount])===-1) {
                glAccountAlreadyParsed.push(item[glAccount]);
                result.push(
                    (<div key={item[glAccount]}>
                        <div className='row background' style={{cursor:'pointer'}} data-toggle='collapse' data-target={'#'+item[glDesc].replace(/[ ._()]/g,'')}>
                            <i className='fa fa-plus-square mt-1 col-1 d-print-none' id={'plusminus'+item[glDesc].replace(/[ ._()]/g,'')}></i>
                            <p className='col-2 mb-0'>{item[glAccount]}</p>
                            <p className='col-6 mb-0'>{item[glDesc]}</p>
                            <p className='col text-right mb-0'>{numberFormatParser(data.reduce(
                                (a,b)=>{
                                    if (b[glAccount]===item[glAccount] && (new Date(b[itemDate])<= new Date(url.date))) {
                                        if (debitCreditOpposite) 
                                            return a+b[itemCredit]-b[itemDebit];
                                        else return a+b[itemDebit]-b[itemCredit];
                                    }
                                    else return a
                                },0)
                            )}
                            </p>
                        </div>
                        <div className='collapse navbar-collapse my-2 pl-3 pl-md-5 pr-2' id={item[glDesc].replace(/[ ._()]/g,'')}>
                            {item[itemName]?populateItemName(item):(
                            <div style={printFormat?null:{overflowY:'auto',overflowX:'hidden',maxHeight:'60vh'}}>
                                <table id='table' className={printFormat?'table table-hover':'table table-hover table-responsive-md'}>
                                    <thead>
                                        <tr>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='date'+item[glDesc].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[glDesc]]=sortData(sortedData[item[glDesc]],itemDate,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}
                                            >
                                                DATE
                                                <i id={'date'+item[glDesc].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='type'+item[glDesc].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[glDesc]]=sortData(sortedData[item[glDesc]],itemType,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}>
                                                ITEM TYPE
                                                <i id={'type'+item[glDesc].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='number'+item[glDesc].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[glDesc]]=sortData(sortedData[item[glDesc]],itemNumber,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}>
                                                ITEM NUMBER
                                                <i id={'number'+item[glDesc].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='dr'+item[glDesc].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[glDesc]]=sortData(sortedData[item[glDesc]],itemDebit,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}>
                                                DR
                                                <i id={'dr'+item[glDesc].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='cr'+item[glDesc].replace(/[ ._\-()]/g,'')
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                                
                                                sortedData[item[glDesc]]=sortData(sortedData[item[glDesc]],itemCredit,e.target.getAttribute('data-order'))
                                                changeSortedData({...sortedData})
                            
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}>
                                                CR
                                                <i id={'cr'+item[glDesc].replace(/[ ._\-()]/g,'')} className='d-print-none fa fa-caret-down ml-2'></i>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getBroughtForwardAmount(item)>=0?
                                            (<tr>
                                                <td colSpan='3'>B/F</td>
                                                <td colSpan='2'>{numberFormatParser(getBroughtForwardAmount(item))}</td>
                                            </tr>):
                                            (<tr>
                                                <td colSpan='4'>B/F</td>
                                                <td colSpan='1'>{numberFormatParser(-getBroughtForwardAmount(item))}</td>
                                            </tr>)
                                        }
                                        {sortedData1[item[glDesc]].map((item2,i)=>{
                                            if (item2[glAccount]===item[glAccount]
                                                && (new Date(item2[itemDate])>=new Date(new Date(url.date).getFullYear()+'-01-01'))
                                                && (new Date(item2[itemDate])<=new Date(url.date))
                                                ) 
                                                return (
                                                    <tr key={i} style={{cursor:'pointer'}} onClick={(e)=>
                                                        history.push('./'+createLink(item2[itemType].toLowerCase(),item2[itemNumber]))
                                                        }>
                                                        <td className='text-nowrap'>{dateFormatParser(item2[itemDate])}</td>
                                                        <td className='text-nowrap'>{item2[itemType]}</td>
                                                        <td className='text-nowrap'>{item2[itemNumber]}</td>
                                                        <td className='text-nowrap'>{numberFormatParser(item2[itemDebit])}</td>
                                                        <td className='text-nowrap'>{numberFormatParser(item2[itemCredit])}</td>
                                                    </tr>
                                                )
                                            else return null; 
                                            })
                                        }
                                    </tbody>
                                </table>
                            </div>
                                )}
                        </div>
                    </div>
                    )
                )
            }
        })
            
        return result;
    }

    let errorDisplay=null;
    if ((dataSelectBalanceSheet && dataSelectBalanceSheet.error) || errorSelectBalanceSheet) 
    errorDisplay=(
        <div className="alert alert-warning">
            {dataSelectBalanceSheet && dataSelectBalanceSheet.error? 'Balance Sheet Data RETRIEVAL failed errno: '+dataSelectBalanceSheet.error.errno
            +' code: '+dataSelectBalanceSheet.error.code+' message: '+dataSelectBalanceSheet.error.sqlMessage:null}
            {errorSelectBalanceSheet? 'Balance Sheet Data RETRIEVAL failed '+errorSelectBalanceSheet : null}
        </div>)

    return (
        <AppLayout>
            <div className='container py-3 py-md-5 px-md-5 position-relative'>
                <h4 className='text-center'>{url.companyTitle}</h4>
                <h4 className='text-center mb-4'>{'Balance Sheet as at ' + dateFormatParser(url.date)}</h4>
                {errorDisplay}
                <div className='text-right d-print-none mb-4'>
                    <div className="form-check form-check-inline">
                        <input className="form-check-input" type="checkbox" id="printFormat" checked={printFormat}
                        onChange={(e)=>{
                            if (e.target.checked) 
                                changePrintFormat(true)
                            else changePrintFormat(false)
                        }}/>
                        <label className="form-check-label" htmlFor="printFormat"> Print Format</label>
                    </div>
                    <button className='btn btn-dark mr-1 mr-md-2' 
                    onClick={(e)=>collapsibleElementID.forEach(ID=>
                        $('#'+ID).collapse('show')
                    )}><i className='fa fa-plus-square'></i> Expand</button>
                    <button className='btn btn-light'  
                    onClick={(e)=>collapsibleElementID.forEach(ID=>
                        $('#'+ID).collapse('hide')
                    )}> <i className='fa fa-minus-square'></i> Collapse</button>
                </div>
                {netAssets}
                <div className='row my-3 rounded' style={{backgroundColor:'rgba(248,222,126,0.6)'}}>
                    <p className='col text-left my-2 h6'>NET ASSETS TOTAL</p>
                    <p className='col text-right my-2 h6'>{netAssetsTotal}</p>
                </div>
                
                {netEquity}
                <div className='row'>
                    <p className='col mb-0'>PROFIT AND LOSS</p>
                    <p className='col mb-0 text-right'>{currentProfitAndLoss}</p>
                </div>
                <div className='row'>
                    <p className='col mb-0'>RETAINED EARNINGS</p>
                    <p className='col mb-0 text-right'>{retainedEarnings}</p>
                </div>
                <div className='row my-3 rounded' style={{backgroundColor:'rgba(248,222,126,0.6)'}}>
                    <p className='col text-left my-2 h6'>NET EQUITY TOTAL</p>
                    <p className='col text-right my-2 h6'>{netEquityTotal}</p>
                </div>
            </div>
        </AppLayout>
    )
}

BalanceSheetItem.description='Balance Sheet';
BalanceSheetItem.path='/BalanceSheetItem';

export default BalanceSheetItem;