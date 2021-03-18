import Modal from 'react-bootstrap/Modal';
import ReactPlayer from 'react-player';
import { Paper } from '@material-ui/core';

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import {
    Button,
    Row,
    Col,
} from 'react-bootstrap';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
}));

const MyVerticallyCenteredModal = (props) => {

    const classes = useStyles();

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
                    <Col md={9}>
                        <ReactPlayer url={props.playUrl} playing={true} width='100%' height='auto' controls={true} />
                        <p><i>{props.metaDescription}</i></p>
                    </Col>
                    <Col md={3} style={{borderLeft: '1px solid lightgray'}}>
                        <h5><u>More Videos</u></h5>
                        <Paper style={{height: 450, overflow: 'auto'}}>
                        <List className={classes.root} style={{overflowY: 'auto'}} height='100%'>
                            
                            {props.videoData.length > 0 &&
                                props.videoData.map(item => {
                                    return (
                                    <>
                                        <ListItem alignItems="flex-start" 
                                            button 
                                            onClick={() => props.itemClick(item.video_id, item.id)}
                                            selected={props.videoId == item.id}
                                        >
                                            <ListItemAvatar>
                                                <Avatar alt="Remy Sharp" src={item.meta_image} />
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={item.meta_title.substring(0, 20) + '...'}
                                                secondary={
                                                    <React.Fragment>
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        className={classes.inline}
                                                        color="textPrimary"
                                                    >
                                                       {item.meta_description.substring(0, 38) + '...'}
                                                    </Typography>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                        <Divider variant="inset" component="li" />
                                        {/* <Paper style={{cursor: 'pointer'}} ><p style={{overflow: 'hidden', height: '25px'}}>{item.meta_title.substring(0, 18)+' ...'}</p></Paper> */}
                                    </>
                                    )
                                })
                            }
                        </List>
                        </Paper>
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