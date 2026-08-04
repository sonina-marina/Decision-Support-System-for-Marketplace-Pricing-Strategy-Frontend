import { useTranslation } from "react-i18next";

export default function ScenariosPage() {
    const { t } = useTranslation();

    return (
        <div>
           <h1 className="text-3xl font-bold text-text-primary">{t('titles.scenarios')}</h1> 
        </div>
    )
}
