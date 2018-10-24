FROM maven:3.5.2-jdk-8-alpine AS MAVEN_TOOL_CHAIN
COPY pom.xml /tmp/
COPY src /tmp/src/
ARG COMMIT_SHA
RUN sed -i "s/{{version}}/$COMMIT_SHA/g" /tmp/src/main/webapp/index.html
WORKDIR /tmp/
RUN mvn package

FROM guacamole/guacamole
RUN rm -rf /usr/local/tomcat/webapps/ROOT/
COPY --from=MAVEN_TOOL_CHAIN /tmp/target/antidote-web.war /usr/local/tomcat/webapps/ROOT.war
ADD logging.properties /usr/local/tomcat/conf/logging.properties

RUN cd /usr/local/tomcat/webapps && rm -rf docs/ examples/ guacamole/ guacamole.war host-manager/ manager/
