import { useState } from 'react';

export const RegisterForm = ({ onRegister, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        onRegister({ email, password });
    };

    return (
        <form className='login-form' onSubmit={handleSubmit}>
            <h2 className='login-header'>Register</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <input className='auth-input' placeholder='Email' type="email" value={email} 
                onChange={e => setEmail(e.target.value)} required />
            <input className='auth-input' placeholder='Password' type="password" value={password} 
                onChange={e => setPassword(e.target.value)} required />
            <button className='auth-btn' type="submit">Register</button>
        </form>
    );
};