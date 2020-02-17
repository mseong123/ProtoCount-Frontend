import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function PurchaseOrder(props) {
    return (
            <AppLayout>
                <Process fetchpath='' createItemPath='./CreatePurchaseOrder' 
                render={(list)=>{
                    return (
                    <ProcessLayout description={PurchaseOrder.description} listname={PurchaseOrder.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

PurchaseOrder.description='Purchase Order';
PurchaseOrder.path='/PurchaseOrder';

export default PurchaseOrder;