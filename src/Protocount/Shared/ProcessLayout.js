import React from 'react';

function ProcessLayout(props) {
    return (
                <div className='container py-2'>
                    <h3>{props.description}</h3>
                    <button className='btn btn-primary mr-3' onClick={()=>props.onItemClick()}>Create New Item</button>
                    <form className='form-inline my-3'>
                            <label htmlFor='search'>Find Item</label>
                            <input type='text' onChange={(e)=>props.searchChange(e)} id='search' placeholder='Search...' className='form-control mx-sm-3' value={props.search}/>
                            <label htmlFor='search-criteria' className='mt-2 mt-md-0'>Search Criteria</label>
                            <select className='form-control mx-sm-3' value={props.searchCriteria} onChange={props.searchCriteriaChange}>
                                <option value=''> -select an option- </option>
                                {props.searchCriteriaList}
                            </select>
                            <small className='text-muted form-text mt-3 mt-md-0'>Search is CASE SENSITIVE</small>
                    </form>
                    <h5>{'List of '+props.listname}
                    </h5>
                    <div className='mb-3'>
                        <button className='btn btn-outline-info mr-2' onClick={props.refresh}>Refresh</button>
                        <button className='btn btn-danger' onClick={(e)=>{
                        if(!props.itemsToBeDeleted.length)
                            alert('No items selected!')
                        else 
                            props.deleteList()
                        }}>Delete
                        </button>
                    </div>
                    
                    {props.errorDeleteDisplay}
                    {props.result}
                </div>
    )
}

export default ProcessLayout;