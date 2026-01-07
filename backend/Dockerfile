# Build stage
FROM maven:3.8.1-openjdk-11 AS builder

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src src/
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:11-jre-slim

WORKDIR /app
COPY --from=builder /build/target/payment-gateway*.jar payment-gateway.jar

EXPOSE 8080
EXPOSE 8443

ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxGCPauseMillis=200"
CMD ["java", "${JAVA_OPTS}", "-jar", "payment-gateway.jar"]
