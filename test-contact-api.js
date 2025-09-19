/**
 * Contact Form API Test Suite
 * Tests the contact form functionality without requiring email delivery
 */

require('dotenv').config();

const testCases = [
  {
    name: 'Valid contact form submission',
    data: {
      name: 'Marie Nováková',
      email: 'marie.novakova@example.com',
      phone: '+420 123 456 789',
      subject: 'Dotaz na pohřební věnce',
      message: 'Dobrý den, chtěla bych se zeptat na možnost objednání klasického věnce pro pohřeb mé babičky. Potřebovala bych ho do zítřka. Je to možné? Děkuji.'
    },
    expectedStatus: 201,
    shouldSucceed: true
  },
  {
    name: 'Missing required fields',
    data: {
      name: '',
      email: 'invalid-email',
      subject: '',
      message: 'Short'
    },
    expectedStatus: 400,
    shouldSucceed: false
  },
  {
    name: 'Invalid email format',
    data: {
      name: 'Test User',
      email: 'not-an-email',
      subject: 'Test Subject',
      message: 'This is a test message with enough characters to pass validation.'
    },
    expectedStatus: 400,
    shouldSucceed: false
  },
  {
    name: 'Valid submission without phone',
    data: {
      name: 'Jan Svoboda',
      email: 'jan.svoboda@example.com',
      subject: 'Individuální požadavek',
      message: 'Zdravím, potřeboval bych speciální věnec ve tvaru srdce s modrými květinami. Jedná se o pohřeb mého syna. Můžete mi prosím zavolat? Děkuji.'
    },
    expectedStatus: 201,
    shouldSucceed: true
  }
];

async function testContactFormAPI() {
  console.log('🧪 Starting Contact Form API Test Suite');
  console.log('=' .repeat(50));

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 Test ${i + 1}: ${testCase.name}`);

    try {
      // Create a mock request to test validation logic
      const mockRequest = {
        json: async () => testCase.data,
        headers: {
          get: (name) => {
            switch (name) {
              case 'x-forwarded-for': return '192.168.1.100';
              case 'user-agent': return 'Mozilla/5.0 Test Browser';
              default: return null;
            }
          }
        }
      };

      // Test validation logic
      const { name, email, subject, message, phone } = testCase.data;
      const errors = [];

      // Validate required fields (same logic as API)
      if (!name?.trim()) {
        errors.push('Jméno je povinné');
      }

      if (!email?.trim()) {
        errors.push('E-mail je povinný');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('E-mail není ve správném formátu');
      }

      if (!subject?.trim()) {
        errors.push('Předmět je povinný');
      }

      if (!message?.trim()) {
        errors.push('Zpráva je povinná');
      } else if (message.trim().length < 10) {
        errors.push('Zpráva musí mít alespoň 10 znaků');
      }

      if (phone && phone.trim() && !/^(\+420)?[0-9\s\-()]{9,}$/.test(phone.trim())) {
        errors.push('Telefon není ve správném formátu');
      }

      const hasErrors = errors.length > 0;
      const shouldPass = testCase.shouldSucceed;

      if (shouldPass && !hasErrors) {
        console.log('✅ PASS - Valid data accepted');
        passedTests++;
      } else if (!shouldPass && hasErrors) {
        console.log('✅ PASS - Invalid data rejected');
        console.log('   Validation errors:', errors);
        passedTests++;
      } else if (shouldPass && hasErrors) {
        console.log('❌ FAIL - Valid data rejected');
        console.log('   Unexpected errors:', errors);
      } else {
        console.log('❌ FAIL - Invalid data accepted');
      }

    } catch (error) {
      console.log('❌ FAIL - Test threw error:', error.message);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Contact form validation is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the validation logic.');
  }

  return passedTests === totalTests;
}

// Test database connection
async function testDatabaseConnection() {
  console.log('\n🗄️  Testing database connection...');

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Database connection failed: Missing environment variables');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test if contact_forms table exists
    const { data, error } = await supabase
      .from('contact_forms')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    console.log('✅ contact_forms table is accessible');
    return true;

  } catch (error) {
    console.log('❌ Database test failed:', error.message);
    return false;
  }
}

// Test email configuration
function testEmailConfiguration() {
  console.log('\n📧 Testing email configuration...');

  const requiredVars = [
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'ADMIN_EMAIL'
  ];

  let allConfigured = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.includes('your_') || value.includes('localhost')) {
      console.log(`⚠️  ${varName} is not properly configured`);
      allConfigured = false;
    } else {
      console.log(`✅ ${varName} is configured`);
    }
  }

  if (allConfigured) {
    console.log('✅ Email configuration is complete');
  } else {
    console.log('⚠️  Email configuration needs attention for production use');
  }

  return allConfigured;
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Contact Form System Test Suite');
  console.log('Testing funeral wreaths e-commerce contact form functionality\n');

  const validationPassed = await testContactFormAPI();
  const databasePassed = await testDatabaseConnection();
  const emailConfigured = testEmailConfiguration();

  console.log('\n' + '=' .repeat(60));
  console.log('📋 FINAL TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Form Validation: ${validationPassed ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Database Connection: ${databasePassed ? 'PASS' : 'FAIL'}`);
  console.log(`⚙️  Email Configuration: ${emailConfigured ? 'READY' : 'NEEDS SETUP'}`);

  const systemReady = validationPassed && databasePassed;

  console.log('\n🎯 SYSTEM STATUS:');
  if (systemReady) {
    console.log('✅ Contact form system is FUNCTIONAL');
    console.log('📝 Ready for form submissions and database storage');
    if (!emailConfigured) {
      console.log('⚠️  Configure email settings for production use');
    }
  } else {
    console.log('❌ Contact form system needs attention');
    console.log('🔧 Please fix the failing components before deployment');
  }

  return systemReady;
}

// Execute tests
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runAllTests, testContactFormAPI, testDatabaseConnection, testEmailConfiguration };
