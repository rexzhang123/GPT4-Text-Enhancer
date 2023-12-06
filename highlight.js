// This file contains impelementation for key information highlight daemon

// Wait for the DOM to be fully loaded before executing the script.
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the Key Info Highlighter button.
    document.querySelector("#keyInfoHighlighter").addEventListener("click", function () {
        // Retrieve the current content from the Quill editor.
        let editorContent = quill.getText();

        // Check if the editor content is empty and alert the user if it is.
        if (!editorContent.trim()) {
            alert("The editor content is empty.");
            return; // Exit the function if the editor is empty.
        }

        // If the editor is not empty, open the density selection popup.
        openDensitySelectionPopup(editorContent);
    });

    // Add event listener to the Unhighlight Button.
    document.getElementById('unhighlightButton').addEventListener('click', function() {
        // Get the total length of the content in the Quill editor.
        var length = quill.getLength();
        // Remove all formatting from the entire content.
        quill.removeFormat(0, length);
    });
});

// Function to create and display a popup for selecting the highlight density.
function openDensitySelectionPopup(editorContent) {
    // Create a div element to act as the popup container.
    const popup = document.createElement('div');
    popup.id = 'densitySelectionPopup';
    // Set the CSS for the popup for proper positioning and styling.
    popup.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 20px; background: white; border: 1px solid black; z-index: 1000; display: flex; flex-direction: column; align-items: center;';

    // Add instructional text to the popup for user guidance.
    const instructionText = document.createElement('div');
    instructionText.textContent = 'Select Highlight Density Level:';
    instructionText.style.cssText = 'margin-bottom: 20px; font-size: 18px; font-weight: bold;';
    popup.appendChild(instructionText); // Append the instruction text to the popup.

    // Define the density options (Low, Medium, High) for the user to select.
    const densities = ['Low', 'Medium', 'High'];
    densities.forEach(density => {
        // Create a button for each density option.
        const button = document.createElement('button');
        button.innerText = density;
        button.style.cssText = 'margin-bottom: 10px; padding: 10px 20px;'; // Style the button.
        button.onclick = function() {
            // Fetch key information based on the selected density when the button is clicked.
            fetchKeyInfo(editorContent, density);
            // Remove the popup from the DOM after a selection is made.
            document.body.removeChild(popup);
        };
        popup.appendChild(button); // Append each button to the popup.
    });

    // Append the completed popup to the body of the document.
    document.body.appendChild(popup);
}


