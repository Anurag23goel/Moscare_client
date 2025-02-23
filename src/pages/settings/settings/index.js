import Settings from '@/components/forms/settings/settings/settings'
import {Container} from '@mui/material'
import styles from '@/styles/style.module.css'
import React from 'react'

function SettingsPage() {
    return (
        <>
            {/*<DashMenu />*/}
            <Container className={styles.SettingsContainer}>
                <Settings/>
            </Container>
        </>
    )
}

export default SettingsPage