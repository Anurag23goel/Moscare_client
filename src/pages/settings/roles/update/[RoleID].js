import React, {useEffect, useState} from 'react';
import {fetchData, postData} from '@/utility/api_utility';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import styles from '@/styles/roles.module.css'; // Ensure this CSS includes styles for new elements
import PrefixedInputField from '@/components/widgets/PrefixedInputField';
import {Col, Row} from 'react-bootstrap';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import {useRouter} from 'next/router';

const UpdateRole = () => {
    const router = useRouter();
    const {RoleID} = router.query;

    const [parentMenus, setParentMenus] = useState([]);
    const [currentParent, setCurrentParent] = useState(null);
    const [childMenus, setChildMenus] = useState([]);
    const [subChildrenMap, setSubChildrenMap] = useState({});
    const [selectedMenus, setSelectedMenus] = useState({});
    const [form, setForm] = useState({RoleId: '', RoleDescription: ''});
    const [errors, setErrors] = useState({});
    const [output, setOutput] = useState('');
    // const {colors} = useContext(ColorContext);
    const [initialValue, setInitialValue] = useState("<p>Default Content</p>");
    // Caches to store fetched child and subchild menus
    const [childCache, setChildCache] = useState({});

    // Loading states
    const [isLoadingParents, setIsLoadingParents] = useState(false);
    const [isLoadingChildren, setIsLoadingChildren] = useState(false);

    // Effect to load all menus and role data
    useEffect(() => {
        const loadData = async () => {
            setIsLoadingParents(true);
            try {
                // Fetch all parent menus
                const parents = await fetchData('/api/getParentMenuData');
                setParentMenus(parents);
                console.log("Parents loaded:", parents);

                // Fetch all child menus for each parent
                const childPromises = parents.map(parent =>
                    fetchData(`/api/getChildMenuData/${parent.Menu_ID}`)
                        .then(children => ({parentID: parent.Menu_ID, children}))
                );
                const childrenResults = await Promise.all(childPromises);
                console.log("Children loaded:", childrenResults);

                // Fetch all subchild menus for each child
                const subChildPromises = [];
                const subChildrenMapTemp = {};

                childrenResults.forEach(({parentID, children}) => {
                    children.forEach(child => {
                        const promise = fetchData(`/api/getChildMenuData/${child.Menu_ID}`)
                            .then(subChildren => {
                                subChildrenMapTemp[child.Menu_ID] = subChildren;
                            })
                            .catch(error => {
                                console.error(`Error fetching subchildren for child ${child.Menu_ID}:`, error);
                                setOutput(`Error fetching subchildren for child ${child.Menu_Desc}`);
                            });
                        subChildPromises.push(promise);
                    });
                });

                await Promise.all(subChildPromises);
                console.log("Subchildren loaded:", subChildrenMapTemp);
                setSubChildrenMap(subChildrenMapTemp);

                // Cache the fetched data
                const tempChildCache = {};
                childrenResults.forEach(({parentID, children}) => {
                    tempChildCache[parentID] = {
                        children,
                        subChildren: subChildrenMapTemp,
                    };
                });
                setChildCache(tempChildCache);
                console.log("Child cache updated:", tempChildCache);

                // If RoleID is present, fetch and prefill role data
                if (RoleID) {
                    await prefillRoleData(RoleID, parents, childrenResults, subChildrenMapTemp);
                }
            } catch (error) {
                console.error("Error loading menus or role data:", error);
                setOutput('Error loading menus or role data');
            } finally {
                setIsLoadingParents(false);
            }
        };

        // Ensure that RoleID is available before loading data
        if (router.isReady) {
            loadData();
        }
    }, [RoleID, router.isReady]);

    // Function to prefill role data
    const prefillRoleData = async (roleId, parents, childrenResults, subChildrenMapTemp) => {
        try {
            const roleData = await fetchData(`/api/getRolesByRoleID/${roleId}`);
            console.log("Fetched role data:", roleData);

            if (!roleData || roleData.length === 0) {
                setOutput('No role data found for the provided RoleID');
                return;
            }

            // Extract Role details from the first element
            const {Role_ID, Role_Desc} = roleData[0];
            setForm({RoleId: Role_ID, RoleDescription: Role_Desc});
            console.log("Form state after setting Role details:", {RoleId: Role_ID, RoleDescription: Role_Desc});

            // Build initial selectedMenus state from roleData, including canDelete
            const initialSelectedMenus = {};
            roleData.forEach(item => {
                initialSelectedMenus[item.Menu_ID] = {
                    checked: true,
                    readOnly: item.ReadOnly, // expected 0 or 1
          canDelete: Number(item.CanDelete)  // convert to number (0 or 1)
                };
            });
            setSelectedMenus(initialSelectedMenus);
            console.log("Selected menus after prefill:", initialSelectedMenus);
        } catch (error) {
            console.error("Error fetching role data by ID:", error);
            setOutput('Error fetching role data');
        }
    };

    // Helper function to get children and subchildren for a specific parent
    const getChildrenFlatList = (parentID) => {
        const children = childCache[parentID]?.children || [];
        let allItems = [];
        children.forEach(child => {
            allItems.push(child);
            const subs = subChildrenMap[child.Menu_ID] || [];
            subs.forEach(sub => {
                allItems.push(sub);
            });
        });
        return allItems;
    };

    // Check if all menus under a specific parent are selected
    const areAllSelected = (parentID) => {
        const allItems = getChildrenFlatList(parentID);
        return allItems.length > 0 && allItems.every(item => selectedMenus[item.Menu_ID]?.checked);
    };

    // Updated handleSelectAll to accept a parentID and include canDelete
    const handleSelectAll = (parentID) => {
        const allItems = getChildrenFlatList(parentID);
        const allSelected = areAllSelected(parentID);

        const newSelectedMenus = {...selectedMenus};
        allItems.forEach(item => {
            newSelectedMenus[item.Menu_ID] = {
                checked: !allSelected,
                readOnly: !allSelected ? 0 : (newSelectedMenus[item.Menu_ID]?.readOnly || 0),
                canDelete: !allSelected ? false : (newSelectedMenus[item.Menu_ID]?.canDelete || false)
            };
        });

        setSelectedMenus(newSelectedMenus);
    };

    // Function to determine if any child or subchild under a parent is selected
    const isParentSelected = (parentID) => {
        const children = childCache[parentID]?.children || [];
        return children.some(child =>
            selectedMenus[child.Menu_ID]?.checked ||
            (subChildrenMap[child.Menu_ID] && subChildrenMap[child.Menu_ID].some(sub => selectedMenus[sub.Menu_ID]?.checked))
        );
    };

    // Handler for parent card click
    const handleParentClick = (parent) => {
        setCurrentParent(parent);
        setChildMenus(childCache[parent.Menu_ID]?.children || []);
    };

    const goBack = () => {
        setCurrentParent(null);
        setChildMenus([]);
        setErrors({});
        setOutput('');
    };

    // Handler for toggling individual menu items, now including canDelete
    const handleToggleChange = (menuItem) => {
        setSelectedMenus((prev) => {
            const wasChecked = prev[menuItem.Menu_ID]?.checked || false;
            const currentReadOnly = prev[menuItem.Menu_ID]?.readOnly || 0;
      const currentCanDelete = prev[menuItem.Menu_ID]?.canDelete || false;
            // If turning ON from OFF, default to Read/Write (readOnly=0) and canDelete false
            const newReadOnly = wasChecked ? currentReadOnly : 0;
      const newCanDelete = wasChecked ? currentCanDelete : false;
            return {
                ...prev,
                [menuItem.Menu_ID]: {
                    checked: !wasChecked,
                    readOnly: newReadOnly,
          canDelete: newCanDelete
                }
            };
        });
    };

    // Handler for toggling permission (Read/Write)
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
          canDelete: current.canDelete === 1 ? 0 : 1, // Toggle between 0 and 1
        }
      };
    });
  };


  // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!form.RoleId) newErrors.RoleId = 'Role ID is required';
        if (!form.RoleDescription) newErrors.RoleDescription = 'Role Description is required';
        return newErrors;
    };

    // Form submission handler
    const handleSubmit = async () => {
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        // Build the SelectedMenus array, including canDelete
        const SelectedMenus = Object.entries(selectedMenus)
            .filter(([_, val]) => val.checked)
            .map(([key, val]) => ({
                Menu_ID: key, ReadOnly: val.readOnly,
        CanDelete: val.canDelete  // This is now a number (0 or 1)
      }));

        const formData = {
            RoleId: form.RoleId,
            RoleDescription: form.RoleDescription,
            SelectedMenus
        };
        console.log("Form data to submit:", formData);

        try {
            // Call insertRole API
            const response = await postData('/api/insertRole', formData);
            console.log("InsertRole API response:", response);
            if (response.success) {
                setOutput('Role updated successfully');
            } else {
                setOutput('Failed to update role');
            }
        } catch (error) {
            console.error(error);
            setOutput('An error occurred while updating the role');
        }
    };

    // Render permission toggle switch
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

    // New render for delete toggle
  const renderDeleteToggle = (menuItem) => {
    const current = selectedMenus[menuItem.Menu_ID];
    const canDelete = current && current.canDelete === 1;
    return (
      <div className={styles.permissionWrapper}>
        <label className={styles.permissionToggle}>
          <input
            type="checkbox"
            checked={canDelete}
            onChange={() =>
              setSelectedMenus(prev => ({
                ...prev,
                [menuItem.Menu_ID]: {
                  ...prev[menuItem.Menu_ID],
                  // Toggle delete: if currently 1 then set to 0, else set to 1
                  canDelete: current.canDelete === 1 ? 0 : 1
                }
              }))
            }
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


  // Render subchildren menus
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
                            {renderDeleteToggle(sub)}</div>
                    );
                })}
            </div>
        );
    };

    // Check if all subchildren under a specific child are selected
    const areAllSubChildrenSelected = (child) => {
        const subs = subChildrenMap[child.Menu_ID] || [];
        return subs.length > 0 && subs.every(sub => selectedMenus[sub.Menu_ID]?.checked);
    };

    // Handle "Select All" for subchildren under a specific child, include canDelete
    const handleSelectAllSubChildren = (child) => {
        const subs = subChildrenMap[child.Menu_ID] || [];
        const allSelected = areAllSubChildrenSelected(child);

        const newSelectedMenus = {...selectedMenus};
        for (const sub of subs) {
            newSelectedMenus[sub.Menu_ID] = {
                checked: !allSelected,
                readOnly: !allSelected ? 0 : (newSelectedMenus[sub.Menu_ID]?.readOnly || 0),
                canDelete: !allSelected ? false : (newSelectedMenus[sub.Menu_ID]?.canDelete || false)
            };
        }
        setSelectedMenus(newSelectedMenus);
    };

    // Get selected counts for a parent
    const getSelectedCounts = (parent) => {
        const children = childCache[parent.Menu_ID]?.children || [];
        const selectedChildren = children.filter(child => selectedMenus[child.Menu_ID]?.checked);
        const childCount = selectedChildren.length;

        let subChildCount = 0;
        selectedChildren.forEach(child => {
            const subs = subChildrenMap[child.Menu_ID] || [];
            subChildCount += subs.filter(sub => selectedMenus[sub.Menu_ID]?.checked).length;
        });

        return {childCount, subChildCount};
    };

    // Render parent cards with dynamic color based on selection
    const renderParentCards = () => {
        if (isLoadingParents) {
            return <div className={styles.loading}>Loading parent menus...</div>;
        }

        return (
            <div className={styles.cardContainer}>
                {parentMenus.map((parent) => {
                    const {childCount, subChildCount} = getSelectedCounts(parent);
                    // Check if parent itself is selected based on selectedMenus
                    const isSelected = isParentSelected(parent.Menu_ID);

                    return (
                        <div
                            key={parent.Menu_ID}
                            className={`${styles.parentCard} ${isSelected ? styles.parentCardSelected : ''}`}
                            onClick={() => handleParentClick(parent)}
                        >
                            <div className={styles.menuTitle}>{parent.Menu_Desc}</div>
                            <div className={styles.countContainer}>
                                <div className={styles.countItem}>
                                    <span className={styles.countLabel}>Child Selected</span>
                                    <span className={styles.countNumber}>{childCount}</span>
                                </div>
                                <div className={styles.countItem}>
                                    <span className={styles.countLabel}>Sub Child Selected</span>
                                    <span className={styles.countNumber}>{subChildCount}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Render child menus for the current parent
    const renderChildMenus = () => {
        if (isLoadingChildren) {
            return <div className={styles.loading}>Loading menus...</div>;
        }

        if (childMenus.length === 0) {
            return <div style={{marginTop: '20px'}}>No child menus available
                for {currentParent && currentParent.Menu_Desc}</div>;
        }

        const allSelected = areAllSelected(currentParent.Menu_ID);

        return (
            <div className={styles.allChildrenContainer}>
                <div className={styles.parentBoxTitle}>{currentParent && currentParent.Menu_Desc}</div>
                <div className={styles.childIndicator}>Child</div>

                <div style={{marginBottom: '16px'}}>
                    <button
                        style={{backgroundColor: "blue", color: '#fff'}}
                        className={styles.selectAllButton}
                        onClick={() => handleSelectAll(currentParent.Menu_ID)} // Pass parentID here
                    >
                        <DoneAllRoundedIcon style={{marginRight: '8px', fontSize: '16px'}}/>
                        {allSelected ? 'Unselect All' : 'Select All'}
                    </button>
                </div>

                {childMenus.map((child) => {
                    const isChecked = selectedMenus[child.Menu_ID]?.checked || false;
                    const hasSubs = (subChildrenMap[child.Menu_ID] && subChildrenMap[child.Menu_ID].length > 0);

                    if (hasSubs && isChecked) {
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

                                <div className={styles.subChildIndicator}>Sub Child</div>

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
                                {renderDeleteToggle(child)}</div>
                        );
                    }
                })}

            </div>
        );
    };

    // Render breadcrumbs for navigation
    const renderBreadcrumbs = () => {
        return (
            <div className={styles.breadcrumbs}>
                <a style={{cursor: 'pointer'}} onClick={() => router.push('/')}>Home</a>
                {' > '}
                <a style={{cursor: 'pointer'}} onClick={() => router.push('/roles')}>Roles</a>
                {' > '}
                {!currentParent && <span>Update Role</span>}
                {currentParent && (
                    <>
                        <a style={{cursor: 'pointer'}} onClick={goBack}>Update Role</a>
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
                                disabled={!!RoleID} // Disable Role ID editing if updating
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
                                    Update Role
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
                                    // Check if parent itself is selected based on selectedMenus
                                    const isSelected = isParentSelected(parent.Menu_ID);

                                    return (
                                        <div
                                            key={parent.Menu_ID}
                                            className={`${styles.parentCard} ${isSelected ? styles.parentCardSelected : ''}`}
                                            onClick={() => handleParentClick(parent)}
                                        >
                                            <div className={styles.menuTitle}>{parent.Menu_Desc}</div>
                                            <div className={styles.countContainer}>
                                                <div className={styles.countItem}>
                                                    <span className={styles.countLabel}>Child Selected</span>
                                                    <span className={styles.countNumber}>{childCount}</span>
                                                </div>
                                                <div className={styles.countItem}>
                                                    <span className={styles.countLabel}>Sub Child Selected</span>
                                                    <span className={styles.countNumber}>{subChildCount}</span>
                                                </div>
                                            </div>
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

export default UpdateRole;
