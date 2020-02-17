import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function PurchaseInvoice(props) {
    return (
            <AppLayout>
                <Process createItemPath='./PurchaseInvoiceItem' item='PURCHASE_INVOICE' 
                render={(list)=>{
                    return (
                    <ProcessLayout description={PurchaseInvoice.description} listname={PurchaseInvoice.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

PurchaseInvoice.description='Purchase Invoice';
PurchaseInvoice.path='/PurchaseInvoice';

export default PurchaseInvoice;