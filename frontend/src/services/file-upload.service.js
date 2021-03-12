import axios from "axios";
import Auth from "./auth.service";
import GlobalData from "../tools/GlobalData"

const BASE_API_URL = `${GlobalData.back_end_server_ip}:${GlobalData.back_end_server_port}/api/`;
//const IMAGE_API_URL = "http://local--host:3030/api/image/";
//const IMAGE_API_URL = "http://1-58.69.222.102:3030/api/image/";

class FileUploadService {
    uploadImage(file, onUploadProgress) {
        let formData = new FormData();
        formData.append("file", file);
        const currentUser = Auth.getCurrentUser();
        return axios.post(`${BASE_API_URL}image/uploadImage/${currentUser.user_id}/${currentUser.access_key}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        });        
    }

    uploadPPT(file, onUploadProgress) {
        let formData = new FormData();
        formData.append("file", file);
        const currentUser = Auth.getCurrentUser();
        return axios.post(`${BASE_API_URL}ppt/uploadPPT/${currentUser.user_id}/${currentUser.access_key}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        });
    }
}

export default new FileUploadService();
