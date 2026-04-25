import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ChevronDown, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, signup } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');

  // If already logged in, navigate away
  useEffect(() => {
    if (user) {
      navigate(redirectPath || `/${user.role}`, { replace: true });
    }
  }, [user, navigate, redirectPath]);

  // Tab State: Determine initial tab based on route, or default to login
  const [activeTab, setActiveTab] = useState(location.pathname === '/signup' ? 'register' : 'login');

  // --- LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // --- REGISTER STATE ---
  const [step, setStep] = useState(1);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('student');
  const [adminId, setAdminId] = useState('');
  const [admins, setAdmins] = useState([]);
  const [otp, setOtp] = useState('');

  const [regErrors, setRegErrors] = useState({});
  const [regApiError, setRegApiError] = useState('');
  const [isRegLoading, setIsRegLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Fetch Admins for Organiser Role
  useEffect(() => {
    if (regRole === 'organiser') {
      const fetchAdmins = async () => {
        try {
          const { data } = await API.get('/auth/admins');
          setAdmins(data);
          if (data.length > 0) {
            setAdminId(data[0]._id);
          }
        } catch (err) {
          console.error("Failed to fetch admins", err);
        }
      };
      fetchAdmins();
    }
  }, [regRole]);

  // OTP Timer Logic
  useEffect(() => {
    let interval;
    if (timer > 0 && step === 2) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  // --- LOGIN HANDLER ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoginLoading(true);

    try {
      const data = await login(loginEmail, loginPassword);
      navigate(redirectPath || `/${data.role}`);
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  // --- REGISTER HANDLERS ---
  const validateStep1 = () => {
    const errs = {};
    if (!regName.trim()) errs.name = 'Name is required';
    if (!regEmail.includes('@')) errs.email = 'Enter a valid email';
    if (!regPhone.trim() || regPhone.length < 10) errs.phone = 'Valid phone is required';
    if (regPassword.length < 6) errs.password = 'Minimum 6 characters';
    if (regPassword !== regConfirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (regRole === 'organiser' && !adminId) errs.adminId = 'Admin selection is required';
    return errs;
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) {
      setRegErrors(errs);
      return;
    }
    setRegErrors({});
    setRegApiError('');
    setIsRegLoading(true);

    try {
      await API.post('/auth/send-otp', { email: regEmail, phone: regPhone });
      setStep(2);
      setTimer(300); // 5 minutes timer
    } catch (err) {
      setRegApiError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsRegLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setRegErrors({ otp: 'Please enter a valid 6-digit OTP' });
      return;
    }

    setRegErrors({});
    setRegApiError('');
    setIsRegLoading(true);

    try {
      await API.post('/auth/verify-otp', { email: regEmail, otp });
      const data = await signup(regName, regEmail, regPassword, regRole, regPhone, adminId);
      navigate(redirectPath || `/${data.role}`);
    } catch (err) {
      setRegApiError(err.response?.data?.message || 'Verification or Signup failed. Please try again.');
    } finally {
      setIsRegLoading(false);
    }
  };

  const formatTime = (timeInSeconds) => {
    const m = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const s = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleKeyDown = (e, nextFieldId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldId) {
        document.getElementById(nextFieldId)?.focus();
      } else {
        const form = e.target.closest('form');
        if (form) {
          const submitBtn = form.querySelector('button[type="submit"]');
          if (submitBtn && !submitBtn.disabled) {
            submitBtn.click();
          }
        }
      }
    }
  };

  // Common input classes for the clean Unstop look
  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-sm";
  const labelClass = "block text-sm text-gray-700 mb-1.5";
  const buttonClass = "w-full py-3 mt-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
      
      {/* Home Button */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-all border border-slate-200"
      >
        <Home className="w-4 h-4" /> 
        <span className="hidden sm:inline">Back to Home</span>
      </button>

      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png"
            alt="EventHub Logo"
            className="h-24 md:h-28 object-contain mix-blend-multiply cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          />
        </div>

        {/* Headings */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Next Opportunity Starts Here</h1>
          <p className="mt-2 text-sm text-gray-500">
            Log in to discover events, workshops and competitions built for you.
          </p>
        </div>

        {/* Toggle / Segmented Control */}
        {step === 1 && (
          <div className="flex p-1 bg-gray-100 rounded-xl my-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Register
            </button>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {loginError}
              </div>
            )}
            <div>
              <label className={labelClass}>Email <span className="text-red-500">*</span></label>
              <input
                id="loginEmail"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'loginPassword')}
                placeholder="Enter Email"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Password <span className="text-red-500">*</span></label>
              <input
                id="loginPassword"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, null)}
                placeholder="Enter Password"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={isLoginLoading || !loginEmail || !loginPassword}
              className={buttonClass}
            >
              {isLoginLoading ? 'Signing In...' : 'Login'}
            </button>
          </form>
        )}

        {/* ================= REGISTER FORM ================= */}
        {activeTab === 'register' && (
          <div className="space-y-4">
            {regApiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {regApiError}
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name <span className="text-red-500">*</span></label>
                  <input
                    id="regName"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'regEmail')}
                    placeholder="Enter Full Name"
                    className={inputClass}
                  />
                  {regErrors.name && <p className="text-red-500 text-xs mt-1">{regErrors.name}</p>}
                </div>

                <div>
                  <label className={labelClass}>Email <span className="text-red-500">*</span></label>
                  <input
                    id="regEmail"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'regPhone')}
                    placeholder="Enter Email"
                    className={inputClass}
                  />
                  {regErrors.email && <p className="text-red-500 text-xs mt-1">{regErrors.email}</p>}
                </div>

                <div>
                  <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
                  <input
                    id="regPhone"
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, 'regPassword')}
                    placeholder="Enter Phone Number"
                    className={inputClass}
                  />
                  {regErrors.phone && <p className="text-red-500 text-xs mt-1">{regErrors.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Password <span className="text-red-500">*</span></label>
                    <input
                      id="regPassword"
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'regConfirmPassword')}
                      placeholder="Password"
                      className={inputClass}
                    />
                    {regErrors.password && <p className="text-red-500 text-xs mt-1">{regErrors.password}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Confirm Password <span className="text-red-500">*</span></label>
                    <input
                      id="regConfirmPassword"
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, 'regRole')}
                      placeholder="Confirm"
                      className={inputClass}
                    />
                    {regErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{regErrors.confirmPassword}</p>}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Register As <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      id="regRole"
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, regRole === 'organiser' ? 'adminId' : null)}
                      className={`${inputClass} appearance-none bg-white`}
                    >
                      <option value="student">Student</option>
                      <option value="organiser">Organiser</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {regRole === 'organiser' && (
                  <div>
                    <label className={labelClass}>Select Admin to Report To <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      <select
                        id="adminId"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, null)}
                        className={`${inputClass} appearance-none bg-white`}
                      >
                        {admins.length === 0 && <option value="" disabled>No Admins available</option>}
                        {admins.map((admin) => (
                          <option key={admin._id} value={admin._id}>{admin.name}</option>
                        ))}
                      </select>
                    </div>
                    {regErrors.adminId && <p className="text-red-500 text-xs mt-1">{regErrors.adminId}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isRegLoading}
                  className={buttonClass}
                >
                  {isRegLoading ? 'Sending OTP...' : 'Continue'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndSignup} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to details
                </button>

                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit OTP to <br /><strong className="text-gray-900">{regEmail}</strong>
                  </p>
                </div>

                <div>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, null)}
                    placeholder="Enter OTP"
                    maxLength={6}
                    className={`${inputClass} text-center tracking-widest text-xl font-semibold`}
                  />
                  {regErrors.otp && <p className="text-red-500 text-xs mt-1 text-center">{regErrors.otp}</p>}
                </div>

                <div className="flex items-center justify-between text-sm mt-2 px-1">
                  <span className="text-gray-500">Expires in: <span className="font-mono text-gray-900 font-medium">{formatTime(timer)}</span></span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={timer > 0 || isRegLoading}
                    className="font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isRegLoading || !otp || otp.length < 6}
                  className={buttonClass}
                >
                  {isRegLoading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 leading-relaxed">
            By continuing, you agree to EventHub's <Link to="/terms" className="text-blue-600 font-medium hover:underline hover:text-blue-700 transition-colors">Terms of Service</Link> and acknowledge you've read our <Link to="/privacy" className="text-blue-600 font-medium hover:underline hover:text-blue-700 transition-colors">Privacy Policy</Link>.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Secure access to events, hackathons, and verified certifications.
          </p>
        </div>
      </div>
    </div>
  );
}
