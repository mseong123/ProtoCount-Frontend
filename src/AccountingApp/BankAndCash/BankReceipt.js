import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function BankReceipt(props) {
    return (
            <AppLayout>
                <Process createItemPath='./BankReceiptItem' item='BANK_RECEIPT'
                render={(list)=>{
                    return (
                    <ProcessLayout description={BankReceipt.description} listname={BankReceipt.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

BankReceipt.description='Bank Receipt';
BankReceipt.path='/BankReceipt';

export default BankReceipt;