import { emailService } from '../src/lib/email/service';

async function testEmail() {
  console.log('Testing email service...');
  
  try {
    const result = await emailService.sendWelcomeEmail(
      'test@example.com',
      'Test Student',
      'TestPassword123'
    );
    
    if (result) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Failed to send email');
    }
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmail();
