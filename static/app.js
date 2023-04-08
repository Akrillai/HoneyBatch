function editStep(event, index) {
    event.stopPropagation();
    const listItem = document.querySelectorAll("li")[index];
    const command = listItem.getAttribute('data-command');
    const editStepUrl = listItem.querySelector(".edit-btn").getAttribute("data-url");
    listItem.innerHTML = `<input type="text" value="${command}" data-index="${index}" data-url="${editStepUrl}" onkeydown="submitEditedStep(event, this)">`;
    listItem.querySelector('input').focus();
}


function submitEditedStep(event, inputElement) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const command = inputElement.value;
        const index = inputElement.getAttribute('data-index');
        const editStepUrl = inputElement.getAttribute("data-url");
        location.href = `${editStepUrl}?index=${index}&command=${encodeURIComponent(command)}`;
    }
}


function removeStep(event, index, removeStepUrl) {
    event.stopPropagation();
    if (confirm('Are you sure you want to remove this step?')) {
        location.href = `${removeStepUrl}?index=${index}`;
    }
}


function createInput() {
    const li = document.createElement('li');
    const input = document.createElement('input');
    input.onkeydown = function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitCommand(input.value);
        }
    };
    li.appendChild(input);
    document.querySelector('ul').appendChild(li);
    input.focus();
}

function submitCommand(command) {
    document.getElementById('command-input').value = command;
    document.getElementById('command-form').submit();
}

function rerunStep(index) {
    const listItem = document.querySelectorAll("li")[index];
    if (listItem.classList.contains("error")) {
        executeStep(index);
    }
}

// Modify the executeStep function
// Modify the executeStep function
async function executeStep(index) {
    if (index >= document.querySelectorAll("li").length) {
        return;
    }
    const listItem = document.querySelectorAll("li")[index];

    // Add the double-click event listener
    listItem.addEventListener('dblclick', function () {
        rerunStep(index);
    });

    listItem.classList.remove("error"); // Remove the "error" class when re-running
    listItem.classList.add("executing");
    listItem.querySelector("small").textContent = "Executing...";

    const response = await fetch("/execute_workflow", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `command_index=${index}`,
    });

    const data = await response.json();
    listItem.classList.remove("executing");
    listItem.classList.add(data.status);
    listItem.querySelector("small").textContent = data.output;

    // Check if the status is "success" before proceeding to the next step
    if (data.status === "success") {
        executeStep(index + 1);
    }
}

