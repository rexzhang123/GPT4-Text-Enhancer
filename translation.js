// This file contains the implementation for translation daemon

// Quill editor setup
var quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: "#toolbar",
    },
    placeholder: 'Start typing here or paste your content...',
  });
  
  // Modal elements and varaibles setup for use down the file
  var languageModal = document.getElementById("languageModal");
  var previewModal = document.getElementById("previewModal");
  var translationButton = document.getElementById("myButton");
  var closeModalButton = document.getElementsByClassName("close")[0];
  var closePreviewModalButton = document.getElementsByClassName("close-preview")[0];
  var translationPreview = document.getElementById("translationPreview");
  
  // Open the language modal preview window
  translationButton.onclick = function() {
    languageModal.style.display = "block";
  };
  
  // Close the language modal preview window
  closeModalButton.onclick = function() {
    languageModal.style.display = "none";
  };
  
  // Close the preview modal 
  closePreviewModalButton.onclick = function() {
    previewModal.style.display = "none";
  };
  
  // Close modals if clicked outside of them
  window.onclick = function(event) {
    if (event.target == languageModal) {
      languageModal.style.display = "none";
    } else if (event.target == previewModal) {
      previewModal.style.display = "none";
    }
  };
  
  // Translate button inside the language modal
  document.getElementById("translateButton").addEventListener("click", function() {
    // Retrieve the selected language from the dropdown
    var selectedLanguage = document.getElementById("languageSelect").value;
  
    // Retrieve all the content from Quill as plain text
    var editorContent = quill.getText();
  
    // Prepare the prompt with a command.
    // variables are embedded in the prompt to provide the flexibility to translate to other languages
    var promptText = `Translate the following text to ${selectedLanguage}: ${editorContent.trim()}`;
  
  // Initiate a network request to the specified URL
    fetch("http://52.201.236.49:3000/chatgpt", {
      method: "POST", // Specify the HTTP method, POST, for sending data to the server
      headers: {
        "Content-Type": "application/json", // Set the content type header to indicate that the request body format is JSON
      },
      body: JSON.stringify({ prompt: promptText }),
    })
    .then((response) => {
      // This function is executed when the fetch operation completes
      // 'response' contains the server's response to the request
      if (!response.ok) {
        // Check if the response status is not OK (status code outside 200-299 range)
        // If so, throw an error with the status code
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // If the response status is OK, parse the JSON content of the response body
      return response.json();
    })
    .then((data) => {
      // Assuming the response contains the text from GPT-4
      // You might need to adjust this part depending on the actual response format
      var translatedText = data.choices[0].message.content;
      
      // Display the translation in the preview modal
      translationPreview.textContent = translatedText;
      previewModal.style.display = "block";
    })
    .catch((error) => console.error("Error:", error));
  
    // Close the language modal
    languageModal.style.display = "none";
  });
  
  // Accept translation button inside the preview modal
  document.getElementById("acceptTranslation").addEventListener("click", function() {
    quill.setText(translationPreview.textContent); // Replace the editor content with the translation
    previewModal.style.display = "none"; // Close the preview modal
  });
  
  // Skip translation button inside the preview modal
  document.getElementById("skipTranslation").addEventListener("click", function() {
    previewModal.style.display = "none"; // Just close the preview modal
  });
  

  