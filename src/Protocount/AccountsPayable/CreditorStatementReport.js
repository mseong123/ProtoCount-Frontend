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
import numberFormatParser from '../Shared/numberFormatParser';
import dateFormatParser from '../Shared/dateFormatParser';
import sortData from '../Shared/sort';
import DebtorCreditorStatementOne from '../Shared/preview/DebtorCreditorStatementOne';

function CreditorStatementReport(props) {
    const [{data:dataSelectCreditor,error:errorSelectCreditor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'creditor'}),
            credentials:'include'
        }
    });
    const [{data:dataSelectCreditorStatement,error:errorSelectCreditorStatement},changeParamCreditorStatement]=useFetch(null);
    
    const [creditorList,changeCreditorList] = useState(null);
    const [creditorID,changeCreditorID] = useState('');
    const [dateStart,changeDateStart] = useState(new Date().getFullYear()+'-01-01');
    const [dateEnd,changeDateEnd] = useState(getFormattedDate(new Date()));
    const [resultInput,changeResultInput]=useState(null);
    

    /*Preview states*/
    const agingMonthsMax=12 /*variable used for db fetching purpose. Change this if aging month option is changed*/
    const [agingMonths,changeAgingMonths]=useState(6);
    const [creditorOtherInfo,changeCreditorOtherInfo] =useState(null)
    const [sortCriteriaList,changeSortCriteriaList]=useState(null);
    const [sortCriteria,changeSortCriteria]=useState('');
    const [generateReportWarning,changeGenerateReportWarning]=useState(false);

    const {path} = useRouteMatch();
    const {changeAuth} = useContext(authContext);
    const history=useHistory();

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
        if (dataSelectCreditorStatement && dataSelectCreditorStatement.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectCreditorStatement && dataSelectCreditorStatement.data && dataSelectCreditorStatement.field) {
            const field=dataSelectCreditorStatement.field[1];
            const date=field[0].name;
            const docNum=field[1].name;
            const ref=field[2].name;
            const type=field[3].name;
            const dr=field[4].name;
            const cr=field[5].name;
            
            changeResultInput({data:dataSelectCreditorStatement.data,
                dataPreview:[...dataSelectCreditorStatement.data],field:dataSelectCreditorStatement.field,
            dateStart,dateEnd,creditorID})

            changeSortCriteriaList(
                (<>
                    <option value={date}>Date</option>
                    <option value={docNum}>Doc No.</option>
                    <option value={ref}>Ref.</option>
                    <option value={type}>Type</option>
                    <option value={dr}>Dr</option>
                    <option value={cr}>Cr</option>
                </>)
            )
        
        }

    },[dataSelectCreditorStatement,errorSelectCreditorStatement])

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

    function getDateStartForAging(dateStart,dateEnd) {
        /*this is to ensure sufficient earlier data is obtained for purpose of aging in preview. Date result is 
        earlier of either:
        1) existing dateStart in input or 
        2) 12 months (max aging option for preview) before date of dateEnd.*/
        if (new Date(dateStart)<new Date(new Date(dateEnd).getFullYear(),Number(new Date(dateEnd).getMonth())-agingMonthsMax,1))
            return dateStart

        else 
            return getFormattedDate(new Date(new Date(dateEnd).getFullYear(),Number(new Date(dateEnd).getMonth())-agingMonthsMax,1));
    }
    
    function populateCreditor(preview) {
        const dbBroughtForwardAmount=resultInput['data'][0][0][resultInput['field'][0][0].name];

        const data=preview?sortData(resultInput['dataPreview'][1],sortCriteria,'asc'):resultInput['data'][1];
        const field=resultInput['field'][1];
        const date=field[0].name;
        const docNum=field[1].name;
        const ref=field[2].name;
        const type=field[3].name;
        const dr=field[4].name;
        const cr=field[5].name;
        
        
        let balance=data.reduce((a,b)=>{
            if (new Date(b[date])<new Date(resultInput['dateStart'])) {
                if (b[dr]) return a+b[dr]
                else return a-b[cr]
            } else return a
        },0) + dbBroughtForwardAmount;

        return (
        <div>
            <table className='table table-responsive-md'>
                <thead>
                    <tr>
                        <th className='text-nowrap' style={preview? null:{cursor:'pointer'}}  data-order='asc'
                        onClick={(e)=>{
                            if(!preview) {
                                e.target.setAttribute('data-order',
                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                resultInput['data'][1]=sortData(resultInput['data'][1],date,e.target.getAttribute('data-order'))
                                changeResultInput({...resultInput})

                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('date').classList.remove('fa-caret-up');
                                    document.getElementById('date').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('date').classList.remove('fa-caret-down');
                                    document.getElementById('date').classList.add('fa-caret-up')
                                }
                            }
                        }
                        }
                        >
                            Date
                            {preview?null:<i id='date' className='fa fa-caret-down ml-2'></i>}
                        </th>
                        <th className='text-nowrap' style={preview?null:{cursor:'pointer'}} data-order='asc'
                        onClick={(e)=>{
                            if(!preview) {
                                e.target.setAttribute('data-order',
                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                resultInput['data'][1]=sortData(resultInput['data'][1],docNum,e.target.getAttribute('data-order'))
                                changeResultInput({...resultInput})

                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('docNo').classList.remove('fa-caret-up');
                                    document.getElementById('docNo').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('docNo').classList.remove('fa-caret-down');
                                    document.getElementById('docNo').classList.add('fa-caret-up')
                                }
                            }
                        }
                        }>
                            Doc No.
                            {preview?null:<i id='docNo' className='fa fa-caret-down ml-2'></i>}
                        </th>
                        <th className='text-nowrap' style={preview?null:{cursor:'pointer'}}  data-order='asc'
                        onClick={(e)=>{
                            if (!preview) {
                                e.target.setAttribute('data-order',
                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                resultInput['data'][1]=sortData(resultInput['data'][1],ref,e.target.getAttribute('data-order'))
                                changeResultInput({...resultInput})

                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('ref').classList.remove('fa-caret-up');
                                    document.getElementById('ref').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('ref').classList.remove('fa-caret-down');
                                    document.getElementById('ref').classList.add('fa-caret-up')
                                }
                            }
                        }
                        }>
                            Ref.
                            {preview?null:<i id='ref' className='fa fa-caret-down ml-2'></i>}
                        </th>
                        <th className='text-nowrap' style={preview?null:{cursor:'pointer'}}  data-order='asc'
                        onClick={(e)=>{
                            if (!preview) {
                                e.target.setAttribute('data-order',
                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                resultInput['data'][1]=sortData(resultInput['data'][1],type,e.target.getAttribute('data-order'))
                                changeResultInput({...resultInput})

                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('type').classList.remove('fa-caret-up');
                                    document.getElementById('type').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('type').classList.remove('fa-caret-down');
                                    document.getElementById('type').classList.add('fa-caret-up')
                                }
                            }
                        }
                        }
                        >
                            Type
                            {preview?null:<i id='type' className='fa fa-caret-down ml-2'></i>}
                        </th>
                        <th className='text-nowrap' style={preview?null:{cursor:'pointer'}}  data-order='asc'
                        onClick={(e)=>{
                            if (!preview) {
                                e.target.setAttribute('data-order',
                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                resultInput['data'][1]=sortData(resultInput['data'][1],dr,e.target.getAttribute('data-order'))
                                changeResultInput({...resultInput})

                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('dr').classList.remove('fa-caret-up');
                                    document.getElementById('dr').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('dr').classList.remove('fa-caret-down');
                                    document.getElementById('dr').classList.add('fa-caret-up')
                                }
                            }
                        }
                        }
                        >
                            Dr
                            {preview?null:<i id='dr' className='fa fa-caret-down ml-2'></i>}
                        </th>
                        <th className='text-nowrap' style={preview?null:{cursor:'pointer'}}  data-order='asc'
                        onClick={(e)=>{
                            if (!preview) {
                                e.target.setAttribute('data-order',
                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                                resultInput['data'][1]=sortData(resultInput['data'][1],cr,e.target.getAttribute('data-order'))
                                changeResultInput({...resultInput})

                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('cr').classList.remove('fa-caret-up');
                                    document.getElementById('cr').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('cr').classList.remove('fa-caret-down');
                                    document.getElementById('cr').classList.add('fa-caret-up')
                                }
                            }
                        }
                        }
                        >
                            Cr
                            {preview?null:<i id='cr' className='fa fa-caret-down ml-2'></i>}
                        </th>
                        <th className='text-nowrap'>Balance</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan='6'>B/F</td>
                        <td>{numberFormatParser(balance)}</td>
                    </tr>
                    {data.map((item,i)=>{
                        
                        if (new Date(item[date])>=new Date(resultInput['dateStart']) 
                        && new Date(item[date])<=new Date(resultInput['dateEnd'])) 
                            {
                                if (item[dr])
                                balance+=item[dr]
                                if (item[cr])
                                balance-=item[cr]
                            return (
                            <tr key={i} style={preview? null:{cursor:'pointer'}} onClick={(e)=> {
                                if(!preview)
                                    history.push('/'+createLink(item[type].toLowerCase(),item[docNum]))
                                else e.preventDefault();
                            }
                            }>
                                <td className='text-nowrap'>{dateFormatParser(item[date])}</td>
                                <td className='text-nowrap'>{item[docNum]}</td>
                                <td className='text-nowrap'>{item[ref]}</td>
                                <td className='text-nowrap'>{item[type]}</td>
                                <td className='text-nowrap'>{numberFormatParser(item[dr])}</td>
                                <td className='text-nowrap'>{numberFormatParser(item[cr])}</td>
                                <td className='text-nowrap'>{numberFormatParser(balance)}</td>
                            </tr>
                            )
                        }}
                    )}
                    
                </tbody>
                
            </table>
            
            {preview? (
                <p className='h5 text-right jumbotron py-2'>
                    <span>Account Balance: </span>
                    <span>{numberFormatParser(balance)}</span>
                </p>):null}
        </div>
        )
        
    }

    let errorDisplay=null;

    if ((dataSelectCreditor && dataSelectCreditor.error) || errorSelectCreditor || (dataSelectCreditorStatement && dataSelectCreditorStatement.error) 
    || errorSelectCreditorStatement )
    errorDisplay=(
        <div className="alert alert-warning">
            {dataSelectCreditor && dataSelectCreditor.error? 'Creditor List RETRIEVAL for item failed errno: '+dataSelectCreditor.error.errno
            +' code: '+dataSelectCreditor.error.code+' message: '+dataSelectCreditor.error.sqlMessage:null}
            {errorSelectCreditor? 'Creditor List RETRIEVAL for item failed '+errorSelectCreditor : null}
            <br/>
            <br/>
            {dataSelectCreditorStatement && dataSelectCreditorStatement.error? 'Creditor Statement RETRIEVAL for item failed errno: '+dataSelectCreditorStatement.error.errno
            +' code: '+dataSelectCreditorStatement.error.code+' message: '+dataSelectCreditorStatement.error.sqlMessage:null}
            {errorSelectCreditorStatement? 'Creditor Statement RETRIEVAL for item failed '+errorSelectCreditorStatement : null}

        </div>
    )
    
    return (
        <Switch>
            <Route exact path={`${path}/Preview`}>
                {resultInput? 
                (<DebtorCreditorStatementOne
                    backPath={CreditorStatementReport.path}
                    description='Creditor Statement'
                    topLeftInput={[...creditorOtherInfo.slice(0,2)]}
                    topRightField={['Statement Date','Credit Term']}
                    topRightInput={
                        [dateFormatParser(resultInput['dateStart'])+' to '+ dateFormatParser(resultInput['dateEnd']),
                        creditorOtherInfo[2]==='COD'?'C.O.D.':creditorOtherInfo[2]+' days']}
                    populateDebtorCreditor={populateCreditor}
                    data={resultInput['dataPreview'][1]}
                    field={resultInput['field'][1]}
                    dateEnd={resultInput['dateEnd']}
                    agingMonths={agingMonths}
                    dateStartForAging={getDateStartForAging(resultInput['dateStart'],resultInput['dateEnd'])}
                    dbBroughtForwardAmount={resultInput['dataPreview'][0][0][resultInput['field'][0][0].name]}
                    
                   
                
                />):<Redirect to={CreditorStatementReport.path}/>}
            </Route>
            <Route exact path={path}>
                <AppLayout>
                    <div className='container pt-3' style={{paddingLeft:20,paddingRight:20}}>
                        <h3>{CreditorStatementReport.description}</h3>
                        <form className='mt-3' onSubmit={e=>{
                        e.preventDefault();
                        changeGenerateReportWarning(false);
                        changeParamCreditorStatement({
                            url:'./ReportItem',
                            init:{
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({
                                    item:'creditor_statement',
                                    param:[getDateStartForAging(dateStart,dateEnd),dateEnd,creditorID]
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
                                <label className='col-md-2 col-form-label' style={{paddingLeft:0}} htmlFor='creditorID'>Creditor ID</label>
                                <select className='form-control col-md-4' required value={creditorID} onChange={e=>{
                                    let creditorName='';
                                    let creditorAddress='';
                                    let creditorDefaultCreditTerm='';

                                    dataSelectCreditor.data.forEach(data=>{
                                        if(data[dataSelectCreditor.field[0].name]===e.target.value) {
                                            creditorName=data[dataSelectCreditor.field[1].name]?data[dataSelectCreditor.field[1].name]:'';
                                            creditorAddress=data[dataSelectCreditor.field[2].name]?data[dataSelectCreditor.field[2].name]:'';
                                            creditorDefaultCreditTerm=data[dataSelectCreditor.field[7].name]?data[dataSelectCreditor.field[7].name]:'';
                                        }
                                    })
                                    changeCreditorID(e.target.value);
                                    changeCreditorOtherInfo([creditorName,creditorAddress,creditorDefaultCreditTerm])
                                
                                }}>
                                    <option value=''> -select an option- </option>
                                    {creditorList}
                                </select>
                            </div>

                            <fieldset className='form-group pl-4 pb-3 border border-secondary rounded col-md-7 mx-0'>
                                <legend className='col-form-label col-md-6 offset-md-3 col-8 offset-2 text-center'>
                                    <h6>Preview Options</h6>
                                </legend>
                                <div className='form-row'>
                                    <div className='form-group col-md-6 form-row'>
                                        <label className='col-6 col-md-6 col-form-label' htmlFor='agingMonths'>
                                            Aging Months
                                        </label>
                                        <select id='agingMonths' className='form-control col-3 col-md-3' required value={agingMonths}
                                            onChange={e=>
                                                changeAgingMonths(e.target.value)
                                            }>
                                            <option value='6'>6</option>
                                            <option value='9'>9</option>
                                            <option value='12'>12</option>
                                        </select>
                                    </div>
                                
                                    <div className='form-group col-md-6 form-row '>
                                        <label className='col-3 col-md-3 col-form-label' htmlFor='sort'>
                                            Sort
                                        </label>
                                        <select id='sort' className='form-control col-8 col-md-8' value={sortCriteria} onChange={e=>
                                            changeSortCriteria(e.target.value)
                                        }>
                                            <option value=''> -select an option- </option>
                                            {sortCriteriaList}
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
                                    history.push('./CreditorStatementReport/Preview')
                                }}
                            } 
                            className='btn btn-info mx-1 my-1'>Preview</button>
                            {generateReportWarning? 
                            (<div className="alert alert-warning">
                                Please generate report first!
                            </div>):null}
                        </form>
                        
                        <hr/>

                        {resultInput? 
                        (<div className='mb-5'>
                            <h5 className='py-2'>Result</h5>
                            {populateCreditor()}
                            
                        </div>):null
                        }
                        <hr className='pb-3'/>
                    </div>
                </AppLayout>
            </Route>
            <Redirect to={CreditorStatementReport.path}/>
        </Switch>
    )
}
CreditorStatementReport.description='Creditor Statement Report';
CreditorStatementReport.path='/CreditorStatementReport';

export default CreditorStatementReport;
