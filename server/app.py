import os, pdb, json
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dynaconf import Dynaconf

settings = Dynaconf(
    settings_files=['config.json'],
)

app = Flask(__name__)
CORS(app)
# TODO move to environment.yml
app.config['SECRET_KEY'] = 'super-secret'
# app.debug = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    "pool_pre_ping": True,
    "pool_recycle": 300
}
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://%s:%s@%s/%s' % (
  # ARGS.dbuser, ARGS.dbpass, ARGS.dbhost, ARGS.dbname
  settings.DBUSER, settings.DBPASS, settings.DBHOST, settings.DBNAME
)

# initialize the database connection
db = SQLAlchemy(app)
