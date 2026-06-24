import React, { useContext } from 'react'
import TitleBar from '../TitleBar'
import ServiceRequests from './ServiceRequests'
import SRlist from './SRlist'
import { Route, Routes } from 'react-router-dom'
import ServiceRequest from './ServiceRequest'
import { RoutingContext } from '../../context/RoutesContext'
import AddSRform from './AddSRform'
import SRPreview from './SRPreview'
import UpdateSRForm from './UpdateSRForm'
import SprayTechPreview from './SprayTechPreview'
const ServiceIndex = () => {

    const { SRroute } = useContext(RoutingContext)

    return (
        <>
            <Routes>
                <Route path='' element={<SRlist />} />
                <Route path='add-sRform' element={<AddSRform />} />
                <Route path='update-sRform' element={<UpdateSRForm />} />
                <Route path='service-request-preview' element={<SRPreview />} />
                <Route path='spray-tech-preview' element={<SprayTechPreview />} />
                <Route path={SRroute} element={<ServiceRequest />} />
            </Routes>
        </>
    )
}

export default ServiceIndex