import React, {useEffect, useState} from 'react';
import {Typography} from '@mui/material';
import Button from '@/components/widgets/MaterialButton';
import {fetchData} from '@/utility/api_utility';
import styles from '@/styles/roles.module.css';

const SubChildMenuList = ({parent, child, onBack, onMenuSelect, selectedMenus}) => {
    const [subChildMenus, setSubChildMenus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSubChildMenus = async () => {
            setIsLoading(true);
            try {
                const subChildren = await fetchData(`/api/getChildMenuData/${child.Menu_ID}`);
                setSubChildMenus(subChildren);
            } catch (error) {
                console.error('Error fetching sub-child menus:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubChildMenus();
    }, [child.Menu_ID]);

    const handleCheckboxChange = (menu, isChecked) => {
        onMenuSelect(menu.Menu_ID, isChecked, 'subChild');
    };

    return (
        <div className={styles.childMenuContainer}>
            <Button
                label="Back to Children"
                variant="contained"
                onClick={onBack}
                className={styles.backButton}
            />
            <Typography variant="h6" gutterBottom style={{marginTop: '20px'}}>
                {child.Menu_Desc} - Select Sub-Child Menus
            </Typography>
            {isLoading ? (
                <Typography>Loading sub-child menus...</Typography>
            ) : (
                <div>
                    {subChildMenus.map((subChild) => (
                        <div key={subChild.Menu_ID} className={styles.childMenuItem}>
                            <input
                                type="checkbox"
                                id={`subchild-menu-${subChild.Menu_ID}`}
                                checked={!!selectedMenus[subChild.Menu_ID]}
                                onChange={(e) => handleCheckboxChange(subChild, e.target.checked)}
                            />
                            <label htmlFor={`subchild-menu-${subChild.Menu_ID}`}>{subChild.Menu_Desc}</label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubChildMenuList;
