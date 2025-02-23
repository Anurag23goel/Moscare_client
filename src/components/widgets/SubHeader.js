import React from 'react'
import styles from "../../styles/style.module.css"
import {Typography} from '@mui/material'

const SubHeader = ({title}) => {
    return (
        <div className={styles.headerContainer}>
            <Typography sx={{fontSize: "22px", fontWeight: "600", marginBottom: "1rem"}}>{title}</Typography>
        </div>
    )
}

export default SubHeader
