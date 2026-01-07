FROM openjdk:17-jdk-slim
WORKDIR /app
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn dependency:resolve
COPY src src
RUN --mount=type=cache,target=/root/.m2 mvn clean package -DskipTests
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=0 /app/target/payment-gateway-1.0.0.jar .
EXPOSE 8000
CMD ["java", "-jar", "payment-gateway-1.0.0.jar"]
