import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function CreditorMaintenance(props) {
    return (
            <AppLayout>
                <Process createItemPath='./CreditorItem' item='creditor'
                render={(list)=>{
                    return (
                    <ProcessLayout description={CreditorMaintenance.description} listname={'Creditor'} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

CreditorMaintenance.description='Creditor Maintenance';
CreditorMaintenance.path='/CreditorMaintenance';

export default CreditorMaintenance;