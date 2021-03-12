import React, { useState, useRef } from "react";
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import CheckButton from 'react-validation/build/button';

import AuthService from '../../services/auth.service';

const required  =(value)=>{
    if(!value){
        return <div className="alert alert-danger" role="alert">
            This field is required.
        </div>
    }
}

const Deregister = (props) =>{
    const form = useRef();
    const checkBtn = useRef();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState();

    const onChangeEmail = (e)=>{
        const email = e.target.value;
        setEmail(email);
    } 

    const onChangePassword = (e)=>{
        const pass = e.target.value;
        setPassword(pass);
    }

    const handleDeregister = (e)=>{
        e.preventDefault();
        setMessage("");
        setLoading(true);

        AuthService.deregister(email, password).then(
            (response)=>{
                AuthService.logout();
                window.location.replace("/home");
            },
            (error)=>{
                const resMessage=(
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) || error.toString();

                setLoading(false);
                setMessage(resMessage);
            }
        )
    }

    return (
    <div className="col-md-12">
        <div className="card card-container">
            <div className="mr-1 ml-1 mt-2 mb-3 text-center">
                <h2><small>Are you sure you want to deregister?</small></h2>
            </div>
            <Form onSubmit={handleDeregister} ref={form}>
                <div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <Input
                            
                            className="form-control"
                            name="email"
                            value={email}
                            onChange={onChangeEmail}
                            validations={[required]}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <Input
                            type="password"
                            className="form-control"
                            name="password"
                            value={password}
                            onChange={onChangePassword}
                            validations={[required]}
                        />
                    </div>

                    <div className="form-group">
                        <button className="btn btn-primary btn-block" disabled={loading}>
                            {loading && (
                                <span className="spinner-border spinner-border-sm"></span>
                            )}
                            <span>Confirm Deregister</span>
                        </button>
                    </div>
                </div>
            {message && (
                <div className="form-group">
                    <div className="alert alert-danger" role="alert">
                        {message}
                    </div>
                </div>
            )}
            <CheckButton style={{ display: "none" }} ref={checkBtn} />
        </Form>
        </div>
    </div>)
}

export default Deregister;