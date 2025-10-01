import { ClockIcon, EnvelopeIcon, MapPinIcon, PhoneIcon } from "@/lib/icons";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact";

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  // Debug logging to verify locale detection
  console.log("Contact page locale:", locale);

  const tContact = await getTranslations({ locale, namespace: "contact" });

  const contactInfo = {
    address: {
      cs: "Jistebník 87 , Jistebník 74282",
      en: "Jistebník 87 , Jistebník 74282",
    },
    phone: "+420 735 116 328",
    email: "info@pohrebni-vence.cz",
    hours: {
      cs: "Po-Pá: Dle objednavek",
      en: "Mon-Fri: Per orders",
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-center text-4xl font-semibold mb-12 text-teal-900">
          {tContact("title")}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information - Compact Professional Card */}
          <div className="lg:col-span-1">
            <div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded-lg shadow-soft p-6 h-fit">
              <h2 className="text-elegant text-xl font-semibold text-teal-900 mb-4 border-b border-teal-100 pb-3">
                {tContact("contactInfo")}
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-teal-900 text-sm mb-1">
                      {tContact("address")}
                    </h3>
                    <p className="text-teal-800 text-sm leading-relaxed">
                      {contactInfo.address[locale as "cs" | "en"]}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <PhoneIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-teal-900 text-sm mb-1">
                      {tContact("phone")}
                    </h3>
                    <a
                      href={`tel:${contactInfo.phone}`}
                      className="text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-teal-900 text-sm mb-1">
                      {tContact("email")}
                    </h3>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium break-all"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <ClockIcon className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-teal-900 text-sm mb-1">
                      {tContact("hours")}
                    </h3>
                    <p className="text-teal-800 text-sm leading-relaxed">
                      {contactInfo.hours[locale as "cs" | "en"]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form - Takes remaining space */}
          <div className="lg:col-span-2">
            <div className="bg-[linear-gradient(to_right,_#AE8625,_#F7EF8A,_#D2AC47)] rounded-lg shadow-soft p-8">
              <h2 className="text-elegant text-2xl font-semibold text-teal-900 mb-6">
                {tContact("contactForm")}
              </h2>

              <p className="text-teal-800 mb-6">{tContact("formDescription")}</p>

              <ContactForm locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
