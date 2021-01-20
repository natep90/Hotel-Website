const mainContainer = document.querySelector('.container4-reviews-container');
const reviewsContainer = document.querySelector('.container4-reviews');
const reviews = document.querySelectorAll('.container4-reviews-item');
const nextBtn = document.querySelector('.container4-reviews-button-next');
const prevBtn = document.querySelector('.container4-reviews-button-prev');

let currentTranslate = -100;
let currentSlide = 1;

const slideRight = () => {
    if (currentSlide < reviews.length-1){
        currentSlide++;
        currentTranslate -= 100; 
    } 
    for(let i = 0; i < reviews.length; i++) {
        if(currentSlide < reviews.length){
            reviews[i].style.transform = `translateX(${currentTranslate}%)`;   
        } else {
            console.log('finish')
        }
    }  
}

const slideLeft = () => {
    if(currentSlide > 0){
        currentSlide--;
        currentTranslate += 100;
    }
    for(let i = reviews.length -1; i >= 0; i--){
        reviews[i].style.transform = `translateX(${currentTranslate}%)`
    } 
}

nextBtn.addEventListener('click', () => {
    slideRight()
})


prevBtn.addEventListener('click', () => {
    slideLeft()
})