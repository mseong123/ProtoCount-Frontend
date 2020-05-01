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

function CreditorAgingReport(props) {
    const [{data:dataSelectCreditor,error:errorSelectCreditor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'creditor'}),
            credentials:'include'
        }
    });

    const [{data:dataSelectCreditorAging,error:errorSelectCreditorAging},changeParamCreditorAging]=useFetch(null);
    
    const [creditorList,changeCreditorList] = useState(null);

    const [currDate,changeCurrDate] = useState (getFormattedDate(new Date()))
    const [creditorID,changeCreditorID] = useState([]);
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
        
        if (dataSelectCreditor && dataSelectCreditor.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectCreditor && dataSelectCreditor.data && dataSelectCreditor.field) 
            changeCreditorList(dataSelectCreditor.data.map(data=>(
            <option key={data[dataSelectCreditor.field[0].name]} value={data[dataSelectCreditor.field[0].name]}>
                {data[dataSelectCreditor.field[0].name]+' '+(data[dataSelectCreditor.field[1].name]?data[dataSelectCreditor.field[1].name]:'')}
            </option>)
            )
        )
    },[dataSelectCreditor,errorSelectCreditor])

    useEffect(()=>{
        if (dataSelectCreditorAging && dataSelectCreditorAging.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectCreditorAging && dataSelectCreditorAging.data && dataSelectCreditorAging.field) {
            const creditorAlreadyParsed=[];
            const data=dataSelectCreditorAging.data;
            const field=dataSelectCreditorAging.field;
            const creditorNum=field[0].name;
            const name=field[1].name;
            const docNum=field[2].name;
            const docDate=field[3].name;
            const type=field[4].name;
            /*The 3 useState functions below to create a separate data for each creditor to parse for sorting*/
            /*1) reset to a new object with nothing in it because step 2 will have some previous creditor data in it
            which will be combined with new data when refetched*/
            changeResultInput(resultInput=>{})

            /*2)for each creditor, assign a property name using the creditor num which will be used to parse the 
            relevant data for the relevant creditor (and hence can be sorted separately)*/
            data.forEach(item=>{
                let newObject={}
               if(creditorAlreadyParsed.indexOf(item[creditorNum])===-1) {
                    creditorAlreadyParsed.push(item[creditorNum])
                    newObject[item[creditorNum]]=data.filter(item2=>item2[creditorNum]===item[creditorNum])
                    changeResultInput(resultInput=>(Object.assign({},resultInput,newObject)))
               }
            })
            /*3) add remaining input data to resultInput for rendering*/
            changeResultInput(resultInput=>({...resultInput,
                data:dataSelectCreditorAging.data,
                dataPreview:[...dataSelectCreditorAging.data],
                field:dataSelectCreditorAging.field,
                currDate,
                agingMonths
            }))

            changeSortCriteriaList(
                (<>
                    <option value={creditorNum}>Creditor No.</option>
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
            changeCollapsibleElementID(creditorAlreadyParsed.map(item=>item.replace(/[ ._\-()]/g,'')))
        }
    },[dataSelectCreditorAging,errorSelectCreditorAging])
    
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

    function populateMonthsAmount(currDate,creditorID,months,type) {
        let result=[];
        const data=resultInput['data'];
        const field=resultInput['field'];
        const creditorNum=field[0].name;
        const docDate=field[3].name;
        const amount=field[5].name;
        const creditTerm=field[6].name;

        for(let i=1;i<+(months)+1;i++) {
            let monthAmount=data.reduce((a,b)=>{
                if(b[creditorNum]===creditorID) {
                    
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

    function populateCreditor(currDate,agingMonths) {
        const data=resultInput['data'];
        const field=resultInput['field'];
        const creditorNum=field[0].name;
        const name=field[1].name;
        const docNum=field[2].name;
        const docDate=field[3].name;
        const type=field[4].name;
        const amount=field[5].name;
        const creditTerm=field[6].name;

        const creditorAlreadyParsed=[];
        const result=[];

        data.forEach(item=>{
            if(creditorAlreadyParsed.indexOf(item[creditorNum])===-1)  {
                creditorAlreadyParsed.push(item[creditorNum]);
                result.push(
                (<div key={item[creditorNum]}>
                    <div className='d-flex' style={{cursor:'pointer'}} data-toggle='collapse' data-target={'#'+item[creditorNum].replace(/[ ._\-()]/g,'')}>
                        <i className='fa fa-plus-square mt-1' style={{flex:'1 0 14px',paddingLeft:10,paddingRight:10}}
                        id={'plusminus'+item[creditorNum].replace(/[ ._\-()]/g,'')}></i>
                        <p className='mb-0' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>{item[creditorNum]}</p>
                        <p className='mb-0' style={{flex:'1 0 200px',paddingLeft:10,paddingRight:10}}>{item[name]}</p>
                        <p className='mb-0' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>
                            {numberFormatParser(data.reduce((a,b)=>{
                            if(b[creditorNum]===item[creditorNum]) {
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
                            item[creditorNum],
                            Number(agingMonths),
                        )}
                        <p className='mb-0' style={{flex:'1 0 90px',paddingLeft:10,paddingRight:10}}>
                            {numberFormatParser(data.reduce((a,b)=>{
                            if(b[creditorNum]===item[creditorNum]  ) {
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
                                if(b[creditorNum]===item[creditorNum])
                                    return a+b[amount]
                                else return a
                                },0)-
                                data.reduce((a,b)=>{
                                if(b[creditorNum]===item[creditorNum]) {
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
                                if(b[creditorNum]===item[creditorNum])
                                    return a+b[amount]
                                else return a
                                },0)
                            )}</p>
                    </div>
                    <div className='collapse navbar-collapse my-2 pl-3 pl-md-5 pr-2' 
                    id={item[creditorNum].replace(/[ ._\-()]/g,'')}>
                        <table id='table' className='table-dark table table-hover table-responsive'>
                            <thead>
                                <tr>
                                    <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                    onClick={(e)=>{
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                        let sortedData={}
                                        sortedData[item[creditorNum]]=sortData(resultInput[item[creditorNum]],docNum,e.target.getAttribute('data-order'))
                                        changeResultInput(Object.assign({},resultInput,sortedData))
                    
                                        if (e.target.getAttribute('data-order')==='asc') {
                                            document.getElementById('docNo'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-up');
                                            document.getElementById('docNo'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-down')
                                        }
                                        else {
                                            document.getElementById('docNo'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-down');
                                            document.getElementById('docNo'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-up')
                                        }
                                        }}>
                                        Doc No.
                                        <i id={'docNo'+item[creditorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </th>
                                    <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                    onClick={(e)=>{
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                        let sortedData={}
                                        sortedData[item[creditorNum]]=sortData(resultInput[item[creditorNum]],docDate,e.target.getAttribute('data-order'))
                                        changeResultInput(Object.assign({},resultInput,sortedData))
                    
                                        if (e.target.getAttribute('data-order')==='asc') {
                                            document.getElementById('docDate'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-up');
                                            document.getElementById('docDate'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-down')
                                        }
                                        else {
                                            document.getElementById('docDate'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-down');
                                            document.getElementById('docDate'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-up')
                                        }
                                        }}>
                                        Doc Date
                                        <i id={'docDate'+item[creditorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </th>
                                    <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                    onClick={(e)=>{
                                        e.target.setAttribute('data-order',
                                        e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                        let sortedData={}
                                        sortedData[item[creditorNum]]=sortData(resultInput[item[creditorNum]],type,e.target.getAttribute('data-order'))
                                        changeResultInput(Object.assign({},resultInput,sortedData))
                    
                                        if (e.target.getAttribute('data-order')==='asc') {
                                            document.getElementById('type'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-up');
                                            document.getElementById('type'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-down')
                                        }
                                        else {
                                            document.getElementById('type'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.remove('fa-caret-down');
                                            document.getElementById('type'+item[creditorNum].replace(/[ ._\-()]/g,'')).classList.add('fa-caret-up')
                                        }
                                        }}
                                    >
                                        Type
                                        <i id={'type'+item[creditorNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                    </th>
                                    <th className='text-nowrap'>Due Date</th>
                                    <th className='text-nowrap'>Current</th>
                                    {populateTableMonthsHeader(agingMonths)}
                                    <th className='text-nowrap'>{'> '+agingMonths + ' Month'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultInput[item[creditorNum]].map(item2=>{
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

    if ((dataSelectCreditor && dataSelectCreditor.error) || errorSelectCreditor || (dataSelectCreditorAging && dataSelectCreditorAging.error) 
    || errorSelectCreditorAging )
    errorDisplay=(
        <div className="alert alert-warning">
            {dataSelectCreditor && dataSelectCreditor.error? 'Creditor List RETRIEVAL for item failed errno: '+dataSelectCreditor.error.errno
            +' code: '+dataSelectCreditor.error.code+' message: '+dataSelectCreditor.error.sqlMessage:null}
            {errorSelectCreditor? 'Creditor List RETRIEVAL for item failed '+errorSelectCreditor : null}
            <br/>
            <br/>
            {dataSelectCreditorAging && dataSelectCreditorAging.error? 'Creditor Aging RETRIEVAL for item failed errno: '+dataSelectCreditorAging.error.errno
            +' code: '+dataSelectCreditorAging.error.code+' message: '+dataSelectCreditorAging.error.sqlMessage:null}
            {errorSelectCreditorAging? 'Creditor Aging RETRIEVAL for item failed '+errorSelectCreditorAging : null}

        </div>
    )

    return (
    <Switch>
        <Route exact path={`${path}/Preview`}>
            {resultInput?
            (<DebtorCreditorAgingOne
                backPath={CreditorAgingReport.path}
                description={CreditorAgingReport.description}
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
            />):<Redirect to={CreditorAgingReport.path}/>}
        </Route>
        <Route exact path={path}>
            <AppLayout>
                <div className='container pt-3' style={{paddingLeft:20,paddingRight:20}}>
                    <h3>{CreditorAgingReport.description}</h3>
                    <form className='mt-3' onSubmit={e=>{
                        e.preventDefault();
                        changeGenerateReportWarning(false);
                        changeParamCreditorAging({
                            url:'./ReportItem',
                            init:{
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({
                                    item:'creditor_aging',
                                    param:[creditorID,currDate]
                                }),
                                credentials:'include'
                            }
                        })
                        
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
                                <label className='col-md-2 col-form-label' style={{paddingLeft:0}} htmlFor='creditorID'>Creditor ID</label>
                                <select className='form-control col-md-4' required size='3' value={creditorID} multiple={true} onChange={e=>{
                                    let result=[];
                                    Array.from(e.target.options).map(option=>{
                                        if (option.selected===true) 
                                            result.push(option.value) 
                                    })
                                    changeCreditorID(result);
                                }}>
                                    {creditorList}
                                </select>
                            </div>

                            <div className='form-group form-row mx-0'>
                                <div className='form-check offset-md-2'>
                                    <input type='checkbox' className=' form-check-input' id='allcreditorID' onChange={e=>{
                                        if (e.target.checked) 
                                            changeCreditorID(dataSelectCreditor.data.map(data=>
                                                data[dataSelectCreditor.field[0].name]
                                                ))
                                        else changeCreditorID([])
                                    }}/>
                                    <label htmlFor='allcreditorID' style={{paddingLeft:0}} className='form-check-label'>
                                        All Creditor ID
                                    </label>
                                </div>
                            </div>
                        
                            <fieldset className='form-group pl-4 pb-3 border border-secondary rounded col-md-7'>
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
                                        <input type='checkbox' className='form-check-input' id='withDetails' onChange={e=>{
                                            if (e.target.checked) 
                                                changeWithDetails(true)
                                            else changeWithDetails(false)
                                        }} checked={withDetails}/>
                                        <label htmlFor='withDetails' className='form-check-label'>With Details</label>
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
                                history.push('./CreditorAgingReport/Preview')
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
                        <div style={{width:calculatedWidth,transform:'rotateX(180deg)'}}>
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
                            <div className='row flex-nowrap text-white bg-secondary pt-2 pb-1' 
                            style={{
                                marginLeft:0,
                                marginRight:0,
                                /*width to total all child widths since parent container width doesn't cover overflow due to nowrap*/
                                
                                }}>
                                <h6 style={{flex:'1 0 34px',paddingLeft:10,paddingRight:10}}></h6>
                                <h6 style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                                data-order='asc' onClick={(e)=>{
                                    e.target.setAttribute('data-order',
                                    e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                    changeResultInput({...resultInput,
                                        data:sortData(resultInput['data'],'CREDITOR_NUM',e.target.getAttribute('data-order'))})

                                    if (e.target.getAttribute('data-order')==='asc') {
                                        document.getElementById('creditorNo').classList.remove('fa-caret-up');
                                        document.getElementById('creditorNo').classList.add('fa-caret-down')
                                    }
                                    else {
                                        document.getElementById('creditorNo').classList.remove('fa-caret-down');
                                        document.getElementById('creditorNo').classList.add('fa-caret-up')
                                    }
                                }
                                    
                                }>
                                    Creditor No.
                                    <i id='creditorNo' className='fa fa-caret-down ml-2'></i>
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
                            <div style={{overflowY:'auto',overflowX:'hidden',maxHeight:'60vh'}}>
                                {populateCreditor(resultInput['currDate'],resultInput['agingMonths'])}
                            </div>
                        </div>
                    </div>):null}
                    <hr className='pb-3'/>
                </div>
            </AppLayout>
        </Route>
        <Redirect to={CreditorAgingReport.path}/>
    </Switch>
    )
}
CreditorAgingReport.description='Creditor Aging Report';
CreditorAgingReport.path='/CreditorAgingReport';

export default CreditorAgingReport;
