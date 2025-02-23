import {useContext} from "react";
import ColorContext from "@/contexts/ColorContext";

const ModalHeader = ({title, onCloseButtonClick}) => {
    // const {colors} = useContext(ColorContext);
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                border: 'none',
                borderRadius: '0',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.08)',
            }}>
            <h5 className="modal-title" style={{color: "blue"}}>{title}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"
                    onClick={onCloseButtonClick}></button>
        </div>
    );
}

export default ModalHeader;