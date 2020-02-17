import React,{useState} from 'react';
import AppLayout from '../Shared/AppLayout';
import {useHistory} from 'react-router-dom';

function BalanceSheet(props) {
    const [date,changeDate] = useState (getCurrentDate())
    const [companyTitle,changeCompanyTitle] = useState('')
    const history=useHistory();

    function getCurrentDate() {
        let currDate=new Date();

        return (currDate.getFullYear()) + (currDate.getMonth() + 1 <10? '-0'+ (currDate.getMonth()+1):'-'+ (currDate.getMonth()+1)) + (currDate.getDate()<10?
        '-0'+currDate.getDate() : '-'+currDate.getDate());
    }
    
    function onClick () {
        history.push('./BalanceSheetItem?date='+date+'&companyTitle='+companyTitle)
    }

    return (
            <AppLayout>
                <div className='container pt-3'>
                    <h3>Balance Sheet Statement</h3>
                    <small className='text-warning'>* required</small>
                    <form onSubmit={(e)=>{e.preventDefault();onClick()}}>
                        <div className='form-group form-row mt-5'>
                            <label className='col-md-2 col-form-label' htmlFor='date'>Date <span className='text-warning'>*</span></label>
                            <div className='col-md-4'>
                                <input type='date' id='date' onChange={(e)=>changeDate(e.target.value)} value={date} required 
                                className='form-control'/>
                            </div>
                            
                            </div>
                        <div className='form-group form-row'>
                            <label className='col-md-2 col-form-label' htmlFor='companyTitle'>Company Title</label>
                            <div className='col-md-6'>
                                <input type='text' id='companyTitle' onChange={(e)=>changeCompanyTitle(e.target.value)} 
                                value={companyTitle} className='form-control'/>
                            </div>
                        </div>
                        <button type='submit' className='btn btn-primary'>Preview</button>
                    </form>
                    

                    
                </div>
            </AppLayout>
    )
}
                
            

BalanceSheet.description='Balance Sheet';
BalanceSheet.path='/BalanceSheet';

export default BalanceSheet;