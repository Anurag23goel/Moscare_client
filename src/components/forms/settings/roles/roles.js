import React, {useEffect, useState} from 'react';
import InputField from '@/components/widgets/InputField';
import {fetchData, postData} from '@/utility/api_utility';
import Button from '@/components/widgets/MaterialButton';
import {Col, Container, Row} from 'react-bootstrap';
import AddIcon from '@mui/icons-material/Add';
import {Typography} from '@mui/material';
import styles from '@/styles/roles.module.css'; // Import the CSS module
import ParentMenuCard from './ParentMenuCard';
import ChildMenuList from './ChildMenuList';
import SubChildMenuList from './SubChildMenuList';

const UserRoles = () => {
    const [form, setForm] = useState({RoleId: '', RoleDescription: '', ReadOnly: 1});
    const [menuData, setMenuData] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [output, setOutput] = useState('');
    const [errors, setErrors] = useState({});
    const [currentParent, setCurrentParent] = useState(null);
    const [currentChild, setCurrentChild] = useState(null);
    const [selectedMenus, setSelectedMenus] = useState({});

    useEffect(() => {
        const fetchParentMenus = async () => {
            try {
                const parentMenus = await fetchData('/api/getParentMenuData');
                setMenuData(parentMenus);
            } catch (error) {
                console.error('Error fetching parent menus:', error);
            }
        };

        fetchParentMenus();
    }, []);

    const handleChange = (event) => {
        setForm({...form, [event.target.id]: event.target.value});
    };

    const handleParentSelect = (parent) => {
        setCurrentParent(parent);
    };

    const handleChildSelect = (child) => {
        setCurrentChild(child);
    };

    const handleMenuSelection = (menuId, isChecked, level) => {
        setSelectedMenus((prev) => {
            const updated = {...prev};
            if (isChecked) {
                if (!updated[menuId]) {
                    updated[menuId] = {Menu_ID: menuId, ReadOnly: form.ReadOnly};
                }
            } else {
                delete updated[menuId];
            }
            return updated;
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.RoleId) newErrors.RoleId = 'Role ID is required';
        if (!form.RoleDescription) newErrors.RoleDescription = 'Role Description is required';
        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsSubmitting(true);

        // Flatten the selectedMenus object into an array
        const flattenedSelectedMenus = Object.values(selectedMenus);

        const formData = {
            RoleId: form.RoleId,
            RoleDescription: form.RoleDescription,
            SelectedMenus: flattenedSelectedMenus,
            ReadOnly: form.ReadOnly,
        };

        try {
            const response = await postData('/api/insertRole', formData);
            if (response.success) {
                setOutput('Role added successfully');
                clearForm();
            } else {
                setOutput('Failed to add role');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setOutput('An error occurred while adding the role.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setForm({RoleId: '', RoleDescription: '', ReadOnly: 1});
        setErrors({});
        setSelectedMenus({});
        setCurrentParent(null);
        setCurrentChild(null);
    };

    const handleBackToParent = () => {
        setCurrentParent(null);
        setCurrentChild(null);
    };

    const handleBackToChild = () => {
        setCurrentChild(null);
    };

    return (
        <div>
            {output && (
                <div
                    className={
                        output.includes('successfully') ? styles.successMessage : styles.failureMessage
                    }
                >
                    {output}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <Container className={styles.container}>
                    <Row className={styles.header}>
                        <Col>
                            <Typography variant="h4">Create New Role</Typography>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={4}>
                            <InputField
                                id="RoleId"
                                label="Role ID"
                                value={form.RoleId}
                                onChange={handleChange}
                                error={errors.RoleId}
                                helperText={errors.RoleId}
                            />
                        </Col>
                        <Col md={4}>
                            <InputField
                                id="RoleDescription"
                                label="Role Description"
                                value={form.RoleDescription}
                                onChange={handleChange}
                                error={errors.RoleDescription}
                                helperText={errors.RoleDescription}
                            />
                        </Col>
                    </Row>
                    <Typography variant="h5" gutterBottom>
                        Select Menus for the Role
                    </Typography>

                    {/* Parent Menus as Cards */}
                    {!currentParent && !currentChild && (
                        <div className={styles.cardContainer}>
                            {menuData.map((parent) => (
                                <ParentMenuCard
                                    key={parent.Menu_ID}
                                    parent={parent}
                                    onSelect={() => handleParentSelect(parent)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Child Menus */}
                    {currentParent && !currentChild && (
                        <ChildMenuList
                            parent={currentParent}
                            onBack={handleBackToParent}
                            onSelectChild={(child) => handleChildSelect(child)}
                            onMenuSelect={handleMenuSelection}
                            selectedMenus={selectedMenus}
                        />
                    )}

                    {/* Sub-Child Menus */}
                    {currentParent && currentChild && (
                        <SubChildMenuList
                            parent={currentParent}
                            child={currentChild}
                            onBack={handleBackToChild}
                            onMenuSelect={handleMenuSelection}
                            selectedMenus={selectedMenus}
                        />
                    )}

                    <Button
                        style={{margin: '20px 15px 30px 15px'}}
                        label="Create Role"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon/>}
                        size="large"
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitButton}
                    />
                </Container>
            </form>

        </div>
    );
};

export default UserRoles;
