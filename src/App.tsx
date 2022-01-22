import React, { useState } from 'react';
import { Button, Container, Form, FormControlProps, Row } from 'react-bootstrap';
// import { MonthSelector } from 'react-bootstrap-month-selector';
import { Field, FieldArray, FieldProps, Formik, getIn, validateYupSchema, yupToFormErrors } from "formik";
import { generate } from "shortid";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "react-bootstrap/Navbar";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from "@azure/msal-react";
import { SignInButton } from "./SignIn";
import { loginRequest } from './authConfig';
const MYFORM = (Form)
const nooneof = ['22', '33'];
//----------------------------------------------------------------
Yup.addMethod(Yup.array, 'uniqueProperty', function (propertyName, message) {
  return this.test('unique', message, function (value) {
    if (!value || !value[propertyName]) {
      return true;
    }

    if (
      this.parent
        .filter((v: any) => v !== value)
        .some((v: any) => v[propertyName] === value[propertyName])
    ) {
      throw this.createError({
        path: `${this.path}.${propertyName}`,
      });
    }

    return true;
  });
});
//----------------------------------------------------------------
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').matches(/^[a-zA-Z ]{2,30}$/, 'only alphabets > 2 & < 30 Chars'),
  fdetails: Yup.array().of(
    Yup.object().shape({
      tower: Yup.string().max(10, "Max 10").required('Tower details are required'),
      flat: Yup.string().min(2, "Min 2").required('Flat details are required')
    })
  )

});








const Input = ({ field, form: { errors }, form }: FieldProps) => {
  const errorMessage = getIn(errors, field.name);
  const touch = getIn(form.touched, field.name);
  // const fName = getIn();
  // console.log(field)
  // console.log(field.name.includes(`firstName`))
  return (
    <>
      {/* <input {...field} /> */}

      <Form.Group controlId="formBasicTower" className='col-2'>
        <Form.Label>{field.name.includes(`tower`) ? `Tower` : `Flat`}</Form.Label>
        <Form.Control {...field}
          type="text"
          placeholder={field.name.includes(`tower`) ? `Tower` : `Flat`}
          isValid={touch && !errorMessage}
          isInvalid={touch && !!errorMessage}
        />

        {/* <Form.Text className="text-muted" >
          {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        </Form.Text> */}
        <Form.Control.Feedback type="invalid">
          {errorMessage}
        </Form.Control.Feedback>
      </Form.Group>


    </>
  );
};

const DateBooked = ({ field, form: { errors }, form }: FieldProps) => {
  const errorMessage = getIn(errors, field.name);
  const touch = getIn(form.touched, field.name);
  // const fName = getIn();
  // console.log(field)
  // console.log(field.name.includes(`firstName`))
  return (
    <>
      {/* <input {...field} /> */}

      <Form.Group controlId="formBasicDate" className='col-4'>
        <Form.Label>Date Booked</Form.Label>
        <Form.Control {...field}
          type="date"
          // format='mm/yyyy'
          // value={field.value}
          placeholder={`Date Booked`}
          isValid={touch && !errorMessage}
          isInvalid={touch && !!errorMessage}
        />

        {/* <Form.Text className="text-muted" >
          {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        </Form.Text> */}
        <Form.Control.Feedback type="invalid">
          {errorMessage}
        </Form.Control.Feedback>
      </Form.Group>


    </>
  );
};
function ProfileContent() {
  const { instance, accounts, inProgress } = useMsal();
  const [accessToken, setAccessToken] = useState('');

  const name = accounts[0] && accounts[0].name;
  console.log('==============Account======================');
  console.log(accounts);
  console.log('====================================');
  function RequestAccessToken() {
    const request = {
      ...loginRequest,
      account: accounts[0]
    };

    // Silently acquires an access token which is then attached to a request for Microsoft Graph data
    instance.acquireTokenSilent(request).then((response) => {
      setAccessToken(response.accessToken);
      console.log('===========response.accessToken=========================');
      console.log(response.accessToken);
      console.log('====================================');
    }).catch((e) => {
      instance.acquireTokenPopup(request).then((response) => {
        setAccessToken(response.accessToken);
      });
    });
  }

  return (
    <>
      <h5 className="card-title">Welcome {name}</h5>
      {accessToken ?
        <p>Access Token Acquired!</p>
        :
        <Button variant="secondary" onClick={RequestAccessToken}>Request Access Token</Button>
      }
    </>
  );
};
function App() {
  const isAuthenticated = useIsAuthenticated();
  return (
    <>
      <Navbar bg="primary" variant="dark">
        <a className="navbar-brand" href="/">MSAL React Tutorial</a>
        {isAuthenticated ? <span>Signed In</span> : <SignInButton />}
      </Navbar>
      <Container>
        <ProfileContent />
        <Formik
          initialValues={{
            name: '',
            fdetails: [{ id: "5", tower: '', flat: 'rr', dateBooked: '01/01/2010' }],
          }}
          onSubmit={(values, { }) => {
            console.log(`Submitting`)
            if (values.fdetails.length === 1) {
              alert('Only 1 Flat')
              return
            }

            // return false
            console.log(values)
          }}
          validationSchema={validationSchema}
          validate={(value) => {
            try {
              validateYupSchema(value, validationSchema, true, value);
            } catch (err) {
              return yupToFormErrors(err); //for rendering validation errors
            }

            return {};
          }}
        >
          {({ values, errors, handleSubmit, handleChange, handleBlur, touched, isValid }) => (
            <MYFORM onSubmit={handleSubmit} className="mx-auto">
              <Form.Group controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name='name'
                  placeholder="Enter Name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.name && !errors.name}
                  isInvalid={touched.name && !!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
              <FieldArray name="fdetails">
                {({ push, remove }) => (
                  <div>
                    {values.fdetails.map((p, index) => {
                      return (
                        <Row key={p.id}>
                          <Field
                            name={`fdetails[${index}].tower`}
                            component={Input}
                          />
                          <Field
                            name={`fdetails[${index}].flat`}
                            component={Input}
                          />
                          <Field
                            // format='mm/yyyy'
                            name={`fdetails[${index}].date`}
                            // value={values.name}
                            component={DateBooked}
                          />
                          <Form.Group controlId="formAddButton" style={{ paddingTop: '30px' }}>
                            <Button
                              variant="primary"
                              type="button"
                              onClick={() =>
                                push({ id: generate(), tower: "", flat: "", dateBooked: '' })
                              }
                              style={{ display: `${index === 0 ? 'block' : 'none'}` }}
                            >
                              Add Another Flat
                            </Button>
                          </Form.Group>
                          <div style={{ display: `${index === 0 ? 'none' : 'block'}` }} className='pt-4' onClick={() => remove(index)}>x</div>
                        </Row>
                      );
                    })}
                  </div>
                )}
              </FieldArray>
              <div>
                <Button type="submit">submit</Button>
              </div>
              <pre>{JSON.stringify(values, null, 2)}</pre>
              <pre>{JSON.stringify(errors, null, 2)}</pre>
            </MYFORM>
          )}
        </Formik>
      </Container>
    </>
  );
}

export default App;
