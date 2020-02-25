import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function DebitNote(props) {
    return (
            <AppLayout>
                <Process createItemPath='./DebitNoteItem' item='debit_note'
                render={(list)=>{
                    return (
                    <ProcessLayout description={DebitNote.description} listname={DebitNote.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

DebitNote.description='Debit Note';
DebitNote.path='/DebitNote';

export default DebitNote;