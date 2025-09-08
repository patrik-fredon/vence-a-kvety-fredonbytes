export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-memorial">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-elegant text-5xl md:text-6xl font-semibold text-primary-800 mb-6">
            Pohřební věnce
          </h1>
          <p className="text-xl md:text-2xl text-neutral-700 mb-8 leading-relaxed">
            Prémiové pohřební věnce a květinové aranžmá pro důstojné rozloučení
          </p>
          <p className="text-lg text-neutral-600 mb-12 max-w-2xl mx-auto">
            Ruční výroba, pečlivý výběr květin a rychlé dodání.
            Pomáháme vám vyjádřit úctu a lásku v těžkých chvílích.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors shadow-elegant">
              Prohlédnout věnce
            </button>
            <button className="border-2 border-primary-600 text-primary-700 hover:bg-primary-50 px-8 py-4 rounded-lg font-medium text-lg transition-colors">
              Kontaktovat nás
            </button>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌹</span>
            </div>
            <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
              Ruční výroba
            </h3>
            <p className="text-neutral-600">
              Každý věnec je pečlivě vytvořen našimi zkušenými floristy s důrazem na detail a kvalitu.
            </p>
          </div>

          <div className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚚</span>
            </div>
            <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
              Rychlé dodání
            </h3>
            <p className="text-neutral-600">
              Dodání již následující den. Rozumíme naléhavosti a zajistíme včasné doručení.
            </p>
          </div>

          <div className="text-center p-6 bg-white/50 rounded-xl shadow-soft">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💝</span>
            </div>
            <h3 className="text-elegant text-xl font-semibold text-primary-800 mb-3">
              Osobní přístup
            </h3>
            <p className="text-neutral-600">
              Pomůžeme vám vybrat nebo přizpůsobit věnec podle vašich představ a požadavků.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-primary-900 text-primary-100 py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2024 Ketingmar s.r.o. • Pohřební věnce • Všechna práva vyhrazena
          </p>
        </div>
      </footer>
    </div>
  );
}
