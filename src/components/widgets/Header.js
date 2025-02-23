import React from 'react'
import styles from "../../styles/style.module.css"

const Header = ({title, btnType}) => {
    return (
        <div className={styles.headerContainer}>
            <h2 className={styles.pageHeading}>{title}</h2>
            <p className={styles.pageSubtitle}>
                Manage all {title}. Click
                on {btnType == 'View' ? 'View' : 'Edit'} to {btnType == 'View' ? 'View' : 'update'} their {title}.
            </p>
        </div>
    )
}

export default Header
