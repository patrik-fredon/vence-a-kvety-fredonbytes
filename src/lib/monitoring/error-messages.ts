interface ErrorMessage {
  title: string;
  message: string;
  recoveryActions: Array<{
    label: string;
    action: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    primary?: boolean;
  }>;
  contactSupport?: boolean;
}

interface ErrorContext {
  errorType?: string;
  statusCode?: number;
  url?: string;
  userAction?: string;
}

export function getErrorMessage(error: Error, context: ErrorContext = {}): ErrorMessage {
  const { statusCode } = context;

  // Network errors
  if (error.message.includes("fetch") || error.message.includes("network")) {
    return {
      title: "Problém s připojením",
      message: "Nepodařilo se připojit k serveru. Zkontrolujte prosím své internetové připojení.",
      recoveryActions: [
        {
          label: "Zkusit znovu",
          action: () => window.location.reload(),
          primary: true,
        },
        {
          label: "Zkontrolovat připojení",
          action: () => {
            if (navigator.onLine) {
              alert("Připojení k internetu je aktivní. Problém může být na straně serveru.");
            } else {
              alert("Nejste připojeni k internetu. Zkontrolujte prosím své připojení.");
            }
          },
        },
      ],
      contactSupport: true,
    };
  }

  // Payment errors
  if (error.message.includes("payment") || error.message.includes("stripe")) {
    return {
      title: "Chyba při platbě",
      message: "Při zpracování platby došlo k chybě. Vaše karta nebyla zatížena.",
      recoveryActions: [
        {
          label: "Zkusit znovu",
          action: () => window.location.reload(),
          primary: true,
        },
        {
          label: "Změnit způsob platby",
          action: () => {
            const checkoutUrl = "/checkout";
            window.location.href = checkoutUrl;
          },
        },
        {
          label: "Zkontrolovat košík",
          action: () => {
            const cartUrl = "/cart";
            window.location.href = cartUrl;
          },
        },
      ],
      contactSupport: true,
    };
  }

  // Authentication errors
  if (error.message.includes("auth") || error.message.includes("login") || statusCode === 401) {
    return {
      title: "Problém s přihlášením",
      message: "Vaše relace vypršela nebo nejste přihlášeni. Přihlaste se prosím znovu.",
      recoveryActions: [
        {
          label: "Přihlásit se",
          action: () => {
            window.location.href = "/auth/signin";
          },
          primary: true,
        },
        {
          label: "Pokračovat bez přihlášení",
          action: () => {
            window.location.href = "/";
          },
        },
      ],
    };
  }

  // Product/Cart errors
  if (error.message.includes("product") || error.message.includes("cart")) {
    return {
      title: "Problém s produktem",
      message: "Při práci s produktem nebo košíkem došlo k chybě.",
      recoveryActions: [
        {
          label: "Obnovit stránku",
          action: () => window.location.reload(),
          primary: true,
        },
        {
          label: "Zpět na produkty",
          action: () => {
            window.location.href = "/products";
          },
        },
        {
          label: "Zkontrolovat košík",
          action: () => {
            window.location.href = "/cart";
          },
        },
      ],
    };
  }

  // Form validation errors
  if (error.message.includes("validation") || error.message.includes("required")) {
    return {
      title: "Chyba ve formuláři",
      message:
        "Některé údaje ve formuláři nejsou správně vyplněny. Zkontrolujte prosím všechna pole.",
      recoveryActions: [
        {
          label: "Zkontrolovat formulář",
          action: () => {
            // Scroll to first error field
            const errorField =
              document.querySelector('[aria-invalid="true"]') ||
              document.querySelector(".error") ||
              document.querySelector("input:invalid");
            if (errorField) {
              errorField.scrollIntoView({ behavior: "smooth", block: "center" });
              (errorField as HTMLElement).focus();
            }
          },
          primary: true,
        },
      ],
    };
  }

  // Server errors (5xx)
  if (statusCode && statusCode >= 500) {
    return {
      title: "Chyba serveru",
      message: "Na serveru došlo k chybě. Pracujeme na jejím vyřešení.",
      recoveryActions: [
        {
          label: "Zkusit za chvíli",
          action: () => {
            setTimeout(() => {
              window.location.reload();
            }, 5000);
          },
          primary: true,
        },
        {
          label: "Hlavní stránka",
          action: () => {
            window.location.href = "/";
          },
        },
      ],
      contactSupport: true,
    };
  }

  // Not found errors (404)
  if (statusCode === 404) {
    return {
      title: "Stránka nenalezena",
      message: "Požadovaná stránka neexistuje nebo byla přesunuta.",
      recoveryActions: [
        {
          label: "Hlavní stránka",
          action: () => {
            window.location.href = "/";
          },
          primary: true,
        },
        {
          label: "Produkty",
          action: () => {
            window.location.href = "/products";
          },
        },
        {
          label: "Kontakt",
          action: () => {
            window.location.href = "/contact";
          },
        },
      ],
    };
  }

  // Rate limiting errors (429)
  if (statusCode === 429) {
    return {
      title: "Příliš mnoho požadavků",
      message: "Odeslali jste příliš mnoho požadavků. Zkuste to prosím za chvíli.",
      recoveryActions: [
        {
          label: "Zkusit za minutu",
          action: () => {
            setTimeout(() => {
              window.location.reload();
            }, 60000);
          },
          primary: true,
        },
      ],
    };
  }

  // Generic JavaScript errors
  if (error instanceof TypeError) {
    return {
      title: "Chyba aplikace",
      message: "V aplikaci došlo k neočekávané chybě. Zkuste obnovit stránku.",
      recoveryActions: [
        {
          label: "Obnovit stránku",
          action: () => window.location.reload(),
          primary: true,
        },
        {
          label: "Vymazat cache",
          action: () => {
            if ("caches" in window) {
              caches
                .keys()
                .then((names) => {
                  names.forEach((name) => {
                    caches.delete(name);
                  });
                })
                .then(() => {
                  window.location.reload();
                });
            } else {
              // Fallback: clear localStorage and reload
              if (typeof window !== "undefined") {
                localStorage.clear();
                sessionStorage.clear();
                (window as any).location.reload();
              }
            }
          },
        },
      ],
      contactSupport: true,
    };
  }

  // Default error message
  return {
    title: "Neočekávaná chyba",
    message: "Došlo k neočekávané chybě. Omlouváme se za nepříjemnosti.",
    recoveryActions: [
      {
        label: "Zkusit znovu",
        action: () => window.location.reload(),
        primary: true,
      },
      {
        label: "Hlavní stránka",
        action: () => {
          window.location.href = "/";
        },
      },
    ],
    contactSupport: true,
  };
}

// Specific error messages for common scenarios
export const commonErrorMessages = {
  networkError: {
    title: "Problém s připojením",
    message: "Zkontrolujte prosím své internetové připojení a zkuste to znovu.",
  },

  serverError: {
    title: "Chyba serveru",
    message: "Server momentálně není dostupný. Zkuste to prosím později.",
  },

  validationError: {
    title: "Neplatné údaje",
    message: "Zkontrolujte prosím vyplněné údaje a opravte chyby.",
  },

  paymentError: {
    title: "Chyba platby",
    message: "Platbu se nepodařilo zpracovat. Zkuste jiný způsob platby.",
  },

  authError: {
    title: "Chyba přihlášení",
    message: "Přihlášení se nezdařilo. Zkontrolujte své přihlašovací údaje.",
  },

  notFoundError: {
    title: "Nenalezeno",
    message: "Požadovaný obsah nebyl nalezen.",
  },

  permissionError: {
    title: "Nedostatečná oprávnění",
    message: "Nemáte oprávnění k provedení této akce.",
  },

  timeoutError: {
    title: "Vypršel časový limit",
    message: "Operace trvala příliš dlouho. Zkuste to prosím znovu.",
  },
};
