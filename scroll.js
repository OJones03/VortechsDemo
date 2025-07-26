/**
 * VORTECHS NETWORK SOLUTIONS - SMOOTH SCROLL FUNCTIONALITY
 * Handles smooth scrolling when the scroll indicator is clicked
 * Author: Vortechs Team | Created: 2025
 */

// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener('DOMContentLoaded', function() {
  
  // ===== ELEMENT SELECTORS =====
  const scrollIndicatorButton = document.querySelector('.scroll-indicator__link');
  const companyInfoSection = document.querySelector('.company-info');

  // ===== SCROLL FUNCTIONALITY =====
  // Check if required elements exist before adding event listeners
  if (scrollIndicatorButton && companyInfoSection) {
    
    scrollIndicatorButton.addEventListener('click', function(event) {
      // Prevent default anchor link behavior
      event.preventDefault();

      // Get nav bar height for proper offset
      const navHeight = document.querySelector('.site-navigation').offsetHeight || 75;
      // Calculate scroll position to show target just below nav bar
      const scrollTargetPosition = companyInfoSection.offsetTop - navHeight;

      // Execute smooth scroll animation
      window.scrollTo({
        top: scrollTargetPosition,
        behavior: 'smooth'
      });
    });
  } else {
    console.warn('Scroll indicator elements not found in DOM');
  }

  // ===== NAVIGATION BAR SMOOTH SCROLL =====
  // Updated to work with both old navigation and new hamburger dropdown menu
  const navLinks = document.querySelectorAll('.navigation-links a[href^="#"], .dropdown-content a[href^="#"]');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').slice(1);
      if (targetId === '') {
        // Home link: scroll to top
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        e.preventDefault();
        // Get nav bar height for proper offset
        const navHeight = document.querySelector('.site-navigation').offsetHeight || 75;
        // Calculate scroll position to show target just below nav bar
        const scrollTargetPosition = targetSection.offsetTop - navHeight;
        window.scrollTo({
          top: scrollTargetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
