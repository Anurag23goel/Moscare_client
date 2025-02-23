import {useRouter} from 'next/router';
import {useEffect, useState} from 'react';
import {fetchData, postData} from "@/utility/api_utility";
import {Box, Button, Grid, Typography} from '@mui/material';
import InputField from '../../components/widgets/InputField'; // Make sure the path is correct

const TransferAgreementPage = () => {
    const router = useRouter();
    const {ClientID, AgreementCode} = router.query;

    const [agreementCodes, setAgreementCodes] = useState([]);
    const [agreementServices, setAgreementServices] = useState([]);
    const [selectedAgreementCode, setSelectedAgreementCode] = useState(AgreementCode || '');

    useEffect(() => {
        if (router.isReady && ClientID) {
            const fetchAgreementData = async () => {
                try {
                    const agreementData = await fetchData(`/api/getClientAgreementDataByID/${ClientID}`);
                    console.log("API Response:", agreementData);
                    setAgreementCodes(agreementData);
                } catch (error) {
                    console.error("API Error:", error);
                }
            };
            fetchAgreementData();
        }
    }, [router.isReady, ClientID]);

    const handleSelectChange = (e) => {
        setSelectedAgreementCode(e.target.value);
    };

    const handleApply = async () => {
        if (!selectedAgreementCode) return;

        try {
            const {data: fixedAgreementServices} = await fetchData(`/api/getClientAgreementServicesMaps/${AgreementCode}`);
            console.log(fixedAgreementServices);
            setAgreementServices(fixedAgreementServices);

            const serviceCodes = agreementServices.map(service => service.Service_Code);
            console.log(serviceCodes);

            await postData('/api/bulkInsertClientAgreementServicesMap', {
                AgreementCode: selectedAgreementCode,
                ServiceCodes: serviceCodes
            });
            alert('Services transferred successfully to the new agreement code!');

        } catch (error) {
            console.error("Error during the transfer:", error);
            alert('An error occurred while transferring services.');
        }
    };


    return (
        <Box sx={{padding: '20px', maxWidth: '800px', margin: 'auto'}}>
            <Typography variant="h5" sx={{mb: 4}}>Transfer Agreement</Typography>

            <Grid container spacing={3}>
                {/* Agreement Code (Fixed) */}
                <Grid item xs={12} sm={6}>
                    <InputField
                        label={`${AgreementCode}`}
                        type="select"
                        id="fixedAgreementCode"
                        value={AgreementCode}
                        options={[{label: AgreementCode, value: AgreementCode}]}
                        onChange={() => {
                        }}
                        disabled
                    />
                </Grid>

                {/* Select Agreement Code for Client */}
                <Grid item xs={12} sm={6}>
                    <InputField
                        label="Select Agreement Code for Client"
                        type="select"
                        id="clientAgreementCode"
                        value={selectedAgreementCode}
                        onChange={handleSelectChange}
                        options={agreementCodes.map(code => ({
                            label: code.AgreementCode,
                            value: code.AgreementCode
                        }))}
                    />
                </Grid>

                {/* Apply Button */}
                <Grid item xs={12} sx={{textAlign: 'right', mt: 3}}>
                    <Button variant="contained" color="primary" sx={{paddingX: 5}} onClick={handleApply}>
                        Apply
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TransferAgreementPage;
