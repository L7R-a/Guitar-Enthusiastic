import React, { useState } from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputIcon } from 'primereact/inputicon';
import { IconField } from 'primereact/iconfield';
import { Image } from 'primereact/image';
import Logo from './images/Logo.png';
import { useNavigate } from 'react-router-dom';
import { Dialog } from 'primereact/dialog';
import Profile from './Profile';
import RequestForm from './RequestForm.js';

function ToolBar({setIsEmptySearchTextVisible, hideSearch, setSearchResults}) {
    const navigate = useNavigate();  // useNavigate hook for navigation
    const [valueSearch, setValueSearch] = useState(localStorage.getItem('searchText'));
    const [visibleProfile, setVisibleProfile] = useState(false);
    const [visibleRequest, setVisibleRequest] = useState(false);

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            // console.log('Enter key pressed');
            setIsEmptySearchTextVisible(false); 
    
            // Get the current value of the input field
            const value = event.target.value;
            // Store the value in localStorage
            localStorage.setItem('searchText', value);
            setIsEmptySearchTextVisible(false);
    
            // Fetch requests from the server
            fetch(`http://localhost:5000/api/requests/search/${value}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                    return res.json();
                })
            .then((data) => {
                // console.log('Search results:', data);
                setSearchResults(data); // Update state with new search results
                localStorage.setItem('searchResults', data);
            })
            .catch((err) => {
                console.error('Error fetching data:', err);
            });
        }
    };

    const profileHeader = (
        <div className="flex justify-content-center" >
            <span className="TitleInDialog">Profile </span>
        </div>
    );

    const startContent = (
        <React.Fragment>
            <Image src={Logo} width="50" height="50" className='Logo' />
            <IconField iconPosition="left" className="ml-4" hidden={hideSearch}>
                <InputIcon className="pi pi-search"> </InputIcon>
                <InputText 
                    value={valueSearch} 
                    onChange={(e) => setValueSearch(e.target.value)} 
                    placeholder="Search" 
                    onKeyDown={handleKeyDown} 
                />
            </IconField>
        </React.Fragment>
    );
        
    const endContent = (
        <React.Fragment>
            <Button label="Search" className='p-2  mr-3 ButtonsNav' onClick={() => navigate('/Search')} />
            <Button label="Request" className='p-2  mr-3 ButtonsNav' onClick={() => setVisibleRequest(true)} />
            <Button label="Profile" className='p-2  mr-3 ButtonsNav' onClick={() => setVisibleProfile(true)} />
            <Button label="Logout" className='p-2  mr-3 ButtonsNav' onClick={() => handleLogout()} />
        </React.Fragment>
    );
        
    const handleLogout = () => {
        // localStorage.removeItem('user');
        navigate('/');
    };
    
    return(
        <>
            <Toolbar start={startContent} end={endContent} className='toolbar'/>
            <Dialog visible={visibleProfile} className="DialogContainer" modal onHide={() => setVisibleProfile(false)} header={profileHeader} draggable={false} resizable={false}>
                <Profile />
            </Dialog>
            <Dialog visible={visibleRequest} className='DialogContainer' modal onHide={() => setVisibleRequest(false)} content={({ hide }) => (
                <RequestForm setVisibleRequest={setVisibleRequest}></RequestForm>
                )}
            ></Dialog>
        </>
        )

}

export default ToolBar;