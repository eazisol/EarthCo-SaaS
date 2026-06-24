
import "bootstrap/dist/css/bootstrap.min.css";
import { useFormik } from "formik";
import { FromSchema } from "../FormSchema";
const Register = () => {

    



  const formInitialValues = {
    FirstName: "",
    LastName: "",
    Email: "",
    PhoneNo: "",
    Password: "",
    Age: "",
    CPass: "",
  };
  const formik = useFormik({
    initialValues: formInitialValues,
    validationSchema: FromSchema,
    onSubmit: async (values, action) => {
      console.log(values);
      action.resetForm();
      try {
        const response = await axios.post(
          "https://localhost:44396/api/webapi/insert",
          {
            values
          }
        );
       
       
      } catch (error) {
        console.error("Error during registration:", error.message);
      }
    },
  });
 
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Registration</h2>
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-3">
          <label htmlFor="FirstName" className="form-label">
            First Name:
          </label>
          <input
            type="text"
            className="form-control"
            id="FirstName"
            name="FirstName"
            value={formik.values.FirstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.errors.FirstName && formik.touched.FirstName ? (
            <small style={{ color: "red" }}>{formik.errors.FirstName}</small>
          ) : null}
        </div>
        <div className="mb-3">
          <label htmlFor="LastName" className="form-label">
            Last Name:
          </label>
          <input
            type="text"
            className="form-control"
            id="LastName"
            name="LastName"
            value={formik.values.LastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.errors.LastName && formik.touched.LastName ? (
            <small style={{ color: "red" }}>{formik.errors.LastName}</small>
          ) : null}
        </div>
        <div className="mb-3">
          <label htmlFor="Email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            className="form-control"
            id="Email"
            name="Email"
            value={formik.values.Email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.errors.Email && formik.touched.Email ? (
            <small style={{ color: "red" }}>{formik.errors.Email}</small>
          ) : null}
        </div>
        <div className="mb-3">
          <label htmlFor="PhoneNo" className="form-label">
            Phone No:
          </label>
          <input
            type="text"
            className="form-control"
            id="PhoneNo"
            name="PhoneNo"
            value={formik.values.PhoneNo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.errors.PhoneNo && formik.touched.PhoneNo ? (
            <small style={{ color: "red" }}>{formik.errors.PhoneNo}</small>
          ) : null}
        </div>
        <div className="mb-3">
          <label htmlFor="Password" className="form-label">
            Password:
          </label>
          <input
            type="password"
            className="form-control"
            id="Password"
            name="Password"
            value={formik.values.Password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.errors.Password && formik.touched.Password ? (
            <small style={{ color: "red" }}>{formik.errors.Password}</small>
          ) : null}
        </div>
        <div className="mb-3">
          <label htmlFor="CPass" className="form-label">
            Confirm Password:
          </label>
          <input
            type="password"
            className="form-control"
            id="CPass"
            name="CPass"
            value={formik.values.CPass}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.errors.CPass && formik.touched.CPass ? (
            <small style={{ color: "red" }}>{formik.errors.CPass}</small>
          ) : null}
        </div>
        <div className="mb-3">
          <label htmlFor="Age" className="form-label">
            Age:
          </label>
          <input
            type="number"
            className="form-control"
            id="Age"
            name="Age"
            value={formik.values.Age}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.errors.Age && formik.touched.Age ? (
            <small style={{ color: "red" }}>{formik.errors.Age}</small>
          ) : null}
        </div>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
        <br />
        <br />
      </form>
    </div>
  );
};
export default Register;
