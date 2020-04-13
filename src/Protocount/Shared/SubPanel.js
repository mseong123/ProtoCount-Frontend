import React from 'react';
import {Link} from 'react-router-dom'

function SubPanel (props) {
    let items;
    let reportItems;
    
    items = props.items.map(item=> (
        <Link className='list-group-item list-group-item-action list-group-item-dark' key={item} to={item.replace(/[ _]/g,'')}>{item}</Link>
    ))
    reportItems = props.reportItems.map(item=>(
        <Link className='list-group-item list-group-item-action list-group-item-dark' key={item} to={item.replace(/[ _]/g,'')}>{item}</Link>
    ))

    return (
    <div className='card border-0 bg-dark text-light rounded-0'>
        <div className='card-header' style={{backgroundColor:'rgba(0,0,0,0)'}}>
            <a href={'#'+props.name.replace(/[ ]/g,'-')/*replace nonalphanumeric strings for links to work*/} data-toggle='collapse' className='text-decoration-none text-reset'>
                <h6>
                    {props.name}<img src={props.img} className='ml-3' style={{width:'25px'}} alt={props.name}/>
                </h6>
            </a>
        </div>
        
        <div className='list-group list-group-flush collapse' id={props.name.replace(/[ ]/g,'-')/*replace nonalphanumeric strings for links to work*/ } data-parent={"#"+props.parent}>
            {items}
            {reportItems.length>0? 
                (<a href={'#'+props.name.replace(/[ ]/g,'-')+'-report'} data-toggle='collapse' className='list-group-item bg-secondary text-decoration-none text-reset'>
                    <h6>Report</h6>
                </a>) : null
            }
            <div className='list-group collapse' id={props.name.replace(/[ ]/g,'-')+'-report'}>
                {reportItems}
            </div>
        </div>
        
        
    </div>
    
    )
}

export default SubPanel