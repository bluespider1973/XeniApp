import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TreeItem from '@material-ui/lab/TreeItem';
import { Pagination } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import InputIcon from '@material-ui/icons/Create';
import InsertLink from '@material-ui/icons/InsertLink';
import InputAdornment from '@material-ui/core/InputAdornment';
import Modal from 'react-bootstrap/Modal';
import ReactPlayer from 'react-player';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FolderIcon from '@material-ui/icons/Folder';
import SettingsIcon from '@material-ui/icons/Settings';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import GlobalData from '../../../tools/GlobalData';

import {
    Row,
    Col,
    Alert,
    Image,
    Button,
    ListGroup,
    Media,
} from 'react-bootstrap';
import VideoService from '../../../services/video.service';


import PlaylistService from '../../../services/playlist.service';
import { LinearProgress, Paper } from '@material-ui/core';

const back_end_server = GlobalData.back_end_server_ip + ":3000";

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
                <ReactPlayer url={props.playUrl} playing={true} width='100%'  controls={true} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

const SettingDialog = (props) => {

    const classes = useStyles();

    return (
        <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Playlist Infomation
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={8}>
                        <TextField
                            className={classes.linkInput}
                            id="input-with-icon-textfield-top"
                            placeholder="Input a new playlist name to change."
                            value={props.currentPlaylistTitle}
                            onChange={(e) => props.setCurrentPlaylistTitle(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                <InputIcon />
                                </InputAdornment>
                                ),
                            }}
                        />
                    </Col>
                    <Col md={4}>
                        <Select className="mr-4"
                        style={{width: "100px"}}
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={props.currentPlaylistStatus}
                        onChange={(e) => props.setCurrentPlaylistStatus(e.target.value)}
                        >
                            <MenuItem value={1}>Public</MenuItem>
                            <MenuItem value={0}>Private</MenuItem>
                        </Select>
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={props.onSave}>Save</Button>
                <Button variant="secondary" onClick={props.onDelete}>Delete</Button>
                <Button variant="primary" onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default () => {
    const [message, setMessage] = React.useState("");
    const [pageNumber, setPageNumber] = React.useState(localStorage.getItem('playlistpage') ? Number(localStorage.getItem('playlistpage')) : 1);
    const [itemsPerPage] = React.useState(10);
    const [totalPages, setTotalPages] = React.useState(1);
    const [treeData, setTreeData] = useState('');
    const [selected, setSelected] = useState('root');
    const [alertVisible, setAlertVisible] = useState(false);
    const [expanded, setExpanded] = useState([]);
    const [progressVisible, setProgressVisible] = useState(false);
    const [videoData, setVideoData] = useState([]);
    const [videoInfos, setVideoInfos] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [settingShow, setSettingShow] = useState(false);
    const [playUrl, setPlayUrl] = useState(null);
    const [metaTitle, setMetaTitle] = useState(null);
    const [playlistTitle, setPlaylistTitle] = useState('');
    const [playlistStatus, setPlaylistStatus] = useState(1);
    const [currentPlaylistId, setCurrentPlaylistId] = useState('');
    const [playlistData, setPlaylistData] = useState([]);
    const [currentPlaylistTitle, setCurrentPlaylistTitle] = useState('');
    const [currentPlaylistStatus, setCurrentPlaylistStatus] = useState('');
    const [playlists, setPlaylists] = useState([]);

    React.useEffect(() => {
        getAllPlaylists();
    }, [])

    const getAllPlaylists = () => {
        PlaylistService.getAllPlaylist()
            .then(async response => {
                if(response.data && response.data.length>0) {
                    setPlaylistData(response.data);
                    setPlaylists(response.data);
                    handleItemClick(response.data[0].playlist_id, response.data[0].playlist_title, response.data[0].playlist_status)
                }
            })
    }



    // Add playlist
    const upload = () => {

        PlaylistService.addPlaylist(playlistTitle, playlistStatus)
            .then(response => {
                if (response.data.message === 'success') {
                    getAllPlaylists();
                    setPlaylistTitle('');
                }
            })
    }

    const handleChangePageNumber = (pagenum)=>{
        setPageNumber(pagenum);
        localStorage.setItem('playlistpage', pagenum)
    }

    const handleChangeKeyword = (key) => {
        const keyword = key.trim().toLowerCase();
        const nodeId = selected;
        let data = videoData.filter(item => {
            let fileName = item.meta_keyword + item.meta_description + item.meta_title + getVideoId(item.video_id);
            fileName = fileName.trim().toLowerCase();

            if (fileName.includes(keyword)) {
                return 1;
            } else {
                return 0;
            }
        });

        console.log(videoInfos)

        if (keyword == "") {
            setVideoInfos(videoData);
        } else {
            setVideoInfos(data);
        }
    
        const total = Math.ceil(data.length / itemsPerPage);
        setTotalPages(total);

        localStorage.removeItem("playlistpage");
        setPageNumber(1);
    }

    const handleOnKeyDown = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            setPlaylistTitle(e.target.value);
            upload();
        }
    }

    // Remove one video item
    const handleRemoveItem = (id) => {
        VideoService.removeVideo(id)
            .then(response => {
                if (response.data.message === "success") {
                    let arr = [...videoInfos];
                    arr = arr.filter(item => item.id !== id);
                    setVideoInfos(arr);
                }
            }).catch((err) => {
                const resMessage = (
                    err.response &&
                    err.response.data &&
                    err.response.data.message
                ) || err.toString();

                setMessage(resMessage);
            });
    }

    // Play one video
    const handlePlayVideo = (video_url, meta_title) => {
        setModalShow(true);
        setPlayUrl(video_url);
        setMetaTitle(meta_title);
    }

    // playlist
    const handlePlaylist = (e, video_id) => {
        const playlist_title = e.target.value;
        let playlist_id = '';

        if (playlist_title != '') {
            const selectedPlaylist = playlists.find(item => item.playlist_title == playlist_title);
            playlist_id = selectedPlaylist.playlist_id;
        }

        VideoService.changeVideoGroup(video_id, playlist_id);
        window.location.reload();
    }

    const handleItemClick = (playlist_id, playlist_title, playlist_status) => {
        setCurrentPlaylistId(playlist_id);
        setCurrentPlaylistTitle(playlist_title);
        setCurrentPlaylistStatus(playlist_status);

        PlaylistService.getPlaylist(playlist_id)
        .then(async response => {
            if(response.data && response.data.length>0) {

                setVideoData(response.data);
                setVideoInfos(response.data);
                
                const total = Math.ceil(response.data.length / itemsPerPage);
                setTotalPages(total);
            } else {
                setVideoInfos([]);
            }
        })
    }

    // delete
    const handleSettingShow = () => {
        setSettingShow(false)
   
        PlaylistService.removePlaylist(currentPlaylistId)
            .then(response => {
                if (response.data.message === 'success') {
                    getAllPlaylists();
                    setCurrentPlaylistId('');
                    window.location.reload();
                }
            })
    }

    // change
    const handleSettingSave = () => {
        setSettingShow(false)
        console.log(currentPlaylistTitle, currentPlaylistStatus)
        PlaylistService.changePlaylist(currentPlaylistId, currentPlaylistTitle, currentPlaylistStatus)
        .then(response => {
            if (response.data.message === 'success') {
                getAllPlaylists();
                setCurrentPlaylistId('');
                setCurrentPlaylistTitle('');
                setCurrentPlaylistStatus('');
            }
        })
    }

    const classes = useStyles();

    const renderTree = (nodes) => {
        return (
        <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
    )}

    return (
        <>
            <h2 className="mb-3">My Playlists</h2>
            <Row className="mb-3">
                <Col md={4}>
                    <TextField
                        className={classes.linkInput}
                        id="input-with-icon-textfield-top"
                        placeholder="Input new playlist title."
                        value={playlistTitle}
                        onChange={(e) => setPlaylistTitle(e.target.value)}
                        onKeyDown={(e) => handleOnKeyDown(e)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                            <InputIcon />
                            </InputAdornment>
                            ),
                        }}
                    />
                </Col>
                <Col md={8}>
                    <Select className="mr-4"
                      style={{width: "100px"}}
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={playlistStatus}
                      onChange={(e) => setPlaylistStatus(e.target.value)}
                    >
                        <MenuItem value={1}>Public</MenuItem>
                        <MenuItem value={0}>Private</MenuItem>
                    </Select>
                    <Button disabled={playlistTitle === ''} onClick={upload}>
                        Add Playlist
                    </Button>
                </Col>
            </Row>
            <Row>
              <Col md={12}>
                    {progressVisible && (
                        <div className={classes.linerProgress}>
                            <LinearProgress />
                        </div>
                    )}
                    {message && (
                        <Alert variant="success" className="mt-3 upload_alert" show={alertVisible}>
                            <Alert.Heading>Add Result</Alert.Heading>
                            {message}
                        </Alert>
                    )}
              </Col>
            </Row>
            <Row>
                <Col md={3} className="card">
                  <List component="nav" aria-label="main mailbox folders">
                    
                    {playlistData && (
                        playlistData.map(item => {
                            return (
                                <ListItem button key={item.id}
                                            selected={currentPlaylistId == item.playlist_id}
                                            onClick={() => handleItemClick(item.playlist_id, item.playlist_title, item.playlist_status)}
                                 >
                                    <ListItemAvatar>
                                        <Avatar>
                                            {item.playlist_status == 1 ? <FolderIcon /> : <FolderSharedIcon />}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary={item.playlist_title} />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" aria-label="delete" disabled={currentPlaylistId !== item.playlist_id} onClick={() => setSettingShow(true)}>
                                            <SettingsIcon/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            )
                        })
                    )}

                  </List>
                </Col>
                <Col md={9}>
                    {videoInfos &&
                        <VideoList 
                            videoInfos={videoInfos}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            currentPage={pageNumber}
                            playlists={playlists}
                            currentPlaylistId={currentPlaylistId}
                            onChangeKeyword={handleChangeKeyword}
                            onChangePageNumber={handleChangePageNumber}
                            handleRemoveItem={handleRemoveItem}
                            handlePlayVideo={handlePlayVideo}
                            onChangePlaylist={handlePlaylist}
                        />
                    }
                </Col>
            </Row>
            <MyVerticallyCenteredModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                playUrl={playUrl}
                metaTitle={metaTitle}
            />
            <SettingDialog
                show={settingShow}
                onHide={() => setSettingShow(false)}
                onDelete={handleSettingShow}
                onSave={handleSettingSave}
                setCurrentPlaylistTitle={setCurrentPlaylistTitle}
                setCurrentPlaylistStatus={setCurrentPlaylistStatus}
                currentPlaylistTitle={currentPlaylistTitle}
                currentPlaylistStatus={currentPlaylistStatus}
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
                    <Button variant="success" size="sm" className="mr-3" onClick={() => props.handlePlayVideo(data.video_id, data.meta_title)}>Play</Button>
                    <Button variant="primary" size="sm" onClick={() => props.handleRemoveItem(data.id)}>Remove</Button>

                    <select  className="mr-2 float-right" onChange={(e) => props.onChangePlaylist(e, data.id)}>
                        <option value="">Non Playlist</option>
                        {props.playlists.map((item) => {
                            return <option selected={data.playlist_id == item.playlist_id}>{item.playlist_title}</option>;
                        })}
                    </select>
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
                <Paper style={{margin:"5px"}}>
                    <TextField
                        disabled
                        className={classes.margin}
                        value={props.currentPlaylistId && back_end_server + '/playlist/' + props.currentPlaylistId}
                        style={{width: "85%"}}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <InsertLink />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button onClick={() => {navigator.clipboard.writeText(back_end_server + '/playlist/' + props.currentPlaylistId)}}>Copy</Button>
                </Paper>
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
                        && (props.videoInfos.map((video, index) => {
                            if((props.currentPage-1)*props.itemsPerPage <=index && (props.currentPage)*props.itemsPerPage > index ) {
                                return renderItem(video)
                            } else {
                                return null
                            }
                        }))}
                </ListGroup>
                {showPagenationItem()}
            </div>
        </>
    );
}

