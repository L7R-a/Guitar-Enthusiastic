import React, { useState, useRef, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Container, Row, Card } from 'react-bootstrap';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import 'primeicons/primeicons.css';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Tooltip } from 'primereact/tooltip';
import ToolBar from './components/ToolBar.js';
import { InputTextarea } from 'primereact/inputtextarea';
import { FaUser, FaMusic, FaMicrophone, FaCommentDots, FaCalendarAlt,FaFilePdf } from 'react-icons/fa';

function RequestPage() {
    // Retrieve user info from localStorage
    const personalInfo = JSON.parse(localStorage.getItem('user'));

    // Refs for toast and file upload
    const toast = useRef(null);
    const fileUploadRef = useRef(null);
    
    //Values to be stored in the database
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [replies, setReplies] = useState([]); 
    const [comment, setComment] = useState(''); 

    // File upload states
    const [showFileUpload, setShowFileUpload] = useState(false);
    const [totalSize, setTotalSize] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [selectedFile, setSelectedFile] = useState(null); 

    useEffect(() => {
        // Fetch the request details based on the ID request
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/${id}`)
        .then(response => response.json())
        .then(data => {setRequest(data); 
            setLoading(false); // Data loaded  
        })
        .catch(error =>{ console.error('Error fetching request:', error);
            setError('Failed to fetch request details.');
            setLoading(false); // Done loading
        });
        // Fetch the replies based on the ID request
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/replies/${id}`)
        .then(response => response.json())
        .then(data => setReplies(data))
        .catch(error => console.error('Error fetching replies:', error));

    }, [id]);

    const onUpload = () => {
        if (!selectedFile) {
            toast.current.show({ severity: 'error', summary: 'No file selected', detail: 'Please select a file to upload', life: 4000 });
            return;
        }
    
        // Create form data to send to the server
        const formData = new FormData();
        formData.append('request_id', id);
        formData.append('username', personalInfo.username); // Replace with actual username
        formData.append('comment', comment);
        formData.append('pdf', selectedFile);
        formData.append('userId', personalInfo.id);
        formData.append('song', request.song);
        formData.append('artist', request.artist);
    
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/replies/`, {
            method: 'POST',
            body: formData
        })
        .then(async response => {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }
            return response.json();
        })
        .then(data => {
            //Call API to update user's repliesNum in database
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/users/replies/${ personalInfo.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }
            });
            //Call API to update number_of_replies of the request in database
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }
          });

            //Update user repliesNum in localStorage
            var userUpdate = JSON.parse(localStorage.getItem('user'));
            userUpdate.repliesNum += 1;
            localStorage.setItem('user', JSON.stringify(userUpdate));

            toast.current.show({ severity: 'success', summary: 'Reply Upload Success', detail: 'Please refresh the page', life: 4000 });
            setShowFileUpload(false);
        })
        .catch(error => {
            console.error('Error uploading reply:', error);
            toast.current.show({ severity: 'error', summary: 'Upload Failed', detail: 'Failed to upload reply', life: 4000 });
        });
    };

    const onTemplateSelect = (e) => {
        let _totalSize = totalSize;
        let files = e.files;
        // Check if all files are PDFs
        for (let file of files) {
            if (file.type !== 'application/pdf') {
                toast.current.show({ severity: 'error', summary: 'Invalid File Type', detail: 'Only PDF files are allowed', life: 3000 });
                fileUploadRef.current.clear();
                return;
            }
        }
        Object.keys(files).forEach((key) => {
            _totalSize += files[key].size || 0;
        });

        setSelectedFile(files[0]);
        setTotalSize(_totalSize);
    };

    const onTemplateUpload = (e) => {
        onUpload();
    };

    const onTemplateRemove = (file, callback) => {
        setTotalSize(totalSize - file.size);
        setSelectedFile(null);
        callback();
    };

    const onTemplateClear = () => {
        setTotalSize(0);
        setSelectedFile(null);
    };

    const headerTemplate = (options) => {
        const { className, chooseButton} = options;
        const value = totalSize / 10000;
        const formatedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{formatedValue} / 1 MB</span>
                    <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
                </div>
            </div>
        );
    };

    const itemTemplate = (file, props) => {
        return (
            <div className="flex align-items-center flex-wrap">
                <div className="flex align-items-center" style={{ width: '40%' }}>
                    <img alt={file.name} role="presentation" src={file.objectURL} width={100} />
                    <span className="flex flex-column text-left ml-3">
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>
                <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
                <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => onTemplateRemove(file, props.onRemove)} />
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-image mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Drag and Drop PDF Here
                </span>
            </div>
        );
    };

    // Clear the comment and file upload states when the upload dialog is closed
    const handleDialogHide = () => {
        setComment('');
        setTotalSize(0);
        setSelectedFile(null);
        setShowFileUpload(false);
    };

    // Tooltip for the file upload dialog
    const chooseOptions = { icon: 'pi pi-fw pi-file-pdf', iconOnly: true, className: 'custom-choose-btn p-button-rounded p-button-outlined' };
    
    // Render loading, error, or content based on the state
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!request) {
        return <div>No request found.</div>;
    }

    return (
        <Container fluid className="main-containerRequest">
            <Toast ref={toast}></Toast>
            <ToolBar hideSearch={true} />

            {/* Upload file dialog */}
            <Dialog header={<span className="TitleInDialog ">Upload PDF File</span>} visible={showFileUpload} modal onHide={handleDialogHide} draggable={false}>
                <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
                <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
                <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />
                <FileUpload ref={fileUploadRef} name="demo[]" accept="application/pdf" maxFileSize={1000000}
                    onSelect={onTemplateSelect} onUpload={onTemplateUpload} onError={onTemplateClear} onClear={onTemplateClear}
                    headerTemplate={headerTemplate} itemTemplate={itemTemplate} emptyTemplate={emptyTemplate}
                    chooseOptions={chooseOptions}/>
                <div className="inline-flex flex-column gap-2">
                    <label htmlFor="comment" className="requestText mt-4" style={{fontSize:"large"}}>
                        Additional Comments:
                    </label>
                    <InputTextarea autoResize value={comment} onChange={(e) => setComment(e.target.value)} rows={5} cols={100} style={{ width: '100%' }} />
                </div>
                <div className="flex align-items-center mt-4">
                    <Button label="Submit" raised  onClick={onUpload} severity="success" className="p-2  mr-3 DialogButtons"></Button>
                    <Button label="Cancel" raised onClick={handleDialogHide} severity="danger" className="p-2  mr-3 DialogButtons"></Button>                    </div>
            </Dialog>

            <Row className="centerRequest mb-5">
                <Card className="requestCard">
                    <Card.Header className="requestCardHeader">
                    <FaUser className="icon" /> <span className="headerText">User: {request.user}</span>
                    </Card.Header>
                    <Card.Body className="requestCardBody">
                        <p className="requestText"><FaMusic className="icon" /> Song: {request.song}</p>
                        <p className="requestText"><FaMicrophone className="icon" /> Artist: {request.artist}</p>
                        <p className="requestText"><FaCommentDots className="icon" /> Comment:</p>
                        <p className="requestsubText">{request.comment}</p>
                        <p className="requestDate"><FaCalendarAlt className="icon" /> Posted: {new Date(request.date).toLocaleDateString()}</p>
                    </Card.Body>
                </Card>
                    <Button label="Reply" severity="help"raised onClick={() => setShowFileUpload(true)} className="p-2  mr-3 DialogButtons"></Button>
            </Row>
            <Row className="requestContainer">    
                <p className="requestText">
                    Replies ({replies.length})
                </p>
                {replies.map((reply, index) => (
                    <Card className="requestCard">
                        <Card.Header className="requestCardHeader">
                            <FaUser className="icon" /> <span className="headerText">User: {reply.username}</span>
                        </Card.Header>
                        <Card.Body className="requestCardBody">
                            {reply.pdf && (
                                <p className="requestText">
                                    <FaFilePdf className="icon" /> 
                                    <a href={`data:application/pdf;base64,${reply.pdf}`} download={`reply_${index}.pdf`}>
                                        Download PDF
                                    </a>
                                </p>
                            )}
                            <p className="requestText"><FaCommentDots className="icon" /> Comment:</p>
                            <p className="requestsubText">{reply.comment}</p>
                            <p className="requestDate"><FaCalendarAlt className="icon" /> Posted: {new Date(reply.date).toLocaleDateString()}</p>
                        </Card.Body>
                    </Card>
                ))}
            </Row>
        </Container>
    );
}

export default RequestPage;
