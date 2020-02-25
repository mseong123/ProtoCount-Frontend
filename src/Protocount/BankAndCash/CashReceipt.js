import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function CashReceipt(props) {
    return (
            <AppLayout>
                <Process createItemPath='./CashReceiptItem' item='cash_receipt'
                render={(list)=>{
                    return (
                    <ProcessLayout description={CashReceipt.description} listname={CashReceipt.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

CashReceipt.description='Cash Receipt';
CashReceipt.path='/CashReceipt';

export default CashReceipt;