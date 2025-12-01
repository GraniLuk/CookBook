/**
 * Fuse.js v7.1.0 Testing
 * 
 * Tests search behavior after migration to v7.1.0
 * Validates improvements: diacritics support, fuzzy matching, location independence
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

// New v7.1.0 options (after migration)
const fuseOptions = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0.3,              // Changed: allow fuzzy matching
    // tokenize: removed (breaking change in v4)
    location: 0,
    distance: 100,
    // maxPatternLength: removed (breaking change in v4)
    minMatchCharLength: 1,
    ignoreLocation: true,        // New: search entire content
    ignoreDiacritics: true,      // New: Polish diacritics support
    keys: [
        { name: "title", weight: 0.8 },
        { name: "contents", weight: 0.5 },
        { name: "tags", weight: 0.3 },
        { name: "categories", weight: 0.3 }
    ]
};

const fuse = new Fuse(searchIndex, fuseOptions);

// Test scenarios - same as baseline but with updated expectations
const testScenarios = [
    {
        id: 'T1',
        category: 'Basic',
        query: 'pasta',
        expectedBehavior: 'Should find all pasta recipes',
        minResults: 1,
        shouldPass: true
    },
    {
        id: 'T2',
        category: 'Multi-word',
        query: 'pasta twarogowa',
        expectedBehavior: 'More precise phrase match (no tokenize)',
        minResults: 1,
        shouldPass: true
    },
    {
        id: 'T3',
        category: 'Diacritics',
        query: 'losos',
        expectedBehavior: 'SHOULD FIND łosoś (ignoreDiacritics: true)',
        minResults: 1,
        shouldPass: true
    },
    {
        id: 'T4',
        category: 'Typo/Fuzzy',
        query: 'gronola',
        expectedBehavior: 'SHOULD FIND granola (threshold 0.3)',
        minResults: 1,
        shouldPass: true
    },
    {
        id: 'T6',
        category: 'Typo/Fuzzy',
        query: 'kurczk',
        expectedBehavior: 'SHOULD FIND kurczak (threshold 0.3)',
        minResults: 1,
        shouldPass: true
    },
    {
        id: 'T6',
        category: 'Tags',
        query: 'sniadanie',
        expectedBehavior: 'Should find breakfast recipes via tags',
        minResults: 1,
        shouldPass: true
    },
    {
        id: 'T7',
        category: 'Categories',
        query: 'desery',
        expectedBehavior: 'Should find dessert categories',
        minResults: 0, // May not have dessert category
        shouldPass: true
    },
    {
        id: 'T8',
        category: 'Long content',
        query: 'tahini',
        expectedBehavior: 'SHOULD FIND tahini anywhere in content (ignoreLocation: true)',
        minResults: 1,
        shouldPass: true
    },
    {
        id: 'T9',
        category: 'No results',
        query: 'xyz123',
        expectedBehavior: 'Should gracefully return no results',
        expectedNoResults: true,
        shouldPass: true
    }
];

// Run tests
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Fuse.js v7.1.0 TEST REPORT');
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
        status = passed ? '✅ PASS' : '❌ FAIL';
    }

    if (passed) passCount++;
    else failCount++;

    // Top results for context
    const topResults = searchResults.slice(0, 3).map(r => ({
        title: r.item.title,
        score: r.score ? r.score.toFixed(3) : 'N/A'
    }));

    const result = {
        testId: test.id,
        category: test.category,
        query: test.query,
        expectedBehavior: test.expectedBehavior,
        resultCount: resultCount,
        passed: passed,
        shouldPass: test.shouldPass,
        topResults: topResults
    };

    results.push(result);

    // Console output
    console.log(`${status} ${test.id} [${test.category}]: "${test.query}"`);
    console.log(`   Expected: ${test.expectedBehavior}`);
    console.log(`   Results: ${resultCount} found`);
    if (topResults.length > 0) {
        console.log(`   Top matches:`);
        topResults.slice(0, 2).forEach(r => {
            console.log(`      • ${r.title} (score: ${r.score})`);
        });
    }
    console.log('');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log(`  SUMMARY: ${passCount} passed, ${failCount} failed`);
console.log('═══════════════════════════════════════════════════════════════\n');

// Improvement analysis
console.log('📊 IMPROVEMENT ANALYSIS:\n');

// Compare with expected baseline failures
const expectedImprovements = ['T3', 'T4', 'T5', 'T8'];
const improvements = results.filter(r =>
    expectedImprovements.includes(r.testId) && r.passed
);

console.log(`✨ Fixed Tests: ${improvements.length}/${expectedImprovements.length}`);
improvements.forEach(r => {
    console.log(`   • ${r.testId}: ${r.query} - ${r.resultCount} results found`);
});

const regressions = results.filter(r => !r.passed && r.shouldPass);
if (regressions.length > 0) {
    console.log(`\n⚠️  REGRESSIONS: ${regressions.length} tests now failing`);
    regressions.forEach(r => {
        console.log(`   • ${r.testId}: ${r.query} - Expected to pass but failed`);
    });
} else {
    console.log('\n✅ No regressions detected');
}

console.log('\n💡 MIGRATION SUCCESS INDICATORS:');
console.log(`   ${improvements.find(r => r.testId === 'T3') ? '✅' : '❌'} Polish diacritics working (losos → łosoś)`);
console.log(`   ${improvements.find(r => r.testId === 'T4') ? '✅' : '❌'} Fuzzy matching working (gronola → granola)`);
console.log(`   ${improvements.find(r => r.testId === 'T8') ? '✅' : '❌'} Full content search working (tahini found)`);
console.log(`   ${regressions.length === 0 ? '✅' : '❌'} No regressions in existing functionality`);

// Save detailed report
const reportPath = path.join(__dirname, 'fusejs-test-report-v7.json');
const report = {
    version: '7.1.0',
    timestamp: new Date().toISOString(),
    fuseOptions: fuseOptions,
    totalRecipes: searchIndex.length,
    testResults: results,
    summary: {
        total: results.length,
        passed: passCount,
        failed: failCount
    },
    improvements: {
        expected: expectedImprovements.length,
        actual: improvements.length,
        details: improvements.map(r => ({ testId: r.testId, query: r.query }))
    }
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// Exit with status code
const criticalFailures = regressions.length;
process.exit(criticalFailures > 0 ? 1 : 0);
