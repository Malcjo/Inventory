import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.css';

//Register the service worker for offline capabilities
if('serviceWorker' in navigator){
  window.addEventListener('load', () =>{
    navigator.serviceWorker.register('/service-worker.js').then(
      (registration) =>{
        console.log('Service Worker registered with scope:', registration.scope);

        // check for updates to the service worker
        registration.onupdatefound = () =>{
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if(installingWorker.state === 'installed'){
              if(navigator.serviceWorker.controller){
                //new update available
                console.log('New content is available; please refresh.');
                window.location.reload();
              }else{
                //content is cached for offline use
                console.log('Content is cached for offline use.');
              }
            }
          }
        }
      },
      (error) =>{
        console.log('Service Worker registration failed:', error);
      }
    );
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals


