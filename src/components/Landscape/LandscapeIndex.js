import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Landscapelist from './Landscapelist'
import LandscapeForm from './LandscapeForm'
import TitleBar from '../TitleBar'

const LandscapeIndex = () => {

    const icon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M14.7379 2.76181H8.08493C6.00493 2.75381 4.29993 4.41181 4.25093 6.49081V17.2038C4.20493 19.3168 5.87993 21.0678 7.99293 21.1148C8.02393 21.1148 8.05393 21.1158 8.08493 21.1148H16.0739C18.1679 21.0298 19.8179 19.2998 19.8029 17.2038V8.03781L14.7379 2.76181Z" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.4751 2.75V5.659C14.4751 7.079 15.6231 8.23 17.0431 8.234H19.7981" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14.2882 15.3585H8.88818" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.2432 11.606H8.88721" stroke="#888888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

    return (
        <>
            <TitleBar icon={icon} title='Monthly Landscape' />
            <Routes>
                <Route path='' element={<Landscapelist />} />
                <Route path='add-landscape' element={<LandscapeForm />} />
            </Routes>
        </>
    )
}

export default LandscapeIndex