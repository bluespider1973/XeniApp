import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Pagination } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import Modal from 'react-bootstrap/Modal';
import ReactPlayer from 'react-player';
import { useHistory } from "react-router-dom";

import {
    Image,
    Button,
    ListGroup,
    Media,
} from 'react-bootstrap';

import PlaylistService from '../../../services/playlist.service';

const useStyles = makeStyles((theme) => ({
    root: {
        height: 110,
        flexGrow: 1,
        maxWidth: 400,
    },
    margin: {
        margin: theme.spacing(1),
    },
    linkInput: {
        width: "100%",
        marginBottom: theme.spacing(1)
    },
    linerProgress: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
    }
}));

const getVideoId = (url) => {
    return url.split("?v=")[1];
} 

const MyVerticallyCenteredModal = (props) => {

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.metaTitle}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ReactPlayer url={props.playUrl} playing={true} width='100%' controls={true} />
            </Modal.Body>
            <Modal.Footer>
                {/* <p style={{marginRight: '5%'}}>{props.currentVideoNumber} of {Object.keys(props.videoData).length}</p> */}
                <Button variant="primary" onClick={props.onPreviousVideo}>Previous</Button>
                <Button style={{marginRight: '30px'}} variant="primary" onClick={props.onNextVideo}>Next</Button>
                <Button variant="secondary" onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}


export default (props) => {
    const [pageNumber, setPageNumber] = React.useState(localStorage.getItem('videolistpage') ? Number(localStorage.getItem('videolistpage')) : 1);
    const [itemsPerPage] = React.useState(10);
    const [totalPages, setTotalPages] = React.useState(1);
    const [videoData, setVideoData] = useState([]);
    const [videoInfos, setVideoInfos] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [playUrl, setPlayUrl] = useState(null);
    const [metaTitle, setMetaTitle] = useState(null);
    const [videoId, setVideoId] = useState(null);
    const [playlistId, setPlaylistId] = useState(null);
    const [currentVideoNumber, setCurrentVideoNumber] = useState(1);
    
    let history = useHistory();

    useEffect(() => {
      setPlaylistId(props.match.params.playlist_id);
      if (localStorage.getItem("user") ) {
          getAllVideos();
      } else {
          history.push("/404");
      }
    }, [props])

    const getAllVideos = () => {
     if (playlistId != null)
      PlaylistService.getPublicPlaylist(playlistId)
      .then(async response => {
          console.log(response.data.length)
        if (response.data.message == 'cannot_access' || response.data.length == 0) {
            history.push("/404");
        }
        if(response.data && response.data.length>0) {

            setVideoData(response.data)
            setVideoInfos(response.data);
            
            const total = Math.ceil(response.data.length / itemsPerPage);
            setTotalPages(total);
        }
      })
    }

    const handleChangePageNumber = (pagenum)=>{
        setPageNumber(pagenum);
        localStorage.setItem('videolistpage', pagenum)
    }

    const handleChangeKeyword = (key) => {
        const keyword = key.trim().toLowerCase();
        let data = videoData.filter(item => {
            let fileName = item.meta_keyword + item.meta_description + item.meta_title + getVideoId(item.video_id);
            fileName = fileName.trim().toLowerCase();

            if (keyword === "") {
                return 1;    
            }
        
            if (fileName.includes(keyword)) {
                return 1;
            }
        });
        
        setVideoInfos(data);
    
        const total = Math.ceil(data.length / itemsPerPage);
        setTotalPages(total);

        localStorage.removeItem('videolistpage');
        setPageNumber(1);
    }

    // Play one video
    const handlePlayVideo = (video_url, meta_title, videoId) => {
        setModalShow(true);
        setPlayUrl(video_url);
        setMetaTitle(meta_title);
        setVideoId(videoId);
    }

    const onNextVideo = () => {
        const index = videoData.findIndex(item => item.id == videoId);
        if (index >= videoData.length - 1) {
            return;
        }
        const nextUrl = videoData[index + 1].video_id;
        setVideoId(videoData[index + 1].id);
        setPlayUrl(nextUrl);
        setMetaTitle(videoData[index + 1].meta_title)
        setCurrentVideoNumber(getCurrentVideoNumber() + 1)
    }

    const onPreviousVideo = () => {
        const index = videoData.findIndex(item => item.id == videoId);
        if (index <= 0) {
            return;
        }
        const prevUrl = videoData[index - 1].video_id;
        setVideoId(videoData[index - 1].id);
        setPlayUrl(prevUrl);
        setMetaTitle(videoData[index - 1].meta_title)
        setCurrentVideoNumber(getCurrentVideoNumber() - 1)
    }

    const getCurrentVideoNumber = () => {
        return videoData.findIndex(item => item.id == videoId) + 1
    }

    return (
        <>
            {videoInfos &&
                <VideoList 
                    videoInfos={videoInfos}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    currentPage={pageNumber}
                    onChangeKeyword={handleChangeKeyword}
                    onChangePageNumber={handleChangePageNumber}
                    handlePlayVideo={handlePlayVideo}
                />
            }
            <MyVerticallyCenteredModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                playUrl={playUrl}
                metaTitle={metaTitle}
                videoData={videoData}
                videoId={videoId}
                onPreviousVideo={onPreviousVideo}
                onNextVideo={onNextVideo}
                currentVideoNumber={currentVideoNumber}
            />
        </>
    );
}


const VideoList = (props) => {
    const classes = useStyles();

    const renderItem = (data) => (
        <ListGroup.Item key={data.id}>
            <Media>
                <Image thumbnail src={data.meta_image} className="mr-3" />
                <Media.Body>
                    <h5><span>{data.meta_title}</span></h5>
                    <p style={{marginBottom: "0px"}}><span>ID : </span><code>{getVideoId(data.video_id)}</code></p>
                    <p style={{marginBottom: "2px"}}><span>{data.meta_description}</span></p>
                    {data.meta_keyword && (
                        <p><small><span>Keywords : </span><span>{data.meta_keyword}</span></small></p>
                    )}
                    <p><small><i><span>Created Time : </span><span>{data.dateTime}</span></i></small></p>
                    <Button variant="primary" size="sm" style={{padding: '5px 20px'}} className="mr-2" onClick={() => props.handlePlayVideo(data.video_id, data.meta_title, data.id)}>
                        Play Video
                    </Button>
                </Media.Body>
            </Media>
        </ListGroup.Item>
    );

    const showPagenationItem = () => {

        return (
            <Pagination
                color="primary"
                className="mt-3"
                shape="rounded"
                count={props.totalPages}
                page={props.currentPage}
                onChange={(event, val)=>props.onChangePageNumber(val)}
            />
        );
    }

    const doSomethingWith = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            props.onChangeKeyword(e.target.value);
        }
    }

    return (
        <>
            <div className="card">
                <TextField
                    className={classes.margin}
                    id="input-with-icon-textfield"
                    placeholder="Search"
                    onKeyDown={doSomethingWith}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                        <SearchIcon />
                        </InputAdornment>
                    ),
                }}
                />
                <h3 className="card-header">List of Videos</h3>
                <ListGroup variant="flush">
                    {props.videoInfos
                        && props.videoInfos.map((video, index) => {
                            if((props.currentPage-1)*props.itemsPerPage <=index && (props.currentPage)*props.itemsPerPage > index ) {
                                return renderItem(video)
                            } else {
                                return null
                            }
                        })}
                </ListGroup>
                {showPagenationItem()}
            </div>
        </>
    );
}