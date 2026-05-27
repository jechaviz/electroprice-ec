import React, { useContext, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { sanitizeInputAsync } from '../../utils/deferredSanitize';

// Custom SVG Chip Icon with glow
const ChipIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
    <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="18" x2="8" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="18" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="16" x2="6" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, signIn, signUp, signInWithGoogle, setToast } = useContext(AppContext);
  const { t } = useTranslation();
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('email');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'; 

  if (!isLoginModalOpen) {
    return null;
  }

  const handleClose = () => {
    setIsLoginModalOpen(false);
    setError('');
    setName('');
    setEmail('');
    setPhone('');
    setCredential('');
    setPassword('');
    setAuthMode('login');
    setRegisterMethod('email');
  };

  const fillDemo = (value: string) => {
      if (!value) return;
      const [usr, pwd] = value.split('|');
      setCredential(usr);
      setPassword(pwd);
  };

  const validate = (): boolean => {
    if (authMode === 'register') {
        if (!name.trim()) {
            setError(t('auth.validation.nameRequired'));
            return false;
        }
        if (registerMethod === 'email' && (!email.includes('@') || !email.includes('.'))) {
            setError(t('auth.validation.invalidEmail'));
            return false;
        }
        if (registerMethod === 'phone' && !/^\d{10}$/.test(phone)) {
             setError(t('auth.validation.invalidPhone'));
             return false;
        }
    }
    if (authMode === 'login' && !credential.trim()) {
        setError(t('auth.validation.invalidEmail'));
        return false;
    }
    const minPasswordLength = isDemoMode && authMode === 'login' ? 3 : 8;
    if (password.length < minPasswordLength) {
        setError(t('auth.validation.passwordLength'));
        return false;
    }
    setError('');
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    
    let result;
    if (authMode === 'login') {
        result = await signIn(await sanitizeInputAsync(credential), password);
    } else {
        const [sanitizedName, sanitizedEmail] = await Promise.all([
          sanitizeInputAsync(name),
          registerMethod === 'email' ? sanitizeInputAsync(email) : Promise.resolve(email),
        ]);
        const credentials = {
            name: sanitizedName,
            password,
            ...(registerMethod === 'email' ? { email: sanitizedEmail } : { phone: `+52${phone}` }),
        };
        result = await signUp(credentials);
    }

    if (result.error) {
        setError(result.error.message);
        setToast({ message: result.error.message, type: 'error' });
    } else {
        setToast({ message: authMode === 'login' ? t('auth.success.login') : t('auth.success.register'), type: 'success' });
        handleClose();
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog id="login_modal" className="modal modal-open">
      {/* Backdrop with blur */}
      <div className="modal-backdrop bg-base-100/70 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal Box — Premium Glass */}
      <div className="modal-box relative bg-base-200/95 backdrop-blur-2xl border border-base-content/10 rounded-3xl shadow-2xl shadow-primary/10 max-w-md overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close button */}
        <button onClick={handleClose} className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-base-content/40 hover:text-base-content z-10">✕</button>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <ChipIcon className="w-14 h-14 text-primary mx-auto mb-4 drop-shadow-[0_0_12px_rgba(124,58,237,0.5)]" />
            <h3 className="heading text-2xl font-bold">
              {authMode === 'login' ? t('auth.title.login') : t('auth.title.register')}
            </h3>
            <p className="text-sm text-base-content/40 mt-2 body">{t('auth.subtitle')}</p>
          </div>

          {/* DEMO MODE AUTO-FILL (EASYPOINT INSPIRATION) */}
          {isDemoMode && authMode === 'login' && (
             <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 shadow-md shadow-amber-500/5">
                 <div className="flex items-center justify-between mb-3">
                    <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest"><i className="fa-solid fa-bolt mr-1"></i> Fast Login Demo</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                     <button 
                        type="button" 
                        className="btn btn-sm bg-base-300 text-xs hover:bg-base-content hover:text-base-100 border-0 shadow-sm"
                        onClick={() => fillDemo('admin.user@electroprice.com|test1234')}
                    >
                        <i className="fa-solid fa-shield text-[10px]"></i> Admin
                     </button>
                     <button 
                        type="button" 
                        className="btn btn-sm bg-base-300 text-xs hover:bg-base-content hover:text-base-100 border-0 shadow-sm"
                        onClick={() => fillDemo('user@electroprice.com|test1234')}
                    >
                        <i className="fa-solid fa-user text-[10px]"></i> User (Buyer)
                     </button>
                 </div>
             </div>
          )}
          
          {/* Google Sign In */}
          <button 
            type="button" 
            className={`btn w-full rounded-xl bg-base-300/50 border border-base-content/10 text-base-content/70 hover:bg-base-300/80 hover:text-base-content hover:border-primary/20 transition-all duration-300 ${loading ? 'btn-disabled' : ''}`}
            onClick={handleGoogleSignIn}
          >
            {loading && <span className="loading loading-spinner loading-sm"></span>}
            <i className="fa-brands fa-google"></i>
            {t('auth.signInWithGoogle')}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-base-content/10" />
            <span className="text-xs text-base-content/30 uppercase tracking-wider font-semibold">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-base-content/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div role="tablist" className="flex rounded-xl overflow-hidden border border-base-content/10">
                  <button type="button" className={`flex-1 py-2 text-sm font-semibold transition-all ${registerMethod === 'email' ? 'bg-primary text-white' : 'bg-base-300/30 text-base-content/50 hover:text-base-content'}`} onClick={() => setRegisterMethod('email')}>{t('auth.useEmail')}</button>
                  <button type="button" className={`flex-1 py-2 text-sm font-semibold transition-all ${registerMethod === 'phone' ? 'bg-primary text-white' : 'bg-base-300/30 text-base-content/50 hover:text-base-content'}`} onClick={() => setRegisterMethod('phone')}>{t('auth.usePhone')}</button>
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1.5 block">{t('auth.name')}</label>
                  <input type="text" placeholder={t('auth.name')} className="input w-full rounded-xl bg-base-300/40 border-base-content/10 focus:border-primary/50 focus:bg-base-300/60 transition-all placeholder:text-base-content/20" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                {registerMethod === 'email' ? (
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1.5 block">{t('auth.email')}</label>
                    <input type="email" placeholder={t('auth.email')} className="input w-full rounded-xl bg-base-300/40 border-base-content/10 focus:border-primary/50 focus:bg-base-300/60 transition-all placeholder:text-base-content/20" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1.5 block">{t('auth.phone')}</label>
                    <div className="flex gap-2">
                      <span className="btn bg-base-300/40 border-base-content/10 rounded-xl text-base-content/50 pointer-events-none">+52</span>
                      <input type="tel" placeholder="55 1234 5678" className="input flex-1 rounded-xl bg-base-300/40 border-base-content/10 focus:border-primary/50 focus:bg-base-300/60 transition-all placeholder:text-base-content/20" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))} required />
                    </div>
                  </div>
                )}
              </>
            )}
            
            {authMode === 'login' && (
              <div>
                <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1.5 block">Email</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-base-content/30 group-focus-within:text-primary transition-colors pointer-events-none"><i className="fa-solid fa-envelope"></i></div>
                    <input type="text" placeholder={t('auth.emailOrPhone')} className="input w-full rounded-xl bg-base-300/40 border-base-content/10 focus:border-primary/50 focus:bg-base-300/60 transition-all placeholder:text-base-content/20 pl-11" value={credential} onChange={(e) => setCredential(e.target.value)} required />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1.5 block">{t('auth.password')}</label>
               <div className="relative group">
                   <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-base-content/30 group-focus-within:text-primary transition-colors pointer-events-none"><i className="fa-solid fa-key"></i></div>
                   <input type="password" placeholder={t('auth.password')} className="input w-full rounded-xl bg-base-300/40 border-base-content/10 focus:border-primary/50 focus:bg-base-300/60 transition-all placeholder:text-base-content/20 pl-11" value={password} onChange={(e) => setPassword(e.target.value)} required/>
               </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-error text-sm p-3 rounded-xl bg-error/10 border border-error/20">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className={`btn w-full rounded-xl bg-gradient-to-r from-primary to-secondary border-0 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 ${loading ? 'btn-disabled' : ''}`}
            >
              {loading && <span className="loading loading-spinner loading-sm"></span>}
              {authMode === 'login' ? t('auth.cta.login') : t('auth.cta.register')}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center mt-5">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
              className="text-sm text-primary hover:text-secondary transition-colors duration-200 font-medium"
            >
              {authMode === 'login' ? t('auth.toggle.toRegister') : t('auth.toggle.toLogin')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default LoginModal;
