import React from 'react';
import AppLayout from '../Shared/AppLayout';
import logo from '../Shared/accounting.svg';

function Dashboard(props) {
    return (
            <AppLayout>
                <div className='container'>
                    <div className='row mt-5'>
                        <div className="col-md-6">
                            <img src={logo} alt='logo' style={{maxWidth:'65%'}} className='d-block mx-auto' />
                        </div>
                        <div className='col-md-6'>
                            <h1 className='d-none d-md-block'>ProtoCount Accounting Software</h1>
                            <h3 className='text-center text-md-left d-md-none'>ProtoCount Accounting Software</h3>
                            <p className='py-1 lead text-info text-center text-md-left'>Fully functional accounting app. Blazing Fast with Client-Side routing. Functionality easily extended. Responsive interface (incl. Mobile).</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
    )
}

Dashboard.description='Dashboard';
Dashboard.path='/Dashboard';

export default Dashboard;