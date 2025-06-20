var searchTerm = null;

summaryInclude=60;
var fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  threshold: 0.0,
  tokenize:true,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: [
    {name:"title",weight:0.8},
    {name:"contents",weight:0.5},
    {name:"tags",weight:0.3},
    {name:"categories",weight:0.3}
  ]
};

u('#searchTerm').on('change keyup', function() { // Set the search value on keyup for the input
    searchTerm = this.value;
})

function showAlert(message){
    u('#alert').removeClass("is-hidden")
    u('#alert').html(message)
    setTimeout(function () {
        u('#alert').addClass("is-hidden")
    }, 3000)
}

u('#searchButton').handle('click', function(e) { //use handle to automatically prevent default
    if(searchTerm){
        u("#searchTerm").text(searchTerm);
        u('#searchButton').addClass("is-loading");
        executeSearch(searchTerm);
      }else {
        showAlert("Search cannot be empty!")
      }
})

function executeSearch(searchQuery){
    // Get the correct base URL for index.json
    const baseUrl = window.location.pathname.includes('/CookBook/') ? '/CookBook' : '';
    fetch(`${baseUrl}/index.json`).then(r => r.json())
    .then(function(data) {    
        var pages = data;
        var fuse = new Fuse(pages, fuseOptions);
        var result = fuse.search(searchQuery);
        if(result.length > 0){
            u('#content').addClass("is-hidden"); //hiding our main content to display the results
            u('#searchResults').children(u('div')).empty(); // clean out any previous search results
            u('#searchButton').removeClass("is-loading") //change our button back
            u('#searchResults').removeClass("is-hidden") //show Result area
            populateResults(result);
        }else{
          showAlert("No results found!")
          u('#searchButton').removeClass("is-loading");
          u("#searchTerm").text("");
        }
    });
}

function populateResults(result){
    //Object.keys(result).forEach(function(key,value){
    Object.entries(result).forEach(entry => {
        const [key, value] = entry;
        var contents= value.item.contents;
        var snippet = "";
        var snippetHighlights=[];
        var tags =[];
        if( fuseOptions.tokenize ){
          snippetHighlights.push(searchTerm);
        }else{
          value.matches.forEach(function(matchKey,mvalue){
            
            if(mvalue.key == "tags" || mvalue.key == "categories" ){
              snippetHighlights.push(mvalue.value);
            }else if(mvalue.key == "contents"){
              start = mvalue.indices[0][0]-summaryInclude>0?mvalue.indices[0][0]-summaryInclude:0;
              end = mvalue.indices[0][1]+summaryInclude<contents.length?mvalue.indices[0][1]+summaryInclude:contents.length;
              snippet += contents.substring(start,end);
              snippetHighlights.push(mvalue.value.substring(mvalue.indices[0][0],mvalue.indices[0][1]-mvalue.indices[0][0]+1));
            }
          });
        }

        if(snippet.length<1){
            snippet += contents.substring(0,summaryInclude*2);
          }
          //pull template from hugo template definition
          var templateDefinition = u('#search-result-template').html();
          //replace values
          var output = render(templateDefinition,{key:key,title:value.item.title,link:value.item.permalink,tags:value.item.tags,categories:value.item.categories,snippet:snippet,image:value.item.imageLink});
          u('#searchResultsCol').append(output);
    })
}

  
  function param(name) {
      return decodeURIComponent((location.search.split(name + '=')[1] || '').split('&')[0]).replace(/\+/g, ' ');
  }
  
  function render(templateString, data) {
    var conditionalMatches,conditionalPattern,copy;
    conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
    //since loop below depends on re.lastInxdex, we use a copy to capture any manipulations whilst inside the loop
    copy = templateString;
    while ((conditionalMatches = conditionalPattern.exec(templateString)) !== null) {
      if(data[conditionalMatches[1]]){
        //valid key, remove conditionals, leave contents.
        copy = copy.replace(conditionalMatches[0],conditionalMatches[2]);
      }else{
        //not valid, remove entire section
        copy = copy.replace(conditionalMatches[0],'');
      }
    }
    templateString = copy;
    //now any conditionals removed we can do simple substitution
    var key, find, re;
    for (key in data) {
      find = '\\$\\{\\s*' + key + '\\s*\\}';
      re = new RegExp(find, 'g');
      templateString = templateString.replace(re, data[key]);
    }
    return templateString;
}

