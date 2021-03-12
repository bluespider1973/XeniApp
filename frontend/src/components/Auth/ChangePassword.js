import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import AuthService from "../../services/auth.service";

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

const vpassword = (value) => {
    if (value.length < 6 || value.length > 40) {
        return (
            <div className="alert alert-danger" role="alert">
                The password must be between 6 and 40 characters.
            </div>
        );
    }
};

const ChangePassword = (props) => {
    const form = useRef();
    const checkBtn = useRef();

    const [oldpassword, setOldPassword] = useState("");
    const [newpassword, setNewPassword] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");
    const [notMatchPassword, setNotMatchPassword] = useState(true);
    const [successful, setSuccessful] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);



    const onChangeOldPassword = (e) => {
        const oldpass = e.target.value;
        setOldPassword(oldpass);
    };

    const onChangeNewPassword = (e) => {
        const newpass = e.target.value;
        setNewPassword(newpass);
    };

    const onChangeConfirmPassword = (e) => {
        const confirmpass = e.target.value;
        setConfirmPassword(confirmpass);
    };

    React.useEffect(() => {
        console.log(confirmpassword, newpassword);
        if (newpassword !== confirmpassword && confirmpassword !== "") {
            setNotMatchPassword(false);
        } else {
            setNotMatchPassword(true);
        }
    }, [newpassword, confirmpassword])

    const handleChangePassword = (e) => {
        e.preventDefault();
        console.log(oldpassword, newpassword, confirmpassword);
        setMessage("");
        setSuccessful(false);
        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            setLoading(true);
            AuthService.changePassword(oldpassword, newpassword).then(
                (response) => {
                    setMessage(response.data.message);
                    setSuccessful(true);
                    setLoading(false);
                },
                (error) => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.toString();
                    setMessage(resMessage);
                    setSuccessful(false);
                    setLoading(false);
                }
            );
        }
    };

    return (
        <div className="col-md-12">
            <div className="card card-container">
                <img
                    src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                    alt="profile-img"
                    className="profile-img-card"
                />

                <Form onSubmit={handleChangePassword} ref={form}>
                    {!successful && (
                        <div>
                            <div className="form-group">
                                <label htmlFor="oldpassword">Old Password</label>
                                <Input
                                    type="password"
                                    className="form-control"
                                    name="oldpassword"
                                    value={oldpassword}
                                    onChange={onChangeOldPassword}
                                    validations={[vpassword]}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newpassword">New Password</label>
                                <Input
                                    type="password"
                                    className="form-control"
                                    name="newpassword"
                                    value={newpassword}
                                    onChange={onChangeNewPassword}
                                    validations={[required, vpassword]}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmpassword">Confirm Password</label>
                                <Input
                                    type="password"
                                    className="form-control"
                                    name="confirmpassword"
                                    value={confirmpassword}
                                    onChange={onChangeConfirmPassword}
                                />
                                {notMatchPassword || <div className="alert alert-danger" role="alert">
                                    Confirm Password must equal with New Password.
                                </div>}
                            </div>

                            <div className="form-group">
                                <button className="btn btn-primary btn-block" disabled={loading}>
                                    {loading && (
                                        <span className="spinner-border spinner-border-sm"></span>
                                    )}
                                    <span>Change Password</span>
                                </button>
                            </div>
                            <div className="d-flex justify-content-end bd-highlight mb-3">
                                <small><Link to="/signin">Have Account? Login!</Link></small>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className="form-group">
                            <div
                                className={successful ? "alert alert-success" : "alert alert-danger"}
                                role="alert"
                            >
                                {message}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{ display: "none" }} ref={checkBtn} />
                </Form>
            </div>
        </div>
    );
};

export default ChangePassword;