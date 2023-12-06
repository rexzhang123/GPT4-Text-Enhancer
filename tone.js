// This file contains the implmenetation for the tone/style change daemon.

// Add an event listener to the document to ensure the DOM is fully loaded before executing the script.
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve the tone selection button and add a click event listener to it.
    const toneSelectionButton = document.getElementById('toneSelectionButton');
    if (toneSelectionButton) {
        toneSelectionButton.addEventListener('click', function() {
            openToneSelectionPopup(); // Call the function to open the tone selection popup.
        });
    }
});

// Function to create and display a popup for tone selection.
function openToneSelectionPopup() {
    // Create a div element to act as the popup container.
    const popup = document.createElement('div');
    popup.id = 'toneSelectionPopup';
    // Set the CSS for the popup for positioning and styling.
    popup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background: white; border: 1px solid black; z-index: 1000;';

    // Define an array of tone options.
    const tones = ['Formal', 'Casual', 'Academic']; // Add more tones as needed.

    // Iterate over each tone and create a button for each one.
    tones.forEach(tone => {
        const button = document.createElement('button');
        button.innerText = tone;
        button.addEventListener('click', function() {
            selectTone(tone); // When clicked, call selectTone function with the chosen tone.
        });
        popup.appendChild(button); // Add the button to the popup.
    });

    // Create a close button for the popup.
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.addEventListener('click', function() {
        document.body.removeChild(popup); // Remove the popup from the DOM when clicked.
    });
    popup.appendChild(closeButton); // Add the close button to the popup.

    // Append the completed popup to the body of the document.
    document.body.appendChild(popup);
}

// Function to handle tone selection and fetch the modified text.
function selectTone(tone) {
    // Retrieve the current content from the Quill editor.
    var editorContent = quill.getText();

    // Create the prompt text to be sent to the server.
    var promptText = `Rewrite the following text in a ${tone.toLowerCase()} tone: ${editorContent.trim()}`;

    // Fetch request to the server with the prompt.
    fetch("http://52.201.236.49:3000/chatgpt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptText }),
    })
    .then((response) => {
        // Check for a successful response, otherwise throw an error.
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Parse the JSON response.
    })
    .then((data) => {
        // Display the modified text in the preview modal.
        document.getElementById('textTonePreviewContent').textContent = data.choices[0].message.content;
        document.getElementById('textTonePreviewModal').style.display = 'block';
    })
    .catch((error) => {
        // Log any errors that occur during the fetch.
        console.error("Error:", error);
    });

    // Close the tone selection popup.
    closeToneSelectionPopup();
}

// Function to close the tone selection popup.
function closeToneSelectionPopup() {
    const popup = document.getElementById('toneSelectionPopup');
    if (popup) {
        document.body.removeChild(popup); // Remove the popup from the DOM.
    }
}

// Add event listeners to the "Accept" and "Cancel" buttons in the preview modal.
document.getElementById('textToneAcceptChange').addEventListener('click', function() {
    // Set the Quill editor content to the previewed text and close the modal.
    var previewText = document.getElementById('textTonePreviewContent').textContent;
    quill.setText(previewText);
    closeTextTonePreviewModal();
});

document.getElementById('textToneCancelChange').addEventListener('click', function() {
    // Close the preview modal without making changes to the editor content.
    closeTextTonePreviewModal();
});

// Function to close the text tone preview modal.
function closeTextTonePreviewModal() {
    document.getElementById('textTonePreviewModal').style.display = 'none'; // Hide the modal.
}




// Event listener for closing the modal when the 'x' button is clicked
document.querySelector('.text-tone-close').addEventListener('click', closeTextTonePreviewModal);
