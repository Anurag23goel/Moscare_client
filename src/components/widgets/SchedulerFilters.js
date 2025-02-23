import React, {useState} from 'react';
import InputField from '@/components/widgets/InputField';
import {Col, Modal, Row} from 'react-bootstrap';
import Button from '@/components/widgets/MaterialButton';
import {Close as CloseIcon, FilterList as FilterIcon} from '@mui/icons-material';
import styles from '@/styles/scheduler.module.css';


const SchedulerFilters = ({clients, formState, handleChange, handleViewChange, view, initialValues, applyFilters}) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleApply = () => {
        applyFilters();
        handleClose();
    };

    return (
        <>
            <Button
                label="Filter"
                variant="outlined"
                color="primary"
                size={"small"}
                startIcon={<FilterIcon/>}
                onClick={handleShow}
                className={styles.refreshButtonCustom}
            />

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Filter Options</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="mb-4 mt-2">
                        <Col>
                            <InputField
                                id="allWorkerWithShifts"
                                label=""
                                onChange={handleChange}
                                type="select"
                                value={initialValues.allWorkerWithShifts}
                                options={[
                                    {value: "All Workers With Shifts", label: "All Workers With Shifts"},
                                    {value: "1", label: "1"},
                                    {value: "2", label: "2"},
                                    {value: "3", label: "3"},
                                ]}
                            />
                        </Col>
                        <Col>
                            <InputField
                                id="allWorkerDivisions"
                                label=""
                                onChange={handleChange}
                                type="select"
                                value={initialValues.allWorkerDivisions}
                                options={[
                                    {value: "All Worker Divisions", label: "All Worker Divisions"},
                                    {value: "1", label: "1"},
                                    {value: "2", label: "2"},
                                    {value: "3", label: "3"},
                                ]}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>
                            <InputField
                                id="clientCaseManagers"
                                label=""
                                onChange={handleChange}
                                type="select"
                                value={initialValues.clientCaseManagers}
                                options={[
                                    {value: "All Client Case Managers", label: "All Client Case Managers"},
                                    {value: "1", label: "1"},
                                    {value: "2", label: "2"},
                                    {value: "3", label: "3"},
                                ]}
                            />
                        </Col>
                        <Col>
                            <InputField
                                id="allWorkerWithRoles"
                                label=""
                                onChange={handleChange}
                                type="select"
                                value={initialValues.allWorkerWithRoles}
                                options={[
                                    {value: "All Workers With Roles", label: "All Workers With Roles"},
                                    {value: "1", label: "1"},
                                    {value: "2", label: "2"},
                                    {value: "3", label: "3"},
                                ]}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-4">
                        <Col md={6}>
                            <InputField
                                id="date"
                                type="date"
                                value={initialValues.date}
                                onChange={handleChange}
                            />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        label="Close"
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<CloseIcon/>}
                        onClick={handleClose}
                    />
                    <Button
                        label="Apply"
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleApply}
                    />
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SchedulerFilters;