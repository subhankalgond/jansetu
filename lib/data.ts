export type Scheme = {
  id: string;
  name: string;
  department: string;
  level: 'Central' | 'Karnataka';
  category: string;
  description: string;
  benefit: string;
  eligibility: string[];
  documents: string[];
  source: string;
  deadline?: string;
  tags: string[];
};

export type Service = {
  id: string;
  name: string;
  department: string;
  category: string;
  description: string;
  documents: string[];
  steps: string[];
  link: string;
  processing?: string;
  fee?: string;
};

export const schemes: Scheme[] = [
  {
    id: 'pm-scholarship', name: 'PM Scholarship Scheme', department: 'Ministry of Defence', level: 'Central', category: 'Education',
    description: 'Financial support for the higher technical and professional education of wards and widows of personnel of the Armed Forces.',
    benefit: '₹2,500/month for boys and ₹3,000/month for girls, for up to 5 years.',
    eligibility: ['Dependent ward or widow of eligible Armed Forces personnel', 'Minimum 60% in the qualifying examination', 'First professional degree course'],
    documents: ['Service certificate', 'Mark sheets', 'Bank account details', 'Aadhaar-linked mobile number'], source: 'https://ksb.gov.in', deadline: 'Check official portal', tags: ['student', 'education']
  },
  {
    id: 'pm-kisan', name: 'Pradhan Mantri Kisan Samman Nidhi', department: 'Ministry of Agriculture & Farmers Welfare', level: 'Central', category: 'Agriculture',
    description: 'Income support for eligible landholding farmer families, subject to applicable exclusions.',
    benefit: '₹6,000 per year in three equal instalments, transferred through DBT.',
    eligibility: ['Landholding farmer family as defined by the scheme', 'Valid land records', 'Subject to exclusion criteria'],
    documents: ['Aadhaar number', 'Land ownership records', 'Bank account details'], source: 'https://pmkisan.gov.in', tags: ['farmer', 'agriculture']
  },
  {
    id: 'ssp-karnataka', name: 'Karnataka Social Security Pension', department: 'Department of Revenue, Karnataka', level: 'Karnataka', category: 'Social security',
    description: 'Social security pensions for eligible senior citizens, widows and persons with disabilities in Karnataka.',
    benefit: 'Monthly pension support; amount depends on the pension category and current government orders.',
    eligibility: ['Resident of Karnataka', 'Must meet the category-specific age, income and other requirements', 'Not receiving an excluded pension'],
    documents: ['Age or category proof', 'Residence proof', 'Income certificate', 'Bank or post office account'], source: 'https://sevasindhu.karnataka.gov.in', tags: ['senior', 'woman', 'disability', 'karnataka']
  },
  {
    id: 'nsap', name: 'National Social Assistance Programme', department: 'Ministry of Rural Development', level: 'Central', category: 'Social security',
    description: 'A social assistance programme for older persons, widows and persons with disabilities from eligible households.',
    benefit: 'Central assistance under the applicable pension component, with state contribution where applicable.',
    eligibility: ['Belong to a household identified under applicable deprivation criteria', 'Meet the relevant age or category requirement'],
    documents: ['Identity proof', 'Age proof', 'Residence proof', 'Bank account details'], source: 'https://nsap.nic.in', tags: ['senior', 'woman', 'disability']
  },
  {
    id: 'nsp', name: 'National Scholarship Portal', department: 'Ministry of Electronics & Information Technology', level: 'Central', category: 'Education',
    description: 'A single-window portal for applications and disbursal of several central, state and UT scholarships.',
    benefit: 'Scholarship support varies by the selected scheme, course and student category.',
    eligibility: ['Eligibility varies by scholarship', 'Student must meet the selected scheme requirements'],
    documents: ['Previous examination marksheet', 'Income certificate where required', 'Bank account details', 'Institution verification'], source: 'https://scholarships.gov.in', tags: ['student', 'education']
  },
  {
    id: 'mudra', name: 'Pradhan Mantri MUDRA Yojana', department: 'Department of Financial Services', level: 'Central', category: 'Entrepreneurship',
    description: 'Collateral-free institutional credit for micro enterprises through participating lenders.',
    benefit: 'Loans under Shishu, Kishor and Tarun categories, subject to lender assessment.',
    eligibility: ['Small business or micro enterprise activity', 'Applicant must satisfy the lending institution’s terms'],
    documents: ['KYC documents', 'Business address proof', 'Business plan or quotations where requested'], source: 'https://www.mudra.org.in', tags: ['entrepreneur', 'business']
  }
];

export const services: Service[] = [
  { id: 'income-certificate', name: 'Income Certificate', department: 'Revenue Department', category: 'Certificates', description: 'Official certificate used to establish a person or family’s income for public services and benefits.', documents: ['Identity proof', 'Address proof', 'Self-declaration of income', 'Supporting income documents where applicable'], steps: ['Create an account on your state service portal.', 'Select Income Certificate and enter applicant details.', 'Upload the documents requested by your state.', 'Submit and save the acknowledgement number.', 'Track the request through the official portal.'], link: 'https://sevasindhu.karnataka.gov.in', processing: 'Varies by state', fee: 'Check official portal' },
  { id: 'passport', name: 'Passport Application', department: 'Ministry of External Affairs', category: 'Identity & travel', description: 'Apply for a new passport or reissue through the official Passport Seva system.', documents: ['Proof of present address', 'Proof of date of birth', 'Photograph and supporting documents as applicable'], steps: ['Register on Passport Seva.', 'Fill and submit the application form.', 'Pay the applicable fee and book an appointment.', 'Visit the Passport Seva Kendra with originals.', 'Track dispatch using the official status tool.'], link: 'https://www.passportindia.gov.in', processing: 'Depends on service and police verification', fee: 'Displayed during application' },
  { id: 'voter-registration', name: 'Voter Registration', department: 'Election Commission of India', category: 'Identity & civic', description: 'Register as a new voter, correct details or change your electoral address.', documents: ['Age proof', 'Residence proof', 'Recent photograph'], steps: ['Open the Voters’ Services Portal.', 'Choose the appropriate form for registration or correction.', 'Submit details and supporting documents.', 'Use the reference number to track the request.'], link: 'https://voters.eci.gov.in', processing: 'Varies by electoral office', fee: 'No fee for registration' },
  { id: 'driving-licence', name: 'Driving Licence', department: 'Ministry of Road Transport & Highways', category: 'Transport', description: 'Apply for a learner’s licence, driving licence or related transport services.', documents: ['Age proof', 'Address proof', 'Medical certificate where required', 'Learner licence for driving licence application'], steps: ['Use the Sarathi Parivahan portal for your state.', 'Complete the application and pay the applicable fee.', 'Book the required test or appointment.', 'Attend the test with original documents.', 'Track the application online.'], link: 'https://sarathi.parivahan.gov.in', processing: 'Varies by state', fee: 'Displayed during application' },
  { id: 'land-records', name: 'Land Records', department: 'State Revenue Department', category: 'Land & property', description: 'View or request land record information through your state’s official land records portal.', documents: ['Survey or account details', 'Identity proof for requested services'], steps: ['Select your state land records portal.', 'Search using the survey or account details.', 'For certified copies, follow the portal’s request process.', 'Save the application or document reference.'], link: 'https://landrecords.karnataka.gov.in', processing: 'Varies by record type', fee: 'Check official portal' }
];

export const categoryLabels = ['All', 'Education', 'Agriculture', 'Social security', 'Entrepreneurship'];
