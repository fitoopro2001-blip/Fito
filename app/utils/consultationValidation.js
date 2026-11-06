import * as Yup from "yup";

// Keep these in sync with backend/src/constants/personalInfo.js and the
// regexes in backend/src/controllers/consultations.controller.js — the
// backend re-checks the same rules, so drifting here causes a submit that
// passes the frontend but 400s on the server (or vice versa).
export const GENDERS = ["male", "female", "other"];
export const ACTIVITY_LEVELS = ["sedentary", "light", "moderate", "active"];
export const PHONE_REGEX = /^[0-9+\-\s()]{7,20}$/;

export const personalInfoValidationSchema = Yup.object({
  fullName: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone: Yup.string()
    .trim()
    .matches(PHONE_REGEX, "Enter a valid phone number")
    .required("Phone number is required"),
  dob: Yup.date()
    .typeError("Enter a valid date of birth")
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required"),
  gender: Yup.string()
    .oneOf(GENDERS, "Select a gender")
    .required("Gender is required"),
  activityLevel: Yup.string()
    .oneOf(ACTIVITY_LEVELS, "Select an activity level")
    .required("Activity level is required"),
  height: Yup.number()
    .typeError("Enter a valid height")
    .positive("Height must be greater than 0")
    .required("Height is required"),
  weight: Yup.number()
    .typeError("Enter a valid weight")
    .positive("Weight must be greater than 0")
    .required("Weight is required"),
});

// Only bodyPhotos is required — reports stay optional, matching the "(Optional)"
// label in PhotoUploadStep and the fact the backend never enforces reports.
export const uploadsValidationSchema = Yup.object({
  bodyPhotos: Yup.array()
    .min(1, "Please upload at least one body photo")
    .required("Please upload at least one body photo"),
});

// Only the fields essential to a nutritionist reviewing the case are
// required here — the rest of each goal form (checkboxes, free-text notes,
// sliders with sensible defaults) stays optional. The backend stores
// goalData as an untyped blob, so it never rejects these — being stricter
// here than the backend can't cause a submit-time conflict.
const numberField = (label) =>
  Yup.number().typeError(`Enter a valid ${label}`).positive(`${label} must be greater than 0`).required(`${label} is required`);

export const GOAL_DATA_SCHEMAS = {
  "fat-loss": Yup.object({
    currentWeight: numberField("current weight"),
    targetWeight: numberField("target weight"),
    activity: Yup.string().required("Please select your activity level"),
  }),
  "muscle-gain": Yup.object({
    targetWeight: numberField("target weight"),
    trainingExperience: Yup.string().required("Please select your training experience"),
    gymAccess: Yup.string().required("Please let us know if you have gym access"),
  }),
  "body-recomposition": Yup.object({
    targetWeight: numberField("target weight"),
    experience: Yup.string().required("Please select your training experience"),
  }),
  pcos: Yup.object({
    diagnosed: Yup.string().required("Please let us know if you have been diagnosed"),
    cycle: Yup.string().required("Please select your cycle regularity"),
  }),
  "mother-wellness": Yup.object({
    postpartumStage: Yup.string().required("Please let us know how long since you had your baby"),
    breastfeeding: Yup.string().required("Please select your breastfeeding status"),
  }),
  diabetes: Yup.object({
    diabetesType: Yup.string().required("Please select your diabetes type"),
    fastingSugar: numberField("fasting blood sugar"),
  }),
  "home-training": Yup.object({
    lahoreArea: Yup.string().trim().required("Please tell us your area in Lahore"),
    trainingAddress: Yup.string().trim().required("Please enter the training address"),
    primaryGoal: Yup.string().required("Please select your primary goal"),
    fitnessLevel: Yup.string().required("Please select your current fitness level"),
    emergencyContactName: Yup.string().trim().required("Emergency contact name is required"),
    emergencyContactNumber: Yup.string().trim().required("Emergency contact number is required"),
  }),
  "office-consultation": Yup.object({
    city: Yup.string().trim().required("City is required"),
    consultationType: Yup.string().required("Please select what the consultation is for"),
    activityLevel: Yup.string().required("Please select your activity level"),
    mainConcern: Yup.string().trim().required("Please describe your main concern"),
    preferredDate: Yup.string().required("Please pick a preferred consultation date"),
  }),
};
