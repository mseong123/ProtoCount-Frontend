import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function DeliveryOrder(props) {
    return (
            <AppLayout>
                <Process createItemPath='./DeliveryOrderItem' item='DELIVERY_ORDER'
                render={(list)=>{
                    return (
                    <ProcessLayout description={DeliveryOrder.description} listname={DeliveryOrder.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

DeliveryOrder.description='Delivery Order';
DeliveryOrder.path='/DeliveryOrder';

export default DeliveryOrder;