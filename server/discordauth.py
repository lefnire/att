import os, pdb
from flask import Flask, g, session, redirect, request, jsonify
from requests_oauthlib import OAuth2Session

import jwt
# from flask_jwt import JWT, jwt_required, current_identity
# from werkzeug.security import safe_str_cmp

from app import app, db, URL
from models import User

OAUTH2_CLIENT_ID = os.environ['DISCORD_ID']
OAUTH2_CLIENT_SECRET = os.environ['DISCORD_SECRET']
OAUTH2_REDIRECT_URI = URL['server'] + '/discord/callback'

API_BASE_URL = os.environ.get('API_BASE_URL', 'https://discordapp.com/api')
AUTHORIZATION_BASE_URL = API_BASE_URL + '/oauth2/authorize'
TOKEN_URL = API_BASE_URL + '/oauth2/token'


if 'http://' in OAUTH2_REDIRECT_URI:
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = 'true'

# TODO move to environment.yml
app.config['SECRET_KEY'] = 'super-secret'
# See https://github.com/mattupstate/flask-jwt for more complex JWT tie-in


"""
We're not using same client/server domain w cookies, all requests are CORS on JWT. So Oauth
here gets tricky. My standard-workflow override is:
- Save tokens in globals.discord_tokens, indexed by JWT (can be accessed from any route)
- Only use session/cookies for / => /callback state flow
- Redirect
See https://github.com/discordapp/discord-oauth2-example for original
"""

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
def index():
    scope = request.args.get('scope', 'identify email')
    discord = make_session(scope=scope.split(' '))
    authorization_url, state = discord.authorization_url(AUTHORIZATION_BASE_URL)
    session['oauth2_state'] = state
    return redirect(authorization_url)


@app.route('/discord/callback', methods=['GET'])
def callback():
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
