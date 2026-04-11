/**
 * Sweet Delights Bakery - CMS Interaction Logic
 * Handles dynamic fetching of products, reviews, and site info
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Fetch Products
    const productContainer = document.getElementById('product-container');
    fetch('content/products.json')
        .then(response => response.json())
        .then(data => {
            productContainer.innerHTML = '';
            // Data is inside the 'items' array because of our Netlify CMS list widget configuration
            data.items.forEach((product, index) => {
                const animationDelay = index * 0.15; 
                let imgPath = product.image;
                
                const cardHTML = `
                    <div class="product-card" style="animation-delay: ${animationDelay}s">
                        <img src="${imgPath}" alt="${product.name}" class="product-image">
                        <div class="product-info">
                            <h3 class="product-title">${product.name}</h3>
                            <div class="product-price">${product.price}</div>
                            <p class="product-desc">${product.description}</p>
                        </div>
                    </div>
                `;
                productContainer.insertAdjacentHTML('beforeend', cardHTML);
            });
        })
        .catch(err => {
            console.error('Error fetching products:', err);
            productContainer.innerHTML = '<div class="loader" style="color: red;">Could not load products. Menu items are currently unavailable.</div>';
        });

    // 2. Fetch Customer Reviews
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer) {
        fetch('content/reviews.json')
            .then(response => response.json())
            .then(data => {
                reviewsContainer.innerHTML = '';
                data.items.forEach((review) => {
                    const starsHTML = '★'.repeat(review.stars) + '☆'.repeat(5 - review.stars);
                    const cardHTML = `
                        <div class="review-card">
                            <div class="stars">${starsHTML}</div>
                            <p class="review-text">"${review.text}"</p>
                            <p class="reviewer-name">- ${review.name}</p>
                        </div>
                    `;
                    reviewsContainer.insertAdjacentHTML('beforeend', cardHTML);
                });
            })
            .catch(err => {
                console.error('Error fetching reviews:', err);
                reviewsContainer.innerHTML = '<div class="loader">Could not load customer reviews.</div>';
            });
    }

    // 3. Fetch Info (About text and Contact Details)
    fetch('content/info.json')
        .then(response => response.json())
        .then(data => {
            // Update About Section
            const aboutContent = document.getElementById('about-content');
            if (aboutContent && data.about_text) {
                aboutContent.innerHTML = '';
                // Splitting by newline dynamically constructs paragraphs!
                const paragraphs = data.about_text.split('\n').filter(p => p.trim() !== '');
                paragraphs.forEach(p => {
                    const pEl = document.createElement('p');
                    pEl.textContent = p;
                    aboutContent.appendChild(pEl);
                });
            }

            // Update Contact Info Text
            if (document.getElementById('contact-address')) document.getElementById('contact-address').textContent = data.address;
            if (document.getElementById('contact-email')) document.getElementById('contact-email').textContent = data.email || 'Not provided';
            if (document.getElementById('contact-phone')) document.getElementById('contact-phone').textContent = data.phone;
            
            // Update all dynamic telephone links to use the cleanly formatted phone string
            const phoneLinks = document.querySelectorAll('.dynamic-phone-link');
            const phoneClean = data.phone ? data.phone.replace(/[^0-9+]/g, '') : '';
            phoneLinks.forEach(link => {
                link.href = 'tel:' + phoneClean;
            });
        })
        .catch(err => console.error('Error fetching site info:', err));
});
