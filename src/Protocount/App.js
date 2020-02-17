import React,{useState} from 'react';
import {
    BrowserRouter as Router,
    Redirect,
    Switch,
    Route,
} from 'react-router-dom';
import Media from './Shared/Media';
import Main from './Main/Main';
import Login from './Login/Login';
import ComponentSummary from './Shared/ComponentSummary';
import authContext from './Shared/authContext';


function App() {
    //auth default value is false and have to go through Login route when new App is served for first time. See route logic below.
    const [auth,changeAuth]=useState(true);
    
    let appRoutes=[];
    ComponentSummary.forEach(category=>{
        category.process.forEach(component=>
                appRoutes.push(
                (<Route key={component.path} path={component.path} component={component}/>) 
            )
        );
        category.item.forEach(component=>
                appRoutes.push(
                (<Route key={component.path} path={component.path} component={component}/>) 
            )
        );
        category.report.forEach(component=>
                appRoutes.push(
                (<Route key={component.path} path={component.path} component={component}/>) 
            )
        )}
    )
    
    
    return (
    <Router>
        {/*Use Context to pass auth & changeAuth to child components to be changed as required.*/}
        <authContext.Provider value={{auth,changeAuth}}>
        
            <Media render={screenIsSmall=>{
                return (
                    <Switch>
                        {/*When auth is false, render routes and redirect for Login*/}
                        {auth?null:(
                        <Route path='/Login' >
                            <Login/>
                        </Route>)}
                        {auth?null:<Redirect to='/Login'/>}
                        {/*Once auth takes place and auth is true, normal App routes will be rendered*/}
                        {appRoutes}
                        {screenIsSmall? (<Route path='/' render={Main}/>):(<Redirect to='/DashBoard'/>)}
                    </Switch>
                )}}
            />
            
        </authContext.Provider>
     </Router>
    )
}

export default App;
