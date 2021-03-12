import axios from "axios";
import Auth from "./auth.service";
import GlobalData from "../tools/GlobalData"

const BASE_API_URL = `${GlobalData.back_end_server_ip}:${GlobalData.back_end_server_port}/api/`;
const PPT_API_URL = `${BASE_API_URL}ppt/`;

class PPTService {

    getPPTFiles() {
        const currentUser = Auth.getCurrentUser();
        return axios.get(`${PPT_API_URL}getPPTFile?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
    }

    getPPT(pptId){
        const currentUser = Auth.getCurrentUser();
        return `${PPT_API_URL}getPPTFile/${pptId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&type=preview`;
    }

    getPPTHistory(pptId){
        const currentUser = Auth.getCurrentUser();
        return axios.get(`${PPT_API_URL}getPPTHistory/${pptId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
    }

    rotateImage({imageId, degree, clock}){
        const currentUser = Auth.getCurrentUser();
        return axios.get(`${PPT_API_URL}rotateImage/${imageId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&degree=${degree}&clock=${clock?'yes':'no'}`);
    }

    addNewSlidePPT({pptId}){
        const currentUser = Auth.getCurrentUser();
        return axios.get(`${PPT_API_URL}addNewSlidePPT/${pptId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
    }
}

export default new PPTService();
