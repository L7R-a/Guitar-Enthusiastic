import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Image } from 'primereact/image';
import Logo from '../assets/images/Logo.png';
import { Button } from 'primereact/button';

const Login = ({hide, toast}) => {
    const navigate = useNavigate();
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = () => {
        if (loginUsername === '' || loginPassword === '') {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'All fields are required', life: 5000 });
            return;
        }

        // Fields are not null, login user
        fetch(`http://localhost:5000/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: loginUsername, password: loginPassword })
        })
            .then(response => response.json())
            .then(data => {
                if (data) {
                    localStorage.setItem('user', JSON.stringify(data));
                    localStorage.setItem('searchText', "");
                    navigate('/Search');
                } else {
                    toast.current.show({ severity: 'error', summary: 'Error', detail: 'Invalid username or password', life: 5000 });
                }
            })
            .catch(error => {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Wrong username or password.', life: 5000 });
                return;
            });
    };

    return (
        <div className="flex flex-column px-8 py-5 gap-4" style={{ borderRadius: '12px' }}>
            <Toast ref={toast} />
            <Image src={Logo} width="75" height="75" className="block mx-auto Logo close-spacing" />
            <p className="TitleInDialog close-spacing">Guitar Enthusiast</p>
            <p className="TitleInDialog close-spacing">Login</p>
            <div className="inline-flex flex-row gap-2">
                <label htmlFor="LoginUsername" className="text-primary-50 font-semibold mt-2">
                    Username:
                </label>
                <InputText id="LoginUsername" label="Username" onChange={(e) => setLoginUsername(e.target.value)} />
            </div>
            <div className="inline-flex flex-row gap-2">
                <label htmlFor="LoginPassword" className="text-primary-50 font-semibold mt-2 mr-1">
                    Password:
                </label>
                <InputText id="LoginPassword" type="password" label="Password" onChange={(e) => setLoginPassword(e.target.value)} />
            </div>
            <div className="flex align-items-center">
                <Button label="Login" raised onClick={() => handleLogin()} severity="success" className="p-2 w-full mr-3 LandingDialogButtons"></Button>
                <Button label="Cancel" raised onClick={(e) => hide(e)} severity="danger" className="p-2 w-full mr-3 LandingDialogButtons"></Button>
            </div>
        </div>
    );
};

export default Login;