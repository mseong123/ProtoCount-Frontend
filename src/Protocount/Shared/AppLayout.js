import React from 'react';
import Navbar from './Navbar';
import SidePanel from './SidePanel';

function AppLayout(props) {
    return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-9 order-md-last px-0'>
                        <Navbar/>
                        <div>{props.children}</div>
                    </div>
                    <div className='col-md-3 order-md-first px-0' >
                        <SidePanel largeScreenStyle={true}/>
                    </div>
                </div>
            </div>
    )
}

export default AppLayout;