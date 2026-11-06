'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Formik, Form } from 'formik';
import { CameraOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons';

import Card from '../../atoms/Card';
import { H3, H5, Text } from '../../atoms/Typography';
import Alert from '../../atoms/Alert';
import Upload from '../../atoms/Upload';
import { uploadsValidationSchema } from '../../../utils/consultationValidation';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_REPORT_TYPES,
  MAX_UPLOAD_SIZE_MB,
  MAX_BODY_PHOTOS,
  MAX_REPORTS,
} from '../../../utils/uploadValidation';

const PhotoUploadStep = forwardRef(function PhotoUploadStep(
  { formData, updateField, onValid },
  ref
) {
  const formikRef = useRef(null);

  useImperativeHandle(ref, () => ({
    submit: () => formikRef.current?.submitForm(),
  }));

  const uploads = formData.uploads || {};

  return (
    <Formik
      innerRef={formikRef}
      initialValues={{
        bodyPhotos: uploads.bodyPhotos || [],
        reports: uploads.reports || [],
      }}
      enableReinitialize
      validationSchema={uploadsValidationSchema}
      onSubmit={(values) => {
        updateField('uploads', { ...uploads, ...values });
        onValid();
      }}
    >
      {({ values, errors, touched, setFieldValue }) => {
        const bodyPhotoCount = (values.bodyPhotos || []).length;
        const reportCount = (values.reports || []).length;

        return (
          <Form className="space-y-6!">

            <div>
              <H3>
                Upload Your Photos
              </H3>

              <Text muted>
                These photos help our nutritionists assess your current physique and
                provide more accurate recommendations.
              </Text>
            </div>

            <Alert
              type="info"
              message="Photo Guidelines"
              description={
                <ul className="list-disc pl-5 mt-2">
                  <li>Stand in good lighting.</li>
                  <li>Wear fitted clothing.</li>
                  <li>Capture your full body.</li>
                  <li>Avoid mirrors and heavy filters.</li>
                </ul>
              }
            />

            <Card className="glass border border-border-light">

              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CameraOutlined />
                  </span>
                  <H5>Body Photos</H5>
                </div>
                {bodyPhotoCount > 0 && (
                  <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-1">
                    {bodyPhotoCount} added
                  </span>
                )}
              </div>

              <Text muted className="block mb-4">
                Upload Front, Side and Back photos.
              </Text>

              <Upload
                picture
                multiple
                accept="image/*"
                allowedTypes={ALLOWED_IMAGE_TYPES}
                maxSizeMB={MAX_UPLOAD_SIZE_MB}
                maxFiles={MAX_BODY_PHOTOS}
                value={values.bodyPhotos || []}
                onChange={(files) => setFieldValue('bodyPhotos', files)}
                triggerClassName="w-24 h-24 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border-light text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors text-xs"
              >
                <PlusOutlined className="text-lg" />
                <div className="mt-1 text-xs">Upload</div>
              </Upload>

              <Text muted className="block mt-2 text-xs">
                Up to {MAX_BODY_PHOTOS} photos, {MAX_UPLOAD_SIZE_MB}MB each.
              </Text>

              {touched.bodyPhotos && errors.bodyPhotos && (
                <p className="mt-2 text-xs text-danger">{errors.bodyPhotos}</p>
              )}

            </Card>

            <Card className="glass border border-border-light">

              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileTextOutlined />
                  </span>
                  <H5>Medical Reports (Optional)</H5>
                </div>
                {reportCount > 0 && (
                  <span className="text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-1">
                    {reportCount} added
                  </span>
                )}
              </div>

              <Text muted className="block mb-4">
                Upload blood work, hormone reports or any medical reports if available.
              </Text>

              <Upload
                multiple
                accept="image/*,application/pdf"
                allowedTypes={ALLOWED_REPORT_TYPES}
                maxSizeMB={MAX_UPLOAD_SIZE_MB}
                maxFiles={MAX_REPORTS}
                value={values.reports || []}
                onChange={(files) => setFieldValue('reports', files)}
                triggerClassName="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border-light text-text-secondary hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <FileTextOutlined />
                <span>Upload Reports</span>
              </Upload>

              <Text muted className="block mt-2 text-xs">
                Up to {MAX_REPORTS} files (images or PDF), {MAX_UPLOAD_SIZE_MB}MB each.
              </Text>

            </Card>

          </Form>
        );
      }}
    </Formik>
  );
});

export default PhotoUploadStep;
