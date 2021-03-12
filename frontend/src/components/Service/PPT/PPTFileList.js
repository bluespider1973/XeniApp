import React from 'react';
import UploadService from '../../../services/file-upload.service';
import PPTService from '../../../services/ppt.service';

const PPTFileList = ()=> {

    const [currentFile, setCurrentFile] = React.useState(undefined);
    const [progress, setProgress] = React.useState(0);
    const [message, setMessage]=React.useState("");

    const [pptInfos, setPPTInfos] = React.useState([]);

    React.useEffect(()=>{
        PPTService.getPPTFiles()
            .then(response=>{
                setPPTInfos(response.data);
            })
    }, []);

    const selectFile = (event)=>{
        if(event.target.files[0]){
            setCurrentFile(event.target.files[0]);
            setProgress(0);
            setMessage("");
        }
    }

    const upload = ()=>{
        setProgress(0);
        UploadService.uploadPPT(currentFile, (event)=>{
            setProgress(Math.round((100*event.loaded)/event.total));
        }).then(response=>{
            setMessage(response.data.message)
            return PPTService.getPPTFiles();
        }).then(files=>{
            setPPTInfos(files.data);
        }).catch(error=>{
            const resMessage =
                (error.response &&
                    error.response.data &&
                    error.response.data.message) ||
                error.message ||
                error.toString();

            setMessage(resMessage);
            setProgress(0);
            setCurrentFile(undefined);
        })
    }

    return (
        <>
            <div className="row">
                <div className="col-md-4">
                    <label className="btn btn-default p-0">
                        <input type="file" accept=".pptx, .pptm" onChange={selectFile} />
                    </label>
                    <button className="btn btn-success btn-sm" style={{width:"100px"}} disabled={!currentFile} onClick={upload}>
                        Upload
                    </button>
                </div>
                <div className="col-md-8">
                    {currentFile && (
                        <div className="progress my-3">
                            <div
                                className="progress-bar progress-bar-info progress-bar-striped"
                                role="progressbar"
                                aria-valuenow={progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                                style={{width: progress+"%"}}
                            >
                                {progress}%
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className="alert alert-secondary mt-3" role="alert">
                            {message}
                        </div>
                    )}
                </div>
            </div>

            {pptInfos && <PPTList pptList={pptInfos} />}
        </>
    );
}

const PPTList = ({pptList})=>{
    return  (
        <>
            <div className="card mt-3">
                <div className="card-header">List of Files</div>
                <div className="list-group list-group-flush">
                    {pptList && pptList.map((img, index)=>(
                        <PPTListItem data={img} key={index} />
                    ))}
                </div>
            </div>
        </>
    )
}

const PPTListItem = ({data})=>{
    return (
    <div className="list-group-item">
        <div className="float-left">
            <div className="px-3">
                <h5><span>{data.id_counter}.File Name : </span><span>{data.file_name}</span></h5>
                <p><small><span>Created Time : </span><span>{data.dateTime}</span></small></p>
                <p><span>Id : </span><span>{data.ppt_id}</span></p>
                <p><span>Operation : </span><span>{data.operation}</span></p>
                {data.source_ppt_id && <p>{data.source_ppt_id}</p>}
                <a className="btn btn-success btn-sm mr-3" href={`/manage_ppt/edit_ppt/${data.ppt_id}`}>Edit PPT</a><a className="btn btn-primary btn-sm" href={data.url}>{`Download`}</a>
            </div>
        </div>
    </div>)
}

export default PPTFileList