// Load environment variables from a .env file
require('dotenv').config();

// Import necessary modules
const express = require('express'); // Express framework for building web applications
const cors = require('cors'); // CORS middleware to enable Cross-Origin Resource Sharing
const app = express(); // Create an instance of an express application
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing for incoming requests

// Async function to dynamically import 'node-fetch' as it's an ESM-only module
async function loadDependencies() {
    const fetchModule = await import('node-fetch');
    const fetch = fetchModule.default; // Extract the default export from the imported module

    // fetch is now available for use within this scope
}

// Call loadDependencies and then set up routes and server
loadDependencies().then(() => {
    // Define a POST route handler for '/chatgpt'
    app.post('/chatgpt', async (req, res) => {
        try {
            // Perform a fetch request to OpenAI's API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Use the API key from environment variables
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4", // Specify the GPT-4 model
                    messages: [{ "role": "user", "content": req.body.prompt }] // Send user's prompt to the API
                })
            });
                
            const apiResponse = await response.json(); // Parse the JSON response from the API
            console.log("API Response:", apiResponse); // Log the API response

            res.json(apiResponse); // Send the API response back to the frontend client
            
        } catch (error) {
            // Handle any errors that occur during the fetch request
            console.error("Error occurred:", error);
            res.status(500).send(error.message); // Send a 500 Internal Server Error response
        }
    });
    
    // Define the port and start the server
    const PORT = process.env.PORT || 3000; // Use the port from environment variables or default to 3000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server
});
