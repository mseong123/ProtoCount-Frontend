import React from 'react';

function ItemButton(props) {
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
            {props.changePreview? (
                <button type='button' onClick={(e)=>{
                    props.changePreview(!props.preview);
                    document.querySelector("meta[name=viewport]").setAttribute(
                        'content','width=device-width, initial-scale=0.4');
                }} className='btn btn-info mx-1 my-1'>Preview</button>
            ):null}
        </div>
    )
}

export default ItemButton;