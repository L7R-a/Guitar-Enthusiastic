import React, { useEffect, useState } from "react";
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primeicons/primeicons.css';
import {Card} from 'primereact/card';

function Profile() {
    const [passwordVisible, setPasswordVisible] = useState({});
    const [requests, setRequests] = useState([]);
    const [replies, setReplies] = useState([]);

    //Retrieve user info from localStorage and convert the data to an array
    const personalInfo = JSON.parse(localStorage.getItem('user'));
    const data = Array.isArray(personalInfo) ? personalInfo : [personalInfo];

    // Password variables
    const togglePasswordVisibility = (username) => {
        setPasswordVisible((prevState) => ({
            ...prevState,
            [username]: !prevState[username],
        }));
    };
    const passwordTemplate = (rowData) => {
        const isVisible = passwordVisible[rowData.username];
        return (
            <span onClick={() => togglePasswordVisibility(rowData.username)} style={{ cursor: 'pointer' }}>
                {isVisible ? rowData.password : '••••••••'}
            </span>
        );
    };

    // Date formatting
    const dateTemplate = (rowData) => {
        let date = new Date(rowData.date);
        if(rowData.created_at){
            date = new Date(rowData.created_at);
        }
        else if(rowData.date){
            date = new Date(rowData.date);

        }

        if (isNaN(date)) {
            return 'Invalid Date';
        }
        return date.toLocaleDateString();
    };

    // PDF formatting
    const bodyPDF = (rowData) => (
        <a href={`data:application/pdf;base64,${rowData.pdf}`} download={`reply_.pdf`}>
            Download PDF
        </a>
    );

    // Link formattings
    const bodyLink = (rowData) => (
        <a href={`${process.env.REACT_APP_BASE_URL}${rowData.link}`}>Link</a>
    );
    const bodyLinkReplies = (rowData) => (
        <a href={`${process.env.REACT_APP_BASE_URL}/Request/${rowData.request_id}`}>Link</a>
    );


    // fetch user requests and replies
    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/user/${personalInfo.id}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then((data) => {
                // console.log('User requests:', data);
                setRequests(data);
                
            })
            .catch((err) => {
                console.error('Error fetching data:', err);
            });
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/replies/user/${personalInfo.id}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then((data) => {
                // console.log('User replies:', data);
                setReplies(data);
            })
            .catch((err) => {
                console.error('Error fetching data:', err);
            });
    },[])


    return (
        <TabView >
            <TabPanel header="My Info">     
               <Card className="myInfoCard">
                  <table className="spaced-table">
                        <tbody>
                            <tr>
                                <td>Username:</td>
                                <td>{data[0].username}</td>
                            </tr>
                            <tr>
                                <td>Name:</td>
                                <td>{data[0].name}</td>
                            </tr>
                            <tr>
                                <td>Email:</td>
                                <td>{data[0].email}</td>
                            </tr>
                            <tr>
                                <td>Password:</td>
                                <td>{passwordTemplate(data[0])}</td>
                            </tr>
                            <tr>
                                <td>Joined:</td>
                                <td>{dateTemplate(data[0])}</td>
                            </tr>
                            <tr>
                                <td>Total Contributions:</td>
                                <td>{data[0].repliesNum}</td>
                            </tr>
                            <tr>
                                <td>Total Requests:</td>
                                <td>{data[0].requestsNum}</td>
                            </tr>
                        </tbody>
                    </table>
                </Card>
            </TabPanel>
            <TabPanel header="My Requests">
                    <DataTable value={requests} showGridlines tableStyle={{ minWidth: '50rem', overflow:'auto' }}>
                        <Column field="song" header="Song" style={{ maxWidth:'10vw', overflow: 'auto' }}/>
                        <Column field="artist" header="Artist" style={{ maxWidth:'10vw', overflow: 'auto' }}/>
                        <Column field="comment" header="Comment"  style={{ maxWidth:'40vw', overflow: 'auto' }}/>
                        <Column field="date" header="Date" body={dateTemplate} />
                        <Column field="number_of_replies" header="Replies" />
                        <Column field="link" header="Link" body={bodyLink}/>
                    </DataTable>
            </TabPanel>
            <TabPanel header="My Replies">
                    <DataTable value={replies} showGridlines tableStyle={{ minWidth: '50rem' }}>
                        <Column field="song" header="Song" style={{ maxWidth:'10vw', overflow: 'auto' }}/>
                        <Column field="artist" header="Artist" style={{ maxWidth:'10vw', overflow: 'auto' }}/>
                        <Column field="comment" header="Comment" style={{ maxWidth:'40vw', overflow: 'auto' }}  />
                        <Column field="date" header="Date" body={dateTemplate} />
                        <Column field="pdf" header="PDF" body={bodyPDF} />
                        <Column field="link" header="Link" body={bodyLinkReplies}/>
                    </DataTable>
            </TabPanel>
        </TabView>
    );
}

export default Profile;
