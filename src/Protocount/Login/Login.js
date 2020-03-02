import React,{useState,useContext,useEffect} from 'react';
import useFetch from '../Shared/useFetch';
import authContext from '../Shared/authContext';
import isLoadingContext from '../Shared/isLoadingContext'
import logo from '../Shared/accounting.svg';

function Login(props) {
    const [{data,error},changeParam] = useFetch(null);
    const {changeAuth}=useContext(authContext);
    const {isLoading} = useContext(isLoadingContext);
    const [username,changeUsername]=useState('');
    const [password,changePassword]=useState('');
    
    

    useEffect(()=>{
        if (data && data.auth===true) {
            changeAuth(true)
        } 
    },[data,error])
    
    return (
        <section className='container'>
            <div className='row'>
                {isLoading?
                <div className='position-fixed d-flex justify-content-center align-items-center vh-100 vw-100' 
                style={{top:0,left:0, zIndex:'100000',backgroundColor:'rgba(255,255,255,0.6'}}>
                    <div className='spinner-grow' style={{width:'4rem',height:'4rem'}}><span className='sr-only'></span></div>
                </div>:null}
                <div className='col-md-4 offset-md-4'>
                    <div className='jumbotron min-vh-100'>
                        <h1 className='my-5'>
                            Login
                            <img src={logo} alt='logo' style={{width:'35px',height:'35px'}} className='d-inline-block mx-3'/>
                        </h1>
                        {(data && data.auth===false)||error? (<div className="alert alert-warning">
                                            {data && data.error? data.error.code+data.error.type : null}
                                            {data && data.message? data.message : null}
                                            {error? error.name +' '+error.message: null}
                                    </div>):null}
                        
                        <form onSubmit={(e)=>{e.preventDefault();changeParam({
                            url:'./userAuth',
                            init:{
                                method:'POST',
                                headers:{'Content-Type':'application/json'},
                                body:JSON.stringify({username:username,password:password}),
                                credentials:'include'
                            }
                        })
                        }}>
                            <label htmlFor='username'>Username:</label>
                            <input type='text' id='username' value={username} onChange={(e)=>changeUsername(e.target.value)} required className='form-control'></input>
                            <label htmlFor='password'>Password:</label>
                            <input type='password' id='password' value={password} onChange={(e)=>changePassword(e.target.value)} required className='form-control'></input>
                            <button type='submit' className='btn btn-primary my-3'>Submit</button>
                        </form>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default Login;