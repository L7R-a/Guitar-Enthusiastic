import React, { useState, useRef} from "react";
import { Dialog } from 'primereact/dialog';
import { Row, Image, Container } from "react-bootstrap";
import { Toolbar } from 'primereact/toolbar';
import { useNavigate } from "react-router-dom";
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import './LandingPage.css';
import 'primeicons/primeicons.css';
import Logo from './images/Logo.png';
import { Toast } from 'primereact/toast';


function LandingPage() {
    const navigate = useNavigate();  // useNavigate hook for navigation
    const toast = useRef(null);

    //Dialogs components
    const [visibleLeft, setVisibleLeft] = useState(false);
    const [visibleRight, setVisibleRight] = useState(false);
    const [visibleLogin, setVisibleLogin] = useState(false);
    const [visibleSignup, setVisibleSignup] = useState(false);

    //Signup fields
    const [signupName, setSignupName] = useState('');
    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupRePassword, setSignupRePassword] = useState('');

    //Login fields
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    //Dialog functions
    const showLeftDialog = () => {setVisibleLeft(true);};
    const showRightDialog = () => { setVisibleRight(true);};

    //Toolbar components
    const startContent = (
        <React.Fragment>
            <Image src={Logo} width="50" height="50" className='Logo' />
        </React.Fragment>
    );
    const endContent = (
        <React.Fragment>
            <Button label="Login" className='ButtonsNav'  onClick={() => setVisibleLogin(true)} />
            <Button label="Signup" className='ButtonsNav' onClick={() => setVisibleSignup(true)} />
        </React.Fragment>
    );


    const handleLogin = () => {
        if (loginUsername === '' || loginPassword === '') {
            toast.current.show({severity:'error', summary: 'Error', detail:'All fields are required', life: 5000});
            return;
        }

        //Fileds are not null, login user
        fetch(`http://localhost:5000/api/users/${loginUsername}/${loginPassword}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
                // console.log(data);
            if(data){
                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('searchText', "");
                navigate('/Search');
            } 
            else {
                toast.current.show({severity:'error', summary: 'Error', detail:'Invalid username or password', life: 5000});
            }
        })
        .catch(error => {
            // console.error('There was an error logging in!', error);
            toast.current.show({severity:'error', summary: 'Error', detail:'Wrong username or password.', life: 5000});
            return;
        });

    };

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
            setVisibleSignup(false);  
            setVisibleLogin(true);  
            toast.current.show({severity:'success', summary: 'Success', detail:'Account created', life: 5000});
        })
        .catch(error => {
            toast.current.show({severity:'error', summary: 'Error', detail:error.message, life: 5000});
            return;
        });
    };

    return (
        <Container fluid className="main-container">
            <Toolbar start={startContent} end={endContent} className="toolbar"/>
            <Toast ref={toast} />
            <Row className="centerContent">
                <p className="LandingTitle">Guitar Enthusiast</p>
                <Image src={Logo} width="350" height="350" className='LandingLogo' />
                <p className="LandingTitle">Now Its Just Practice</p>
                <div className="flex flex-wrap justify-content-center gap-2 mb-2">
                    <Button label="Our Mission" onClick={showLeftDialog} className="p-button-help LandingButtons" size="large"/>
                    <Button label="About me" onClick={showRightDialog} className="p-button-help LandingButtons" size="large"/>
                </div>
                <h3 className="copyrightText">© 2024 Guitar Enthusiast. All rights reserved.</h3>
            </Row>
            {/* MISSION DIALOG */}
            <Dialog className="LandingCards" header="Our Mission" visible={visibleLeft} position="left" style={{ width: '35vw' }} onHide={() => setVisibleLeft(false)} draggable={false} resizable={false}>
                <p>Have you ever wanted to play a song on the guitar but couldn't find a place to learn it in your style?</p>
                <p>If so, this website is perfect for you!</p>
                <p>At Guitar Enthusiast, you can request the sheet music for any song you can't find in your preferred style.</p>
                <p>Our community will assist you by providing PDF tabs that show how they would play the song the way you want.</p>
                <p>Anyone can request and share tablatures, as well as view those from others.</p>
            </Dialog>
            
            {/* ABOUT ME DIALOG */}
            <Dialog className="LandingCards" header="About Me" visible={visibleRight} position="right" style={{ width: '35vw' }} onHide={() => setVisibleRight(false)} draggable={false} resizable={false}>
                <p>Welcome to Guitar Enthusiast! I'm the developer behind this project, passionate about bringing musicians together to share and learn guitar music.</p>
                <p>The purpose of this website is to expand my knowledge in full-stack development while working on a project I'm passionate about.</p>
                <p>Thank you for being part of Guitar Enthusiast, and I hope you enjoy your experience here!</p>
            </Dialog>

            {/* LOG IN DIALOG */}
            <Dialog
                visible={visibleLogin}
                modal
                className=" DialogContainer"
                onHide={() => {if (!visibleLogin) return; setVisibleLogin(false); }}
                content={({ hide }) => (
                    <div className="flex flex-column px-8 py-5 gap-4" style={{ borderRadius: '12px' }}>
                        <Image src={Logo} width="75" height="75" className="block mx-auto Logo close-spacing" />
                        <p className="TitleInDialog close-spacing">Guitar Enthusiast</p>
                        <p className="TitleInDialog close-spacing">Login</p>
                        <div className="inline-flex flex-row gap-2">
                            <label htmlFor="LoginUsername" className="text-primary-50 font-semibold mt-2">
                                Username:
                            </label>
                            <InputText id="LoginUsername" label="Username" onChange={(e) => setLoginUsername(e.target.value)}></InputText>
                        </div>
                        <div className="inline-flex flex-row gap-2">
                            <label htmlFor="LoginPassword" className="text-primary-50 font-semibold mt-2 mr-1">
                                Password:
                            </label>
                            <InputText id="LoginPassword" label="Password" onChange={(e) => setLoginPassword(e.target.value)} type="password"></InputText>
                        </div>
                        <div className="flex align-items-center">
                            <Button label="Login" raised onClick={() => handleLogin()} severity="success" className="p-2 w-full mr-3 LandingDialogButtons"></Button>
                            <Button label="Cancel" raised onClick={(e) => hide(e)} severity="danger" className="p-2 w-full mr-3 LandingDialogButtons"></Button>
                        </div>
                    </div>
                )}
            ></Dialog>

            {/* SIGN UP DIALOG */}
            <Dialog
                visible={visibleSignup}
                modal
                className="DialogContainer"
                onHide={() => {if (!visibleSignup) return; setVisibleSignup(false); }}
                content={({ hide }) => (
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
                )}
            ></Dialog>
        </Container>
    );
}

export default LandingPage;
