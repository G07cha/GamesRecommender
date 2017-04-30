FROM armhf/node:6.10

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/package.json
RUN cd /usr/src && npm install
ENV PATH /usr/src/node_modules/.bin:$PATH

# Bundle app source
COPY . /usr/src/app

CMD [ "npm", "start" ]
