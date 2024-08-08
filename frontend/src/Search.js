import React, { useEffect } from 'react';
import 'primeicons/primeicons.css';
import { Row, Container } from "react-bootstrap";
import ToolBar from './components/ToolBar.js';
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import { FaUser, FaMusic, FaMicrophone} from 'react-icons/fa';

function Search() {
    const [isEmptySearchTextVisible, setIsEmptySearchTextVisible] = React.useState(true); //Check if the user has entered a search text
    const [searchResults, setSearchResults] = React.useState([]); // State variable to store search results

    useEffect(() => {
        // Retrieve the search text from localStorage
        const searchText = localStorage.getItem('searchText');
        
        // If there's saved search text, it means the search bar isn't empty. Fetch the search results
        if (searchText) { 
          setIsEmptySearchTextVisible(false);
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/requests/search/${searchText}`)
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
        // console.log('Search text:', searchResults);

      }, []);        

    return (
        <Container fluid className="main-container">
            <ToolBar setIsEmptySearchTextVisible={setIsEmptySearchTextVisible} hideSearch={false} setSearchResults={setSearchResults}/>
                {isEmptySearchTextVisible && (
                    <p className="emptySearchText">Search for a song with the search bar!</p>
                )}
                {searchResults.length === 0 && !isEmptySearchTextVisible && (
                    <p className="emptySearchText">No results found!</p>
                )}
                {/* Render the list of links only if isEmptySearchTextVisible is false */}
                {!isEmptySearchTextVisible && (
                <Row className='mr-4'>
                    <ul className='noBullets'>
                        {searchResults.map((link, index) => (
                            <li key={index} className='searchText'>
                                <Link to={link.link}>
                                    <div className="searchItemContainer">
                                        <Card className="requestCard">
                                            <Card.Header className="requestCardHeader">
                                                <FaUser className="icon" /> <span className="headerText">User: {link.user}</span>
                                            </Card.Header>
                                            <Card.Body className="requestCardBody">
                                                <p className="requestText"><FaMusic className="icon mr-3" /> Song: {link.song}</p>
                                                <p className="requestText"><FaMicrophone className="icon mr-3" /> Artist: {link.artist}</p>
                                            </Card.Body>
                                        </Card>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Row>
                )}
        </Container>
    );
}

export default Search;