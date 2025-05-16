// Retrieves the cart from localStorage and parses it into a JavaScript object.
// If there's no cart in storage, it initializes an empty array.
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Begins a function that updates the cart count displayed in the nav bar
function updateCartCount() {
  // Re-fetches the latest cart data from localStorage
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  // Calculates the total number of items in the cart
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  // Updates the text of all links ending with "cart.html" to show the item count
  document.querySelectorAll('.nav-list a[href$="cart.html"]').forEach(el => {
    el.textContent = `Cart (${count})`;
  });
}

// Function to fill in the slide-in cart panel
function populateSlideInCart() {
  // Retrieves the cart
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  // Selects the container for cart items and the element showing the total
  const cartItemsContainer = document.querySelector('.cart-panel .cart-items');
  const cartTotalEl = document.getElementById('cart-total');

  // If these elements don’t exist, exit the function early
  if (!cartItemsContainer || !cartTotalEl) return;

  // Clears previous items and sets total to 0
  cartItemsContainer.innerHTML = '';
  let total = 0;

  // Loops through each cart item
  cart.forEach(item => {
    // Creates a new div for each cart item
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-panel-item';
    // Populates the HTML content for each item, showing its image, title, price, and quantity
    itemEl.innerHTML = `
      <div style="display: flex; gap: 10px; align-items: center;">
        <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        <div style="flex: 1;">
          <strong>${item.title}</strong><br>
          AED ${item.price.toFixed(2)} x ${item.quantity}
        </div>
      </div>
    `;
    // Adds the item to the DOM and updates the total price
    cartItemsContainer.appendChild(itemEl);
    total += item.price * item.quantity;
  });

  // Displays the final total price
  cartTotalEl.textContent = `AED ${total.toFixed(2)}`;
}

// Renders the full cart page (cart.html)
function renderCart() {
  // Retrieves the cart
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  // Selects key DOM elements on the cart page
  const cartItemsContainer = document.querySelector('.cart-items');
  const emptyMessage = document.querySelector('.empty-cart-message');
  const cartSummary = document.querySelector('.cart-summary');
  const cartTotal = document.getElementById('cart-total');

  // If any are missing, exit
  if (!cartItemsContainer || !emptyMessage || !cartSummary || !cartTotal) return;

  // If the cart is empty…
  if (cart.length === 0) {
    // Hide the items, show empty message, and hide summary
    cartItemsContainer.style.display = 'none';
    emptyMessage.style.display = 'block';
    cartSummary.style.display = 'none';
    return;
  }

  // Show the cart, clear it, and reset total
  cartItemsContainer.style.display = 'flex';
  emptyMessage.style.display = 'none';
  cartSummary.style.display = 'flex';
  cartItemsContainer.innerHTML = '';
  let total = 0;

  // Loop through cart items
  cart.forEach((item, index) => {
    // Create a new item container
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    // Add image, title, quantity controls, price, and remove button
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div class="cart-item-info">
        <h3>${item.title}</h3>
        <p>
          Quantity:
          <button class="decrease" data-index="${index}">-</button>
          ${item.quantity}
          <button class="increase" data-index="${index}">+</button>
        </p>
      </div>
      <div class="cart-item-price">AED ${(item.price * item.quantity).toFixed(2)}</div>
      <button class="remove-item" data-index="${index}">Remove</button>
    `;
    // Add item to DOM, update total, and set up button handlers
    cartItemsContainer.appendChild(itemEl);
    total += item.price * item.quantity;
  });
  cartTotal.textContent = `AED ${total.toFixed(2)}`;
  attachCartActions();
}

// Sets up cart interaction buttons
function attachCartActions() {
  // Remove item from cart
  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      renderCart();
    });
  });

  // Increase quantity of item
  document.querySelectorAll('.increase').forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;
      cart[index].quantity++;
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      renderCart();
    });
  });

  // Decrease quantity or remove item if it hits 0
  document.querySelectorAll('.decrease').forEach(button => {
    button.addEventListener('click', () => {
      const index = button.dataset.index;
      if (cart[index].quantity > 1) {
        cart[index].quantity--;
      } else {
        cart.splice(index, 1);
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      renderCart();
    });
  });
}

// Run code only after the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Update cart count immediately on page load
  updateCartCount();

  // Grab references for the slide-in cart and overlay
  const cartPanel = document.getElementById('cartPanel');
  const overlay = document.getElementById('overlay');
  const cartToggle = document.getElementById('cartToggle');
  const closeCart = document.getElementById('closeCart');

  // Open the cart panel and populate it when the toggle is clicked
  if (cartToggle && cartPanel) {
    cartToggle.addEventListener('click', (e) => {
      e.preventDefault();
      populateSlideInCart();
      cartPanel.classList.add('active');
      overlay.classList.add('active');
    });

    // Close cart when clicking the close button or the overlay
    closeCart?.addEventListener('click', () => {
      cartPanel.classList.remove('active');
      overlay.classList.remove('active');
    });

    overlay?.addEventListener('click', () => {
      cartPanel.classList.remove('active');
      overlay.classList.remove('active');
    });
  }

  // Handles "Add to cart" button: adds item or increases quantity, then redirects to cart page
  document.querySelectorAll('.add-to-cart, .add-to-cart-link').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();

      const title = button.dataset.title;
      const price = parseFloat(button.dataset.price);
      const image = button.dataset.image;

      const existingItem = cart.find(item => item.title === title);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ title, price, image, quantity: 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      window.location.href = '../cart.html';
    });
  });

  // If you're on the cart page, render the cart
  if (window.location.pathname.includes('cart.html')) {
    renderCart();
  }

  // Handles contact form submission with an alert and form reset
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alert("Thank you for contacting Sugar Bloom! We'll get back to you soon.");
      form.reset();
    });
  }

  //Toggles FAQ items open/closed with + and -
  document.querySelectorAll('.faq-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const item = toggle.parentElement;
      const isActive = item.classList.toggle('active');
      toggle.querySelector('span').textContent = isActive ? '-' : '+';
    });
  });

  // Intersection reveal
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  reveals.forEach(el => observer.observe(el));
});
