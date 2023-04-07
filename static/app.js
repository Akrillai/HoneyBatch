function editStep(event, index) {
    event.stopPropagation();
    const listItem = document.querySelectorAll("li")[index];
    const command = listItem.getAttribute('data-command');
    listItem.innerHTML = `<input type="text" value="${command}" data-index="${index}" onkeydown="submitEditedStep(event, this)">`;
    listItem.querySelector('input').focus();
}

function submitEditedStep(event, inputElement) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const command = inputElement.value;
        const index = inputElement.getAttribute('data-index');
        location.href = `{{ url_for('edit_step') }}?index=${index}&command=${encodeURIComponent(command)}`;
    }
}

function removeStep(event, index) {
    event.stopPropagation();
    if (confirm('Are you sure you want to remove this step?')) {
        location.href = `{{ url_for('remove_step') }}?index=${index}`;
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

async function executeStep(index) {
    if (index >= document.querySelectorAll("li").length) {
        return;
    }
    const listItem = document.querySelectorAll("li")[index];
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
