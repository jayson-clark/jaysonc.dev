import './App.css';

import firebase from 'firebase/app';

firebase.initializeApp({
    apiKey: "AIzaSyDPaFClETBTNgX_NSF2dmLFN8vtW96VmBM",
    authDomain: "jaysonc-dev.firebaseapp.com",
    projectId: "jaysonc-dev",
    storageBucket: "jaysonc-dev.appspot.com",
    messagingSenderId: "53708482599",
    appId: "1:53708482599:web:d16c45184aa5d05005c602",
    measurementId: "G-BMPERF6LEH"
});

function App() {
    return (
        <div className="App">
            Hello, world!
        </div>
    );
}

export default App;
