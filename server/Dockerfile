FROM tiangolo/uwsgi-nginx-flask:python3.7
RUN apt-get update -y
RUN pip install \
  appdirs \
  click \
  Flask \
  Flask-Script \
  Flask-SQLAlchemy \
  itsdangerous \
  MarkupSafe \
  packaging \
  psycopg2 \
  pyparsing \
  python-editor \
  six \
  SQLAlchemy \
  Werkzeug \
  requests-oauthlib \
  flask-cors \
  Flask-JWT

COPY . /app
WORKDIR /app

ENV FLASK_APP=server.py
ENTRYPOINT  flask run -h 0.0.0.0
