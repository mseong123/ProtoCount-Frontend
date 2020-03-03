import React,{useState,useEffect,useContext} from 'react';
import AppLayout from '../Shared/AppLayout';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import numberFormatParser from '../Shared/numberFormatParser';
import $ from 'jquery';
import {useHistory} from 'react-router-dom';

function ProfitAndLossItem (props) {

    const url={
        date:new URLSearchParams(props.location.search).get('date'),
        companyTitle:new URLSearchParams(props.location.search).get('companyTitle'),
    }
    const [{data:dataSelectProfitAndLoss,error:errorSelectProfitAndLoss}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'profit_and_loss'}),
            credentials:'include'
        }
    });
    
    const [grossProfit,changeGrossProfit]=useState(null);
    const [grossProfitTotal,changeGrossProfitTotal]=useState(0);
    const [expenses,changeExpenses]=useState(null);
    const [expensesTotal,changeExpensesTotal]=useState(0);
    const [netProfit,changeNetProfit]=useState(0);
    const [collapsibleElementID,changeCollapsibleElementID]=useState([])

    const {changeAuth} = useContext(authContext)
    const history=useHistory();

    useEffect(()=>{
         if (dataSelectProfitAndLoss && dataSelectProfitAndLoss.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!')
                changeAuth(false)
            }
                
        else if (dataSelectProfitAndLoss && dataSelectProfitAndLoss.data && dataSelectProfitAndLoss.field) {
            const category=dataSelectProfitAndLoss.data[0].map(category=>category[dataSelectProfitAndLoss.field[0][0].name])
            let ID=[];

            changeGrossProfit(populateCategory(category.slice(0,4),dataSelectProfitAndLoss.data[1],dataSelectProfitAndLoss.field[1]))
            changeGrossProfitTotal(numberFormatParser(calculateCategoryTotal(category.slice(0,4),dataSelectProfitAndLoss.data[1],dataSelectProfitAndLoss.field[1])));

            changeExpenses(populateCategory(category.slice(4),dataSelectProfitAndLoss.data[1],dataSelectProfitAndLoss.field[1]))
            changeExpensesTotal(numberFormatParser(calculateCategoryTotal(category.slice(4),dataSelectProfitAndLoss.data[1],dataSelectProfitAndLoss.field[1])));
            changeNetProfit(numberFormatParser(calculateCategoryTotal(category,dataSelectProfitAndLoss.data[1],dataSelectProfitAndLoss.field[1])));
            
            dataSelectProfitAndLoss.data[1].forEach(item=>{
                if(ID.indexOf(item[dataSelectProfitAndLoss.field[1][2].name].replace(/[ ._()]/g,''))===-1) 
                    ID.push(item[dataSelectProfitAndLoss.field[1][2].name].replace(/[ ._()]/g,''))
                
            })
            changeCollapsibleElementID(ID)
        }

    },[dataSelectProfitAndLoss,errorSelectProfitAndLoss])
    

    //attach bootstrap/jquery eventlisteners and callbacks
    useEffect(()=>{

        if (collapsibleElementID && grossProfit && expenses) {
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
        
    },[grossProfit,expenses])

    /*single category or array of categories*/
    function calculateCategoryTotal(category=[],data,field) {
        
        const glCategory=field[0].name;
        const itemDate=field[3].name; 
        const itemDebit=field[6].name;
        const itemCredit=field[7].name;
        
        return data.reduce((a,b)=>{        
            if (new Date(b[itemDate])<=new Date(url.date) 
            && (new Date(b[itemDate])>=new Date(new Date(url.date).getFullYear()+'-01-01')) 
            && category.indexOf(b[glCategory])!==-1) 
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

    function populateCategory(category=[],data,field) {
        return (
            category.map(category=>{
                let accounts=populateAccount(category,data,field);
                if (accounts.length>0)
                    return (
                    <section key={category}>
                        <h6><u>{category}</u></h6>
                            {accounts}
                        <p className='h6 text-right '><u>{'TOTAL : '+numberFormatParser(calculateCategoryTotal([category],data,field))}</u></p>
                    </section>)
                }
            )
        )
    }
    
    function populateAccount(category,data,field) {
        const glCategory=field[0].name;
        const glAccount=field[1].name;
        const glDesc=field[2].name;
        const itemDate=field[3].name;
        const itemType=field[4].name;
        const itemNumber=field[5].name;
        const itemDebit=field[6].name;
        const itemCredit=field[7].name;
        
        const glAccountAlreadyParsed=[];
        const result=[];
        
        data.forEach(item=>{
            if (item[glCategory]===category 
                && glAccountAlreadyParsed.indexOf(item[glAccount])===-1
                && (new Date(item[itemDate])>=new Date(new Date(url.date).getFullYear()+'-01-01'))
                && (new Date(item[itemDate])<=new Date(url.date))
                ) {
                glAccountAlreadyParsed.push(item[glAccount]);
                result.push(
                    (<div key={item[glAccount]}>
                        <div className='row' style={{cursor:'pointer'}} data-toggle='collapse' data-target={'#'+item[glDesc].replace(/[ ._]/g,'')}>
                            <i className='fa fa-plus-square mt-1 col-1' id={'plusminus'+item[glDesc].replace(/[ ._]/g,'')}></i>
                            <p className='col-2 mb-0'>{item[glAccount]}</p>
                            <p className='col-6 mb-0'>{item[glDesc]}</p>
                            <p className='col-3 text-right mb-0'>{numberFormatParser(data.reduce(
                                (a,b)=>{
                                    if (b[glAccount]===item[glAccount] 
                                        && (new Date(b[itemDate])<= new Date(url.date))
                                        && (new Date(b[itemDate])>=new Date(new Date(url.date).getFullYear()+'-01-01'))
                                    )
                                        return a+b[itemCredit]-b[itemDebit]
                                    else return a
                                },0)
                            )}
                            </p>
                        </div>
                        <div className='collapse navbar-collapse my-2 pl-3 pl-md-5 pr-2' id={item[glDesc].replace(/[ ._]/g,'')}>
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
                            </div>
                        </div>
                    )
                )
            }
        })
            
        return result;
    }


    let errorDisplay=null;
    if ((dataSelectProfitAndLoss && dataSelectProfitAndLoss.error) || errorSelectProfitAndLoss) 
    errorDisplay=(
        <div className="alert alert-warning">
            {dataSelectProfitAndLoss && dataSelectProfitAndLoss.error? 'Profit and Loss Data RETRIEVAL failed errno: '+dataSelectProfitAndLoss.error.errno
            +' code: '+dataSelectProfitAndLoss.error.code+' message: '+dataSelectProfitAndLoss.error.sqlMessage:null}
            {errorSelectProfitAndLoss? 'Profit and Loss Data RETRIEVAL failed '+errorSelectProfitAndLoss : null}
        </div>)

    return (
        <AppLayout>
            <div className='container py-3 py-md-5 px-md-5 position-relative'>
                
                <h4 className='text-center'>{url.companyTitle}</h4>
                <h4 className='text-center mb-4'>
                    {'Profit And Loss as at ' + url.date} 
                </h4>
                {errorDisplay}
                <div className='text-right'>
                    <button className='btn btn-dark mr-2'  
                        onClick={(e)=>collapsibleElementID.forEach(ID=>
                            $('#'+ID).collapse('show')
                        )}> <i className='fa fa-plus-square'></i> Expand</button>
                    <button className='btn btn-light'  
                    onClick={(e)=>collapsibleElementID.forEach(ID=>
                        $('#'+ID).collapse('hide')
                    )}> <i className='fa fa-minus-square'></i> Collapse</button>
                </div>
                {grossProfit}
                <div className='row my-3 rounded' style={{backgroundColor:'rgba(248,222,126,0.3)'}}>
                    <p className='col text-left my-2 h6'>GROSS PROFIT TOTAL</p>
                    <p className='col text-right my-2 h6'>{grossProfitTotal}</p>
                </div>
                
                {expenses}
                <div className='row my-3 rounded' style={{backgroundColor:'rgba(248,222,126,0.3)'}}>
                    <p className='col text-left my-2 h6'>EXPENSES TOTAL</p>
                    <p className='col text-right my-2 h6'>{expensesTotal}</p>
                </div>
                <div className='row my-3 rounded' style={{backgroundColor:'rgba(248,222,126,0.6)'}}>
                    <p className='col text-left my-2 h6'>NET PROFIT</p>
                    <p className='col text-right my-2 h6'>{netProfit}</p>
                </div>
                

            </div>
        </AppLayout>
    )
}

ProfitAndLossItem.description='Profit And Loss';
ProfitAndLossItem.path='/ProfitAndLossItem';

export default ProfitAndLossItem;