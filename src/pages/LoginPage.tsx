import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { TextField } from '../components/ui/TextField';

type Role = 'seller' | 'administrator';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submittingAs, setSubmittingAs] = useState<Role | null>(null);

  function validate(): boolean {
    const next: typeof errors = {};
    if (!email.trim()) next.email = t('auth.errors.required');
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = t('auth.errors.invalidEmail');
    if (!password) next.password = t('auth.errors.required');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent, role: Role) {
    e.preventDefault();
    if (!validate()) return;

    setSubmittingAs(role);
    try {
      // TODO: заменить на реальный вызов из services/auth
      // await authService.signIn({ email, password, role });
      navigate('/dashboard');
    } finally {
      setSubmittingAs(null);
    }
  }

  return (
    <AuthLayout>
      <h2 className="mb-1.5 text-2xl font-bold text-text-primary">{t('auth.signIn.title')}</h2>
      <p className="mb-8 text-sm text-text-secondary">{t('auth.signIn.subtitle')}</p>

      <form onSubmit={(e) => handleSubmit(e, 'seller')} noValidate>
        <TextField
          label={t('auth.signIn.emailLabel')}
          name="email"
          type="email"
          placeholder={t('auth.signIn.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          label={t('auth.signIn.passwordLabel')}
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={submittingAs !== null}
          className="mb-3 w-full rounded-lg bg-accent px-4 py-3 text-[15px] font-semibold text-accent-foreground
            transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {submittingAs === 'seller' ? t('common.loading') : t('auth.signIn.submitSeller')}
        </button>
        <button
          type="button"
          disabled={submittingAs !== null}
          onClick={(e) => handleSubmit(e, 'administrator')}
          className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-[15px] font-medium text-text-primary
            transition-colors hover:bg-bg-elevated disabled:opacity-60"
        >
          {submittingAs === 'administrator' ? t('common.loading') : t('auth.signIn.submitAdmin')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {t('auth.signIn.noAccount')}{' '}
        <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
          {t('auth.signIn.createAccount')}
        </Link>
      </p>
    </AuthLayout>
  );
}

