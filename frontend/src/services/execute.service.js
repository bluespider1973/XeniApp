import axios from 'axios';
import AuthService from "../services/auth.service";

import GlobalData from '../tools/GlobalData';

const API_URL = GlobalData.back_end_server_ip + ':' + GlobalData.back_end_server_port + '/api/execute_service?';
//const API_URL = `http://1-58.69.222.102:3030/api/execute_service?`;
//const API_URL = `http://local--host:3030/api/execute_service?`;

const getWeather = (cityName)=>{
    const user=AuthService.getCurrentUser();
    return axios.get(`${API_URL}server=get_weather&user_id=${user.user_id}&user_key=${user.access_key}&city=${cityName}`);
}

const getTokenHistory=()=>{
    const user=AuthService.getCurrentUser();
    return axios.get(`${API_URL}server=get_tokenHistory&user_id=${user.user_id}`);
}

export default {
    getWeather,
    getTokenHistory,
};
