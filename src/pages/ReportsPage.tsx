import { useTranslation } from "react-i18next";

export default function ReportsPage() {
    const { t } = useTranslation();

    return (
        <div>
           <h1 className="text-3xl font-bold text-text-primary">{t('titles.reports')}</h1> 
        </div>
    )
}
