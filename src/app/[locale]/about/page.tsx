import { useTranslations } from 'next-intl';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const tNav = useTranslations('navigation');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-elegant text-4xl font-semibold text-primary-800 mb-8">
          {tNav('about')}
        </h1>

        <div className="bg-white rounded-lg shadow-soft p-8 space-y-6">
          <div>
            <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-4">
              Ketingmar s.r.o.
            </h2>
            <p className="text-neutral-700 leading-relaxed">
              Jsme rodinná firma s dlouholetou tradicí v oblasti pohřebních služeb a květinových aranžmá.
              Specializujeme se na výrobu prémiových pohřebních věnců, které vytváříme s úctou, pečlivostí
              a důrazem na kvalitu.
            </p>
          </div>

          <div>
            <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
              Naše hodnoty
            </h3>
            <ul className="space-y-2 text-neutral-700">
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Úcta a empatie v každém okamžiku</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Ruční výroba s důrazem na detail</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Rychlé a spolehlivé dodání</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-primary-600 mt-1">•</span>
                <span>Osobní přístup ke každému zákazníkovi</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
              Naše služby
            </h3>
            <p className="text-neutral-700 leading-relaxed">
              Nabízíme široký výběr pohřebních věnců a květinových aranžmá, které můžete přizpůsobit
              podle svých představ. Každý věnec je vytvořen s láskou a úctou k památce vašich blízkých.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