// Handle mobile dropdown toggles
u('.navbar-item.has-dropdown .navbar-link').on('click', function(e) {
    if (window.innerWidth < 1024) {
        e.preventDefault();
        const dropdown = u(this).closest('.has-dropdown');
        dropdown.toggleClass('is-active');
        
        // Close other dropdowns
        u('.navbar-item.has-dropdown').not(dropdown.nodes).removeClass('is-active');
    }
});

// Handle nested mobile dropdowns  
u('.nested-dropdown .navbar-link-nested').on('click', function(e) {
    if (window.innerWidth < 1024) {
        e.preventDefault();
        const nestedDropdown = u(this).closest('.nested-dropdown');
        nestedDropdown.toggleClass('is-active');
        
        // Close other nested dropdowns
        u('.nested-dropdown').not(nestedDropdown.nodes).removeClass('is-active');
    }
});

// ===== NAVBAR BURGER TOGGLE =====

// Toggle mobile menu when burger is clicked
u('.navbar-burger').on('click', function() {
    const burgerButton = u(this);
    const navbarMenu = u('#navBarMenu');
    
    // Toggle is-active class on both burger and menu
    burgerButton.toggleClass('is-active');
    navbarMenu.toggleClass('is-active');
    
    // Update aria-expanded attribute for accessibility
    const isExpanded = burgerButton.hasClass('is-active');
    burgerButton.attr('aria-expanded', isExpanded.toString());
});

// Close mobile menu when clicking on menu items (except dropdowns)
u('.navbar-item:not(.has-dropdown)').on('click', function() {
    if (window.innerWidth < 1024) {
        u('#navBarMenu').removeClass('is-active');
        u('.navbar-burger').removeClass('is-active');
        u('.navbar-burger').attr('aria-expanded', 'false');
    }
});

// Close mobile menu when clicking outside
u(document).on('click', function(e) {
    const target = u(e.target);
    const navbar = target.closest('.navbar');
    const navbarMenu = u('#navBarMenu');
    
    if (!navbar.length && navbarMenu.hasClass('is-active')) {
        navbarMenu.removeClass('is-active');
        u('.navbar-burger').removeClass('is-active');
        u('.navbar-burger').attr('aria-expanded', 'false');
    }
});

// ===== STICKY NAVBAR ENHANCEMENTS =====

// Enhanced navbar scrolling behavior
let lastScrollY = window.scrollY;
let ticking = false;

function updateNavbar() {
    const navbar = document.querySelector('.sticky-navbar');
    const currentScrollY = window.scrollY;
    
    if (!navbar) return;
    
    // Add/remove shadow based on scroll position
    if (currentScrollY > 10) {
        navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        navbar.style.backgroundColor = 'rgba(0, 209, 178, 0.95)'; // Semi-transparent primary color
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        navbar.style.backgroundColor = '#00d1b2'; // Solid primary color
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateNavbar);
        ticking = true;
    }
}

// Add scroll event listener for navbar effects
window.addEventListener('scroll', requestTick);

// Enhanced mobile menu behavior for sticky navbar
u(document).on('DOMContentLoaded', function() {
    // Close mobile menu when clicking on a link (except nested dropdowns)
    u('.navbar-item:not(.has-dropdown)').on('click', function() {
        if (window.innerWidth < 1024) {
            u('#navBarMenu').removeClass('is-active');
        }
    });
    
    // Close mobile menu when clicking outside
    u(document).on('click', function(e) {
        const target = u(e.target);
        const navbar = target.closest('.navbar');
        const navbarMenu = u('#navBarMenu');
          if (!navbar.length && navbarMenu.hasClass('is-active')) {
            navbarMenu.removeClass('is-active');
        }
    });    // Prevent mobile menu from closing when clicking inside it
    u('#navBarMenu').on('click', function(e) {
        e.stopPropagation();
    });
});

