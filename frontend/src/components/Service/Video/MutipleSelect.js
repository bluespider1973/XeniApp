import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { StepLabel } from '@material-ui/core';

import VideoService from '../../../services/video.service';

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(0),
    minWidth: 200,
    maxWidth: 250,
    float: 'right'
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultipleSelect(props) {
  const [myPlayLists, setMyPlayLists] = useState(props.a);

  const classes = useStyles();
  const theme = useTheme();

  const handleChange = (e) => {
    setMyPlayLists(e.target.value)

    // .then(response => {
    //     setMessage(response.data.message);
    //     setAlertVisible(true)
    //     setTimeout(() => {
    //         setAlertVisible(false)
    //     }, 2000)

    //     setProgressVisible(false);

    //     if (response.data.message === 'success') {
    //         getAllVideos();
    //         setVideoUrl('');
    //     }
    // })

  }

  const savePlaylist = () => {
    VideoService.addPlaylistIds(props.videoId, myPlayLists)
  }

  return (
    <div>
      <FormControl className={classes.formControl}>
        <Select
          labelId="demo-mutiple-name-label"
          id="demo-mutiple-name"
          multiple
          value={myPlayLists}
          onChange={handleChange}
          onClose={savePlaylist}
          input={<Input />}
          MenuProps={MenuProps}
        >
          {props.names.map((name) => (
            <MenuItem key={name.id} value={name.id}>
              {name.playlist_title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
