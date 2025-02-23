import React, {useContext, useEffect, useState} from 'react';
import {fetchData, postData} from '@/utility/api_utility';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import styles from '@/styles/roles.module.css'; // Using the provided CSS with improvements
import ColorContext from "@/contexts/ColorContext";
import PrefixedInputField from '@/components/widgets/PrefixedInputField';
import {Col, Row} from 'react-bootstrap';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';

const NewRole = () => {
    const [parentMenus, setParentMenus] = useState([]);
    const [currentParent, setCurrentParent] = useState(null);
    const [childMenus, setChildMenus] = useState([]);
    const [subChildrenMap, setSubChildrenMap] = useState({});
    const [selectedMenus, setSelectedMenus] = useState({});
    const [form, setForm] = useState({RoleId: '', RoleDescription: ''});
    const [errors, setErrors] = useState({});
    const [output, setOutput] = useState('');
    // const {colors} = useContext(ColorContext);

    // Caches to store fetched child and subchild menus
    const [childCache, setChildCache] = useState({});

    // Loading states
    const [isLoadingParents, setIsLoadingParents] = useState(false);
    const [isLoadingChildren, setIsLoadingChildren] = useState(false);

    useEffect(() => {
        const loadParents = async () => {
            setIsLoadingParents(true);
            try {
                const data = await fetchData('/api/getParentMenuData');
                setParentMenus(data);
                console.log("Parents loaded:", data);
            } catch (error) {
                console.error("Error fetching parent menus:", error);
                setOutput('Error fetching parent menus');
            } finally {
                setIsLoadingParents(false);
            }
        };
        loadParents();
    }, []);

    const handleParentClick = async (parent) => {
        setCurrentParent(parent);

        // Check if child menus for this parent are already cached
        if (childCache[parent.Menu_ID]) {
            setChildMenus(childCache[parent.Menu_ID].children);
            setSubChildrenMap(childCache[parent.Menu_ID].subChildren);
            return;
        }

        setIsLoadingChildren(true);
        try {
            // Fetch child menus
            const childData = await fetchData(`/api/getChildMenuData/${parent.Menu_ID}`);
            console.log(`Child menus for parent ${parent.Menu_Desc}:`, childData);

            // Fetch subchild menus concurrently
            const subChildrenPromises = childData.map(child =>
                fetchData(`/api/getChildMenuData/${child.Menu_ID}`)
                    .then(subChildren => ({childID: child.Menu_ID, subChildren}))
            );

            const resolvedSubChildren = await Promise.all(subChildrenPromises);
            let subMap = {};

            resolvedSubChildren.forEach(item => {
                subMap[item.childID] = item.subChildren;
            });

            // Update state with fetched data
            setChildMenus(childData);
            setSubChildrenMap(subMap);

            // Cache the fetched data
            setChildCache(prevCache => ({
                ...prevCache,
                [parent.Menu_ID]: {
                    children: childData,
                    subChildren: subMap
                }
            }));

            // Optionally, mark the parent menu as selected by default with read/write
            setSelectedMenus(prev => ({
                ...prev,
                [parent.Menu_ID]: {
                    checked: true,
                    readOnly: 0, // 0 for read/write
                    canDelete: false // default delete access to false
                },
            }));
        } catch (error) {
            console.error(`Error fetching child/subchild menus for parent ${parent.Menu_Desc}:`, error);
            setOutput('Error fetching child menus');
        } finally {
            setIsLoadingChildren(false);
        }
    };

    const goBack = () => {
        setCurrentParent(null);
        setChildMenus([]);
        setSubChildrenMap({});
        setErrors({});
        setOutput('');
    };

    const handleToggleChange = (menuItem) => {
        setSelectedMenus((prev) => {
            const wasChecked = prev[menuItem.Menu_ID]?.checked || false;
            // If turning ON from OFF, default to Read/Write (readOnly=0) and no delete access (canDelete=false)
            const newReadOnly = wasChecked ? prev[menuItem.Menu_ID].readOnly : 0;
            const newCanDelete = wasChecked ? prev[menuItem.Menu_ID].canDelete : false;

            return {
                ...prev,
                [menuItem.Menu_ID]: {
                    checked: !wasChecked,
                    readOnly: newReadOnly,
                    canDelete: newCanDelete,
                }
            };
        });
    };

    const handlePermissionToggle = (menuItem) => {
        if (!selectedMenus[menuItem.Menu_ID]?.checked) return;
        setSelectedMenus((prev) => {
            const current = prev[menuItem.Menu_ID];
            const newReadOnly = current.readOnly === 1 ? 0 : 1;
            return {
                ...prev,
                [menuItem.Menu_ID]: {
                    ...current,
                    readOnly: newReadOnly
                }
            };
        });
    };

    // New handler for toggling delete access
    const handleDeleteToggle = (menuItem) => {
        if (!selectedMenus[menuItem.Menu_ID]?.checked) return;
        setSelectedMenus((prev) => {
            const current = prev[menuItem.Menu_ID];
            return {
                ...prev,
                [menuItem.Menu_ID]: {
                    ...current,
                    canDelete: !current.canDelete,
                }
            };
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.RoleId) newErrors.RoleId = 'Role ID is required';
        if (!form.RoleDescription) newErrors.RoleDescription = 'Role Description is required';
        return newErrors;
    };

    const handleSubmit = async () => {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        // Build the SelectedMenus array including CanDelete
        const SelectedMenus = Object.entries(selectedMenus)
            .filter(([_, val]) => val.checked)
            .map(([key, val]) => ({Menu_ID: key, ReadOnly: val.readOnly, CanDelete: val.canDelete}));

        const formData = {
            RoleId: form.RoleId,
            RoleDescription: form.RoleDescription,
            SelectedMenus,
        };

        try {
            const response = await postData('/api/insertRole', formData);
            if (response.success) {
                setOutput('Role added successfully');
                // Optionally, reset the form and selections
                setForm({RoleId: '', RoleDescription: ''});
                setSelectedMenus({});
            } else {
                setOutput('Failed to add role');
            }
        } catch (error) {
            console.error(error);
            setOutput('An error occurred while adding the role');
        }
    };

    const renderPermissionToggle = (menuItem) => {
        const isChecked = selectedMenus[menuItem.Menu_ID]?.checked || false;
        if (!isChecked) return null;

        const readOnly = selectedMenus[menuItem.Menu_ID]?.readOnly !== 0;
        return (
            <div className={styles.permissionWrapper}>
                <label className={styles.permissionToggle}>
                    <input
                        type="checkbox"
                        checked={!readOnly}
                        onChange={() => handlePermissionToggle(menuItem)}
                    />
                    <span className={styles.toggleSlider}></span>
                </label>
                {readOnly
                    ? <span className={`${styles.permissionLabel} ${styles.readOnlyLabel}`}>Read Only</span>
                    : <span className={`${styles.permissionLabel} ${styles.readWriteLabel}`}>Read/Write</span>
                }
            </div>
        );
    };

    // New render helper for Delete toggle
    const renderDeleteToggle = (menuItem) => {
        const isChecked = selectedMenus[menuItem.Menu_ID]?.checked || false;
        if (!isChecked) return null;
        const canDelete = selectedMenus[menuItem.Menu_ID]?.canDelete;
        return (
            <div className={styles.permissionWrapper}>
                <label className={styles.permissionToggle}>
                    <input
                        type="checkbox"
                        checked={canDelete}
                        onChange={() => handleDeleteToggle(menuItem)}
                    />
                    <span className={styles.toggleSlider}></span>
                </label>
                {canDelete
                    ? <span className={`${styles.permissionLabel} ${styles.readWriteLabel}`}>Delete Access</span>
                    : <span className={`${styles.permissionLabel} ${styles.readOnlyLabel}`}>No Delete</span>
                }
            </div>
        );
    };

    const renderSubChildren = (child) => {
        const subs = subChildrenMap[child.Menu_ID] || [];
        if (subs.length === 0) return null;

        return (
            <div className={styles.subChildrenContainer}>
                {subs.map((sub) => {
                    const subChecked = selectedMenus[sub.Menu_ID]?.checked || false;
                    return (
                        <div key={sub.Menu_ID} className={styles.childMenuItemContainer}>
                            <div>
                                <label className={styles.toggleSwitch}>
                                    <input
                                        type="checkbox"
                                        checked={subChecked}
                                        onChange={() => handleToggleChange(sub)}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </label>
                                <label style={{marginLeft: '8px'}}>{sub.Menu_Desc}</label>
                            </div>
                            {renderPermissionToggle(sub)}
                            {renderDeleteToggle(sub)}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Helper to get all children and sub-children in a flat list
    const getAllChildrenFlatList = () => {
        let allItems = [...childMenus];
        for (const child of childMenus) {
            const subs = subChildrenMap[child.Menu_ID] || [];
            allItems = [...allItems, ...subs];
        }
        return allItems;
    };

    const areAllSubChildrenSelected = (child) => {
        const subs = subChildrenMap[child.Menu_ID] || [];
        return subs.length > 0 && subs.every(sub => selectedMenus[sub.Menu_ID]?.checked);
    };

    const handleSelectAllSubChildren = (child) => {
        const subs = subChildrenMap[child.Menu_ID] || [];
        const allSelected = areAllSubChildrenSelected(child);

        const newSelectedMenus = {...selectedMenus};
        for (const sub of subs) {
            newSelectedMenus[sub.Menu_ID] = {
                checked: !allSelected,
                // If selecting, default to read/write (0) and no delete access; if unselecting, keep existing/default
                readOnly: !allSelected ? 0 : (newSelectedMenus[sub.Menu_ID]?.readOnly || 0),
                canDelete: !allSelected ? false : (newSelectedMenus[sub.Menu_ID]?.canDelete || false),
            };
        }
        setSelectedMenus(newSelectedMenus);
    };

    // Check if all are selected
    const areAllSelected = () => {
        const allItems = getAllChildrenFlatList();
        return allItems.length > 0 && allItems.every(item => selectedMenus[item.Menu_ID]?.checked);
    };

    const handleSelectAll = () => {
        const allItems = getAllChildrenFlatList();
        const allSelected = areAllSelected();

        // If all are selected, unselect them all; otherwise select them all with read/write and no delete access
        const newSelectedMenus = {...selectedMenus};
        for (const item of allItems) {
            newSelectedMenus[item.Menu_ID] = {
                checked: !allSelected,
                readOnly: !allSelected ? 0 : (newSelectedMenus[item.Menu_ID]?.readOnly || 0),
                canDelete: !allSelected ? false : (newSelectedMenus[item.Menu_ID]?.canDelete || false),
            };
        }

        setSelectedMenus(newSelectedMenus);
    };

    // Corrected helper function to get counts of selected children and subchildren
    const getSelectedCounts = (parent) => {
        // Count selected children from childCache
        const children = childCache[parent.Menu_ID]?.children || [];
        const selectedChildren = children.filter(child => selectedMenus[child.Menu_ID]?.checked);
        const childCount = selectedChildren.length;

        // Count selected subchildren from childCache
        const subChildrenMapData = childCache[parent.Menu_ID]?.subChildren || {};
        let subChildCount = 0;
        Object.values(subChildrenMapData).forEach(subChildren => {
            subChildren.forEach(sub => {
                if (selectedMenus[sub.Menu_ID]?.checked) {
                    subChildCount += 1;
                }
            });
        });

        return {childCount, subChildCount};
    };

    const renderChildMenus = () => {
        if (isLoadingChildren) {
            return <div className={styles.loading}>Loading menus...</div>;
        }

        if (childMenus.length === 0) {
            return <div style={{marginTop: '20px'}}>No child menus available
                for {currentParent && currentParent.Menu_Desc}</div>;
        }

        const allSelected = areAllSelected();

        return (
            <div className={styles.allChildrenContainer}>
                {/* Add the parent menu name at the top inside this box */}
                <div className={styles.parentBoxTitle}>{currentParent && currentParent.Menu_Desc}</div>

                {/* The existing "Child" indicator remains below the parent name */}
                <div className={styles.childIndicator}>Child</div>

                {/* Select All button */}
                <div style={{marginBottom: '16px'}}>
                    <button
                        style={{backgroundColor: "blue", color: '#fff'}}
                        className={styles.selectAllButton}
                        onClick={handleSelectAll}
                    >
                        <DoneAllRoundedIcon style={{marginRight: '8px', fontSize: '16px'}}/>
                        {allSelected ? 'Unselect All' : 'Select All'}
                    </button>
                </div>

                {childMenus.map((child) => {
                    const isChecked = selectedMenus[child.Menu_ID]?.checked || false;
                    const hasSubs = (subChildrenMap[child.Menu_ID] && subChildrenMap[child.Menu_ID].length > 0);

                    if (hasSubs && isChecked) {
                        // Child with sub-children toggled on
                        return (
                            <div key={child.Menu_ID} className={styles.childWithSubBox}>
                                <div className={styles.childMenuItemContainer}>
                                    <div>
                                        <label className={styles.toggleSwitch}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggleChange(child)}
                                            />
                                            <span className={styles.toggleSlider}></span>
                                        </label>
                                        <label style={{marginLeft: '8px', position: 'relative'}}>
                                            {child.Menu_Desc}
                                            {hasSubs &&
                                                <StarRoundedIcon style={{color: '#1d1d1f', marginLeft: '5px'}}/>}
                                        </label>
                                    </div>
                                    {renderPermissionToggle(child)}
                                    {renderDeleteToggle(child)}
                                </div>

                                {/* "Sub Child" strip under the child's name */}
                                <div className={styles.subChildIndicator}>Sub Child</div>

                                {/* Add the select/unselect all subchildren button here */}
                                <div style={{marginBottom: '16px'}}>
                                    <button
                                        style={{
                                            backgroundColor: areAllSubChildrenSelected(child) ? "blue" : "blue",
                                            color: '#fff'
                                        }}
                                        className={styles.selectAllButton}
                                        onClick={() => handleSelectAllSubChildren(child)}
                                    >
                                        {areAllSubChildrenSelected(child) ? 'Unselect All Subchildren' : 'Select All Subchildren'}
                                    </button>
                                </div>

                                {renderSubChildren(child)}
                            </div>
                        );
                    } else {
                        // Child without sub-children or not toggled on
                        return (
                            <div key={child.Menu_ID} className={styles.childMenuItemContainer}>
                                <div>
                                    <label className={styles.toggleSwitch}>
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleToggleChange(child)}
                                        />
                                        <span
                                            className={styles.toggleSlider}
                                            style={{
                                                backgroundColor: isChecked ? 'rgb(145, 145, 145)' : 'lightgrey',
                                                transition: 'background-color 0.3s ease'
                                            }}
                                        ></span>
                                    </label>
                                    <label className={styles.childMenuLabel}
                                           style={{marginLeft: '8px', position: 'relative'}}>
                                        {child.Menu_Desc}
                                        {hasSubs && <StarRoundedIcon style={{color: '#1d1d1f', marginLeft: '5px'}}/>}
                                    </label>
                                </div>
                                {renderPermissionToggle(child)}
                                {renderDeleteToggle(child)}
                            </div>
                        );
                    }
                })}

            </div>
        );
    };

    const renderBreadcrumbs = () => {
        return (
            <div className={styles.breadcrumbs}>
                <a style={{cursor: 'pointer'}} onClick={() => {/* logic for home if needed */
                }}>Home</a>
                {' > '}
                <a style={{cursor: 'pointer'}} onClick={() => {/* logic for Roles listing if needed */
                }}>Roles</a>
                {' > '}
                {!currentParent && <span>Create New Role</span>}
                {currentParent && (
                    <>
                        <a style={{cursor: 'pointer'}} onClick={goBack}>Create New Role</a>
                        {' > '}
                        <span>{currentParent.Menu_Desc}</span>
                    </>
                )}
            </div>
        );
    };

    return (
        <>
            {/*<DashMenu />*/}
            <div className={styles.container}>
                {renderBreadcrumbs()}
                <div style={{
                    marginBottom: '20px',
                    backgroundColor: '#fff',
                    padding: '10px 20px 20px 20px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    justifyContent: 'center'
                }}>
                    <Row>
                        <Col>
                            <PrefixedInputField
                                placeholder="Super Admin"
                                value={form.RoleId}
                                onChange={(e) => setForm({...form, RoleId: e.target.value})}
                                label={"Role ID"}
                            />
                            {errors.RoleId && <span className={styles.errorText}>{errors.RoleId}</span>}
                        </Col>
                        <Col>
                            <PrefixedInputField
                                placeholder="All Menus"
                                value={form.RoleDescription}
                                onChange={(e) => setForm({...form, RoleDescription: e.target.value})}
                                label={"Role Description"}
                            />
                            {errors.RoleDescription &&
                                <span className={styles.errorText}>{errors.RoleDescription}</span>}
                        </Col>
                        <Col style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'end'}}>
                            {/* Submit Button on Parent Menu List Screen */}
                            <div className={styles.navigationButtons1}>
                                <button
                                    style={{
                                        backgroundColor: "blue",
                                        color: '#fff',
                                        cursor: 'pointer',
                                    }}
                                    className={styles.submitButton}
                                    onClick={handleSubmit}
                                >
                                    <BookmarkAddedIcon style={{marginRight: '8px', fontSize: '16px'}}/>
                                    Submit Role
                                </button>
                            </div>
                        </Col>
                    </Row>

                </div>

                {!currentParent && (
                    <>
                        {isLoadingParents ? (
                            <div className={styles.loading}>Loading parent menus...</div>
                        ) : (
                            <div className={styles.cardContainer}>
                                {parentMenus.map((parent) => {
                                    const {childCount, subChildCount} = getSelectedCounts(parent);
                                    const isSelected = childCount > 0 || subChildCount > 0;
                                    return (
                                        <div
                                            key={parent.Menu_ID}
                                            className={`${styles.parentCard} ${isSelected ? styles.parentCardSelected : ''}`}
                                            onClick={() => handleParentClick(parent)}
                                        >
                                            <div className={styles.menuTitle}>{parent.Menu_Desc}</div>
                                            {/* Render countContainer only if there are selected children or subchildren */}
                                            {(childCount > 0 || subChildCount > 0) && (
                                                <div className={styles.countContainer}>
                                                    {childCount > 0 && (
                                                        <div className={styles.countItem}>
                                                            <span className={styles.countLabel}>Child</span>
                                                            <span className={styles.countNumber}>{childCount}</span>
                                                        </div>
                                                    )}
                                                    {subChildCount > 0 && (
                                                        <div className={styles.countItem}>
                                                            <span className={styles.countLabel}>Sub Child</span>
                                                            <span className={styles.countNumber}>{subChildCount}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {currentParent && (
                    <>
                        {renderChildMenus()}

                        <div className={styles.navigationButtons}>
                            <button
                                style={{
                                    backgroundColor: "white",
                                    cursor: 'pointer',
                                }}
                                className={styles.backButton}
                                onClick={goBack}
                            >
                                <ArrowBackIosRoundedIcon style={{marginRight: '8px', fontSize: '16px'}}/>
                                Back
                            </button>
                        </div>
                    </>
                )}

                {output && (
                    <div className={output.includes('successfully') ? styles.successMessage : styles.failureMessage}>
                        {output}
                    </div>
                )}
            </div>
        </>
    );
};

export default NewRole;
