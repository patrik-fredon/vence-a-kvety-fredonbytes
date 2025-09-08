import Link from 'next/link';

interface HomeProps {
  params: { locale: string };
}

export default function Home({ params: { locale } }: HomeProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-elegant text-5xl md:text-6xl font-semibold text-primary-800 mb-6">
          {locale === 'cs' ? 'Pohřební věnce' : 'Funeral Wreaths'}
        </h1>
        <p className="text-xl md:text-2xl text-neutral-700 mb-8 leading-relaxed">
          {locale === 'cs'
            ? 'Prémiové pohřební věnce a květinové aranžmá pro důstojné rozloučení'
            : 'Premium funeral wreaths and floral arrangements for dignified farewell'
          }
        </p>
        <p className="text-lg text-neutral-600 mb-12 max-w-2xl mx-auto">
          {locale === 'cs'
            ? 'Ruční výroba, pečlivý výběr květin a rychlé dodání. Pomáháme vám vyjádřit úctu a lásku v těžkých chvílích.'
            : 'Handcrafted, careful flower selection and fast delivery. We help you express respect and love in difficult times.'
          }
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href={`/${locale}/products`}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-elegant"
          >
            {locale === 'cs' ? 'Prohlédnout věnce' : 'Browse Wreaths'}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="border-2 border-primary-600 text-primary-700 hover:bg-primary-50 px-8 py-4 rounded-lg font-medium text-lg transition-colors"
          >
            {locale === 'cs' ? 'Kontaktovat nás' : 'Contact Us'}
          </Link>
        </div>
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🌹</span>
          </div>
          <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
            {locale === 'cs' ? 'Ruční výroba' : 'Handcrafted'}
          </h3>
          <p className="text-neutral-600">
            {locale === 'cs'
              ? 'Každý věnec je pečlivě vytvořen našimi zkušenými floristy s důrazem na detail a kvalitu.'
              : 'Each wreath is carefully crafted by our experienced florists with attention to detail and quality.'
            }
          </p>
        </div>

        <div className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚚</span>
          </div>
          <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
            {locale === 'cs' ? 'Rychlé dodání' : 'Fast Delivery'}
          </h3>
          <p className="text-neutral-600">
            {locale === 'cs'
              ? 'Dodání již následující den. Rozumíme naléhavosti a zajistíme včasné doručení.'
              : 'Next-day delivery available. We understand urgency and ensure timely delivery.'
            }
          </p>
        </div>

        <div className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💝</span>
          </div>
          <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
            {locale === 'cs' ? 'Osobní přístup' : 'Personal Approach'}
          </h3>
          <p className="text-neutral-600">
            {locale === 'cs'
              ? 'Pomůžeme vám vybrat nebo přizpůsobit věnec podle vašich představ a požadavků.'
              : 'We help you select or customize a wreath according to your ideas and requirements.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
