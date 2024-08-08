import React, { useState, useRef } from "react";
import { Image } from "react-bootstrap";
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import 'primeicons/primeicons.css';
import Logo from '../assets/images/Logo.png';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputText } from 'primereact/inputtext';
import { v4 as uuidv4 } from 'uuid';
import { Toast } from 'primereact/toast';

function RequestForm({setVisibleRequest}) {
    const toast = useRef(null);
    const navigate = useNavigate();  // useNavigate hook for navigation
    const [song, setSong] = useState('');
    const [artist, setArtist] = useState('');
    const [comment, setComment] = useState('');

    const handleRequest = async (e) => {
      if(song === '' || artist === '') {
       toast.current.show({severity: 'error', summary: 'Error', detail: 'Please fill out song and artist fields', life: 5000});
       return;
      }

      //Input is valid, create new request
      const id = uuidv4();  // Generate UUID
      const link = `/Request/${id}`;
      const user = JSON.parse(localStorage.getItem('user')).username;
      const userId = JSON.parse(localStorage.getItem('user')).id;
      const newRequest = {
        id,
        user,
        song,
        artist,
        comment,
        link,
        userId
      };
    
      try {
        // Call API to add new request
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newRequest)
        });
    
        if (response.ok) {
          // console.log(response);

          //Call API to update requestNum from user in database
          await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          //Update user requestsNum in localStorage
          var userUpdate = JSON.parse(localStorage.getItem('user'));
          userUpdate.requestsNum += 1;
          localStorage.setItem('user', JSON.stringify(userUpdate));

          navigate(link);
        } else {
          console.error('Failed to add request');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    return (
        <div className="flex flex-column px-8 py-5 gap-4 " style={{ borderRadius: '12px'}}>
          <Toast ref={toast} />
          <Image src={Logo} width="75" height="75" className="block mx-auto Logo close-spacing" />
          <p className="TitleInDialog close-spacing">Guitar Enthusiast</p>
          <p className="TitleInDialog close-spacing" style={{fontSize:'x-large'}}>Request a song!</p>
          <div className="inline-flex flex-column gap-2">
              <label htmlFor="username" className="text-primary-50 font-semibold">
                  Song:
              </label>
              <InputText id="song" label="Username" className="bg-white-alpha-20 border-none p-3 text-primary-50" onChange={(e)=>setSong(e.target.value)}></InputText>
          </div>
          <div className="inline-flex flex-column gap-2">
              <label htmlFor="username" className="text-primary-50 font-semibold">
                  Artist:
              </label>
              <InputText id="username" label="Username" className="bg-white-alpha-20 border-none p-3 text-primary-50" onChange={(e)=>setArtist(e.target.value)}></InputText>
          </div>
          <div className="inline-flex flex-column gap-2">
              <label htmlFor="username" className="text-primary-50 font-semibold">
                  Additional Comments:
              </label>
              <InputTextarea autoResize rows={5} cols={30} onChange={(e)=>setComment(e.target.value)}/>
          </div>
          <div className="flex align-items-center gap-2">
              <Button data-testid="request-buttonF" label="Request" raised onClick={() => handleRequest()}  severity="success" className="p-2 w-full mr-3 DialogButtons"></Button>
              <Button label="Cancel" raised onClick={(e) => setVisibleRequest(false)}  severity="danger" className="p-2 w-full mr-3 DialogButtons"></Button>
          </div>
    </div>
    );
}

export default RequestForm;