// Function to fetch key information from the server based on the selected density
function fetchKeyInfo(editorContent, density) {
    var promptText;

    // Construct different prompts based on the density level chosen by the user
    // standardize output to be dictionary for data processing later.
    if (density === 'Low') {
        // For 'Low' density, the prompt requests a limited number of key words or phrases
        promptText = ("Please only return the key words or phrases that are MOST and absolutely crucial for understanding the overall message "
   + "in the given text exactly as they appeared in the original text. Limit the response to up to 3 key words/phrases."
   + " When extracting key words or phrases from a paragraph, "
   + "they typically fall into the following categories (A, B, C, D): "
   + "\nA. Nouns and Proper Nouns (e.g. main subjects or objects of the paragraph, such as people, places, organizations, or specific things), "
   + "Technical and Domain-Specific Terms (e.g. specific fields or topics), Names and Titles (e.g. names of people, books, "
   + "documents, theories, etc., that are central to the paragraph's message). "
   + "\nB. Key Action Verbs: Key actions or states of being that drive the narrative or argument in the paragraph"
   + "\nC. Dates and Numbers: Important for understanding timelines, quantities, or other numerical data relevant to the paragraph"
   + "\nD. Phrases or Idioms: Sometimes a key idea or concept is best captured in a phrase rather than a single word."
   + "\nPlease return as a dictionary. \n"
   + "Example response format: "
   + "\n{\n"
   + "    \"A\": [\"John Doe\", \"London\", \"Divergence Theorem\"],\n"
   + "    \"B\": [\"execute\", \"analyze\", \"create\"],\n"
   + "    \"C\": [\"15%\", \"year-over-year\", \"2021 Q1\"]\n"
   + "    \"D\": [\"Cutting corners%\", \"Don't judge a book by its cover\", \"The elephant in the room\"]\n"
   + "}. Text: " + editorContent.trim());
    } else if (density === 'Medium') {
        // For 'Medium' density, the prompt asks for a moderate number of key words or phrases
        promptText = ("Please return the key words or phrases that contribute to the understanding of the content "
   + "in the given text exactly as they appeared in the original text. Limit the response to up to 10 key words/phrases"
   + " When extracting key words or phrases from a paragraph, "
   + "they typically fall into the following categories (A, B, C, D): "
   + "\nA. Nouns and Proper Nouns (e.g. main subjects or objects of the paragraph, such as people, places, organizations, or specific things), "
   + "Technical and Domain-Specific Terms (e.g. specific fields or topics), Names and Titles (e.g. names of people, books, "
   + "documents, theories, etc., that are central to the paragraph's message). "
   + "\nB. Key Action Verbs: Key actions or states of being that drive the narrative or argument in the paragraph"
   + "\nC. Dates and Numbers: Important for understanding timelines, quantities, or other numerical data relevant to the paragraph"
   + "\nD. Phrases or Idioms: Sometimes a key idea or concept is best captured in a phrase rather than a single word."
   + "\nPlease return as a dictionary. \n"
   + "Example response format: "
   + "\n{\n"
   + "    \"A\": [\"John Doe\", \"London\", \"Divergence Theorem\"],\n"
   + "    \"B\": [\"execute\", \"analyze\", \"create\"],\n"
   + "    \"C\": [\"15%\", \"year-over-year\", \"2021 Q1\"]\n"
   + "    \"D\": [\"Cutting corners%\", \"Don't judge a book by its cover\", \"The elephant in the room\"]\n"
   + "}. Text: " + editorContent.trim());
    } else { // 'High' density
        // For 'High' density, the prompt requests a comprehensive list of all key words or phrases
        promptText = ("Please return ALL the key words or phrases that are central to the text's message "
   + "in the given text exactly as they appeared in the original text. No limit for the number of words/phrases returned."
   + " When extracting key words or phrases from a paragraph, "
   + "they typically fall into the following categories (A, B, C, D): "
   + "\nA. Nouns and Proper Nouns (e.g. main subjects or objects of the paragraph, such as people, places, organizations, or specific things), "
   + "Technical and Domain-Specific Terms (e.g. specific fields or topics), Names and Titles (e.g. names of people, books, "
   + "documents, theories, etc., that are central to the paragraph's message). "
   + "\nB. Key Action Verbs: Key actions or states of being that drive the narrative or argument in the paragraph"
   + "\nC. Dates and Numbers: Important for understanding timelines, quantities, or other numerical data relevant to the paragraph"
   + "\nD. Phrases or Idioms: Sometimes a key idea or concept is best captured in a phrase rather than a single word."
   + "\nPlease return as a dictionary. \n"
   + "Example response format: "
   + "\n{\n"
   + "    \"A\": [\"John Doe\", \"London\", \"Divergence Theorem\"],\n"
   + "    \"B\": [\"execute\", \"analyze\", \"create\"],\n"
   + "    \"C\": [\"15%\", \"year-over-year\", \"2021 Q1\"]\n"
   + "    \"D\": [\"Cutting corners%\", \"Don't judge a book by its cover\", \"The elephant in the room\"]\n"
   + "}. Text: " + editorContent.trim());
    }

    // Send a POST request to the server with the constructed prompt
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
        // Attempt to parse the response content
        let messageContent;
        try {
            messageContent = JSON.parse(data.choices[0].message.content);
        } catch(e) {
            // Log an error if parsing fails
            console.error("Error parsing message content:", e);
            return;
        }

        // Categorize the key phrases based on the categories A, B, C, and D
        let categorizedPhrases = {
            A: messageContent.A || [],
            B: messageContent.B || [],
            C: messageContent.C || [],
            D: messageContent.D || [],
        };

        // Highlight each category of key phrases in the editor content
        Object.keys(categorizedPhrases).forEach(category => {
            if (Array.isArray(categorizedPhrases[category])) {
                highlightKeyInformation(categorizedPhrases[category], editorContent, category);
            }
        });
    })
    .catch(error => console.error("Error:", error)); // Log any errors encountered during the fetch process
}

// Function to apply highlighting to key phrases in the editor based on their category
function highlightKeyInformation(keyPhrases, editorContent, category) {
    let color;
    // Assign a specific color to each category for highlighting
    switch (category) {
        case 'A':
            color = 'pink'; // Color for category A
            break;
        case 'B':
            color = 'orange'; // Color for category B
            break;
        case 'C':
            color = '#CBC3E3'; // Color for category C
            break;
        case 'D':
            color = 'yellow'; // Color for category D
            break;
    }

    // Loop through each key phrase in the category
    keyPhrases.forEach(phrase => {
        let startIndex = 0;
        // Find and highlight each occurrence of the phrase in the editor content
        while ((startIndex = editorContent.indexOf(phrase, startIndex)) !== -1) {
            quill.formatText(startIndex, phrase.length, { 'background': color });
            startIndex += phrase.length;
        }
    });
}


