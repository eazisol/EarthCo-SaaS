import React from 'react'
import AddEmployee from './AddEmployee'

const Employees = () => {
    return (
        <div className="content-body">
            <div className="page-titles">
                <ol className="breadcrumb">
                    <div className="menu-icon">
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.986 14.0673C7.4407 14.0673 4.41309 14.6034 4.41309 16.7501C4.41309 18.8969 7.4215 19.4521 10.986 19.4521C14.5313 19.4521 17.5581 18.9152 17.5581 16.7693C17.5581 14.6234 14.5505 14.0673 10.986 14.0673Z" stroke="#888888" strokeLinecap="round" strokeLinejoin="round" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M10.986 11.0054C13.3126 11.0054 15.1983 9.11881 15.1983 6.79223C15.1983 4.46564 13.3126 2.57993 10.986 2.57993C8.65944 2.57993 6.77285 4.46564 6.77285 6.79223C6.76499 9.11096 8.63849 10.9975 10.9563 11.0054H10.986Z" stroke="#888888" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <li><h5 className="bc-title">Employee</h5></li>
                </ol>
                <a className="text-primary fs-13" data-bs-toggle="offcanvas" href="#offcanvasExample1" role="button" aria-controls="offcanvasExample1">+ Add Task</a>
            </div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xl-12">
                        <div className="card">
                            <div className="card-body p-0">
                                <div className="table-responsive active-projects style-1">
                                    <div className="tbl-caption">
                                        <h4 className="heading mb-0">Employees</h4>
                                        <div>
                                            <a className="btn btn-primary btn-sm" style={{ marginRight: '20px' }} data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample">+ Add Employee</a>
                                            <button type="button" className="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#exampleModal1">
                                                + Invite Employee
                                            </button>
                                        </div>
                                    </div>
                                    <table id="empoloyees-tblwrapper" className="table">
                                        <thead>
                                            <tr>
                                                <th>Employee ID</th>
                                                <th>Employee Name</th>
                                                <th>Department</th>
                                                <th>Email Address</th>
                                                <th>Contact Number</th>
                                                <th>Gender</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic2.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>Liam Antony</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-success light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic1.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>Noah Oliver</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-danger light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic3.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>Elijah James</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-success light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic3.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>James Antony</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-success light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic1.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>William Sokli</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-success light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic2.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>William Sokli</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-danger light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic2.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>Benjamin Chaa</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-success light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic1.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>William Sokli</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-danger light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic3.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>Ricky Antony</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-success light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic3.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>William Sokli</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-success light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic1.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>Ricky Antony</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-success light border-0">Active</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td><span>1001</span></td>
                                                <td>
                                                    <div className="products">
                                                        <img src="assets/images/contacts/pic2.jpg" className="avatar avatar-md" alt="" />
                                                        <div>
                                                            <h6>William Sokli</h6>
                                                            <span>Web Designer</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><span>Computer Science</span></td>
                                                <td><span className="text-primary">abc@gmail.com</span></td>
                                                <td>
                                                    <span>+91 123 456 7890</span>
                                                </td>
                                                <td>
                                                    <span>Male</span>
                                                </td>
                                                <td>
                                                    <span>Delhi</span>
                                                </td>
                                                <td>
                                                    <span className="badge badge-danger light border-0">Active</span>
                                                </td>
                                            </tr>

                                        </tbody>

                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <AddEmployee />
            </div>
        </div>
    )
}

export default Employees
