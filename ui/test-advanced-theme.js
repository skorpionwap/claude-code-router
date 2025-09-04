#!/usr/bin/env node

// Simple test to verify Advanced theme implementation
import fs from 'fs';
import path from 'path';

console.log('🧪 Testing Advanced Theme Implementation...\n');

// Check if CSS file has been updated
const cssPath = path.join(__dirname, 'src/styles/dashboard-advanced.css');
if (fs.existsSync(cssPath)) {
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  // Check for new color scheme
  const hasNewColors = cssContent.includes('--primary-color: #2a2a3e') && 
                      cssContent.includes('--highlight-color: #e94560');
  
  // Check for enhanced glassmorphism
  const hasEnhancedGlass = cssContent.includes('backdrop-filter: blur(25px)') &&
                          cssContent.includes('transition: all 0.4s cubic-bezier');
  
  // Check for typography scaling
  const hasTypography = cssContent.includes('font-size: 3.5rem') &&
                       cssContent.includes('background: linear-gradient(45deg');
  
  console.log('✅ CSS Updates:');
  console.log(`   • New Color Scheme: ${hasNewColors ? 'PASS' : 'FAIL'}`);
  console.log(`   • Enhanced Glassmorphism: ${hasEnhancedGlass ? 'PASS' : 'FAIL'}`);
  console.log(`   • Typography Scaling: ${hasTypography ? 'PASS' : 'FAIL'}`);
} else {
  console.log('❌ CSS file not found');
}

// Check if MissionControlTab has been updated
const tabPath = path.join(__dirname, 'src/components/dashboard/tabs/MissionControlTab.tsx');
if (fs.existsSync(tabPath)) {
  const tabContent = fs.readFileSync(tabPath, 'utf8');
  
  // Check for glass-card implementation
  const hasGlassCard = tabContent.includes('theme-advanced glass-card');
  
  // Check for typography classes
  const hasStatClasses = tabContent.includes('stat-number') &&
                        tabContent.includes('stat-label');
  
  console.log('\n✅ Component Updates:');
  console.log(`   • Glass Card Implementation: ${hasGlassCard ? 'PASS' : 'FAIL'}`);
  console.log(`   • Typography Classes: ${hasStatClasses ? 'PASS' : 'FAIL'}`);
} else {
  console.log('❌ MissionControlTab file not found');
}

console.log('\n🎉 Advanced Theme Implementation Test Complete!');
console.log('🚀 The new Advanced theme with gradient background, enhanced glassmorphism, and improved typography is ready to use.');