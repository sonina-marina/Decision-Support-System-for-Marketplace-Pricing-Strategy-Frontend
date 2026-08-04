import { useTranslation } from 'react-i18next';

export default function CalculatorPage() {
    const { t } = useTranslation();

    return (
        <div>
           <h1 className="text-3xl font-bold text-text-primary">{t('titles.unit_economics')}</h1> 
        </div>
    )
}
