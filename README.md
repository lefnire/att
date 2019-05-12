- Flask/SQLAlchemy server on Docker, see [Azure-Samples/docker-flask-postgres](https://github.com/Azure-Samples/docker-flask-postgres)
- Client on Docker, see [create-react-app](https://github.com/facebook/create-react-app)

```
docker up -d
docker ps
docker exec -it <server container id> /bin/bash
- ./run.sh
docker exec -it <client container id> /bin/bash
- yarn start
```
