import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function CreditNote(props) {
    return (
            <AppLayout>
                <Process createItemPath='./CreditNoteItem' item='CREDIT_NOTE'
                render={(list)=>{
                    return (
                    <ProcessLayout description={CreditNote.description} listname={CreditNote.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

CreditNote.description='Credit Note';
CreditNote.path='/CreditNote';

export default CreditNote;