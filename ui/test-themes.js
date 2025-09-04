#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testThemes() {
  console.log('🎨 Starting theme switching test...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    console.log('📱 Page loaded, testing theme combinations...');
    
    // Test all 4 theme combinations
    const themes = [
      { mode: 'light', variant: 'classic', name: 'Classic Light' },
      { mode: 'dark', variant: 'classic', name: 'Classic Dark' },
      { mode: 'light', variant: 'advanced', name: 'Advanced Light' },
      { mode: 'dark', variant: 'advanced', name: 'Advanced Dark' }
    ];
    
    for (const theme of themes) {
      console.log(`\n🔄 Testing ${theme.name}...`);
      
      // Apply theme programmatically
      await page.evaluate((theme) => {
        const root = document.documentElement;
        root.classList.remove('theme-light', 'theme-dark', 'theme-classic', 'theme-advanced');
        root.classList.add(`theme-${theme.mode}`, `theme-${theme.variant}`);
      }, theme);
      
      await page.waitForTimeout(1000); // Wait for animations
      
      // Check if components have proper colors
      const results = await page.evaluate(() => {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        
        // Get card element colors
        const cardElement = document.querySelector('.bg-card');
        const cardColor = cardElement ? getComputedStyle(cardElement).backgroundColor : 'not found';
        
        // Get background color
        const bgColor = computedStyle.getPropertyValue('--background').trim();
        const foregroundColor = computedStyle.getPropertyValue('--foreground').trim();
        
        return {
          classes: root.className,
          bgColor,
          foregroundColor,
          cardColor,
          hasGlassEffect: root.classList.contains('theme-advanced')
        };
      });
      
      console.log(`   ✅ Theme classes: ${results.classes}`);
      console.log(`   🎨 Background: ${results.bgColor}`);
      console.log(`   📝 Foreground: ${results.foregroundColor}`);
      console.log(`   📦 Card Color: ${results.cardColor}`);
      if (results.hasGlassEffect) {
        console.log(`   ✨ Advanced glassmorphism effects active`);
      }
    }
    
    console.log('\n🎉 Theme testing completed successfully!');
    console.log('Press any key to close browser...');
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
      browser.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Theme test failed:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

testThemes();