import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function BankPayment(props) {
    return (
            <AppLayout>
                <Process createItemPath='./BankPaymentItem' item='BANK_PAYMENT'
                render={(list)=>{
                    return (
                    <ProcessLayout description={BankPayment.description} listname={BankPayment.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

BankPayment.description='Bank Payment';
BankPayment.path='/BankPayment';

export default BankPayment;