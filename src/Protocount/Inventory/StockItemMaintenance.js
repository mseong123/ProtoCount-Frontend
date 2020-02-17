import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function StockItemMaintenance(props) {
    return (
            <AppLayout>
                <Process createItemPath='./StockItem' item='STOCK'
                render={(list)=>{
                    return (
                    <ProcessLayout description={StockItemMaintenance.description} listname={'Stock Item'} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

StockItemMaintenance.description='Stock Item Maintenance';
StockItemMaintenance.path='/StockItemMaintenance';

export default StockItemMaintenance;