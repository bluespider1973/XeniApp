import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { Pagination } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import InputIcon from '@material-ui/icons/InsertLink';
import InputAdornment from '@material-ui/core/InputAdornment';
import Modal from 'react-bootstrap/Modal';
import ReactPlayer from 'react-player';

import {
    Row,
    Col,
    Alert,
    Image,
    Button,
    ListGroup,
    Media,
    Form,
} from 'react-bootstrap';

import PlaylistService from '../../../services/playlist.service';
import VideoService from '../../../services/video.service';
import { Collapse, LinearProgress } from '@material-ui/core';
import MultipleSelect from './MutipleSelect';

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
                <ReactPlayer url={props.playUrl} playing={true} width='100%' controls={true}/>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}


const VideoUpload = () => {
    const [message, setMessage] = React.useState("");
    const [pageNumber, setPageNumber] = React.useState(localStorage.getItem('page') ? Number(localStorage.getItem('page')) : 1);
    const [itemsPerPage] = React.useState(10);
    const [totalPages, setTotalPages] = React.useState(1);
    const [treeData, setTreeData] = useState('');
    const [selected, setSelected] = useState('root');
    const [alertVisible, setAlertVisible] = useState(false);
    const [expanded, setExpanded] = useState([]);
    const [videoUrl, setVideoUrl] = useState('');
    const [progressVisible, setProgressVisible] = useState(false);
    const [videoData, setVideoData] = useState([]);
    const [videoInfos, setVideoInfos] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [playUrl, setPlayUrl] = useState(null);
    const [metaTitle, setMetaTitle] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    
    useEffect(() => {
        setExpand()
    }, [])

    const setExpand = () => {
        const selectedNode = localStorage.getItem('selected');
        let expand = ['root'];
        if (selectedNode) {
            let y, m ,d;
            if (selectedNode.length === 4 && Number(selectedNode) > 1000) {
                y = selectedNode
                expand.push(y)
            } else if (selectedNode.length === 7) {
                y = selectedNode.split("-")[0];
                m = selectedNode.split("-")[1];
                expand.push(y)
                expand.push(y + '-' + m)
            } else if (selectedNode.length === 10) {
                y = selectedNode.split("-")[0];
                m = selectedNode.split("-")[1];
                d = selectedNode.split("-")[2];
                expand.push(y)
                expand.push(y + '-' + m)
                expand.push(y + '-' + m + '-' + d)
            }
        }
        setExpanded(expand)
    }

    // set tree data
    const setTree = (plain) => {
        const data = {
            id: 'root',
            name: 'All Videos',
            children: [],
        };
        plain.forEach(value => {
            let [year, month, day] = new Date(value.dateTime).toLocaleDateString('pt-br').split( '/' ).reverse( );

            let index = data.children.findIndex(item => item.id === String(year))
            if( index < 0) {
                data.children.push({
                    id: year.toString(),
                    name: year.toString(),
                    children: [{
                        id: year + '-' + month,
                        name: month,
                        children: [{
                            id: year + '-' + month + '-' + day,
                            name: day,
                        }]
                    }]
                })
            } else {
                let month_index = data.children[index].children.findIndex(item => String(item.id) === year+'-'+month)
                if (month_index < 0) {
                    data.children[index].children.push({
                        id: year+'-'+month,
                        name: month,
                        children: [{
                            id: year+'-'+month+'-'+day,
                            name: day,
                        }]
                    })
                } else {
                    let day_index = data.children[index].children[month_index].children.findIndex(item => String(item.id) === year+'-'+month+'-'+day)
                    if (day_index < 0) {
                        data.children[index].children[month_index].children.push({
                            id: year+'-'+month+'-'+day,
                            name: day,
                        })
                    }
                }
            }
            
        });
        
        setTreeData(data);
    }

    React.useEffect(() => {
        getAllVideos();

        //get playlists
        getAllPlaylists();
    }, [])

    const getAllPlaylists = () => {
        PlaylistService.getAllPlaylist()
            .then(async response => {
                if(response.data && response.data.length>0) {
                    setPlaylists(response.data);
                }
            })
    }

    const getAllVideos = () => {
        VideoService.getAllVideoList()
            .then(async response => {
                if(response.data && response.data.length>0) {
                    const res = response.data;
                    
                    for (const key in res) {
                        const videoId = res[key].id;
                        const result = await VideoService.getPlaylistIds(videoId);
                        res[key].arr = result.data.playlists;
                    }

                    setVideoData(res)
                    setTree(response.data)
                    
                    ///////
                    const nodeId = localStorage.getItem('selected');
                    let data = await response.data.filter(item => {
                        let [year, month, day] = new Date(item.dateTime).toLocaleDateString('pt-br').split( '/' ).reverse( );
        
                        let selectedYear = '';
                        let selectedMonth = '';
                        let selectedDay = '';
        
                        let fileName = item.meta_keyword + item.meta_description + item.meta_title + getVideoId(item.video_id);
                        fileName = fileName.trim().toLowerCase();
        
                        if (nodeId === 'root') {
                                return 1;
                        }
        
                        let selectedDate = '';
                        if (String(nodeId).length === 4) {
                            selectedYear = String(nodeId);
                            if (selectedYear === year) {
                                    return 1;    
                            }
                        }
                    
                        if (String(nodeId).length >= 6) {
                            selectedDate = nodeId.split('-');
                            selectedYear = selectedDate[0];
                            selectedMonth = selectedDate[1];
                            if (selectedYear === year && selectedMonth === month && nodeId.split('-').length === 2) {
                                    return 1;    
                            }
                            if (String(nodeId).length >= 8) {
                                selectedDay = nodeId.split('-')[2];
                                if (selectedYear === year && selectedMonth === month && selectedDay === day) {
                                        return 1;    
                                } else {
                                    return 0;
                                }
                            }
                        }
                        return 0;
                    });
                    
                    setVideoInfos(data);
                    
                    const total = Math.ceil(data.length/itemsPerPage);
                    setTotalPages(total);
                }
            })
    }

    const upload = () => {
        setProgressVisible(true);

        VideoService.uploadVideo(videoUrl)
            .then(response => {
                setMessage(response.data.message);
                setAlertVisible(true)
                setTimeout(() => {
                    setAlertVisible(false)
                }, 2000)

                setProgressVisible(false);

                if (response.data.message === 'success') {
                    getAllVideos();
                    setVideoUrl('');
                }
            })
    }

    const handleChangePageNumber = (pagenum)=>{
        setPageNumber(pagenum);
        localStorage.setItem('page', pagenum)
    }

    const handleChangeKeyword = (key) => {
        const keyword = key.trim().toLowerCase();
        const nodeId = selected;
        let data = videoData.filter(item => {
            let [year, month, day] = new Date(item.dateTime).toLocaleDateString('pt-br').split( '/' ).reverse( );

            let selectedYear = '';
            let selectedMonth = '';
            let selectedDay = '';

            let fileName = item.meta_keyword + item.meta_description + item.meta_title + getVideoId(item.video_id);
            fileName = fileName.trim().toLowerCase();

            if (nodeId === 'root') {
                if (keyword === "") {
                    return 1;    
                } else {
                    if (fileName.includes(keyword)) {
                        return 1;
                    }
                }
            }

            let selectedDate = '';
            if (String(nodeId).length === 4) {
                selectedYear = String(nodeId);
                if (selectedYear === year) {
                    if (keyword === "") {
                        return 1;    
                    } else {
                        if (fileName.includes(keyword)) {
                            return 1;
                        }
                    }
                }
            }
        
            if (String(nodeId).length >= 6) {
                selectedDate = nodeId.split('-');
                selectedYear = selectedDate[0];
                selectedMonth = selectedDate[1];
                if (selectedYear === year && selectedMonth === month && nodeId.split('-').length === 2) {
                    if (keyword === "") {
                        return 1;    
                    } else {
                        if (fileName.includes(keyword)) {
                            return 1;
                        }
                    }
                }
                if (String(nodeId).length >= 8) {
                    selectedDay = nodeId.split('-')[2];
                    if (selectedYear === year && selectedMonth === month && selectedDay === day) {
                        if (keyword === "") {
                            return 1;    
                        } else {
                            if (fileName.includes(keyword)) {
                                return 1;
                            }
                        }
                    } else {
                        return 0;
                    }
                }
            }
            return 0;
        });
        
        setVideoInfos(data);
    
        const total = Math.ceil(data.length / itemsPerPage);
        setTotalPages(total);

        localStorage.removeItem("page");
        setPageNumber(1);
    }

    const handleNodeSelect = (event, nodeId, keyword) => {
        if (keyword === "") {
            document.getElementById('input-with-icon-textfield').value = '';
        }
        {
            setSelected(nodeId);        // e.g. 2020-3-5
            localStorage.setItem("selected", nodeId);
            setExpand();
            let data = videoData.filter(item => {
                let [year, month, day] = new Date(item.dateTime).toLocaleDateString('pt-br').split( '/' ).reverse( );

                let selectedYear = '';
                let selectedMonth = '';
                let selectedDay = '';

                let fileName = item.meta_keyword + item.meta_description + item.meta_title + getVideoId(item.video_id);
                fileName = fileName.trim().toLowerCase();

                if (nodeId === 'root') {
                    if (keyword === "") {
                        return 1;    
                    } else {
                        if (fileName.includes(keyword)) {
                            return 1;
                        }
                    }
                }

                let selectedDate = '';
                if (String(nodeId).length === 4) {
                    selectedYear = String(nodeId);
                    if (selectedYear === year) {
                        if (keyword === "") {
                            return 1;    
                        } else {
                            if (fileName.includes(keyword)) {
                                return 1;
                            }
                        }
                    }
                }
            
                if (String(nodeId).length >= 6) {
                    selectedDate = nodeId.split('-');
                    selectedYear = selectedDate[0];
                    selectedMonth = selectedDate[1];
                    if (selectedYear === year && selectedMonth === month && nodeId.split('-').length === 2) {
                        if (keyword === "") {
                            return 1;    
                        } else {
                            if (fileName.includes(keyword)) {
                                return 1;
                            }
                        }
                    }
                    if (String(nodeId).length >= 8) {
                        selectedDay = nodeId.split('-')[2];
                        if (selectedYear === year && selectedMonth === month && selectedDay === day) {
                            if (keyword === "") {
                                return 1;    
                            } else {
                                if (fileName.includes(keyword)) {
                                    return 1;
                                }
                            }
                        } else {
                            return 0;
                        }
                    }
                }
                return 0;
            });
            
            setVideoInfos(data);
        
            const total = Math.ceil(data.length / itemsPerPage);
            setTotalPages(total);
        }

        localStorage.removeItem("page");
        setPageNumber(1);
    }

    const handleOnKeyDown = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            setVideoUrl(e.target.value);
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

        VideoService.changeVideoGroup(video_id, playlist_id)
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
            <Row className="mb-3">
                <Col md={12}>
                    <TextField
                        className={classes.linkInput}
                        id="input-with-icon-textfield-top"
                        placeholder="Paste your youtube video link."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        onKeyDown={(e) => handleOnKeyDown(e)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                            <InputIcon />
                            </InputAdornment>
                            ),
                        }}
                    />
                    <Button size="sm" style={{ width: "100px" }} disabled={videoUrl === ''} onClick={upload}>
                        Upload
                    </Button>
                    {progressVisible && (
                        <div className={classes.linerProgress}>
                            <LinearProgress />
                        </div>
                    )}
                    {message && (
                        <Alert variant="success" className="mt-3 upload_alert" show={alertVisible}>
                            <Alert.Heading>Upload Result</Alert.Heading>
                            {message}
                        </Alert>
                    )}
                </Col>
                
            </Row>
            
            <Row>
                <Col md={3} className="card">
                    <TreeView
                        className={classes.root}
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                        expanded={expanded}
                        onNodeSelect={(even, nodeIds) => handleNodeSelect(even, nodeIds, "")}
                    >
                        {treeData && renderTree(treeData)}
                    </TreeView>
                </Col>
                <Col md={9}>
                    {videoInfos &&
                        <VideoList 
                            videoInfos={videoInfos}
                            totalPages={totalPages}
                            itemsPerPage={itemsPerPage}
                            currentPage={pageNumber}
                            playlists={playlists}
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
                    
                    <Row>
                        <Col>
                            <Button variant="success" size="sm" className="mr-2" onClick={() => props.handlePlayVideo(data.video_id, data.meta_title)}>Play</Button>
                            <Button variant="primary" size="sm" onClick={() => props.handleRemoveItem(data.id)}>Remove</Button>
                        </Col>
                        <Col>
                            {console.log(data.arr)}
                            {props.playlists.length > 0 &&
                                <MultipleSelect names={props.playlists} videoId={data.id} a={data.arr} />
                            }
                            {/* <select  className="mr-2 float-right" onChange={(e) => props.onChangePlaylist(e, data.id)}>
                                <option value="">Non Playlist</option>
                                {props.playlists.map((item) => {
                                    return <option selected={data.playlist_id == item.playlist_id}>{item.playlist_title}</option>;
                                })}
                            </select> */}
                        </Col>
                    </Row>

                    
                    
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

export default VideoUpload