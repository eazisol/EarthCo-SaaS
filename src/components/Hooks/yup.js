import * as Yup from 'yup';
export const FromSchema = Yup.object({
    FirstName: Yup.string().min(3, 'Too Short').max(20, 'Too Long').required('First Name is required'),
    LastName: Yup.string().min(3, 'Too Short').max(20, 'Too Long').required('Last Name is required'),
    Email: Yup.string().email('Invalid email').required('Email is required'),
    PhoneNo: Yup.string().required('Phone number is required').matches(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/, 'Invalid phone number format. Use XXX-XXX-XXXX'),
    Password: Yup.string().min(5).max(20).required('Password is required').matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/, 'Password must contain at least one uppercase letter and one symbol'),
    Age: Yup.number().min(18).max(60).required('Age is required'),
    CPass: Yup.string().required('Confirm password required').oneOf([Yup.ref('Password'), null ], "Both password must match")
});
