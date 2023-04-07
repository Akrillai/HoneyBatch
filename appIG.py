from flask import Flask, render_template, request, redirect, url_for
import os
import subprocess

app = Flask(__name__)
app.jinja_env.globals.update(zip=zip)

workflow = []

@app.route('/', methods=['GET', 'POST'])
def index():
    results = request.args.getlist('results') or [None] * len(workflow)
    outputs = request.args.getlist('outputs') or [None] * len(workflow)
    return render_template('indexIG.html', workflow=workflow, results=results, outputs=outputs)

from flask import jsonify

@app.route('/edit_step', methods=['GET'])
def edit_step():
    index = int(request.args.get('index', 0))
    command = request.args.get('command')
    if command and 0 <= index < len(workflow):
        workflow[index] = command
    return redirect(url_for('index'))

@app.route('/remove_step', methods=['GET'])
def remove_step():
    index = int(request.args.get('index', 0))
    if 0 <= index < len(workflow):
        workflow.pop(index)
    return redirect(url_for('index'))

@app.route('/execute_workflow', methods=['POST'])
def execute_workflow():
    global workflow
    command_index = int(request.form.get('command_index', 0))
    if command_index >= len(workflow):
        return jsonify({"error": "Invalid command index"})

    command = workflow[command_index]
    output = []
    try:
        process = subprocess.Popen(['bash', '-c', command], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        for line in process.stdout:
            output.append(line.strip())

        process.wait()
        if process.returncode != 0:
            error_output = process.stderr.read().strip()
            error_output = error_output.split(": ", 1)[-1].split(": ", 1)[-1]
            return jsonify({"status": "error", "output": error_output})
        else:
            return jsonify({"status": "success", "output": "\n".join(output)})
    except Exception as e:
        return jsonify({"status": "error", "output": str(e)})





@app.route('/delete_workflow', methods=['POST'])
def delete_workflow():
    global workflow
    workflow = []
    return redirect(url_for('index'))

@app.route('/create_step', methods=['POST'])
def create_step():
    command = request.form.get('command')
    if command:
        workflow.append(command)
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)