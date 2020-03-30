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
import DebtorCreditorStatementOne from '../Shared/preview/DebtorCreditorStatementOne';

function DebtorStatementReport(props) {
    const [{data:dataSelectDebtor,error:errorSelectDebtor}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'debtor'}),
            credentials:'include'
        }
    });
    const [{data:dataSelectDebtorStatement,error:errorSelectDebtorStatement},changeParamDebtorStatement]=useFetch(null);
    
    const [debtorList,changeDebtorList] = useState(null);
    const [debtorID,changeDebtorID] = useState('');
    const [dateStart,changeDateStart] = useState(new Date().getFullYear()+'-01-01');
    const [dateEnd,changeDateEnd] = useState(getFormattedDate(new Date()));
    const [resultInput,changeResultInput]=useState({});
    

    /*Preview states*/
    const agingMonthsMax=12 /*variable used for db fetching purpose. Change this if aging month option is changed*/
    const [agingMonths,changeAgingMonths]=useState(6);
    const [debtorOtherInfo,changeDebtorOtherInfo] =useState(null)
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
                {data[dataSelectDebtor.field[0].name]+' '+(data[dataSelectDebtor.field[1].name]?data[dataSelectDebtor.field[1].name]:'')}
            </option>)
            )
        )
    },[dataSelectDebtor,errorSelectDebtor])

    useEffect(()=>{
        
        if (dataSelectDebtorStatement && dataSelectDebtorStatement.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectDebtorStatement && dataSelectDebtorStatement.data && dataSelectDebtorStatement.field)
            changeResultInput({data:dataSelectDebtorStatement.data,field:dataSelectDebtorStatement.field,
            dateStart,dateEnd,debtorID})

    },[dataSelectDebtorStatement,errorSelectDebtorStatement])

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
    
    function populateDebtor(preview) {
        const dbBroughtForwardAmount=resultInput['data'][0][0][resultInput['field'][0][0].name];
        const data=resultInput['data'][1];
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
            <table className='table'>
                <thead>
                    <tr>
                        <th className='text-nowrap'>Date</th>
                        <th className='text-nowrap'>Doc No.</th>
                        <th className='text-nowrap'>Ref.</th>
                        <th className='text-nowrap'>Type</th>
                        <th className='text-nowrap'>Dr</th>
                        <th className='text-nowrap'>Cr</th>
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

    if ((dataSelectDebtor && dataSelectDebtor.error) || errorSelectDebtor || (dataSelectDebtorStatement && dataSelectDebtorStatement.error) 
    || errorSelectDebtorStatement )
    errorDisplay=(
        <div className="alert alert-warning">
            {dataSelectDebtor && dataSelectDebtor.error? 'Debtor List RETRIEVAL for item failed errno: '+dataSelectDebtor.error.errno
            +' code: '+dataSelectDebtor.error.code+' message: '+dataSelectDebtor.error.sqlMessage:null}
            {errorSelectDebtor? 'Debtor List RETRIEVAL for item failed '+errorSelectDebtor : null}
            <br/>
            <br/>
            {dataSelectDebtorStatement && dataSelectDebtorStatement.error? 'Debtor Statement RETRIEVAL for item failed errno: '+dataSelectDebtorStatement.error.errno
            +' code: '+dataSelectDebtorStatement.error.code+' message: '+dataSelectDebtorStatement.error.sqlMessage:null}
            {errorSelectDebtorStatement? 'Debtor Statement RETRIEVAL for item failed '+errorSelectDebtorStatement : null}

        </div>
    )
    
    return (
        <Switch>
            <Route exact path={`${path}/Preview`}>
                {resultInput['data'] ? 
                (<DebtorCreditorStatementOne
                    backPath={DebtorStatementReport.path}
                    description='Debtor Statement'
                    topLeftInput={[...debtorOtherInfo.slice(0,2)]}
                    topRightField={['Statement Date','Credit Term']}
                    topRightInput={
                        [dateFormatParser(resultInput['dateStart'])+' to '+ dateFormatParser(resultInput['dateEnd']),
                        debtorOtherInfo[2]==='COD'?'C.O.D.':debtorOtherInfo[2]+' days']}
                    populateDebtor={populateDebtor}
                    data={resultInput['data'][1]}
                    field={resultInput['field'][1]}
                    dateEnd={resultInput['dateEnd']}
                    agingMonths={agingMonths}
                    dateStartForAging={getDateStartForAging(resultInput['dateStart'],resultInput['dateEnd'])}
                    dbBroughtForwardAmount={resultInput['data'][0][0][resultInput['field'][0][0].name]}
                    
                   
                
                />):<Redirect to={DebtorStatementReport.path}/>}
            </Route>
            <Route exact path={path}>
                <AppLayout>
                    <div className='container pt-3' style={{paddingLeft:20,paddingRight:20}}>
                        <h3>{DebtorStatementReport.description}</h3>
                        <form className='mt-3' onSubmit={e=>{
                        e.preventDefault();
                        changeGenerateReportWarning(false);
                        changeParamDebtorStatement({
                            url:'./ReportItem',
                            init:{
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({
                                    item:'debtor_statement',
                                    param:[getDateStartForAging(dateStart,dateEnd),dateEnd,debtorID]
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
                                <select className='form-control col-md-4' required value={debtorID} onChange={e=>{
                                    let debtorName='';
                                    let debtorAddress='';
                                    let debtorDefaultCreditTerm='';

                                    dataSelectDebtor.data.forEach(data=>{
                                        if(data[dataSelectDebtor.field[0].name]===e.target.value) {
                                            debtorName=data[dataSelectDebtor.field[1].name]?data[dataSelectDebtor.field[1].name]:'';
                                            debtorAddress=data[dataSelectDebtor.field[2].name]?data[dataSelectDebtor.field[2].name]:'';
                                            debtorDefaultCreditTerm=data[dataSelectDebtor.field[7].name]?data[dataSelectDebtor.field[7].name]:'';
                                        }
                                    })
                                    changeDebtorID(e.target.value);
                                    changeDebtorOtherInfo([debtorName,debtorAddress,debtorDefaultCreditTerm])
                                
                                }}>
                                    <option value=''> -select an option- </option>
                                    {debtorList}
                                </select>
                            </div>

                            <fieldset className='form-group form-row pb-3 border border-secondary rounded col-md-6 mx-0'>
                                <legend className='col-form-label col-md-6 offset-md-3 col-8 offset-2 text-center'>
                                    <h6>Preview Options</h6>
                                </legend>
                                <div className='col-md-12 form-row'>
                                    <label className='col-6 col-md-4 col-form-label' htmlFor='agingMonths'>
                                        Aging Months
                                    </label>
                                    <select id='agingMonths' className='form-control col-3 col-md-2' required value={agingMonths}
                                        onChange={e=>
                                            changeAgingMonths(e.target.value)
                                        }>
                                        <option value='6'>6</option>
                                        <option value='9'>9</option>
                                        <option value='12'>12</option>
                                    </select>
                                </div>
                            </fieldset>

                            <button type='submit' className='btn btn-primary mx-2'>Generate</button>
                            <button type='button' className='btn btn-warning' onClick={e=>
                                changeResultInput({})}>Clear</button>
                            <button type='button' onClick={(e)=>{
                                if (!resultInput['data']) {
                                    changeGenerateReportWarning(true)
                                }
                                else {
                                    document.querySelector("meta[name=viewport]").setAttribute(
                                    'content','width=device-width, initial-scale=0.4');
                                    history.push('./DebtorStatementReport/Preview')
                                }}
                            } 
                            className='btn btn-info mx-1 my-1'>Preview</button>
                            {generateReportWarning? 
                            (<div className="alert alert-warning">
                                Please generate report first!
                            </div>):null}
                        </form>
                        
                        <hr/>

                        {resultInput['data']? 
                        (<div className='mb-5'>
                            <h5 className='py-2'>Result</h5>
                            {populateDebtor()}
                            
                        </div>):null
                        }
                        <hr className='pb-3'/>
                    </div>
                </AppLayout>
            </Route>
            <Redirect to={DebtorStatementReport.path}/>
        </Switch>
    )
}
DebtorStatementReport.description='Debtor Statement Report';
DebtorStatementReport.path='/DebtorStatementReport';

export default DebtorStatementReport;
