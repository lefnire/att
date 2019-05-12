import os, pdb

from flask_cors import CORS
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

APP = Flask(__name__)
CORS(APP)
APP.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

APP.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://%s:%s@%s/%s' % (
  # ARGS.dbuser, ARGS.dbpass, ARGS.dbhost, ARGS.dbname
  os.environ['DBUSER'], os.environ['DBPASS'], os.environ['DBHOST'], os.environ['DBNAME']
)

# initialize the database connection
DB = SQLAlchemy(APP)

# initialize database migration management
# MIGRATE = Migrate(APP, DB)

from models import *


@APP.route('/lost', methods=['GET', 'POST'])
def lost_list():
  if request.method == 'GET':
    lost = LostForm.query.all()
    return jsonify(LostForm.serialize_list(lost))

  if request.method == 'POST':
    data = request.get_json()
    form = LostForm(**data)
    DB.session.add(form)
    DB.session.commit()
    return jsonify(form.serialize())


@APP.route('/lost/<id>', methods=['GET', 'PUT', 'DELETE'])
def lost_item(id):
  lost = LostForm.query.get(id)
  if request.method == 'GET':
    return jsonify(lost.serialize())

  if request.method == 'PUT':
    data = request.get_json()
    for k, v in data.items():
      setattr(lost, k, v)
    DB.session.commit()
    return jsonify(lost.serialize())

  if request.method == 'DELETE':
    DB.session.delete(lost)
    DB.session.commit()
    return jsonify({'status': 'ok'})
