(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()


  //for displaying the rating in the review form
  function updateRatingValue(value) {
    document.getElementById("ratingValue").innerText = value;
}

// Initialize the displayed value when the page loads
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.getElementById("rating");
  const ratingValue = document.getElementById("ratingValue");
  ratingValue.innerText = slider.value; // Set the initial value
});



// for displaying the chat box
document.addEventListener('DOMContentLoaded', () => {
    const aiChatBtn = document.getElementById('ai-chat-btn');
    const aiToggle = document.getElementById('aiToggle');
    const chatbox = document.getElementById('ai-chatbox');
    const closeChatbox = document.getElementById('close-chatbox');
    const sendMessageBtn = document.getElementById('send-message');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    if (aiChatBtn) {
        aiChatBtn.style.display = 'inline-block';
        aiChatBtn.style.visibility = 'visible';
        aiChatBtn.style.opacity = '1';

        aiChatBtn.addEventListener('click', () => {
            chatbox.style.display = chatbox.style.display === 'none' ? 'flex' : 'none';
        });
    }

    if (aiToggle && chatbox) {
        aiToggle.addEventListener('click', () => {
            chatbox.style.display = chatbox.style.display === 'none' ? 'flex' : 'none';
        });
    }

    closeChatbox.addEventListener('click', () => {
        chatbox.style.display = 'none';
    });

    sendMessageBtn.addEventListener('click', async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Show user message in chat
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.textContent = message;
        chatMessages.appendChild(userMessage);
        chatInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        try {
            const response = await fetch('/listings/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            // Show AI's reply
            const botMessage = document.createElement('div');
            botMessage.className = 'message ai-message';
            botMessage.textContent = data.reply || 'Sorry, I couldn’t process that.';
            chatMessages.appendChild(botMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // Only update listings if present
            if (data.listings && Array.isArray(data.listings) && data.listings.length > 0) {
                updateListings(data.listings);
            }

        } catch (error) {
            console.error('Error:', error);
            const errorMessage = document.createElement('div');
            errorMessage.className = 'message bot';
            errorMessage.textContent = 'Error communicating with AI.';
            chatMessages.appendChild(errorMessage);
        }
    });

    function updateListings(listings) {
        const listingContainer = document.querySelector('.row');
        if (!listingContainer) return;

        listingContainer.innerHTML = '';

        listings.forEach(listing => {
            const listingCard = document.createElement('div');
            listingCard.className = 'col-md-4 mb-4';
            listingCard.innerHTML = `
                <div class="card listing-card">
                    <img src="${listing.image.url}" class="card-img-top" alt="${listing.title}">
                    <div class="card-body">
                        <h5 class="card-title">${listing.title}</h5>
                        <p class="card-text"><strong>Price:</strong> $${listing.price}</p>
                        <p class="card-text"><strong>Location:</strong> ${listing.location}, ${listing.country}</p>
                        <a href="/listings/${listing._id}" class="btn btn-primary">View Details</a>
                    </div>
                </div>
            `;
            listingContainer.appendChild(listingCard);
        });
    }
});
