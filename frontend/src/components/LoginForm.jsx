import { useState } from 'react';

export const LoginForm = ({ onLogin, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        onLogin({ email, password });
    };

    return (
        <form className='login-form' onSubmit={handleSubmit}>
            <h2 className='login-header'>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input className='auth-input' placeholder='Email' type="email" value={email} 
                onChange={e => setEmail(e.target.value)} required />
            <input className='auth-input' placeholder='Password' type="password" value={password} 
                onChange={e => setPassword(e.target.value)} required />
            <button className='auth-btn' type="submit">Login</button>
        </form>
    );
};