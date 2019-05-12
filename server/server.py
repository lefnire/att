import os, pdb, jwt
from flask import request, jsonify, session, redirect
from app import app, db
from models import LostForm, User

# URL = {'server': 'http://???:5000', 'client': 'http://lost.ocdevel.com'}
URL = {'server': 'http://localhost:5000', 'client': 'http://localhost:3000'}

"""
Main Routes
"""

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


@app.route('/me', methods=['GET'])
def me():
    jwt_ = request.headers.get('Authorization')
    if not jwt_: return jsonify({})
    jwt_ = jwt_[4:]  # remote 'JWT ' at beginning
    user = jwt.decode(jwt_, app.config['SECRET_KEY'])
    user = User.query.get(user['id'])
    json_ = jsonify(user.serialize4me())
    return json_


"""
Authentication Routes
We're not using same client/server domain w cookies, all requests are CORS on JWT. So Oauth
here gets tricky. See 
- https://github.com/discordapp/discord-oauth2-example original workflow
- https://github.com/mattupstate/flask-jwt better use of JWT
"""

from requests_oauthlib import OAuth2Session

OAUTH2_CLIENT_ID = os.environ['DISCORD_ID']
OAUTH2_CLIENT_SECRET = os.environ['DISCORD_SECRET']
OAUTH2_REDIRECT_URI = URL['server'] + '/discord/callback'

API_BASE_URL = os.environ.get('API_BASE_URL', 'https://discordapp.com/api')
AUTHORIZATION_BASE_URL = API_BASE_URL + '/oauth2/authorize'
TOKEN_URL = API_BASE_URL + '/oauth2/token'


if 'http://' in OAUTH2_REDIRECT_URI:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = 'true'


def token_updater(token):
    print("Why was this called?!??")
    # g.discord_tokens['oauth2_token'] = token


def make_session(token=None, state=None, scope=None):
    return OAuth2Session(
        client_id=OAUTH2_CLIENT_ID,
        token=token,
        state=state,
        scope=scope,
        redirect_uri=OAUTH2_REDIRECT_URI,
        auto_refresh_kwargs={
            'client_id': OAUTH2_CLIENT_ID,
            'client_secret': OAUTH2_CLIENT_SECRET,
        },
        auto_refresh_url=TOKEN_URL,
        token_updater=token_updater)


@app.route('/discord', methods=['GET'])
def discord_start():
    scope = request.args.get('scope', 'identify email')
    discord = make_session(scope=scope.split(' '))
    authorization_url, state = discord.authorization_url(AUTHORIZATION_BASE_URL)
    session['oauth2_state'] = state
    return redirect(authorization_url)


@app.route('/discord/callback', methods=['GET'])
def discord_callback():
    if request.values.get('error'):
        return request.values['error']
    discord = make_session(state=session.get('oauth2_state'))
    token = discord.fetch_token(
        TOKEN_URL,
        client_secret=OAUTH2_CLIENT_SECRET,
        authorization_response=request.url)
    discord_user = discord.get(API_BASE_URL + '/users/@me').json()

    user = User.query.filter_by(discord_id=discord_user['id']).first()
    if not user:
        user = User(discord_user)
        db.session.add(user)
        db.session.commit()
    # TODO encode more than these?
    # TODO more encode options? see flask-jwt
    jwt_ = jwt.encode(user.serialize4me(), app.config['SECRET_KEY'])

    # TODO anything to do with tokens? save in DB/reds? (see https://github.com/mattupstate/flask-jwt)
    # session['oauth2_token'] = token

    return redirect(URL['client'] + '?jwt=' + jwt_.decode("utf-8"))
