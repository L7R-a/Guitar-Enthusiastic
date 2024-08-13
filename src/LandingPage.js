import React, { useState, useRef} from "react";
import { Dialog } from 'primereact/dialog';
import { Row, Image, Container } from "react-bootstrap";
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import './LandingPage.css';
import 'primeicons/primeicons.css';
import Logo from './assets/images/Logo.png';
import { Toast } from 'primereact/toast';
import Login from "./components/Login";
import Signup from "./components/Signup";

function LandingPage() {
    const toast = useRef(null);

    //Dialogs components
    const [visibleLeft, setVisibleLeft] = useState(false);
    const [visibleRight, setVisibleRight] = useState(false);
    const [visibleLogin, setVisibleLogin] = useState(false);
    const [visibleSignup, setVisibleSignup] = useState(false);

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
            <Dialog visible={visibleLogin} modal className=" DialogContainer" onHide={() => {if (!visibleLogin) return; setVisibleLogin(false); }}content={({ hide }) => (
                    <Login hide={hide} toast={toast}/>
                )}
            ></Dialog>

            {/* SIGN UP DIALOG */}
            <Dialog
                visible={visibleSignup}
                modal
                className="DialogContainer"
                onHide={() => {if (!visibleSignup) return; setVisibleSignup(false); }}
                content={({ hide }) => (
                   <Signup hide={hide} setVisibleLogin={setVisibleLogin} setVisibleSignup={setVisibleSignup} toast={toast}></Signup>
                )}
            ></Dialog>
        </Container>
    );
}

export default LandingPage;
