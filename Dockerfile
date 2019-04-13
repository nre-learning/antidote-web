FROM maven:3.5.2-jdk-8 AS MAVEN_TOOL_CHAIN
RUN apt-get update && apt-get install -y git
COPY . /tmp/antidote-web
WORKDIR /tmp/antidote-web
# RUN sed -i "s/{{version}}/$(git rev-parse HEAD)/g" /tmp/antidote-web/src/main/webapp/index.html
# RUN sed -i "s/{{version}}/$(git rev-parse HEAD)/g" /tmp/antidote-web/src/main/webapp/advisor/index.html
# RUN sed -i "s/{{version}}/$(git rev-parse HEAD)/g" /tmp/antidote-web/src/main/webapp/advisor/courseplan.html
# RUN sed -i "s/{{version}}/$(git rev-parse HEAD)/g" /tmp/antidote-web/src/main/webapp/stats/index.html
# RUN sed -i "s/{{version}}/$(git rev-parse HEAD)/g" /tmp/antidote-web/src/main/webapp/labs/index.html
RUN mvn package

FROM guacamole/guacamole
RUN rm -rf /usr/local/tomcat/webapps/ROOT/
COPY --from=MAVEN_TOOL_CHAIN /tmp/antidote-web/target/antidote-web.war /usr/local/tomcat/webapps/ROOT.war
ADD logging.properties /usr/local/tomcat/conf/logging.properties

RUN cd /usr/local/tomcat/webapps && rm -rf docs/ examples/ guacamole/ guacamole.war host-manager/ manager/
