# Tymelyne Docker Setup

This directory contains Docker configuration files to run both the Tymelyne frontend and backend in containers.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Directory Structure

```
tymelyne/
├── docker/
│   ├── Dockerfile.frontend - Docker configuration for React Native (Expo) frontend
│   ├── Dockerfile.backend - Docker configuration for Django backend
│   └── README.md - This file
├── docker-compose.yml - Docker Compose configuration
├── .dockerignore - Files to exclude from Docker builds
├── frontend/ - React Native app
└── backend/ - Django app
```

## Quick Start

1. From the project root directory, run:

```bash
docker-compose up
```

2. Wait for both services to start up:
   - Backend will be available at: http://localhost:8000
   - Frontend will be available at: http://localhost:19000

3. Access the Expo interface through your browser at http://localhost:19000

## Environment Variables

The following environment variables can be modified in the `docker-compose.yml` file:

### Backend
- `DEBUG`: Set to 1 for development mode
- `CORS_ORIGIN_WHITELIST`: Allowed CORS origins

### Frontend
- `REACT_NATIVE_PACKAGER_HOSTNAME`: Host for the React Native packager
- `EXPO_DEVTOOLS_LISTEN_ADDRESS`: Address for Expo DevTools to listen on
- `REACT_APP_API_URL`: Set to 'docker' to use the backend container

## Development Workflow

Any changes made to the frontend or backend code will be reflected in the running containers due to the volume mounts specified in the docker-compose.yml file.

## Troubleshooting

1. **Port conflicts**: If you see errors about ports being in use, make sure nothing else is using ports 8000, 19000, 19001, 19002, or 8081.

2. **Connection issues**: If the frontend can't connect to the backend, check that the `REACT_APP_API_URL` is set to 'docker' in the docker-compose.yml file.

3. **Container startup issues**: Use `docker-compose logs` to view container logs for debugging.

## Cleaning Up

To stop and remove the containers, networks, and volumes:

```bash
docker-compose down
```

To remove everything including built images:

```bash
docker-compose down --rmi all -v
``` 