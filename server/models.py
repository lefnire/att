import uuid, datetime, pdb
from app import DB
from sqlalchemy.dialects.postgresql import ENUM, JSONB
from sqlalchemy.inspection import inspect
from sqlalchemy import text


class Serializer(object):
  def serialize(self):
    return {c: getattr(self, c) for c in inspect(self).attrs.keys()}

  @staticmethod
  def serialize_list(l):
    return [m.serialize() for m in l]


class LostForm(DB.Model, Serializer):
  __tablename__ = 'lost_forms'
  id = DB.Column(DB.String(60), primary_key=True)
  username = DB.Column(DB.String(60))
  server = DB.Column(ENUM('us', 'eu', 'aus', 'pvp', name='server_enum'))
  timestamp = DB.Column(DB.DateTime())
  items = DB.Column(JSONB)
  skills = DB.Column(JSONB)
  notes = DB.Column(DB.Text())

  userid = DB.Column(DB.String(60))
  status = DB.Column(ENUM('pending', 'wip', 'rejected', 'complete', name='status_enum'))

  def __init__(self, username=None, server=None, timestamp=None, items=[], skills=[], notes='', userid=None, status='pending'):
    self.id = str(uuid.uuid4())
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

DB.create_all()
DB.session.commit()
