document.getElementById('chatForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const userInput = document.getElementById('userInput').value;
    console.log(userInput);
    if (!userInput.trim()) return;
  
    // Display the user's message
    const messagesDiv = document.querySelector('.messages');
    messagesDiv.innerHTML += `<div class="user-message"><strong>You:</strong> ${userInput}</div>`;
    document.getElementById('userInput').value = '';
  
    // Stream the response from the server
    const responseDiv = document.createElement('div');
    responseDiv.classList.add('assistant-message');
    responseDiv.innerHTML = `<strong>Assistant:</strong> `;
    messagesDiv.appendChild(responseDiv);
    
    try {
      const responseStream = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
      });
  
      const reader = responseStream.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = '';
  
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        fullResponse += decoder.decode(value, { stream: true });
  
        // Update the assistant's response in real-time
        responseDiv.innerHTML = `<strong>Assistant:</strong> ${fullResponse}`;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
