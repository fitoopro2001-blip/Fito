'use client';

import { useState, useMemo } from 'react';
import {
  Steps,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Upload,
  Slider,
  Card,
  Typography,
  Space,
  message,
  Progress,
  Result,
} from 'antd';
import { UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const steps = [
  { title: 'Personal Info', icon: '📋' },
  { title: 'Upload Photos', icon: '📸' },
  { title: 'Expert Review', icon: '👨‍⚕️' },
  { title: 'Your Plan', icon: '📄' },
  { title: 'Track Progress', icon: '📈' },
];

export default function ConsultationFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    dob: null,
    gender: '',
    height: 170, // cm
    weight: 70,  // kg
  });
  const [fileList, setFileList] = useState([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // BMI calculation
  const bmi = useMemo(() => {
    const heightM = formData.height / 100;
    if (heightM > 0 && formData.weight > 0) {
      const bmiVal = formData.weight / (heightM * heightM);
      return bmiVal.toFixed(1);
    }
    return null;
  }, [formData.height, formData.weight]);

  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const b = parseFloat(bmi);
    if (b < 18.5) return 'Underweight';
    if (b < 25) return 'Normal';
    if (b < 30) return 'Overweight';
    return 'Obese';
  }, [bmi]);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Next step
  const next = () => {
    if (currentStep === 0) {
      // Validate required fields before proceeding
      const required = ['name', 'email', 'goal', 'height', 'weight'];
      for (let field of required) {
        if (!formData[field]) {
          message.error('Please fill in all required fields.');
          return;
        }
      }
      if (!formData.dob) {
        message.error('Please select your date of birth.');
        return;
      }
    }
    if (currentStep === 1) {
      if (fileList.length === 0) {
        message.error('Please upload at least one photo.');
        return;
      }
    }
    if (currentStep === 2) {
      // Simulate expert review
      setIsReviewing(true);
      setTimeout(() => {
        setIsReviewing(false);
        setCurrentStep(prev => prev + 1);
      }, 2000);
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFinish = () => {
    setIsComplete(true);
    message.success('Your consultation is complete!');
  };

  // Upload props
  const uploadProps = {
    fileList,
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    onRemove: (file) => {
      setFileList(fileList.filter(f => f.uid !== file.uid));
    },
    multiple: true,
    accept: 'image/*',
    listType: 'picture-card',
  };

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
                <Input
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={e => handleFieldChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                <Input
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => handleFieldChange('email', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <Input
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={e => handleFieldChange('phone', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Primary Goal *</label>
                <Select
                  placeholder="Select your goal"
                  className="w-full"
                  value={formData.goal || undefined}
                  onChange={val => handleFieldChange('goal', val)}
                  options={[
                    { value: 'build-muscle', label: '💪 Build Muscle' },
                    { value: 'lose-fat', label: '🔥 Lose Fat' },
                    { value: 'weight-gain', label: '⚖️ Weight Gain' },
                    { value: 'healthy-lifestyle', label: '❤️ Healthy Lifestyle' },
                    { value: 'endurance', label: '🏃 Endurance' },
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth *</label>
                <DatePicker
                  className="w-full"
                  placeholder="Select date"
                  value={formData.dob ? dayjs(formData.dob) : null}
                  onChange={date => handleFieldChange('dob', date ? date.toISOString() : null)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
                <Select
                  placeholder="Select"
                  className="w-full"
                  value={formData.gender || undefined}
                  onChange={val => handleFieldChange('gender', val)}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
              </div>
            </div>

            {/* BMI Calculator */}
            <div className="bg-white/5 rounded-xl p-5 border border-white/10">
              <Title level={5} className="text-white mb-2">BMI Calculator</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-300">Height (cm) *</label>
                  <Slider
                    min={100}
                    max={250}
                    value={formData.height}
                    onChange={val => handleFieldChange('height', val)}
                    className="mt-1"
                  />
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={e => handleFieldChange('height', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300">Weight (kg) *</label>
                  <Slider
                    min={30}
                    max={200}
                    value={formData.weight}
                    onChange={val => handleFieldChange('weight', val)}
                    className="mt-1"
                  />
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={e => handleFieldChange('weight', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              {bmi && (
                <div className="mt-3 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                  <Text className="text-white">
                    <strong>Your BMI:</strong> {bmi} – <span className="text-yellow-400">{bmiCategory}</span>
                  </Text>
                  <Text className="block text-gray-400 text-sm">
                    {bmiCategory === 'Underweight' && 'Consider a weight-gain plan.'}
                    {bmiCategory === 'Normal' && 'You’re in a healthy range – let’s optimize!'}
                    {bmiCategory === 'Overweight' && 'We can help you shed extra weight.'}
                    {bmiCategory === 'Obese' && 'Our experts will design a comprehensive plan.'}
                  </Text>
                </div>
              )}
            </div>
          </div>
        );

      case 1:
        return (
          <div>
            <Paragraph className="text-gray-300 mb-4">
              Upload 2–3 full-body photos (front, side, back) so our experts can better assess your physique.
            </Paragraph>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} className="bg-white/10 border-white/20 text-white hover:bg-yellow-400/20">
                Upload Photos
              </Button>
            </Upload>
            <div className="mt-4 text-gray-400 text-sm">
              {fileList.length > 0 && `${fileList.length} file(s) uploaded`}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center py-8">
            {isReviewing ? (
              <>
                <Progress type="circle" percent={75} strokeColor="#facc15" className="mb-4" />
                <Title level={4} className="text-white">Our experts are reviewing your case...</Title>
                <Paragraph className="text-gray-400">This usually takes 2–3 minutes.</Paragraph>
              </>
            ) : (
              <div>
                <Button type="primary" size="large" onClick={next}>
                  Start Review
                </Button>
                <Paragraph className="text-gray-400 mt-4">
                  Click to begin the automated expert analysis.
                </Paragraph>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div>
            <Result
              icon={<CheckCircleOutlined className="text-yellow-400" />}
              title={<span className="text-white">Your Personalized Plan is Ready!</span>}
              subTitle="Based on your goals and body data, we've prepared a comprehensive diet and supplement plan."
            />
            <Card className="bg-white/5 border-white/10">
              <Title level={5} className="text-white">Plan Preview</Title>
              <ul className="text-gray-300 list-disc pl-5 space-y-1">
                <li><strong>Daily Calorie Target:</strong> 2,200 kcal</li>
                <li><strong>Protein:</strong> 150g</li>
                <li><strong>Carbs:</strong> 220g</li>
                <li><strong>Fats:</strong> 70g</li>
                <li><strong>Supplement Recommendation:</strong> Whey Protein, Creatine, Omega-3</li>
              </ul>
            </Card>
            <div className="mt-6 flex gap-4 justify-center">
              <Button type="primary" size="large" onClick={handleFinish}>
                Accept & Proceed
              </Button>
              <Button size="large" onClick={prev}>
                Go Back
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            <Result
              status="success"
              title={<span className="text-white">Track Your Progress</span>}
              subTitle="We'll send you weekly check-ins and adjustments to keep you on track."
            />
            <Space size="middle" className="mt-4">
              <Button type="primary" size="large" href="/dashboard">
                Go to Dashboard
              </Button>
              <Button size="large" href="/">
                Back to Home
              </Button>
            </Space>
          </div>
        );

      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
        <Title level={2} className="text-white">🎉 Consultation Complete!</Title>
        <Paragraph className="text-gray-300 text-lg">
          Your personalized plan is being prepared. You'll receive an email within 24 hours.
        </Paragraph>
        <Button type="primary" size="large" href="/dashboard" className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <Steps
        current={currentStep}
        items={steps.map(s => ({ title: s.title }))}
        className="mb-10"
        responsive
      />

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
        {renderStep()}

        <div className="mt-8 flex justify-between items-center border-t border-white/10 pt-6">
          <Button
            onClick={prev}
            disabled={currentStep === 0}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            Previous
          </Button>
          {currentStep < 4 && currentStep !== 2 && (
            <Button type="primary" onClick={next}>
              {currentStep === 3 ? 'Finish' : 'Next'}
            </Button>
          )}
          {currentStep === 2 && !isReviewing && (
            <Button type="primary" onClick={next}>
              Start Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}