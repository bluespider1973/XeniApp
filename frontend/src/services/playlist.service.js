import axios from 'axios'

import Auth from './auth.service'
import GlobalData from '../tools/GlobalData'

const BASE_API_URL = `${GlobalData.back_end_server_ip}:${GlobalData.back_end_server_port}/api/`
const PLAYLIST_API_URL = `${BASE_API_URL}`

class PlaylistService {
  
  addPlaylist(playlist_title, playlist_status) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${PLAYLIST_API_URL}addPlaylist?user_id=${currentUser.user_id}&access_key=${currentUser.access_key}&playlist_title=${playlist_title}&playlist_status=${playlist_status}`);
  }

  removePlaylist(id) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${PLAYLIST_API_URL}removePlaylist/${id}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
  }

  getAllPlaylist() {
    const currentUser = Auth.getCurrentUser();
    return axios.get(`${PLAYLIST_API_URL}getAllPlaylist?user_id=${currentUser.user_id}&access_key=${currentUser.access_key}`);
  }

  getPlaylist(playlist_id) {
    const currentUser = Auth.getCurrentUser();
    return axios.get(`${PLAYLIST_API_URL}getPlaylist?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&playlist_id=${playlist_id}`);
  }
}

export default new PlaylistService();