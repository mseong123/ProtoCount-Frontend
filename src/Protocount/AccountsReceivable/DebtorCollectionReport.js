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
import dateFormatParser from '../Shared/dateFormatParser';
import sortData from '../Shared/sort';
import setPageSize from '../Shared/setPageSize';
import DebtorCollectionOne from '../Shared/preview/DebtorCollectionOne';

function DebtorCollectionReport(props) {
    const [{data:dataSelectDebtor,error:errorSelectDebtor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'debtor'}),
            credentials:'include'
        }
    });
    const [{data:dataSelectDebtorCollection,error:errorSelectDebtorCollection},changeParamDebtorCollection]=useFetch(null);
    const [debtorList,changeDebtorList] = useState(null);
    const [debtorID,changeDebtorID] = useState([]);
    const [dateStart,changeDateStart] = useState(new Date().getFullYear()+'-01-01');
    const [dateEnd,changeDateEnd] = useState(getFormattedDate(new Date()));
    const [resultInput,changeResultInput]=useState(null);
    const [collapsibleElementID,changeCollapsibleElementID]=useState([])

    /*Preview states*/
    const [withReceiptDetails,changeWithReceiptDetails]=useState(false);
    const [sortCriteriaList,changeSortCriteriaList]=useState(null);
    const [detailSortCriteriaList,changeDetailSortCriteriaList]=useState(null);
    const [sortCriteria,changeSortCriteria]=useState('');
    const [detailSortCriteria,changeDetailSortCriteria]=useState('');
    const [generateReportWarning,changeGenerateReportWarning]=useState(false);

    const {path} = useRouteMatch();
    const {changeAuth} = useContext(authContext);
    const history=useHistory();

    const calculatedWidth=950;

    useEffect(()=>{
        
        if (dataSelectDebtor && dataSelectDebtor.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectDebtor && dataSelectDebtor.data && dataSelectDebtor.field) 
            changeDebtorList(dataSelectDebtor.data.map(data=>(
            <option key={data[dataSelectDebtor.field[0].name]} value={data[dataSelectDebtor.field[0].name]}>
                {data[dataSelectDebtor.field[0].name]+' '+(data[dataSelectDebtor.field[1].name]?data[dataSelectDebtor.field[1].name]:'')}
            </option>)
            )
        )
    },[dataSelectDebtor,errorSelectDebtor])
    
    useEffect(()=>{
        if (dataSelectDebtorCollection && dataSelectDebtorCollection.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectDebtorCollection && dataSelectDebtorCollection.data && dataSelectDebtorCollection.field) {
            const debtorAlreadyParsed=[];
            const receiptAlreadyParsed=[];
            const data=dataSelectDebtorCollection.data[0];
            const field=dataSelectDebtorCollection.field[0];
            const debtorNum=field[0].name;
            const name=field[1].name;
            const docNum=field[2].name;
            const docDate=field[3].name;
            const type=field[4].name;
            const method=field[5].name;
            const transactionID=field[6].name;
            const amount=field[7].name;
            
            changeResultInput(resultInput=>{})

            data.forEach(item=>{
                let newObject={}
               if(debtorAlreadyParsed.indexOf(item[debtorNum])===-1) {
                    debtorAlreadyParsed.push(item[debtorNum])
                    newObject[item[debtorNum]]=data.filter(item2=>item2[debtorNum]===item[debtorNum])
                    changeResultInput(resultInput=>(Object.assign({},resultInput,newObject)))
               }
            })

            changeResultInput(resultInput=>({...resultInput,
                data:dataSelectDebtorCollection.data,
                dataPreview:[...dataSelectDebtorCollection.data],
                field:dataSelectDebtorCollection.field,
                dateStart,
                dateEnd,
                debtorID
            }))

            changeSortCriteriaList(
                (<>
                    <option value={debtorNum}>Debtor No.</option>
                    <option value={name}>Name</option>
                </>)
            )
            changeDetailSortCriteriaList(
                (<>
                    <option value={docNum}>Doc No.</option>
                    <option value={docDate}>Doc Date</option>
                    <option value={type}>Type</option>
                    <option value={method}>Method</option>
                    <option value={transactionID}>Transaction ID</option>
                    <option value={amount}>Amount</option>
                </>)
            )
            data.forEach(item=>{
                if(receiptAlreadyParsed.indexOf(item[docNum])===-1) 
                 receiptAlreadyParsed.push(item[docNum])
             })

             changeCollapsibleElementID(debtorAlreadyParsed.map(item=>item.replace(/[ ._\-()]/g,''))
             .concat(receiptAlreadyParsed.map(item=>item.replace(/[ ._\-()]/g,''))))

        }
    },[dataSelectDebtorCollection,errorSelectDebtorCollection])

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

    function populateResult() {
        const data=resultInput['data'][0];
        const field=resultInput['field'][0];
        const debtorNum=field[0].name;
        const name=field[1].name;
        const docNum=field[2].name;
        const docDate=field[3].name;
        const type=field[4].name;
        const method=field[5].name;
        const transactionID=field[6].name;
        const amount=field[7].name;

        const receiptData=resultInput['data'][1];
        const receiptField=resultInput['field'][1];
        const receiptDocNum=receiptField[0].name;
        const receiptDataDocNum=receiptField[1].name;
        const receiptDataType=receiptField[2].name;
        const receiptDataDate=receiptField[3].name;
        const receiptDataCreditTerm=receiptField[4].name;
        const receiptDataAmount=receiptField[5].name;
        const receiptAmount=receiptField[6].name;

        function populateDebtor() {
            const debtorAlreadyParsed=[];
            const result=[];

            data.forEach(item=>{
                if(debtorAlreadyParsed.indexOf(item[debtorNum])===-1)  {
                    debtorAlreadyParsed.push(item[debtorNum]);
                    result.push(
                        <div key={item[debtorNum]}>
                            <div className='d-flex' style={{cursor:'pointer'}} data-toggle='collapse' data-target={'#'+item[debtorNum].replace(/[ ._\-()]/g,'')}>
                                <i className='fa fa-plus-square mt-1' style={{flex:'0 0 14px',paddingLeft:10,paddingRight:10}}
                                id={'plusminus'+item[debtorNum].replace(/[ ._\-()]/g,'')}></i>
                                <p className='mb-0' style={{flex:'0 0 120px',paddingLeft:10,paddingRight:10}}>{item[debtorNum]}</p>
                                <p className='mb-0 col' style={{paddingLeft:10,paddingRight:10}}>{item[name]}</p>
                                <p className='mb-0' style={{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                                    {numberFormatParser(data.reduce((a,b)=>{
                                        if (b[debtorNum]===item[debtorNum]) 
                                            return a+b[amount]
                                        else return a 
                                    },0)
                                    )}
                                    </p>
                            </div>
                            <div className='collapse navbar-collapse my-2 pl-3 pl-md-5' 
                            id={item[debtorNum].replace(/[ ._\-()]/g,'')}>
                                <div className='row flex-nowrap text-white bg-secondary pt-2 pb-1' 
                                    style={{marginLeft:0,marginRight:0,}}>
                                    <h6 style={{flex:'0 0 34px',paddingLeft:10,paddingRight:10}}></h6>
                                    <h6 style={{flex:'1 0 70px',paddingLeft:10,paddingRight:10}}></h6>
                                    <h6 style={{flex:'1 0 130px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                        data-order='asc' onClick={(e)=>{
                                        const id='receiptNo'+item[debtorNum].replace(/[ ._\-()]/g,'');

                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')

                                        let sortedData={}
                                        sortedData[item[debtorNum]]=sortData(resultInput[item[debtorNum]],docNum,e.target.getAttribute('data-order'))
                                        
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
                                    }>
                                        Receipt No.
                                        <i id={'receiptNo'+item[debtorNum].replace(/[ ._\-()]/g,'')} 
                                        className='fa fa-caret-down ml-2'></i>
                                    </h6>

                                    <h6 style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                        data-order='asc' onClick={(e)=>{
                                        const id='date'+item[debtorNum].replace(/[ ._\-()]/g,'');
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')

                                        let sortedData={}
                                        sortedData[item[debtorNum]]=sortData(resultInput[item[debtorNum]],docDate,e.target.getAttribute('data-order'))
                                        
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
                                    }>
                                        Date
                                        <i id={'date'+item[debtorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </h6>

                                    <h6 style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                        data-order='asc' onClick={(e)=>{
                                        const id='type'+item[debtorNum].replace(/[ ._\-()]/g,'');
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')

                                        let sortedData={}
                                        sortedData[item[debtorNum]]=sortData(resultInput[item[debtorNum]],type,e.target.getAttribute('data-order'))
                                        
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
                                    }>
                                        Type
                                        <i id={'type'+item[debtorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </h6>

                                    <h6 style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                        data-order='asc' onClick={(e)=>{
                                        const id='method'+item[debtorNum].replace(/[ ._\-()]/g,'');
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')

                                        let sortedData={}
                                        sortedData[item[debtorNum]]=sortData(resultInput[item[debtorNum]],method,e.target.getAttribute('data-order'))
                                        
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
                                    }>
                                        Method
                                        <i id={'method'+item[debtorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </h6>

                                    <h6 style={{flex:'1 0 150px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                        data-order='asc' onClick={(e)=>{
                                        const id='transactionID'+item[debtorNum].replace(/[ ._\-()]/g,'');
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')

                                        let sortedData={}
                                        sortedData[item[debtorNum]]=sortData(resultInput[item[debtorNum]],transactionID,e.target.getAttribute('data-order'))
                                        
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
                                    }>
                                        Transaction ID
                                        <i id={'transactionID'+item[debtorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </h6>

                                    <h6 style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                        data-order='asc' onClick={(e)=>{
                                        const id='amount'+item[debtorNum].replace(/[ ._\-()]/g,'');    
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')

                                        let sortedData={}
                                        sortedData[item[debtorNum]]=sortData(resultInput[item[debtorNum]],amount,e.target.getAttribute('data-order'))
                                        
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
                                    }>
                                        Amount
                                        <i id={'amount'+item[debtorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </h6>
                                </div>
                                {resultInput[item[debtorNum]].map(item2=>{
                                    return (
                                        <div key={item2[docNum]}>
                                            <div className='d-flex' style={{cursor:'pointer'}}
                                            data-toggle='collapse' data-target={'#'+item2[docNum].replace(/[ ._\-()]/g,'')}>
                                                <i className='fa fa-plus-square pt-2' 
                                                style={{flex:'0 0 14px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                                id={'plusminus'+item2[docNum].replace(/[ ._\-()]/g,'')}></i>
                                                <button className='btn btn-dark btn-sm my-1' style={{flex:'1 0 50px',marginLeft:10,marginRight:10}} 
                                                onClick={(e)=>history.push('./'+createLink(item2[type].toLowerCase(),item2[docNum]))
                                                }>VIEW</button>
                                                <p className='py-2 mb-0' style={{flex:'1 0 130px',paddingLeft:10,paddingRight:10}}>
                                                    {item2[docNum]}
                                                </p>
                                                <p className='py-2 mb-0' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>
                                                    {dateFormatParser(item2[docDate])}
                                                    </p>
                                                <p className='py-2 mb-0' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>
                                                    {item2[type]}
                                                </p>
                                                <p className='py-2 mb-0' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>
                                                    {item2[method]}
                                                </p>
                                                <p className='py-2 mb-0' style={{flex:'1 0 150px',paddingLeft:10,paddingRight:10}}>
                                                    {item2[transactionID]}
                                                </p>
                                                <p className='py-2 mb-0' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>
                                                    {item2[amount]}
                                                </p>
                                                
                                            </div>
                                            <div className='collapse navbar-collapse my-2 pl-3 pl-md-5' 
                                            id={item2[docNum].replace(/[ ._\-()]/g,'')}>
                                                <table className='table table-hover'>
                                                    <thead>
                                                        <tr>
                                                            <th className='text-nowrap'>Doc No.</th>
                                                            <th className='text-nowrap'>Type</th>
                                                            <th className='text-nowrap'>Doc Date</th>
                                                            <th className='text-nowrap'>Due Date</th>
                                                            <th className='text-nowrap'>Credit Term</th>
                                                            <th className='text-nowrap'>Doc Amount</th>
                                                            <th className='text-nowrap'>Receipt Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {receiptData.map(item3=>{
                                                            if(item3[receiptDocNum]===item2[docNum]) 
                                                            return (
                                                                <tr key={item3[receiptDataDocNum]} style={{cursor:'pointer'}} onClick={(e)=>
                                                                    history.push('./'+createLink(item3[receiptDataType].toLowerCase(),item3[receiptDataDocNum]))
                                                                }>
                                                                    <td className='text-nowrap'>{item3[receiptDataDocNum]}</td>
                                                                    <td className='text-nowrap'>{item3[receiptDataType]}</td>
                                                                    <td className='text-nowrap'>{dateFormatParser(item3[receiptDataDate])}</td>
                                                                    <td className='text-nowrap'>{
                                                                     item3[receiptDataCreditTerm] && item3[receiptDataCreditTerm]!=='COD'? 
                                                                     dateFormatParser(getFormattedDate(
                                                                             new Date(new Date(item3[receiptDataDate])
                                                                             .setDate(new Date(item3[receiptDataDate]).getDate()
                                                                             +Number(item3[receiptDataCreditTerm]))))
                                                                         ):dateFormatParser(item3[receiptDataDate])
                                                                    }</td>
                                                                    <td className='text-nowrap'>{
                                                                    item3[receiptDataCreditTerm]==='COD'?'C.O.D.':item3[receiptDataCreditTerm]+' days'}
                                                                    </td>
                                                                    <td className='text-nowrap'>{numberFormatParser(item3[receiptDataAmount])}</td>
                                                                    <td className='text-nowrap'>{numberFormatParser(item3[receiptAmount])}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        
                                    )
                                })}
                            </div>
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
                            resultInput['data'][0]=sortData(resultInput['data'][0],debtorNum,e.target.getAttribute('data-order'))
                            changeResultInput({...resultInput})
                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('debtorNo').classList.remove('fa-caret-up');
                                    document.getElementById('debtorNo').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('debtorNo').classList.remove('fa-caret-down');
                                    document.getElementById('debtorNo').classList.add('fa-caret-up')
                                }
                            }
                                    
                            }>
                            Debtor No.
                            <i id='debtorNo' className='fa fa-caret-down ml-2'></i>
                        </h6>
                        <h6 className='col' style={{paddingLeft:10,paddingRight:10,cursor:'pointer'}}
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
                        <h6 style={{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>Receipt Amount</h6>
                    </div>
                    <div style={{overflowY:'auto',overflowX:'hidden',maxHeight:'60vh'}}>
                        {populateDebtor()}
                    </div>
                </div>
            </div>)
    }

    let errorDisplay=null;

    if ((dataSelectDebtor && dataSelectDebtor.error) || errorSelectDebtor || 
    (dataSelectDebtorCollection && dataSelectDebtorCollection.error) || errorSelectDebtorCollection )
    errorDisplay=(
        <div className="alert alert-warning">
            {dataSelectDebtor && dataSelectDebtor.error? 'Debtor List RETRIEVAL for item failed errno: '+dataSelectDebtor.error.errno
            +' code: '+dataSelectDebtor.error.code+' message: '+dataSelectDebtor.error.sqlMessage:null}
            {errorSelectDebtor? 'Debtor List RETRIEVAL for item failed '+errorSelectDebtor : null}
            <br/>
            <br/>
            {dataSelectDebtorCollection && dataSelectDebtorCollection.error? 'Debtor Collection RETRIEVAL for item failed errno: '+dataSelectDebtorCollection.error.errno
            +' code: '+dataSelectDebtorCollection.error.code+' message: '+dataSelectDebtorCollection.error.sqlMessage:null}
            {errorSelectDebtorCollection? 'Debtor Collection RETRIEVAL for item failed '+errorSelectDebtorCollection : null}

        </div>
    )

    return (
        <Switch>
            <Route exact path={`${path}/Preview`}>
                {resultInput? 
                (<DebtorCollectionOne
                    backPath={DebtorCollectionReport.path}
                    description={DebtorCollectionReport.description}
                    resultInput={resultInput}
                    withReceiptDetails={withReceiptDetails}
                    data={sortData(resultInput['dataPreview'][0],sortCriteria,'asc')}
                    dataDetail={sortData(resultInput['dataPreview'][0],detailSortCriteria,'asc')}
                    field={resultInput['field'][0]}
                    receiptData={resultInput['dataPreview'][1]}
                    receiptField={resultInput['field'][1]}
                    getFormattedDate={getFormattedDate}
                   
                    
                />):<Redirect to={DebtorCollectionReport.path}/>}
            </Route>

            <Route exact path={path}>
                <AppLayout>
                    <div className='container pt-3' style={{paddingLeft:20,paddingRight:20}}>
                        <h3>{DebtorCollectionReport.description}</h3>
                        <form className='mt-3' onSubmit={e=>{
                        e.preventDefault();
                        changeGenerateReportWarning(false);
                        changeParamDebtorCollection({
                            url:'./ReportItem',
                            init:{
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({
                                    item:'debtor_collection',
                                    param:[dateStart,dateEnd,debtorID]
                                }),
                                credentials:'include'
                            }
                        })
                        
                        }}>
                            <div className='form-group form-row mx-0'>
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

                            <div className='form-group form-row mx-0'>
                                <label className='col-md-2 col-form-label' style={{paddingLeft:0}} htmlFor='debtorID'>Debtor ID</label>
                                <select className='form-control col-md-4' required size='3' value={debtorID} multiple={true} onChange={e=>{
                                    let result=[];
                                    Array.from(e.target.options).map(option=>{
                                        if (option.selected===true) 
                                            result.push(option.value) 
                                    })
                                    changeDebtorID(result);
                                }}>
                                    {debtorList}
                                </select>
                            </div>

                            <div className='form-group form-row mx-0'>
                                <div className='form-check offset-md-2'>
                                    <input type='checkbox' className=' form-check-input' id='allDebtorID' onChange={e=>{
                                        if (e.target.checked) 
                                            changeDebtorID(dataSelectDebtor.data.map(data=>
                                                data[dataSelectDebtor.field[0].name]
                                                ))
                                        else changeDebtorID([])
                                    }}/>
                                    <label htmlFor='allDebtorID' style={{paddingLeft:0}} className='form-check-label'>
                                        All Debtor ID
                                    </label>
                                </div>
                            </div>

                            <fieldset className='form-group pl-4 pb-3 border border-secondary rounded col-md-8'>
                                <legend className='col-form-label col-md-6 offset-md-3 col-8 offset-2 text-center'>
                                    <h6>Preview Options</h6>
                                </legend>
                                <div className='form-row'>
                                <div className='form-check col-md-12 form-group col-form-label' style={{paddingLeft:20}}>
                                    <input type='checkbox' className='form-check-input' id='withReceiptDetails' onChange={e=>{
                                        if (e.target.checked) 
                                            changeWithReceiptDetails(true)
                                        else changeWithReceiptDetails(false)
                                        }} checked={withReceiptDetails}/>
                                    <label htmlFor='withReceiptDetails' className='form-check-label'>With Receipt Details</label>
                                </div>

                                <div className='form-group form-row col-md-6'>
                                    <label className='col-md-4 col-form-label' style={{paddingLeft:0}} htmlFor='sort'>
                                        Sort
                                    </label>
                                    <select id='sort' className='form-control col-md-6' value={sortCriteria} onChange={e=>
                                        changeSortCriteria(e.target.value)
                                    }>
                                        <option value=''> -select an option- </option>
                                        {sortCriteriaList}
                                    </select>
                                </div>

                                <div className='form-group col-md-6 form-row'>
                                    <label className='col-md-4 col-form-label' style={{paddingLeft:0}} htmlFor='sort'>
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
                                    history.push('./DebtorCollectionReport/Preview')
                                }}
                            } 
                            className='btn btn-info mx-1 my-1'>Preview</button>
                            {generateReportWarning? 
                            (<div className="alert alert-warning">
                                Please generate report first!
                            </div>):null}
                        </form>
                        
                        <hr/>
                        {errorDisplay}

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
            <Redirect to={DebtorCollectionReport.path}/>
        </Switch>
    )
}
DebtorCollectionReport.description='Debtor Collection Report';
DebtorCollectionReport.path='/DebtorCollectionReport';

export default DebtorCollectionReport;
