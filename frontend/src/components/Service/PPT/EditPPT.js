import React from 'react';
import PPTService from '../../../services/ppt.service';
import Auth from "../../../services/auth.service";


import GlobalData from '../../../tools/GlobalData';

const back_end_server = GlobalData.back_end_server_ip + ":" + GlobalData.back_end_server_port;

const EditPPT = (props) => {
    
    const [pptId, setPPTId] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [currentUser] = React.useState(Auth.getCurrentUser());
    const [pptHistory, setPPTHistory] = React.useState(undefined);
    const [lastId, setLastId] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const iid = props.match.params.ppt_id;
        PPTService.getPPTHistory(iid).then(response=>{
            setPPTHistory(response.data);
        }).catch(err=>{

        })
    }, [props]);

    React.useEffect(()=>{
        if(pptHistory && pptHistory.length>0){
            const last_id = pptHistory[pptHistory.length-1].ppt_id;
            setLastId(last_id);
            setPPTId(last_id);
            setIsLoading(false);
        }
    }, [pptHistory]);

    const handleAddNewSlide = () => {
        const payload = {
            pptId,
        }
        setIsLoading(true);
        PPTService.addNewSlidePPT(payload).then(response => {
            PPTService.getPPTHistory(response.data.pptId).then(response=>{
                console.log(response.data);
                setPPTHistory(response.data);
            }).catch(err=>{

            })
            setErrorMessage('');
        }).catch(err => {
            const resMessage=(
                err.response &&
                err.response.data &&
                err.response.data.message
            ) || err.toString();
            setIsLoading(false);
            setErrorMessage(resMessage);
        });
    }

    const onClickHistory=(id)=>{
        console.log(id);
        setPPTId(id);
    }

    return (
        <div className="container-fluid">
            {errorMessage && (
                <div>
                    {errorMessage}
                </div>
            )}
            <div className="justify-content-center">
                <div className="float-lg-left float-md-left" style={{ width: "500px" }}>
                    <button className="btn btn-primary mx-2" onClick={()=>{handleAddNewSlide()}} disabled={lastId!==pptId || isLoading}>
                        {isLoading && (
                            <span className="spinner-border spinner-border-sm"></span>
                        )}
                        <span>Add New Slide</span>
                    </button>
                    <a className="btn btn-primary"
						href={`${back_end_server}/api/ppt/getPPTFile/${pptId}?user_id=${currentUser.user_id}&user_key=${currentUser.access_key}&type=download`}>Download</a>
                    <PPTHistory pptHistory={pptHistory} activePPTId={pptId} itemClick={onClickHistory} />
                </div>
            </div>
        </div>
    )
}

const PPTHistory=({pptHistory, activePPTId,  itemClick})=>{

    return (
        <div className="list-group">
            {pptHistory && pptHistory.length>0 && (
                pptHistory.map((ih, index)=>(
                    <div className={ih.ppt_id===activePPTId?"list-group-item cursor-pointer active":"list-group-item cursor-pointer"} key={index} onClick={()=>itemClick(ih.ppt_id)}>
                        <div>File Name : <span>{ih.file_name}</span></div>
                        <div>PPT Id: <span>{ih.ppt_id}</span></div>
                        <div>Source PPT: <span>{ih.source_ppt_id}</span></div>
                    </div>
                ))
            )}
        </div>
    )
}

export default EditPPT;
