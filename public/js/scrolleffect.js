
const navContainer = document.querySelector('.nav-container');
// Nav bar fade effect
window.onscroll = () => {
    if (window.pageYOffset > 10) {
        navContainer.classList.add('nav-scroll')
    } else {
        navContainer.classList.remove('nav-scroll')
    }
}

const nav = document.querySelector(".nav-container-content");
const burger = document.querySelector(".nav-container-menu-btn");
const navLinks = document.querySelectorAll(".nav-container-content li");
const item = document.querySelectorAll(".link");
const burgerLine = document.querySelector(".lines");

const navSlide = () => {
    burger.addEventListener("click", () => {
        nav.classList.toggle("overlay-active");

        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = "";
            } else {
                link.style.animation = `navLinkFadeIn 1s ease forwards ${index / 5 + 0.2}s`;
            }
        });
        burgerLine.classList.toggle("toggle");
    });
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("overlay-active");
            link.style.animation = '';
            burgerLine.classList.remove("toggle");
            item.forEach(item => {
                item.style.animation = "";
                burgerLine.classList.remove("toggle");
            });
        });
    });
};
navSlide();
