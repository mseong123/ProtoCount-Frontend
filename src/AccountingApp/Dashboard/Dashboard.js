import React from 'react';
import AppLayout from '../Shared/AppLayout';
import logo from '../Shared/accounting.svg';

function Dashboard(props) {
    return (
            <AppLayout>
                <div className='container'>
                    <div className='row'>
                        <h1 className='col-12 d-none d-md-block my-3'>ProtoCount Accounting Software</h1>
                        <h3 className='col-10 offset-1 d-md-none my-2'>ProtoCount Accounting Software</h3>
                        <div className='offset-md-1 col-md-5 offset-2 col-8'>
                            <img src={logo} alt='logo' className='img-fluid' />
                        </div>
                        <ul className='col-5 offset-1 d-none d-md-block pt-lg-5 text-info'>
                            <li className='py-1 h4'>Blazing Fast with Client-Side routing. </li>
                            <li className='py-1 h4'>Functionality easily extended. </li>
                            <li className='py-1 h4'>Responsive interface (incl. Mobile).</li>
                        </ul>
                        <ul className='col-10 d-md-none offset-1 text-info mt-3'>
                            <li className='h5 py-1'>Blazing Fast with Client-Side routing.</li>
                            <li className='h5 py-1'>Functionality easily extended.</li>
                            <li className='h5 py-1'>Responsive interface (incl. Mobile).</li>
                            
                        </ul>
                    </div>
                        
                   
                    

                </div>
            </AppLayout>
    )
}

Dashboard.description='Dashboard';
Dashboard.path='/Dashboard';

export default Dashboard;