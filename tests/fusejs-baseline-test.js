/**
 * Fuse.js v3.2.0 Baseline Testing
 * 
 * Tests current search behavior before migration to v7.1.0
 * Runs 10 test scenarios from the migration plan
 */

const fs = require('fs');
const path = require('path');
const Fuse = require('fuse.js');

// Load the Hugo-generated search index
const indexPath = path.join(__dirname, '../public/index.json');

if (!fs.existsSync(indexPath)) {
    console.error('❌ ERROR: index.json not found at:', indexPath);
    console.error('Please run "hugo" to build the site first.');
    process.exit(1);
}

const searchIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
console.log(`✅ Loaded ${searchIndex.length} recipes from index.json\n`);

// Current v3.2.0 options from custom.js
const fuseOptions = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.0,
    tokenize: true,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
        { name: "title", weight: 0.8 },
        { name: "contents", weight: 0.5 },
        { name: "tags", weight: 0.3 },
        { name: "categories", weight: 0.3 }
    ]
};

const fuse = new Fuse(searchIndex, fuseOptions);

// Test scenarios from migration plan
const testScenarios = [
    {
        id: 'T1',
        category: 'Basic',
        query: 'pasta',
        expectedBehavior: 'Should find all pasta recipes',
        minResults: 1
    },
    {
        id: 'T2',
        category: 'Multi-word',
        query: 'pasta twarogowa',
        expectedBehavior: 'Broad matches due to tokenize (finds pasta OR twarogowa)',
        minResults: 1
    },
    {
        id: 'T3',
        category: 'Diacritics',
        query: 'losos',
        expectedBehavior: 'NO RESULTS (cannot find łosoś)',
        expectedNoResults: true
    },
    {
        id: 'T4',
        category: 'Diacritics',
        query: 'cwikla',
        expectedBehavior: 'NO RESULTS (cannot find ćwikła)',
        expectedNoResults: true
    },
    {
        id: 'T5',
        category: 'Typo/Fuzzy',
        query: 'gronola',
        expectedBehavior: 'NO RESULTS (threshold 0.0 requires exact match)',
        expectedNoResults: true
    },
    {
        id: 'T6',
        category: 'Typo/Fuzzy',
        query: 'kurczk',
        expectedBehavior: 'NO RESULTS (threshold 0.0 requires exact match)',
        expectedNoResults: true
    },
    {
        id: 'T7',
        category: 'Tags',
        query: 'sniadanie',
        expectedBehavior: 'Should find breakfast recipes via tags',
        minResults: 1
    },
    {
        id: 'T8',
        category: 'Categories',
        query: 'desery',
        expectedBehavior: 'Should find dessert categories',
        minResults: 0 // May not have dessert category
    },
    {
        id: 'T9',
        category: 'Long content',
        query: 'tahini',
        expectedBehavior: 'May miss if tahini appears late in content (location: 0, distance: 100)',
        minResults: 0
    },
    {
        id: 'T10',
        category: 'No results',
        query: 'xyz123',
        expectedBehavior: 'Should gracefully return no results',
        expectedNoResults: true
    }
];

// Run tests
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Fuse.js v3.2.0 BASELINE TEST REPORT');
console.log('═══════════════════════════════════════════════════════════════\n');

const results = [];
let passCount = 0;
let failCount = 0;

testScenarios.forEach((test, index) => {
    const searchResults = fuse.search(test.query);
    const resultCount = searchResults.length;

    // Determine pass/fail
    let passed = false;
    let status = '';

    if (test.expectedNoResults) {
        passed = resultCount === 0;
        status = passed ? '✅ PASS' : '❌ FAIL';
    } else {
        passed = resultCount >= test.minResults;
        status = passed ? '✅ PASS' : '⚠️  PARTIAL';
    }

    if (passed) passCount++;
    else failCount++;

    // Top results for context
    const topResults = searchResults.slice(0, 3).map(r => r.item.title);

    const result = {
        testId: test.id,
        category: test.category,
        query: test.query,
        expectedBehavior: test.expectedBehavior,
        resultCount: resultCount,
        passed: passed,
        topResults: topResults
    };

    results.push(result);

    // Console output
    console.log(`${status} ${test.id} [${test.category}]: "${test.query}"`);
    console.log(`   Expected: ${test.expectedBehavior}`);
    console.log(`   Results: ${resultCount} found`);
    if (topResults.length > 0) {
        console.log(`   Top matches: ${topResults.slice(0, 2).join(', ')}${topResults.length > 2 ? '...' : ''}`);
    }
    console.log('');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log(`  SUMMARY: ${passCount} passed, ${failCount} failed`);
console.log('═══════════════════════════════════════════════════════════════\n');

// Key findings
console.log('📊 KEY FINDINGS:\n');

const diacriticsTests = results.filter(r => r.category === 'Diacritics');
const failedDiacritics = diacriticsTests.filter(r => !r.passed).length;
console.log(`1. Diacritics Support: ${failedDiacritics}/${diacriticsTests.length} failed (expected)`);
console.log('   → Polish characters (ł, ć, ę, etc.) cannot be found without diacritics');

const fuzzyTests = results.filter(r => r.category === 'Typo/Fuzzy');
const failedFuzzy = fuzzyTests.filter(r => !r.passed).length;
console.log(`\n2. Fuzzy Matching: ${failedFuzzy}/${fuzzyTests.length} failed (expected)`);
console.log('   → Typos not tolerated due to threshold: 0.0');

const basicTests = results.filter(r => r.category === 'Basic' || r.category === 'Multi-word');
const passedBasic = basicTests.filter(r => r.passed).length;
console.log(`\n3. Basic Search: ${passedBasic}/${basicTests.length} working`);
console.log('   → tokenize: true causes broad matches for multi-word queries');

console.log('\n💡 MIGRATION BENEFITS:');
console.log('   • v7.1.0 will add ignoreDiacritics: true (fixes T3, T4)');
console.log('   • Increasing threshold to 0.3 will enable fuzzy matching (fixes T5, T6)');
console.log('   • Removing tokenize will make multi-word searches more precise (changes T2)');
console.log('   • Adding ignoreLocation will search entire recipe content (improves T9)');

// Save detailed report
const reportPath = path.join(__dirname, 'fusejs-test-report-v3.json');
const report = {
    version: '3.2.0',
    timestamp: new Date().toISOString(),
    fuseOptions: fuseOptions,
    totalRecipes: searchIndex.length,
    testResults: results,
    summary: {
        total: results.length,
        passed: passCount,
        failed: failCount
    }
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// For CI: Exit with 0 (success) since failures are expected in v3.2.0 baseline
// The test validates current behavior, not correctness
console.log('\n✅ Baseline test completed successfully');
process.exit(0);
