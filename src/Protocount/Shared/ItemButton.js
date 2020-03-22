import React from 'react';
import {useHistory} from 'react-router-dom';

function ItemButton(props) {
    const history=useHistory();

    return (
        <div>
            <button type='submit' className='btn btn-primary mx-1 my-1'>Submit</button>
            {/*If state is 'INSERT', no Edit button & Delete button*/}
            {props.usage==='UPDATE/DELETE'?(
                <button type='button' onClick={(e)=>{props.changeDisabled(false)}} className='btn btn-outline-primary mx-1 my-1'>Edit</button>
            ):null}
            {props.usage==='UPDATE/DELETE'?(
                <button type='button' onClick={(e)=>{props.onDelete()}} className='btn btn-danger mx-1 my-1'>Delete</button>
            ):null}
            {props.path? (
                <button type='button' onClick={(e)=>{
                    document.querySelector("meta[name=viewport]").setAttribute(
                        'content','width=device-width, initial-scale=0.5');
                    history.push(props.path)
                }} className='btn btn-info mx-1 my-1'>Preview</button>
            ):null}
        </div>
    )
}

export default ItemButton;