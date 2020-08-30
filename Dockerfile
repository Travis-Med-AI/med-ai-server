FROM docker:dind
FROM node:12.8.0

# Let's start with some basic stuff.
RUN apt-get update -qq && apt-get install -qqy \
    apt-transport-https \
    ca-certificates \
    curl \
    lxc \
    iptables
    
# Install Docker from Docker Inc. repositories.
RUN curl -sSL https://get.docker.com/ | sh
WORKDIR /opt
ADD package.json /opt/
RUN npm install
ADD . /opt/

RUN npm run build


CMD npm start
