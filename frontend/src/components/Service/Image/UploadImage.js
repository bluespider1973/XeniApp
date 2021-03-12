import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { Pagination } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';

import {
    Row,
    Col,
    Alert,
    Image,
    Button,
    ListGroup,
    ProgressBar,
    Media,
} from 'react-bootstrap';

import UploadService from '../../../services/file-upload.service';
import ImageService from '../../../services/image.service';

const useStyles = makeStyles((theme) => ({
    root: {
        height: 110,
        flexGrow: 1,
        maxWidth: 400,
    },
    margin: {
        margin: theme.spacing(1),
    },
}));

const ImageUpload = () => {

    const [currentFile, setCurrentFile] = React.useState(undefined);
    const [previewImage, setPreviewImage] = React.useState(undefined);
    const [progress, setProgress] = React.useState(0);
    const [message, setMessage] = React.useState("");
    const [pageNumber, setPageNumber] = React.useState(localStorage.getItem('page') ? Number(localStorage.getItem('page')) : 1);
    const [itemsPerPage] = React.useState(10);
    const [totalPages, setTotalPages] = React.useState(1);
    const [imageInfos, setImageInfos] = React.useState([]);
    const [treeData, setTreeData] = useState('');
    const [selected, setSelected] = useState('root');
    const [imageData, setImageData] = useState([]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [allImage, setAllImage] = useState([]);
    const [expanded, setExpanded] = useState([]);

    useEffect(() => {
        setExpand()
    }, [])

    const setExpand = () => {
        // localStorage.getItem('selected') ? localStorage.getItem('selected')) :
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
            name: 'Images',
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
        ImageService.getImageFiles()
            .then(async response => {
                if(response.data && response.data.length>0) {
                    setImageData(response.data)
                    setTree(response.data)
                    
                    ///////
                    const nodeId = localStorage.getItem('selected');
                    let data = await response.data.filter(item => {
                        let [year, month, day] = new Date(item.dateTime).toLocaleDateString('pt-br').split( '/' ).reverse( );
        
                        let selectedYear = '';
                        let selectedMonth = '';
                        let selectedDay = '';
        
                        let fileName = item.file_name + item.description;
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
                    
                    setImageInfos(data);
                    
                    const total = Math.ceil(data.length/itemsPerPage);
                    setTotalPages(total);
                }
            })
        ImageService.getAllImageFiles()
            .then(response => {
                if(response.data && response.data.length>0) {
                    setAllImage(response.data)
                }
            })
    }, [])

    const upload = () => {
        setProgress(0);
        UploadService.uploadImage(currentFile, (event) => {
            setProgress(Math.round((100 * event.loaded) / event.total));
        }).then(response => {
            setMessage(response.data.message);
            setAlertVisible(true)
            setTimeout(() => {
                setAlertVisible(false)
            }, 2000)
            return ImageService.getImageFiles();
        }).then(files => {
            if(files.data && files.data.length>0){
                setImageData(files.data);
                setTree(files.data);
                setImageInfos(files.data);
                const total = Math.ceil(files.data.length/itemsPerPage);
                setTotalPages(total);
            }
        }).catch(error => {
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();

            setMessage(resMessage);
            setProgress(0);
            // setMessage("Could not upload the image!");
            setCurrentFile(undefined);
        })
    }

    const selectFile = (event) => {
        if (event.target.files[0]) {
            setCurrentFile(event.target.files[0]);
            setPreviewImage(URL.createObjectURL(event.target.files[0]));
            setProgress(0);
            setMessage("");
        }
    }

    const handleChangePageNumber = (pagenum)=>{
        setPageNumber(pagenum);
        localStorage.setItem('page', pagenum)
    }

    const handleGoFirstPage = () =>{
        setPageNumber(1);
    }

    const handleGoLastPage = () =>{
        setPageNumber(totalPages);
    }

    const handlePrevPage = () =>{
        if(pageNumber>1){
            const page = pageNumber - 1;
            setPageNumber(page);
        }
    }

    const handleNextPage = () =>{
        if(pageNumber<totalPages){
            const page = pageNumber + 1;
            setPageNumber(page);
        }
    }

    const handleChangeKeyword = (key) => {
        //handleNodeSelect(null, selected ? selected : 'root', );
        const keyword = key.trim().toLowerCase();
        const nodeId = selected;
        let data = allImage.filter(item => {
            let [year, month, day] = new Date(item.dateTime).toLocaleDateString('pt-br').split( '/' ).reverse( );

            let selectedYear = '';
            let selectedMonth = '';
            let selectedDay = '';

            let fileName = item.file_name + item.description;
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
        
        setImageInfos(data);
    
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
            let data = imageData.filter(item => {
                let [year, month, day] = new Date(item.dateTime).toLocaleDateString('pt-br').split( '/' ).reverse( );

                let selectedYear = '';
                let selectedMonth = '';
                let selectedDay = '';

                let fileName = item.file_name + item.description;
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
            
            setImageInfos(data);
        
            const total = Math.ceil(data.length / itemsPerPage);
            setTotalPages(total);
        }

        localStorage.removeItem("page");
        setPageNumber(1);
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
                <Col md={4}>
                    <label className="btn btn-default p-0">
                        <input type="file" accept="image/*" onChange={selectFile} />
                    </label>
                    <Button size="sm" style={{ width: "100px" }} disabled={!currentFile} onClick={upload}>
                        Upload
                    </Button>
                </Col>
                <Col md={8}>
                    {previewImage && (
                        <div className="text-center">
                            <Image className="preview" src={previewImage} alt="" />
                        </div>
                    )}
                    {currentFile && (
                        < ProgressBar className="my-3" min={0} max={100} now={progress} label={`${progress}%`} striped />
                    )}
                    
                    {message && (
                        <Alert variant="success" className="mt-3 upload_alert" show={alertVisible}>
                            <Alert.Heading>Upload Completed!</Alert.Heading>
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
                        //defaultExpanded={['root']}
                        defaultExpandIcon={<ChevronRightIcon />}
                        expanded={expanded}
                        onNodeSelect={(even, nodeIds) => handleNodeSelect(even, nodeIds, "")}
                    >
                        {treeData && renderTree(treeData)}
                    </TreeView>
                </Col>
                <Col md={9}>
                    {imageInfos
                    && <ImageList 
                        image_list={imageInfos}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        currentPage={pageNumber}
                        onChangeKeyword={handleChangeKeyword}
                        onChangePageNumber={handleChangePageNumber}
                        onGoFirstPage={handleGoFirstPage}
                        onGoLastPage={handleGoLastPage}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePrevPage}
                        />
                    }
                </Col>
            </Row>
        </>
    );
}

const ImageList = (props) => {
    const classes = useStyles();

    const getFileName = (filename) =>{
        let fname = filename.split("_");
        fname.shift();
        return fname.join("_");
    }
    const renderItem = (data) => (
        <ListGroup.Item key={data.image_id}>
            <Media>
                <Image thumbnail src={data.thumb_url} className="mr-3" />
                <Media.Body>
                    <h5><span>{`${data.id_counter}. File Name : `}</span><span>{getFileName(data.file_name)}</span></h5>
                    <p style={{marginBottom: "0px"}}><span>Id : </span><span>{data.image_id}</span></p>
                    <p style={{marginBottom: "0px"}}><small><span>Created Time : </span><span>{data.dateTime}</span></small></p>
                    <p><small><span>Description : </span><span>{data.description || "No description"}</span></small></p>
                    <Link to={`/edit_image/${data.image_id}`}><Button variant="success" size="sm" className="mr-3">Edit Image</Button></Link>
                    <Button variant="primary" size="sm" href={data.url}>Download</Button>
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
                <h3 className="card-header">List of Images</h3>
                <ListGroup variant="flush">
                    {props.image_list
                        && props.image_list.map((img, index) => {
                            if((props.currentPage-1)*props.itemsPerPage <=index && (props.currentPage)*props.itemsPerPage > index )
                            return renderItem(img)
                        })}
                </ListGroup>
                {showPagenationItem()}
            </div>
        </>
    );
}

export default ImageUpload