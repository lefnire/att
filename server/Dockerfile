FROM tiangolo/uwsgi-nginx-flask:python3.6

COPY . /server
WORKDIR /server

RUN apt-get update
RUN pip install -r ./requirements.txt --no-cache-dir

ENTRYPOINT ./run.sh
