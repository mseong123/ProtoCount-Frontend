import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function PurchaseDebitNote(props) {
    return (
            <AppLayout>
                <Process createItemPath='./PurchaseDebitNoteItem' item='PURCHASE_DEBIT_NOTE' 
                render={(list)=>{
                    return (
                    <ProcessLayout description={PurchaseDebitNote.description} listname={PurchaseDebitNote.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

PurchaseDebitNote.description='Purchase Debit Note';
PurchaseDebitNote.path='/PurchaseDebitNote';

export default PurchaseDebitNote;