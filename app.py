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
    return render_template('index.html', workflow=workflow, results=results, outputs=outputs)

@app.route('/execute_workflow', methods=['POST'])
def execute_workflow():
    global workflow
    results = []
    outputs = []
    for command in workflow:
        try:
            result = subprocess.run(['wsl.exe', command], check=True, stdout=subprocess.PIPE, text=True)
            results.append('success')
            outputs.append(result.stdout.strip())
        except subprocess.CalledProcessError as e:
            results.append('error')
            outputs.append(e.stdout.strip() if e.stdout else 'Error occurred during execution')
    return redirect(url_for('index', results=results, outputs=outputs))

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
