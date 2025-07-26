import "./App.css"
import { useState, useEffect } from 'react';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    
    const handleChange = (event) => {
        setUsername(event.target.value);
    };

    return (
    <div>
      <label htmlFor="myInput">Enter Text:</label>
        <input
            type="text"
            id="myInput"
            value={username}
            onChange={handleChange}
            />
            <p>Current input: {inputText}</p>
        </div>
    );
}

export default Login