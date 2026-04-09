// Progress Bars Animation for Skills Section

document.addEventListener('DOMContentLoaded', function () {
    // Animate horizontal progress bars
    document.querySelectorAll('.progress-bar-fill').forEach(function (bar) {
        var percent = bar.getAttribute('data-percent');
        if (percent) {
            bar.style.width = percent + '%';
        }
    });

    // Animate circular progress bars (if you want to animate dynamically)
    document.querySelectorAll('.circular-progress').forEach(function (circle) {
        var style = circle.getAttribute('style');
        // Already set in HTML, but you can animate if needed
        // Example: Animate from 0deg to target deg
        // For now, nothing needed unless you want animation
    });
});
