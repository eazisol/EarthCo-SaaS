import React from 'react'
import { Route, Routes } from 'react-router-dom'
import WeeklyReportlist from './WeeklyReportlist'
import WeeklyReport from './WeeklyReport'
import AddWRform from './AddWRform'

const WeeklyReportIndex = () => {
    return (
        <>
            <Routes>
                <Route path='' element={<WeeklyReportlist />} />
                <Route path='weekly-report-preview' element={<WeeklyReport />} />
                <Route path='add-weekly-report' element={<AddWRform />} />
            </Routes>
        </>
    )
}

export default WeeklyReportIndex