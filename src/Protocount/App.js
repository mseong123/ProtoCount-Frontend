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
import isLoadingContext from './Shared/isLoadingContext';



function App() {
    //auth default value is false and have to go through Login route when new App is served for first time. See route logic below.
    const [auth,changeAuth]=useState(false);
    /*isLoading default value is false, when useFetch is called, will change to true and once fetch promise resolved/rejected, 
    will change to false again.*/
    const [isLoading,changeIsLoading]=useState(false);

    
    
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
        <isLoadingContext.Provider value={{isLoading,changeIsLoading}}>
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
        </isLoadingContext.Provider>
        </authContext.Provider>
     </Router>
    )
}

export default App;
