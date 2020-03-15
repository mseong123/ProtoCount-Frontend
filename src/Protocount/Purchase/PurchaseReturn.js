import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function PurchaseReturn(props) {
    return (
            <AppLayout>
                <Process createItemPath='./PurchaseReturnItem' item='purchase_return'
                render={(list)=>{
                    return (
                    <ProcessLayout description={PurchaseReturn.description} listname={PurchaseReturn.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

PurchaseReturn.description='Purchase Return';
PurchaseReturn.path='/PurchaseReturn';

export default PurchaseReturn;