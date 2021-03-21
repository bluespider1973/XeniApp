import axios from 'axios'

import Auth from './auth.service'
import GlobalData from '../tools/GlobalData'

const BASE_API_URL = `${GlobalData.back_end_server_ip}:${GlobalData.back_end_server_port}/api/`
const PLAYLIST_API_URL = `${BASE_API_URL}`

class PlaylistService {
  
  addPlaylist(playlist_url) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${PLAYLIST_API_URL}received/addPlaylist?user_id=${currentUser.user_id}&access_key=${currentUser.access_key}&playlist_url=${playlist_url}`);
  }

  removePlaylist(id) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${PLAYLIST_API_URL}received/removePlaylist/${id}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}`);
  }

  changePlaylist(id, currentPlaylistTitle, currentPlaylistStatus) {
    const currentUser = Auth.getCurrentUser();
    return axios.post(`${PLAYLIST_API_URL}changePlaylist/${id}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&currentPlaylistTitle=${currentPlaylistTitle}&currentPlaylistStatus=${currentPlaylistStatus}`);
  }

  getAllPlaylist() {
    const currentUser = Auth.getCurrentUser();
    return axios.get(`${PLAYLIST_API_URL}received/getAllPlaylist?user_id=${currentUser.user_id}&access_key=${currentUser.access_key}`);
  }

  getPlaylist(playlist_id) {
    const currentUser = Auth.getCurrentUser();
    return axios.get(`${PLAYLIST_API_URL}getPlaylist?user_id=${currentUser.user_id}&access_key=${currentUser.access_key}&playlist_id=${playlist_id}`);
  }

  getPublicPlaylist(playlist_id) {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      return null;
    }
    return axios.get(`${PLAYLIST_API_URL}getPublicPlaylist?user_id=${currentUser.user_id}&access_key=${currentUser.access_key}&playlist_id=${playlist_id}`);
  }
}

export default new PlaylistService();