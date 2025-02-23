import React from 'react';
import {Button, Modal} from '@mui/material';
import styles from '@/styles/scheduler.module.css';

const PublishPreviewModal = ({open, onClose, changes}) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="publish-preview-modal-title"
            aria-describedby="publish-preview-modal-description"
        >
            <div className={styles.modalContent}>
                <h2 id="publish-preview-modal-title">Shift Changes Preview</h2>
                <div id="publish-preview-modal-description">
                    {changes.map((change, index) => (
                        <div key={index} className={styles.changePreview}>
                            <h4>Change {index + 1}</h4>
                            <p><strong>Old Worker:</strong> {change.oldWorker?.name || 'Unallocated'}</p>
                            <p><strong>New Worker:</strong> {change.newWorker.name}</p>
                            <p><strong>Old Shift Start:</strong> {new Date(change.oldShiftStart).toLocaleString()}</p>
                            <p><strong>New Shift Start:</strong> {new Date(change.newShiftStart).toLocaleString()}</p>
                            <p><strong>Old Shift End:</strong> {new Date(change.oldShiftEnd).toLocaleString()}</p>
                            <p><strong>New Shift End:</strong> {new Date(change.newShiftEnd).toLocaleString()}</p>
                            <hr/>
                        </div>
                    ))}
                </div>
                <Button variant="contained" className={styles.closeButton} onClick={onClose}>
                    Close
                </Button>
            </div>
        </Modal>
    );
};


export default PublishPreviewModal;
