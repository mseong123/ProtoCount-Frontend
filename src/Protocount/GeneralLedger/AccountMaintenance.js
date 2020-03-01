import React,{useState,useEffect,useContext} from 'react';
import AppLayout from '../Shared/AppLayout';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import $ from 'jquery'

function AccountMaintenance(props) {
    const [{data:dataSelectAccount,error:errorSelectAccount},changeParamSelectAccount]=useFetch({
        url:'./SelectItem',
        init:{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({item:'account'}),
            credentials:'include'
        }
    });
    const [GLCategoryList,changeGLCategoryList] = useState(null);
    const [GLAccountList,changeGLAccountList] = useState(null);
    const [GLAccountArray,changeGLAccountArray] = useState(null);
    const [inputStateCreate,changeInputStateCreate]=useState(['','','']) 
    const [inputStateUpdate,changeInputStateUpdate]=useState(['','','','']) 
    const [accounts,changeAccounts] = useState(null);
    const [collapsibleElementID,changeCollapsibleElementID]=useState([])

    const [{data:dataInsert,error:errorInsert},changeParamInsert]=useFetch(null);
    const [{data:dataDelete,error:errorDelete},changeParamDelete]=useFetch(null);
    const [{data:dataUpdate,error:errorUpdate},changeParamUpdate]=useFetch(null);

    const {changeAuth} = useContext(authContext)
    
    
    /*Use a different useEffect for each CRUD operation to enable page refresh once INSERT/UPDATE/DELETE is performed*/
    useEffect(()=>{
       

        if (dataSelectAccount && dataSelectAccount.auth===false) {
               alert('Cookies Expired or Authorisation invalid. Please Login again!')
               changeAuth(false)
           }
        else if (dataSelectAccount && dataSelectAccount.data && dataSelectAccount.field) {
            changeAccounts(populateAccount(dataSelectAccount.data[0],dataSelectAccount.field[0]))
        }
    
    },[dataSelectAccount,errorSelectAccount])

    useEffect(()=>{
        if (dataInsert && dataInsert.auth===false) {
            alert('Cookies Expired or Authorisation invalid. Please Login again!');
            changeAuth(false);
        }
        else if (dataInsert && !dataInsert.error) {
            alert('Insert Successful!')
            changeParamSelectAccount({
                url:'./SelectItem',
                init:{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({item:'account'}),
                    credentials:'include'
                }
            })
        }

    },[dataInsert,errorInsert])

    useEffect(()=>{
        if (dataUpdate && dataUpdate.auth===false) {
            alert('Cookies Expired or Authorisation invalid. Please Login again!');
            changeAuth(false);
        }
        else if (dataUpdate && !dataUpdate.error) {
            alert('Update Successful!')
            changeParamSelectAccount({
                url:'./SelectItem',
                init:{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({item:'account'}),
                    credentials:'include'
                }
            })
        }
    },[dataUpdate,errorUpdate])

    useEffect(()=>{
        if (dataDelete && dataDelete.auth===false) {
            alert('Cookies Expired or Authorisation invalid. Please Login again!');
            changeAuth(false);
        }
        else if (dataDelete && !dataDelete.error) {
            alert('Delete Successful!')
            changeParamSelectAccount({
                url:'./SelectItem',
                init:{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({item:'account'}),
                    credentials:'include'
                }
            })
        }
    },[dataDelete,errorDelete])

    //attach bootstrap/jquery eventlisteners and callbacks
    useEffect(()=>{

        if (collapsibleElementID && accounts) {
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

    },[accounts])
    
    function populateAccount(data,field) {
        const glCategory=field[0].name;
        const glAccount=field[1].name;
        const glDesc=field[2].name;
        const glStatus=field[3].name;

        const glCategoryAlreadyParsed=[];
        const result=[];

        data.forEach(item=>{
            if (glCategoryAlreadyParsed.indexOf(item[glCategory])===-1) {
                glCategoryAlreadyParsed.push(item[glCategory]);
                result.push(
                    (<div key={item[glCategory]}>
                        <div className='row py-1 bg-dark text-white' style={{cursor:'pointer'}} data-toggle='collapse' data-target={'#'+item[glCategory].replace(/[ ._()]/g,'')}>
                            <p className='col-1'><i id={'plusminus'+item[glCategory].replace(/[ ._()]/g,'')} className='fa fa-plus-square mt-1 text-white'></i></p>
                            <p className='col'>{item[glCategory]}</p>
                        </div>
                        <div className='collapse navbar-collapse bg-secondary' style={{marginLeft:'-15px',marginRight:'-15px'}} id={item[glCategory].replace(/[ ._()]/g,'')}>
                            {data.map((item2,i)=>{
                                if (item2[glCategory]===item[glCategory]) 
                                    return (
                                    <div className='row py-1 border-bottom border-white text-white' style={{margin:0}} key={item2[glAccount]}>
                                        <div className='offset-1 col-5 col-lg-7'>{item2[glDesc]}</div>
                                        <p className='col-3 col-lg-2'>{item2[glAccount]}</p>
                                        {item2[glStatus]==='NORMAL'? 
                                            (<div className='col-3 col-lg-2'>
                                                <button className='btn btn-info' onClick={(e)=>{
                                                    changeParamDelete({
                                                        url:'./DeleteItem',
                                                        init:{
                                                            method:'POST',
                                                            headers:{'Content-Type':'application/json'},
                                                            body:JSON.stringify({
                                                                item:'account',
                                                                id:item2[glAccount]
                                                            }),
                                                            credentials:'include'
                                                        }
                                                    })
                                                }}>Del</button>
                                            </div>):null
                                            }
                                        
                                    </div>)
                                    }
                                    )}
                                    
                        </div>
                    </div>
                    )

                )
            }
        })
        changeGLCategoryList(glCategoryAlreadyParsed.map(category=>
            (<option key={category} value={category}>
                {category}
            </option>)))
        changeGLAccountList(data.map(item=>{
            if(item[glStatus]==='NORMAL')
                 return (<option key={item[glAccount]?item[glAccount]:Math.random()} value={item[glAccount]}>
                    {item[glAccount]+' | '+item[glDesc]}
                </option>)
        })
        
    )
        changeCollapsibleElementID(glCategoryAlreadyParsed.map(category=>category.replace(/[ ._()]/g,'')))
        changeGLAccountArray(data.map(item=>item[glAccount]+''));
        return result;
    }
    
    function onChangeCreate(value,order) {
        changeInputStateCreate([...inputStateCreate.slice(0,order),value,...inputStateCreate.slice(order+1)])
    }
    function onChangeUpdate(value,order) {
        changeInputStateUpdate([...inputStateUpdate.slice(0,order),value,...inputStateUpdate.slice(order+1)])
    }
    
    let errorDisplay=null;

    if ((dataSelectAccount && dataSelectAccount.error) || errorSelectAccount ||(dataInsert && dataInsert.error) || errorInsert ||
    (dataUpdate && dataUpdate.error) || errorUpdate || (dataDelete && dataDelete.error) || errorDelete) 
    errorDisplay=(
        <div className="alert alert-warning">
            {dataSelectAccount && dataSelectAccount.error? 'Account List RETRIEVAL for item failed errno: '+dataSelectAccount.error.errno
            +' code: '+dataSelectAccount.error.code+' message: '+dataSelectAccount.error.sqlMessage:null}
            {errorSelectAccount? 'Account List RETRIEVAL for item failed '+errorSelectAccount : null}

            {dataInsert && dataInsert.error? 'Data INSERT for item failed errno: '+dataInsert.error.errno+' code: '+dataInsert.error.code+' message: '+dataInsert.error.sqlMessage:null}
            {errorInsert? 'Data INSERT for item failed '+errorInsert : null}

            {dataUpdate && dataUpdate.error? 'Data UPDATE for item failed errno: '+dataUpdate.error.errno+' code: '+dataUpdate.error.code+' message: '+dataUpdate.error.sqlMessage:null}
            {errorUpdate? 'Data UPDATE for item failed '+errorUpdate : null}
            
            {dataDelete && dataDelete.error? 'Data DELETE for item failed errno: '+dataDelete.error.errno+' code: '+dataDelete.error.code+' message: '+dataDelete.error.sqlMessage:null}
            {errorDelete? 'Data DELETE for item failed '+errorDelete : null}
        </div>)

    return (
            <AppLayout>
                <div className='container pt-3'>
                    <h3>Account Maintenance</h3>
                    {errorDisplay}
                    <section className='container px-0'>
                        <div className='row'>
                            <form className='col-md-6' onSubmit={(e)=>{
                                e.preventDefault();
                                if (GLAccountArray.indexOf(inputStateCreate[1])!==-1)
                                    alert('Account Code Already Exist! Please amend')

                                changeParamInsert({
                                    url:'./InsertItem',
                                    init:{
                                        method:'POST',
                                        headers:{'Content-Type':'application/json'},
                                        body:JSON.stringify({
                                                item:'account',
                                                param:inputStateCreate
                                        }),
                                        credentials:'include'
                                    }
                                })
                                
                                }}>
                                <fieldset className='px-3 form-group border border-secondary pb-4 rounded'>
                                    <legend className='col-form-label col-4 offset-4 text-center' ><h6>Create Account</h6></legend>
                                    <label className='mt-3' htmlFor='createGLCategory' >GL Category</label>
                                    <select id='createGLCategory' required className='form-control' onChange={(e)=>{
                                    onChangeCreate(e.target.value,0)
                                    
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {GLCategoryList}
                                    </select>
                                    <label htmlFor='accountCode' className='mt-3'>Account Code</label>
                                    <input id='accountCode' type='number' required min='100' max='999' className='form-control'
                                    value={inputStateCreate[1]} onChange={(e)=>onChangeCreate(e.target.value,1)}/>
                                    <label htmlFor='createDescription' className='mt-3'>Description</label>
                                    <input id='createDescription' type='text' required maxLength='45' required className='form-control'
                                    value={inputStateCreate[2]} onChange={(e)=>onChangeCreate(e.target.value,2)}/>
                                    <button type='submit' className='btn btn-success text-white mt-3'>Create</button>
                                </fieldset>


                            </form>
                            <form className='col-md-6' onSubmit={(e)=>{
                                e.preventDefault();
                                if (GLAccountArray.indexOf(inputStateUpdate[2])!==-1 && inputStateUpdate[2]!==inputStateUpdate[0])
                                    alert('Account Code Already Exist! Please amend')

                                changeParamUpdate({
                                    url:'./UpdateItem',
                                    init:{
                                        method:'POST',
                                        headers:{'Content-Type':'application/json'},
                                        body:JSON.stringify({
                                                item:'account',
                                                param:inputStateUpdate
                                        }),
                                        credentials:'include'
                                    }
                                })
                                
                                }}>
                                <fieldset className='px-3 form-group border border-secondary pb-4 rounded'>
                                    <legend className='col-form-label col-4 offset-4 text-center' ><h6>Update Account</h6></legend>
                                    <label className='mt-3' htmlFor='existingGLCode' >Existing GL Code</label>
                                    <select id='existingGLCode' required className='form-control' value={inputStateUpdate[0]} onChange={(e)=>{
                                        let GLCategory='';
                                        let GLDesc='';
                                        dataSelectAccount.data[0].forEach(data=>{
                                            if(data[dataSelectAccount.field[0][1].name]+''===e.target.value) {
                                                GLCategory=data[dataSelectAccount.field[0][0].name]?data[dataSelectAccount.field[0][0].name]:'';
                                                GLDesc=data[dataSelectAccount.field[0][2].name]?data[dataSelectAccount.field[0][2].name]:'';
                                            }
                                        })
                                        changeInputStateUpdate([e.target.value,GLCategory,e.target.value,GLDesc])

                                    }}>
                                        <option value=''> -select an option- </option>
                                        {GLAccountList}
                                    </select>
                                    <label className='mt-3' htmlFor='updateGLCategory' >GL Category</label>
                                    <select id='updateGLCategory' required className='form-control' value={inputStateUpdate[1]} onChange={(e)=>{
                                        onChangeUpdate(e.target.value,1)
                                    }}>
                                        <option value=''> -select an option- </option>
                                        {GLCategoryList}
                                    </select>
                                    <label htmlFor='newAccountCode' className='mt-3'>New Account Code</label>
                                    <input id='newAccountCode' type='number' required min='100' max='999' className='form-control'
                                    value={inputStateUpdate[2]} onChange={(e)=>{
                                        onChangeUpdate(e.target.value,2)
                                    }}/>
                                    <label htmlFor='updateDescription' className='mt-3'>Description</label>
                                    <input id='updateDescription' type='text' required maxLength='45' className='form-control'
                                    value={inputStateUpdate[3]} onChange={(e)=>{
                                        onChangeUpdate(e.target.value,3)
                                    }}
                                    />
                                    <button type='submit' className='btn btn-warning text-white mt-3'>Update</button>
                                </fieldset>

                            </form>
                        </div>
                    </section>
                   
                    <section className='container my-5'>
                        <div className='row text-white bg-info rounded-top py-2'>
                            <button className='col-1 btn btn-info' onClick={(e)=>collapsibleElementID.forEach(ID=>
                                $('#'+ID).collapse('hide')
                            )}><i className='fa fa-minus-square text-white'></i></button>
                            <h6 className='col-5 col-lg-7 pt-2'>Description</h6>
                            <h6 className='col-3 col-lg-2 pt-2'>Account Code</h6>
                            <h6 className='col-3 col-lg-2 pt-2'>Delete?</h6>
                        </div>
                        {accounts}
                    </section>
                    
                    

                    
                </div>
            </AppLayout>
    )
}
                
            

AccountMaintenance.description='Account Maintenance';
AccountMaintenance.path='/AccountMaintenance';

export default AccountMaintenance;