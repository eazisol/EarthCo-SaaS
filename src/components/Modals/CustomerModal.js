import React, { useContext } from "react";
import { CustomerContext } from "../../context/CustomerData";
import AdressConverter from "../../custom/AdressConverter";

const CustomerModal = () => {
  const { selectedCustomer } = useContext(CustomerContext);

  return (
    <>
      <div className="row mb-3">
        <div className="col-xl-6 mb-2">
          <label
            htmlFor="exampleFormControlInput1"
            className="form-label col-form-label col-form-label-sm"
          >
            Customer Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={selectedCustomer.customerName}
            className="form-control form-control-sm"
            name="customerName"
            id="exampleFormControlInput1"
            placeholder="Customer Name"
            readOnly
          />
        </div>
        <div className="col-xl-6 mb-2">
          <label
            htmlFor="exampleFormControlInput4"
            className="form-label col-form-label col-form-label-sm"
          >
            Title<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={selectedCustomer.title}
            className="form-control form-control-sm"
            name="title"
            id="exampleFormControlInput4"
            placeholder="Title"
            readOnly
          />
        </div>
        <div className="col-xl-6 mb-2">
          <label className="form-label col-form-label col-form-label-sm">
            Company Name<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={selectedCustomer.companyName}
            className="form-control form-control-sm"
            name="companyName"
            id="exampleFormControlInput3"
            placeholder="Company Name"
            readOnly
          />
        </div>
        <div className="col-xl-6 mb-2">
          <label className="form-label col-form-label col-form-label-sm">
            Adress<span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={AdressConverter(selectedCustomer.adress)}
            className="form-control form-control-sm"
            name="companyName"
            id="exampleFormControlInput3"
            placeholder="Adress"
            readOnly
          />
        </div>
        <div className="col-xl-6 ">
          <label className="form-label col-form-label col-form-label-sm">
            Description<span className="text-danger">*</span>
          </label>
          <textarea
            className="form-txtarea form-control"
            value={selectedCustomer.description}
            name="description"
            rows="4"
            id="comment"
            readOnly
          ></textarea>
        </div>
        <div className="col-xl-6">
          <div className="row">
            <label className=" col-form-label col-form-label-sm">
              User Login
              {!!selectedCustomer.userLogin ? " Allowed" : " Not Allowed"}
            </label>
            {!!selectedCustomer.userLogin && (
              <>
                <div className="mb-2 row">
                  <label className="col-sm-3 text-right col-form-label-sm">
                    Email
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="email"
                      value={selectedCustomer.userLogin.email}
                      className="form-control form-control-sm"
                      placeholder="Email"
                      readOnly
                    />
                  </div>
                </div>
                <div className="row">
                  <label className="col-sm-3 text-right col-form-label-sm">
                    Password
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="password"
                      value={selectedCustomer.userLogin.password}
                      className="form-control form-control-sm"
                      placeholder="Password"
                      readOnly
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-xl-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="estDataBox">
                <div className="itemtitleBar">
                  <h4>Contacts</h4>
                </div>
                <div className="table-responsive active-projects style-1">
                  <table id="empoloyees-tblwrapper" className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Contact Name</th>
                        <th>E-mail</th>
                        <th>Phone</th>
                        <th>Mobile</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.contacts.map((contact, index) => {
                        return (
                          <>
                            <tr>
                              <td>{index + 1}</td>
                              <td>{contact.contactName}</td>
                              <td>{contact.email}</td>
                              <td>{contact.phone}</td>
                              <td>{contact.mobile}</td>
                            </tr>
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-12">
          <div className="card">
            <div className="card-body p-0">
              <div className="estDataBox">
                <div className="itemtitleBar">
                  <h4>Service Locations</h4>
                </div>
                <div className="table-responsive active-projects style-1">
                  <table id="empoloyees-tblwrapper" className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Customer Fax</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCustomer.serviceLocations.map(
                        (contact, index) => {
                          return (
                            <>
                              <tr>
                                <td>{index + 1}</td>
                                <td>{contact.name}</td>
                                <td>{AdressConverter(contact.adress)}</td>
                                <td>{contact.phone}</td>
                                <td>{contact.fax}</td>
                              </tr>
                            </>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerModal;
