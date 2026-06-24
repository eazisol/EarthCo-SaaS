import React from 'react'
import { Route, Routes } from 'react-router-dom'
import StaffList from './StaffList'
import AddStaff from './AddStaff'

const StaffIndex = () => {
    return (
        <Routes>
            <Route path='' element={<StaffList />} />
            <Route path='add-staff' element={<AddStaff />} />
        </Routes>
    )
}

export default StaffIndex