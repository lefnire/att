import os, pdb, jwt
from flask import request, jsonify, session, redirect
from app import app, db
from models import LostForm, User, Report

URL = {'server': 'http://ocdevel.selfip.com:5003', 'client': 'http://lost.ocdevel.com'}
# URL = {'server': 'http://localhost:5003', 'client': 'http://localhost:3003'}


"""
Main Routes
"""


def me(request):
    jwt_ = request.headers.get('Authorization')
    if not jwt_: return {}
    jwt_ = jwt_[4:]  # remote 'JWT ' at beginning
    user = jwt.decode(jwt_, app.config['SECRET_KEY'])
    return User.query.get(user['id'])


@app.route('/me', methods=['GET'])
def me_route():
    user = me(request)
    return jsonify(user.serialize4me() if user else {})


@app.route('/case/<model>', methods=['GET', 'POST'])
def case_list(model):
    Model = LostForm if model == 'lost' else Report
    if request.method == 'GET':
        res = Model.query.all()
        return jsonify(Model.serialize_list(res))

    if request.method == 'POST':
        data = request.get_json()
        res = Model(**data)
        db.session.add(res)
        db.session.commit()
        return jsonify(res.serialize())


@app.route('/case/<model>/<id>', methods=['GET', 'PUT', 'DELETE'])
def lost_item(model, id):
    Model = LostForm if model == 'lost' else Report
    res = Model.query.get(id)
    if request.method == 'GET':
        return jsonify(res.serialize())

    user = me(request)
    if res.status != 'pending' and not (user and 'admin' in user.roles):
        return 'Only admins can change forms after status != pending', 401

    if request.method == 'PUT':
        data = request.get_json()
        for k, v in data.items():
            setattr(res, k, v)
        db.session.commit()
        return jsonify(res.serialize())

    if request.method == 'DELETE':
        db.session.delete(res)
        db.session.commit()
        return jsonify({'status': 'ok'})


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
