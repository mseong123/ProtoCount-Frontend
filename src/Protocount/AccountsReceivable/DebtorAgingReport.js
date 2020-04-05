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
import DebtorCreditorAgingOne from '../Shared/preview/DebtorCreditorAgingOne';

function DebtorAgingReport(props) {
    const [{data:dataSelectDebtor,error:errorSelectDebtor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'debtor'}),
            credentials:'include'
        }
    });

    const [{data:dataSelectDebtorAging,error:errorSelectDebtorAging},changeParamDebtorAging]=useFetch(null);
    
    const [debtorList,changeDebtorList] = useState(null);

    const [currDate,changeCurrDate] = useState (getFormattedDate(new Date()))
    const [debtorID,changeDebtorID] = useState([]);
    const [agingMonths,changeAgingMonths]=useState(3);
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

    const calculatedWidth=resultInput && resultInput['agingMonths']? 714+resultInput['agingMonths']*90:'auto';
    
    
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
        if (dataSelectDebtorAging && dataSelectDebtorAging.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectDebtorAging && dataSelectDebtorAging.data && dataSelectDebtorAging.field) {
            const debtorAlreadyParsed=[];
            const data=dataSelectDebtorAging.data;
            const field=dataSelectDebtorAging.field;
            const debtorNum=field[0].name;
            const name=field[1].name;
            const docNum=field[2].name;
            const docDate=field[3].name;
            const type=field[4].name;
            /*The 3 useState functions below to create a separate data for each debtor to parse for sorting*/
            /*1) reset to a new object with nothing in it because step 2 will have some previous debtor data in it
            which will be combined with new data when refetched*/
            changeResultInput(resultInput=>{})

            /*2)for each debtor, assign a property name using the debtor num which will be used to parse the 
            relevant data for the relevant debtor (and hence can be sorted separately)*/
            data.forEach(item=>{
                let newObject={}
               if(debtorAlreadyParsed.indexOf(item[debtorNum])===-1) {
                    debtorAlreadyParsed.push(item[debtorNum])
                    newObject[item[debtorNum]]=data.filter(item2=>item2[debtorNum]===item[debtorNum])
                    changeResultInput(resultInput=>(Object.assign({},resultInput,newObject)))
               }
            })
            /*3) add remaining input data to resultInput for rendering*/
            changeResultInput(resultInput=>({...resultInput,data:dataSelectDebtorAging.data,
                dataPreview:[...dataSelectDebtorAging.data],field:dataSelectDebtorAging.field,
                currDate,agingMonths}))

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
                </>)
            )
                                            
                
        }
            
        
    },[dataSelectDebtorAging,errorSelectDebtorAging])
    
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

    function populateMonthsHeader(months) {
        let result=[];
        for(let i=1;i<+(months)+1;i++) {
            result.push(
                (<h6 key={i} style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>{i+' Month'}</h6>)
            )
        }
        return result;
    }

    function populateMonthsAmount(currDate,debtorID,months,type) {
        let result=[];
        const data=resultInput['data'];
        const field=resultInput['field'];
        const debtorNum=field[0].name;
        const docDate=field[3].name;
        const amount=field[5].name;
        const creditTerm=field[6].name;

        for(let i=1;i<+(months)+1;i++) {
            let monthAmount=data.reduce((a,b)=>{
                if(b[debtorNum]===debtorID) {
                    
                    let value=calculateAgingMonthsAmount(
                        currDate,
                        b[creditTerm] && b[creditTerm]!=='COD'? 
                            getFormattedDate(new Date(new Date(b[docDate])
                            .setDate(new Date(b[docDate]).getDate()+Number(b[creditTerm])))
                            ):b[docDate],
                        b[amount],
                        i
                        )
                        
                    if (value) {
                        return a+b[amount];
                    } else return a
                }
                else return a;
            },0)

            if (type!=='table') 
                result.push(
                   (<p className='mb-0' key={i} style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>
                       {monthAmount?numberFormatParser(monthAmount):''}
                   </p>)
                )
            else result.push(
                (<th className='align-top' key={i}>
                    {monthAmount?numberFormatParser(monthAmount):''}
                </th>)
            )
        }
        return result;
    }

    function populateTableMonthsHeader(months) {
        let result=[];
        for(let i=1;i<+(months)+1;i++) {
            result.push(
                (<th key={i} className='text-nowrap align-top'>{i+' Month'}</th>)
            )
        }
        return result;
    }

    function populateTableMonthsAmount(currDate,dueDate,amount,months) {
        let result=[];
        for(let i=1;i<+(months)+1;i++) {
            result.push(
                (<td className='text-nowrap align-top' key={i}>
                    {numberFormatParser(calculateAgingMonthsAmount(currDate,dueDate,amount,i))}
                    </td>)
            )
        }
        return result;
    }
    /*aging is calculated based on last day of the month of the due date*/
    function calculateAgingCurrentAmount(currDate,dueDate,amount) {
        /*currDate string from input type date is slightly diff from string date and produce diff result when both string are 
        called with Date() object. Hence perform the following to ensure date objects produced from both string are the same.
        Same with all the calculate methods below*/
       currDate=new Date(new Date(currDate).getFullYear(),new Date(currDate).getMonth(),new Date(currDate).getDate(),0)
        
        if (currDate<=new Date(new Date(dueDate).getFullYear(),(new Date(dueDate).getMonth())+1,0)) {
            return amount;
        }
        else return ''
    }

    function calculateAgingMonthsAmount(currDate,dueDate,amount,agingMonths) {
       currDate=new Date(new Date(currDate).getFullYear(),new Date(currDate).getMonth(),new Date(currDate).getDate(),0)
        
        if (currDate<=new Date(new Date(dueDate).getFullYear(),(new Date(dueDate).getMonth())+1+agingMonths,0)
        && currDate>new Date(new Date(dueDate).getFullYear(),(new Date(dueDate).getMonth())+agingMonths,0))
            return amount;

        else return ''
    }

    function calculateAgingRemainderAmount(currDate,dueDate,amount,months) {
       currDate=new Date(new Date(currDate).getFullYear(),new Date(currDate).getMonth(),new Date(currDate).getDate(),0)
 
        if (currDate>new Date(new Date(dueDate).getFullYear(),(new Date(dueDate).getMonth())+months+1,0))
            return amount;
        
        else return ''
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

    function populateDebtor(currDate,agingMonths) {
        const data=resultInput['data'];
        const field=resultInput['field'];
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
            if(debtorAlreadyParsed.indexOf(item[debtorNum])===-1)  {
                debtorAlreadyParsed.push(item[debtorNum]);
                result.push(
                (<div key={item[debtorNum]}>
                    <div className='d-flex' style={{width:calculatedWidth,cursor:'pointer'}} data-toggle='collapse' data-target={'#'+item[debtorNum].replace(/[ ._\-()]/g,'')}>
                        <i className='fa fa-plus-square mt-1' style={{flex:'1 0 14px',paddingLeft:10,paddingRight:10}}
                        id={'plusminus'+item[debtorNum].replace(/[ ._\-()]/g,'')}></i>
                        <p className='mb-0' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>{item[debtorNum]}</p>
                        <p className='mb-0' style={{flex:'1 0 200px',paddingLeft:10,paddingRight:10}}>{item[name]}</p>
                        <p className='mb-0' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>
                            {numberFormatParser(data.reduce((a,b)=>{
                            if(b[debtorNum]===item[debtorNum]) {
                                let value=calculateAgingCurrentAmount(
                                    currDate,
                                    b[creditTerm] && b[creditTerm]!=='COD'? 
                                        getFormattedDate(new Date(new Date(b[docDate])
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
                        }</p>
                        {populateMonthsAmount(
                            currDate,
                            item[debtorNum],
                            Number(agingMonths),
                        )}
                        <p className='mb-0' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>
                            {numberFormatParser(data.reduce((a,b)=>{
                            if(b[debtorNum]===item[debtorNum]  ) {
                                let value=calculateAgingRemainderAmount(
                                    currDate,
                                    b[creditTerm] && b[creditTerm]!=='COD'? 
                                        getFormattedDate(new Date(new Date(b[docDate])
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
                        },0))}</p>
                        <p className='mb-0' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>
                            {numberFormatParser(
                                data.reduce((a,b)=>{
                                if(b[debtorNum]===item[debtorNum])
                                    return a+b[amount]
                                else return a
                                },0)-
                                data.reduce((a,b)=>{
                                if(b[debtorNum]===item[debtorNum]) {
                                    let value=calculateAgingCurrentAmount(
                                        currDate,
                                        b[creditTerm] && b[creditTerm]!=='COD'? 
                                            getFormattedDate(new Date(new Date(b[docDate])
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
                            </p>
                        <p className='mb-0' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>
                            {numberFormatParser(
                                data.reduce((a,b)=>{
                                if(b[debtorNum]===item[debtorNum])
                                    return a+b[amount]
                                else return a
                                },0)
                            )}</p>
                    </div>
                    <div className='collapse navbar-collapse my-2 pl-3 pl-md-5 pr-2' style={{width:calculatedWidth}}
                    id={item[debtorNum].replace(/[ ._\-()]/g,'')}>
                        <table id='table' className='table-dark table table-hover'>
                            <thead>
                                <tr>
                                    <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                    onClick={(e)=>{
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                        let sortedData={}
                                        sortedData[item[debtorNum]]=sortData(resultInput[item[debtorNum]],docNum,e.target.getAttribute('data-order'))
                                        changeResultInput(Object.assign({},resultInput,sortedData))
                    
                                        if (e.target.getAttribute('data-order')==='asc') {
                                            document.getElementById('docNo'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-up');
                                            document.getElementById('docNo'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-down')
                                        }
                                        else {
                                            document.getElementById('docNo'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-down');
                                            document.getElementById('docNo'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-up')
                                        }
                                        }}>
                                        Doc No.
                                        <i id={'docNo'+item[debtorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </th>
                                    <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                    onClick={(e)=>{
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                        let sortedData={}
                                        sortedData[item[debtorNum]]=sortData(resultInput[item[debtorNum]],docDate,e.target.getAttribute('data-order'))
                                        changeResultInput(Object.assign({},resultInput,sortedData))
                    
                                        if (e.target.getAttribute('data-order')==='asc') {
                                            document.getElementById('docDate'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-up');
                                            document.getElementById('docDate'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-down')
                                        }
                                        else {
                                            document.getElementById('docDate'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-down');
                                            document.getElementById('docDate'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-up')
                                        }
                                        }}>
                                        Doc Date
                                        <i id={'docDate'+item[debtorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </th>
                                    <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                    onClick={(e)=>{
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                        let sortedData={}
                                        sortedData[item[debtorNum]]=sortData(resultInput[item[debtorNum]],type,e.target.getAttribute('data-order'))
                                        changeResultInput(Object.assign({},resultInput,sortedData))
                    
                                        if (e.target.getAttribute('data-order')==='asc') {
                                            document.getElementById('type'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-up');
                                            document.getElementById('type'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-down')
                                        }
                                        else {
                                            document.getElementById('type'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-down');
                                            document.getElementById('type'+item[debtorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-up')
                                        }
                                        }}
                                    >
                                        Type
                                        <i id={'type'+item[debtorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </th>
                                    <th className='text-nowrap'>Due Date</th>
                                    <th className='text-nowrap'>Current</th>
                                    {populateTableMonthsHeader(agingMonths)}
                                    <th className='text-nowrap'>{'> '+agingMonths + ' Month'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultInput[item[debtorNum]].map(item2=>{
                                        return (
                                            <tr key={item2[docNum]} style={{cursor:'pointer'}} onClick={(e)=>
                                                history.push('./'+createLink(item2[type].toLowerCase(),item2[docNum]))
                                                }>
                                                <td className='text-nowrap'>{item2[docNum]}</td>
                                                <td className='text-nowrap'>{dateFormatParser(item2[docDate])}</td>
                                                <td className='text-nowrap'>{item2[type]}</td>
                                                <td className='text-nowrap'>{
                                                item2[creditTerm] && item2[creditTerm]!=='COD'? 
                                                dateFormatParser(getFormattedDate(
                                                        new Date(new Date(item2[docDate])
                                                        .setDate(new Date(item2[docDate]).getDate()+Number(item2[creditTerm]))))
                                                    ):dateFormatParser(item2[docDate])
                                                    }</td>
                                                <td className='text-nowrap'>{
                                                    numberFormatParser(calculateAgingCurrentAmount(
                                                        currDate,
                                                        item2[creditTerm] && item2[creditTerm]!=='COD'? 
                                                            getFormattedDate(new Date(new Date(item2[docDate])
                                                            .setDate(new Date(item2[docDate]).getDate()+Number(item2[creditTerm])))
                                                            ):item2[docDate],
                                                        item2[amount]
                                                        ))

                                        
                                                }</td>
                                                {populateTableMonthsAmount(
                                                    currDate,
                                                    item2[creditTerm] && item2[creditTerm]!=='COD'? 
                                                        getFormattedDate(new Date(new Date(item2[docDate])
                                                        .setDate(new Date(item2[docDate]).getDate()+Number(item2[creditTerm])))
                                                        ):item2[docDate],
                                                    item2[amount],
                                                    Number(agingMonths)
                                                )}
                                                <td className='text-nowrap'>{
                                                numberFormatParser(calculateAgingRemainderAmount(
                                                    currDate,
                                                    item2[creditTerm] && item2[creditTerm]!=='COD'? 
                                                        getFormattedDate(new Date(new Date(item2[docDate])
                                                        .setDate(new Date(item2[docDate]).getDate()+Number(item2[creditTerm])))
                                                        ):item2[docDate],
                                                    item2[amount],
                                                    Number(agingMonths)
                                                ))
                                                }</td>

                                            </tr>
                                        )
                                    
                                    })
                                }
                                </tbody>
                        </table>
                    </div>
                    

                </div>)
                )
            } 

        })
        
        return result;

    }

    

    let errorDisplay=null;

    if ((dataSelectDebtor && dataSelectDebtor.error) || errorSelectDebtor || (dataSelectDebtorAging && dataSelectDebtorAging.error) 
    || errorSelectDebtorAging )
    errorDisplay=(
        <div className="alert alert-warning">
            {dataSelectDebtor && dataSelectDebtor.error? 'Debtor List RETRIEVAL for item failed errno: '+dataSelectDebtor.error.errno
            +' code: '+dataSelectDebtor.error.code+' message: '+dataSelectDebtor.error.sqlMessage:null}
            {errorSelectDebtor? 'Debtor List RETRIEVAL for item failed '+errorSelectDebtor : null}
            <br/>
            <br/>
            {dataSelectDebtorAging && dataSelectDebtorAging.error? 'Debtor Aging RETRIEVAL for item failed errno: '+dataSelectDebtorAging.error.errno
            +' code: '+dataSelectDebtorAging.error.code+' message: '+dataSelectDebtorAging.error.sqlMessage:null}
            {errorSelectDebtorAging? 'Debtor Aging RETRIEVAL for item failed '+errorSelectDebtorAging : null}

        </div>
    )

    return (
    <Switch>
        <Route exact path={`${path}/Preview`}>
            {resultInput?
            (<DebtorCreditorAgingOne
                backPath={DebtorAgingReport.path}
                description={DebtorAgingReport.description}
                resultInput={resultInput}
                withDetails={withDetails}
                data={sortData(resultInput['dataPreview'],sortCriteria,'asc')}
                field={resultInput['field']}
                dataDetail={sortData(resultInput['dataPreview'],detailSortCriteria,'asc')}
                populateTableMonthsHeader={populateTableMonthsHeader}
                populateTableMonthsAmount={populateTableMonthsAmount}
                calculateAgingCurrentAmount={calculateAgingCurrentAmount}
                populateMonthsAmount={populateMonthsAmount}
                calculateAgingRemainderAmount={calculateAgingRemainderAmount}
                getFormattedDate={getFormattedDate}
            />):<Redirect to={DebtorAgingReport.path}/>}
        </Route>
        <Route exact path={path}>
            <AppLayout>
                <div className='container pt-3' style={{paddingLeft:20,paddingRight:20}}>
                    <h3>{DebtorAgingReport.description}</h3>
                    <form className='mt-3' onSubmit={e=>{
                        e.preventDefault();
                        changeGenerateReportWarning(false);
                        changeParamDebtorAging({
                            url:'./ReportItem',
                            init:{
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({
                                    item:'debtor_aging',
                                    param:[debtorID,currDate]
                                }),
                                credentials:'include'
                            }
                        })
                        
                        changeCollapsibleElementID(debtorID.map(id=>id.replace(/[ ._\-()]/g,'')))
                        }
                        }>
                            <div className='form-group form-row mx-0'>
                                <label className='col-md-2 col-form-label' style={{paddingLeft:0}} htmlFor='date'>Date</label>
                                <input type='date' id='date' required onChange={(e)=>changeCurrDate(e.target.value)} value={currDate} required 
                                className='form-control col-md-2 mb-3 mb-md-0'/>
                                <label className='offset-md-1 col-md-2 col-form-label' style={{paddingLeft:0}} htmlFor='agingMonths'>
                                    Aging Month(s)
                                </label>
                                <select id='agingMonths' className='form-control col-md-2' required value={agingMonths} onChange={e=>
                                    changeAgingMonths(e.target.value)
                                }>
                                    <option value='1'>1</option>
                                    <option value='2'>2</option>
                                    <option value='3'>3</option>
                                    <option value='4'>4</option>
                                    <option value='5'>5</option>
                                    <option value='6'>6</option>
                                </select>
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
                        
                            <fieldset className='form-group pb-3 border border-secondary rounded col-md-7'>
                                <legend className='col-form-label col-md-6 offset-md-3 col-8 offset-2 text-center'>
                                    <h6>Preview Options</h6>
                                </legend>
                                <div className='form-row'>
                                    <div className='form-group form-row col-md-12'>
                                        <label className='col-md-2 col-form-label' style={{paddingLeft:0}} htmlFor='sort'>
                                            Sort
                                        </label>
                                        <select id='sort' className='form-control col-md-5' value={sortCriteria} onChange={e=>
                                            changeSortCriteria(e.target.value)
                                        }>
                                            <option value=''> -select an option- </option>
                                            {sortCriteriaList}
                                        </select>
                                    </div>

                                    <div className='form-check col-md-4 form-group col-form-label' style={{paddingLeft:20}}>
                                        <input type='checkbox' className='form-check-input' id='witDetails' onChange={e=>{
                                            if (e.target.checked) 
                                                changeWithDetails(true)
                                            else changeWithDetails(false)
                                        }} checked={withDetails}/>
                                        <label htmlFor='witDetails' className='form-check-label'>With Details</label>
                                    </div>

                                    <div className='col-md-7 form-row form-group'>
                                        <label className='col-md-4 col-form-label' style={{paddingLeft:0}} htmlFor='sort'>
                                            Detail Sort
                                        </label>
                                        <select id='sort' className='form-control col-md-8' value={detailSortCriteria} onChange={e=>
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
                                history.push('./DebtorAgingReport/Preview')
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
                    (<div className="overflow-auto mb-5 pt-3" style={{transform:'rotateX(180deg)'}}>
                        <div style={{transform:'rotateX(180deg)'}}>
                            <h5 className='py-2'>Result</h5>
                            <div className='row flex-nowrap text-white bg-secondary pt-2 pb-1' 
                            style={{
                                marginLeft:0,
                                marginRight:0,
                                /*width to total all child widths since parent container width doesn't cover overflow due to nowrap*/
                                width:calculatedWidth
                                }}>
                                <h6 style={{flex:'1 0 34px',paddingLeft:10,paddingRight:10}}></h6>
                                <h6 style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                data-order='asc' onClick={(e)=>{
                                    e.target.setAttribute('data-order',
                                    e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                    changeResultInput({...resultInput,
                                        data:sortData(resultInput['data'],'DEBTOR_NUM',e.target.getAttribute('data-order'))})

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
                                <h6 style={{flex:'1 0 200px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                data-order='asc' onClick={(e)=>{
                                    e.target.setAttribute('data-order',
                                    e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                    changeResultInput({...resultInput,
                                        data:sortData(resultInput['data'],'NAME',e.target.getAttribute('data-order'))})

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
                                <h6 style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Current</h6>
                                {populateMonthsHeader(resultInput['agingMonths'])}
                                <h6 style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>
                                    {'> '+resultInput['agingMonths']+' Month'}
                                    </h6>
                                <h6 style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Total Overdue</h6>
                                <h6 style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>Balance</h6>
                            
                            </div>
                            {populateDebtor(resultInput['currDate'],resultInput['agingMonths'])}

                        </div>
                    </div>):null}
                    <hr className='pb-3'/>
                </div>
            </AppLayout>
        </Route>
        <Redirect to={DebtorAgingReport.path}/>
    </Switch>
    )
}
DebtorAgingReport.description='Debtor Aging Report';
DebtorAgingReport.path='/DebtorAgingReport';

export default DebtorAgingReport;
