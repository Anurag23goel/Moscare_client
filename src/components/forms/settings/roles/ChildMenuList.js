import React, {useEffect, useState} from 'react';
import {Typography} from '@mui/material';
import Button from '@/components/widgets/MaterialButton';
import {fetchData} from '@/utility/api_utility';
import styles from '@/styles/roles.module.css';

const ChildMenuList = ({parent, onBack, onSelectChild, onMenuSelect, selectedMenus}) => {
    const [childMenus, setChildMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchChildMenus = async () => {
            setIsLoading(true);
            try {
                const children = await fetchData(`/api/getChildMenuData/${parent.Menu_ID}`);
                setChildMenus(children);
            } catch (error) {
                console.error('Error fetching child menus:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChildMenus();
    }, [parent.Menu_ID]);

    const handleCheckboxChange = (menu, isChecked) => {
        console.log("first")
        onMenuSelect(menu.Menu_ID, isChecked, 'child');
    };

    const handleChildCardClick = (child) => {
        onSelectChild(child);
    };

    return (
        <div className={styles.childMenuContainer}>
            <Button
                label="Back to Parents"
                variant="contained"
                onClick={onBack}
                className={styles.backButton}
            />
            <Typography variant="h6" gutterBottom style={{marginTop: '20px'}}>
                {parent.Menu_Desc} - Select Child Menus
            </Typography>
            {isLoading ? (
                <Typography>Loading child menus...</Typography>
            ) : (
                <div>
                    {childMenus.map((child) => (
                        <div key={child.Menu_ID} className={styles.childMenuItem}>
                            <input
                                type="checkbox"
                                id={`child-menu-${child.Menu_ID}`}
                                checked={!!selectedMenus[child.Menu_ID]}
                                onChange={(e) => handleCheckboxChange(child, e.target.checked)}
                            />
                            <label htmlFor={`child-menu-${child.Menu_ID}`}>{child.Menu_Desc}</label>
                            {child.hasChildren && (
                                <Button
                                    label="View Sub-Child"
                                    variant="text"
                                    onClick={() => handleChildCardClick(child)}
                                    size="small"
                                    style={{marginLeft: '10px'}}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChildMenuList;
