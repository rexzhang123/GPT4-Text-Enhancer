// This file implements the readbility checker daemon 

// Initialize variables to keep track of the current index and store low readability sentences
let currentHighlightIndex = -1;
let lowReadabilitySentences = [];

// Add an event listener to the readability checker button
document.querySelector("#readabilityChecker").addEventListener("click", function () {
    // Retrieve the current content from the Quill editor
    let editorContent = quill.getText();

    // Check if the editor content is empty and alert the user if it is
    if (!editorContent.trim()) {
        alert("Editor is empty");
        return;
    }

    // Define the prompt for readability analysis
    let promptText = ("Readability is a measure of how easy a piece of text is to read. "
    + "Readable sentences can have some of the following 5 characteristics: "
    + "\n1. Shorter and more concise"
    + "\n2. Use active voice"
    + "\n3. Correct grammar and spelling"
    + "\n4. Use shorter words in place of longer words when they’re synonymous"
    + "\n5. Use more active verbs than adverbs"
    + "\n Your task: Rate each sentence in the following text in terms of readability and assign a readability score (1, 2, or 3) "
    + "(1 not readable, 2 somewhat readable, 3 readable). "
    + "Identify the sentences with readability score 1 in the following text, list them each on a new line, and suggest an improved "
    + "version with better readability after each sentence. Format: Original: <original-sentence> "
    + "Suggestion: <improved version>. If no sentences have a score of 1, simply output 0. Text: " + editorContent.trim());

    // Make a POST request to the server with the readability analysis prompt
    fetch("http://52.201.236.49:3000/chatgpt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptText }),
    })
    .then(response => {
        // Check if the response is successful; if not, throw an error
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the JSON response from the server
        return response.json();
    })
    .then(data => {
        // Split the response into individual suggestion pairs
        let suggestionPairs = data.choices[0].message.content.trim().split('\n');

        // Check if no low readability sentences were found
        if (suggestionPairs.length === 1) {
            alert("No sentences of low readability were found.");
        } else {
            // Reset the arrays for storing sentences and their suggested improvements
            lowReadabilitySentences = [];
            suggestedImprovements = [];
            console.log(suggestionPairs); // Log the suggestion pairs for debugging
            // Iterate through the suggestion pairs and extract the original and suggested sentences
            for (let i = 0; i < suggestionPairs.length; i += 3) {
                let originalSentence = suggestionPairs[i].substring("Original: ".length).trim();
                let suggestedSentence = suggestionPairs[i + 1].substring("Suggestion: ".length).trim();
                lowReadabilitySentences.push(originalSentence);
                suggestedImprovements.push(suggestedSentence);
            }
            // Set the index to start highlighting from the first sentence
            currentHighlightIndex = 0;
            // Call the function to highlight the first low readability sentence
            highlightNextSentence();
        }
    })  
    .catch(error => console.error("Error:", error)); // Log any errors that occur during the fetch process
});

// Function to highlight the next low readability sentence in the editor
function highlightNextSentence() {
    // Remove any existing edit boxes
    removeEditBox();

    // Check if the current index is within the range of low readability sentences
    if (currentHighlightIndex >= 0 && currentHighlightIndex < lowReadabilitySentences.length) {
        let sentence = lowReadabilitySentences[currentHighlightIndex].trim();
        let editorContent = quill.getText();
        // Find the start index of the sentence in the editor content
        let startIndex = editorContent.indexOf(sentence);
        // If the sentence is found, highlight it and display the edit box
        if (startIndex !== -1) {
            quill.formatText(startIndex, sentence.length, { 'background': '#add8e6' }); // Apply highlight formatting
            displayTextBox(startIndex, sentence.length); // Display the edit box for suggested improvements
        }
    }
}



