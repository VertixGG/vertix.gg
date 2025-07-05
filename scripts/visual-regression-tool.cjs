#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class VisualRegressionTool {
    constructor() {
        this.browser = null;
        this.context = null;
    }

    async initialize() {
        this.browser = await chromium.launch({
            headless: false, // Set to true for CI/CD
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.context = await this.browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
    }

    async compareUrls(productionUrl, developmentUrl, options = {}) {
        if (!this.browser) {
            await this.initialize();
        }

        const {
            outputDir = './visual-regression-output',
            waitTime = 2000,
            fullPage = false,
            elementSelector = null
        } = options;

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const results = {
            timestamp,
            productionUrl,
            developmentUrl,
            screenshots: {},
            analysis: {},
            differences: []
        };

        try {
            // Take screenshots of both sites
            console.log('📸 Taking screenshots...');

            // Production screenshot
            const prodPage = await this.context.newPage();
            await prodPage.goto(productionUrl);
            await prodPage.waitForTimeout(waitTime);

            const prodScreenshot = path.join(outputDir, `production-${timestamp}.png`);
            if (elementSelector) {
                await prodPage.locator(elementSelector).screenshot({ path: prodScreenshot });
            } else {
                await prodPage.screenshot({ path: prodScreenshot, fullPage });
            }
            results.screenshots.production = prodScreenshot;

            // Development screenshot
            const devPage = await this.context.newPage();
            await devPage.goto(developmentUrl);
            await devPage.waitForTimeout(waitTime);

            const devScreenshot = path.join(outputDir, `development-${timestamp}.png`);
            if (elementSelector) {
                await devPage.locator(elementSelector).screenshot({ path: devScreenshot });
            } else {
                await devPage.screenshot({ path: devScreenshot, fullPage });
            }
            results.screenshots.development = devScreenshot;

            // Extract detailed styling information
            console.log('🔍 Extracting styling information...');

            const styleExtractionScript = `
                (() => {
                    function getElementStyles(element) {
                        const computed = window.getComputedStyle(element);
                        const rect = element.getBoundingClientRect();

                        return {
                            tagName: element.tagName,
                            classes: element.className,
                            id: element.id,
                            dimensions: {
                                width: Math.round(rect.width * 100) / 100,
                                height: Math.round(rect.height * 100) / 100,
                                top: Math.round(rect.top * 100) / 100,
                                left: Math.round(rect.left * 100) / 100
                            },
                            styles: {
                                position: computed.position,
                                display: computed.display,
                                flexDirection: computed.flexDirection,
                                justifyContent: computed.justifyContent,
                                alignItems: computed.alignItems,
                                padding: computed.padding,
                                margin: computed.margin,
                                backgroundColor: computed.backgroundColor,
                                color: computed.color,
                                fontSize: computed.fontSize,
                                fontFamily: computed.fontFamily,
                                fontWeight: computed.fontWeight,
                                lineHeight: computed.lineHeight,
                                border: computed.border,
                                borderRadius: computed.borderRadius,
                                boxShadow: computed.boxShadow,
                                zIndex: computed.zIndex,
                                opacity: computed.opacity,
                                transform: computed.transform,
                                transition: computed.transition
                            }
                        };
                    }

                    const selectors = [
                        'nav',
                        '.vertix-navbar, .navbar',
                        '.vertix-navbar-brand, .navbar-brand',
                        '.vertix-nav-item, .nav-item',
                        '.vertix-nav-link, .nav-link',
                        '.vertix-btn, .btn',
                        '.vertix-dropdown-menu, .dropdown-menu',
                        '#vertix-logo',
                        '#vertix-brand-logo',
                        '#add-to-server',
                        '#support'
                    ];

                    const results = {};

                    selectors.forEach(selector => {
                        const elements = document.querySelectorAll(selector);
                        if (elements.length > 0) {
                            results[selector] = Array.from(elements).map(getElementStyles);
                        }
                    });

                    return results;
                })()
            `;

            results.analysis.production = await prodPage.evaluate(styleExtractionScript);
            results.analysis.development = await devPage.evaluate(styleExtractionScript);

            // Close pages
            await prodPage.close();
            await devPage.close();

            // Compare styling differences
            console.log('⚖️ Analyzing differences...');
            results.differences = this.analyzeDifferences(
                results.analysis.production,
                results.analysis.development
            );

            // Save detailed report
            const reportPath = path.join(outputDir, `report-${timestamp}.json`);
            fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

            console.log(`📋 Report saved: ${reportPath}`);

            // Generate human-readable summary
            this.generateSummaryReport(results, outputDir, timestamp);

            return results;

        } catch (error) {
            console.error('❌ Error during comparison:', error);
            throw error;
        }
    }

    analyzeDifferences(prodStyles, devStyles) {
        const differences = [];

        // Compare each selector
        Object.keys(prodStyles).forEach(selector => {
            if (!devStyles[selector]) {
                differences.push({
                    type: 'MISSING_ELEMENT',
                    selector,
                    message: `Element "${selector}" exists in production but not in development`
                });
                return;
            }

            const prodElements = prodStyles[selector];
            const devElements = devStyles[selector];

            if (prodElements.length !== devElements.length) {
                differences.push({
                    type: 'ELEMENT_COUNT_MISMATCH',
                    selector,
                    production: prodElements.length,
                    development: devElements.length,
                    message: `Different number of "${selector}" elements`
                });
            }

            // Compare each element
            prodElements.forEach((prodEl, index) => {
                const devEl = devElements[index];
                if (!devEl) return;

                // Compare dimensions
                Object.keys(prodEl.dimensions).forEach(prop => {
                    const prodVal = prodEl.dimensions[prop];
                    const devVal = devEl.dimensions[prop];
                    const diff = Math.abs(prodVal - devVal);

                    if (diff > 2) { // Allow 2px tolerance
                        differences.push({
                            type: 'DIMENSION_DIFFERENCE',
                            selector,
                            element: index,
                            property: prop,
                            production: prodVal,
                            development: devVal,
                            difference: diff,
                            message: `${selector}[${index}].${prop}: ${prodVal}px vs ${devVal}px (diff: ${diff}px)`
                        });
                    }
                });

                // Compare key styles
                const keyStyles = [
                    'backgroundColor', 'color', 'fontSize', 'fontWeight',
                    'padding', 'margin', 'border', 'borderRadius',
                    'boxShadow', 'position', 'display'
                ];

                keyStyles.forEach(styleProp => {
                    const prodVal = prodEl.styles[styleProp];
                    const devVal = devEl.styles[styleProp];

                    if (prodVal !== devVal) {
                        differences.push({
                            type: 'STYLE_DIFFERENCE',
                            selector,
                            element: index,
                            property: styleProp,
                            production: prodVal,
                            development: devVal,
                            message: `${selector}[${index}].${styleProp}: "${prodVal}" vs "${devVal}"`
                        });
                    }
                });
            });
        });

        return differences;
    }

    generateSummaryReport(results, outputDir, timestamp) {
        const summaryPath = path.join(outputDir, `summary-${timestamp}.md`);

        let summary = `# Visual Regression Report\n\n`;
        summary += `**Generated:** ${new Date().toISOString()}\n\n`;
        summary += `**Production URL:** ${results.productionUrl}\n`;
        summary += `**Development URL:** ${results.developmentUrl}\n\n`;

        summary += `## Screenshots\n\n`;
        summary += `- Production: ![Production](${path.basename(results.screenshots.production)})\n`;
        summary += `- Development: ![Development](${path.basename(results.screenshots.development)})\n\n`;

        summary += `## Analysis Summary\n\n`;
        summary += `**Total Differences Found:** ${results.differences.length}\n\n`;

        if (results.differences.length === 0) {
            summary += `✅ **NO DIFFERENCES DETECTED** - Perfect match!\n\n`;
        } else {
            const diffTypes = {};
            results.differences.forEach(diff => {
                diffTypes[diff.type] = (diffTypes[diff.type] || 0) + 1;
            });

            summary += `### Difference Types:\n`;
            Object.entries(diffTypes).forEach(([type, count]) => {
                summary += `- **${type}**: ${count} issues\n`;
            });
            summary += `\n`;

            summary += `### Detailed Differences:\n\n`;
            results.differences.forEach((diff, index) => {
                summary += `${index + 1}. **${diff.type}** - ${diff.message}\n`;
            });
        }

        fs.writeFileSync(summaryPath, summary);
        console.log(`📄 Summary report saved: ${summaryPath}`);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log(`
🎯 Visual Regression Testing Tool

Usage: node visual-regression-tool.js <production-url> <development-url> [options]

Options:
  --output-dir <dir>     Output directory (default: ./visual-regression-output)
  --wait-time <ms>       Wait time after page load (default: 2000)
  --full-page           Take full page screenshots
  --element <selector>   Screenshot specific element only
  --help                Show this help

Examples:
  node visual-regression-tool.js https://vertix.gg http://localhost:3000
  node visual-regression-tool.js https://vertix.gg http://localhost:3000 --element "nav"
  node visual-regression-tool.js https://vertix.gg http://localhost:3000 --output-dir ./reports
        `);
        process.exit(1);
    }

    const productionUrl = args[0];
    const developmentUrl = args[1];

    const options = {};
    for (let i = 2; i < args.length; i++) {
        switch (args[i]) {
            case '--output-dir':
                options.outputDir = args[++i];
                break;
            case '--wait-time':
                options.waitTime = parseInt(args[++i]);
                break;
            case '--full-page':
                options.fullPage = true;
                break;
            case '--element':
                options.elementSelector = args[++i];
                break;
        }
    }

    const tool = new VisualRegressionTool();

    try {
        console.log('🚀 Starting visual regression testing...');
        console.log(`📍 Production: ${productionUrl}`);
        console.log(`🔧 Development: ${developmentUrl}`);

        const results = await tool.compareUrls(productionUrl, developmentUrl, options);

        if (results.differences.length === 0) {
            console.log('✅ SUCCESS: No visual differences detected!');
        } else {
            console.log(`⚠️  WARNING: ${results.differences.length} differences found`);
            console.log('📋 Check the generated reports for details');
        }

    } catch (error) {
        console.error('❌ FAILED:', error.message);
        process.exit(1);
    } finally {
        await tool.close();
    }
}

// Export for use as module
module.exports = VisualRegressionTool;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
