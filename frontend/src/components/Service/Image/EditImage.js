import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Stage, Layer, Image } from 'react-konva';
import {
    Button,
    ListGroup,
    OverlayTrigger,
    Tooltip,
} from 'react-bootstrap';
import Pagination from '@material-ui/lab/Pagination';

import ImageService from '../../../services/image.service';
import Auth from "../../../services/auth.service";
import GlobalData from '../../../tools/GlobalData';
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import { makeStyles } from '@material-ui/core/styles';

const back_end_server = GlobalData.back_end_server_ip + ":" + GlobalData.back_end_server_port;

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

const MyVerticallyCenteredModal = (props) => {
    const onSaveClick = (event) => {
        props.onAddDescription(props.description)
        props.onHide()
    }

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Input Description
            </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5>📝 Please enter your description to the selected image.</h5>
                <Form.Control as="textarea" rows={3} name="description" value={props.description} onChange={props.handleInputChange} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>Close</Button>
                <Button variant="primary" onClick={onSaveClick}>Save changes</Button>
            </Modal.Footer>
        </Modal>
    );
}

const EditImage = (props) => {
    const [imageInfos, setImageInfos] = React.useState(undefined);
    const [imageId, setImageId] = React.useState('');
    const [imageSrc, setImageSrc] = React.useState('');
    const [imageDescription, setImageDescription] = useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [currentUser] = React.useState(Auth.getCurrentUser());
    const [imageHistory, setImageHistory] = React.useState(undefined);
    const [orginImageHistory, setOrginImageHistory] = useState(undefined);
    const [lastId, setLastId] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);
    const [pageNumber, setPageNumber] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalPage, setTotalPage] = useState(1);
    const [modalShow, setModalShow] = React.useState(false);
    const [isRotate, setIsRotate] = useState(undefined)
    const [isEditDescription, setIsEditDescription] = useState(undefined)

    React.useEffect(() => {
        ImageService.getImageFiles()
            .then(files => {
                setImageInfos(files.data);
                const iid = props.match.params.image_id;
                return ImageService.getImageHistory(iid);
            }).then(response => {
                setOrginImageHistory(response.data);
                setImageHistory(response.data);
                setTotalPage(Math.ceil(response.data.length / itemsPerPage));
            }).catch((err) => {
                const resMessage = (
                    err.response &&
                    err.response.data &&
                    err.response.data.message
                ) || err.toString();
                setIsLoading(false);
                setErrorMessage(resMessage);
            });
    }, [props]);

    React.useEffect(() => {
        if (imageHistory && imageHistory.length > 0) {
            const first_id = imageHistory[0].image_id;
            const last_id = imageHistory[imageHistory.length - 1].image_id;
            setLastId(last_id);

            if (isRotate && !isEditDescription) {
                setImageId(last_id)
                setTotalPage(Math.ceil(imageHistory.length / itemsPerPage));
                setPageNumber(totalPage)
                setIsRotate(false)
            } else if (!isRotate && isEditDescription) {
                setIsEditDescription(false)
            } else {
                setImageId(first_id)
            }

            setIsLoading(false);
        }
    }, [imageHistory]);

    React.useEffect(() => {
        setImageSrc(ImageService.getImage(imageId));
    }, [imageId]);

    const handleRotateImage = () => {
        const payload = {
            imageId: imageId,
            degree: 90,
            clock: true,
        }
        setIsLoading(true);
        ImageService.rotateImage(payload).then(response => {
            ImageService.getImageHistory(response.data.imageId).then(response => {
                setImageHistory(response.data);
                setTotalPage(Math.ceil(response.data.length / itemsPerPage));
            }).catch(err => {

            })
            setErrorMessage('');
        }).catch((err) => {
            const resMessage = (
                err.response &&
                err.response.data &&
                err.response.data.message
            ) || err.toString();
            setIsLoading(false);
            setErrorMessage(resMessage);
        });
        setIsRotate(true);
    }

    const handleEditImage = () => {
        setModalShow(true);
        setImageDescription(imageHistory.find(item => item.image_id === imageId).description)
        setIsEditDescription(true)
    }

    const handleAddDescription = (desc) => {
        const data = {
            imageId: imageId,
            imageDescription: desc
        }
        ImageService.addImageDescription(data).then(response => {
            const index = imageHistory.findIndex(item => item.image_id === imageId)
            const history = [...imageHistory];
            history[index].description = desc;
            setImageHistory(history);
            setErrorMessage('');
        }).catch((err) => {
            const resMessage = (
                err.response &&
                err.response.data &&
                err.response.data.message
            ) || err.toString();
            setIsLoading(false);
            setErrorMessage(resMessage);
        })
    }

    const handleInputChange = (e) => {
        setImageDescription(e.target.value);
    }

    const onClickHistory = (id) => {
        setImageId(id);
    }

    const removeImage = (image_id) => {
        let arr = [...imageHistory];
        if (arr.length === 1) {
            const confirm = window.confirm("Are you sure remove the last image?");
            if (confirm) {
                ImageService.removeImage(image_id).then((response) => {
                    props.history.push("/upload_image");
                }).catch((err) => {
                    const resMessage = (
                        err.response &&
                        err.response.data &&
                        err.response.data.message
                    ) || err.toString();
                    setIsLoading(false);
                    setErrorMessage(resMessage);
                });
            }
        } else {
            ImageService.removeImage(image_id).then((response) => {
                arr = arr.filter(item => item.image_id !== image_id)
                setImageHistory(arr);
            }).catch((err) => {
                const resMessage = (
                    err.response &&
                    err.response.data &&
                    err.response.data.message
                ) || err.toString();
                setIsLoading(false);
                setErrorMessage(resMessage);
            });
        }
    }

    const handleNextImage = () => {
        const iid = props.match.params.image_id;
        var nextImageId = null;
        if (imageInfos && imageInfos.length > 0) {
            for (let i = 0; i < imageInfos.length - 1; i++) {
                if (imageInfos[i].image_id === iid) {
                    nextImageId = imageInfos[i + 1].image_id;
                    break;
                }
            }
        }
        if (nextImageId) {
            props.history.push(`/edit_image/${nextImageId}`);
        }
    }

    const handlePrevImage = () => {
        const iid = props.match.params.image_id;
        var prevImageId = null;
        if (imageInfos && imageInfos.length > 0) {
            for (let i = 1; i < imageInfos.length; i++) {
                if (imageInfos[i].image_id === iid) {
                    prevImageId = imageInfos[i - 1].image_id;
                    break;
                }
            }
        }
        if (prevImageId) {
            props.history.push(`/edit_image/${prevImageId}`);
        }
    }

    const handleChangePageNumber = (pagenum) => {
        setPageNumber(pagenum);
    }

    useEffect(() => {
        if (imageHistory) {
            const total = Math.ceil(imageHistory.length / itemsPerPage);
            setTotalPage(total);
            isRotate && setPageNumber(total);
        }
    })

    // search
    const doSomethingWith = (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            const keyword = e.target.value;

            const data = orginImageHistory.filter(item => {
                let fileName = item.file_name + item.description;
                fileName = fileName.trim().toLowerCase();

                if (fileName.includes(keyword)) {
                    return 1;
                } else {
                    return null;
                }
            })

            setImageHistory(data);

            const total = Math.ceil(data.length / itemsPerPage);
            setTotalPage(total);
            setPageNumber(1);
        }
    }

    const classes = useStyles();

    return (
        <div className="container-fluid">
            {errorMessage && (
                <div>
                    {errorMessage}
                </div>
            )}
            {/* <Link to=> */}
                <Button className="btn-circle" href='/upload_image'>
                    Going Back
                </Button>
            {/* </Link> */}
            <div className="justify-content-center">
                <div className="float-lg-left float-md-left mr-3 url-image" style={{ width: "500px", height: "400px" }}>
                    <Stage width={500} height={400}>
                        <Layer>
                            <URLImage src={imageSrc} width={500} height={400} />
                        </Layer>
                    </Stage>
                    <h4 className="ml-1 my-2">Image Operations</h4>
                    <Button variant="success" className="my-1 mr-1" onClick={handleRotateImage} disabled={lastId !== imageId || isLoading}>
                        {isLoading && (
                            <span className="spinner-border spinner-border-sm"></span>
                        )}
                        <span>Rotate Image</span>
                    </Button>
                    <Button variant="success" className="my-1 mr-1" onClick={handleEditImage}>
                        Edit Description
                    </Button>
                    <Button variant="primary" className="my-3 mr-3"
                        href={`${back_end_server}/api/image/getImageFile/${imageId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&type=download`}>
                        Download
                    </Button>
                    <Button variant="outline-info" className="my-1 mr-1" onClick={() => { handlePrevImage() }}>{'<<'}</Button>
                    <Button variant="outline-info" className="m1-3 mr-1" onClick={() => { handleNextImage() }}>{'>>'}</Button>
                </div>
                <div className="float-lg-left float-md-left " style={{ width: "500px" }}>
                    <TextField
                        className={classes.margin}
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
                    <ImageHistory
                        imageHistory={imageHistory}
                        activeImageId={imageId}
                        onRemove={removeImage}
                        totalPage={totalPage}
                        currentPage={pageNumber}
                        itemsPerPage={itemsPerPage}
                        itemClick={onClickHistory}
                        onChangePageNumber={handleChangePageNumber}
                    />
                    <Pagination color="primary" shape="rounded" className="m-3" count={totalPage} page={pageNumber} onChange={(event, val) => setPageNumber(val)} />
                </div>
                <MyVerticallyCenteredModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    description={imageDescription}
                    onAddDescription={handleAddDescription}
                    onChange={handleInputChange}
                />
            </div>
        </div>

    )
}

