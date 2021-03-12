import axios from "axios";
import Auth from "./auth.service";
import GlobalData from "../tools/GlobalData"

const BASE_API_URL = `${GlobalData.back_end_server_ip}:${GlobalData.back_end_server_port}/api/`;
const IMAGE_API_URL = `${BASE_API_URL}image/`;

class ImageService {

    rotateImage({imageId, degree, clock}){
        const currentUser = Auth.getCurrentUser();
        return axios.get(`${IMAGE_API_URL}rotateImage/${imageId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&degree=${degree}&clock=${clock?'yes':'no'}`);
    }

    getImageFiles() {
        const currentUser = Auth.getCurrentUser();
        return axios.get(`${IMAGE_API_URL}getImageFile?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
    }

    getAllImageFiles() {
        const currentUser = Auth.getCurrentUser();
        return axios.get(`${IMAGE_API_URL}getAllImageFile?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
    }

    getImage(imageId){
        const currentUser = Auth.getCurrentUser();
        return `${IMAGE_API_URL}getImageFile/${imageId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&type=preview`;
    }

    getImageHistory(imageId){
        const currentUser = Auth.getCurrentUser();
        return axios.get(`${IMAGE_API_URL}getImageHistory/${imageId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
    }

    removeImage(imageId){
        const currentUser = Auth.getCurrentUser();
        return axios.post(`${IMAGE_API_URL}removeImage/${imageId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
    }

    addImageDescription({imageId, imageDescription}) {
        const currentUser = Auth.getCurrentUser();
        return axios.post(`${IMAGE_API_URL}addImageDescription/${imageId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&image_description=${imageDescription}`);
    }
}

export default new ImageService();
