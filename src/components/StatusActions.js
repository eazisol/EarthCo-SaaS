import React from 'react'
import { Form } from 'react-bootstrap'

const StatusActions = ({ status }) => {
    return (
        <>
            <div className="col-lg-4 col-md-12 mb-2" style={{ minWidth: '150px' }}>
                <Form.Select aria-label="Default select example" value={status} size="md" id="inlineFormCustomSelect">
                    <option value='Open'>Open</option>
                    <option value='Approved'>Approved</option>
                    <option value='Closed Billed'>Closed Billed</option>
                </Form.Select>
                {/* <select className="default-select  form-control wide" value={status} >
                    <option value='Open'>Open</option>
                    <option value='Approved'>Approved</option>
                    <option value='Closed Billed'>Closed Billed</option>
                </select> */}
            </div>
            <div className="col-lg-8 col-md-12 actionBtns">
                <button type="button" className="btn btn-sm btn-outline-primary">Email</button>
                <button type="button" className="btn btn-sm btn-outline-primary ">Print</button>
                <button type="button" className="btn btn-sm btn-outline-primary" style={{ minWidth: '120px' }}>Download</button>
            </div>
        </>
    )
}

export default StatusActions
