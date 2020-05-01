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
import StockCardOne from '../Shared/preview/StockCardOne';

function StockCardReport(props) {
    const [{data:dataSelectStock,error:errorSelectStock}]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'stock'}),
            credentials:'include'
        }
    });
    const [{data:dataSelectStockCard,error:errorSelectStockCard},changeParamStockCard]=useFetch(null);
    const [stockList,changeStockList] = useState(null);
    const [stockID,changeStockID] = useState([]);
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

    const calculatedWidth=700;

    useEffect(()=>{
        
        if (dataSelectStock && dataSelectStock.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectStock && dataSelectStock.data && dataSelectStock.field) 
            changeStockList(dataSelectStock.data.map(data=>(
            <option key={data[dataSelectStock.field[0].name]} value={data[dataSelectStock.field[0].name]}>
                {data[dataSelectStock.field[0].name]+' '+(data[dataSelectStock.field[1].name]?data[dataSelectStock.field[1].name]:'')}
            </option>)
            )
        )
    },[dataSelectStock,errorSelectStock])
    
    useEffect(()=>{
        if (dataSelectStockCard && dataSelectStockCard.auth===false) {
                alert('Cookies Expired or Authorisation invalid. Please Login again!');
                changeAuth(false);
            }
        else if (dataSelectStockCard && dataSelectStockCard.data && dataSelectStockCard.field) {
            const stockAlreadyParsed=[];
            const data=dataSelectStockCard.data[1];
            const field=dataSelectStockCard.field[1];
            const stockNum=field[0].name;
            const description=field[1].name;
            const docNum=field[2].name;
            const docDate=field[3].name;
            const type=field[4].name;
            const IN=field[5].name;
            const OUT=field[6].name;
            
            changeResultInput(resultInput=>{})

            data.forEach(item=>{
                let newObject={}
               if(stockAlreadyParsed.indexOf(item[stockNum])===-1) {
                stockAlreadyParsed.push(item[stockNum])
                    newObject[item[stockNum]]=data.filter(item2=>item2[stockNum]===item[stockNum])
                    changeResultInput(resultInput=>(Object.assign({},resultInput,newObject)))
               }
            })

            changeResultInput(resultInput=>({...resultInput,
                data:dataSelectStockCard.data,
                dataPreview:[...dataSelectStockCard.data],
                field:dataSelectStockCard.field,
                dateStart,
                dateEnd,
                stockID
            }))

            changeSortCriteriaList(
                (<>
                    <option value={stockNum}>Item Code</option>
                    <option value={description}>Description</option>
                </>)
            )
            changeDetailSortCriteriaList(
                (<>
                    <option value={docNum}>Doc No.</option>
                    <option value={docDate}>Doc Date</option>
                    <option value={type}>Type</option>
                    <option value={IN}>In</option>
                    <option value={OUT}>Out</option>
                </>)
            )

             changeCollapsibleElementID(stockAlreadyParsed.map(item=>item.replace(/[ ._\-()]/g,'')))

        }
    },[dataSelectStockCard,errorSelectStockCard])

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
        const broughtForwardData=resultInput['data'][0];
        const broughtForwardField=resultInput['field'][0];
        const data=resultInput['data'][1];
        const field=resultInput['field'][1];
        const stockNum=field[0].name;
        const description=field[1].name;
        const docNum=field[2].name;
        const docDate=field[3].name;
        const type=field[4].name;
        const IN=field[5].name;
        const OUT=field[6].name;
        const bfQty=broughtForwardField[1].name

        
        
        function populateStock() {
            const stockAlreadyParsed=[];
            const result=[];
            let balQty=0;
            
            data.forEach(item=>{
                if(stockAlreadyParsed.indexOf(item[stockNum])===-1)  {
                    stockAlreadyParsed.push(item[stockNum]);
                    balQty=broughtForwardData.find(item2=>
                        item2[stockNum]===item[stockNum]
                    )[bfQty];
                    result.push(
                        <div key={item[stockNum]}>
                            <div className='d-flex' style={{cursor:'pointer'}} data-toggle='collapse' data-target={'#'+item[stockNum].replace(/[ ._\-()]/g,'')}>
                                <i className='fa fa-plus-square mt-1' style={{flex:'0 0 14px',paddingLeft:10,paddingRight:10}}
                                id={'plusminus'+item[stockNum].replace(/[ ._\-()]/g,'')}></i>
                                <p className='mb-0' style={{flex:'0 0 120px',paddingLeft:10,paddingRight:10}}>{item[stockNum]}</p>
                                <p className='mb-0' style={{flex:'1 0 225px',paddingLeft:10,paddingRight:10}}>{item[description]}</p>
                                <p className='mb-0' style={{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                                    {numberFormatParser(broughtForwardData.find(item2=>
                                        item2[stockNum]===item[stockNum]
                                        )[bfQty]
                                    )}
                                </p>
                                <p className='mb-0' style={{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>
                                    {numberFormatParser(
                                        broughtForwardData.find(item2=>
                                            item2[stockNum]===item[stockNum]
                                        )[bfQty]+data.reduce((a,b)=>{
                                            if(b[stockNum]===item[stockNum])
                                               return a+b[IN]+b[OUT]
                                            else return a
                                        },0)
                                    )}
                                </p>
                            </div>
                            <div className='collapse navbar-collapse my-2 pl-3 pl-md-5' 
                            id={item[stockNum].replace(/[ ._\-()]/g,'')}>
                                <table className='table table-hover'>
                                    <thead>
                                        <tr>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                            const id='docNum'+item[stockNum].replace(/[ ._\-()]/g,'');
                                            e.target.setAttribute('data-order',
                                            e.target.getAttribute('data-order')==='asc'?'desc':'asc')

                                            let sortedData={}
                                            sortedData[item[stockNum]]=sortData(resultInput[item[stockNum]],docNum,e.target.getAttribute('data-order'))
                                            changeResultInput(Object.assign({},resultInput,sortedData))

                                            if (e.target.getAttribute('data-order')==='asc') {
                                                document.getElementById(id).classList.remove('fa-caret-up');
                                                document.getElementById(id).classList.add('fa-caret-down')
                                            }
                                            else {
                                                document.getElementById(id).classList.remove('fa-caret-down');
                                                document.getElementById(id).classList.add('fa-caret-up')
                                            }
                                            }}>
                                                Doc No.
                                                <i id={'docNum'+item[stockNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='date'+item[stockNum].replace(/[ ._\-()]/g,'');
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
    
                                                let sortedData={}
                                                sortedData[item[stockNum]]=sortData(resultInput[item[stockNum]],docDate,e.target.getAttribute('data-order'))
                                                changeResultInput(Object.assign({},resultInput,sortedData))
    
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                            }}>
                                                Date
                                                <i id={'date'+item[stockNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='type'+item[stockNum].replace(/[ ._\-()]/g,'');
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
    
                                                let sortedData={}
                                                sortedData[item[stockNum]]=sortData(resultInput[item[stockNum]],type,e.target.getAttribute('data-order'))
                                                changeResultInput(Object.assign({},resultInput,sortedData))
    
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}>
                                                Type
                                                <i id={'type'+item[stockNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='IN'+item[stockNum].replace(/[ ._\-()]/g,'');
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
    
                                                let sortedData={}
                                                sortedData[item[stockNum]]=sortData(resultInput[item[stockNum]],IN,e.target.getAttribute('data-order'))
                                                changeResultInput(Object.assign({},resultInput,sortedData))
    
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}>
                                                In
                                                <i id={'IN'+item[stockNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap' style={{cursor:'pointer'}} data-order='asc'
                                            onClick={(e)=>{
                                                const id='OUT'+item[stockNum].replace(/[ ._\-()]/g,'');
                                                e.target.setAttribute('data-order',
                                                e.target.getAttribute('data-order')==='asc'?'desc':'asc')
    
                                                let sortedData={}
                                                sortedData[item[stockNum]]=sortData(resultInput[item[stockNum]],OUT,e.target.getAttribute('data-order'))
                                                changeResultInput(Object.assign({},resultInput,sortedData))
    
                                                if (e.target.getAttribute('data-order')==='asc') {
                                                    document.getElementById(id).classList.remove('fa-caret-up');
                                                    document.getElementById(id).classList.add('fa-caret-down')
                                                }
                                                else {
                                                    document.getElementById(id).classList.remove('fa-caret-down');
                                                    document.getElementById(id).classList.add('fa-caret-up')
                                                }
                                                }}>
                                                Out
                                                <i id={'OUT'+item[stockNum].replace(/[ ._\-()]/g,'')} className='fa fa-caret-down ml-2'></i>
                                            </th>
                                            <th className='text-nowrap'>Bal Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {resultInput[item[stockNum]].map(item2=>{
                                        if(item2[stockNum]===item[stockNum]) {
                                            return (
                                                <tr key={item2[docNum]} style={{cursor:'pointer'}} onClick={(e)=>
                                                history.push('./'+createLink(item2[type].toLowerCase(),item2[docNum]))
                                                }>
                                                    <td className='text-nowrap'>{item2[docNum]}</td>
                                                    <td className='text-nowrap'>{dateFormatParser(item2[docDate])}</td>
                                                    <td className='text-nowrap'>{item2[type]}</td>
                                                    <td className='text-nowrap'>{item2[IN]}</td>
                                                    <td className='text-nowrap'>{item2[OUT]}</td>
                                                    <td className='text-nowrap'>{balQty+=item2[IN]+item2[OUT]}</td>
                                                </tr>)
                                        }
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }
            })
            return result;
        }

        return (
            <div className="overflow-auto mb-5 pt-3" style={{transform:'rotateX(180deg)'}}>
                <div style={{minWidth:calculatedWidth,transform:'rotateX(180deg)'}}>
                    <div className='row flex-nowrap text-white bg-secondary pt-2 pb-1' 
                    style={{marginLeft:0,marginRight:0,}}>
                        <h6 style={{flex:'0 0 34px',paddingLeft:10,paddingRight:10}}></h6>
                        <h6 style={{flex:'0 0 120px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                            data-order='asc' onClick={(e)=>{
                            e.target.setAttribute('data-order',
                            e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                            resultInput['data'][1]=sortData(resultInput['data'][1],stockNum,e.target.getAttribute('data-order'))
                            changeResultInput({...resultInput})
                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('stockNo').classList.remove('fa-caret-up');
                                    document.getElementById('stockNo').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('stockNo').classList.remove('fa-caret-down');
                                    document.getElementById('stockNo').classList.add('fa-caret-up')
                                }
                            }
                                    
                            }>
                            Stock No.
                            <i id='stockNo' className='fa fa-caret-down ml-2'></i>
                        </h6>
                        <h6 style={{flex:'1 0 225px',paddingLeft:10,paddingRight:10,cursor:'pointer'}}
                        data-order='asc' onClick={(e)=>{
                            e.target.setAttribute('data-order',
                            e.target.getAttribute('data-order')==='asc'?'desc':'asc')
                            resultInput['data'][1]=sortData(resultInput['data'][1],description,e.target.getAttribute('data-order'))
                            changeResultInput({...resultInput})
                                if (e.target.getAttribute('data-order')==='asc') {
                                    document.getElementById('description').classList.remove('fa-caret-up');
                                    document.getElementById('description').classList.add('fa-caret-down')
                                }
                                else {
                                    document.getElementById('description').classList.remove('fa-caret-down');
                                    document.getElementById('description').classList.add('fa-caret-up')
                                }
                            }
                            }>
                            Description
                            <i id='description' className='fa fa-caret-down ml-2'></i>
                        </h6>
                        <h6 style={{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>B/F Qty</h6>
                        <h6 style={{flex:'0 0 150px',paddingLeft:10,paddingRight:10}}>Balance Qty</h6>
                    </div>
                    <div style={{overflowY:'auto',overflowX:'hidden',maxHeight:'60vh'}}>
                        {populateStock()}
                    </div>
                </div>
            </div>)
    }

    let errorDisplay=null;

    if ((dataSelectStock && dataSelectStock.error) || errorSelectStock || 
    (dataSelectStockCard && dataSelectStockCard.error) || errorSelectStockCard )
    errorDisplay=(
        <div className="alert alert-warning">
            {dataSelectStock && dataSelectStock.error? 'Stock List RETRIEVAL for item failed errno: '+dataSelectStock.error.errno
            +' code: '+dataSelectStock.error.code+' message: '+dataSelectStock.error.sqlMessage:null}
            {errorSelectStock? 'Stock List RETRIEVAL for item failed '+errorSelectStock : null}
            <br/>
            <br/>
            {dataSelectStockCard && dataSelectStockCard.error? 'Stock Card RETRIEVAL for item failed errno: '+dataSelectStockCard.error.errno
            +' code: '+dataSelectStockCard.error.code+' message: '+dataSelectStockCard.error.sqlMessage:null}
            {errorSelectStockCard? 'Stock Card RETRIEVAL for item failed '+errorSelectStockCard : null}

        </div>
    )

    return (
        <Switch>
            <Route exact path={`${path}/Preview`}>
                {resultInput? 
                (<StockCardOne
                    backPath={StockCardReport.path}
                    description={StockCardReport.description}
                    resultInput={resultInput}
                    withDetails={withDetails}
                    data={sortData(resultInput['dataPreview'][1],sortCriteria,'asc')}
                    dataDetail={sortData(resultInput['dataPreview'][1],detailSortCriteria,'asc')}
                    field={resultInput['field'][1]}
                    broughtForwardData={resultInput['dataPreview'][0]}
                    broughtForwardField={dataSelectStockCard.field[0]}
                    getFormattedDate={getFormattedDate}
                   
                    
                />):<Redirect to={StockCardReport.path}/>}
            </Route>

            <Route exact path={path}>
                <AppLayout>
                    <div className='container pt-3' style={{paddingLeft:20,paddingRight:20}}>
                        <h3>{StockCardReport.description}</h3>
                        <form className='mt-3' onSubmit={e=>{
                        e.preventDefault();
                        changeGenerateReportWarning(false);
                        changeParamStockCard({
                            url:'./ReportItem',
                            init:{
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({
                                    item:'stock_card',
                                    param:[dateStart,dateEnd,stockID]
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
                                <label className='col-md-2 col-form-label' style={{paddingLeft:0}} htmlFor='stockID'>Stock ID</label>
                                <select className='form-control col-md-4' required size='3' id='stockID' 
                                value={stockID} multiple={true} onChange={e=>{
                                    let result=[];
                                    Array.from(e.target.options).map(option=>{
                                        if (option.selected===true) 
                                            result.push(option.value) 
                                    })
                                    changeStockID(result);
                                }}>
                                    {stockList}
                                </select>
                            </div>

                            <div className='form-group form-row mx-0'>
                                <div className='form-check offset-md-2'>
                                    <input type='checkbox' className=' form-check-input' id='allStockID' onChange={e=>{
                                        if (e.target.checked) 
                                            changeStockID(dataSelectStock.data.map(data=>
                                                data[dataSelectStock.field[0].name]
                                                ))
                                        else changeStockID([])
                                    }}/>
                                    <label htmlFor='allStockID' style={{paddingLeft:0}} className='form-check-label'>
                                        All Stock ID
                                    </label>
                                </div>
                            </div>

                            <fieldset className='form-group pl-4 pb-3 border border-secondary rounded col-md-8'>
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
                                    history.push('./StockCardReport/Preview')
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
            <Redirect to={StockCardReport.path}/>
        </Switch>
    )
}
StockCardReport.description='Stock Card Report';
StockCardReport.path='/StockCardReport';

export default StockCardReport;