function displayTextBox(startIndex, length) {
    // Remove any existing textboxes
    removeEditBox();

    // Set the default text for the textbox to the suggested improvement
    let textBox = document.createElement('textarea');
    textBox.className = 'edit-box';
    textBox.value = suggestedImprovements[currentHighlightIndex];  // Set the suggested improvement as the default text
    textBox.setAttribute('rows', '4'); // Set the number of rows to make the textbox taller
    textBox.setAttribute('cols', '50'); // Set the number of columns to make the textbox wider

    // Create the 'Accept' button
    let acceptButton = document.createElement('button');
    acceptButton.textContent = 'Accept';
    acceptButton.onclick = function() {
        acceptEdit(startIndex, length, textBox.value);
    };

    // Create the 'Cancel' button
    let cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = function() {
        cancelEdit();
    };

    // Container for the textbox and buttons
    let container = document.createElement('div');
    container.className = 'temp-container'; // Assign a class for easy removal
    container.style.position = 'absolute';

    // Append the textbox and buttons to the container
    container.appendChild(textBox);
    container.appendChild(acceptButton);
    container.appendChild(cancelButton);

    // Append the container to the body
    document.body.appendChild(container);

    // Position the container below the highlighted text
    positionTextBox(container, startIndex, length);
}



function positionTextBox(container, startIndex, length) {
    let quillEditor = document.querySelector('#editor');
    let editorBounds = quillEditor.getBoundingClientRect();
    let textBounds = quill.getBounds(startIndex, length);

    // Position the container below the highlighted text without blocking it
    container.style.left = `${editorBounds.left + textBounds.left}px`;
    container.style.top = `${window.scrollY + editorBounds.top + textBounds.bottom + quillEditor.offsetTop}px`;
}


// Function to position the textbox for editing highlighted text
function positionTextBox(container, startIndex, length) {
    // Get the bounding rectangle of the editor
    let editorBounds = document.querySelector('#editor').getBoundingClientRect();
    // Get the bounds of the text that needs to be highlighted
    let textBounds = quill.getBounds(startIndex, length);

    // Set the position of the container to be absolute
    container.style.position = 'absolute';
    // Position the container to the left, aligned with the start of the highlighted text
    container.style.left = `${editorBounds.left + textBounds.left}px`;
    // Position the container right below the highlighted text
    container.style.top = `${window.scrollY + editorBounds.top + textBounds.bottom}px`;
}

// Function to handle the acceptance of the edited text
function acceptEdit(startIndex, length, newText) {
    // Delete the existing text in the range
    quill.deleteText(startIndex, length);
    // Insert the new edited text at the same position
    quill.insertText(startIndex, newText);
    // Remove the edit box after accepting the edit
    removeEditBox();
    // Move to the next sentence that needs editing
    moveToNextSentence();
}

// Function to handle the cancellation of the edit
function cancelEdit() {
    // Remove the edit box when the edit is canceled
    removeEditBox();
    // Move to the next sentence without making any changes
    moveToNextSentence();
}

// Function to move to the next sentence in the list of low readability sentences
function moveToNextSentence() {
    // Remove the highlight from the current sentence
    removeHighlight(currentHighlightIndex);
    // Increment the index to move to the next sentence
    currentHighlightIndex++;
    // Check if there are more sentences to highlight and if so, highlight the next one
    if (currentHighlightIndex < lowReadabilitySentences.length) {
        highlightNextSentence();
    }
}

// Function to remove the edit box from the DOM
function removeEditBox() {
    // Select all containers with the class '.temp-container'
    let existingContainers = document.querySelectorAll('.temp-container');
    // Iterate over each container and remove it from the DOM
    existingContainers.forEach(container => container.remove());
}

// Function to remove highlighting from a specific index
function removeHighlight(index) {
    // Check if the index is within the range of sentences
    if (index >= 0 && index < lowReadabilitySentences.length) {
        // Get the sentence at the current index
        let sentence = lowReadabilitySentences[index].trim();
        // Find the start index of this sentence in the editor
        let startIndex = quill.getText().indexOf(sentence);
        // If the sentence is found, remove the highlighting format
        if (startIndex !== -1) {
            quill.removeFormat(startIndex, sentence.length);
        }
    }
}



document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the info button
    document.getElementById('infoButton').addEventListener('click', function() {
      document.getElementById('infoModal').style.display = 'block'; // Show the info modal
    });
  
    // Add event listener to the close button of the info modal
    document.querySelector('.close-info').addEventListener('click', function() {
      document.getElementById('infoModal').style.display = 'none'; // Hide the info modal
    });
  
    // Close the info modal if user clicks outside of it
    window.addEventListener('click', function(event) {
      let infoModal = document.getElementById('infoModal');
      if (event.target == infoModal) {
        infoModal.style.display = 'none';
      }
    });
  });
  