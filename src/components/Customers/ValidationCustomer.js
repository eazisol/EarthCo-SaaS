import * as Yup from "yup";

export const ValidationCustomer = Yup.object({
  FirstName: Yup.string().required("First Name is required"),
  LastName: Yup.string().required("Last Name is required"),
  Phone: Yup.number()
    .typeError("Phone number must be a valid number")
    .required("Phone number is required"),
  Email: Yup.string().email("Invalid email").required("Email is required"),
  Address: Yup.string().required("Address is required"),
  CompanyName: Yup.string().required("Company name is required"),
});

export const ServiceValidation = Yup.object({
  // isBilltoCustomer: Yup.boolean().required('Bill to is required'),
  Name: Yup.string().required("Name is required"),
  Phone: Yup.number()
    .typeError("Phone number must be a valid number")
    .required("Phone number is required"),
//   Address: Yup.string().required("Address is required"),
});

export const SignupValidation = Yup.object({
  userName: Yup.string().required("Username Name is required"),
  FirstName: Yup.string().required("First Name is required"),
  LastName: Yup.string().required("Last Name is required"),
  Email: Yup.string().email("Invalid email").required("Email is required"),
  Password: Yup.string()
    .required("Password is required")
    .matches(
      /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/,
      "Password must contain at least one uppercase letter and one symbol"
    ),
  Address: Yup.string().required("Address is required"),
  Phone: Yup.number()
    .typeError("Phone number must be a valid number")
    .required("Phone number is required"),
});
