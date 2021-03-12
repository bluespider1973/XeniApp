import React from 'react';
import queryString from 'query-string';

import UserService from '../../../services/user.service';

class AddTokens extends React.Component{
    state={
        response: null,
        loading: false,
        content: ""
    };
    
    componentDidMount(){
        this.setState({
            loading: true
        })
        let params = queryString.parse(window.location.search);
        console.log(params);
        UserService.addTokens(params).then(
            (response)=>{
                this.setState({
                    loading: false,
                    content:response.data.message,
                    response: response.data
                });
            },
            (error)=>{
                const _content =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.toString();
                this.setState({
                    loading: false,
                    content: _content
                });
            }
        )
    }
    render(){
        const {loading, content} = this.state;
        return (
            <div className="container">
                {
                    loading?
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                    :
                    <>
                        <div className="jumbotron">
                            <h3>{content}</h3>
                        </div>
                        {this.state.response && this.state.response.status && this.state.response.status==="SUCCESS" &&
                        <>
                            <p>
                                <strong>User Name: </strong> {this.state.response.username}
                            </p>
                            <p>
                                <strong>Email: </strong> {this.state.response.user_email}
                            </p>
                            <p>
                                <strong>User Id: </strong> {this.state.response.user_id}
                            </p>
                            <p>
                                <strong>Total Tokens: </strong> {this.state.response.nr_tokens}
                            </p>
                        </>
                        }
                    </>
                }
            </div>
        )
    }
}

export default AddTokens;