from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pythia.sqlite'
api = Api(app)
db = SQLAlchemy(app)

from pythia.resources import *
