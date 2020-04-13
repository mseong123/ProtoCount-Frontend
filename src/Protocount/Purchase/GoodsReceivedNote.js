import React from 'react';
import AppLayout from '../Shared/AppLayout';
import Process from '../Shared/Process';
import ProcessLayout from '../Shared/ProcessLayout';

function GoodsReceivedNote(props) {
    return (
            <AppLayout>
                <Process createItemPath='./GoodsReceivedNoteItem' item='goods_received_note'
                render={(list)=>{
                    return (
                    <ProcessLayout description='Goods Received Note (GRN)' listname={GoodsReceivedNote.description} {...list}/>
                    )}
                }/>
            </AppLayout>
    )
}
                
            

GoodsReceivedNote.description='Goods Received Note';
GoodsReceivedNote.path='/GoodsReceivedNote';

export default GoodsReceivedNote;