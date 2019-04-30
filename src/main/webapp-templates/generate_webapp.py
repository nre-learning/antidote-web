#!/usr/bin/env python
import jinja2
import sys

templateLoader = jinja2.FileSystemLoader(searchpath="./")
templateEnv = jinja2.Environment(loader=templateLoader)

templates = [
    "advisor/index.html",
    "advisor/courseplan.html",
    "labs/index.html",
    "stats/index.html",
    "collections/index.html",
    'index.html',
    'jupyterlessonguides.html'
]

for template_file in templates:

    template = templateEnv.get_template(template_file)
    outputText = template.render(antidote_version=sys.argv[1])

    with open("../webapp/%s" % template_file, "w") as f:
        f.write(outputText)

