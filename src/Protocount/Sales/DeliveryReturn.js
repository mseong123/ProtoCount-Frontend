import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function DeliveryReturn(props) {
    return (
            <AppLayout>
                <Process createItemPath='./DeliveryReturnItem' item='delivery_return'
                render={(list)=>{
                    return (
                    <ProcessLayout description={DeliveryReturn.description} listname={DeliveryReturn.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

DeliveryReturn.description='Delivery Return';
DeliveryReturn.path='/DeliveryReturn';

export default DeliveryReturn;