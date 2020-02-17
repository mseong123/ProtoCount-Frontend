import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function SalesInvoice(props) {
    return (
            <AppLayout>
                <Process createItemPath='./SalesInvoiceItem' item='SALES_INVOICE'
                render={(list)=>{
                    return (
                    <ProcessLayout description={SalesInvoice.description} listname={SalesInvoice.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

SalesInvoice.description='Sales Invoice';
SalesInvoice.path='/SalesInvoice';

export default SalesInvoice;