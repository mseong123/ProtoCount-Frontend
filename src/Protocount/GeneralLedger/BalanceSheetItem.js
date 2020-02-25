import React,{useState,useEffect,useContext} from 'react';
import AppLayout from '../Shared/AppLayout';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import numberFormatParser from '../Shared/numberFormatParser'
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
    
    const [netAssets,changeNetAssets]=useState(null);
    const [netAssetsTotal,changeNetAssetsTotal]=useState(0);
    const [netEquity,changeNetEquity]=useState(null);
    const [netEquityTotal,changeNetEquityTotal]=useState(0);
    const [currentProfitAndLoss,changeCurrentProfitAndLoss]=useState(0);
    const [retainedEarnings,changeRetainedEarnings]=useState(0);
    const [collapsibleElementID,changeCollapsibleElementID]=useState([])

    const {changeAuth} = useContext(authContext)
    const history=useHistory();

    useEffect(()=>{
         if (dataSelectBalanceSheet && dataSelectBalanceSheet.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!')
                changeAuth(false)
            }
                
        else if (dataSelectBalanceSheet && dataSelectBalanceSheet.data && dataSelectBalanceSheet.field) {
            const category=dataSelectBalanceSheet.data[0].map(category=>category[dataSelectBalanceSheet.field[0][0].name])
            const currentProfitAndLoss=calculateCurrentProfitAndLoss(dataSelectBalanceSheet.data[2],dataSelectBalanceSheet.field[2]);
            const retainedEarnings=calculateRetainedEarnings(dataSelectBalanceSheet.data[2],dataSelectBalanceSheet.field[2]);
            let ID=[]

            changeNetAssets(populateCategory(category.slice(0,6),dataSelectBalanceSheet.data[1],dataSelectBalanceSheet.field[1],false))
            changeNetAssetsTotal(numberFormatParser(calculateCategoryTotal(category.slice(0,6),dataSelectBalanceSheet.data[1],dataSelectBalanceSheet.field[1],false)));

            changeNetEquity(populateCategory(category.slice(6),dataSelectBalanceSheet.data[1],dataSelectBalanceSheet.field[1],true))

            changeCurrentProfitAndLoss(numberFormatParser(currentProfitAndLoss))
            changeRetainedEarnings(numberFormatParser(retainedEarnings))

            changeNetEquityTotal(numberFormatParser(calculateCategoryTotal(category.slice(6),dataSelectBalanceSheet.data[1],dataSelectBalanceSheet.field[1],true)
            +currentProfitAndLoss+retainedEarnings));

            dataSelectBalanceSheet.data[1].forEach(item=>{
                if(ID.indexOf(item[dataSelectBalanceSheet.field[1][2].name].replace(/[ ._()]/g,''))===-1) 
                    ID.push(item[dataSelectBalanceSheet.field[1][2].name].replace(/[ ._()]/g,''))
                else if (item[dataSelectBalanceSheet.field[1][3].name] && ID.indexOf(item[dataSelectBalanceSheet.field[1][3].name].replace(/[ ._()]/g,''))===-1)
                    ID.push(item[dataSelectBalanceSheet.field[1][3].name].replace(/[ ._()]/g,''))
                
            })
            changeCollapsibleElementID(ID)
        }
    },[dataSelectBalanceSheet,errorSelectBalanceSheet])
    
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
            if (new Date(b[itemDate])<=new Date(new Date(url.date).getFullYear()+'-01-01')) 
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

    function populateCategory(category=[],data,field,debitCreditOpposite) {
        return (
            category.map(category=>{
                let accounts=populateAccount(category,data,field,debitCreditOpposite);
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
    
    function populateAccount(category,data,field,debitCreditOpposite) {
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
                                <p className='col-1'><i className='fa fa-plus-square mt-1 ' id={'plusminus'+item[itemName].replace(/[ ._]/g,'')}></i></p>
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
                                <table id='table' className='table table-hover table-responsive-md'>
                                    <thead>
                                        <tr>
                                            <th className='text-nowrap'>DATE</th>
                                            <th className='text-nowrap'>ITEM TYPE</th>
                                            <th className='text-nowrap'>ITEM NUMBER</th>
                                            <th className='text-nowrap'>DR</th>
                                            <th className='text-nowrap'>CR</th>
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
                                    {data.map((item2,i)=>{
                                        if (item2[glAccount]===targetItem[glAccount] && item2[itemName]===item[itemName] 
                                            && (new Date(item2[itemDate])>=new Date(new Date(url.date).getFullYear()+'-01-01'))
                                            && (new Date(item2[itemDate])<=new Date(url.date))
                                            ) 
                                            return (
                                                <tr key={i} style={{cursor:'pointer'}} onClick={(e)=>
                                                    history.push('./'+createLink(item2[itemType].toLowerCase(),item2[itemNumber]))
                                                    }>
                                                    <td className='text-nowrap'>{item2[itemDate]}</td>
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
                    )} else return null;
                })
            )
        }

        
        data.forEach(item=>{
            if (item[glCategory]===category && glAccountAlreadyParsed.indexOf(item[glAccount])===-1) {
                glAccountAlreadyParsed.push(item[glAccount]);
                result.push(
                    (<div key={item[glAccount]}>
                        <div className='row background' style={{cursor:'pointer'}} data-toggle='collapse' data-target={'#'+item[glDesc].replace(/[ ._]/g,'')}>
                            <i className='fa fa-plus-square mt-1 col-1' id={'plusminus'+item[glDesc].replace(/[ ._]/g,'')}></i>
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
                        <div className='collapse navbar-collapse my-2 pl-3 pl-md-5 pr-2' id={item[glDesc].replace(/[ ._]/g,'')}>
                            {item[itemName]? populateItemName(item):(
                                <table id='table' className='table table-hover table-responsive-md'>
                                    <thead>
                                        <tr>
                                            <th className='text-nowrap'>DATE</th>
                                            <th className='text-nowrap'>ITEM TYPE</th>
                                            <th className='text-nowrap'>ITEM NUMBER</th>
                                            <th className='text-nowrap'>DR</th>
                                            <th className='text-nowrap'>CR</th>
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
                                        {data.map((item2,i)=>{
                                            if (item2[glAccount]===item[glAccount]
                                                && (new Date(item2[itemDate])>=new Date(new Date(url.date).getFullYear()+'-01-01'))
                                                && (new Date(item2[itemDate])<=new Date(url.date))
                                                ) 
                                                return (
                                                    <tr key={i} style={{cursor:'pointer'}} onClick={(e)=>
                                                        history.push('./'+createLink(item2[itemType].toLowerCase(),item2[itemNumber]))
                                                        }>
                                                        <td className='text-nowrap'>{item2[itemDate]}</td>
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
                                )}
                            </div>
                        </div>
                    )
                )
            }
        })
            
        return result;
    }


    /*
    
                    */
    return (
        <AppLayout>
            <div className='container py-3 py-md-5 px-md-5 position-relative'>
                <h4 className='text-center'>{url.companyTitle}</h4>
                <h4 className='text-center mb-4'>{'Balance Sheet as at ' + url.date}</h4>
                <div className='text-right position-sticky' style={{top:'10px',zIndex:'1000'}}>
                    <button className='btn btn-info' style={{width:'2.5rem',height:'2.5rem'}} 
                    onClick={(e)=>collapsibleElementID.forEach(ID=>
                        $('#'+ID).collapse('hide')
                    )}>-</button>
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