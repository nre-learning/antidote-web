FROM openjdk:latest as build-env
MAINTAINER Matt Oswalt <matt@keepingitclassless.net> (@mierdin)
RUN apt-get update \
 && apt-get install -y maven
COPY . /antidote-web
RUN cd /antidote-web && mvn package

FROM guacamole/guacamole
RUN rm -rf /usr/local/tomcat/webapps/ROOT/

COPY logging.properties /usr/local/tomcat/conf/logging.properties
COPY --from=build-env /antidote-web/target/antidote-web.war /usr/local/tomcat/webapps/ROOT.war

RUN cd /usr/local/tomcat/webapps && rm -rf docs/ examples/ guacamole/ guacamole.war host-manager/ manager/