const ImageHistory = ({ imageHistory, activeImageId, onRemove, itemClick, currentPage, itemsPerPage }) => {
    const getIsActive = (image_id) =>
    (image_id === activeImageId ?
        "dark" :
        ""
    );

    const getFileName = (filename) => {
        let fname = filename.split("_");
        fname.shift();
        return fname.join("_");
    }

    const renderItem = (ih) => (
        <ListGroup.Item key={ih.image_id} variant={getIsActive(ih.image_id)} className="cursor-pointer" onClick={() => itemClick(ih.image_id)}>
            <div>
                <h6>File Name : <span>{getFileName(ih.file_name)}</span></h6>
                <OverlayTrigger
                    key={"right"}
                    placement={"right"}
                    overlay={
                        <Tooltip id={`remove`}>Remove image</Tooltip>
                    }
                >
                    <button type="button" className="close" onClick={() => { onRemove(ih.image_id) }}>
                        <span aria-hidden="true" style={{ color: "red" }}>×</span>
                        <span className="sr-only">Close</span>
                    </button>
                </OverlayTrigger>
            </div>
            <p style={{ marginBottom: "0px" }}><small><span style={{ fontWeight: 500 }}>Image Id: </span><span>{ih.image_id}</span></small></p>
            <p style={{ marginBottom: "0px" }}><small><span style={{ fontWeight: 500 }}>Description: </span><span>{ih.description || "No description"}</span></small></p>
            <p style={{ marginBottom: "0px" }}><span style={{ fontWeight: 500 }}>Source Image: </span><span>{ih.source_image_id || "Main image"}</span></p>
        </ListGroup.Item>
    );

    return (
        <ListGroup className="list-group">
            {imageHistory && imageHistory.length > 0 && (
                imageHistory.map((ih, index) => {
                    if ((currentPage - 1) * itemsPerPage <= index && (currentPage) * itemsPerPage > index)
                        return renderItem(ih)
                    else {
                        return null
                    }
                })
            )}
        </ListGroup>
    )
}

class URLImage extends React.Component {
    state = {
        image: null,
        width: 0,
        height: 0,
    };
    componentDidMount() {
        this.loadImage();
    }
    componentDidUpdate(oldProps) {
        if (oldProps.src !== this.props.src) {
            this.loadImage();
        }
    }
    componentWillUnmount() {
        this.image.removeEventListener('load', this.handleLoad);
    }
    loadImage() {
        // save to "this" to remove "load" handler on unmount
        this.image = new window.Image();
        this.image.src = this.props.src;
        this.image.addEventListener('load', this.handleLoad);
    }
    handleLoad = () => {
        // after setState react-konva will update canvas and redraw the layer
        // because "image" property is changed
        this.setState({
            image: this.image
        });

        const ratio = Math.min(Math.min(this.props.width, this.image.width) / this.image.width, Math.min(this.props.height, this.image.height) / this.image.height);

        this.setState({
            width: ratio * this.image.width,
            height: ratio * this.image.height
        })
    };
    render() {
        return (
            <Image
                x={this.props.x}
                y={this.props.y}
                width={this.state.width}
                height={this.state.height}
                image={this.state.image}
                ref={node => {
                    this.imageNode = node;
                }}
            />
        );
    }
}

export default EditImage;
