import logo from './logo.svg';
import LandingPage from './LandingPage.js';
import Search from './Search.js';
import RequestPage from './RequestPage.js';
import './App.css';
import 'primereact/resources/themes/bootstrap4-dark-blue/theme.css';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";// import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
<Router>
      <Routes>
        <Route path="/"  element={<LandingPage />} />
        <Route path="/Search"  element={<Search />} />
        <Route path="/Request/:id" element={<RequestPage/>} />
      </Routes>
    </Router>  );
}

export default App;
