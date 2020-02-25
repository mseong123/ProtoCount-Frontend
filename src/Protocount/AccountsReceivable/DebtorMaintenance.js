import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function DebtorMaintenance(props) {
    return (
            <AppLayout>
                <Process createItemPath='./DebtorItem' item='debtor'
                render={(list)=>{
                    return (
                    <ProcessLayout description={DebtorMaintenance.description} listname={'Debtor'} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

DebtorMaintenance.description='Debtor Maintenance';
DebtorMaintenance.path='/DebtorMaintenance';

export default DebtorMaintenance;