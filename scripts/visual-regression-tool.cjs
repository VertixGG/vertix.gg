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
            headless: true,
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
            elementSelector = null,
            level = Infinity
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
            // Add cache-busting query param
            const devUrlWithCacheBust = `${developmentUrl}?t=${Date.now()}`;

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
            await devPage.goto(devUrlWithCacheBust, { waitUntil: 'networkidle' });
            await devPage.reload({ waitUntil: 'networkidle' }); // Force a hard reload
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

            // New: DOM traversal for full page or subtree extraction
            const styleExtractionScript = (elementSelector, level) => `
                (() => {
                    const maxLevel = ${level};
                    function getElementStyles(element, currentLevel) {
                        if (currentLevel > maxLevel) return null;
                        const computed = window.getComputedStyle(element);
                        const rect = element.getBoundingClientRect();
                        const children = Array.from(element.children).map(child => getElementStyles(child, currentLevel + 1)).filter(Boolean);

                        // Extract all data-* attributes
                        const dataAttrs = {};
                        for (const attr of element.attributes) {
                            if (attr.name.startsWith('data-')) {
                                dataAttrs[attr.name] = attr.value;
                            }
                        }

                        // Extract ARIA/accessibility attributes
                        const ariaAttrs = {};
                        ['aria-label', 'aria-hidden', 'role', 'tabindex'].forEach(attr => {
                            if (element.hasAttribute(attr)) {
                                ariaAttrs[attr] = element.getAttribute(attr);
                            }
                        });

                        // Extract state for form elements
                        let state = {};
                        if (element instanceof HTMLInputElement || element instanceof HTMLButtonElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
                            state = {
                                checked: element.checked !== undefined ? element.checked : undefined,
                                disabled: element.disabled !== undefined ? element.disabled : undefined,
                                readonly: element.readOnly !== undefined ? element.readOnly : undefined,
                                required: element.required !== undefined ? element.required : undefined,
                                value: element.value !== undefined ? element.value : undefined
                            };
                        }

                        // Extract href for <a> and src/alt for <img>
                        let link = {};
                        if (element instanceof HTMLAnchorElement) {
                            link.href = element.href;
                        }
                        if (element instanceof HTMLImageElement) {
                            link.src = element.src;
                            link.alt = element.alt;
                        }

                        return {
                            tagName: element.tagName,
                            classes: element.className,
                            id: element.id,
                            dimensions: {
                                width: Math.round(rect.width * 100) / 100,
                                height: Math.round(rect.height * 100) / 100,
                                top: Math.round(rect.top * 100) / 100,
                                left: Math.round(rect.left * 100) / 100,
                                right: Math.round(rect.right * 100) / 100,
                                bottom: Math.round(rect.bottom * 100) / 100
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
                                transition: computed.transition,
                                minWidth: computed.minWidth,
                                maxWidth: computed.maxWidth,
                                minHeight: computed.minHeight,
                                maxHeight: computed.maxHeight,
                                overflow: computed.overflow,
                                overflowX: computed.overflowX,
                                overflowY: computed.overflowY,
                                visibility: computed.visibility,
                                verticalAlign: computed.verticalAlign,
                                float: computed.cssFloat,
                                clear: computed.clear,
                                textAlign: computed.textAlign,
                                textDecoration: computed.textDecoration,
                                letterSpacing: computed.letterSpacing,
                                wordSpacing: computed.wordSpacing,
                                textTransform: computed.textTransform,
                                whiteSpace: computed.whiteSpace,
                                direction: computed.direction,
                                cursor: computed.cursor,
                                pointerEvents: computed.pointerEvents,
                                userSelect: computed.userSelect
                            },
                            dataAttrs,
                            ariaAttrs,
                            state,
                            link,
                            children
                        };
                    }
                    let root;
                    if ('${elementSelector}') {
                        root = document.querySelector('${elementSelector}');
                    } else {
                        root = document.body;
                    }
                    if (!root) return null;
                    return getElementStyles(root, 0);
                })()
            `;

            // Use the new extraction logic for both prod and dev
            results.analysis.production = await prodPage.evaluate(styleExtractionScript(elementSelector || '', level));
            results.analysis.development = await devPage.evaluate(styleExtractionScript(elementSelector || '', level));

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

    // Update analyzeDifferences to compare DOM trees recursively
    analyzeDifferences(prodStyles, devStyles) {
        return this.compareElements(prodStyles, devStyles, '');
    }

    // Replace analyzeDifferences with recursive comparison
    compareElements(prodEl, devEl, path = '') {
        const differences = [];
        if (!prodEl && devEl) {
            differences.push({
                type: 'MISSING_ELEMENT',
                path,
                message: `Element exists in development but not in production at ${path}`
            });
            return differences;
        }
        if (prodEl && !devEl) {
            differences.push({
                type: 'MISSING_ELEMENT',
                path,
                message: `Element exists in production but not in development at ${path}`
            });
            return differences;
        }
        // Compare tagName, id, classes
        if (prodEl.tagName !== devEl.tagName) {
            differences.push({
                type: 'TAGNAME_DIFFERENCE',
                path,
                production: prodEl.tagName,
                development: devEl.tagName,
                message: `Tag name mismatch at ${path}: ${prodEl.tagName} vs ${devEl.tagName}`
            });
        }
        if (prodEl.id !== devEl.id) {
            differences.push({
                type: 'ID_DIFFERENCE',
                path,
                production: prodEl.id,
                development: devEl.id,
                message: `ID mismatch at ${path}: ${prodEl.id} vs ${devEl.id}`
            });
        }
        if (prodEl.classes !== devEl.classes) {
            differences.push({
                type: 'CLASS_DIFFERENCE',
                path,
                production: prodEl.classes,
                development: devEl.classes,
                message: `Class mismatch at ${path}: ${prodEl.classes} vs ${devEl.classes}`
            });
        }
        // Compare dimensions
        Object.keys(prodEl.dimensions).forEach(prop => {
            const prodVal = prodEl.dimensions[prop];
            const devVal = devEl.dimensions[prop];
            const diff = Math.abs(prodVal - devVal);
            if (diff > 2) {
                differences.push({
                    type: 'DIMENSION_DIFFERENCE',
                    path,
                    property: prop,
                    production: prodVal,
                    development: devVal,
                    difference: diff,
                    message: `${path}.${prop}: ${prodVal}px vs ${devVal}px (diff: ${diff}px)`
                });
            }
        });
        // Compare key styles, ignoring !important
        const keyStyles = [
            'backgroundColor', 'color', 'fontSize', 'fontWeight',
            'padding', 'margin', 'border', 'borderRadius',
            'boxShadow', 'position', 'display'
        ];
        function stripImportant(val) {
            if (typeof val === 'string') return val.replace(/\s*!important\s*/g, '').trim();
            return val;
        }
        keyStyles.forEach(styleProp => {
            const prodVal = stripImportant(prodEl.styles[styleProp]);
            const devVal = stripImportant(devEl.styles[styleProp]);
            if (prodVal !== devVal) {
                differences.push({
                    type: 'STYLE_DIFFERENCE',
                    path: path || 'root',
                    property: styleProp,
                    production: prodVal,
                    development: devVal,
                    message: `${path || 'root'}.${styleProp}: "${prodVal}" vs "${devVal}"`
                });
            }
        });
        // Compare children recursively
        const prodChildren = prodEl.children || [];
        const devChildren = devEl.children || [];
        const maxLen = Math.max(prodChildren.length, devChildren.length);
        for (let i = 0; i < maxLen; i++) {
            differences.push(...this.compareElements(
                prodChildren[i],
                devChildren[i],
                `${path}/${prodEl.tagName}[${i}]`
            ));
        }
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
            // Group and sort differences by type and impact
            const diffTypes = {};
            results.differences.forEach(diff => {
                diffTypes[diff.type] = (diffTypes[diff.type] || 0) + 1;
            });

            summary += `### Difference Types:\n`;
            Object.entries(diffTypes).forEach(([type, count]) => {
                summary += `- **${type}**: ${count} issues\n`;
            });
            summary += `\n`;

            // High-priority fixes
            const highPriorityFixes = results.differences.filter(diff => {
                const impactfulProps = ['display', 'position', 'backgroundColor', 'color', 'fontSize', 'fontWeight'];
                return impactfulProps.includes(diff.property) || diff.difference > 20;
            }).slice(0, 10);

            summary += `### High-Priority Fixes:\n\n`;
            highPriorityFixes.forEach((diff, index) => {
                summary += `${index + 1}. **${diff.type}** at ${diff.path || 'root'} - ${diff.property || 'dimension'}: "${diff.production}" vs "${diff.development}"\n`;
            });
            summary += `\n`;

            // Fix Plan by Selector
            const selectorMap = {};
            results.differences.forEach(diff => {
                const selector = (diff.path || '').split('[')[0] || 'root';
                if (!selectorMap[selector]) selectorMap[selector] = [];
                selectorMap[selector].push(diff);
            });

            summary += `### Fix Plan by Selector:\n\n`;
            Object.entries(selectorMap).forEach(([selector, diffs]) => {
                summary += `#### ${selector}\n`;
                const propMap = {};
                diffs.forEach(diff => {
                    if (diff.property) propMap[diff.property] = diff;
                });
                Object.values(propMap).forEach(diff => {
                    summary += `- **${diff.property}**: "${diff.production}" vs "${diff.development}"\n`;
                    let suggestion = '';
                    if (diff.property === 'color') suggestion = 'Try `text-neutral-200` or `text-white`.';
                    if (diff.property === 'fontSize') suggestion = 'Try `text-2xl`, `text-3xl`, `text-[30px]`, or `text-lg`.';
                    if (diff.property === 'fontWeight') suggestion = 'Try `font-bold`, `font-extrabold`, `font-[800]`, or `font-normal`.';
                    if (diff.property === 'padding') suggestion = 'Adjust with `px-`, `py-`, `pt-`, `pb-`, etc.';
                    if (diff.property === 'margin') suggestion = 'Adjust with `mx-`, `my-`, `mt-`, `mb-`, etc.';
                    if (diff.property === 'border') suggestion = 'Try `border-none` or `border`.';
                    if (diff.property === 'borderRadius') suggestion = 'Try `rounded`, `rounded-lg`, etc.';
                    if (diff.property === 'boxShadow') suggestion = 'Try `shadow-none` or `shadow`.';
                    if (diff.property === 'display') suggestion = 'Try `flex`, `inline-block`, or `block`.';
                    if (diff.property === 'backgroundColor') suggestion = 'Try `bg-[rgba(0,0,0,0.41)]` or `bg-transparent`.';
                    if (suggestion) summary += `   - 💡 **Suggestion:** ${suggestion}\n`;
                });
                summary += `\n`;
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
  --level <depth>        DOM traversal depth (default: Infinity)
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
            case '--level':
                options.level = parseInt(args[++i], 10);
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
