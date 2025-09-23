import { useState, useEffect } from 'react';
import { useInitiateAuth, useVerifyOtp, useRegister } from '../hooks/useAuth';
import type { RegisterPayload } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { BusinessTypeToggle } from './common/BusinessTypeToggle';

type RegisterFormState = Omit<RegisterPayload, 'phone' | 'email' | 'contactNumber'>;

export const AuthModal = () => {
  // Get the setUser function from our global store
  const { setUser, closeAuthModal } = useAuthStore();

  // Component State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'register'>('phone');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    businessName: '',
    isWholesaler: false, // false = retailer, true = wholesaler
    address: '',
  });

  // API Mutation Hooks
  const initiateAuthMutation = useInitiateAuth();
  const verifyOtpMutation = useVerifyOtp();
  const registerMutation = useRegister();

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handlers
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    initiateAuthMutation.mutate(phone, {
      onSuccess: () => {
        setStep('otp');
        setResendCooldown(60); // 60 seconds cooldown
      },
      onError: (error) => {
        console.error('Failed to send OTP:', error);
        setErrorMessage('Failed to send OTP. Please check your phone number and try again.');
      },
    });
  };

  const handleResendOtp = () => {
    setErrorMessage('');
    setOtp('');
    initiateAuthMutation.mutate(phone, {
      onSuccess: () => {
        setResendCooldown(60); // Reset cooldown
      },
      onError: (error) => {
        console.error('Failed to resend OTP:', error);
        setErrorMessage('Failed to resend OTP. Please try again.');
      },
    });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    verifyOtpMutation.mutate(
      { phone, otp },
      {
        onSuccess: (data) => {
          if (data.success) {
            if (data.isNewUser) {
              setStep('register');
            } else {
              setUser(data.user);
              closeAuthModal();
            }
          } else {
            // Handle verification failure
            setErrorMessage(data.message || 'Invalid verification code. Please try again.');
          }
        },
        onError: (error) => {
          console.error('OTP Verification failed:', error);
          setErrorMessage('Verification failed. Please try again.');
        },
      },
    );
  };

  const handleRegisterFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const payload: RegisterPayload = { ...registerForm, phone };
    registerMutation.mutate(payload, {
      onSuccess: (data) => {
        setUser(data.user);
        closeAuthModal();
      },
      onError: (error) => {
        console.error('Registration failed:', error);
        setErrorMessage('Registration failed. Please check your information and try again.');
      },
    });
  };

  const getStepTitle = () => {
    switch (step) {
      case 'phone':
        return 'Welcome to MedTrade';
      case 'otp':
        return 'Verify Your Phone';
      case 'register':
        return 'Complete Your Profile';
      default:
        return 'Sign In';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'phone':
        return 'Enter your phone number to get started with our secure platform';
      case 'otp':
        return `We've sent a verification code to ${phone}`;
      case 'register':
        return 'Tell us about your business to personalize your experience';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Dimmed backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={closeAuthModal}
      ></div>
      
      {/* Modal container */}
      <div 
        className="relative z-10 w-full max-w-md p-6 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">

          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="text-2xl">📋</div>
              <span className="text-xl font-bold text-gray-900">MedTrade</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
            <p className="text-gray-600">{getStepSubtitle()}</p>
          </div>

          <div className="space-y-6">
            {/* Error Message Display */}
            {errorMessage && (
              <div className="bg-error-50 border border-error-200 text-error px-4 py-3 rounded-md text-sm">
                {errorMessage}
              </div>
            )}

            {/* Phone Step */}
            {step === 'phone' && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="phone" className="form-label flex items-center space-x-2" style={{ marginLeft: '5px' }}>
                    <span>Phone Number</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    required
                    disabled={initiateAuthMutation.isPending}
                    className="form-input"
                    autoComplete="tel"
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-primary btn-lg w-full flex items-center justify-center space-x-2 cursor-pointer"
                  disabled={initiateAuthMutation.isPending}
                >
                  {initiateAuthMutation.isPending ? (
                    <>
                      <div className="loading-spinner small"></div>
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="otp" className="form-label flex items-center space-x-2" style={{ marginLeft: '5px' }}>
                    <span>Verification Code</span>
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    disabled={verifyOtpMutation.isPending}
                    maxLength={6}
                    className="form-input"
                    autoComplete="one-time-code"
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn-primary btn-lg w-full flex items-center justify-center space-x-2 cursor-pointer"
                  disabled={verifyOtpMutation.isPending}
                >
                  {verifyOtpMutation.isPending ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
                <div className="space-y-2">
                  <button 
                    type="button" 
                    className="btn-ghost w-full cursor-pointer"
                    onClick={() => setStep('phone')}
                  >
                    Back to phone number
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn-outline w-full cursor-pointer"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || initiateAuthMutation.isPending}
                  >
                    {resendCooldown > 0 
                      ? `Resend OTP in ${resendCooldown}s` 
                      : 'Resend OTP'
                    }
                  </button>
                </div>
              </form>
            )}

            {/* Registration Step */}
            {step === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="form-group">
                  <label htmlFor="businessName" className="form-label flex items-center space-x-2" style={{ marginLeft: '5px' }}>
                    <span>Business Name</span>
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    value={registerForm.businessName}
                    onChange={handleRegisterFormChange}
                    placeholder="Your business name"
                    required
                    className="form-input"
                    autoComplete="organization"
                  />
                </div>

                <div className="form-group">
                  <fieldset>
                    <legend className="form-label flex items-center space-x-2" style={{ marginLeft: '5px' }}>
                      <span>Business Type</span>
                    </legend>
                    <BusinessTypeToggle
                      value={registerForm.isWholesaler}
                      onChange={(value) => setRegisterForm(prev => ({ ...prev, isWholesaler: value }))}
                    />
                  </fieldset>
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label flex items-center space-x-2" style={{ marginLeft: '5px' }}>
                    <span>Business Address</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    value={registerForm.address}
                    onChange={handleRegisterFormChange}
                    placeholder="Complete business address"
                    required
                    className="form-input"
                    autoComplete="street-address"
                  />
                </div>


                <button 
                  type="submit" 
                  className="btn-primary btn-lg w-full flex items-center justify-center space-x-2 cursor-pointer"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <div className="loading-spinner small"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>

                <button 
                  type="button" 
                  className="btn-ghost w-full cursor-pointer"
                  onClick={() => setStep('phone')}
                >
                  Back to login
                </button>

              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};