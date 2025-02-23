import React from 'react';
import {Typography} from '@mui/material';
import styles from '@/styles/roles.module.css';

const ParentMenuCard = ({parent, onSelect}) => {
    return (
        <div className={styles.parentCard} onClick={onSelect}>
            <Typography className={styles.menuTitle}>{parent.Menu_Desc}</Typography>
        </div>
    );
};

export default ParentMenuCard;
