import { getTranslations } from "next-intl/server";
import { MapPinIcon, PhoneIcon, EnvelopeIcon, ClockIcon } from "@heroicons/react/24/outline";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const tNav = await getTranslations("navigation");
  const tFooter = await getTranslations("footer");

  const contactInfo = {
    address: {
      cs: "Hlavní 123, 110 00 Praha 1",
      en: "Hlavní 123, 110 00 Prague 1",
    },
    phone: "+420 123 456 789",
    email: "info@pohrebni-vence.cz",
    hours: {
      cs: "Po-Pá: 8:00-17:00, So: 9:00-14:00",
      en: "Mon-Fri: 8:00-17:00, Sat: 9:00-14:00",
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-elegant text-4xl font-semibold text-primary-800 mb-8">
          {tNav("contact")}
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-6">
              Kontaktní informace
            </h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPinIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">Adresa</h3>
                  <p className="text-neutral-600">{contactInfo.address[locale as "cs" | "en"]}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <PhoneIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">Telefon</h3>
                  <a
                    href={`tel:${contactInfo.phone}`}
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <EnvelopeIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">E-mail</h3>
                  <a
                    href={`mailto:${contactInfo.email}`}
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <ClockIcon className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-neutral-800 mb-1">Otevírací doba</h3>
                  <p className="text-neutral-600">{contactInfo.hours[locale as "cs" | "en"]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Placeholder */}
          <div className="bg-white rounded-lg shadow-soft p-8">
            <h2 className="text-elegant text-2xl font-semibold text-primary-800 mb-6">
              Napište nám
            </h2>

            <div className="text-center py-8">
              <p className="text-neutral-600 mb-4">
                Kontaktní formulář bude implementován v dalších krocích.
              </p>
              <p className="text-sm text-neutral-500">
                Zatím nás prosím kontaktujte telefonicky nebo e-mailem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
