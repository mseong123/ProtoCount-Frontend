import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function CashPayment(props) {
    return (
            <AppLayout>
                <Process createItemPath='./CashPaymentItem' item='cash_payment'
                render={(list)=>{
                    return (
                    <ProcessLayout description={CashPayment.description} listname={CashPayment.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

CashPayment.description='Cash Payment';
CashPayment.path='/CashPayment';

export default CashPayment;