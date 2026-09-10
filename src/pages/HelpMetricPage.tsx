import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

const CONTENT_KEYS = ['cm_below', 'ltv_below', 'ltv_above'] as const;

export default function HelpMetricPage() {
  const { metricKey, status } = useParams<{ metricKey: string; status: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const contentKey = `${metricKey}_${status}`;
  const isKnown = (CONTENT_KEYS as readonly string[]).includes(contentKey);

  return (
    <div className="max-w-5xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={15} />
        {t('common.back')}
      </button>

      {isKnown ? (
        <>
          <h1 className="mb-2 text-2xl font-bold text-text-primary">
            {t(`help.metricStatus.${contentKey}.title`)}
          </h1>
          <p className="mb-6 text-sm text-text-muted">{t(`help.metricStatus.${contentKey}.subtitle`)}</p>

          <div className="flex flex-col gap-4">
            <Section title={t('help.metricStatus.section.whatItMeans')}>
              {t(`help.metricStatus.${contentKey}.whatItMeans`)}
            </Section>
            <Section title={t('help.metricStatus.section.whyItHappens')}>
              {t(`help.metricStatus.${contentKey}.whyItHappens`)}
            </Section>
            <Section title={t('help.metricStatus.section.whatToDo')}>
              {t(`help.metricStatus.${contentKey}.whatToDo`)}
            </Section>
          </div>
        </>
      ) : (
        <p className="text-sm text-text-muted">{t('help.metricStatus.notFound')}</p>
      )}

      <Link to="/help" className="mt-6 inline-block text-sm text-accent hover:text-accent-hover">
        {t('help.metricStatus.backToHelp')}
      </Link>
    </div>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="mb-2 text-sm font-semibold text-text-primary">{title}</p>
      <p className="text-sm leading-relaxed text-text-secondary">{children}</p>
    </div>
  );
}

