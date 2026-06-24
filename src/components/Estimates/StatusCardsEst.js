import React from 'react'

const StatusCardsEst = ({ drafts, sent, approved, rejected, total }) => {
    return (
        <>
           

            <div className="col-xl-12">
                <div className="card">
                    <div className="card-body">
                        <div className="row task">
                            <div className="col-xl-2 col-sm-4 col-6">
                                <div className="task-summary">
                                    <div className="d-flex align-items-baseline">
                                        <h2 className="text-purple count">28,1045</h2>
                                    </div>
                                    <span>Open Estimates</span>
                                    {/* <p>Tasks assigne</p> */}
                                </div>
                            </div>
                            <div className="col-xl-2 col-sm-4 col-6">
                                <div className="task-summary">
                                    <div className="d-flex align-items-baseline">
                                        <h2 className="text-warning count">7,092</h2>
                                    </div>
                                    <span>Total Estimates</span>
                                    {/* <p>Tasks assigne</p> */}
                                </div>
                            </div>
                            <div className="col-xl-3 col-sm-4 col-6">
                                <div className="task-summary">
                                    <div className="d-flex align-items-baseline">
                                        <h2 className="text-secondary count">478,000 $</h2>
                                    </div>
                                    <span>Amount of Opened Estimats</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StatusCardsEst
