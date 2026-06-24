import React from 'react'
import TitleBar from '../TitleBar'
import Map from './Map'

const MapIndex = () => {

    const icon = <span className="material-symbols-outlined" style={{ fontWeight: '100' }}>
        location_on
    </span>

    return (
        <>
            <div className="" style={{ paddingBottom: '1px' }}>
                <TitleBar icon={icon} title='Map' />
                <Map />
            </div>
        </>
    )
}

export default MapIndex