

const checkForKey = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['openai-key'], (result) => {
        resolve(result['openai-key']);
      });
    });
  };

const encode = (input) => {
    return btoa(input);
  };

const saveKey = () => {
    const input = document.getElementById('key_input');
  
    if (input) {
      const { value } = input;
  
      // Encode String
      const encodedValue = encode(value);
  
      // Save to google storage
      chrome.storage.local.set({ 'openai-key': encodedValue }, () => {
        document.getElementById('key_needed').style.display = 'none';
        document.getElementById('key_entered').style.display = 'block';
        document.getElementById('Notes').style.display = 'block';
        
      });
    }
    document.body.style.height = '1000px';
  };

  const changeKey = () => {
    document.body.style.height = '400px';
    document.getElementById('key_needed').style.display = 'block';
    document.getElementById('key_entered').style.display = 'none';
    document.getElementById('Notes').style.display = 'none';

  };

document.getElementById('save_key_button').addEventListener('click', saveKey);
document.getElementById('change_key_button').addEventListener('click', changeKey);



checkForKey().then((response) => {
    if (response) {
      document.getElementById('key_needed').style.display = 'none';
      document.getElementById('key_entered').style.display = 'block';
      document.getElementById('Notes').style.display = 'block';
      
    }
  });




//OPENAI ACCESS FROM EXTENSION RATHER THAN HIGHLIGHTING


const getKey = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['openai-key'], (result) => {
      if (result['openai-key']) {
        const decodedKey = atob(result['openai-key']);
        resolve(decodedKey);
      }
    });
  });
};

const generate = async (prompt) => {
// Get your API key from storage
const key = await getKey();
const url = 'https://api.openai.com/v1/completions';

// Call completions endpoint
const completionResponse = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  },
  body: JSON.stringify({
    model: 'text-davinci-003',
    prompt: prompt,
    max_tokens: 1250,
    temperature: 0.7,
  }),
});

console.log("working")
// Select the top choice and send back
const completion = await completionResponse.json();
return completion.choices.pop();
}

const generateCompletionAction = async () => {
  try {
    document.getElementById('Output').style.display = 'block';
    document.getElementById("Output").innerHTML = '';

    const input2 = document.getElementById('notes_input');
    
    const basePromptPrefix = `
    Give me 5 detailed practice questions based on the notes below. Give 4 possible answer choices for each one, and use the provided notes to make them. Label each question with increasing numbers starting at 1 and ending at 5. Label each answer choice as A, B, C, or D. List the answers to each question at the complete bottom of the text. Don't print anything other than the questions and answers.
    Notes:`;
    const baseCompletion = await generate(basePromptPrefix + input2.value);

    console.log(basePromptPrefix + " " + input2.value)	
    
    const elements = document.getElementsByClassName('Outputs');

    if (elements.length === 0) {
        return;
    }

    const element = elements[0];
    
    // Split content by \n
    const content = baseCompletion.text;
    const splitContent = content.split('\n');
    splitContent.forEach((content) => {
        const p = document.createElement('p');
      
        if (content === '') {
          const br = document.createElement('br');
          p.appendChild(br);
        } else {
          p.textContent = content;
        }
      
        // Insert into HTML one at a time
        element.appendChild(p);
      });


    //document.getElementById("Output").innerHTML = response.choices[0].text;
  } catch (error) {
    console.log(error);
  }
};

/** 
//FOR SELECTION
const generateCompletionActionForSelection = async (info) => {
  try {
    //browser.browserAction.openPopup();
    document.getElementById('Output').style.display = 'block';

    const { selectionText } = info;
    
    console.log("working")
    const basePromptPrefix = `
    Give me 5 detailed practice questions based on the notes below. Give 4 possible answer choices for each one, and use the provided notes to make them. Label each question with increasing numbers starting at 1 and ending at 5. 
    Label each answer choice as A, B, C, or D. List the answers to each question at the complete bottom of the text. Don't print anything other than the questions and answers.

    Notes: 
    `;
    const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);

    console.log(baseCompletion.text)	
    
    const elements = document.getElementsByClassName('Outputs');

    if (elements.length === 0) {
        return;
    }

    const element = elements[0];
    
    // Split content by \n
    const content = baseCompletion.text;
    const splitContent = content.split('\n');
    splitContent.forEach((content) => {
        const p = document.createElement('p');
      
        if (content === '') {
          const br = document.createElement('br');
          p.appendChild(br);
        } else {
          p.textContent = content;
        }
      
        // Insert into HTML one at a time
        element.appendChild(p);
      });
      
    //document.getElementById("Output").innerHTML = baseCompletion.text;
  } catch (error) {
    console.log(error);
  }
};
*/

document.getElementById('notes_entered_button').addEventListener('click', generateCompletionAction);


