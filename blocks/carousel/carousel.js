export default function decorate(block) {
    const rows = [...block.children];
    rows.forEach((row, rowIndex) => {
        if(rowIndex === 0 ){
            const nextButton = document.createElement('button');
            nextButton.classList.add('btn','btn-next');
            const node = document.createTextNode(row.textContent);
            nextButton.append(node);
            row.replaceWith(nextButton);
        } else if(rowIndex === rows.length -1) {
            const prevButton  = document.createElement('button');
            prevButton.classList.add('btn', 'btn-prev');
            const node = document.createTextNode(row.textContent);
            prevButton.append(node);
            row.replaceWith(prevButton)
        } else {
            row.classList.add('slide');
            [...row.children].forEach((col, colIndex) => {
                if(colIndex === 1 ){
                    col.classList.add('slide-text');
                }
            })
        }
    });

    const slides = document.querySelectorAll(".slide");
  
    // loop through slides and set each slides translateX
    slides.forEach((slide, indx) => {
      slide.style.transform = `translateX(${indx * 100}%)`;
    });
    // select next slide button
  const nextSlide = document.querySelector(".btn-next");
  
    // current slide counter
    let curSlide = 0;
    // maximum number of slides
    let maxSlide = slides.length - 1;
    
    // add event listener and navigation functionality
    nextSlide.addEventListener("click", function () {
    // check if current slide is the last and reset current slide
    if (curSlide === maxSlide) {
        curSlide = 0;
    } else {
        curSlide++;
    }
    
    //   move slide by -100%
    slides.forEach((slide, indx) => {
        slide.style.transform = `translateX(${100 * (indx - curSlide)}%)`;
    });
    });
    
    // select next slide button
    const prevSlide = document.querySelector(".btn-prev");
    
    // add event listener and navigation functionality
    prevSlide.addEventListener("click", function () {
    // check if current slide is the first and reset current slide to last
        if (curSlide === 0) {
            curSlide = maxSlide;
        } else {
            curSlide--;
        }
        
        //   move slide by 100%
        slides.forEach((slide, indx) => {
            slide.style.transform = `translateX(${100 * (indx - curSlide)}%)`;
        });
    });
}