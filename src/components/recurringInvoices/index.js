import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { RecurringTable } from './recurringTable'
import AddInvioces from '../Invoice/AddInvioces'
const RecurringInvoices = () => {
  return (
<Routes>
    <Route path='' element={<RecurringTable />} />
    <Route path="add-template" element={<AddInvioces />} />
    {/* <Route path='add-invoices' element={<AddInvioces />} />
    
    <Route path='invoice-preview' element={<InvoicePreview />} /> */}

</Routes>
  )
}

export default RecurringInvoices