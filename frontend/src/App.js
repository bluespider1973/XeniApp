import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

import './App.css';

import AuthService from './services/auth.service';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChangePassword from './components/Auth/ChangePassword';
import Deregister from './components/Auth/Deregister';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyEmail from './components/Auth/VerifyEmail';
import Home from './components/Home';
import Profile from "./components/User/Profile";
import BoardUser from "./components/User/BoardUser";
import BoardModerator from "./components/User/BoardModerator";
import BoardAdmin from "./components/User/BoardAdmin";
import AddTokens from "./components/User/Admin/AddTokens";
import ExecuteService from "./components/Service/ExecuteService";
import NoMatch from './components/NoMatch';

import authService from './services/auth.service';
// image
import UploadImage from './components/Service/Image/UploadImage';
import EditImage from './components/Service/Image/EditImage';
// ppt
import PPTFileList from './components/Service/PPT/PPTFileList'
import EditPPT from './components/Service/PPT/EditPPT';
// video
import UploadVideo from './components/Service/Video/UploadVideo'
import Playlist from './components/Service/Playlist/Playlist'
import VideoList from './components/Service/Playlist/VideoList'

function App() {
  const [showModeratorBoard, setShowModeratorBoard] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setShowAdminBoard(user.roles.includes("ROLE_ADMIN"));
      setShowModeratorBoard(user.roles.includes("ROLE_MODERATOR"));
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
  }

  return (
    <Router>
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" sticky="top">
        <Navbar.Brand href="/">Videnda AI Engine</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/home">Home</Nav.Link>
            {showModeratorBoard && (
              <Nav.Link href="/mod">Moderator Board</Nav.Link>
            )}
            {showAdminBoard && (
              <Nav.Link href="/admin">Admin Board</Nav.Link>
            )}
            {currentUser && (
              <Nav.Link href="/user">User</Nav.Link>
            )}
          </Nav>
          {currentUser ? (
            <Nav className="ml-auto">
              <NavDropdown title='Services' id="collasible-nav-dropdown" alignRight >
                <NavDropdown.Item href="/execute_service">Weather</NavDropdown.Item>
                <NavDropdown.Item href="/upload_image">Upload Image</NavDropdown.Item>
                <NavDropdown.Item href="/upload_video">Upload Video</NavDropdown.Item>
                <NavDropdown.Item href="/playlists">Manage Playlist</NavDropdown.Item>
                <NavDropdown.Item href="/manage_ppt/list">Manage PowerPoint</NavDropdown.Item>
              </NavDropdown>
              <NavDropdown title={currentUser.username} id="collasible-nav-dropdown" alignRight >
                <NavDropdown.Item href="/profile">View Profile</NavDropdown.Item>
                <NavDropdown.Item href="/changePassword">Change Password</NavDropdown.Item>
                <NavDropdown.Item href="/deregister">Deregister</NavDropdown.Item>
                <NavDropdown.Item href="/signin" onClick={logOut}>Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          ) : (
              <Nav className="ml-auto">
                <Nav.Link href="/signin">Login</Nav.Link>
                <Nav.Link href="/register">Sign Up</Nav.Link>
              </Nav>
            )}
        </Navbar.Collapse>
      </Navbar>
      
      <div className="container mt-3">
        <Switch>
          <Route exact path={["/", "/home"]} component={Home}></Route>
          <Route path="/signin" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/changePassword" component={ChangePassword} />
          <Route path="/deregister" component={Deregister} />
          <Route path="/resetpassword/forgotpassword" component={ForgotPassword} />
          <Route path="/verifyemail" component={VerifyEmail} />
          <Route path="/profile" component={Profile} />
          <Route path="/resetpassword/reset" component={ResetPassword} />
          <Route path="/add_tokens" component={AddTokens} />
          <Route path="/execute_service" component={ExecuteService} />
          <Route path="/upload_image" component={UploadImage} />
          <Route path="/edit_image/:image_id" component={EditImage} />
          <Route path="/manage_ppt/list" component={PPTFileList} />
          <Route path="/manage_ppt/edit_ppt/:ppt_id" component={EditPPT} />
          <Route path="/upload_video" component={UploadVideo} />
          <Route path="/playlists" component={Playlist} />
          <Route path="/playlist/:playlist_id" component={VideoList} />
          <Route path="/user" component={BoardUser} />
          <Route path="/mod" component={BoardModerator} />
          <Route path="/admin" component={BoardAdmin} />
          <Route path="/add_tokens" component={BoardAdmin} />
          <Route path="*" component={NoMatch} />
        </Switch>
      </div>
    </Router>
  )
}

export default App;
