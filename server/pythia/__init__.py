from flask import Flask
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import object_mapper
from os import getenv, path
from dotenv import load_dotenv,find_dotenv
from pythia.HelperFunctions.MaintainDatabaseHelper import create_database_by_type
from pythia.CustomExceptions.PythiaDatabaseError import PythiaDatabaseError

app = Flask(__name__)

dotenv_file = find_dotenv()
#loads environment configdata
load_dotenv(dotenv_file)

detail_path =  getenv("PYTHIA_PATH")  + '/pythia.sqlite'
summary_path = getenv("PYTHIA_PATH")  + '/pythia_summary.sqlite'

detail_bind = 'sqlite:///' + detail_path
summary_bind = 'sqlite:///' + summary_path

app.config['SQLALCHEMY_BINDS'] = {
    'view':         'sqlite:///../view.sqlite',
    'detail':   detail_bind,
    'summary': summary_bind
}

# set upload folder
app.config['UPLOAD_FOLDER'] = getenv('PYTHIA_UPLOAD_PATH')
app.config['MODE'] = 'Sensor'
app.secret_key = 'super secret key'

if not path.isfile(detail_path):
    try: 
        create_database_by_type(detail_path,'detail')
    except PythiaDatabaseError as error: 
        abort(500, message=error.message)

if not path.isfile(summary_path):
    try:
        create_database_by_type(summary_path,'summary') 
    except PythiaDatabaseError as error: 
        abort(500, message=error.message)

db = SQLAlchemy(app)
from pythia.Models.DashboardModels import ViewModel, DashboardModel

#create dashboard and viewtable if it doesn't exist
ViewModel.__table__.create(db.session().get_bind(object_mapper(ViewModel())), checkfirst=True)
DashboardModel.__table__.create(db.session().get_bind(object_mapper(DashboardModel())), checkfirst=True)

api = Api(app)

from pythia.Resources.DataResources import *
from pythia.Resources.ViewResources import *
from pythia.Resources.ConfigurationResources import *
