import os, pdb, json
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

with open('config.json') as f:
    config_json = json.load(f)
for k, v in config_json.items():
    if not os.environ.get(k):
        os.environ[k] = v

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
  os.environ['DBUSER'], os.environ['DBPASS'], os.environ['DBHOST'], os.environ['DBNAME']
)

# initialize the database connection
db = SQLAlchemy(app)
