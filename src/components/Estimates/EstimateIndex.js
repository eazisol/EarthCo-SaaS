import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import EstimateList from './EstimateList'
import EstimateIDopen from './EstimateIDopen'
import { RoutingContext } from '../../context/RoutesContext'
import AddEstimate from './AddEstimate'
import EstimatePreview from './EstimatePreview'
import UpdateEstimateForm from './UpdateEstimateForm'

const EstimateIndex = () => {

    const { estimateRoute } = useContext(RoutingContext);

    return (
        <>
            <Routes>
                <Route path='' element={<EstimateList />} />
                <Route path={estimateRoute} element={<EstimateIDopen />} />
                <Route path='add-estimate' element={<AddEstimate />} />
                <Route path='update-estimate' element={<UpdateEstimateForm />} />
                <Route path="estimate-preview" element={<EstimatePreview />} />

            </Routes>
        </>
    )
}

export default EstimateIndex