# GamesRecommender

## Overview

GamesRecommender is my bachelor diploma project with the theme "Usage of machine learning in web services".
Basically, the name describes itself, it generates games recommendations for users based on their user profiles in Steam(at least for now).

I've used a [collaborative filtering](https://en.wikipedia.org/wiki/Collaborative_filtering) algorithm because that was the most understandable for me.

## Architecture

It builds with a *kinda* microservices architecture in mind and consists of three components:

- Crawler
- Recommendations engine
- Web interface

All three components are built using NodeJS and running in Docker containers. Crawler and recommendations engine also has own databases linked as separate containers.

The process itself starts from the crawler, it asks a Steam API for a user data(games, friends) and populates a database for future use. Then the recommender engine requests data from the crawler for a particular user and similar to him and stores recommendations in a database after processing through the algorithm.
Finally, the component running web interface sends requests back and forth for application data and user's recommendations.

## Get your hands on

To run whole setup locally you will need:

- Docker(1.10.0+)
- Docker-compose(1.6+)
- Steam API key(you can get it [here](https://steamcommunity.com/dev/apikey))

Steps:

1. Clone the repo
2. Create 3 .env files in `ui` and `crawler` folders
3. Add `STEAM_API_KEY=%key%` to both .env files where `%key%` is yours Steam API key
4. Add DB variable with address to database container to recommender's and crawler's .env files(by default it's `DB=postgres://postgres:mysecretpassword@crawler-db/postgres` for crawler and `DB=postgres://postgres:mysecretpassword@recommender-db/postgres`)
5. Run `./start_dev.sh` script

The last step definitely will take some. Afterward, you will be able to access running instance at http://localhost:8000
