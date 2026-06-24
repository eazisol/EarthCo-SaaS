import React from 'react'

const DeleteAllModal = () => {
  return (
    <div
    className="modal fade"
    id="deleteAllModal"
    tabIndex="-1"
    aria-labelledby="deleteAllModalLabel"
    aria-hidden="true"
  >
    <div
      className="modal-dialog modal-dialog-centered"
      role="document"
    >
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">
            Delete Estimates
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div className="modal-body">
          <p>
            Are you sure you want to delete
            Estimate
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            // id="closer"
            className="btn btn-danger light"
            data-bs-dismiss="modal"
          >
            Close
          </button>
          <button
            className="btn btn-primary "
            data-bs-dismiss="modal"
            onClick={() => {                                          
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  </div>
  )
}

export default DeleteAllModal