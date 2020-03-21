import React from 'react';
import ReactDOM from 'react-dom';
import App from './Protocount/App';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import '@fortawesome/fontawesome-free/css/all.css'

document.querySelector("meta[name=viewport]").setAttribute(
    'content','width=device-width, initial-scale=1.0');


ReactDOM.render(<App/>, document.getElementById('root'))