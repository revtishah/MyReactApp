//import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MessageFinder from './MessageFinder';
import NamesMessagesTable from './NamesMessagesTable';
import { Link } from 'react-router-dom';

function App() {
  const apiEndpoint = 'http://localhost:3000';
  return (
    <div className="App">
      <Router>
        <div>
          <h3>React App Demo</h3>
          <Navigation />
          <Routes>
            <Route path="/" element={<MessageFinder />} />
            <Route path="/table" element={<NamesMessagesTable apiEndpoint={apiEndpoint} />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}
function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Message Finder</Link>
        </li>
        <li>
          <Link to="/table">Name and Message Table</Link>
        </li>
      </ul>
    </nav>
  );
}

export default App;
