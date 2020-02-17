import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function PurchaseCreditNote(props) {
    return (
            <AppLayout>
                <Process createItemPath='./PurchaseCreditNoteItem' item='PURCHASE_CREDIT_NOTE' 
                render={(list)=>{
                    return (
                    <ProcessLayout description={PurchaseCreditNote.description} listname={PurchaseCreditNote.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

PurchaseCreditNote.description='Purchase Credit Note';
PurchaseCreditNote.path='/PurchaseCreditNote';

export default PurchaseCreditNote;