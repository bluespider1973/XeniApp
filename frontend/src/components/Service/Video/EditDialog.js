import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import InputIcon from '@material-ui/icons/Create';
import InputAdornment from '@material-ui/core/InputAdornment';
import Modal from 'react-bootstrap/Modal';

import { Button } from 'react-bootstrap';

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

const EditDialog = (props) => {
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
                  Edit Title & Description
              </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><b>Manual title</b></p>
            <TextField
                className={classes.linkInput}
                id="input-with-icon-textfield-top"
                placeholder="Input manual title."
                value={props.manualTitle}
                onChange={(e) => props.setManualTitle(e.target.value)}
            />
            <br />
            <br />
            <p><b>Manual description</b></p>
            <TextField
                className={classes.linkInput}
                id="input-with-icon-textfield-top"
                placeholder="Input manual description."
                multiline={true}
                rows={3}
                value={props.manualDescription}
                onChange={(e) => props.setManualDescription(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
              <Button variant="success" onClick={props.onSave}>Save</Button>
              <Button variant="primary" onClick={props.onHide}>Close</Button>
          </Modal.Footer>
      </Modal>
  );
}

export default EditDialog;