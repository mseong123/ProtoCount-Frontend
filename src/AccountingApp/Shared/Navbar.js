import React,{useContext} from 'react';
import logo from './accounting.svg';
import authContext from './authContext';
import {Link} from 'react-router-dom'

function Navbar(props) {
    const {changeAuth} = useContext(authContext);
    let modify=' navbar-light bg-light';
    if (props.theme==='dark') 
      modify=' navbar-dark bg-dark'

    return (
    <nav className={'navbar navbar-expand-md'+modify}>
      <Link className='navbar-brand' to='/'>
        <img src={logo} style={{width:'35px',height:'35px'}} alt='logo' className='d-inline-block' />
        ProtoCount
      </Link>
      <button className='navbar-toggler' data-toggle='collapse' data-target='#navbarText'>
        <span className='navbar-toggler-icon'></span>
      </button>
      <div className='collapse navbar-collapse' id='navbarText'>
        <ul className='navbar-nav mr-auto'>
          <li className='nav-item dropdown'>
            <a href='#' className='nav-link dropdown-toggle' data-toggle='dropdown'>File</a>
            <div className='dropdown-menu'>
              <a href='#' className='dropdown-item'>Exit and Logout</a>
            </div>
          </li>
          <li className='nav-item dropdown'>
            <a href='#' className='nav-link dropdown-toggle' data-toggle='dropdown'>General Maintenance</a>
            <div className='dropdown-menu'>
              <a href='#' className='dropdown-item'>Company Profile</a>
              <a href='#' className='dropdown-item'>User Maintenance</a>
              <div className='dropdown-divider'></div>
              <a href='#' className='dropdown-item'>Credit Term Maintenance</a>
              <a href='#' className='dropdown-item'>Currency Maintenance</a>
            </div>
          </li>
          <li className='nav-item dropdown'>
            <a href='#' className='nav-link dropdown-toggle' data-toggle='dropdown'>Tools</a>
            <div className='dropdown-menu'>
              <a href='#' className='dropdown-item'>Backup</a>
              <a href='#' className='dropdown-item'>Restore</a>
            </div>
          </li>
          <li className='nav-item dropdown'>
            <a href='#' className='nav-link dropdown-toggle' data-toggle='dropdown'>Help</a>
            <div className='dropdown-menu'>
              <a href='#' className='dropdown-item'>About ProtoCount Accounting</a>
            </div>
          </li>
          
          
        </ul>
        <button type='button' className='btn btn-dark' onClick={()=>changeAuth(false)}>Log Out</button>
      </div>
      
    </nav>
    )
}

export default Navbar;
