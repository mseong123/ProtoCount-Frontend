import React from 'react';
import SubPanel from './SubPanel';
import ComponentSummary from './ComponentSummary';


function SidePanel(props) {
    //parent id wrapper for accordion to work as per Bootstrap
    const parent='accordion';
    const SubPanelList=ComponentSummary.map(category=>{
        let SubPanelListItems=[]
        let SubPanelListReportItems=[]
        
        category.process.forEach(component=>
            SubPanelListItems.push(component.description)
            )
        category.report.forEach(component=>
            SubPanelListReportItems.push(component.description)
            )
        
        return (
            <SubPanel key={category.name} name={category.name} img={category.svg} parent={parent}
            items={SubPanelListItems} reportItems={SubPanelListReportItems}/>
            )
        }
    )

    return (
        <aside id={parent} className={'accordion '+ (props.largeScreenStyle? 'd-none': 'd-block') + ' d-md-block bg-dark '+ (props.largeScreenStyle? 'position-sticky vh-100 overflow-auto':'')} style={{top:'0'}}>
            <h2 className="text-warning d-none d-md-block " style={{padding:"0.75rem 1.25rem"}}>Accounting <span className='text-info'>Software </span><small className='text-light d-block' style={{fontSize:'40%'}}>@coded by Mseong</small></h2>
            <h4 className="text-warning d-md-none" style={{padding:"0.75rem 1.25rem"}}>Accounting <span className='text-info'>Software </span><small className='text-light d-block' style={{fontSize:'40%'}}>@coded by Mseong</small></h4>
            {SubPanelList}
            
        </aside>
    )
}

export default SidePanel;