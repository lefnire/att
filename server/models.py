import uuid, datetime, pdb
from app import db
from sqlalchemy.dialects.postgresql import ENUM, JSONB, ARRAY
from sqlalchemy.inspection import inspect
from sqlalchemy import text


def genid(): return str(uuid.uuid4())


class Serializer(object):
  def serialize(self):
    return {c: getattr(self, c) for c in inspect(self).attrs.keys()}

  @staticmethod
  def serialize_list(l):
    return [m.serialize() for m in l]


server_enum = ENUM('us', 'eu', 'aus', 'pvp', name='server_enum')
status_enum = ENUM('pending', 'wip', 'rejected', 'complete', name='status_enum')


class LostForm(db.Model, Serializer):
  __tablename__ = 'lost_forms'
  id = db.Column(db.String(60), primary_key=True, default=genid)
  username = db.Column(db.String(60))
  server = db.Column(server_enum)
  timestamp = db.Column(db.DateTime(), default=datetime.datetime.utcnow)
  items = db.Column(JSONB)
  skills = db.Column(JSONB)
  notes = db.Column(db.Text())

  userid = db.Column(db.String(60))
  status = db.Column(status_enum, default='pending')

  def __init__(self, username=None, server=None, timestamp=None, items=[], skills=[], notes='', userid=None, status='pending'):
    self.id = genid()
    self.username = username
    self.server = server
    self.timestamp = datetime.datetime.utcnow() if not timestamp else timestamp
    self.items = items
    self.skills = skills
    self.notes = notes
    self.userid = userid
    self.status = status

    if not userid:
      found = LostForm.query.filter_by(username=username).filter(userid != None).first()
      if found: self.userid = found.userid


class User(db.Model, Serializer):
    __tablename__ = 'users'
    id = db.Column(db.String(60), primary_key=True, default=genid)
    discord_id = db.Column(db.String(60))
    discord_username = db.Column(db.String(60))
    discord_avatar = db.Column(db.String(60))
    email = db.Column(db.String(60))
    roles = db.Column(ARRAY(db.String(60)))  # TODO set defaults on fields, esp. this one

    def __init__(self, discord_json, roles=[]):
        self.id = genid()
        self.discord_id = discord_json['id']
        self.discord_username = discord_json['username'] + '#' + discord_json['discriminator']
        self.discord_avatar = discord_json['avatar']
        self.email = discord_json['email']
        self.roles = roles

    def serialize4me(self):
        return {
            'id': self.id,
            'discord_id': self.discord_id,
            'discord_username': self.discord_username,
            'discord_avatar': self.discord_avatar,
            'email': self.email,
            'roles': [r for r in self.roles]
        }

    def serialize4others(self):
        return {
            'id': self.id,
            'discord_username': self.discord_username,
            'discord_avatar': self.discord_avatar,
            'roles': [r for r in self.roles]
        }


class Report(db.Model, Serializer):
    __tablename__ = 'reports'
    id = db.Column(db.String(60), primary_key=True, default=genid)
    plaintiff = db.Column(db.String(60))
    defendant = db.Column(db.String(60))
    timestamp = db.Column(db.DateTime(), default=datetime.datetime.utcnow)
    notes = db.Column(db.Text())
    server = db.Column(server_enum)
    status = db.Column(status_enum, default='pending')


db.create_all()
db.session.commit()
