import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Image } from 'primereact/image';
import Logo from '../assets/images/Logo.png';
import { Button } from 'primereact/button';

const Signup = ({ hide , setVisibleSignup, setVisibleLogin, toast }) => {
    //Signup fields
    const [signupName, setSignupName] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupRePassword, setSignupRePassword] = useState('');

    const handleSignup = () => {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        // Validate fields
        if (signupName === '' || signupUsername === '' || signupEmail === '' || signupPassword === '' || signupRePassword === '') {
            toast.current.show({severity:'error', summary: 'Error', detail:'All fields are required', life: 5000});
            return;
        }
        if(!passwordRegex.test(signupPassword)){
            toast.current.show({severity:'error', summary: 'Error', detail:'Password must contain at least 8 characters, one uppercase letter, one number and one special character', life: 5000});
            return;
        }
        if (!emailRegex.test(signupEmail)) {
            toast.current.show({severity:'error', summary: 'Error', detail:'Invalid email address', life: 5000});
            return;
        }
        if (signupPassword !== signupRePassword) {
            toast.current.show({severity:'error', summary: 'Error', detail:'Passwords do not match', life: 5000});
            return;
        }

        //All fields are valid, create a new user
        fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username: signupUsername, name: signupName, email: signupEmail, password: signupPassword})
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Username already exists.');
                } else {
                    throw new Error('Network response was not ok.');
                }
            }
            return response.json();  // Proceed to parse JSON if response is OK
        })    
        .then(data => {
            // console.log(data);
            toast.current.show({severity:'success', summary: 'Success', detail:'Account created', life: 5000});
            setVisibleSignup(false);  
            setVisibleLogin(true);  
        })
        .catch(error => {
            toast.current.show({severity:'error', summary: 'Error', detail:error.message, life: 5000});
            return;
        });
    };

    return(
        <div className="flex flex-column px-8 py-5 gap-4 " style={{ borderRadius: '12px' }}>
        <Image src={Logo} width="75" height="75" className="block mx-auto Logo" />
        <p className="TitleInDialog close-spacing">Guitar Enthusiast</p>
        <p className="TitleInDialog close-spacing">Signup</p>
        <div className="inline-flex flex-row gap-2 align-items-center">
            <table className="signUpTable">
                <tbody>
                    <tr> 
                        <td>                        
                            <label htmlFor="SignUpName" className="text-primary-50 font-semibold">
                                Name: 
                            </label>
                        </td>
                        <td>
                            <InputText id="SignUpName" label="Username" onChange={(e)=>setSignupName(e.target.value)} > </InputText>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="SignUpUsername" className="text-primary-50 font-semibold">
                                Username:
                            </label>
                        </td>
                        <td>
                            <InputText id="SignUpUsername" label="Username"  onChange={(e)=>setSignupUsername(e.target.value)}></InputText>
                        </td>
                    </tr>
                    <tr>
                        <td> 
                            <label htmlFor="SignUpEmail" className="text-primary-50 font-semibold" >
                                Email:
                            </label>
                        </td>  
                        <td>
                            <InputText id="SignUpEmail" label="Username"  onChange={(e)=>setSignupEmail(e.target.value)}></InputText>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="SignUpPassword" className="text-primary-50 font-semibold" >
                                Password:
                            </label>
                        </td>
                        <td>
                            <InputText id="SignUpPassword" label="Password" onChange={(e)=>setSignupPassword(e.target.value)} type="password"></InputText>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="signUpRePassword" className="text-primary-50 font-semibold" style={{marginRight:'22%'}}>
                                Re-type password:
                            </label>
                        </td>
                        <td>
                            <InputText id="signUpRePassword" label="Password"  onChange={(e)=>setSignupRePassword(e.target.value)} type="password"></InputText>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div className="flex align-items-center gap-2">
            <Button label="Signup" onClick={(e) => handleSignup()} raised severity="success" className="p-2 w-full mr-3 LandingDialogButtons"></Button>
            <Button label="Cancel" onClick={(e) => hide(e)} raised severity="danger" className="p-2 w-full mr-3 LandingDialogButtons"></Button>
        </div>
    </div>
    );
}

export default Signup;