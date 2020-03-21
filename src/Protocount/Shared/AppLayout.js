import React,{useContext} from 'react';
import Navbar from './Navbar';
import SidePanel from './SidePanel';
import isLoadingContext from './isLoadingContext'

function AppLayout(props) {
    const {isLoading} = useContext(isLoadingContext);

    return (
            <div className='container-fluid'>
                <div className='row'>
                    {isLoading?
                    <div className='position-fixed d-flex justify-content-center align-items-center vh-100 vw-100' 
                    style={{top:0,left:0,zIndex:'100000',backgroundColor:'rgba(255,255,255,0.6'}}>
                        <div className='spinner-grow' style={{width:'4rem',height:'4rem'}}><span className='sr-only'></span></div>
                    </div>:null}
                    <div className='col-md-9 order-md-last px-0'>
                        <Navbar/>
                        
                        <div>{props.children}</div>
                        
                    </div>
                    <div className='col-md-3 order-md-first px-0 d-print-none' >
                        <SidePanel largeScreenStyle={true}/>
                    </div>
                </div>
            </div>
    )
}

export default AppLayout;