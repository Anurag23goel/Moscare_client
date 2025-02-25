// In `moscare_client/src/pages/index.js`
import Head from "next/head";
import "@/styles/style.module.css"
import {useEffect} from "react";
import {useRouter} from "next/router";
import Cookies from "js-cookie";
import {auth} from "../config/firebaseConfig";
import ValidationBar from "@/components/widgets/ValidationBar";

export default function Home() {
    const router = useRouter();
    useEffect(() => {
        const authToken = Cookies.get('AuthToken');
        const user = auth.currentUser;
        if (!authToken && !user) {
            // window.location.href = '/auth/login';
            router.push('/auth/login');
        } else if (user) {
            Cookies.set('AuthToken', authToken, {expires: 1});
            // window.location.href = '/home';
            router.push('/home');
        }
    }, []);
    return (
        <>
            <Head>
                <title>Moscare</title>
                <meta name="description" content="Generated by Rampup"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <main>
                <div>
                    {/*<DashMenu />*/}
                    <ValidationBar/>
                </div>
            </main>
        </>
    );
}