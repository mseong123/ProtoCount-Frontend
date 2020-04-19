import React from 'react';
import numberFormatParser from './numberFormatParser';
import dateFormatParser from '../Shared/dateFormatParser';
import {useHistory} from 'react-router-dom';

function ReceiptPaymentHistoryRender(props) {
    const docNum=props.dataSelectReceiptPaymentHistory?props.dataSelectReceiptPaymentHistory.field[0].name:null;
    const date=props.dataSelectReceiptPaymentHistory?props.dataSelectReceiptPaymentHistory.field[1].name:null;
    const type=props.dataSelectReceiptPaymentHistory? props.dataSelectReceiptPaymentHistory.field[2].name:null;
    const description=props.dataSelectReceiptPaymentHistory?props.dataSelectReceiptPaymentHistory.field[3].name:null;
    const amount=props.dataSelectReceiptPaymentHistory? props.dataSelectReceiptPaymentHistory.field[4].name:null;

    const history=useHistory();

    function createLink(string,id) {
        var WIPstring=string.split(' ');

        WIPstring=WIPstring.map(string=>{
            return string.toLowerCase()
        })
        WIPstring=WIPstring.map(string=>{
            return string[0].toUpperCase().concat(string.substr(1))
        })

        return WIPstring.join('')+'Item?item='+string.replace(/ /g,'_')+'&id='+encodeURIComponent(id)
    }

    return (
    <fieldset className='form-group col-md-12 mx-3 border border-secondary pb-4 rounded'>
        <legend className='col-form-label col-8 offset-2 text-center' >
            <h6 className='d-inline-block mx-2 mx-md-4'>{props.historyDescription}</h6>
        </legend>
        <div className="overflow-auto">
            {/*flex nowrap and overflow auto for mobile view*/}
            <div className='row flex-nowrap ' style={{marginLeft:0,marginRight:0}}>
                <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>Doc No.</h6>
                <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>Date</h6>
                <h6 className='col' style={{flex:'1 0 200px',paddingLeft:10,paddingRight:10}}>Type</h6>
                <h6 className='col' style={{flex:'1 0 200px',paddingLeft:10,paddingRight:10}}>Description</h6>
                <h6 className='col' style={{flex:'1 0 120px',paddingLeft:10,paddingRight:10}}>Amount</h6>
            </div>
            {props.dataSelectReceiptPaymentHistory? props.dataSelectReceiptPaymentHistory.data.map(item=>
            (<div className='row flex-nowrap' style={props.disabled? {marginLeft:0,marginRight:0}:
            {cursor:'pointer',marginLeft:0,marginRight:0}} key={item[docNum]}
            onClick={(e)=> {
                if (!props.disabled)
                    history.push('./'+createLink(item[type].toLowerCase(),item[docNum]))
            }
                }>
                <p className='col border my-0' style={props.disabled? 
                {flex:'1 0 120px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem',backgroundColor:'#e9ecef'}:
                {flex:'1 0 120px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>
                    {item[docNum]}
                </p>
                <p className='col border my-0' style={props.disabled? 
                {flex:'1 0 120px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem',backgroundColor:'#e9ecef'}:
                {flex:'1 0 120px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>
                    {dateFormatParser(item[date])}
                </p>
                <p className='col border my-0' style={props.disabled? 
                {flex:'1 0 200px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem',backgroundColor:'#e9ecef'}:
                {flex:'1 0 200px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>
                    {item[type]}
                </p>
                <p className='col border my-0 text-truncate' style={props.disabled?
                {flex:'1 0 200px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem',backgroundColor:'#e9ecef'}: 
                {flex:'1 0 200px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>
                    {item[description]}
                </p>
                <p className='col border my-0' style={props.disabled?
                {flex:'1 0 120px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem',backgroundColor:'#e9ecef'}: 
                {flex:'1 0 120px',paddingLeft:10,paddingRight:10,paddingTop:'0.375rem',paddingBottom:'0.375rem'}}>
                    {numberFormatParser(item[amount])}
                </p>
            </div>)
            ):null}
        </div>
    </fieldset>)
}

export default ReceiptPaymentHistoryRender;