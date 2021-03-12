import axios from "axios";
import authHeader from "./auth-header";

import GlobalData from "../tools/GlobalData";

const API_URL = GlobalData.back_end_server_ip + ':' + GlobalData.back_end_server_port + '/api/auth/';
//const API_URL = `http://local--host:3030/api/auth/`;
//const API_URL = 'http://15-8.69.222.102:3030/api/auth/';
//const API_URL = 'http://127.0.0.1:3030/api/auth/';
//const API_URL = ''

axios.interceptors.response.use(
    response => {
        return response
    },
    error => {
        if (!error.response) {
            console.log("Connection to local-host failed err=" + error.message);
        }

        return Promise.reject(error)
    }
);

const register = (username, email, password) => {
  console.log("front console = register with axios, url=" + API_URL);
  try{
   return axios.post( API_URL + "signup", {
     username,
     email,
     password,
   });
  }catch( err){
	console.log( "axios post error=" + err.message);
  }
  return "{error}";
};

const login = (email, password) => {
  console.log(API_URL);
  return axios
    .post(API_URL + "signin", {
      email,
      password,
    })
    .then((response) => {

      if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }

      return response.data;
    });
};

const changePassword = (oldPassword, newPassword)=>{

  let token = authHeader();

  return axios
    .post(API_URL+"changePassword",
      {oldPassword, newPassword},
      {headers: token}
    ).then(response=>{
      return response;
    })
}

const deregister = (email, password)=>{
  let token = authHeader();
  return axios
    .post(API_URL+"deregister",
      {email,password},
      {headers: token}
    ).then(response=>{
      return response;
    })
}

const forgotPassword = (email)=>{
  return axios
    .post(API_URL+"forgotPassword",
      {email}
    ).then(response=>{
      return response;
    });
}
const verifyEmail=(obj=>{
  return axios
    .post(API_URL+"verifyEmail",
      obj
    ).then(response=>{
      return response;
    });
})
const resetPassword=(obj)=>{
  return axios.post(
    API_URL+"resetPassword",
    obj
  ).then(response=>{
    return response;
  })
}

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const resendVerifyEmail = () =>{
  const token = authHeader();
  return axios.post(API_URL+"resendVerifyEmail", {}, {
    headers: token
  }).then(response=>{
    return response
  });
}

const getUserProfile = ()=>{
  const token = authHeader();
  return axios.post(API_URL+"getUserProfile", {}, {
    headers: token
  }).then(response=>{
    if (response.data.accessToken) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  })
}

export default {
  register,
  login,
  logout,
  changePassword,
  deregister,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getCurrentUser,
  resendVerifyEmail,
  getUserProfile,
};
