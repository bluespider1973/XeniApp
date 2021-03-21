import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import InsertLink from '@material-ui/icons/InsertLink';
import InputAdornment from '@material-ui/core/InputAdornment';

import {
  Row,
  Col,
  Alert,
  Image,
  Button,
  ListGroup,
  Media,
} from 'react-bootstrap';

import ReceivedPlaylistService from '../../../services/received-playlist.service';
import GlobalData from '../../../tools/GlobalData';

const back_end_server = GlobalData.back_end_server_ip + ":3000";

const useStyles1 = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    marginLeft: theme.spacing(2.5),
  },
}));

function TablePaginationActions(props) {
  const classes = useStyles1();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleFirstPageButtonClick = (event) => {
    onChangePage(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onChangePage(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <div className={classes.root}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

const useStyles2 = makeStyles({
  table: {
    minWidth: 500,
  },
  pasteTextField: {
    width: '100%',
    marginBottom: 30
  }
});

export default function CustomPaginationActionsTable() {
  const classes = useStyles2();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [searchString, setSearchString] = useState('');
  const [errorText, setErrorText] = useState('');

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  useEffect(() => {
    if (!isLoaded) {
      ReceivedPlaylistService.getAllPlaylist()
        .then(async response => {
          if(response.data && response.data.length > 0) {
            setData(response.data);
            setRows(response.data);
          }
        })
      setIsLoaded(true)
    }
  })

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // playlistId
  const handleDelete = (id) => {
    ReceivedPlaylistService.removePlaylist(id)
      .then(response => {
          if (response.data.message === "success") {
              window.location.reload();
          }
      }).catch((err) => {
          const resMessage = (
              err.response &&
              err.response.data &&
              err.response.data.message
          ) || err.toString();

          console.log(resMessage);
      });
  }

  // custom
  const handleInsertPlaylist = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      addPlaylist();
    }
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      let arr = [...data];
      arr = arr.filter(item => item.playlist_title.includes(e.target.value));
      setRows(arr);
    }
  }

  const handleAddPlaylist = () => {
    addPlaylist();
  }

  function addPlaylist() {
    const playlist_id = newPlaylistUrl.split('/playlist/')[1];
    ReceivedPlaylistService.addPlaylist(playlist_id)
      .then(response => {
          if (response.data.message === "success") {
              window.location.reload();
          }
          if (response.data.message === "cannotregister") {
              setErrorText('The playlist is already registered.');
              setTimeout(() => {
                setErrorText('');
              }, 2000);
          }
      }).catch((err) => {
          const resMessage = (
              err.response &&
              err.response.data &&
              err.response.data.message
          ) || err.toString();

          console.log(resMessage);
      });

    document.getElementById('input-with-icon-textfield').value = '';
    setNewPlaylistUrl('');
  }

  return (
    <>
      {errorText &&
        <h3 style={{position: 'absolute', bottom: 100, right: 150, borderRadius: 5, background: 'rgba(0,200,50, 0.9)', padding: 30, width: 300, color: 'white'}}>{errorText}</h3>
      }
      <Row  className='mt-5'>
        <Col md={5}>
          <TextField
            className={classes.pasteTextField}
            id="input-with-icon-textfield"
            placeholder="Paste playlist url."
            onChange={(e) => setNewPlaylistUrl(e.target.value)}
            onKeyDown={handleInsertPlaylist}
            InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <InsertLink />
                  </InputAdornment>
            ),
            }}
          />
        </Col>
        <Col md={4}>
          <Button size='sm' onClick={handleAddPlaylist}>
            Add Playlist
          </Button>
        </Col>
        <Col md={3}>
          <TextField
            className={classes.pasteTextField}
            id="input-with-icon-textfield"
            placeholder="Search"
            onChange={(e) => setSearchString(e.target.value)}
            onKeyDown={handleSearch}
            InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
            ),
            }}
          />
        </Col>
      </Row>
      
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell align="center">Playlist Title</TableCell>
              <TableCell align="center">Sender</TableCell>
              <TableCell align="center">Video Count</TableCell>
              <TableCell align="center">Playlist Status</TableCell>
              <TableCell align="center">Received Date</TableCell>
              <TableCell align="center">Operate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : rows
            ).map((row, index) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">
                  {index + 1}
                </TableCell>
                <TableCell style={{ width: 160 }} align="center">
                  {row.playlist_title}
                </TableCell>
                <TableCell style={{ width: 160 }} align="center">
                  {row.sender_name}
                </TableCell>
                <TableCell style={{ width: 160 }} align="center">
                  {row.video_count}
                </TableCell>
                <TableCell style={{ width: 160 }} align="center">
                  {row.playlist_status ? 'Public' : 'Private'}
                </TableCell>
                <TableCell style={{ width: 160 }} align="center">
                  {row.dateTime}
                </TableCell>
                <TableCell style={{ width: 160 }} align="center">
                  <Button size='sm' style={{marginRight: 5}} href={back_end_server + '/playlist/' + row.playlist_id} target='_blank'>Open</Button>
                  <Button size='sm' variant='danger' onClick={() => handleDelete(row.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                colSpan={7}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </>
  );
}