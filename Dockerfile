FROM ubuntu:18.04

# Let's start with some basic stuff.
RUN apt-get update -qq && apt-get install -qqy \
    apt-utils \
    apt-transport-https \
    ca-certificates \
    curl \
    lxc \
    iptables \
    docker \
    git \
    build-essential

RUN curl -fsSL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install -y nodejs
# Install Docker from Docker Inc. repositories.
RUN curl -sSL https://get.docker.com/ | sh

WORKDIR /opt
ADD package.json /opt/
RUN npm install
ADD . /opt/

RUN npm run build

RUN echo $PATH


CMD npm start
