import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
export function AuthModal({ isOpen, onClose, defaultMode = 'login' }) {
    const [mode, setMode] = useState(defaultMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login, register } = useAuth();
    if (!isOpen)
        return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(email, password);
                onClose();
            }
            else if (mode === 'signup') {
                await register(fullName, email, password);
                onClose();
            }
            else {
                setSuccess('Please contact support to reset your password.');
            }
        }
        catch (err) {
            setError(err.message || 'Something went wrong');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose}/>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative bg-card rounded-3xl shadow-xl-custom w-full max-w-md p-8 border border-border">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="gradient-orange w-9 h-9 rounded-xl flex items-center justify-center shadow-brand">
            <Zap className="h-5 w-5 text-white fill-current"/>
          </div>
          <span className="font-display font-bold text-xl text-foreground">NovaStore</span>
        </div>

        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset password'}
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-6">
          {mode === 'login' ? 'Sign in to your account' : mode === 'signup' ? 'Join millions of happy shoppers' : 'We\'ll send you a reset link'}
        </p>

        {error && (<div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-body">
            {error}
          </div>)}
        {success && (<div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-body">
            {success}
          </div>)}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (<div>
              <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1.5 block">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jane Doe" required className="w-full px-4 py-3 bg-secondary border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>
            </div>)}

          <div>
            <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1.5 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 bg-secondary border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>
          </div>

          {mode !== 'forgot' && (<div>
              <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 bg-secondary border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-11"/>
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
              {mode === 'login' && (<button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary font-body mt-1.5 hover:underline">
                  Forgot password?
                </button>)}
            </div>)}

          <motion.button type="submit" disabled={loading} className="w-full gradient-orange text-white py-3.5 rounded-2xl font-bold font-body text-sm shadow-brand flex items-center justify-center gap-2 disabled:opacity-70" whileTap={{ scale: 0.98 }}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : (<>
                {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                <ArrowRight className="h-4 w-4"/>
              </>)}
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          {mode === 'login' ? (<>Don't have an account? <button onClick={() => setMode('signup')} className="text-primary font-semibold hover:underline">Sign up</button></>) : (<>Already have an account? <button onClick={() => setMode('login')} className="text-primary font-semibold hover:underline">Sign in</button></>)}
        </p>
      </motion.div>
    </div>);
}
