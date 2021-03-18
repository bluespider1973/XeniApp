import Modal from 'react-bootstrap/Modal';
import ReactPlayer from 'react-player';
import { Paper } from '@material-ui/core';

import {
    Button,
    Row,
    Col,
} from 'react-bootstrap';

const MyVerticallyCenteredModal = (props) => {
    return (
        <Modal
            {...props}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton maxButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.metaTitle}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={10}>
                        <ReactPlayer url={props.playUrl} playing={true} width='100%' height='auto' controls={true} />
                        <p><b>Description: </b>{props.metaDescription}</p>
                        {/**{props.videoData.length > 0 && props.videoData[props.currentVideoNumber] && props.videoData[props.currentVideoNumber].meta_description} */}
                    </Col>
                    <Col md={2} style={{borderLeft: '2px solid gray'}}>
                        <h5>Video Titles</h5>
                        {props.videoData.length > 0 &&
                            props.videoData.map(item => {
                                return (
                                    <Paper style={{cursor: 'pointer'}} onClick={() => props.itemClick(item.video_id)}><p style={{overflow: 'hidden', height: '25px'}}>{item.meta_title.substring(0, 18)+' ...'}</p></Paper>
                                )
                            })
                        }
                    </Col>
                </Row>
            </Modal.Body>
            <Modal.Footer>
                {/* <p style={{marginRight: '5%'}}>{props.currentVideoNumber} of {Object.keys(props.videoData).length}</p> */}
                <Button style={{marginRight: '30px'}} variant="info" onClick={props.onOpenSourceUrl}>Source with Bookmark</Button>
                <Button variant="primary" onClick={props.onPreviousVideo}>Previous</Button>
                <Button style={{marginRight: '30px'}} variant="primary" onClick={props.onNextVideo}>Next</Button>
                <Button variant="danger" onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default MyVerticallyCenteredModal;