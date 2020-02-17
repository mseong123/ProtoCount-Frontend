import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function BankMaintenance(props) {
    return (
            <AppLayout>
                <Process createItemPath='./BankItem' item='BANK'
                render={(list)=>{
                    return (
                    <ProcessLayout description={BankMaintenance.description} listname={'Bank'} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

BankMaintenance.description='Bank Maintenance';
BankMaintenance.path='/BankMaintenance';

export default BankMaintenance;