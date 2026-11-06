'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form } from 'formik';

import Alert from '../../atoms/Alert';
import { GOAL_DATA_SCHEMAS } from '../../../utils/consultationValidation';

const GoalSpecificStep = forwardRef(function GoalSpecificStep(
  { goal, formData, updateGoalData, onValid },
  ref
) {
  const formikRef = useRef(null);

  useImperativeHandle(ref, () => ({
    submit: () => formikRef.current?.submitForm(),
  }));

  if (!goal) {
    return (
      <Alert
        type="warning"
        message="Please select a consultation goal first."
      />
    );
  }

  const GoalForm = goal.component;

  return (
    <Formik
      innerRef={formikRef}
      initialValues={formData.goalData || {}}
      enableReinitialize
      validationSchema={GOAL_DATA_SCHEMAS[goal.id]}
      onSubmit={(values) => {
        Object.entries(values).forEach(([key, value]) => updateGoalData(key, value));
        onValid();
      }}
    >
      {({ values, errors, touched, setFieldValue }) => (
        <Form>
          <GoalForm
            values={values}
            errors={errors}
            touched={touched}
            setFieldValue={setFieldValue}
          />
        </Form>
      )}
    </Formik>
  );
});

export default GoalSpecificStep;
