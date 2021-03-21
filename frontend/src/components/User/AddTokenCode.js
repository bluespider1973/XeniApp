import React from "react";
import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";

import TextField from '@material-ui/core/TextField';
import InsertEmoticon from '@material-ui/icons/InsertEmoticon';
import InputAdornment from '@material-ui/core/InputAdornment';

import {
  Row,
  Col,
  Button,
} from 'react-bootstrap';

const AddTokenCode = () => {
  const [currentUser, setCurrentUser] = React.useState(undefined);
  const [message, setMessage] = React.useState('');
  const [tokenCode, setTokenCode] = React.useState('');

  React.useEffect(()=>{
    AuthService.getUserProfile().then((response)=>{
      setCurrentUser(response);  
    });
  }, [])


  const handleAddTokens = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13 || e.target.innerText == 'Add Tokens') {
      UserService.addTokenCode(tokenCode)
        .then(response => {
          if (response.data.message === "success") {
              window.location.reload();
          }
        }).catch((err) => {
            const resMessage = (
                err.response &&
                err.response.data &&
                err.response.data.message
            ) || err.toString();

            setMessage(resMessage);
            setTimeout(() => {
              setMessage('');
            }, 3000);
        });

      document.getElementById('input-with-icon-textfield').value = '';
      setTokenCode('');
    }
  }


  return (
    <div className="container">
      <Row  className='mt-5'>
        <Col md={4}>
          <TextField
            style={{width: '100%'}}
            id="input-with-icon-textfield"
            placeholder="Input code"
            onChange={(e) => setTokenCode(e.target.value)}
            onKeyDown={handleAddTokens}
            InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InsertEmoticon />
                  </InputAdornment>
            ),
            }}
          />
        </Col>
        <Col md={8}>
          <Button size='sm' onClick={handleAddTokens}>
            Add Tokens
          </Button>
        </Col>
      </Row>
      
      { currentUser &&
        <header className="jumbotron mt-4">
          <h3 className='mb-4'><strong>{currentUser.username}</strong></h3>
          <p><strong>Current Tokens: </strong>{currentUser.nr_tokens}</p>
        </header>
      }

      { message &&
        <div className="alert alert-primary">
          {message}
        </div>
      }

    </div>
  );
};

export default AddTokenCode;