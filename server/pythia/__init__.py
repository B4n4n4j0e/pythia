from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from sqlalchemy.orm import object_mapper
#@todo delete CORS
app = Flask(__name__)
cors = CORS(app)

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pythia.sqlite'
app.config['SQLALCHEMY_BINDS'] = {
    'detail':        'sqlite:////var/db/pythia.sqlite',
    'summary':      'sqlite:////var/db/pythia_summary.sqlite',
    'view':         'sqlite:///./view.sqlite'
}
UPLOAD_FOLDER = '/home/dude/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = 'super secret key'
api = Api(app)
db = SQLAlchemy(app)

from pythia.models import DashboardModel, ViewModel

#create dashboard and viewtable
ViewModel.__table__.create(db.session().get_bind(object_mapper(ViewModel())), checkfirst=True)
DashboardModel.__table__.create(db.session().get_bind(object_mapper(DashboardModel())), checkfirst=True)
from pythia.resources import *
