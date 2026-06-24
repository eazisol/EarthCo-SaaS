import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SprayTechForm from "./SprayTechForm"
import SprayTechList from './SprayTechList'
import STPreview from "./STPreview"
const SprayTechIndex = () => {
  return (
    <Routes>
                {/* <Route path='' element={<SRlist />} /> */}
                <Route path='add' element={<SprayTechForm />} />
              
                <Route path='preview' element={<STPreview />} />
                <Route path='' element={<SprayTechList />} />
            </Routes>
  )
}

export default SprayTechIndex