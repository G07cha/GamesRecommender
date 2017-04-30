#!/bin/bash

# This script is used to start application in development setup with x64/x32 docker images

docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d
