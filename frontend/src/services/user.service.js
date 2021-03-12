import axios from 'axios';
import authHeader from './auth-header';

import GlobalData from '../tools/GlobalData';

const API_URL = GlobalData.back_end_server_ip + ':' + GlobalData.back_end_server_port + '/api/user/';
//const API_URL = `http://1-58.69.222.102:3030/api/user/`;

const getPublicContent=()=>{
    return axios.get(`${API_URL}all`);
}
const getUserBoard=()=>{
    return axios.get(`${API_URL}user`, {headers: authHeader()});
}
const getModeratorBoard=()=>{
    return axios.get(`${API_URL}mod`, {headers:authHeader()});
}
const getAdminBoard=()=>{
    return axios.get(`${API_URL}admin`, {headers:authHeader()});
}
const addTokens=(obj)=>{
    return axios.get(`${API_URL}add_tokens?user_id=${obj.user_id}&nr_tokens=${obj.nr_tokens}&admin_key=${obj.admin_key}`);
}
export default {
    getPublicContent,
    getUserBoard,
    getModeratorBoard,
    getAdminBoard,
    addTokens,
};
