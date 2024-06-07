document.addEventListener('DOMContentLoaded', function() {

    var acc = document.getElementsByClassName("accordion__label");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            // Toggle between adding and removing the "active" class
            this.classList.toggle("active");

            // Toggle between hiding and showing the active panel
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }
    
    const zoomableImage = document.getElementById('zoomableImage');
    let isZoomed = false;

    zoomableImage.addEventListener('click', function() {
        isZoomed = !isZoomed;
        this.classList.toggle('zoomed');

        if (isZoomed) {
            // Enable scrolling
            this.parentElement.style.overflow = 'auto';
        } else {
            // Disable scrolling
            this.parentElement.style.overflow = 'hidden';
        }
    });

    // Add mousemove event listener to allow dragging
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;

    zoomableImage.addEventListener('mousedown', (e) => {
        if (isZoomed) {
            isDragging = true;
            startX = e.pageX - zoomableImage.offsetLeft;
            startY = e.pageY - zoomableImage.offsetTop;
            scrollLeft = zoomableImage.parentElement.scrollLeft;
            scrollTop = zoomableImage.parentElement.scrollTop;
        }
    });

    zoomableImage.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    zoomableImage.addEventListener('mouseup', () => {
        isDragging = false;
    });

    zoomableImage.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - zoomableImage.offsetLeft;
        const y = e.pageY - zoomableImage.offsetTop;
        const walkX = (x - startX) * 2; // Adjust the scroll speed
        const walkY = (y - startY) * 2; // Adjust the scroll speed
        zoomableImage.parentElement.scrollLeft = scrollLeft - walkX;
        zoomableImage.parentElement.scrollTop = scrollTop - walkY;
    });
});
