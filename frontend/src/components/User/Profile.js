import React from "react";
import AuthService from "../../services/auth.service";

const Profile = () => {
  const [currentUser, setCurrentUser] = React.useState(undefined);
  const [message, setMessage] = React.useState('');
  const [mailSendError, setMailSendError] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  React.useEffect(()=>{
    AuthService.getUserProfile().then((response)=>{
      setCurrentUser(response);      
    });
  }, [])

  const resendVerifyEmail=()=>{
    setSending(true);
    AuthService.resendVerifyEmail().then((response)=>{
      setMailSendError(false);
      setSending(false);
      setMessage(response.data.message);
    }, error=>{
      const resMessage=(
          error.response &&
          error.response.data &&
          error.response.data.message
      ) || error.toString();
      setSending(false);
      setMessage(resMessage);
    });
  }

  return (
      <div className="container">
        {currentUser && currentUser.accessToken ? (
          <>
            {
              currentUser.verified_email==="none"&&
              <>
                <div className={"alert alert-danger"}>
                  You need to verify your email. If you didn't receive the verify email, please click this{` `}
                  <button className="btn btn-primary btn-sm" onClick={resendVerifyEmail} disabled={sending}>
                    {sending && (
                        <span className="spinner-border spinner-border-sm"></span>
                    )}
                    <span>Button</span></button> to resend the verify email.
                </div>
              </>
            }
            {
              message &&
              <div className={mailSendError ? "alert alert-danger" : "alert alert-danger"}>
                {message}
              </div>
            }
            <header className="jumbotron">
              <h3>
                <strong>{currentUser.username}</strong> Profile
              </h3>
            </header>
            <p>
              <strong>Email:</strong> {currentUser.email}
            </p>
            <p>
              <strong>User ID:</strong> {currentUser.user_id}
            </p>
            <p>
              <strong>Access Key:</strong> {currentUser.access_key}
            </p>
            <p>
              <strong>Tokens:</strong> {currentUser.nr_tokens}
            </p>
            <strong>Authorities:</strong>
            <ul>
              {currentUser.roles &&
                currentUser.roles.map((role, index) => <li key={index}>{role}</li>)
              }
            </ul>
          </>
        ):(
            <header className="jumbotron">
                <h3>
                  <strong>Please Login</strong>
                </h3>
            </header>
          )
        }
      </div>
  );
};

export default Profile;