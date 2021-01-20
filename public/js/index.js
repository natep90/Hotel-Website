const faders = document.querySelectorAll('.fade-in');
const sliders = document.querySelectorAll('.slide-in');

const appearOptions = {
    threshold: 0.3,
    rootMargin: "0px"
};
const scrollAppear = new IntersectionObserver
    ((entries, scrollAppear) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('show');
                scrollAppear.unobserve(entry.target);
            }
        })
    },
        appearOptions);

faders.forEach(fader => {
    scrollAppear.observe(fader);
})

sliders.forEach(slider => {
    scrollAppear.observe(slider);
})

function submitform() {
    window.location.reload();
}