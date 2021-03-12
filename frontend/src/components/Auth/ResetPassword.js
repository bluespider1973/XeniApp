import React from 'react';
import { Link } from "react-router-dom";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import queryString from "query-string";

import AuthService from "../../services/auth.service";
import isEmpty from 'lodash/isEmpty';

class ResetPassword extends React.Component {
    state = {
        successful: false,
        message: "",
        loading: false,
        resetting: false,
        newpassword: "",
        confirmpassword: "",
        notMatchPassword: false,
    }
    // const [successful, setSuccessful] = React.useState(false);
    // const [message, setMessage] = React.useState("");
    // const [loading, setLoading] = React.useState(true);

    componentDidMount() {
        this.setState({ loading: true });

        let queryParam = queryString.parse(window.location.search);
        if (!isEmpty(queryParam) && queryParam.unique_id && queryParam.user_id) {
            this.setState({
                loading: false,
                unique_id: queryParam.unique_id,
                user_id: queryParam.user_id,
            });
        }
    }

    onChangeNewPassword = (e) => {
        let newpass = e.target.value;
        this.setState({ newpassword: newpass });
    }

    onChangeConfirmPassword = (e) => {
        let confirmpass = e.target.value;
        this.setState({ confirmpassword: confirmpass });
    }

    handleResetPassword = (e) => {

        e.preventDefault();
        if (this.state.confirmpassword !== this.state.newpassword) {
            this.setState({
                notMatchPassword: true,
            })
        } else {
            this.setState({
                notMatchPassword: false,
                loading: true,
            })
            AuthService.resetPassword({
                password: this.state.newpassword,
                user_id: this.state.user_id,
                unique_id: this.state.unique_id
            }).then(
                (response) => {
                    this.setState({
                        message: response.data.message,
                        successful: true,
                        loading: false,
                    });
                },
                (error) => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.toString();
                    this.setState({
                        message: resMessage,
                        successful: false,
                        loading: false
                    });
                }
            )
        }
    }

    render() {

        // const form = useRef();
        // const checkBtn = useRef();
        const { successful, message, loading, resetting, newpassword, confirmpassword, notMatchPassword } = this.state;
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

        return (
            <div className="container">
                {loading ?
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                    :
                    <div className="card card-container">
                        <img
                            src="//ssl.gstatic.com/accounts/ui/avatar_2x.png"
                            alt="profile-img"
                            className="profile-img-card"
                        />

                        <Form onSubmit={this.handleResetPassword} ref={(node) => { this.form = node }}>
                            {!successful && (
                                <div>
                                    <div className="form-group">
                                        <label htmlFor="newpassword">New Password</label>
                                        <Input
                                            type="password"
                                            className="form-control"
                                            name="newpassword"
                                            value={newpassword}
                                            onChange={this.onChangeNewPassword}
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
                                            onChange={this.onChangeConfirmPassword}
                                        />
                                        {notMatchPassword && <div className="alert alert-danger" role="alert">
                                            Confirm Password must equal with New Password.
                                    </div>}
                                    </div>
                                    <div className="form-group">
                                        <button className="btn btn-primary btn-block" disabled={resetting}>
                                            {resetting && (
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
                            <CheckButton style={{ display: "none" }} ref={(node) => { this.checkBtn = node }} />
                        </Form>
                    </div>}
            </div>
        )
    }
}

export default ResetPassword;