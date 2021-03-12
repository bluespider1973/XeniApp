import React from 'react';
import { InputGroup, FormControl, Button} from 'react-bootstrap';
import Services from '../../services/execute.service';
import Auth from '../../services/auth.service';

import GlobalData from '../../tools/GlobalData';
const API_URL = GlobalData.back_end_server_ip + ':' + GlobalData.back_end_server_port + '/api/execute_service?server=get_weather';
//http://ai-c.space:3030/api/execute_service?server=get_weather

const ExecuteService = ()=>{
    const [successfully, setSuccessfully] = React.useState(false);
    const [successfully1, setSuccessfully1] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [loading1, setLoading1] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const [message1, setMessage1] = React.useState('');
    const [cityName, setCityName] = React.useState('');
    const [weather, setWeather] = React.useState('');
    const [tokenHistory, setTokenHistory] = React.useState(undefined);

    const [userData] = React.useState(Auth.getCurrentUser())

    const onChangeCityName=(e)=>{
        let c_name = e.target.value;
        setCityName(c_name);
    }

    const handleGetWeather = (e) =>{
        e.preventDefault();
        console.log(cityName);
        if(cityName){
            setLoading(true);
            Services.getWeather( cityName)
                .then(response=>{
                    setLoading(false);
                    setMessage(response.data.message);
                    setSuccessfully(true);
                    setWeather(JSON.stringify(response.data.data, null, 2));
                })
                .catch(error=>{
                    setLoading(false);
                    setSuccessfully(false);
                    setWeather("");
                    console.log( error);
                    const _content =
                        (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                        error.toString();
                    setMessage(_content);
                });
        }
    }

    const handleGetTokenHistory=(e)=>{
        e.preventDefault();
        setLoading1(true);
        Services.getTokenHistory()
            .then(response=>{
                setLoading1(false);
                setMessage1(response.data.message);
                setSuccessfully1(true);
                setTokenHistory(response.data.data);
            })
            .catch(error=>{
                setLoading1(false);
                setTokenHistory(undefined);
                setSuccessfully1(false);
                const _content =
                    (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                    error.toString();
                setMessage1(_content);
            })
    }

    return (
    <div className="container">
        <div className="row">
            <div className="col-md-6">
                <InputGroup className="mb-3">
                    <FormControl
                        placeholder="City Name"
                        aria-label="City Name"
                        aria-describedby="basic-addon2"
                        value={cityName}
                        onChange={onChangeCityName}
                    />
                    <InputGroup.Append>
                    <Button variant="outline-secondary" onClick={handleGetWeather} disabled={loading}>
                        {loading && (
                            <span className="spinner-border spinner-border-sm"></span>
                        )}&nbsp;
                        <span>Get Weather</span>
                    </Button>
                    </InputGroup.Append>
                </InputGroup>
                <div style={{wordBreak: "break-all"}}>
                    <a href={`${API_URL}&user_id=${(userData==null)?"":userData.user_id}&user_key=${(userData==null)?"":userData.access_key}&city=${encodeURI(cityName)}`} rel="noreferrer" target="_blank">{`${API_URL}&user_id=${(userData==null)?"":userData.user_id}&user_key=${(userData==null)?"":userData.access_key}&city=${encodeURI(cityName)}`}</a>
                </div>
                {
                    message &&
                    <div className={successfully?"alert alert-success":"alert alert-danger"}>
                        {message}
                    </div>
                }
                <pre>
                    {weather}
                </pre>
            </div>
            <div className="col-md-6">
                <Button variant="outline-secondary" onClick={handleGetTokenHistory} disabled={loading1}>
                    {loading1 && (
                        <span className="spinner-border spinner-border-sm"></span>
                    )}&nbsp;
                    <span>Get Token History</span>
                </Button>
                {
                    message1 &&
                    <div className={successfully1?"alert alert-success mt-3":"alert alert-danger mt-3"}>
                        {message1}
                    </div>
                }
                <div className="pt-3">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Event</th>
                                <th style={{textAlign:"right"}}>Tokens</th>
                                <th style={{textAlign:"right"}}>Total Tokens</th>
                                <th style={{textAlign:"right"}}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokenHistory && tokenHistory.map(th=>
                                <tr key={th.id}>
                                    <td>{th.service}</td>
                                    <td style={{textAlign:"right"}}>{th.spent_tokens>0?"+"+th.spent_tokens:th.spent_tokens}</td>
                                    <td style={{textAlign:"right"}}>{th.current_tokens}</td>
                                    <td style={{textAlign:"right"}}>{th.createdAt.substring(0,10)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>
            </div>
        </div>
    </div>)
}

export default ExecuteService;
