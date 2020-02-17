import React from 'react';
import Navbar from '../Shared/Navbar';
import SidePanel from '../Shared/SidePanel';

function Main(props) {
    return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-md-9 order-md-last px-0'>
                        <Navbar/>
                    </div>
                    <div className='col-md-3 order-md-first px-0'>
                        <SidePanel/>
                    </div>
                </div>
            </div>
    )
}

export default Main;