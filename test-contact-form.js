/**
 * Simple test script to verify contact form API functionality
 */

const testContactForm = async () => {
  const testData = {
    name: "Test User",
    email: "test@example.com",
    phone: "+420 123 456 789",
    subject: "Dotaz na pohřební věnce",
    message: "Toto je testovací zpráva pro ověření funkčnosti kontaktního formuláře.",
  };

  try {
    console.log("🧪 Testing contact form API...");
    console.log("Test data:", testData);

    const response = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log("Response status:", response.status);
    console.log("Response data:", result);

    if (response.ok && result.success) {
      console.log("✅ Contact form test successful!");
      console.log("Form submission ID:", result.id);
    } else {
      console.log("❌ Contact form test failed");
      console.log("Error:", result.message || "Unknown error");
    }
  } catch (error) {
    console.error("💥 Test failed with error:", error.message);
  }
};

// Run the test
testContactForm();
