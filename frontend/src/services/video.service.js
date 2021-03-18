import axios from 'axios'

import Auth from './auth.service'
import GlobalData from '../tools/GlobalData'

const BASE_API_URL = `${GlobalData.back_end_server_ip}:${GlobalData.back_end_server_port}/api/`
const VIDEO_API_URL = `${BASE_API_URL}video/`

class VideoService {
  uploadVideo(video_id) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${VIDEO_API_URL}uploadVideo?user_id=${currentUser.user_id}&access_key=${currentUser.access_key}&video_id=${video_id}`);
  }

  addPlaylistIds(video_id, playlist_ids) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${VIDEO_API_URL}addPlaylistIds?user_id=${currentUser.user_id}&access_key=${currentUser.access_key}&video_id=${video_id}`, playlist_ids);
  }

  getPlaylistIds(video_id) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${VIDEO_API_URL}getPlaylistIds?user_id=${currentUser.user_id}&access_key=${currentUser.access_key}&video_id=${video_id}`);
  }

  removeVideo(id) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${VIDEO_API_URL}removeVideo/${id}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
  }

  setManualInfo(videoId, manual_title, manual_description) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${VIDEO_API_URL}setManualInfo/${videoId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&manual_title=${manual_title}&manual_description=${manual_description}`);
  }

  changeVideoGroup(id, playlist_id) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${VIDEO_API_URL}changeVideoGroup/${id}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&playlist_id=${playlist_id}`);
  }

  getAllVideoList() {
    const currentUser = Auth.getCurrentUser();
    return axios.get(`${VIDEO_API_URL}getAllVideoList?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
  }
}

export default new VideoService();