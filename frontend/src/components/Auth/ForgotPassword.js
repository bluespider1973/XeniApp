import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import CheckButton from 'react-validation/build/button';
import { isEmail } from "validator";

import AuthService from '../../services/auth.service';

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const validEmail = (value) => {
    if (!isEmail(value)) {
        return (
            <div className="alert alert-danger" role="alert">
                This is not a valid email.
            </div>
        );
    }
};

const ForgotPassword = (props) => {
    const form = useRef();
    const checkBtn = useRef();

    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState();
    const [successful, setSuccessful] = useState(false);

    const onChangeEmail = (e) => {
        const email = e.target.value;
        setEmail(email);
    }

    const handleForgotPassword = (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        form.current.validateAll();

        AuthService.forgotPassword(email).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
                setLoading(false);
            }, (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setMessage(resMessage);
                setSuccessful(false);
                setLoading(false);
            }
        )
    }

    return (
        <div className="col-md-12">
            <div className="card card-container">
                <div className="mr-1 ml-1 mt-2 mb-3 text-center">
                    <h2><small>Input your email and reset password.</small></h2>
                </div>
                <Form onSubmit={handleForgotPassword} ref={form}>
                    {!successful && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <Input
                                    
                                    className="form-control"
                                    name="email"
                                    value={email}
                                    onChange={onChangeEmail}
                                    validations={[required, validEmail]}
                                />
                            </div>

                            <div className="form-group">
                                <button className="btn btn-primary btn-block" disabled={loading}>
                                    {loading && (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    )}
                                    <span>Reset Password</span>
                                </button>
                            </div>
                            <div className="d-flex justify-content-end bd-highlight mb-3">
                                <small><Link to="/signin">Have Account? Login!</Link></small>
                            </div>
                        </div>)
                    }
                    {message && (
                        <div className="form-group">
                            <div className={successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                {message}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{ display: "none" }} ref={checkBtn} />
                </Form>
            </div>
        </div>)
}

export default ForgotPassword;