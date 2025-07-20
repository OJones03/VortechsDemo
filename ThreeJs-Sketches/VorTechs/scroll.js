// Smooth scroll functionality for the scroll indicator
document.addEventListener('DOMContentLoaded', function() {
  const scrollButton = document.querySelector('.main__scroll');
  const informationSection = document.querySelector('.information');
  
  scrollButton.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Calculate the scroll position to show the info boxes
    const infoBoxes = document.querySelector('.info-container');
    const scrollTarget = infoBoxes.offsetTop + informationSection.offsetTop - 100;
    
    // Smooth scroll to the info boxes
    window.scrollTo({
      top: scrollTarget,
      behavior: 'smooth'
    });
  });
});
