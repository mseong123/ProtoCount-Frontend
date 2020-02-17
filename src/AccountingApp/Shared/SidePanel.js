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
        <aside id={parent} className={'accordion '+ (props.largeScreenStyle? 'd-none': 'd-block') + ' d-md-block py-md-5 bg-dark '+ (props.largeScreenStyle? 'position-sticky vh-100 overflow-auto':'')} style={{top:'0'}}>
            {SubPanelList}
        </aside>
    )
}

export default SidePanel;