import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function StockAdjustment(props) {
    return (
            <AppLayout>
                <Process createItemPath='./StockAdjustmentItem' item='stock_adjustment'
                render={(list)=>{
                    return (
                    <ProcessLayout description={StockAdjustment.description} listname={'Stock Adjustment'} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

StockAdjustment.description='Stock Adjustment';
StockAdjustment.path='/StockAdjustment';

export default StockAdjustment;