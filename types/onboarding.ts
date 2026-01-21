export interface OnboardingFormData {
  full_name: string;
  phone: string;
  date_of_birth: string; // ISO format YYYY-MM-DD
  gender: 'male' | 'female';
}

export interface OnboardingFormProps {
  userId: string;
  defaultName: string;
}
