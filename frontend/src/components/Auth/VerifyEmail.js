import React from 'react';

import queryString from "query-string";

import AuthService from "../../services/auth.service";
import isEmpty from 'lodash/isEmpty';

class VerifyEmail extends React.Component{
    state = {
        successful: false,
        message: "",
        loading: false,
    }
    // const [successful, setSuccessful] = React.useState(false);
    // const [message, setMessage] = React.useState("");
    // const [loading, setLoading] = React.useState(true);

    componentDidMount(){
        this.setState({loading: true});

        let queryParam = queryString.parse(window.location.search);
        if(!isEmpty(queryParam) && queryParam.unique_id && queryParam.user_id){
            AuthService.verifyEmail(queryParam).then(
                (response)=>{
                    this.setState({message: response.data.message});
                    this.setState({successful: true});
                    this.setState({loading: false});
                },
                (error)=>{
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.toString();
                    this.setState({message: resMessage});
                    this.setState({successful: false});
                    this.setState({loading: false});
                }
            )
        }
    }
    render(){
        return (
            <div className="container">
                {this.state.loading?
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
                :
                <div className={this.state.successful?"alert alert-success":"alert alert-danger"}>
                    {this.state.message}
                </div>}
            </div>
    )}
}

export default VerifyEmail;