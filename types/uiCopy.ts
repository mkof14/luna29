export interface AuthCopy {
  auth: {
    recoveryHeadline: string;
    recoveryText: string;
    email: string;
    recoveryCta: string;
    headline: string;
    subheadline: string;
    google: string;
    password: string;
    hide: string;
    show: string;
    forgot: string;
    login: string;
    signup: string;
    noAccount: string;
    hasAccount: string;
    backToPublic?: string;
  };
}

export interface PricingCopy {
  pricing: {
    monthly: string;
    monthlyPrice: string;
    perMonth: string;
    yearly: string;
    yearlyPrice: string;
    perYear: string;
    features: string[];
  };
}

export interface ContactCopy {
  contact: {
    headline: string;
    subheadline: string;
    supportTitle: string;
    supportDesc: string;
    feedbackTitle: string;
    feedbackDesc: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    send: string;
  };
}