// Enhanced search functionality for sticky navbar
u('#searchTerm').on('keypress', function(e) {
    if (e.keyCode === 13) { // Enter key
        e.preventDefault();
        u('#searchButton').trigger('click');
    }
});

// Add focus/blur effects for search input
u('#searchTerm').on('focus', function() {
    u(this).parent().addClass('is-focused');
});

u('#searchTerm').on('blur', function() {
    u(this).parent().removeClass('is-focused');
});

// Smooth scroll to top functionality (optional enhancement)
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add keyboard navigation support
u(document).on('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.keyCode === 27) {
        u('#navBarMenu').removeClass('is-active');
        u('.nested-dropdown').removeClass('is-active');
        u('.nested-dropdown-content').removeClass('is-active');
    }
    
    // Alt + S focuses search input
    if (e.altKey && e.keyCode === 83) {
        e.preventDefault();
        u('#searchTerm').first().focus();
    }
});

// Accessibility improvements
u('.navbar-burger').on('keydown', function(e) {
    if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
        e.preventDefault();
        u(this).trigger('click');
    }
});

// Initialize navbar on page load
u(document).on('DOMContentLoaded', function() {
    updateNavbar();
});

// ===== DEBUG LOGGING FOR DROPDOWN ISSUES =====

u(document).on('DOMContentLoaded', function() {
    console.log('Dropdown debugging initialized');
    
    // Log all dropdown elements found
    const mainDropdowns = u('.navbar-item.has-dropdown');
    console.log('Found main dropdowns:', mainDropdowns.length);
    
    const nestedDropdowns = u('.nested-dropdown');
    console.log('Found nested dropdowns:', nestedDropdowns.length);
    
    const nestedContents = u('.nested-dropdown-content');
    console.log('Found nested dropdown contents:', nestedContents.length);
    
    // Log when hovering over Śniadania specifically    // Clean hover handlers for nested dropdowns
    u('.navbar-dropdown .nested-dropdown').on('mouseenter', function() {
        // Nested dropdown hover is handled by CSS
    });
});

// ===== NESTED DROPDOWN HOVER FIX =====

// Ensure nested dropdowns work on hover/focus
u(document).on('DOMContentLoaded', function() {
    // Handle nested dropdown hover
    u('.nested-dropdown').on('mouseenter', function() {
        const nestedContent = u(this).find('.nested-dropdown-content');
        nestedContent.addClass('is-active');
        nestedContent.first().style.display = 'block';
        nestedContent.first().style.opacity = '1';
        nestedContent.first().style.transform = 'translateX(0)';
    });
    
    u('.nested-dropdown').on('mouseleave', function() {
        const nestedContent = u(this).find('.nested-dropdown-content');
        nestedContent.removeClass('is-active');
        nestedContent.first().style.display = 'none';
        nestedContent.first().style.opacity = '0';
        nestedContent.first().style.transform = 'translateX(-10px)';
    });
    
    // Also handle click for touch devices
    u('.nested-dropdown .navbar-link-nested').on('click', function(e) {
        e.preventDefault();
        const nestedDropdown = u(this).closest('.nested-dropdown');
        const nestedContent = nestedDropdown.find('.nested-dropdown-content');
        
        // Toggle the nested dropdown
        if (nestedContent.hasClass('is-active')) {
            nestedContent.removeClass('is-active');
            nestedContent.first().style.display = 'none';
        } else {
            // Close other nested dropdowns
            u('.nested-dropdown-content').removeClass('is-active');
            u('.nested-dropdown-content').each(function(el) {
                el.style.display = 'none';
            });
            
            // Open this one
            nestedContent.addClass('is-active');
            nestedContent.first().style.display = 'block';
            nestedContent.first().style.opacity = '1';
            nestedContent.first().style.transform = 'translateX(0)';
        }
    });
});