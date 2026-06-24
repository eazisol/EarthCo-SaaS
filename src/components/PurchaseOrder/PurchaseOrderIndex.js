import React from 'react'
import { AddPO } from './AddPO'
import PurchaseOrder from './PurchaseOrder'
import { Route, Routes } from 'react-router-dom'
import POPreview from './POPreview'


const PurchaseOrderIndex = () => {
  return (
    <Routes>
    <Route path='' element={<PurchaseOrder />} />
    <Route path='add-po' element={<AddPO />} />
    <Route path='purchase-order-preview' element={<POPreview />} />

</Routes>
  )
}

export default PurchaseOrderIndex