import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  console.log('Cleaning existing data...');
  await prisma.example.deleteMany();
  await prisma.datasetExport.deleteMany();
  await prisma.sourceDataset.deleteMany();
  console.log('✅ Cleaned\n');

  // Create chat log dataset
  console.log('Creating chat log dataset...');
  const chatDataset = await prisma.sourceDataset.create({
    data: {
      name: 'Customer Support Conversations',
      type: 'chat_log',
      rawStorageKey: 'seed_chat_data',
    },
  });
  console.log(`✅ Created dataset: ${chatDataset.id}\n`);

  // Create FAQ dataset
  console.log('Creating FAQ dataset...');
  const faqDataset = await prisma.sourceDataset.create({
    data: {
      name: 'Product FAQ',
      type: 'faq',
      rawStorageKey: 'seed_faq_data',
    },
  });
  console.log(`✅ Created dataset: ${faqDataset.id}\n`);

  // Seed chat examples with quality scores
  console.log('Seeding chat examples...');
  const chatExamples = [
    {
      inputText: 'How do I reset my password?',
      outputText:
        'To reset your password, click the "Forgot Password" link on the login page. Enter your email address and we will send you a reset link within minutes. The link expires in 24 hours.',
      qualityScore: 0.95,
      metaJson: { category: 'account', tags: ['password', 'security'] },
    },
    {
      inputText: 'What are your business hours?',
      outputText:
        'Our customer support team is available Monday through Friday, 9:00 AM to 5:00 PM EST. We are closed on weekends and major holidays.',
      qualityScore: 0.92,
      metaJson: { category: 'general', tags: ['hours', 'support'] },
    },
    {
      inputText: 'How do I cancel my subscription?',
      outputText:
        'You can cancel your subscription at any time from your account settings. Go to Settings > Billing > Cancel Subscription. You will have access until the end of your current billing period.',
      qualityScore: 0.88,
      metaJson: { category: 'billing', tags: ['subscription', 'cancellation'] },
    },
    {
      inputText: 'Is there a mobile app?',
      outputText:
        'Yes! We have mobile apps for both iOS and Android. Download them from the App Store or Google Play Store by searching for our app name.',
      qualityScore: 0.9,
      metaJson: { category: 'product', tags: ['mobile', 'app'] },
    },
    {
      inputText: 'Can I export my data?',
      outputText:
        'Absolutely! Go to Settings > Data & Privacy > Export Data. We will email you a download link within 24 hours. The export includes all your information in JSON format.',
      qualityScore: 0.87,
      metaJson: { category: 'data', tags: ['export', 'privacy'] },
    },
    {
      inputText: 'Do you offer student discounts?',
      outputText:
        'Yes, we offer a 50% discount for students with a valid .edu email address or student ID verification. Visit our pricing page and click "Student Discount" to apply.',
      qualityScore: 0.93,
      metaJson: { category: 'pricing', tags: ['discount', 'student'] },
    },
    {
      inputText: 'How secure is my data?',
      outputText:
        'We take security very seriously. All data is encrypted at rest and in transit using industry-standard AES-256 encryption. We are SOC 2 Type II certified and undergo regular security audits.',
      qualityScore: 0.96,
      metaJson: { category: 'security', tags: ['encryption', 'compliance'] },
    },
    {
      inputText: 'Can I invite team members?',
      outputText:
        'Yes, on our Team and Enterprise plans you can invite unlimited team members. Go to Settings > Team > Invite Members and enter their email addresses.',
      qualityScore: 0.89,
      metaJson: { category: 'collaboration', tags: ['team', 'invite'] },
    },
  ];

  for (const example of chatExamples) {
    await prisma.example.create({
      data: {
        ...example,
        sourceDatasetId: chatDataset.id,
      },
    });
  }
  console.log(`✅ Created ${chatExamples.length} chat examples\n`);

  // Seed FAQ examples with quality scores
  console.log('Seeding FAQ examples...');
  const faqExamples = [
    {
      inputText: 'What payment methods do you accept?',
      outputText:
        'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and ACH bank transfers for annual plans. Cryptocurrency payments are available for Enterprise customers.',
      qualityScore: 0.94,
      metaJson: { category: 'billing', tags: ['payment', 'methods'] },
    },
    {
      inputText: 'What is your refund policy?',
      outputText:
        'We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact our support team for a full refund. No questions asked. Refunds typically process within 5-10 business days.',
      qualityScore: 0.91,
      metaJson: { category: 'billing', tags: ['refund', 'guarantee'] },
    },
    {
      inputText: 'Do you offer free trials?',
      outputText:
        'Yes! We offer a 14-day free trial with full access to all features. No credit card required to start. You can upgrade to a paid plan at any time during or after your trial.',
      qualityScore: 0.97,
      metaJson: { category: 'pricing', tags: ['trial', 'free'] },
    },
    {
      inputText: 'Can I upgrade or downgrade my plan?',
      outputText:
        'You can change your plan at any time. Upgrades take effect immediately and you will be charged a prorated amount. Downgrades take effect at the end of your current billing cycle.',
      qualityScore: 0.86,
      metaJson: { category: 'billing', tags: ['upgrade', 'downgrade'] },
    },
    {
      inputText: 'Is training available?',
      outputText:
        'Yes! We provide free onboarding training for all new customers. Enterprise customers get dedicated training sessions and ongoing support. We also have a comprehensive knowledge base and video tutorials.',
      qualityScore: 0.9,
      metaJson: { category: 'support', tags: ['training', 'onboarding'] },
    },
    {
      inputText: 'What happens to my data if I cancel?',
      outputText:
        'Your data remains accessible for 90 days after cancellation. You can export everything during this time. After 90 days, data is permanently deleted from our servers in accordance with our privacy policy.',
      qualityScore: 0.92,
      metaJson: { category: 'data', tags: ['cancellation', 'retention'] },
    },
    {
      inputText: 'Do you have an API?',
      outputText:
        'Yes, we provide a comprehensive REST API with all plans. API documentation is available at docs.example.com/api. Rate limits vary by plan: Starter (1000 requests/day), Professional (10,000/day), Enterprise (unlimited).',
      qualityScore: 0.88,
      metaJson: { category: 'technical', tags: ['api', 'integration'] },
    },
    {
      inputText: 'Can I use this for commercial purposes?',
      outputText:
        'Absolutely! All our plans include full commercial usage rights. You can use our service for client work, resale, or any business application without additional licensing fees.',
      qualityScore: 0.95,
      metaJson: { category: 'licensing', tags: ['commercial', 'business'] },
    },
    {
      inputText: 'What browsers are supported?',
      outputText:
        'We support the latest versions of Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported. For the best experience, we recommend Chrome or Firefox with JavaScript enabled.',
      qualityScore: 0.85,
      metaJson: { category: 'technical', tags: ['browser', 'compatibility'] },
    },
    {
      inputText: 'How do I contact support?',
      outputText:
        'You can reach our support team via email at support@example.com, through the in-app chat widget, or by submitting a ticket in your dashboard. We aim to respond within 2 hours during business hours.',
      qualityScore: 0.93,
      metaJson: { category: 'support', tags: ['contact', 'help'] },
    },
  ];

  for (const example of faqExamples) {
    await prisma.example.create({
      data: {
        ...example,
        sourceDatasetId: faqDataset.id,
      },
    });
  }
  console.log(`✅ Created ${faqExamples.length} FAQ examples\n`);

  // Create a sample export record
  console.log('Creating sample export...');
  const sampleExport = await prisma.datasetExport.create({
    data: {
      name: 'Combined Training Set v1',
      sourceIds: [chatDataset.id, faqDataset.id],
      format: 'openai_finetune',
      filePath: './exports/sample_export.jsonl',
    },
  });
  console.log(`✅ Created export: ${sampleExport.id}\n`);

  // Summary
  const totalDatasets = await prisma.sourceDataset.count();
  const totalExamples = await prisma.example.count();
  const totalExports = await prisma.datasetExport.count();

  console.log('📊 Seeding Summary:');
  console.log(`   Datasets: ${totalDatasets}`);
  console.log(`   Examples: ${totalExamples}`);
  console.log(`   Exports: ${totalExports}`);
  console.log('\n✅ Seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
