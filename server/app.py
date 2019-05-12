import os, pdb

from flask_cors import CORS
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

# URL = {'server': 'http://???:5000', 'client': 'http://lost.ocdevel.com'}
URL = {'server': 'http://localhost:5000', 'client': 'http://localhost:3000'}

app = Flask(__name__)
app.debug = True
CORS(app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://%s:%s@%s/%s' % (
  # ARGS.dbuser, ARGS.dbpass, ARGS.dbhost, ARGS.dbname
  os.environ['DBUSER'], os.environ['DBPASS'], os.environ['DBHOST'], os.environ['DBNAME']
)

# initialize the database connection
db = SQLAlchemy(app)

# initialize database migration management
# MIGRATE = Migrate(APP, DB)

from models import LostForm
import discordauth


@app.route('/lost', methods=['GET', 'POST'])
def lost_list():
  if request.method == 'GET':
    lost = LostForm.query.all()
    return jsonify(LostForm.serialize_list(lost))

  if request.method == 'POST':
    data = request.get_json()
    form = LostForm(**data)
    db.session.add(form)
    db.session.commit()
    return jsonify(form.serialize())


@app.route('/lost/<id>', methods=['GET', 'PUT', 'DELETE'])
def lost_item(id):
  lost = LostForm.query.get(id)
  if request.method == 'GET':
    return jsonify(lost.serialize())

  if request.method == 'PUT':
    data = request.get_json()
    for k, v in data.items():
      setattr(lost, k, v)
    db.session.commit()
    return jsonify(lost.serialize())

  if request.method == 'DELETE':
    db.session.delete(lost)
    db.session.commit()
    return jsonify({'status': 'ok'})
