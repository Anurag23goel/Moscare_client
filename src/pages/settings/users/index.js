import Users from '@/components/forms/settings/users/users'
import React from 'react'
import {Container} from "react-bootstrap";

function UsersPage() {
    return (
        <div>
            {/*<DashMenu />*/}
            <Container>
                <Users/>
            </Container>
        </div>
    )
}

export default UsersPage
