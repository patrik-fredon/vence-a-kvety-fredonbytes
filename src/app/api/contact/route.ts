import { type NextRequest, NextResponse } from "next/server";
import {
  sendAdminNotificationEmail,
  sendCustomerThankYouEmail,
  validateEmailConfig,
} from "@/lib/email/resend";
import { createServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/utils/rate-limit";
import type { ContactFormRequest, ContactFormResponse } from "@/types/contact";

/**
 * POST /api/contact - Submit contact form
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, "general");
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Příliš mnoho požadavků. Zkuste to prosím později.",
        },
        { status: 429 }
      );
    }

    // Validate email configuration
    const emailConfig = validateEmailConfig();
    if (!emailConfig.isValid) {
      console.error("Email configuration errors:", emailConfig.errors);
      return NextResponse.json(
        {
          success: false,
          message: "Služba e-mailu není správně nakonfigurována.",
        },
        { status: 500 }
      );
    }

    // Parse request body
    let body: ContactFormRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Neplatný formát dat.",
        },
        { status: 400 }
      );
    }

    // Validate required fields
    const { name, email, subject, message, phone } = body;
    const errors: string[] = [];

    if (!name?.trim()) {
      errors.push("Jméno je povinné");
    }

    if (!email?.trim()) {
      errors.push("E-mail je povinný");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("E-mail není ve správném formátu");
    }

    if (!subject?.trim()) {
      errors.push("Předmět je povinný");
    }

    if (!message?.trim()) {
      errors.push("Zpráva je povinná");
    } else if (message.trim().length < 10) {
      errors.push("Zpráva musí mít alespoň 10 znaků");
    }

    if (phone && phone.trim() && !/^(\+420)?[0-9\s\-()]{9,}$/.test(phone.trim())) {
      errors.push("Telefon není ve správném formátu");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Formulář obsahuje chyby",
          errors,
        },
        { status: 400 }
      );
    }

    // Get client information
    const ipAddress =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Save to database
    const supabase = createServerClient();
    const { data: contactForm, error: dbError } = await supabase
      .from("contact_forms")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
        status: "new",
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: "Chyba při ukládání zprávy. Zkuste to prosím později.",
        },
        { status: 500 }
      );
    }

    // Prepare email data
    const submittedAt = new Date().toISOString();
    const emailData = {
      customerName: name.trim(),
      customerEmail: email.trim().toLowerCase(),
      customerPhone: phone?.trim(),
      subject: subject.trim(),
      message: message.trim(),
      submittedAt,
    };

    const adminEmailData = {
      ...emailData,
      ipAddress,
      userAgent,
    };

    // Send emails (don't block the response on email sending)
    Promise.all([
      sendCustomerThankYouEmail(emailData).catch((error) => {
        console.error("Failed to send customer email:", error);
      }),
      sendAdminNotificationEmail(adminEmailData).catch((error) => {
        console.error("Failed to send admin email:", error);
      }),
    ]);

    // Return success response
    const response: ContactFormResponse = {
      success: true,
      message: "Vaše zpráva byla úspěšně odeslána. Děkujeme!",
      id: contactForm.id,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Contact form API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Došlo k neočekávané chybě. Zkuste to prosím později.",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact - Get contact form submissions (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // This would require admin authentication
    // For now, return method not allowed
    return NextResponse.json(
      {
        success: false,
        message: "Metoda není povolena",
      },
      { status: 405 }
    );
  } catch (error) {
    console.error("Contact form GET API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Došlo k neočekávané chybě",
      },
      { status: 500 }
    );
  }
}
