import React from 'react';
import AppLayout from '../Shared/AppLayout';
import logo from '../Shared/accounting.svg';

function Dashboard(props) {
    return (
            <AppLayout>
                <div className='container' >
                    
                    <div className='row flex-column align-items-center justify-content-center' style={{height:'80vh'}}>
                        <div >
                            <img src={logo} alt='logo' style={{maxWidth:'50%'}} className='d-block mx-auto' />
                        </div>
                        
                        <h1 className='text-center d-none d-md-block'>ProtoCount Accounting Software</h1>
                        <h3 className='text-center d-md-none'>ProtoCount Accounting Software</h3>
                        <p className='lead text-info text-center m-0'>Fully functional accounting app.</p>
                        <p className='lead text-info text-center m-0'>Blazing Fast with Client-Side routing.</p>
                        <p className='lead text-info text-center m-0'>Functionality easily extended.</p>
                        <p className='lead text-info text-center m-0'>Responsive interface (incl. Mobile).</p>
                    </div>
                    
                    

                </div>
            </AppLayout>
    )
}

Dashboard.description='Dashboard';
Dashboard.path='/Dashboard';

export default Dashboard;