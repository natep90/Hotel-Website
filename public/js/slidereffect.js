// Image slider JS 
const slides = document.querySelectorAll(".slide");
const next = document.querySelector("#next");
const prev = document.querySelector("#prev");
const auto = true;
const intervalTime = 8000;
let slideInterval;

const nextSlide = () => {
    //get current slide
    const current = document.querySelector(".current");
    // remove current
    current.classList.remove("current");
    // check position of next slide
    if (current.nextElementSibling) {
        current.nextElementSibling.classList.add("current");
    } else {
        slides[0].classList.add("current");
    }
    setTimeout(() => current.classList.remove("current"));
};
const prevSlide = () => {
    //get current slide
    const current = document.querySelector(".current");
    // remove current
    current.classList.remove("current");
    // check position of next slide
    if (current.previousElementSibling) {
        current.previousElementSibling.classList.add("current");
    } else {
        slides[slides.length - 1].classList.add("current");
    }
    setTimeout(() => current.classList.remove("current"));
};

// Change piture manually

next.addEventListener("click", e => {
    nextSlide();
    if (auto) {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalTime);
    }
});
prev.addEventListener("click", e => {
    prevSlide();
    if (auto) {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, intervalTime);
    }
});

//auto slide
if (auto) {
    slideInterval = setInterval(nextSlide, intervalTime);
}