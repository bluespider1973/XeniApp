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
import MyVerticallyCenteredModal from '../Playlist/MyVerticallyCenteredModal';
import EditDialog from './EditDialog';

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
    const [metaDescription, setMetaDescription] = useState(null);
    const [videoId, setVideoId] = useState(null);
    const [currentVideoNumber, setCurrentVideoNumber] = useState(1);
    const [editShow, setEditShow] = useState(false);
    const [manualTitle, setManualTitle] = useState(undefined);
    const [manualDescription, setManualDescription] = useState(undefined);
    
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
        
                        let fileName = item.meta_keyword + item.meta_description + item.meta_title + item.manual_description + item.manual_title + getVideoId(item.video_id);
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

            let fileName = item.meta_keyword + item.meta_description + item.meta_title + item.manual_description + item.manual_title + getVideoId(item.video_id);
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

                let fileName = item.meta_keyword + item.meta_description + item.meta_title + item.manual_description + item.manual_title + getVideoId(item.video_id);
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

    function meta_restriction_age_str( meta){
		if( !meta)
			return "";
		return " [" + meta + "]";
	}

    // Play one video
    const handlePlayVideo = (video_url, meta_title, videoId, meta_restriction_age, meta_description) => {
        setModalShow(true);
        setPlayUrl(video_url);
        setMetaTitle(meta_title);
        setMetaDescription(meta_description);
        setVideoId( videoId);
    }

    const onNextVideo = () => {
        const index = videoData.findIndex(item => item.id == videoId);
        if (index >= videoData.length - 1) {
            return;
        }
        const nextUrl = videoData[index + 1].video_id;
        setVideoId( videoData[index + 1].id);
        setPlayUrl(nextUrl);
        setMetaTitle( videoData[index + 1].meta_title + meta_restriction_age_str( videoData[index + 1].meta_restriction_age))
        setMetaDescription( videoData[index + 1].meta_description )
        setCurrentVideoNumber( getCurrentVideoNumber() + 1)
    }

    const onPreviousVideo = () => {
        const index = videoData.findIndex(item => item.id == videoId);
        if (index <= 0) {
            return;
        }
        const prevUrl = videoData[index - 1].video_id;
        setVideoId(videoData[index - 1].id);
        setPlayUrl(prevUrl);
        setMetaTitle(videoData[index - 1].meta_title + meta_restriction_age_str( videoData[index - 1].meta_restriction_age))
        setMetaDescription( videoData[index - 1].meta_description )
        setCurrentVideoNumber(getCurrentVideoNumber() - 1)
    }

	function beep() {
		var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
		snd.play();
	}

    const onOpenSourceUrl = () => {
		//beep();
		//Pause curent video before launching a new one
        const index = videoData.findIndex(item => item.id == videoId);
        const nextUrl = videoData[index].video_id;
		window.open( nextUrl, '_blank');
	}

	const getCurrentVideoNumber = () => {
        return videoData.findIndex(item => item.id == videoId) + 1
    }

    const itemClick = (video_id, videoId) => {
        setPlayUrl(video_id);
        setVideoId(videoId);
        setMetaTitle(videoData.find(item=>item.id == videoId).meta_title);
        setMetaDescription(videoData.find(item=>item.id == videoId).meta_description);
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

    // edit save
    const onSave = () => {
        setEditShow(false);
        VideoService.setManualInfo(videoId, manualTitle, manualDescription);
        const index = videoData.findIndex(item => item.id == videoId);
        videoData[index].manual_title = manualTitle;
        videoData[index].manual_description = manualDescription;
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
                            setEditShow={setEditShow}
                            setManualTitle={setManualTitle}
                            setManualDescription={setManualDescription}
                            setVideoId={setVideoId}
                        />
                    }
                </Col>
            </Row>
            <MyVerticallyCenteredModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                playUrl={playUrl}
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                videoData={videoData}
                videoId={videoId}
                onPreviousVideo={onPreviousVideo}
                onNextVideo={onNextVideo}
                onOpenSourceUrl={onOpenSourceUrl}
                currentVideoNumber={currentVideoNumber}
                itemClick={itemClick}
            />
            <EditDialog
                show={editShow}
                onHide={() => setEditShow(false)}
                manualTitle={manualTitle}
                manualDescription={manualDescription}
                setManualTitle={setManualTitle}
                setManualDescription={setManualDescription}
                onSave={onSave}
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
                    <h5><span style={{color: 'green'}}>{data.manual_title ? data.manual_title : 'No manual title'}</span></h5>
                    <p style={{marginBottom: "0px"}}><span>ID : </span><code>{getVideoId(data.video_id)}</code></p>
                    <p style={{marginBottom: "2px"}}><span>{data.meta_description}</span></p>
                    <p style={{marginBottom: "2px"}}><span style={{color: 'green'}}>{data.manual_description ? data.manual_description : 'No manual description'}</span></p>
                    {data.meta_keyword && (
                        <p><small><span>Keywords : </span><span>{data.meta_keyword}</span></small></p>
                    )}
                    <p><small><i><span>Created Time : </span><span>{data.dateTime}</span></i></small></p>
                    
                    <Row>
                        <Col>
                            <Button variant="success" size="sm" className="mr-2" onClick={() => props.handlePlayVideo( data.video_id, data.meta_title, data.id, data.meta_restriction_age, data.meta_description)}>Play</Button>
                            <Button variant="info" size="sm" className="mr-2" 
                                onClick={() => {
                                    props.setManualTitle(data.manual_title);
                                    props.setManualDescription(data.manual_description);
                                    props.setEditShow(true);
                                    props.setVideoId(data.id);
                                }}
                            >
                                Edit
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => props.handleRemoveItem(data.id)}>Remove</Button>
                        </Col>
                        <Col>
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