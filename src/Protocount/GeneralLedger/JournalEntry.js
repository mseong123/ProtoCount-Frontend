import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function JournalEntry(props) {
    return (
            <AppLayout>
                <Process createItemPath='./JournalItem' item='journal'
                render={(list)=>{
                    return (
                    <ProcessLayout description={JournalEntry.description} listname={'Journal'} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

JournalEntry.description='Journal Entry';
JournalEntry.path='/JournalEntry';

export default JournalEntry;