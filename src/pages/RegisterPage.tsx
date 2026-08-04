import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { TextField } from '../components/ui/TextField';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_STATE: FormState = { name: '', email: '', password: '', confirmPassword: '' };

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = t('auth.errors.required');
    if (!form.email.trim()) next.email = t('auth.errors.required');
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = t('auth.errors.invalidEmail');
    if (!form.password) next.password = t('auth.errors.required');
    else if (form.password.length < 8) next.password = t('auth.errors.passwordTooShort');
    if (form.confirmPassword !== form.password) next.confirmPassword = t('auth.errors.passwordMismatch');

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // TODO: заменить на реальный вызов из services/auth
      // await authService.signUp(form);
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="mb-1.5 text-2xl font-bold text-text-primary">{t('auth.signUp.title')}</h2>
      <p className="mb-8 text-sm text-text-secondary">{t('auth.signUp.subtitle')}</p>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label={t('auth.signUp.nameLabel')}
          name="name"
          placeholder={t('auth.signUp.namePlaceholder')}
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          error={errors.name}
          autoComplete="name"
        />
        <TextField
          label={t('auth.signUp.emailLabel')}
          name="email"
          type="email"
          placeholder={t('auth.signUp.emailPlaceholder')}
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          label={t('auth.signUp.passwordLabel')}
          name="password"
          type="password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <TextField
          label={t('auth.signUp.confirmPasswordLabel')}
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={(e) => update('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent px-4 py-3 text-[15px] font-semibold text-accent-foreground
            transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {submitting ? t('common.loading') : t('auth.signUp.submit')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {t('auth.signUp.haveAccount')}{' '}
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
          {t('auth.signUp.signIn')}
        </Link>
      </p>
    </AuthLayout>
  );
}

