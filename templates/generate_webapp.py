#!/usr/bin/env python
import jinja2
import sys
import os
import subprocess

commitHash = subprocess.check_output(['git','rev-parse', 'HEAD']).decode('utf-8')[:-1]
templateLoader = jinja2.FileSystemLoader(searchpath="./")
templateEnv = jinja2.Environment(loader=templateLoader)

templates = [
    "advisor/index.html",
    "advisor/courseplan.html",
    "catalog/index.html",
    "labs/index.html",
    "collections/index.html",
    "collections/view.html",
    'index.html'
]

for template_file in templates:
    template = templateEnv.get_template(template_file)
    outputText = template.render(antidote_version=commitHash, env=os.environ)
    path = "../src/%s" % template_file

    try:
        os.makedirs(os.path.dirname(path))
    except FileExistsError:
        pass

    with open(path, "w+") as f:
        f.write(outputText)