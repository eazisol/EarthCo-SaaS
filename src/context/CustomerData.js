import React, { createContext, useState } from 'react'

const CustomerContext = createContext();

const CustomerData = ({ children }) => {

    const [selectedCustomer, setSelectedCustomer] = useState();

    const valueToShare = {
        selectedCustomer,
        setSelectedCustomer
    }

    return (
        <CustomerContext.Provider value={valueToShare}>
            {children}
        </CustomerContext.Provider>
    )
}

export default CustomerData
export { CustomerContext }