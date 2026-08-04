import { useTranslation } from "react-i18next"

export default function NotFoundPage() {
    const { t } = useTranslation();

    return (
        <div>
           <h1 className="text-3xl font-bold text-text-primary">{t('titles.not_found')}</h1> 
        </div>
    )
}
