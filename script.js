/**
 * Sweet Delights Bakery - CMS Interaction Logic
 * Handles dynamic fetching of products, reviews, and site info
 */


// Firebase Configuration (from User)
const firebaseConfig = {
  apiKey: "AIzaSyAoOdG1VOm6IgyogW6mZ67eZOdfYZUXldU",
  authDomain: "bakery-database-6a963.firebaseapp.com",
  projectId: "bakery-database-6a963",
  storageBucket: "bakery-database-6a963.firebasestorage.app",
  messagingSenderId: "342048149029",
  appId: "1:342048149029:web:338467611c0af7a9f079cc"
};

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Firebase if the SDK was loaded in HTML
    let db;
    if (window.firebaseUtils) {
        const { initializeApp, getFirestore } = window.firebaseUtils;
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    }
    
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

    // 2. Fetch & Listen to Customer Reviews
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer) {
        let staticReviews = [];
        let liveReviews = [];
        let currentRatingFilter = 'all';
        let currentSearchTerm = '';

        // Function to render all reviews combined with filtering
        const renderReviews = () => {
            reviewsContainer.innerHTML = '';
            
            // Combine both sources
            let allReviews = [...staticReviews, ...liveReviews];
            
            // Apply Rating Filter
            if (currentRatingFilter !== 'all') {
                allReviews = allReviews.filter(r => r.stars === parseInt(currentRatingFilter));
            }

            // Apply Search/Topic Filter
            if (currentSearchTerm.trim() !== '') {
                const term = currentSearchTerm.toLowerCase();
                allReviews = allReviews.filter(r => 
                    r.name.toLowerCase().includes(term) || 
                    r.text.toLowerCase().includes(term)
                );
            }

            if (allReviews.length === 0) {
                reviewsContainer.innerHTML = '<div class="loader">No reviews match your selection.</div>';
                return;
            }

            allReviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            allReviews.forEach((review) => {
                const isLive = review.isLive ? '<span class="review-badge">Live</span>' : '';
                const starsHTML = '★'.repeat(review.stars) + '☆'.repeat(5 - review.stars);
                const cardHTML = `
                    <div class="review-card">
                        ${isLive}
                        <div class="stars">${starsHTML}</div>
                        <p class="review-text">"${review.text}"</p>
                        <p class="reviewer-name">- ${review.name}</p>
                    </div>
                `;
                reviewsContainer.insertAdjacentHTML('beforeend', cardHTML);
            });
        };

        // Event Listeners for Filters
        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentRatingFilter = chip.getAttribute('data-rating');
                renderReviews();
            });
        });

        const searchInput = document.getElementById('review-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                currentSearchTerm = e.target.value;
                renderReviews();
            });
        }

        // Fetch Static Reviews from JSON
        fetch('content/reviews.json')
            .then(response => response.json())
            .then(data => {
                staticReviews = data.items.map(r => ({ ...r, isLive: false }));
                renderReviews();
            })
            .catch(err => {
                console.error('Error fetching static reviews:', err);
            });

        // Listen for Live Reviews from Firestore
        if (db) {
            const { collection, onSnapshot, query, orderBy } = window.firebaseUtils;
            const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
            
            onSnapshot(q, (snapshot) => {
                liveReviews = [];
                snapshot.forEach((doc) => {
                    liveReviews.push({ ...doc.data(), isLive: true });
                });
                renderReviews();
            });
        }
    }

    // 2b. Handle Review Form Submission
    const reviewForm = document.getElementById('add-review-form');
    if (reviewForm && db) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-review-btn');
            
            const name = document.getElementById('reviewer-name').value;
            const rating = parseInt(document.getElementById('reviewer-rating').value);
            const text = document.getElementById('reviewer-text').value;

            submitBtn.disabled = true;
            submitBtn.textContent = 'Posting...';

            try {
                const { collection, addDoc } = window.firebaseUtils;
                await addDoc(collection(db, "reviews"), {
                    name: name,
                    stars: rating,
                    text: text,
                    createdAt: new Date().getTime()
                });

                // Clear form and show custom success message
                reviewForm.style.display = 'none';
                document.querySelector('.review-form-container h3').style.display = 'none';
                document.getElementById('review-success-message').style.display = 'block';
                
            } catch (error) {
                console.error("Error adding review: ", error);
                alert('Oops! Something went wrong. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Post My Review';
            }
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
