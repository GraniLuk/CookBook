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
        const currentDropdown = dropdown.first();
        dropdown.toggleClass('is-active');
        
        // Close other dropdowns
        u('.navbar-item.has-dropdown').each(function(item) {
            if (item !== currentDropdown) {
                u(item).removeClass('is-active');
            }
        });
    }
});

// Handle nested mobile dropdowns  
u('.nested-dropdown .navbar-link-nested').on('click', function(e) {
    if (window.innerWidth < 1024) {
        e.preventDefault();
        const nestedDropdown = u(this).closest('.nested-dropdown');
        const currentNestedDropdown = nestedDropdown.first();
        nestedDropdown.toggleClass('is-active');
        
        // Close other nested dropdowns
        u('.nested-dropdown').each(function(item) {
            if (item !== currentNestedDropdown) {
                u(item).removeClass('is-active');
            }
        });
    }
});

// ===== NAVBAR BURGER TOGGLE =====

// Track menu state with our own variable instead of relying on CSS classes
let mobileMenuOpen = false;

// Helper function to close mobile menu
function closeMobileMenu() {
    const navbarMenu = u('#navBarMenu');
    const burgerButton = u('.navbar-burger');
    
    mobileMenuOpen = false;
    navbarMenu.removeClass('is-active');
    burgerButton.removeClass('is-active');
    burgerButton.attr('aria-expanded', 'false');
    
    // Hide menu via JavaScript
    if (navbarMenu.length > 0) {
        navbarMenu.first().style.display = 'none';
    }
}

// Helper function to open mobile menu
function openMobileMenu() {
    const navbarMenu = u('#navBarMenu');
    const burgerButton = u('.navbar-burger');
    
    mobileMenuOpen = true;
    navbarMenu.addClass('is-active');
    burgerButton.addClass('is-active');
    burgerButton.attr('aria-expanded', 'true');
    
    // Show menu - force styles via JavaScript
    if (navbarMenu.length > 0) {
        const menuElement = navbarMenu.first();
        menuElement.style.cssText = `
            display: block !important;
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            background-color: white !important;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
            z-index: 9999 !important;
            max-height: 70vh !important;
            overflow-y: auto !important;
            border-radius: 0 0 6px 6px !important;
            opacity: 1 !important;
            visibility: visible !important;
        `;
    }
}

// Initialize burger menu functionality when document is ready
u(document).on('DOMContentLoaded', function() {
    // Initialize navbar on page load
    updateNavbar();
    
    // Ensure menu starts in closed state
    const navbarMenu = u('#navBarMenu');
    const burgerButton = u('.navbar-burger');
    
    // Force initial closed state
    mobileMenuOpen = false;
    navbarMenu.removeClass('is-active');
    burgerButton.removeClass('is-active');
    burgerButton.attr('aria-expanded', 'false');
    
    if (navbarMenu.length > 0) {
        navbarMenu.first().style.display = 'none';
    }    // Toggle mobile menu when burger is clicked
    u('#navBarButton, .navbar-burger').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (mobileMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Prevent mobile menu from closing when clicking inside the search area
    u('#navBarMenu .navbar-item:has(#searchTerm), #navBarMenu .navbar-item:has(#searchButton)').on('click', function(e) {
        e.stopPropagation();
    });
});

// Close mobile menu when clicking on menu items (except dropdowns and search area)
u('.navbar-item:not(.has-dropdown)').on('click', function(e) {
    if (window.innerWidth < 1024) {
        // Don't close if this is a search-related element
        const isSearchElement = u(this).find('#searchTerm, #searchButton').length > 0 ||
                               u(this).hasClass('search-item') ||
                               e.target.closest('#searchTerm') ||
                               e.target.closest('#searchButton');
        
        if (!isSearchElement) {
            closeMobileMenu();
        }
    }
});

// Prevent search form from closing the menu when clicked
u('#searchTerm, #searchButton, .navbar-item:has(#searchTerm), .navbar-item:has(#searchButton)').on('click', function(e) {
    e.stopPropagation();
});

// Close mobile menu when clicking outside (but not on search elements)
u(document).on('click', function(e) {
    const clickedElement = e.target;
    
    // Check if click is inside navbar or its children
    const isInsideNavbar = clickedElement.closest('.navbar') || 
                          clickedElement.closest('#navBarMenu') || 
                          clickedElement.closest('.navbar-burger') ||
                          clickedElement.closest('#navBarButton');
    
    // Check if click is on search elements
    const isSearchElement = clickedElement.closest('#searchTerm') || 
                           clickedElement.closest('#searchButton') || 
                           clickedElement.closest('.field.has-addons');
    
    // Close menu if clicking outside and menu is active
    if (!isInsideNavbar && !isSearchElement && mobileMenuOpen) {
        closeMobileMenu();
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
        if (mobileMenuOpen) {
            closeMobileMenu();
        }
        
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
u('.navbar-burger, #navBarButton').on('keydown', function(e) {
    if (e.keyCode === 13 || e.keyCode === 32) { // Enter or Space
        e.preventDefault();
        u(this).trigger('click');
    }
});